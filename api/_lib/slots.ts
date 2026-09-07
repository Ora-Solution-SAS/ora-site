/**
 * slots.ts — de « quelles sont mes heures ouvrables » à « voici les créneaux
 * réellement libres ».
 *
 * L'ordre compte : on découpe d'abord les journées ouvrables en créneaux, PUIS
 * on retire ce que l'agenda occupe. L'inverse (partir de l'agenda) donnerait
 * des créneaux à des heures que l'organisateur ne veut pas travailler.
 */

import type { BookingRules } from "./config.js";
import type { BusyWindow } from "./ical.js";
import { fromWallClock, wallClock } from "./time.js";

export type Slot = {
  /** Début du créneau, en ISO 8601 UTC. C'est la seule forme qui circule. */
  start: string;
  end: string;
};

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Tous les créneaux candidats d'une fenêtre, avant confrontation à l'agenda.
 * `from` et `to` sont des instants ; les heures d'ouverture sont lues dans le
 * fuseau de l'organisateur.
 */
export function candidateSlots(r: BookingRules, from: Date, to: Date): Slot[] {
  const tz = r.organiserTimeZone;
  const out: Slot[] = [];
  const dayMs = 86400000;

  // On balaie jour par jour en heure murale : c'est le seul repère où
  // « 9 h 00 » veut dire la même chose des deux côtés d'un changement d'heure.
  // On part d'un jour AVANT pour ne pas manquer une journée que le décalage
  // ferait commencer plus tôt en UTC.
  for (let t = from.getTime() - dayMs; t <= to.getTime() + dayMs; t += dayMs) {
    const w = wallClock(new Date(t), tz);
    const ranges = r.openingHours[w.weekday];
    if (!ranges || !ranges.length) continue;

    for (const [openStr, closeStr] of ranges) {
      const open = minutesOfDay(openStr);
      const close = minutesOfDay(closeStr);
      for (let m = open; m + r.durationMinutes <= close; m += r.stepMinutes) {
        const start = fromWallClock(tz, w.year, w.month, w.day, Math.floor(m / 60), m % 60);
        const end = new Date(start.getTime() + r.durationMinutes * 60000);
        if (start < from || end > to) continue;
        // Le balayage à cheval sur les jours peut repasser sur un créneau déjà
        // posé quand un changement d'heure décale la journée : on déduplique.
        const iso = start.toISOString();
        if (out.some((s) => s.start === iso)) continue;
        out.push({ start: iso, end: end.toISOString() });
      }
    }
  }

  out.sort((a, b) => a.start.localeCompare(b.start));
  return out;
}

/** Retire de `slots` tout ce qui touche une plage occupée, battement compris. */
export function subtractBusy(slots: Slot[], busy: BusyWindow[], bufferMinutes: number): Slot[] {
  if (!busy.length) return slots;
  const buffer = bufferMinutes * 60000;
  return slots.filter((s) => {
    const start = Date.parse(s.start);
    const end = Date.parse(s.end);
    for (const b of busy) {
      // Le battement s'applique DES DEUX CÔTÉS : un rendez-vous qui finit à
      // 10 h 00 ne doit pas en laisser commencer un à 10 h 00, et un qui
      // commence à 11 h 00 ne doit pas en laisser finir à 11 h 00.
      const bs = b.start.getTime() - buffer;
      const be = b.end.getTime() + buffer;
      if (start < be && end > bs) return false;
    }
    return true;
  });
}

/**
 * La fenêtre réellement réservable : jamais avant le préavis, jamais au-delà
 * de l'horizon. Les deux bornes sont recalculées à chaque appel, sinon un
 * processus serverless réutilisé servirait la fenêtre de son démarrage.
 */
export function bookingWindow(r: BookingRules, now = new Date()): { from: Date; to: Date } {
  return {
    from: new Date(now.getTime() + r.minNoticeHours * 3600000),
    to: new Date(now.getTime() + r.horizonDays * 86400000),
  };
}

/**
 * ── LA DISPONIBILITÉ DE DÉMONSTRATION ────────────────────────────────────────
 * Utilisée UNIQUEMENT quand aucun identifiant CalDAV n'est configuré, pour que
 * la page reste développable hors ligne.
 *
 * ⚠ ELLE EST FABRIQUÉE, et c'est précisément ce qui a fait retirer le premier
 * sélecteur de créneaux le 2026-09-05 (voir SlotPicker.tsx). Elle n'a le droit
 * d'exister que parce que la réponse la déclare (`mock: true`) et que le front
 * refuse alors d'enregistrer une réservation. Ne jamais laisser ce chemin
 * servir une page publique.
 */
export function mockBusy(from: Date, to: Date): BusyWindow[] {
  const out: BusyWindow[] = [];
  const dayMs = 86400000;
  for (let t = from.getTime(); t <= to.getTime(); t += dayMs) {
    const d = new Date(t);
    // Une graine stable par date : la même journée rend toujours la même
    // occupation, sinon la grille changerait à chaque rechargement.
    const seed = (d.getUTCFullYear() * 372 + (d.getUTCMonth() + 1) * 31 + d.getUTCDate()) % 97;
    if (seed % 5 === 0) {
      out.push({ start: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 6, 0)), end: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 18, 0)) });
      continue;
    }
    const h = 8 + (seed % 6);
    out.push({
      start: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, 0)),
      end: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h + 2, 0)),
    });
  }
  return out;
}
