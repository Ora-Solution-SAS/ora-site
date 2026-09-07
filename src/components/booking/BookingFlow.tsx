import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Loader2, Video } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { BOOKING_ENABLED } from "./bookingEnabled";
import OraLogoSpinner from "../OraLogoSpinner";
import { ContactDirect } from "../SlotPicker";
import {
  BookingError,
  book,
  fetchAvailability,
  groupByDay,
  guestTimeZone,
  type Availability,
  type Slot,
} from "./bookingApi";

/**
 * BookingFlow — la prise de rendez-vous, chez nous.
 *
 * Remplace l'embed Cal.com (2026-09-07). Trois écrans dans une seule fenêtre :
 * un mois, les heures du jour choisi, puis le formulaire.
 *
 * ══ CE QUI DIFFÈRE DU SÉLECTEUR RETIRÉ LE 2026-09-05 ═══════════════════════
 * L'ancien (SlotPicker.tsx, supprimé) tirait l'ouverture d'un jour d'un hash de
 * sa date : il INVENTAIT sa disponibilité, puis passait la main à Cal.com qui
 * en affichait une autre. Le client l'a renvoyé, à raison, et le fichier porte
 * encore la consigne « ne pas ressusciter sans brancher la VRAIE disponibilité ».
 * Ici :
 *   · les créneaux viennent de `/api/availability`, qui lit l'agenda Infomaniak
 *     en CalDAV. Aucun horaire n'est fabriqué côté navigateur ;
 *   · il n'y a plus DEUX calendriers à la suite, donc plus de contradiction
 *     possible : celui-ci est le seul, et il va jusqu'à la confirmation ;
 *   · quand le service tourne sans agenda branché, il le déclare (`mock`) et
 *     cet écran l'affiche en toutes lettres au lieu de faire semblant.
 *
 * ══ POURQUOI L'HEURE EST CHOISIE ICI ET PAS AILLEURS ═══════════════════════
 * L'autre grief de 2026-09-05 était de faire choisir l'heure DEUX FOIS, l'embed
 * ne sachant pas reprendre le créneau déjà cliqué. Le formulaire est désormais
 * dans la même fenêtre et reçoit l'instant exact : un seul choix, une seule
 * confirmation.
 */

/**
 * ── L'INTERRUPTEUR DE LA RÉSERVATION EN LIGNE ───────────────────────────────
 * Client 2026-09-07 : « peux-tu push le site sans la possibilité de prendre un
 * rendez-vous pour l'instant ». Le reste du travail (responsive, disponibilité
 * des plateformes) doit partir en ligne ; le calendrier attend que les
 * identifiants Infomaniak soient posés dans Vercel.
 *
 * ⚠ FERMÉ PAR DÉFAUT, et l'inversion est délibérée. Un drapeau qu'il faut
 * poser pour DÉSACTIVER laisse la réservation ouverte partout où l'on a oublié
 * de le poser, c'est-à-dire précisément là où les identifiants manquent aussi :
 * la page tomberait alors sur le mode démonstration et afficherait des horaires
 * inventés. Il faut donc une décision explicite pour ouvrir.
 *
 * ⚠ CE N'EST PAS LA SEULE PROTECTION, et il ne faut pas s'y fier seule : Vite
 * fige `import.meta.env` à la COMPILATION, donc ce drapeau ne vaut que pour le
 * paquet déjà construit. La garantie dure est côté serveur, dans
 * api/availability.ts, qui refuse de fabriquer une disponibilité quand
 * `VERCEL_ENV` vaut « production ».
 *
 * POUR OUVRIR : poser `VITE_BOOKING_ENABLED=true` dans Vercel (les trois
 * environnements) EN MÊME TEMPS que les identifiants CalDAV, puis redéployer.
 * Un changement de variable ne prend effet qu'au déploiement suivant.
 */
type Phase = "pick" | "form" | "done";

