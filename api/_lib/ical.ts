/**
 * ical.ts — lire et écrire de l'iCalendar (RFC 5545), au strict nécessaire.
 *
 * On ne cherche PAS à implémenter la norme : on lit ce qui sert à savoir quand
 * l'agenda est pris, et on écrit une invitation que Mail, Outlook et Gmail
 * savent ouvrir. Tout le reste (VTODO, VJOURNAL, pièces jointes, fuseaux
 * personnalisés) est ignoré à dessein.
 */

import { pad } from "./time.js";

export type BusyWindow = { start: Date; end: Date };

/** Le dépliage des lignes : RFC 5545 coupe à 75 octets et reprend par un blanc. */
function unfold(ics: string): string[] {
  const lines = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

type Prop = { name: string; params: Record<string, string>; value: string };

function parseProp(line: string): Prop | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;
  const left = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const bits = left.split(";");
  const name = bits[0].toUpperCase();
  const params: Record<string, string> = {};
  for (const b of bits.slice(1)) {
    const eq = b.indexOf("=");
    if (eq > 0) params[b.slice(0, eq).toUpperCase()] = b.slice(eq + 1).replace(/^"|"$/g, "");
  }
  return { name, params, value };
}

/**
 * Une valeur DATE-TIME en instant.
 *
 * TROIS FORMES, et la troisième est celle qui piège. `...Z` est de l'UTC.
 * `TZID=Europe/Paris:...` est une heure murale dans un fuseau nommé. Une date
 * nue (`VALUE=DATE`) est une JOURNÉE ENTIÈRE : on la traite comme telle,
 * puisqu'une journée bloquée doit bloquer tous les créneaux du jour.
 */
function toInstant(p: Prop): { at: Date; allDay: boolean } | null {
  const v = p.value.trim();
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (dateOnly) {
    const [, y, mo, d] = dateOnly;
    return { at: new Date(Date.UTC(+y, +mo - 1, +d)), allDay: true };
  }
  const dt = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(v);
  if (!dt) return null;
  const [, y, mo, d, h, mi, s, z] = dt;
  if (z) return { at: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)), allDay: false };

  const tzid = p.params.TZID;
  if (tzid) {
    // Même correction en deux passes que `fromWallClock`, recopiée ici pour
    // que ce module ne dépende pas du fuseau de l'organisateur.
    const naive = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
    const offset = (at: Date) => {
      try {
        const f = new Intl.DateTimeFormat("en-US", {
          timeZone: tzid, hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        });
        const parts = f.formatToParts(at);
        const g = (t: string) => Number(parts.find((x) => x.type === t)?.value ?? "0");
        return Math.round((Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"), g("second")) - at.getTime()) / 60000);
      } catch {
        return 0; // Fuseau inconnu du moteur : on retombe sur de l'UTC.
      }
    };
    let guess = new Date(naive - offset(new Date(naive)) * 60000);
    guess = new Date(naive - offset(guess) * 60000);
    return { at: guess, allDay: false };
  }
  // Heure « flottante », sans fuseau. La norme dit « l'heure locale du
  // lecteur » ; pour un agenda professionnel c'est presque toujours celle de
  // l'organisateur, mais on ne peut pas le savoir ici : on la lit en UTC et on
  // l'accepte telle quelle. Le risque est de bloquer une heure décalée, jamais
  // d'en libérer une à tort si l'écart reste sous la durée du rendez-vous.
  return { at: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)), allDay: false };
}

function parseDuration(v: string): number | null {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim());
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  const ms =
    (Number(m[2] || 0) * 7 * 86400 + Number(m[3] || 0) * 86400 + Number(m[4] || 0) * 3600 +
      Number(m[5] || 0) * 60 + Number(m[6] || 0)) * 1000;
  return sign * ms;
}

/**
 * Les plages occupées portées par UN objet iCalendar, bornées à la fenêtre.
 *
 * La répétition est développée ici, pas par le serveur : un `calendar-query`
 * peut renvoyer l'événement maître d'une série sans ses occurrences, et un
 * point hebdomadaire non développé laisserait libres tous les créneaux qu'il
 * occupe sauf le premier. On ne traite que FREQ DAILY/WEEKLY/MONTHLY avec
 * INTERVAL, COUNT, UNTIL et BYDAY — ce que produisent les agendas courants.
 */
