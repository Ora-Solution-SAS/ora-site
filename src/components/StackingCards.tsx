import { ChevronDown, FileSpreadsheet, MoveRight, Play, Plus, Search, Send, Star, TriangleAlert } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";
import SurMesureMockup from "./SurMesureMockup";
import LocalSecurityMockup from "./LocalSecurityMockup";

/**
 * StackingCards — three product cards restyled after monday.com's AI cards
 * (client reference screenshots, 2026-07-24): one large light-grey rounded
 * card per feature, with
 *   • top-left: a chip strip (Ora icon chip → arrow → round tool chips + "+"),
 *     identical on every card, exactly like monday repeats its AI-logo strip,
 *   • bottom-left: big semibold heading + paragraph,
 *   • right: the product clip floating in its own rounded panel.
 *
 * The scroll mechanic is unchanged: each card is `position: sticky` pinned at
 * the same offset, so as the user scrolls each new card RISES UP and covers
 * the previous one (the monday behaviour the client asked for). Rendered as a
 * fragment so the sticky pinning is bounded by the `relative` wrapper in
 * App.tsx that also holds AtlasShowcase — once the deck is stacked, Atlas
 * rises over it.
 */

type Card = { tag: string; title: string; desc: string; video: string; visual?: "atlas" | "sur-mesure" | "local" };



// ── AtlasListMockup — static replica of the real Atlas screen ───────────────
// (client screenshot 2026-07-26: workbook header, filter pills, search, list
// of launchable automations). French-only like the other product mockups.
// It plays a one-shot ENTRANCE when it scrolls into view (see below); earlier
// scroll-scrubbed versions were rejected — tying the rise to scroll position
// made it creep along and read as a rendering glitch.
const ATLAS_ROWS = [
  {
    title: "Échantillonnage documenté",
    tag: "AUDIT",
    tagCls: "bg-sky-100 text-sky-700",
    playCls: "bg-sky-50 text-sky-500",
    desc: "Tirage aléatoire reproductible pour les tests de détail, graine affichée dans le rapport.",
  },
  {
    title: "Agréger des fichiers identiques",
    tag: "QUALITÉ",
    tagCls: "bg-emerald-100 text-emerald-700",
    playCls: "bg-emerald-50 text-emerald-500",
    desc: "Empile des fichiers de même structure en un seul tableau, avec la trace du fichier d'origine.",
  },
  {
    title: "Balance âgée 30/60/90",
    tag: "FINANCE",
    tagCls: "bg-violet-100 text-violet-700",
    playCls: "bg-violet-50 text-violet-500",
    desc: "Ventile les encours par ancienneté et par tiers à partir des échéances.",
  },
  {
    title: "Cadrage de TVA",
    tag: "FINANCE",
    tagCls: "bg-violet-100 text-violet-700",
    playCls: "bg-violet-50 text-violet-500",
    desc: "Vérifie HT + TVA = TTC et la cohérence des taux avec les taux standards.",
  },
  {
    title: "Lettrage automatique",
    tag: "FINANCE",
    tagCls: "bg-violet-100 text-violet-700",
    playCls: "bg-violet-50 text-violet-500",
    desc: "Apparie les écritures qui se soldent et attribue les lettres.",
  },
];

const ATLAS_PILLS = [
  { label: "Favoris", count: "0" },
  { label: "Qualité", count: "10" },
  { label: "Audit", count: "12" },
  { label: "Finance", count: "7" },
  { label: "Tout", count: "32", active: true },
];

