/**
 * bookingApi — le seul point de contact entre la page et le service de
 * réservation. Rien d'autre dans `src/` ne doit appeler `/api/...` de la main.
 *
 * ⚠ LE DRAPEAU `mock` REMONTE JUSQU'À L'ÉCRAN, et ce n'est pas négociable. Le
 * service sait fabriquer de la disponibilité quand l'agenda n'est pas branché
 * (voir api/_lib/slots.ts) ; c'est commode en développement et c'est exactement
 * ce qui a fait retirer le premier sélecteur de créneaux le 2026-09-05 : il
 * inventait ses horaires et Cal.com en affichait d'autres juste après. Un
 * calendrier qui ment est pire que pas de calendrier. Le composant affiche donc
 * un bandeau sans ambiguïté dès que `mock` est vrai, et le bouton de
 * confirmation reste inerte.
 */

export type Slot = { start: string; end: string };

export type Availability = {
  /** Vrai quand les créneaux sont FABRIQUÉS : agenda non branché. */
  mock: boolean;
  /** Fuseau de l'agenda (l'organisateur). */
  timeZone: string;
  durationMinutes: number;
  slots: Slot[];
};

export type BookingRequest = {
  start: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  timeZone: string;
  lang: "fr" | "en";
  /** Piège à robots : doit rester vide. */
  website?: string;
};

export type BookingResult = {
  ok: true;
  uid: string;
  start: string;
  end: string;
  meetingUrl: string;
  mailed: boolean;
};

export type BookingErrorCode =
  | "slot_taken"
  | "slot_out_of_window"
  | "calendar_unavailable"
  | "calendar_write_failed"
  | "not_configured"
  | "invalid_email"
  | "invalid_name"
  | "invalid_slot"
  | "network";

export class BookingError extends Error {
  code: BookingErrorCode;
  constructor(code: BookingErrorCode, message?: string) {
    super(message ?? code);
    this.name = "BookingError";
    this.code = code;
  }
}

/** Le fuseau du visiteur, tel que son navigateur le déclare. */
export function guestTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
  } catch {
    return "Europe/Paris";
  }
}

export async function fetchAvailability(signal?: AbortSignal): Promise<Availability> {
  let res: Response;
  try {
    res = await fetch(`/api/availability?tz=${encodeURIComponent(guestTimeZone())}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new BookingError("network");
  }

  if (!res.ok) {
    // 502 et 503 disent tous les deux « l'agenda ne répond pas » ; le front n'a
    // pas à distinguer un refus d'identifiants d'une panne réseau, il n'a rien
    // de différent à proposer au visiteur dans un cas ou dans l'autre.
    throw new BookingError("calendar_unavailable");
  }

  const data = (await res.json()) as Availability;
  return {
    mock: Boolean(data.mock),
    timeZone: data.timeZone || "Europe/Paris",
    durationMinutes: data.durationMinutes || 30,
    slots: Array.isArray(data.slots) ? data.slots : [],
  };
}

export async function book(req: BookingRequest): Promise<BookingResult> {
  let res: Response;
  try {
    res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(req),
    });
  } catch {
    throw new BookingError("network");
  }

  const payload = (await res.json().catch(() => null)) as
    | (Partial<BookingResult> & { error?: BookingErrorCode; message?: string })
    | null;

  if (!res.ok || !payload?.ok) {
    throw new BookingError(payload?.error ?? "network", payload?.message);
  }
  return payload as BookingResult;
}

/* ── Regroupement par jour, dans le fuseau du visiteur ────────────────────────
   Le service rend une liste plate d'instants UTC : c'est ici qu'elle devient
   « des jours ». Le découpage se fait dans le fuseau du VISITEUR, pas dans
   celui de l'agenda — un créneau de 9 h à Paris est un créneau de la veille au
   soir pour quelqu'un à Montréal, et c'est sa journée à lui qu'il regarde. */

export type DaySlots = { key: string; slots: Slot[] };

export function groupByDay(slots: Slot[], timeZone: string): Map<string, Slot[]> {
  const out = new Map<string, Slot[]>();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  for (const s of slots) {
    // en-CA rend « 2026-09-08 », le seul format ISO que fournisse `Intl`.
    const key = fmt.format(new Date(s.start));
    const list = out.get(key);
    if (list) list.push(s);
    else out.set(key, [s]);
  }
  return out;
}