export function expandEvent(ics: string, from: Date, to: Date): BusyWindow[] {
  const lines = unfold(ics);
  const out: BusyWindow[] = [];

  let inEvent = false;
  let start: { at: Date; allDay: boolean } | null = null;
  let end: Date | null = null;
  let duration: number | null = null;
  let rrule = "";
  let transparent = false;
  let cancelled = false;
  const exdates: number[] = [];

  const flush = () => {
    if (!start) return;
    let span = end ? end.getTime() - start.at.getTime() : duration ?? (start.allDay ? 86400000 : 0);
    if (span <= 0) span = start.allDay ? 86400000 : 0;
    if (span > 0 && !transparent && !cancelled) {
      for (const occ of occurrences(start.at, rrule, from, to, span)) {
        if (exdates.includes(occ.getTime())) continue;
        const s = new Date(occ);
        const e = new Date(occ.getTime() + span);
        if (e > from && s < to) out.push({ start: s, end: e });
      }
    }
    inEvent = false; start = null; end = null; duration = null; rrule = ""; transparent = false; cancelled = false;
    exdates.length = 0;
  };

  for (const line of lines) {
    if (/^BEGIN:VEVENT/i.test(line)) { inEvent = true; continue; }
    if (/^END:VEVENT/i.test(line)) { flush(); continue; }
    if (!inEvent) continue;
    const p = parseProp(line);
    if (!p) continue;
    switch (p.name) {
      case "DTSTART": start = toInstant(p); break;
      case "DTEND": { const i = toInstant(p); end = i ? i.at : null; break; }
      case "DURATION": duration = parseDuration(p.value); break;
      case "RRULE": rrule = p.value; break;
      // TRANSP:TRANSPARENT = « je suis disponible pendant » : ne bloque rien.
      case "TRANSP": transparent = /TRANSPARENT/i.test(p.value); break;
      case "STATUS": cancelled = /CANCELLED/i.test(p.value); break;
      case "EXDATE":
        for (const one of p.value.split(",")) {
          const i = toInstant({ ...p, value: one });
          if (i) exdates.push(i.at.getTime());
        }
        break;
    }
  }
  flush();
  return out;
}

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/**
 * Les débuts d'occurrence d'une série, bornés à la fenêtre demandée.
 *
 * ⚠ LE BIAIS EST VOLONTAIREMENT DU CÔTÉ DE L'OCCUPATION. Rater une occurrence
 * ouvre un créneau déjà pris et provoque un double rendez-vous ; en ajouter une
 * de trop ne fait que masquer un horaire libre. Donc : dès qu'une règle sort de
 * ce que ce code sait développer (BYSETPOS, BYMONTHDAY, FREQ inconnue), on
 * renvoie une occurrence par PAS de la période sans filtrer, ce qui bloque au
 * moins autant que la vraie série.
 *
 * Ne sont développées finement que les formes que produisent les agendas
 * courants : DAILY, WEEKLY (avec BYDAY), MONTHLY, YEARLY, plus INTERVAL,
 * COUNT et UNTIL.
 */