function AtlasListMockup() {
  // ONE-SHOT ENTRANCE (client request 2026-07-26). Every scroll-scrubbed
  // version was rejected: binding the rise to scroll position makes it creep
  // at the reader's scrolling speed, which reads as a rendering glitch rather
  // than an effect. This fires once when the panel enters view and plays a
  // single fast, smooth motion regardless of how the user scrolls.
  //
  // Driven by a plain CSS transition rather than a JS animation loop: the
  // browser runs it on the compositor, so it stays perfectly smooth even while
  // the heavy scroll work on this page is busy. The curve is an expo-out
  // (0.16, 1, 0.3, 1) — most of the distance in the first third, then a glide
  // to rest: the "in one go, then settle" feel.
  const { ref, hidden, armed } = useEnterOnScroll<HTMLDivElement>();

  return (
    <div ref={ref} className="relative w-full lg:h-full">
      {/* The panel itself. A long, very soft curve (0.22, 1, 0.36, 1) over
          1.1s: it glides in and settles without any snap — the "arrives like
          butter" feel. Opacity resolves early so it is the MOTION that is
          noticed, not a fade. */}
      <div
        style={{
          transform: hidden ? "translate3d(0,84px,0) scale(0.985)" : "translate3d(0,0,0) scale(1)",
          opacity: hidden ? 0 : 1,
          filter: hidden ? "blur(6px)" : "blur(0px)",
          transition: armed
            ? "transform 1100ms cubic-bezier(0.22,1,0.36,1) 160ms, opacity 620ms cubic-bezier(0.22,1,0.36,1) 160ms, filter 800ms cubic-bezier(0.22,1,0.36,1) 160ms"
            : undefined,
          willChange: armed ? "transform, opacity, filter" : undefined,
        }}
        className="w-full lg:h-full flex flex-col rounded-[16px] md:rounded-[20px] overflow-hidden bg-white ring-1 ring-black/5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)] p-4 md:p-5"
      >
      {/* Workbook header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          </span>
          <div className="min-w-0">
            <div className="font-inter font-semibold text-[13px] text-[#111827] truncate">
              01_grand_livre_client_a_nettoyer
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10.5px] font-inter">
              <span className="font-semibold text-gray-400">XLSX</span>
              <span className="inline-flex items-center gap-1 text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                En cours
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                <TriangleAlert className="h-2.5 w-2.5" />
                Modifications demandées
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 font-inter text-[11px] font-medium text-gray-600">
            Exporter en PDF
            <ChevronDown className="h-3 w-3" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-1.5 font-inter text-[11px] font-semibold text-white">
            <Send className="h-3 w-3" />
            Envoyer
          </span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="mt-3.5 flex items-center gap-1.5 overflow-hidden">
        {ATLAS_PILLS.map((p) => (
          <span
            key={p.label}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-[11px] font-medium ${
              p.active ? "bg-[#111827] text-white" : "border border-gray-200 text-gray-600"
            }`}
          >
            {p.label}
            <span className={p.active ? "text-gray-300" : "text-gray-400"}>{p.count}</span>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="mt-2.5 flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3">
        <Search className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-inter text-[12px] text-gray-400">Rechercher une automatisation...</span>
      </div>

      {/* Automation rows — spread over the remaining height so the panel fills
          the card like the reference, instead of leaving a gap at the bottom. */}
      <div className="mt-2.5 flex-1 flex flex-col justify-between gap-2">
        {ATLAS_ROWS.map((r) => (
          <div
            key={r.title}
            className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${r.playCls}`}>
              <Play className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-inter font-semibold text-[12.5px] text-[#111827] truncate">{r.title}</span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 font-inter text-[8.5px] font-bold tracking-wide ${r.tagCls}`}>
                  {r.tag}
                </span>
              </div>
              <div className="mt-0.5 font-inter text-[11px] text-gray-500 truncate">{r.desc}</div>
            </div>
            <Star className="h-3.5 w-3.5 shrink-0 text-gray-300" />
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-200 px-2 py-1 font-inter text-[11px] font-semibold text-blue-600">
              <Play className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
              Lancer
            </span>
          </div>
        ))}
        </div>
      </div>

      {/* ── Floating "running automation" pill, monday-style: a logo bubble +
          one line naming the job Ora is doing. Sits OUTSIDE the panel (hence
          the wrapper is not clipped) and lands a beat after it. Carries the
          message of the whole section: the repetitive work runs by itself. */}
      <div
        aria-hidden
        style={{
          transform: hidden ? "translate3d(0,26px,0) scale(0.94)" : "translate3d(0,0,0) scale(1)",
          opacity: hidden ? 0 : 1,
          transition: armed
            ? "transform 900ms cubic-bezier(0.22,1,0.36,1) 520ms, opacity 600ms cubic-bezier(0.22,1,0.36,1) 520ms"
            : undefined,
          willChange: armed ? "transform, opacity" : undefined,
        }}
        className="pointer-events-none absolute -left-6 md:-left-16 bottom-6 md:bottom-9 z-10 flex items-center gap-3 rounded-full bg-white pl-2 pr-5 py-2 shadow-[0_18px_44px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.04]"
      >
        <span className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/[0.05]">
          <img src="/logos/icon-color.png" alt="" className="h-5 w-auto md:h-6" />
        </span>
        <span className="font-inter font-medium text-[12.5px] md:text-[14px] text-[#111827] whitespace-nowrap">
          Lettrage de 12 480 écritures
        </span>
      </div>

      {/* Cursor, like the reference — same shape as the other Ora mockups. */}
      <svg
        aria-hidden
        viewBox="0 0 32 32"
        style={{
          opacity: hidden ? 0 : 1,
          transform: hidden ? "translate3d(0,18px,0)" : "translate3d(0,0,0)",
          transition: armed
            ? "transform 900ms cubic-bezier(0.22,1,0.36,1) 620ms, opacity 500ms cubic-bezier(0.22,1,0.36,1) 620ms"
            : undefined,
        }}
        className="pointer-events-none absolute left-12 md:left-16 bottom-[4.2rem] md:bottom-[5.4rem] z-20 h-9 w-9 md:h-11 md:w-11 drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
      >
        <path
          d="M9 4 L9 27 L14.6 21.6 L18 29.4 L22.4 27.4 L19 19.8 L26.6 19.8 Z"
          fill="#0b0b0f"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// The chip strip: the FILE FORMATS Ora chains end-to-end (extract from PDF →
// rework in Excel → format the deliverable). Same strip on all three cards,
// exactly like monday repeats its AI-logo strip on every card. Logo images
// supplied by the client (public/filetypes/, 2026-07-26).
// The Excel file has more white padding baked into the image than the others,
// so it gets a larger render size to look optically equal.
const FILE_CHIPS = [
  { src: "/filetypes/excel.jpg", alt: "Excel", imgCls: "h-10 w-10 md:h-11 md:w-11" },
  { src: "/filetypes/powerpoint.jpg", alt: "PowerPoint", imgCls: "h-8 w-8 md:h-9 md:w-9" },
  { src: "/filetypes/pdf.jpg", alt: "PDF", imgCls: "h-8 w-8 md:h-9 md:w-9" },
  { src: "/filetypes/csv.png", alt: "CSV", imgCls: "h-8 w-8 md:h-9 md:w-9" },
];

/** File-format chip row. `withOrigin` prepends the Ora chip + arrow (used on
 *  the cards; the monday-style header above uses the bare chips row). */
export function FileChipStrip({ withOrigin = false }: { withOrigin?: boolean }) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {withOrigin && (
        <>
          <span className="flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white dark:bg-white/[0.09] ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-sm">
            <img src="/logos/icon-color.png" alt="" aria-hidden className="h-5 w-auto md:h-6" />
          </span>
          <MoveRight className="h-6 w-6 shrink-0 text-gray-900 dark:text-white" strokeWidth={1.5} />
        </>
      )}
      <div className="flex -space-x-1.5">
        {FILE_CHIPS.map((c) => (
          <span
            key={c.alt}
            // Chips stay WHITE in dark mode too: the logo files are JPGs on a
            // white background, so a white chip makes them blend seamlessly.
            className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center overflow-hidden rounded-full bg-white dark:bg-white ring-1 ring-black/[0.06] dark:ring-white/[0.12] shadow-sm"
          >
            <img src={c.src} alt={c.alt} className={`${c.imgCls} object-contain`} />
          </span>
        ))}
        <span className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/70 dark:bg-white/[0.05] ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
          <Plus className="h-[18px] w-[18px] text-gray-500 dark:text-gray-400" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}

