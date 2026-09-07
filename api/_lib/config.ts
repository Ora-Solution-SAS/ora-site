/**
 * config.ts — les règles de réservation et les secrets, en un seul endroit.
 *
 * ⚠ AUCUN SECRET N'EST ÉCRIT DANS CE FICHIER, et il ne faut jamais en ajouter.
 * Tout vient de l'environnement Vercel (Project Settings > Environment
 * Variables). Les valeurs par défaut ci-dessous ne concernent que les RÈGLES
 * (horaires, durée, délais), qui n'ont rien de confidentiel.
 *
 * MODE DÉMONSTRATION : tant que `CALDAV_USERNAME` / `CALDAV_PASSWORD` sont
 * absents, le service répond avec une disponibilité FABRIQUÉE et n'écrit nulle
 * part. C'est ce qui permet de développer et de faire la recette sans toucher
 * au vrai agenda — mais c'est aussi exactement le défaut qui a fait retirer le
 * premier sélecteur de créneaux (voir SlotPicker.tsx), donc :
 *   · le mode est ANNONCÉ dans la réponse (`mock: true`), le front l'affiche ;
 *   · il ne s'active jamais tout seul en production : sans identifiants,
 *     `/api/book` refuse d'enregistrer quoi que ce soit et le dit.
 */

export type BookingRules = {
  /** Fuseau de l'agenda, celui dans lequel les horaires ci-dessous sont lus. */
  organiserTimeZone: string;
  /** Durée du rendez-vous, en minutes. */
  durationMinutes: number;
  /** Pas de la grille de créneaux, en minutes. */
  stepMinutes: number;
  /** Battement laissé libre APRÈS chaque rendez-vous, en minutes. */
  bufferMinutes: number;
  /** Délai minimal entre maintenant et le début d'un créneau, en heures. */
  minNoticeHours: number;
  /** Horizon de réservation, en jours. */
  horizonDays: number;
  /** Plages ouvrables par jour de semaine (0 = dimanche), en heures murales. */
  openingHours: Record<number, Array<[string, string]>>;
};

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * « 1-5:09:00-12:30,14:00-18:00 » se lit : du lundi au vendredi, deux plages.
 * Plusieurs groupes se séparent par « ; ». Sans variable, la valeur par
 * défaut ci-dessous s'applique.
 */
function parseOpeningHours(raw: string | undefined): BookingRules["openingHours"] {
  const source = raw && raw.trim() ? raw : "1-5:09:00-12:30,14:00-18:00";
  const out: BookingRules["openingHours"] = {};
  for (const group of source.split(";")) {
    // Le premier « : » sépare les jours des plages ; les suivants
    // appartiennent aux heures (« 09:00 »), d'où la coupe manuelle.
    const cut = group.indexOf(":");
    if (cut < 0) continue;
    const daysPart = group.slice(0, cut).trim();
    const rangesPart = group.slice(cut + 1).trim();
    if (!daysPart || !rangesPart) continue;
    const days: number[] = [];
    for (const chunk of daysPart.split(",")) {
      const span = chunk.split("-").map((d) => Number(d.trim()));
      if (span.length === 2 && Number.isInteger(span[0]) && Number.isInteger(span[1])) {
        for (let d = span[0]; d <= span[1]; d++) days.push(d % 7);
      } else if (span.length === 1 && Number.isInteger(span[0])) {
        days.push(span[0] % 7);
      }
    }
    const ranges: Array<[string, string]> = [];
    for (const r of rangesPart.split(",")) {
      const m = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(r);
      if (m) ranges.push([m[1], m[2]]);
    }
    if (!ranges.length) continue;
    for (const d of days) out[d] = (out[d] ?? []).concat(ranges);
  }
  return out;
}

export function rules(): BookingRules {
  return {
    organiserTimeZone: process.env.BOOKING_TIMEZONE || "Europe/Paris",
    durationMinutes: num("BOOKING_DURATION_MIN", 30),
    stepMinutes: num("BOOKING_STEP_MIN", 30),
    bufferMinutes: num("BOOKING_BUFFER_MIN", 15),
    minNoticeHours: num("BOOKING_MIN_NOTICE_H", 12),
    horizonDays: num("BOOKING_HORIZON_DAYS", 30),
    openingHours: parseOpeningHours(process.env.BOOKING_OPENING_HOURS),
  };
}

export type Secrets = {
  caldav: { url: string; username: string; password: string; calendarPath?: string } | null;
  infomaniak: { token: string; calendarId: number } | null;
  brevo: { apiKey: string; fromEmail: string; fromName: string } | null;
  organiserEmail: string;
  organiserName: string;
  /** Salle de repli quand l'API kMeet n'est pas branchée. */
  fallbackMeetingUrl: string | null;
};

export function secrets(): Secrets {
  const cu = process.env.CALDAV_USERNAME;
  const cp = process.env.CALDAV_PASSWORD;
  const ik = process.env.INFOMANIAK_API_TOKEN;
  const ic = Number(process.env.INFOMANIAK_CALENDAR_ID);
  const bk = process.env.BREVO_API_KEY;
  const organiserEmail = process.env.ORGANISER_EMAIL || "raphael.gaugain@ora-solution.com";

  return {
    caldav:
      cu && cp
        ? {
            url: process.env.CALDAV_URL || "https://sync.infomaniak.com",
            username: cu,
            password: cp,
            calendarPath: process.env.CALDAV_CALENDAR_PATH || undefined,
          }
        : null,
    infomaniak: ik && Number.isInteger(ic) && ic > 0 ? { token: ik, calendarId: ic } : null,
    brevo: bk
      ? {
          apiKey: bk,
          fromEmail: process.env.BREVO_FROM_EMAIL || organiserEmail,
          fromName: process.env.BREVO_FROM_NAME || "Ora Solution",
        }
      : null,
    organiserEmail,
    organiserName: process.env.ORGANISER_NAME || "Raphael Gaugain",
    fallbackMeetingUrl: process.env.FALLBACK_MEETING_URL || null,
  };
}

/** Vrai quand l'agenda réel n'est pas joignable : la disponibilité est alors
 *  fabriquée et rien n'est écrit. */
export function isMock(): boolean {
  return secrets().caldav === null;
}
