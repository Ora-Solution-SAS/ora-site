/**
 * caldav.ts — le dialogue avec l'agenda Infomaniak (RFC 4791).
 *
 * POURQUOI CALDAV ET PAS L'API REST D'INFOMANIAK. La lecture de disponibilité
 * est la partie qu'on ne peut pas se permettre de voir casser : c'est elle qui
 * empêche de proposer un créneau déjà pris. CalDAV est une norme figée depuis
 * 2007 et Infomaniak la documente comme point d'entrée officiel
 * (https://sync.infomaniak.com). L'API REST de leur agenda existe mais n'est
 * pas publiquement spécifiée : on s'en sert pour kMeet, où un changement de
 * forme ne coûte qu'un lien de visio, pas une double réservation.
 *
 * TROIS ÉTAPES DE DÉCOUVERTE, et aucune URL de collection écrite en dur :
 *   1. PROPFIND /.well-known/caldav  -> `current-user-principal`
 *   2. PROPFIND <principal>          -> `calendar-home-set`
 *   3. PROPFIND <home> Depth:1       -> les collections, dont on garde celles
 *      qui acceptent des VEVENT.
 * Un chemin figé se serait cassé le jour où Infomaniak renumérote ses
 * collections ; la découverte, elle, suit.
 *
 * ⚠ ON LIT LES VEVENT, PAS LE `free-busy-query`. Le rapport free-busy est
 * optionnel dans la norme et tous les serveurs ne le rendent pas ; le
 * `calendar-query` avec filtre temporel, lui, est obligatoire. On calcule donc
 * les plages occupées nous-mêmes à partir des DTSTART/DTEND retournés.
 */

import { icalStamp } from "./time.js";
import { expandEvent, type BusyWindow } from "./ical.js";

export type CalDavConfig = {
  url: string;
  username: string;
  password: string;
  /** Chemin de collection forcé, quand la découverte doit être court-circuitée. */
  calendarPath?: string;
};

const UA = "Ora-Booking/1.0";

function authHeader(c: CalDavConfig): string {
  return "Basic " + Buffer.from(`${c.username}:${c.password}`).toString("base64");
}

function absolute(base: string, href: string): string {
  return new URL(href, base).toString();
}

async function dav(
  c: CalDavConfig,
  url: string,
  method: "PROPFIND" | "REPORT" | "PUT" | "DELETE",
  body: string | null,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; text: string; headers: Headers }> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader(c),
      "User-Agent": UA,
      ...(body ? { "Content-Type": extraHeaders["Content-Type"] ?? "application/xml; charset=utf-8" } : {}),
      ...extraHeaders,
    },
    body: body ?? undefined,
    // Un agenda qui ne répond pas ne doit pas bloquer la fonction jusqu'au
    // délai de garde de Vercel : on coupe court et le front dira « indisponible ».
    signal: AbortSignal.timeout(12_000),
  });
  return { status: res.status, text: await res.text(), headers: res.headers };
}

/** Les `<d:href>` d'une réponse multistatus, dans l'ordre. */
function hrefs(xml: string): string[] {
  return [...xml.matchAll(/<[^>]*href[^>]*>([^<]+)<\/[^>]*href>/gi)].map((m) => decodeXml(m[1].trim()));
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Le premier href imbriqué dans l'élément demandé (principal, home-set...). */
function firstHrefInside(xml: string, localName: string): string | null {
  const block = new RegExp(`<[^>]*${localName}[^>]*>([\\s\\S]*?)<\\/[^>]*${localName}>`, "i").exec(xml);
  if (!block) return null;
  const h = hrefs(block[1]);
  return h.length ? h[0] : null;
}

export class CalDavError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "CalDavError";
    this.status = status;
  }
}

/** Découvre la collection d'agenda à utiliser, et la met en cache par processus. */
let discovered: { key: string; url: string } | null = null;