// One pastel blue per card (client request: keep the "different blues"): as
// each card fully covers the previous one, the change of shade signals the
// new card. Full literal strings so Tailwind's JIT can extract them.
const CARD_BGS = [
  // Card 0 — azure
  "bg-gradient-to-br from-[#eef5ff] via-[#ddebfe] to-[#c6dcf9] dark:from-[#0c1830] dark:via-[#0f1d3a] dark:to-[#14264a]",
  // Card 1 — periwinkle
  "bg-gradient-to-br from-[#eef1ff] via-[#dfe4fd] to-[#c5cffa] dark:from-[#0d162e] dark:via-[#131d3f] dark:to-[#1b2a58]",
  // Card 2 — cyan
  "bg-gradient-to-br from-[#f0faff] via-[#def3fe] to-[#c6e9fb] dark:from-[#0a1a2e] dark:via-[#0e2340] dark:to-[#143152]",
];

export default function StackingCards() {
  const { t } = useLang();

  const cards: Card[] = [
    {
      tag: t({ fr: "Automatisation", en: "Automation" }),
      title: t({ fr: "Automatisez ce qui vous fait perdre du temps", en: "Automate what's eating your time" }),
      desc: t({
        fr: "Vos tâches Excel répétitives, exécutées en un clic. Concentrez-vous sur l'analyse, plus sur la saisie.",
        en: "Your repetitive Excel tasks, executed in one click. Focus on analysis, not data entry.",
      }),
      video: "/ora_story3-v2.mp4",
      visual: "atlas",
    },
    {
      tag: t({ fr: "Sur-mesure", en: "Tailored" }),
      title: t({ fr: "Conçu pour votre métier, pas pour tout le monde", en: "Built for your business, not for everyone" }),
      desc: t({
        fr: "Vous nous décrivez votre processus, on l'automatise à l'identique, le tout livré en quelques jours. Pas de template générique, pas de mois d'attente.",
        en: "You describe your workflow, we automate it exactly as it is, delivered in days. No generic templates, no months of waiting.",
      }),
      video: "/ora_story4-v2.mp4",
      visual: "sur-mesure",
    },
    {
      tag: t({ fr: "Local & sécurisé", en: "Local & secure" }),
      title: t({ fr: "Vos données restent chez vous", en: "Your data stays with you" }),
      desc: t({
        fr: "Le traitement s'exécute en local, sur votre machine. Vos fichiers sont chiffrés sur votre appareil avant tout envoi, puis stockés en Suisse, illisibles sur nos serveurs.",
        en: "Processing runs locally, on your machine. Your files are encrypted on your device before anything is sent, then stored in Switzerland, unreadable on our servers.",
      }),
      video: "/feature-secure.mp4",
      visual: "local",
    },
  ];

  return (
    <>
      {cards.map((c, i) => (
        <StackCard key={i} card={c} index={i} />
      ))}
    </>
  );
}

