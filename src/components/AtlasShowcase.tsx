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
import { MockupHome, MockupManager, MockupGalaxy } from "./AtlasMockups";

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
  const [activeTab, setActiveTab] = useState<TabId>("galaxy");

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

  const ActiveMockup =
    activeTab === "galaxy"
      ? MockupGalaxy
      : activeTab === "dashboard"
        ? MockupHome
        : MockupManager;

  return (
    <section
      data-nav-dark
      className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0f1424 0%, #060810 55%, #000 100%)",
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

        {/* Two-column: vertical tabs + framed mockup */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] gap-8 lg:gap-12 items-center"
          variants={fadeInUp}
        >
          {/* LEFT — vertical tab list */}
          <div className="flex flex-col gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-full text-left transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.08] border border-white/[0.10]"
                      : "border border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tab.iconBg}`}
                  >
                    <Icon className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
                  </div>
                  <span
                    className={`font-poppins font-semibold text-[15px] leading-snug transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/55"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT — framed mockup viewer */}
          <div className="relative">
            {/* Luminous sky-blue halo behind the frame — Bubble.io look.
                Bigger inset + higher center opacity + pure sky/blue color
                (no teal mix) so it reads as a bright halo against the black
                section bg rather than a muted dark gradient. */}
            <div
              aria-hidden
              className="absolute -inset-10 lg:-inset-24 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, rgba(125,211,252,0.42) 0%, rgba(96,165,250,0.24) 35%, rgba(56,189,248,0.10) 60%, transparent 80%)",
                filter: "blur(60px)",
              }}
            />

            {/* Soft sky-blue gradient frame panel — extends slightly beyond
                the column on desktop.
                Lighter, more pastel gradient (sky-200/blue-300 at low opacity)
                + sky-blue border + dual blue-tinted shadows replace the dark
                drop shadow, so the panel itself glows softly. */}
            <div
              className="relative rounded-3xl overflow-hidden p-6 md:p-10 lg:mr-[-80px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(186,230,253,0.16) 0%, rgba(147,197,253,0.10) 50%, rgba(186,230,253,0.16) 100%)",
                border: "1px solid rgba(186,230,253,0.18)",
                boxShadow:
                  "0 30px 80px rgba(56,189,248,0.22), 0 10px 40px rgba(96,165,250,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {/* Mockup viewer — horizontally scrollable on small screens,
                  clipped-right by the frame on desktop (Monday "spills over").

                  Smoothness setup:
                  - No `mode="wait"` → outgoing and incoming mockups overlap
                    in time, so there's no perceptible gap between them.
                  - CSS grid with both motion.divs in `1 / 1` → they stack
                    on top of each other (true crossfade) while the grid
                    container still reports the correct scroll-width to the
                    outer `overflow-x-auto` parent. (Pure `position: absolute`
                    would break horizontal scroll on mobile.)
                  - No blur filter → blurring a 1020px-wide mockup with the
                    Galaxy SVG inside causes frame drops on mid-tier hardware,
                    which read as "harsh".
                  - Slide direction matches for both elements (`-24px → 0` on
                    enter, `0 → +24px` on exit) so the whole composition
                    reads as a single continuous downward slide rather than
                    two opposing motions passing each other.
                  - `initial={false}` skips entrance animation on first paint. */}
              <div
                className="overflow-x-auto -mx-1"
                style={{ minHeight: 800 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "max-content",
                  }}
                >
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={activeTab}
                      style={{
                        gridColumn: 1,
                        gridRow: 1,
                        willChange: "opacity, transform",
                      }}
                      className="flex justify-start min-w-fit px-1"
                      initial={{ opacity: 0, y: -24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 24 }}
                      transition={{
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <ActiveMockup />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
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
              fr: "Tous vos fichiers, enfin sous contrôle",
              en: "Every file, finally under control",
            })}
          </h3>
          <p className="mt-5 font-inter text-[15px] md:text-base leading-[1.75] text-gray-300">
            {t({
              fr: "Atlas cartographie l'ensemble de vos fichiers Excel en une carte vivante. Chaque dossier devient une planète, chaque rapport une étoile. Vous retrouvez n'importe quel fichier en quelques secondes, vous suivez l'avancement de vos équipes en temps réel, et vous gardez une vue d'ensemble claire sur toute votre activité, sans jamais quitter votre environnement de travail.",
              en: "Atlas maps every one of your Excel files into a single living map. Each folder becomes a planet, each report a star. Find any file in seconds, follow your teams' progress in real time, and keep a clear bird's-eye view of your whole operation, without ever leaving your working environment.",
            })}
          </p>
        </motion.div>

        {/* Placeholder for the Atlas detail visual the client will provide.
            TODO(client image): replace this block with the supplied image /
            image layout, e.g. <img src="/atlas-detail.png" ... />. */}
        <motion.div
          className="max-w-4xl mx-auto mt-10 md:mt-12"
          variants={fadeInUp}
        >
          <div
            className="rounded-3xl border border-dashed border-white/15 flex items-center justify-center aspect-[16/7]"
            style={{
              background:
                "linear-gradient(135deg, rgba(186,230,253,0.06), rgba(147,197,253,0.04))",
            }}
          >
            <span className="font-inter text-[13px] text-white/35">
              {t({ fr: "Visuel Atlas à venir", en: "Atlas visual coming soon" })}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
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
