import { useLang } from "@/lib/i18n";

/**
 * StackingCards — three product cards in the FEC-Studio split-card style
 * (light-blue gradient text panel + rich-blue video panel), presented as a
 * rise-and-superimpose stack: each card is `position: sticky` with a slightly
 * larger top offset than the previous, so as the user scrolls each new card
 * rises up and covers the one before it (leaving a thin sliver behind) — the
 * same "slide over" feel as the FEC Studio card.
 *
 * Rendered as a fragment (no wrapping bounding box) so the sticky pinning is
 * bounded by the `relative` wrapper in App.tsx that also holds AtlasShowcase —
 * once the deck is stacked, Atlas rises up over it.
 */

type Card = { tag: string; title: string; desc: string; video: string };

// One slightly different light-blue gradient per card, so that as each card
// FULLY covers the previous one, the change of shade still reads as a distinct
// new card (progressively a touch deeper blue). Full literal strings so
// Tailwind's JIT can extract them.
// All blue (no violet). Card 0 and card 2 are swapped vs before; the middle
// card takes the WeTransfer periwinkle-BLUE from the reference screenshot.
const TEXT_GRADIENTS = [
  // Card 0 — azure
  "from-[#eef5ff] via-[#d5e6fd] to-[#b3d0f6]",
  // Card 1 — WeTransfer periwinkle-blue
  "from-[#eef1ff] via-[#ccd6fb] to-[#93a6f1]",
  // Card 2 — cyan-blue
  "from-[#f0faff] via-[#d6effc] to-[#b6e2f7]",
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
    },
    {
      tag: t({ fr: "Sur-mesure", en: "Tailored" }),
      title: t({ fr: "Conçu pour votre métier, pas pour tout le monde", en: "Built for your business, not for everyone" }),
      desc: t({
        fr: "Vous nous décrivez votre processus, on l'automatise à l'identique, le tout livré en quelques jours. Pas de template générique, pas de mois d'attente.",
        en: "You describe your workflow, we automate it exactly as it is, delivered in days. No generic templates, no months of waiting.",
      }),
      video: "/ora_story4-v2.mp4",
    },
    {
      tag: t({ fr: "Local & sécurisé", en: "Local & secure" }),
      title: t({ fr: "Vos données restent chez vous", en: "Your data stays with you" }),
      desc: t({
        fr: "Le traitement s'exécute en local, sur votre machine. Vos fichiers sont chiffrés sur votre appareil avant tout envoi, puis stockés en Suisse, illisibles sur nos serveurs.",
        en: "Processing runs locally, on your machine. Your files are encrypted on your device before anything is sent, then stored in Switzerland, unreadable on our servers.",
      }),
      video: "/feature-secure.mp4",
    },
  ];

  return (
    <>
      {cards.map((c, i) => (
        <div
          key={i}
          // Desktop: every card pins at the SAME centered position, so each one
          // rises up and FULLY covers the previous. The slightly different blue
          // per card is what signals a new card has arrived. Mobile: normal
          // stacked flow (the var is unused).
          // Padding OUTSIDE the max-w-7xl so every card has the same width.
          className="relative md:sticky md:top-[var(--st-top)] px-6 lg:px-10 pb-8 md:pb-[42vh]"
          style={{ ["--st-top" as string]: "calc(50vh - 14rem)" }}
        >
          <div className="grid lg:grid-cols-[1.45fr_1fr] md:h-[470px] w-full max-w-7xl mx-auto rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,23,42,0.3)] bg-white dark:bg-[#0c1830]">
            {/* TEXT panel — a slightly different light-blue gradient per card. */}
            <div className={`bg-gradient-to-br ${TEXT_GRADIENTS[i % TEXT_GRADIENTS.length]} dark:from-[#0c1830] dark:via-[#0f1d3a] dark:to-[#1c3360] p-8 md:p-14 lg:p-16 flex flex-col justify-center min-h-[380px] md:min-h-0 md:h-full`}>
              <span className="inline-flex w-fit items-center rounded-full border border-blue-300/70 dark:border-blue-400/30 bg-white/60 dark:bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-300">
                {c.tag}
              </span>
              <h3 className="font-poppins font-normal text-[1.9rem] md:text-[2.5rem] leading-[1.1] tracking-[-0.03em] text-[#111827] dark:text-white mt-6">
                {c.title}
              </h3>
              <p className="font-inter mt-5 text-base md:text-[17px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-md">
                {c.desc}
              </p>
            </div>

            {/* VIDEO panel — the clip fills the whole right side, edge to edge */}
            <div className="relative min-h-[280px] md:min-h-0 md:h-full max-md:order-first overflow-hidden bg-[#0a0f1c]">
              <video
                src={c.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
