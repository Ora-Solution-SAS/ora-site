/**
 * kmeet.ts — la salle de visioconférence, créée dans kSuite.
 *
 * Point d'entrée relevé sur l'API publique d'Infomaniak :
 *   POST https://api.infomaniak.com/1/kmeet/rooms
 *   Authorization: Bearer <token cree dans Manager > Developpement > Jetons API>
 * L'identifiant d'agenda attendu se lit sur
 *   GET https://calendar.infomaniak.com/api/pim/calendar
 * avec le meme jeton.
 *
 * ⚠ LES HORAIRES NE SONT PAS DE L'ISO 8601. Le corps attend « Y-m-d H:i:s »,
 * LU DANS LE FUSEAU passé à côté, pas en UTC. Envoyer un `toISOString()` ici
 * décale le rendez-vous d'une à deux heures selon la saison, sans erreur
 * visible : la salle est créée, simplement pas à l'heure dite.
 *
 * ⚠ CET APPEL CRÉE AUSSI L'ÉVÉNEMENT D'AGENDA (il renvoie `event_id`). C'est
 * pour cela que le service N'ÉCRIT PAS en plus par CalDAV quand le jeton est
 * présent : les deux écritures feraient deux entrées pour un seul rendez-vous.
 * Voir `api/book.ts`, qui choisit l'un ou l'autre chemin.
 */

import { infomaniakStamp } from "./time.js";

export type MeetingRoom = {
  url: string;
  /** Identifiant de l'événement créé au passage, quand il y en a un. */
  eventId: number | null;
  /** Comment la salle a été obtenue, pour le journal et les tests. */
  source: "kmeet-api" | "fallback";
};

export async function createRoom(opts: {
  token: string;
  calendarId: number;
  title: string;
  start: Date;
  end: Date;
  timeZone: string;
}): Promise<MeetingRoom> {
  const res = await fetch("https://api.infomaniak.com/1/kmeet/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      calendar_id: opts.calendarId,
      starting_at: infomaniakStamp(opts.start, opts.timeZone),
      ending_at: infomaniakStamp(opts.end, opts.timeZone),
      timezone: opts.timeZone,
      hostname: "kmeet.infomaniak.com",
      title: opts.title,
      options: { e2ee_enabled: false, lobby_enabled: false, password_enabled: false },
    }),
    signal: AbortSignal.timeout(12_000),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`kMeet HTTP ${res.status}: ${text.slice(0, 200)}`);

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("kMeet : réponse illisible.");
  }
  const data = json?.data ?? json;
  const hostname = data?.hostname || "kmeet.infomaniak.com";
  const name = data?.name;
  if (!name) throw new Error("kMeet : pas de nom de salle dans la réponse.");

  return {
    url: `https://${hostname}/${name}`,
    eventId: typeof data?.event_id === "number" ? data.event_id : null,
    source: "kmeet-api",
  };
}

/**
 * ⚠ E2EE DÉSACTIVÉ, ET C'EST UN CHOIX. Le chiffrement de bout en bout de kMeet
 * impose au visiteur d'entrer une clé partagée avant d'entrer : sur un premier
 * rendez-vous commercial, c'est une porte de plus devant quelqu'un qui n'a
 * encore rien signé. Le salon d'attente (`lobby`) est écarté pour la même
 * raison : personne ne surveille la porte à 9 h 02.
 * Si l'appel devait porter des documents client, les deux se rallument ici, et
 * il faut alors transmettre la clé dans le courriel de confirmation.
 */

/**
 * La salle de repli, quand l'API n'est pas branchée.
 *
 * ⚠ CE N'EST PAS UNE VRAIE SALLE RÉSERVÉE : kMeet ouvre un salon au premier
 * visiteur qui suit l'URL, ce qui suffit pour un rendez-vous à deux mais ne
 * garantit ni le nom, ni l'unicité, ni le rattachement à l'agenda. Le chemin
 * normal reste `createRoom`. Poser `FALLBACK_MEETING_URL` donne une salle fixe,
 * plus sûre que le tirage : deux rendez-vous qui se chevauchent la partagent,
 * mais l'agenda n'en accepte pas deux à la fois.
 */
export function fallbackRoom(url: string | null, uid: string): MeetingRoom {
  // `uid` commence déjà par « ora- » (voir api/book.ts) : le répéter donnait
  // des salles « ora-ora-... ».
  const slug = uid.replace(/^ora-/, "").slice(0, 16);
  return {
    url: url || `https://kmeet.infomaniak.com/ora-${slug}`,
    eventId: null,
    source: "fallback",
  };
}
