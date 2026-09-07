/**
 * POST /api/book
 *
 * Corps attendu :
 *   { start, name, email, company?, phone?, notes?, timeZone?, lang?, website? }
 *
 * Enchaînement, et l'ordre n'est pas indifférent :
 *   1. valider et normaliser l'entrée ;
 *   2. RELIRE l'agenda et vérifier que le créneau est toujours libre. C'est la
 *      seule protection contre deux visiteurs qui remplissent le formulaire en
 *      même temps, la liste vue par le navigateur pouvant dater d'une minute ;
 *   3. créer la salle kMeet (elle pose aussi l'événement quand l'API est
 *      branchée) ou, à défaut, écrire l'événement par CalDAV ;
 *   4. envoyer les deux courriels.
 *
 * ⚠ L'ÉCHEC D'ENVOI DE COURRIEL N'ANNULE PAS LE RENDEZ-VOUS. Il est dans
 * l'agenda, il aura lieu. On renvoie donc 200 avec un drapeau `mailed: false`
 * plutôt qu'une erreur qui pousserait le visiteur à réserver une seconde fois.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rules, secrets } from "./_lib/config.js";
import { busyWindows, putEvent } from "./_lib/caldav.js";
import { buildIcs } from "./_lib/ical.js";
import { createRoom, fallbackRoom } from "./_lib/kmeet.js";
import { sendGuestConfirmation, sendOrganiserNotice, type BookingMailData } from "./_lib/mail.js";
import { bookingWindow, candidateSlots, subtractBusy } from "./_lib/slots.js";
import { humanDate, humanTime, isValidTimeZone } from "./_lib/time.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Les caractères de contrôle sont retirés AVANT toute mise en gabarit. Un
 * retour chariot glissé dans un nom ressortirait tel quel dans l'en-tête d'un
 * courriel (injection d'en-tête) et dans une ligne d'iCalendar, où il coupe la
 * propriété en deux et casse le fichier pour tous les lecteurs.
 */
const CONTROL_RE = /[\u0000-\u001f\u007f]/g;
/** Idem, mais le saut de ligne survit : la zone de commentaire est libre. */
const CONTROL_KEEP_NL_RE = /[\u0000-\u0009\u000b-\u001f\u007f]/g;

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(CONTROL_RE, " ").trim().slice(0, max) : "";
}

