/**
 * booking-selftest — les verifications que le navigateur ne peut pas faire.
 *
 * `npm run check:booking`
 *
 * POURQUOI CE FICHIER EXISTE. Les deux moities du service de reservation
 * echouent SANS RIEN DIRE quand elles echouent : un decalage de fuseau propose
 * des creneaux qui existent mais ne sont pas ceux de l'agenda, et un
 * echappement iCalendar rate produit un fichier que le lecteur de courriel
 * ouvre a moitie. Aucun des deux ne leve d'exception, aucun des deux ne se voit
 * a l'ecran. On les verifie donc ici, sur des dates choisies de part et
 * d'autre des deux bascules d'heure de 2026 (29 mars et 25 octobre).
 *
 * A LANCER apres toute retouche a time.ts, ical.ts ou slots.ts.
 */
import { fromWallClock, wallClock, offsetMinutes, icalStamp, infomaniakStamp } from "../api/_lib/time.js";
import { expandEvent, buildIcs } from "../api/_lib/ical.js";
import { candidateSlots, subtractBusy } from "../api/_lib/slots.js";

let fails = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fails++; console.log("FAIL", label, "got", got, "want", want); }
  else console.log("ok  ", label, got);
};

const TZ = "Europe/Paris";

// 1. Décalages de part et d'autre des bascules 2026 (29 mars, 25 octobre).
eq("offset 15 jan", offsetMinutes(new Date("2026-01-15T12:00:00Z"), TZ), 60);
eq("offset 15 jul", offsetMinutes(new Date("2026-07-15T12:00:00Z"), TZ), 120);
eq("offset 28 mars", offsetMinutes(new Date("2026-03-28T12:00:00Z"), TZ), 60);
eq("offset 30 mars", offsetMinutes(new Date("2026-03-30T12:00:00Z"), TZ), 120);
eq("offset 26 oct", offsetMinutes(new Date("2026-10-26T12:00:00Z"), TZ), 60);

// 2. Aller-retour : 9 h 00 Paris doit rendre 9 h 00 Paris, ete comme hiver.
for (const [y, m, d] of [[2026,1,15],[2026,3,29],[2026,3,30],[2026,7,15],[2026,10,25],[2026,10,26]] as const) {
  const inst = fromWallClock(TZ, y, m, d, 9, 0);
  const w = wallClock(inst, TZ);
  eq(`aller-retour ${y}-${m}-${d} 09:00`, [w.hour, w.minute], [9, 0]);
}

// 3. Le 9 h 00 du 15 juillet vaut bien 07:00 UTC.
eq("15 jul 09:00 Paris -> UTC", fromWallClock(TZ, 2026, 7, 15, 9, 0).toISOString(), "2026-07-15T07:00:00.000Z");
eq("15 jan 09:00 Paris -> UTC", fromWallClock(TZ, 2026, 1, 15, 9, 0).toISOString(), "2026-01-15T08:00:00.000Z");

// 4. Formats.
eq("icalStamp", icalStamp(new Date("2026-09-08T14:30:00Z")), "20260908T143000Z");
eq("infomaniakStamp", infomaniakStamp(new Date("2026-09-08T14:30:00Z"), TZ), "2026-09-08 16:30:00");

// 5. Lecture d'un VEVENT simple, puis d'une serie hebdomadaire.
const simple = [
  "BEGIN:VCALENDAR","BEGIN:VEVENT","UID:a",
  "DTSTART:20260908T080000Z","DTEND:20260908T090000Z","END:VEVENT","END:VCALENDAR",
].join("\r\n");
const busy1 = expandEvent(simple, new Date("2026-09-01T00:00:00Z"), new Date("2026-09-30T00:00:00Z"));
eq("VEVENT simple", busy1.map(b => [b.start.toISOString(), b.end.toISOString()]),
   [["2026-09-08T08:00:00.000Z","2026-09-08T09:00:00.000Z"]]);

