/**
 * check-caldav — dit si les identifiants de reservation marchent, un par un.
 *
 * `npm run check:caldav`
 *
 * POURQUOI CE FICHIER EXISTE. Brancher le service demande trois secrets creees
 * dans trois interfaces differentes, et quand ca ne marche pas la page se
 * contente d'afficher « l'agenda ne repond pas » : impossible de savoir lequel
 * des trois est en cause, ni si c'est le mot de passe, le nom d'utilisateur ou
 * le serveur. Ce script les essaie separement et nomme le fautif.
 *
 * ⚠ IL N'AFFICHE JAMAIS UN SECRET, meme tronque. Il dit « pose » ou « absent »,
 * et ce que le serveur en a pense. Sa sortie peut donc etre recopiee telle
 * quelle dans un message sans rien divulguer.
 *
 * Il lit `.env.local` (ignore par git). Les memes valeurs vivent en production
 * dans les variables d'environnement Vercel.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Lecture de `.env.local` a la main : le script tourne hors de Vite, donc sans
   son chargeur d'environnement. Format minimal, CLE=valeur, # en commentaire. */
function loadEnvLocal(): void {
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvLocal();

const OK = "  ✓";
const KO = "  ✗";
const NA = "  ·";
let fatal = 0;

function head(title: string) {
  console.log(`\n${title}\n${"─".repeat(title.length)}`);
}

async function main() {
  console.log("Diagnostic du service de reservation Ora");
  console.log(fs.existsSync(path.join(root, ".env.local"))
    ? "Source : .env.local"
    : "Source : variables d'environnement du shell (.env.local absent)");

  /* ── 1. L'agenda ─────────────────────────────────────────────────────── */
  head("1. Agenda CalDAV (obligatoire)");
  const url = process.env.CALDAV_URL || "https://sync.infomaniak.com";
  const user = process.env.CALDAV_USERNAME;
  const pass = process.env.CALDAV_PASSWORD;

  console.log(`${NA} CALDAV_URL       ${url}`);
  console.log(`${user ? OK : KO} CALDAV_USERNAME  ${user ? user : "ABSENT"}`);
  console.log(`${pass ? OK : KO} CALDAV_PASSWORD  ${pass ? `pose (${pass.length} caracteres)` : "ABSENT"}`);

  if (!user || !pass) {
    console.log(`${KO} Sans ces deux valeurs le site tourne en MODE DEMONSTRATION :`);
    console.log("     il fabrique des creneaux, l'annonce a l'ecran, et refuse de reserver.");
    fatal++;
  } else {
    const { calendarUrl, busyWindows } = await import("../api/_lib/caldav.js");
    const cfg = { url, username: user, password: pass, calendarPath: process.env.CALDAV_CALENDAR_PATH };
    try {
      const found = await calendarUrl(cfg);
      console.log(`${OK} Agenda decouvert  ${found}`);
      const from = new Date();
      const to = new Date(Date.now() + 7 * 86400000);
      const busy = await busyWindows(cfg, from, to);
      console.log(`${OK} Lecture reussie   ${busy.length} plage(s) occupee(s) sur 7 jours`);
      if (busy.length === 0) {
        console.log("     ⚠ Zero occupation. Si votre agenda a des rendez-vous cette semaine,");
        console.log("       c'est probablement le mauvais agenda : posez CALDAV_CALENDAR_PATH.");
      } else {
        for (const b of busy.slice(0, 3)) {
          console.log(`     · ${b.start.toISOString().slice(0, 16).replace("T", " ")} -> ${b.end.toISOString().slice(11, 16)} UTC`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`${KO} Echec : ${message}`);
      if (/401|refus/i.test(message)) {
        console.log("     Le serveur a REFUSE les identifiants. Deux causes, dans cet ordre :");
        console.log("     1. la 2FA est active et il faut un MOT DE PASSE D'APPLICATION,");
        console.log("        pas le mot de passe du compte (config.infomaniak.com) ;");
        console.log("     2. le nom d'utilisateur n'est pas le bon. Essayez l'adresse");
        console.log("        e-mail complete, puis l'identifiant de compte Infomaniak.");
      }
      fatal++;
    }
  }

  /* ── 2. kMeet ────────────────────────────────────────────────────────── */
  head("2. Visio kMeet (facultatif)");
  const token = process.env.INFOMANIAK_API_TOKEN;
  const calId = process.env.INFOMANIAK_CALENDAR_ID;
  console.log(`${token ? OK : NA} INFOMANIAK_API_TOKEN     ${token ? `pose (${token.length} caracteres)` : "absent"}`);
  console.log(`${calId ? OK : NA} INFOMANIAK_CALENDAR_ID   ${calId || "absent"}`);

  if (!token) {
    console.log(`${NA} Sans jeton, chaque rendez-vous recoit une salle kMeet ouverte a l'URL.`);
    console.log("     Le rendez-vous fonctionne, la salle n'est simplement pas creee dans kSuite.");
  } else {
    try {
      const res = await fetch("https://calendar.infomaniak.com/api/pim/calendar", {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(12_000),
      });
      const text = await res.text();
      if (!res.ok) {
        console.log(`${KO} Jeton refuse : HTTP ${res.status}`);
        console.log("     Verifiez la portee du jeton : il lui faut l'acces « calendar ».");
      } else {
        const json = JSON.parse(text);
        const list: Array<Record<string, unknown>> = json?.data ?? [];
        console.log(`${OK} Jeton valide, ${list.length} agenda(s) visible(s) :`);
        for (const c of list) {
          const id = c.id ?? c.calendar_id;
          const mark = String(id) === String(calId) ? " <- INFOMANIAK_CALENDAR_ID" : "";
          console.log(`     · id ${id}  ${c.name ?? c.title ?? ""}${mark}`);
        }
        if (!calId) {
          console.log("     ⚠ Reportez l'id voulu ci-dessus dans INFOMANIAK_CALENDAR_ID.");
        } else if (!list.some((c) => String(c.id ?? c.calendar_id) === String(calId))) {
          console.log(`     ⚠ L'id ${calId} n'est PAS dans la liste ci-dessus.`);
        }
      }
    } catch (err) {
      console.log(`${KO} Appel impossible : ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /* ── 3. Courriels ────────────────────────────────────────────────────── */
  head("3. Courriels Brevo (facultatif)");
  const brevo = process.env.BREVO_API_KEY;
  console.log(`${brevo ? OK : NA} BREVO_API_KEY   ${brevo ? `pose (${brevo.length} caracteres)` : "absent"}`);
  if (!brevo) {
    console.log(`${NA} Sans cle, le rendez-vous est bien enregistre mais PERSONNE n'est prevenu.`);
    console.log("     L'ecran de confirmation le dit alors au visiteur, et affiche le lien.");
  } else {
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": brevo, Accept: "application/json" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) {
        console.log(`${KO} Cle refusee : HTTP ${res.status}`);
      } else {
        const json = (await res.json()) as { email?: string; companyName?: string };
        console.log(`${OK} Cle valide  compte ${json.email ?? json.companyName ?? "(anonyme)"}`);
        const from = process.env.BREVO_FROM_EMAIL || process.env.ORGANISER_EMAIL || "raphael.gaugain@ora-solution.com";
        console.log(`${NA} Expediteur  ${from}`);
        console.log("     ⚠ Ce domaine doit etre authentifie dans Brevo (Senders, Domains & IPs),");
        console.log("       sinon les confirmations partiront en indesirables.");
      }
    } catch (err) {
      console.log(`${KO} Appel impossible : ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /* ── Verdict ─────────────────────────────────────────────────────────── */
  head("Verdict");
  if (fatal) {
    console.log("✗ L'agenda n'est PAS joignable : le site restera en mode demonstration.");
    console.log("  Reprenez l'etape 1 ci-dessus, c'est la seule obligatoire.");
    process.exit(1);
  }
  console.log("✓ L'agenda repond. La reservation en ligne peut etre activee.");
  console.log("  Reportez les memes valeurs dans Vercel > Settings > Environment Variables,");
  console.log("  puis redeployez : un changement de variable ne prend effet qu'au deploiement suivant.");
}

main().catch((err) => {
  console.error("\n✗ Erreur inattendue :", err);
  process.exit(1);
});