function cleanMultiline(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n?/g, "\n").replace(CONTROL_KEEP_NL_RE, " ").trim().slice(0, max);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = (typeof req.body === "string" ? safeJson(req.body) : req.body) ?? {};

  // Piège à robots : un champ que seul un automate remplit. On répond 200 pour
  // ne rien lui apprendre, mais rien n'est écrit.
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const company = clean(body.company, 160);
  const phone = clean(body.phone, 40);
  const notes = cleanMultiline(body.notes, 1200);
  const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";
  const guestTz =
    typeof body.timeZone === "string" && isValidTimeZone(body.timeZone) ? body.timeZone : "Europe/Paris";

  if (name.length < 2) return res.status(400).json({ error: "invalid_name" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "invalid_email" });

  const startMs = Date.parse(clean(body.start, 40));
  if (!Number.isFinite(startMs)) return res.status(400).json({ error: "invalid_slot" });

  const r = rules();
  const s = secrets();

  if (!s.caldav) {
    // Pas d'agenda branché : on refuse EXPLICITEMENT plutôt que de faire croire
    // à une réservation. Voir le pavé du mode de démonstration dans slots.ts.
    return res.status(503).json({
      error: "not_configured",
      message: "La réservation en ligne n'est pas encore active sur cet environnement.",
    });
  }

  const start = new Date(startMs);
  const end = new Date(startMs + r.durationMinutes * 60000);
  const win = bookingWindow(r);
  if (start < win.from || end > win.to) {
    return res.status(409).json({ error: "slot_out_of_window" });
  }

  // ── La vérification qui compte ────────────────────────────────────────────
  let busy;
  try {
    busy = await busyWindows(s.caldav, new Date(start.getTime() - 7200000), new Date(end.getTime() + 7200000));
  } catch (err) {
    console.error("[book] agenda injoignable:", err instanceof Error ? err.message : err);
    return res.status(503).json({ error: "calendar_unavailable" });
  }

  const stillFree = subtractBusy(
    candidateSlots(r, new Date(start.getTime() - 60000), new Date(end.getTime() + 60000)),
    busy,
    r.bufferMinutes,
  ).some((slot) => Date.parse(slot.start) === start.getTime());

  if (!stillFree) {
    return res.status(409).json({ error: "slot_taken", message: "Ce créneau vient d'être pris." });
  }

  // ── La salle, et l'événement ──────────────────────────────────────────────
  const uid = `ora-${start.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const summary = lang === "fr" ? `Ora · échange avec ${name}` : `Ora · call with ${name}`;
  const titleForRoom = company ? `${summary} (${company})` : summary;

  let room = fallbackRoom(s.fallbackMeetingUrl, uid);
  if (s.infomaniak) {
    try {
      room = await createRoom({
        token: s.infomaniak.token,
        calendarId: s.infomaniak.calendarId,
        title: titleForRoom,
        start,
        end,
        timeZone: r.organiserTimeZone,
      });
    } catch (err) {
      // La visio n'est pas la réservation : on garde le rendez-vous et on
      // retombe sur la salle de repli plutôt que de tout annuler.
      console.error("[book] kMeet indisponible, salle de repli:", err instanceof Error ? err.message : err);
    }
  }

  const description = [
    lang === "fr" ? `Visio : ${room.url}` : `Video call: ${room.url}`,
    "",
    `${name} <${email}>`,
    company,
    phone,
    notes ? `\n${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ics = buildIcs({
    uid,
    start,
    end,
    summary: titleForRoom,
    description,
    location: room.url,
    organiser: { name: s.organiserName, email: s.organiserEmail },
    attendee: { name, email },
    method: "REQUEST",
  });

  // Quand kMeet a déjà posé l'événement (`event_id`), on n'écrit PAS une
  // seconde fois : voir le pavé d'en-tête de kmeet.ts.
  let written = room.eventId !== null;
  if (!written) {
    try {
      await putEvent(s.caldav, uid, ics);
      written = true;
    } catch (err) {
      console.error("[book] ecriture agenda refusee:", err instanceof Error ? err.message : err);
      return res.status(502).json({ error: "calendar_write_failed" });
    }
  }

  // ── Les courriels ─────────────────────────────────────────────────────────
  const mailData: BookingMailData = {
    guestName: name,
    guestEmail: email,
    company: company || undefined,
    phone: phone || undefined,
    notes: notes || undefined,
    whenGuest: `${humanDate(start, guestTz, lang)}, ${humanTime(start, guestTz, lang)}`,
    whenOrganiser: `${humanDate(start, r.organiserTimeZone, "fr")}, ${humanTime(start, r.organiserTimeZone, "fr")}`,
    guestTimeZone: guestTz,
    meetingUrl: room.url,
    organiserName: s.organiserName,
    organiserEmail: s.organiserEmail,
    durationMinutes: r.durationMinutes,
    lang,
  };

  let mailed = false;
  if (s.brevo) {
    try {
      await Promise.all([
        sendGuestConfirmation(s.brevo, mailData, ics),
        sendOrganiserNotice(s.brevo, mailData, ics),
      ]);
      mailed = true;
    } catch (err) {
      console.error("[book] envoi des courriels echoue:", err instanceof Error ? err.message : err);
    }
  }

  return res.status(200).json({
    ok: true,
    uid,
    start: start.toISOString(),
    end: end.toISOString(),
    meetingUrl: room.url,
    meetingSource: room.source,
    mailed,
  });
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
