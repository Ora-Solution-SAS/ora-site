/**
 * GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=Europe/Paris
 *
 * Rend les créneaux RÉELLEMENT libres, dans l'ordre chronologique, en ISO 8601
 * UTC. Le fuseau passé ne sert qu'à borner la fenêtre demandée par le front ;
 * l'affichage se fait côté navigateur, qui connaît mieux le fuseau du visiteur
 * que nous.
 *
 * ⚠ CETTE ROUTE NE DOIT JAMAIS INVENTER DE DISPONIBILITÉ SANS LE DIRE. Quand
 * l'agenda n'est pas joignable, deux comportements et deux seulement :
 *   · pas d'identifiants configurés -> `mock: true`, créneaux fabriqués, et le
 *     front affiche un bandeau ; c'est le mode de développement ;
 *   · identifiants présents mais agenda en erreur -> HTTP 503 et AUCUN
 *     créneau. Mieux vaut une fenêtre vide qu'une fausse promesse : c'est la
 *     leçon du sélecteur retiré le 2026-09-05 (voir SlotPicker.tsx).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isMock, rules, secrets } from "./_lib/config.js";
import { busyWindows, CalDavError } from "./_lib/caldav.js";
import { bookingWindow, candidateSlots, mockBusy, subtractBusy } from "./_lib/slots.js";
import { isValidTimeZone, parseIsoDate } from "./_lib/time.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const r = rules();
  const window = bookingWindow(r);

  // Les bornes demandées sont RESSERRÉES sur la fenêtre réservable, jamais
  // élargies : un paramètre d'URL ne doit pas pouvoir faire lire deux ans
  // d'agenda ni proposer un rendez-vous dans l'heure.
  let from = window.from;
  let to = window.to;
  const qFrom = typeof req.query.from === "string" ? parseIsoDate(req.query.from) : null;
  const qTo = typeof req.query.to === "string" ? parseIsoDate(req.query.to) : null;
  if (qFrom) {
    const d = new Date(Date.UTC(qFrom.year, qFrom.month - 1, qFrom.day));
    if (d > from) from = d;
  }
  if (qTo) {
    const d = new Date(Date.UTC(qTo.year, qTo.month - 1, qTo.day, 23, 59, 59));
    if (d < to) to = d;
  }
  if (from >= to) {
    return res.status(200).json({ mock: isMock(), timeZone: r.organiserTimeZone, durationMinutes: r.durationMinutes, slots: [] });
  }

  const tz = typeof req.query.tz === "string" && isValidTimeZone(req.query.tz) ? req.query.tz : r.organiserTimeZone;

  const s = secrets();
  let busy;
  let mock = false;

  if (!s.caldav) {
    /* ⚠ LE MODE DÉMONSTRATION EST INTERDIT EN PRODUCTION (2026-09-07), et
       c'est une garantie, pas une convention. `VITE_BOOKING_ENABLED` suffit à
       masquer le calendrier côté page, mais un drapeau de compilation posé de
       travers, une prévisualisation promue en production, ou simplement
       quelqu'un qui appelle l'URL à la main, et des horaires INVENTÉS
       sortiraient sur le domaine public. C'est très exactement ce qui a fait
       retirer le premier sélecteur le 2026-09-05.
       Sur Vercel, `VERCEL_ENV` vaut « production » sur le domaine de
       production et « preview » ailleurs : là où ça compte, l'absence
       d'identifiants rend une erreur, jamais une invention. */
    if (process.env.VERCEL_ENV === "production") {
      return res.status(503).json({
        error: "not_configured",
        message: "La reservation en ligne n'est pas encore active.",
      });
    }
    mock = true;
    busy = mockBusy(from, to);
  } else {
    try {
      busy = await busyWindows(s.caldav, new Date(from.getTime() - 3600000), new Date(to.getTime() + 3600000));
    } catch (err) {
      const status = err instanceof CalDavError && (err.status === 401 || err.status === 403) ? 502 : 503;
      console.error("[availability] agenda injoignable:", err instanceof Error ? err.message : err);
      return res.status(status).json({
        error: "calendar_unavailable",
        message: "L'agenda n'est pas joignable pour le moment.",
      });
    }
  }

  const slots = subtractBusy(candidateSlots(r, from, to), busy, r.bufferMinutes);

  // Réponse courte et fraîche : un cache de 60 s absorbe les rechargements de
  // page sans jamais laisser un créneau vendu deux fois pendant une minute
  // (la vérification qui compte est refaite au moment de réserver).
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=120");
  return res.status(200).json({
    mock,
    timeZone: r.organiserTimeZone,
    guestTimeZone: tz,
    durationMinutes: r.durationMinutes,
    slots,
  });
}