/** One pinned card. */
function StackCard({ card: c, index: i }: { card: Card; index: number }) {
  return (
    <div
      // Desktop: every card pins at the SAME centered position, so each one
      // rises up and FULLY covers the previous (monday-style). Mobile:
      // normal stacked flow (the var is unused).
      className="relative md:sticky md:top-[var(--st-top)] md:z-10 px-4 md:px-6 lg:px-10 pb-8 md:pb-[42vh]"
      // Half the card height, so the pinned card sits centred on screen.
      style={{ ["--st-top" as string]: "calc(50vh - 310px)" }}
    >
      {/* Proportions traced from the monday reference (client, 2026-07-26):
          card aspect ≈ 2.44:1, padding ≈ 3.3% of width, text column ≈ 45% and
          visual ≈ 52% of the content width, visual ≈ 90% of the card height. */}
      <div className={`w-full max-w-[1480px] mx-auto rounded-[28px] md:rounded-[32px] overflow-hidden ${CARD_BGS[i % CARD_BGS.length]} ring-1 ring-black/[0.04] dark:ring-white/[0.07] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] md:h-[620px] p-6 md:p-8 lg:p-10 flex flex-col`}>
        {/* Chip strip — top-left, identical on every card */}
        <FileChipStrip withOrigin />

        {/* Body: text bottom-left, visual right */}
        {/* `items-stretch` so the visual fills the card height like the
            reference, instead of floating centred in the middle. */}
        <div className="mt-7 md:mt-4 flex-1 min-h-0 grid lg:grid-cols-[1fr_1.55fr] gap-8 lg:gap-6 lg:items-stretch">
          <div className="flex flex-col justify-end h-full pb-1 max-lg:order-last">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
              {c.tag}
            </span>
            <h3 className="font-poppins font-semibold text-[1.9rem] md:text-[2.4rem] lg:text-[2.7rem] leading-[1.08] tracking-[-0.03em] text-[#111827] dark:text-white mt-3 max-w-md">
              {c.title}
            </h3>
            <p className="font-inter mt-5 text-[15.5px] md:text-[17px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-md">
              {c.desc}
            </p>
          </div>

          {/* Product visual — floating rounded panel, like monday's mockups.
              Card 1 shows the Atlas replica (lagging in on scroll); the
              others keep their demo clip. */}
          {/* The Sur-mesure composition is sized by its aspect-ratio against
              the row height, so widening the grid column alone does nothing:
              it bleeds into the card padding instead (top/bottom/right) to
              gain real estate. The Atlas panel keeps its margins — it is a
              floating card and would look broken flush to the edges. */}
          <div
            className={`flex items-center lg:items-stretch${
              c.visual === "sur-mesure" || c.visual === "local" ? " lg:-my-10 lg:-mr-10" : ""
            }`}
          >
            {c.visual === "atlas" ? (
              <AtlasListMockup />
            ) : c.visual === "sur-mesure" ? (
              // Orchestrates its own staged entrance (see SurMesureMockup).
              <SurMesureMockup />
            ) : c.visual === "local" ? (
              <LocalSecurityMockup />
            ) : (
              <div className="w-full lg:h-full rounded-[16px] md:rounded-[20px] overflow-hidden bg-[#0a0f1c] ring-1 ring-black/5 dark:ring-white/10 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)]">
                <video
                  src={c.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video lg:aspect-auto lg:h-full object-cover block"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