export async function calendarUrl(c: CalDavConfig): Promise<string> {
  if (c.calendarPath) return absolute(c.url, c.calendarPath);
  const key = `${c.url}|${c.username}`;
  if (discovered && discovered.key === key) return discovered.url;

  const principalBody =
    '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>';

  let start = absolute(c.url, "/.well-known/caldav");
  let r = await dav(c, start, "PROPFIND", principalBody, { Depth: "0" });
  if (r.status === 401 || r.status === 403) {
    throw new CalDavError("Identifiants CalDAV refusés par le serveur.", r.status);
  }
  if (r.status >= 400) {
    // Certains serveurs ne servent pas /.well-known : on retente à la racine.
    start = absolute(c.url, "/");
    r = await dav(c, start, "PROPFIND", principalBody, { Depth: "0" });
    if (r.status >= 400) throw new CalDavError(`PROPFIND principal: HTTP ${r.status}`, r.status);
  }

  const principal = firstHrefInside(r.text, "current-user-principal");
  if (!principal) throw new CalDavError("Le serveur n'a pas renvoyé de current-user-principal.");

  const homeBody =
    '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>';
  const rh = await dav(c, absolute(start, principal), "PROPFIND", homeBody, { Depth: "0" });
  if (rh.status >= 400) throw new CalDavError(`PROPFIND home: HTTP ${rh.status}`, rh.status);

  const home = firstHrefInside(rh.text, "calendar-home-set");
  if (!home) throw new CalDavError("Le serveur n'a pas renvoyé de calendar-home-set.");
  const homeUrl = absolute(start, home);

  const listBody =
    '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:resourcetype/><d:displayname/><c:supported-calendar-component-set/></d:prop></d:propfind>';
  const rl = await dav(c, homeUrl, "PROPFIND", listBody, { Depth: "1" });
  if (rl.status >= 400) throw new CalDavError(`PROPFIND collections: HTTP ${rl.status}`, rl.status);

  // On découpe la réponse en <response> pour rattacher chaque href à SES
  // propriétés : lues à plat, le premier href de la page (la collection mère)
  // serait apparié au premier « calendar » venu.
  const responses = [...rl.text.matchAll(/<[^>]*response[^>]*>([\s\S]*?)<\/[^>]*response>/gi)].map((m) => m[1]);
  let chosen: string | null = null;
  for (const block of responses) {
    const isCalendar = /<[^>]*:?calendar\b[^>]*\/>|<[^>]*:?calendar\b[^>]*>/i.test(block);
    const supportsEvents =
      !/supported-calendar-component-set/i.test(block) || /name="VEVENT"/i.test(block);
    if (!isCalendar || !supportsEvents) continue;
    const h = hrefs(block)[0];
    if (!h) continue;
    // On écarte les collections planning/inbox/outbox, qui sont des agendas au
    // sens de la norme mais ne portent pas de rendez-vous.
    if (/(inbox|outbox|notification)/i.test(h)) continue;
    chosen = absolute(homeUrl, h);
    break;
  }
  if (!chosen) throw new CalDavError("Aucune collection d'agenda acceptant des VEVENT n'a été trouvée.");

  discovered = { key, url: chosen };
  return chosen;
}

/**
 * Les plages occupées entre deux instants.
 *
 * Le filtre `time-range` du serveur fait le gros du tri ; la répétition
 * (RRULE) est développée côté service, parce que tous les serveurs ne
 * développent pas les occurrences dans un `calendar-query`.
 */
export async function busyWindows(c: CalDavConfig, from: Date, to: Date): Promise<BusyWindow[]> {
  const url = await calendarUrl(c);
  const body =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' +
    "<d:prop><d:getetag/><c:calendar-data/></d:prop>" +
    '<c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT">' +
    `<c:time-range start="${icalStamp(from)}" end="${icalStamp(to)}"/>` +
    "</c:comp-filter></c:comp-filter></c:filter>" +
    "</c:calendar-query>";

  const r = await dav(c, url, "REPORT", body, { Depth: "1" });
  if (r.status >= 400) throw new CalDavError(`REPORT calendar-query: HTTP ${r.status}`, r.status);

  const blocks = [...r.text.matchAll(/<[^>]*calendar-data[^>]*>([\s\S]*?)<\/[^>]*calendar-data>/gi)].map((m) =>
    decodeXml(m[1]),
  );

  const busy: BusyWindow[] = [];
  for (const ics of blocks) busy.push(...expandEvent(ics, from, to));
  return busy;
}

/** Dépose un VEVENT dans l'agenda. Renvoie l'URL de la ressource créée. */
export async function putEvent(c: CalDavConfig, uid: string, ics: string): Promise<string> {
  const base = await calendarUrl(c);
  const url = base.replace(/\/?$/, "/") + encodeURIComponent(uid) + ".ics";
  const r = await dav(c, url, "PUT", ics, {
    "Content-Type": "text/calendar; charset=utf-8",
    // « Ne remplace rien » : si la ressource existe déjà, le serveur refuse.
    // C'est notre garde-fou contre un double envoi du formulaire.
    "If-None-Match": "*",
  });
  if (r.status === 412) throw new CalDavError("Cette réservation existe déjà.", 412);
  if (r.status >= 400) throw new CalDavError(`PUT event: HTTP ${r.status}`, r.status);
  return url;
}