/** Les jours d'un mois, alignés sur une grille commençant le lundi. */
function monthGrid(year: number, month: number): Array<string | null> {
  const first = new Date(Date.UTC(year, month, 1));
  // getUTCDay() rend 0 pour dimanche ; la grille française commence le lundi.
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<string | null> = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default function BookingFlow({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang();
  const tz = useMemo(() => guestTimeZone(), []);
  const locale = lang === "fr" ? "fr-FR" : "en-GB";

  const [avail, setAvail] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState<"calendar_unavailable" | "network" | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", notes: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ meetingUrl: string; start: string; mailed: boolean } | null>(null);

  const slotsPanelRef = useRef<HTMLDivElement>(null);

  /* ── Chargement de la disponibilité ───────────────────────────────────────
     `BOOKING_ENABLED` est lu AVANT l'appel : fermée, la fenêtre ne doit pas
     même interroger le service, sinon un journal de production se remplit
     d'appels qui n'aboutiront jamais. */
  useEffect(() => {
    if (!BOOKING_ENABLED) return;
    const ac = new AbortController();
    fetchAvailability(ac.signal)
      .then(setAvail)
      .catch((err) => {
        if ((err as Error)?.name === "AbortError") return;
        setLoadError(err instanceof BookingError && err.code === "network" ? "network" : "calendar_unavailable");
      });
    return () => ac.abort();
  }, []);

  const byDay = useMemo(() => (avail ? groupByDay(avail.slots, tz) : new Map<string, Slot[]>()), [avail, tz]);

  /* Le premier jour ouvert est présélectionné : sur un agenda clairsemé, une
     grille où il faut deviner quelle case cliquer coûte un abandon. */
  useEffect(() => {
    if (!avail || day) return;
    const first = [...byDay.keys()].sort()[0];
    if (!first) return;
    setDay(first);
    const [y, m] = first.split("-").map(Number);
    setCursor({ year: y, month: m - 1 });
  }, [avail, byDay, day]);

  const daySlots = day ? (byDay.get(day) ?? []) : [];

  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);

  /* Bornes de navigation : on ne feuillette pas au-delà de ce que l'agenda
     couvre, un mois vide ne se distinguerait pas d'un mois complet. */
  const monthsWithSlots = useMemo(() => new Set([...byDay.keys()].map((k) => k.slice(0, 7))), [byDay]);
  const sortedMonths = useMemo(() => [...monthsWithSlots].sort(), [monthsWithSlots]);
  const here = monthKey(cursor.year, cursor.month);
  const canPrev = sortedMonths.some((m) => m < here);
  const canNext = sortedMonths.some((m) => m > here);

  const step = useCallback((dir: -1 | 1) => {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + dir, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }, []);

  const fmtTime = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(
        new Date(iso),
      ),
    [locale, tz],
  );

  const fmtLongDate = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(
        new Date(iso),
      ),
    [locale, tz],
  );

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!slot || submitting) return;
      setSubmitting(true);
      setFormError(null);
      try {
        const r = await book({
          start: slot.start,
          name: form.name,
          email: form.email,
          company: form.company || undefined,
          phone: form.phone || undefined,
          notes: form.notes || undefined,
          website: form.website,
          timeZone: tz,
          lang,
        });
        setResult({ meetingUrl: r.meetingUrl, start: r.start, mailed: r.mailed });
        setPhase("done");
      } catch (err) {
        const code = err instanceof BookingError ? err.code : "network";
        setFormError(
          {
            slot_taken: t({
              fr: "Ce créneau vient d'être pris. Choisissez-en un autre.",
              en: "That slot was just taken. Please pick another.",
            }),
            slot_out_of_window: t({
              fr: "Ce créneau n'est plus proposable. Revenez au calendrier.",
              en: "That slot is no longer bookable. Go back to the calendar.",
            }),
            invalid_email: t({ fr: "Cette adresse e-mail n'est pas valide.", en: "That email address is not valid." }),
            invalid_name: t({ fr: "Merci d'indiquer votre nom.", en: "Please enter your name." }),
            not_configured: t({
              fr: "La réservation en ligne n'est pas encore active. Écrivez-nous, on répond sous 24 h ouvrées.",
              en: "Online booking is not live yet. Write to us, we reply within one business day.",
            }),
          }[code as string] ??
            t({
              fr: "La réservation n'a pas abouti. Réessayez, ou écrivez-nous.",
              en: "The booking did not go through. Try again, or write to us.",
            }),
        );
        // Un créneau pris entre-temps : on recharge pour que la grille dise vrai.
        if (code === "slot_taken" || code === "slot_out_of_window") {
          fetchAvailability().then(setAvail).catch(() => undefined);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [slot, submitting, form, tz, lang, t],
  );

  /* ── États d'attente et d'erreur ────────────────────────────────────────── */

  /* Réservation fermée : on le dit, et on donne le seul chemin qui marche.
     Pas de calendrier grisé, pas de « bientôt » sans suite : celui qui a
     cliqué « Réserver un appel » veut parler à quelqu'un, il doit repartir
     avec un moyen de le faire. */
  if (!BOOKING_ENABLED) {
    return (
      <Shell escape>
        {/* `pr-12` : le bouton de fermeture de la fenêtre est posé en absolu
            au-dessus de ce coin. Sans réserve, il rognait la fin du titre. */}
        <p className="pr-12 font-instrument text-[1.35rem] leading-[1.2] tracking-[-0.02em] text-[#111827] md:text-[1.5rem]">
          {t({
            fr: "La prise de rendez-vous en ligne ouvre très bientôt.",
            en: "Online booking opens very soon.",
          })}
        </p>
        <p className="mt-3 font-inter text-[14.5px] leading-relaxed text-[#5b6577]">
          {t({
            fr: "En attendant, écrivez-nous en un clic : le message est déjà rédigé, il ne manque que vos disponibilités. Réponse sous 24 h ouvrées.",
            en: "In the meantime, write to us in one click: the message is already drafted, only your availability is missing. Reply within one business day.",
          })}
        </p>
      </Shell>
    );
  }

  if (loadError) {
    return (
      <Shell escape>
        <p className="font-instrument text-[1.3rem] leading-[1.2] tracking-[-0.02em] text-[#111827]">
          {t({ fr: "L'agenda ne répond pas.", en: "The calendar is not responding." })}
        </p>
        <p className="mt-3 font-inter text-[14px] leading-relaxed text-[#5b6577]">
          {t({
            fr: "Plutôt que de vous proposer des horaires qui pourraient être faux, on préfère ne rien afficher. Écrivez-nous, on vous répond sous 24 h ouvrées.",
            en: "Rather than offer times that might be wrong, we would rather show nothing. Write to us and we will reply within one business day.",
          })}
        </p>
      </Shell>
    );
  }

  if (!avail) {
    return (
      <Shell escape>
        <div className="flex flex-col items-center justify-center py-16">
          <OraLogoSpinner gradientId="g-booking-flow" size={56} />
          <p className="mt-5 font-inter text-[13.5px] text-[#5b6577]">
            {t({ fr: "Lecture de l'agenda...", en: "Reading the calendar..." })}
          </p>
        </div>
      </Shell>
    );
  }

  /* ── Écran 3 : c'est réservé ────────────────────────────────────────────── */
  if (phase === "done" && result) {
    return (
      <Shell>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6]/10">
          <Check className="h-5 w-5 text-[#3b82f6]" strokeWidth={2.4} aria-hidden />
        </div>
        <p className="mt-5 font-instrument text-[1.5rem] leading-[1.15] tracking-[-0.025em] text-[#111827]">
          {t({ fr: "C'est réservé.", en: "You are booked." })}
        </p>
        <p className="mt-2 font-inter text-[15px] leading-relaxed text-[#42506b]">
          {fmtLongDate(result.start)}, {fmtTime(result.start)}
        </p>
        <p className="mt-1 font-inter text-[12.5px] text-[#6b7688]">{tz}</p>

        <a
          href={result.meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-6 py-3 font-inter text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-[#2563eb]"
        >
          <Video className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t({ fr: "Le lien de l'appel", en: "The call link" })}
        </a>

        <p className="mt-5 font-inter text-[13.5px] leading-relaxed text-[#5b6577]">
          {result.mailed
            ? t({
                fr: "Une confirmation vient de partir vers votre boîte, avec l'invitation à ajouter à votre agenda.",
                en: "A confirmation is on its way, with the invitation to add to your calendar.",
              })
            : t({
                fr: "Le rendez-vous est posé dans l'agenda. Notez le lien ci-dessus : l'envoi du courriel de confirmation n'a pas abouti.",
                en: "The meeting is in the calendar. Keep the link above: the confirmation email did not go out.",
              })}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 font-inter text-[14px] font-semibold text-[#3b82f6] transition-colors hover:text-[#2563eb]"
        >
          {t({ fr: "Fermer", en: "Close" })}
        </button>
      </Shell>
    );
  }

  /* ── Écran 2 : le formulaire ────────────────────────────────────────────── */
  if (phase === "form" && slot) {
    return (
      <Shell>
        <button
          type="button"
          onClick={() => { setPhase("pick"); setFormError(null); }}
          className="-ml-1 inline-flex items-center gap-1.5 font-inter text-[13.5px] font-medium text-[#5b6577] transition-colors hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t({ fr: "Changer de créneau", en: "Change the slot" })}
        </button>

        <p className="mt-4 rounded-[12px] bg-[#fcfbf7] px-4 py-3 font-inter text-[14.5px] font-semibold text-[#111827]">
          {fmtLongDate(slot.start)}, {fmtTime(slot.start)}
          <span className="ml-2 font-normal text-[#6b7688]">
            {avail.durationMinutes} {t({ fr: "min", en: "min" })}
          </span>
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3.5">
          <Field
            label={t({ fr: "Votre nom", en: "Your name" })}
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            required
            autoComplete="name"
          />
          <Field
            label={t({ fr: "E-mail professionnel", en: "Work email" })}
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
            type="email"
            autoComplete="email"
          />
          <Field
            label={t({ fr: "Cabinet ou société", en: "Firm or company" })}
            value={form.company}
            onChange={(v) => setForm((f) => ({ ...f, company: v }))}
            autoComplete="organization"
          />
          <Field
            label={t({ fr: "Téléphone (facultatif)", en: "Phone (optional)" })}
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            type="tel"
            autoComplete="tel"
          />
          <Field
            label={t({ fr: "Ce que vous aimeriez automatiser", en: "What you would like to automate" })}
            value={form.notes}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            textarea
          />

          {/* Piège à robots : hors flux et hors tabulation, invisible pour un
              lecteur d'écran grâce à aria-hidden. Un automate qui remplit tous
              les champs se signale tout seul. */}
          <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              />
            </label>
          </div>

          {/* Le bandeau est REPETE ICI, et ce n'est pas un oubli : le bouton
              de confirmation est inerte en mode demonstration, et l'avoir
              explique deux ecrans plus tot ne suffit pas. Une commande grisee
              sans raison visible se lit comme une panne. */}
          {avail.mock && <MockBanner />}

          {formError && (
            <p role="alert" className="rounded-[10px] bg-[#fef2f2] px-3.5 py-2.5 font-inter text-[13.5px] leading-snug text-[#b91c1c]">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || avail.mock}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-6 py-3.5 font-inter text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t({ fr: "Enregistrement...", en: "Booking..." })}
              </>
            ) : (
              <>
                {t({ fr: "Confirmer le rendez-vous", en: "Confirm the meeting" })}
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </>
            )}
          </button>

          <p className="text-center font-inter text-[12px] leading-tight text-[#6b7688]">
            {t({
              fr: "Visio kMeet, hébergée en Suisse. Vos coordonnées ne servent qu'à cet appel.",
              en: "kMeet video call, hosted in Switzerland. Your details are used for this call only.",
            })}
          </p>
        </form>
      </Shell>
    );
  }

  /* ── Écran 1 : le mois et les heures ────────────────────────────────────── */
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(cursor.year, cursor.month, 1)),
  );
  const weekdayLabels = weekdayInitials(locale);
  const empty = avail.slots.length === 0;

  return (
    <Shell escape>
      {avail.mock && <MockBanner />}

      {empty ? (
        <p className="py-10 text-center font-inter text-[14.5px] leading-relaxed text-[#5b6577]">
          {t({
            fr: "Aucun créneau ouvert pour l'instant. Écrivez-nous, on vous propose une date sous 24 h ouvrées.",
            en: "No open slot right now. Write to us and we will offer a date within one business day.",
          })}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="font-inter text-[15px] font-semibold text-[#111827] first-letter:uppercase">{monthLabel}</p>
            <div className="flex items-center gap-1">
              <NavButton
                onClick={() => step(-1)}
                disabled={!canPrev}
                label={t({ fr: "Mois précédent", en: "Previous month" })}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </NavButton>
              <NavButton
                onClick={() => step(1)}
                disabled={!canNext}
                label={t({ fr: "Mois suivant", en: "Next month" })}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </NavButton>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {weekdayLabels.map((w, i) => (
              <div key={i} className="pb-1 text-center font-inter text-[11px] font-semibold uppercase tracking-wide text-[#6b7688]">
                {w}
              </div>
            ))}
            {cells.map((key, i) => {
              if (!key) return <div key={`x${i}`} />;
              const open = byDay.has(key);
              const on = key === day;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!open}
                  onClick={() => {
                    setDay(key);
                    setSlot(null);
                    // Sur téléphone la liste des heures tombe sous le pli : on
                    // l'amène à l'oeil, sinon le clic sur un jour n'a l'air de
                    // rien faire.
                    requestAnimationFrame(() =>
                      slotsPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
                    );
                  }}
                  aria-pressed={on}
                  className={`flex h-10 items-center justify-center rounded-[10px] font-inter text-[14px] transition-colors duration-150 ${
                    on
                      ? "bg-[#111827] font-semibold text-white"
                      : open
                        ? "bg-[#f1f5fd] font-medium text-[#1d4ed8] hover:bg-[#e2ebfb]"
                        : "cursor-not-allowed font-normal text-[#c8cedb]"
                  }`}
                >
                  {Number(key.slice(8))}
                </button>
              );
            })}
          </div>

          <div ref={slotsPanelRef} className="mt-6 border-t border-[#0a2540]/[0.08] pt-5">
            {day && (
              <>
                <p className="font-inter text-[13.5px] font-semibold text-[#111827] first-letter:uppercase">
                  {new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(
                    new Date(`${day}T12:00:00Z`),
                  )}
                </p>
                <p className="mt-0.5 font-inter text-[12px] text-[#6b7688]">
                  {tz} &middot; {avail.durationMinutes} min
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {daySlots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => {
                        setSlot(s);
                        setPhase("form");
                      }}
                      className="rounded-[10px] border border-[#0a2540]/[0.14] py-2.5 font-inter text-[14px] font-medium text-[#42506b] transition-colors duration-150 hover:border-[#3b82f6] hover:bg-[#3b82f6] hover:text-white"
                    >
                      {fmtTime(s.start)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}

/* ── Pièces ─────────────────────────────────────────────────────────────────── */

/**
 * La coque commune aux quatre écrans.
 *
 * `escape` porte la sortie de secours « aucune date ne me convient ». Elle est
 * montée sur les écrans où l'on CHERCHE une date (le calendrier, l'attente,
 * l'agenda injoignable) et retirée sur la confirmation : proposer d'écrire à
 * quelqu'un avec qui on vient de prendre rendez-vous n'a pas de sens, et
 * fabrique un doute là où l'on vient de rassurer.
 */
function Shell({ children, escape = false }: { children: React.ReactNode; escape?: boolean }) {
  return (
    <div className="relative p-5 md:p-7">
      {children}
      {escape && <ContactDirect />}
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[#42506b] transition-colors duration-150 hover:bg-[#0a2540]/[0.05] disabled:cursor-not-allowed disabled:text-[#c8cedb] disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

/**
 * ⚠ CE BANDEAU NE DOIT JAMAIS APPARAÎTRE EN LIGNE. Il ne s'affiche que si le
 * service répond `mock: true`, c'est-à-dire si aucun identifiant CalDAV n'est
 * configuré. Le voir sur ora-solution.com veut dire que les variables
 * d'environnement Vercel manquent, pas que le composant est cassé.
 */
function MockBanner() {
  const { t } = useLang();
  return (
    <p className="mb-5 rounded-[10px] border border-[#f59e0b]/40 bg-[#fffbeb] px-3.5 py-2.5 font-inter text-[12.5px] leading-snug text-[#92400e]">
      {t({
        fr: "Mode démonstration : ces horaires sont fabriqués, l'agenda n'est pas branché. Aucune réservation ne sera enregistrée.",
        en: "Demo mode: these times are made up, the calendar is not connected. No booking will be recorded.",
      })}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  textarea,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const cls =
    "mt-1 w-full rounded-[10px] border border-[#0a2540]/[0.14] bg-white px-3.5 py-2.5 font-inter text-[15px] text-[#111827] outline-none transition-colors duration-150 placeholder:text-[#9aa4b5] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20";
  return (
    <label className="block">
      <span className="font-inter text-[13px] font-medium text-[#42506b]">
        {label}
        {required && <span className="text-[#3b82f6]"> *</span>}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: 16 }}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          /* 16 px minimum sur les champs : sous cette taille, iOS zoome tout
             seul au focus et ne dezoome jamais. Le `text-[15px]` de `cls` est
             donc surcharge ici, et nulle part ailleurs. */
          style={{ fontSize: 16 }}
          className={cls}
        />
      )}
    </label>
  );
}

/** Les initiales des jours, dans la langue courante, semaine commençant lundi. */
function weekdayInitials(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const out: string[] = [];
  // 2026-01-05 est un lundi : sept jours d'affilée à partir de là donnent la
  // semaine dans le bon ordre, quelle que soit la locale.
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2026, 0, 5 + i));
    out.push(fmt.format(d).replace(/\.$/, "").slice(0, 3));
  }
  return out;
}