const weekly = [
  "BEGIN:VCALENDAR","BEGIN:VEVENT","UID:b",
  "DTSTART:20260907T080000Z","DTEND:20260907T090000Z",
  "RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=3","END:VEVENT","END:VCALENDAR",
].join("\r\n");
const busy2 = expandEvent(weekly, new Date("2026-09-01T00:00:00Z"), new Date("2026-10-15T00:00:00Z"));
eq("serie hebdo (3 lundis)", busy2.map(b => b.start.toISOString()),
   ["2026-09-07T08:00:00.000Z","2026-09-14T08:00:00.000Z","2026-09-21T08:00:00.000Z"]);

// TRANSP:TRANSPARENT ne doit rien bloquer.
const free = simple.replace("UID:a", "UID:c\r\nTRANSP:TRANSPARENT");
eq("TRANSPARENT ignore", expandEvent(free, new Date("2026-09-01T00:00:00Z"), new Date("2026-09-30T00:00:00Z")).length, 0);

// Journee entiere = 24 h bloquees.
const allDay = ["BEGIN:VCALENDAR","BEGIN:VEVENT","UID:d","DTSTART;VALUE=DATE:20260908","END:VEVENT","END:VCALENDAR"].join("\r\n");
eq("journee entiere", expandEvent(allDay, new Date("2026-09-01T00:00:00Z"), new Date("2026-09-30T00:00:00Z"))
   .map(b => (b.end.getTime() - b.start.getTime()) / 3600000), [24]);

// 6. Creneaux : une journee de mardi doit ouvrir 09:00-12:30 et 14:00-18:00.
const rules = {
  organiserTimeZone: TZ, durationMinutes: 30, stepMinutes: 30, bufferMinutes: 15,
  minNoticeHours: 12, horizonDays: 30,
  openingHours: { 1: [["09:00","12:30"]], 2: [["09:00","12:30"],["14:00","18:00"]] } as Record<number, Array<[string,string]>>,
};
const slots = candidateSlots(rules as any, new Date("2026-09-08T00:00:00Z"), new Date("2026-09-09T00:00:00Z"));
eq("mardi : 7 + 8 creneaux", slots.length, 15);
eq("premier creneau mardi", slots[0].start, "2026-09-08T07:00:00.000Z");
eq("dernier creneau mardi", slots[slots.length - 1].start, "2026-09-08T15:30:00.000Z");

// 7. Le battement de 15 min mord des deux cotes.
const left = subtractBusy(slots, [{ start: new Date("2026-09-08T08:00:00Z"), end: new Date("2026-09-08T08:30:00Z") }], 15);
eq("battement retire 3 creneaux", slots.length - left.length, 3);

// 8. L'invitation contient bien l'echappement des points-virgules.
const ics = buildIcs({
  uid: "u1", start: new Date("2026-09-08T08:00:00Z"), end: new Date("2026-09-08T08:30:00Z"),
  summary: "Ora ; test, virgule", description: "ligne1\nligne2", location: "https://kmeet.infomaniak.com/x",
  organiser: { name: "R G", email: "a@b.c" }, attendee: { name: "V", email: "v@x.y" }, method: "REQUEST",
});
eq("ics echappe le ;", ics.includes("SUMMARY:Ora \\; test\\, virgule"), true);
eq("ics saut de ligne", ics.includes("DESCRIPTION:ligne1\\nligne2"), true);
eq("ics CRLF", ics.includes("\r\n"), true);

// 9. Le repliage a 75 octets se relit sans perte : c'est la ligne ATTENDEE,
// la plus longue, qui casserait l'adresse si le depliage etait faux.
const unfolded = ics.replace(/\r\n[ \t]/g, "");
eq("repliage reversible (attendee)", unfolded.includes("mailto:v@x.y"), true);
eq("aucune ligne > 75 octets", ics.split("\r\n").every((l) => Buffer.from(l, "utf8").length <= 75), true);

console.log(fails ? `\n${fails} ECHEC(S)` : "\nTout passe.");
process.exit(fails ? 1 : 0);
