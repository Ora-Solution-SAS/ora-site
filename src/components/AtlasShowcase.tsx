import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Globe,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { MockupHome, MockupManager, InteractiveGalaxy } from "./AtlasMockups";
import InViewVideo from "./InViewVideo";
import ScaleToFit from "./ScaleToFit";

/**
 * Atlas showcase section — Monday.com "Un vrai impact" layout.
 *
 *   1. Brand-mark icon, centered at top
 *   2. Two-line headline ("Atlas." + tagline)
 *   3. Small "Discover Atlas" text link with arrow
 *   4. Two-column row:
 *       - Left  : vertical list of tab pills (icon badge + label).
 *                 Active tab gets a subtle white-on-white pill bg.
 *       - Right : the active app mockup inside a "framed" panel —
 *                 a gradient surface + glow halo — so the mockup
 *                 reads clearly against the pure-black section bg.
 *
 * The frame panel extends slightly beyond the column on desktop
 * (`lg:mr-[-80px]`) and the section uses `overflow-hidden`, so the
 * mockup feels like it spills toward the viewport edge — the same
 * "there's more here" effect Monday's hero uses.
 */

type TabId = "galaxy" | "dashboard" | "manager";

type Tab = {
  id: TabId;
  icon: LucideIcon;
  /** Solid color for the circular icon badge (Monday-style). */
  iconBg: string;
  label: string;
};

