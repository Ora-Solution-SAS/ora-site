/**
 * time.ts — l'arithmétique de fuseau, sans dépendance.
 *
 * Tout le service raisonne en INSTANTS (des `Date`, donc de l'UTC) et ne
 * repasse en heure murale que pour deux choses : découper une journée de
 * travail en créneaux, et écrire une date lisible dans un courriel.
 *
 * ⚠ POURQUOI CE FICHIER EXISTE PLUTÔT QU'UNE BIBLIOTHÈQUE. Le décalage de
 * Paris n'est pas une constante : il vaut +01:00 en hiver et +02:00 en été, et
 * le basculement tombe un dimanche à 02:00 locales. Un service qui ajoute
 * « 9 heures » à minuit UTC pour ouvrir sa journée se trompe d'une heure la
 * moitié de l'année, et se trompe SILENCIEUSEMENT : les créneaux proposés
 * existent, ils ne sont simplement pas ceux de l'agenda. `Intl` connaît la
 * base tz du système, on lui demande le décalage réel à l'instant considéré.
 */

/** Les morceaux d'un instant, lus dans un fuseau donné. */
export type WallClock = {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  hour: number;
  minute: number;
  second: number;
  /** 0 = dimanche, 1 = lundi... comme `Date.prototype.getDay`. */
  weekday: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    partsCache.set(timeZone, f);
  }
  return f;
}

/** L'heure murale d'un instant, dans le fuseau demandé. */
export function wallClock(instant: Date, timeZone: string): WallClock {
  const parts = formatter(timeZone).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  // `hour: "2-digit"` avec hour12:false rend « 24 » pour minuit sur certains
  // moteurs (bug historique de l'ICU) : on le ramène à 0.
  const hour = Number(get("hour")) % 24;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: Math.max(0, WEEKDAYS.indexOf(get("weekday"))),
  };
}

/** Le décalage du fuseau à cet instant, en minutes (Paris l'été : +120). */
export function offsetMinutes(instant: Date, timeZone: string): number {
  const w = wallClock(instant, timeZone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  // La différence entre « ces chiffres lus comme de l'UTC » et l'instant réel
  // EST le décalage, à la seconde près.
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/**
 * L'instant correspondant à une heure murale dans un fuseau.
 *
 * ⚠ DEUX PASSES, ET LA SECONDE N'EST PAS DÉCORATIVE. On devine d'abord le
 * décalage en traitant les chiffres comme de l'UTC ; ce décalage peut être
 * celui du MAUVAIS côté d'un changement d'heure quand la date visée est à
 * quelques heures du basculement. On relit donc le décalage à l'instant
 * approché et on recorrige. Deux passes suffisent : un décalage ne saute
 * jamais de plus d'une heure d'un coup.
 */
export function fromWallClock(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = new Date(naive - offsetMinutes(new Date(naive), timeZone) * 60000);
  guess = new Date(naive - offsetMinutes(guess, timeZone) * 60000);
  return guess;
}

/** « 2026-09-08 » pour l'heure murale de cet instant dans ce fuseau. */
export function isoDate(instant: Date, timeZone: string): string {
  const w = wallClock(instant, timeZone);
  return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
}

/** « 14:30 » pour l'heure murale de cet instant dans ce fuseau. */
export function isoTime(instant: Date, timeZone: string): string {
  const w = wallClock(instant, timeZone);
  return `${pad(w.hour)}:${pad(w.minute)}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Le format compact d'iCalendar : 20260908T143000Z, toujours en UTC. */
export function icalStamp(instant: Date): string {
  return (
    instant.getUTCFullYear().toString() +
    pad(instant.getUTCMonth() + 1) +
    pad(instant.getUTCDate()) +
    "T" +
    pad(instant.getUTCHours()) +
    pad(instant.getUTCMinutes()) +
    pad(instant.getUTCSeconds()) +
    "Z"
  );
}

/** « 2026-09-08 14:30:00 », ce que réclame l'API kMeet (pas de l'ISO 8601). */
export function infomaniakStamp(instant: Date, timeZone: string): string {
  const w = wallClock(instant, timeZone);
  return `${w.year}-${pad(w.month)}-${pad(w.day)} ${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}`;
}

/** Découpe « 2026-09-08 » sans passer par `new Date(string)`, dont l'analyse
 *  varie d'un moteur à l'autre sur les formes partielles. */
export function parseIsoDate(s: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** Vrai si `tz` est un identifiant de fuseau que ce moteur connaît. */
export function isValidTimeZone(tz: string): boolean {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Une date écrite en toutes lettres, pour le corps des courriels. */
export function humanDate(instant: Date, timeZone: string, lang: "fr" | "en"): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(instant);
}

export function humanTime(instant: Date, timeZone: string, lang: "fr" | "en"): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);
}