function occurrences(first: Date, rrule: string, from: Date, to: Date, span: number): Date[] {
  if (!rrule) return [first];

  const parts: Record<string, string> = {};
  for (const kv of rrule.split(";")) {
    const eq = kv.indexOf("=");
    if (eq > 0) parts[kv.slice(0, eq).toUpperCase()] = kv.slice(eq + 1);
  }
  const freq = (parts.FREQ || "").toUpperCase();
  const interval = Math.max(1, Number(parts.INTERVAL || 1));
  const count = parts.COUNT ? Math.max(1, Number(parts.COUNT)) : Infinity;
  const until = parts.UNTIL
    ? toInstant({ name: "UNTIL", params: {}, value: parts.UNTIL })?.at ?? null
    : null;
  const byDay = parts.BYDAY
    ? parts.BYDAY.split(",").map((d) => d.trim().slice(-2).toUpperCase()).filter((d) => BYDAY.includes(d))
    : null;

  const out: Date[] = [];
  const push = (at: Date) => {
    if (until && at > until) return false;
    // On garde tout ce qui CHEVAUCHE la fenêtre, d'où le `+ span` : un
    // rendez-vous commencé avant `from` mais fini après occupe bien le début
    // de la fenêtre.
    if (at.getTime() + span > from.getTime() && at < to) out.push(new Date(at));
    return true;
  };

  // Plafond dur : une règle mal formée ne doit pas faire tourner la fonction
  // jusqu'au délai de garde de Vercel. 1 000 pas couvrent presque trois ans de
  // récurrence quotidienne, très au-delà de l'horizon de réservation.
  const MAX = 1000;

  if (freq === "WEEKLY" && byDay && byDay.length) {
    // Le lundi (ou plutôt le dimanche, index 0) de la semaine du premier
    // événement sert d'ancre ; on avance de `interval` semaines et on pose
    // chaque jour listé, à l'heure du premier.
    const anchor = new Date(first);
    anchor.setUTCDate(anchor.getUTCDate() - anchor.getUTCDay());
    let emitted = 0;
    for (let week = 0; week < MAX && emitted < count; week += 1) {
      const weekStart = new Date(anchor.getTime() + week * interval * 7 * 86400000);
      if (weekStart.getTime() > to.getTime() + 7 * 86400000) break;
      for (const d of byDay) {
        const at = new Date(weekStart.getTime() + BYDAY.indexOf(d) * 86400000);
        at.setUTCHours(first.getUTCHours(), first.getUTCMinutes(), first.getUTCSeconds(), 0);
        if (at < first) continue;
        if (emitted >= count) break;
        emitted++;
        if (!push(at)) return out;
      }
    }
    return out;
  }

  const stepOnce = (cursor: Date): Date | null => {
    const d = new Date(cursor);
    switch (freq) {
      case "DAILY": d.setUTCDate(d.getUTCDate() + interval); return d;
      case "WEEKLY": d.setUTCDate(d.getUTCDate() + 7 * interval); return d;
      case "MONTHLY": d.setUTCMonth(d.getUTCMonth() + interval); return d;
      case "YEARLY": d.setUTCFullYear(d.getUTCFullYear() + interval); return d;
      // FREQ absente ou exotique (HOURLY, MINUTELY, SECONDLY) : on avance d'un
      // jour, ce qui sur-bloque plutôt que de sous-bloquer. Voir le pavé.
      default: d.setUTCDate(d.getUTCDate() + 1); return d;
    }
  };

  let cursor: Date | null = new Date(first);
  for (let i = 0; i < MAX && cursor && i < count; i++) {
    if (until && cursor > until) break;
    if (cursor.getTime() > to.getTime()) break;
    push(cursor);
    cursor = stepOnce(cursor);
  }
  return out;
}

/* ── Écriture ─────────────────────────────────────────────────────────────── */

function esc(v: string): string {
  // ⚠ Les quatre echappements de la RFC 5545, dans CET ordre : la contre-oblique
  // d'abord, sinon on echapperait les contre-obliques qu'on vient d'ajouter.
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Replie une ligne à 75 octets, comme la norme le demande. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < bytes.length) {
    const take = i === 0 ? 75 : 74;
    let end = Math.min(i + take, bytes.length);
    // Ne jamais couper au milieu d'un caractère UTF-8.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push((i === 0 ? "" : " ") + bytes.subarray(i, end).toString("utf8"));
    i = end;
  }
  return out.join("\r\n");
}

export type EventDraft = {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  organiser: { name: string; email: string };
  attendee: { name: string; email: string };
  /** REQUEST pour une invitation, CANCEL pour une annulation. */
  method: "REQUEST" | "CANCEL" | "PUBLISH";
  sequence?: number;
};

export function buildIcs(d: EventDraft): string {
  const stamp = (x: Date) =>
    x.getUTCFullYear().toString() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()) + "T" +
    pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + pad(x.getUTCSeconds()) + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ora Solution//Reservation//FR",
    "CALSCALE:GREGORIAN",
    `METHOD:${d.method}`,
    "BEGIN:VEVENT",
    `UID:${d.uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(d.start)}`,
    `DTEND:${stamp(d.end)}`,
    `SEQUENCE:${d.sequence ?? 0}`,
    `SUMMARY:${esc(d.summary)}`,
    `DESCRIPTION:${esc(d.description)}`,
    `LOCATION:${esc(d.location)}`,
    d.location.startsWith("http") ? `URL:${d.location}` : "",
    `ORGANIZER;CN=${esc(d.organiser.name)}:mailto:${d.organiser.email}`,
    `ATTENDEE;CN=${esc(d.attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${d.attendee.email}`,
    d.method === "CANCEL" ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(d.summary)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.map(fold).join("\r\n") + "\r\n";
}