export default function AtlasShowcase() {
  const { t } = useLang();
  // Tab state for the lower demo area (pills above the Atlas video). Galaxy
  // shows the video; the other tabs reuse their mockups. The top mockup is no
  // longer tabbed — it always shows the interactive galaxy.
  const [bottomTab, setBottomTab] = useState<TabId>("galaxy");

  const tabs: Tab[] = [
    {
      id: "galaxy",
      icon: Globe,
      iconBg: "bg-pink-500",
      label: t({
        fr: "Visualisez vos dossiers comme une galaxie",
        en: "See your folders as a galaxy",
      }),
    },
    {
      id: "dashboard",
      icon: LayoutDashboard,
      iconBg: "bg-blue-500",
      label: t({
        fr: "Pilotez votre activité en un coup d'œil",
        en: "Steer your work at a glance",
      }),
    },
    {
      id: "manager",
      icon: Users,
      iconBg: "bg-emerald-500",
      label: t({
        fr: "Coordonnez vos équipes en temps réel",
        en: "Coordinate your teams in real time",
      }),
    },
  ];

  return (
    <section
      id="atlas"
      data-nav-dark
      data-nav-shy
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0a0a0a 0%, #000 55%, #000 100%)",
      }}
    >
      {/* Scroll-triggered stagger entrance: each major block fades up
          when the section enters the viewport. `once: true` means the
          animation plays a single time (no replay when scrolling back).
          `margin: "-80px"` triggers slightly before the section is fully
          in view so the entrance feels anticipatory, not delayed. */}
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
        }}
      >
        {/* Atlas brand visual — star-trail decorative image.
            Custom entrance overrides the generic fadeInUp:
              - Spring physics: small overshoot for a satisfying "landing"
              - Scales up from 0.4 + rotates from -25° → 0° + fades in
            Once landed, the inner img loops a gentle floating motion
            (translateY ±6px over 4s) so the star feels "alive" without
            stealing attention from the headline. */}
        <motion.div
          className="flex justify-center mb-7"
          variants={{
            hidden: { opacity: 0, scale: 0.3, rotate: -35 },
            visible: {
              opacity: 1,
              scale: 1,
              rotate: 0,
              // Slower spring (lower stiffness, higher mass) → entrance
              // takes ~1.4s so the user actually sees the scale+rotate
              // happen as they scroll into the section. Slight overshoot
              // preserved for the "satisfying landing" feel.
              transition: {
                type: "spring",
                stiffness: 45,
                damping: 14,
                mass: 1.4,
              },
            },
          }}
        >
          <motion.img
            src="/logos/star-trail.png"
            alt=""
            aria-hidden
            className="h-16 md:h-20 w-auto object-contain select-none pointer-events-none"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="font-poppins font-medium text-4xl md:text-[3.75rem] tracking-[-0.03em] leading-[1.05] text-center max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <span className="block text-white">{t({ fr: "Atlas.", en: "Atlas." })}</span>
          <span className="block text-white mt-1">
            {t({ fr: "Vos dossiers, en orbite.", en: "Your folders, in orbit." })}
          </span>
        </motion.h2>

        {/* Discover link */}
        <motion.div
          className="flex justify-center mt-8 mb-14 md:mb-20"
          variants={fadeInUp}
        >
          <button
            type="button"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold font-inter text-white/70 hover:text-white transition-colors duration-150"
          >
            {t({ fr: "Découvrez Atlas", en: "Discover Atlas" })}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-[2px] transition-transform duration-150" />
          </button>
        </motion.div>

        {/* Full-width interactive app screen (no tabs — the galaxy is the
            single hero mockup here; feature switching lives in the lower
            demo, below the paragraph). */}
        <motion.div variants={fadeInUp}>
          {/* Framed app screen — tighter frame that hugs the screen, centered,
              fits without side-scroll. */}
          <div className="relative w-full max-w-[1052px] mx-auto">
            {/* Soft sky-blue halo behind the frame (pure radial gradient,
                no blur filter — avoids scroll-time repaints). */}
            <div
              aria-hidden
              className="absolute -inset-3 lg:-inset-5 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, rgba(125,211,252,0.26) 0%, rgba(96,165,250,0.15) 35%, rgba(56,189,248,0.06) 60%, transparent 80%)",
              }}
            />

            <div
              className="relative rounded-3xl overflow-hidden p-3 md:p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(186,230,253,0.14) 0%, rgba(147,197,253,0.09) 50%, rgba(186,230,253,0.14) 100%)",
                border: "1px solid rgba(186,230,253,0.22)",
                boxShadow:
                  "0 28px 72px rgba(56,189,248,0.28), 0 10px 36px rgba(96,165,250,0.18), 0 3px 14px rgba(56,189,248,0.10), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {/* Scales the 1020px mockup down to fit on narrow screens
                  (centered at full size on desktop). */}
              <ScaleToFit>
                <InteractiveGalaxy />
              </ScaleToFit>
            </div>
          </div>
        </motion.div>

        {/* Explanatory paragraph below the main mockup — gives Atlas more
            context than the headline alone. */}
        <motion.div
          className="max-w-3xl mx-auto mt-20 md:mt-28 text-center"
          variants={fadeInUp}
        >
          <h3 className="font-poppins font-semibold text-2xl md:text-[2rem] tracking-[-0.03em] leading-[1.15] text-white">
            {t({
              fr: "Le dossier complet, orchestré et traçable",
              en: "The whole dossier, orchestrated and traceable",
            })}
          </h3>
          <p className="mt-5 font-inter text-[15px] md:text-base leading-[1.75] text-gray-300">
            {t({
              fr: "Atlas transforme un dossier de deal ou de mission en une carte vivante : chaque fichier est relié à ses sources, ses dérivés et ses livrables. Vous voyez d'un coup d'œil le statut de chaque document, ce qui reste à valider et qui a fait quoi, grâce à un journal d'audit par document. La lignée complète d'un chiffre, de la donnée brute au livrable final, sans jamais quitter Excel.",
              en: "Atlas turns a deal or engagement dossier into a living map: every file is linked to its sources, its derivatives and its deliverables. See each document's status at a glance, what's still to validate and who did what, with a per-document audit trail. The full lineage of a figure, from raw data to final deliverable, without ever leaving Excel.",
            })}
          </p>
        </motion.div>

        {/* Lower tabbed demo — pills above the visual. The galaxy tab shows
            the Atlas demo video; the other tabs reuse their app mockups so
            each pill below the paragraph has matching content. */}
        <motion.div className="mt-14 md:mt-16" variants={fadeInUp}>
          <TabPills tabs={tabs} active={bottomTab} onSelect={setBottomTab} />

          {/* Single grid cell so the active visual and the outgoing one stack
              and crossfade (same proven pattern as the interactive mockup
              above — no mode="wait", which can stall the exit). */}
          <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={bottomTab}
                style={{ gridColumn: 1, gridRow: 1, willChange: "opacity, transform" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {bottomTab === "galaxy" ? (
                  // Atlas detail visual — client-supplied demo video
                  // (2560×1708 → 3:2). Sky-blue tinted border + soft glow.
                  <div className="max-w-5xl -mx-4 sm:mx-auto">
                    <div
                      className="rounded-3xl overflow-hidden border"
                      style={{
                        borderColor: "rgba(186,230,253,0.22)",
                        boxShadow:
                          "0 40px 110px rgba(56,189,248,0.32), 0 16px 56px rgba(96,165,250,0.22), 0 4px 18px rgba(56,189,248,0.12)",
                      }}
                    >
                      <InViewVideo
                        src="/ora_atlas.mp4"
                        className="w-full block object-cover"
                        style={{ aspectRatio: "2560 / 1708" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full max-w-[1052px] mx-auto">
                    <div
                      aria-hidden
                      className="absolute -inset-3 lg:-inset-5 -z-10 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 45%, rgba(125,211,252,0.26) 0%, rgba(96,165,250,0.15) 35%, rgba(56,189,248,0.06) 60%, transparent 80%)",
                      }}
                    />
                    <div
                      className="relative rounded-3xl overflow-hidden p-3 md:p-4"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(186,230,253,0.14) 0%, rgba(147,197,253,0.09) 50%, rgba(186,230,253,0.14) 100%)",
                        border: "1px solid rgba(186,230,253,0.22)",
                        boxShadow:
                          "0 28px 72px rgba(56,189,248,0.28), 0 10px 36px rgba(96,165,250,0.18), 0 3px 14px rgba(56,189,248,0.10), inset 0 1px 0 rgba(255,255,255,0.07)",
                      }}
                    >
                      <ScaleToFit>
                        {bottomTab === "dashboard" ? <MockupHome /> : <MockupManager />}
                      </ScaleToFit>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/** Horizontal row of feature tab pills (icon badge + label). Shared by the
    interactive mockup (top) and the demo-video area (below the paragraph). */
function TabPills({
  tabs,
  active,
  onSelect,
}: {
  tabs: Tab[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-10 md:mb-14">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-left transition-all duration-200 ${
              isActive
                ? "bg-white/[0.08] border border-white/[0.10]"
                : "border border-transparent hover:bg-white/[0.04]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tab.iconBg}`}
            >
              <Icon className="w-4 h-4 text-white" strokeWidth={2.25} />
            </div>
            <span
              className={`font-poppins font-semibold text-[13px] md:text-[14px] leading-snug transition-colors duration-200 ${
                isActive ? "text-white" : "text-white/55"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Fade-up entrance — used by every staggered child in the section. */
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};
