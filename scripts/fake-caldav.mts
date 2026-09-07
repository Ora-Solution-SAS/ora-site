/**
 * fake-caldav — un serveur CalDAV minimal, pour éprouver le client sans toucher
 * au vrai agenda.
 *
 * `npx tsx scripts/fake-caldav.mts` puis, dans un autre terminal :
 *   CALDAV_URL=http://127.0.0.1:8910 CALDAV_USERNAME=u CALDAV_PASSWORD=p npm run dev
 *
 * POURQUOI CE FICHIER EXISTE. Le client CalDAV est la seule partie du service
 * qu'aucune capture d'écran ne peut valider : il faut un serveur en face. Sans
 * ce banc, la première exécution du vrai dialogue aurait lieu en production,
 * contre l'agenda du client, sur le chemin de conversion du site.
 *
 * Il implémente EXACTEMENT ce que notre client demande, et rien de plus :
 *   PROPFIND /.well-known/caldav  -> current-user-principal
 *   PROPFIND /principals/u/       -> calendar-home-set
 *   PROPFIND /cal/u/  Depth:1     -> deux collections, dont une « inbox » que
 *                                    la découverte doit ÉCARTER
 *   REPORT   /cal/u/perso/        -> les VEVENT du magasin, filtrés
 *   PUT      /cal/u/perso/<uid>.ics -> dépôt, avec If-None-Match
 *
 * Ce n'est pas une implémentation de la RFC : c'est un partenaire de dialogue
 * conforme sur les cinq échanges qui nous concernent.
 */

import http from "node:http";

const PORT = Number(process.env.FAKE_CALDAV_PORT || 8910);

/** Le magasin, en mémoire. Une entrée par ressource déposée. */
const store = new Map<string, string>();

/** Un rendez-vous déjà pris, pour que la soustraction ait quelque chose à faire.
 *  Demain 10 h 00 UTC, une heure. */
function seed() {
  const d = new Date(Date.now() + 86400000);
  const stamp = (h: number) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(h).padStart(2, "0")}0000Z`;
  store.set(
    "seed.ics",
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:seed",
      `DTSTART:${stamp(10)}`,
      `DTEND:${stamp(11)}`,
      "SUMMARY:Deja pris",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"),
  );
}
seed();

function multistatus(body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>\n<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">${body}</d:multistatus>`;
}

function response(href: string, propXml: string): string {
  return `<d:response><d:href>${href}</d:href><d:propstat><d:prop>${propXml}</d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>`;
}

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";
  const chunks: Buffer[] = [];
  req.on("data", (c: Buffer) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks).toString("utf8");
    const send = (status: number, payload: string, type = "application/xml; charset=utf-8") => {
      res.writeHead(status, { "Content-Type": type, DAV: "1, 3, calendar-access" });
      res.end(payload);
      console.log(`${method} ${url} -> ${status}`);
    };

    /* L'authentification est VÉRIFIÉE, pas seulement exigée. Un banc qui
       accepte n'importe quel en-tête ne couvre pas le chemin 401, qui est
       pourtant celui qu'on rencontre en premier en branchant le vrai serveur
       (mot de passe de compte au lieu d'un mot de passe d'application).
       Identifiants attendus : u / p, ou ceux de FAKE_CALDAV_USER / _PASS. */
    const expected =
      "Basic " +
      Buffer.from(`${process.env.FAKE_CALDAV_USER || "u"}:${process.env.FAKE_CALDAV_PASS || "p"}`).toString("base64");
    if (req.headers.authorization !== expected) {
      res.writeHead(401, { "WWW-Authenticate": 'Basic realm="fake"' });
      res.end();
      console.log(`${method} ${url} -> 401 (identifiants ${req.headers.authorization ? "incorrects" : "absents"})`);
      return;
    }

    if (method === "PROPFIND" && url.startsWith("/.well-known/caldav")) {
      return send(207, multistatus(response("/.well-known/caldav", "<d:current-user-principal><d:href>/principals/u/</d:href></d:current-user-principal>")));
    }

    if (method === "PROPFIND" && url.startsWith("/principals/")) {
      return send(207, multistatus(response("/principals/u/", "<c:calendar-home-set><d:href>/cal/u/</d:href></c:calendar-home-set>")));
    }

    if (method === "PROPFIND" && url === "/cal/u/") {
      return send(
        207,
        multistatus(
          // La collection mère : PAS un agenda. Si le client l'apparie avec les
          // propriétés d'un voisin, il choisira la mauvaise URL.
          response("/cal/u/", "<d:resourcetype><d:collection/></d:resourcetype><d:displayname>Home</d:displayname>") +
            // Une boîte de réception : c'est un agenda au sens de la norme, il
            // doit malgré tout être écarté.
            response(
              "/cal/u/inbox/",
              '<d:resourcetype><d:collection/><c:calendar/></d:resourcetype><d:displayname>Inbox</d:displayname><c:supported-calendar-component-set><c:comp name="VEVENT"/></c:supported-calendar-component-set>',
            ) +
            // Un agenda de contacts : pas de VEVENT, à écarter aussi.
            response(
              "/cal/u/taches/",
              '<d:resourcetype><d:collection/><c:calendar/></d:resourcetype><d:displayname>Taches</d:displayname><c:supported-calendar-component-set><c:comp name="VTODO"/></c:supported-calendar-component-set>',
            ) +
            // Le bon.
            response(
              "/cal/u/perso/",
              '<d:resourcetype><d:collection/><c:calendar/></d:resourcetype><d:displayname>Perso</d:displayname><c:supported-calendar-component-set><c:comp name="VEVENT"/></c:supported-calendar-component-set>',
            ),
        ),
      );
    }

    if (method === "REPORT" && url.startsWith("/cal/u/perso")) {
      const range = /<[^>]*time-range[^>]*start="([^"]+)"[^>]*end="([^"]+)"/.exec(body);
      console.log(`   time-range ${range?.[1]} -> ${range?.[2]}`);
      let out = "";
      for (const [name, ics] of store) {
        out += response(
          `/cal/u/perso/${name}`,
          `<d:getetag>"${name}"</d:getetag><c:calendar-data>${ics.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</c:calendar-data>`,
        );
      }
      return send(207, multistatus(out));
    }

    if (method === "PUT" && url.startsWith("/cal/u/perso/")) {
      const name = decodeURIComponent(url.slice("/cal/u/perso/".length));
      if (req.headers["if-none-match"] === "*" && store.has(name)) {
        return send(412, "", "text/plain");
      }
      store.set(name, body);
      console.log(`   depose ${name} (${body.length} octets)`);
      console.log(body.split("\r\n").filter((l) => /^(SUMMARY|DTSTART|DTEND|ATTENDEE|LOCATION)/.test(l)).map((l) => "   | " + l).join("\n"));
      return send(201, "", "text/plain");
    }

    send(404, "", "text/plain");
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`fake-caldav sur http://127.0.0.1:${PORT}`);
  console.log(`Agenda : /cal/u/perso/ (un rendez-vous demain 10:00-11:00 UTC)`);
});
