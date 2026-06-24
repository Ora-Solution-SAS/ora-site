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
      ? InteractiveGalaxy
      : activeTab === "dashboard"
        ? MockupHome
        : MockupManager;

  return (
    <section
      id="atlas"
      data-nav-dark
      data-nav-shy
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

        {/* Tabs on top + full-width app screen below.
            Moving the tab pills above lets the mockup take the section's full
            width, so the 1020px app screen fits without horizontal scrolling
            on desktop (the previous two-column layout forced a side-scroll). */}
        <motion.div variants={fadeInUp}>
          {/* Horizontal tab pills */}
          <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-10 md:mb-14">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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

          {/* Framed app screen — tighter frame that hugs the screen, centered,
              fits without side-scroll. */}
          <div className="relative w-fit mx-auto">
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
              {/* Centered when it fits (desktop); scrollable fallback on narrow
                  screens. The crossfade stacks both mockups in one grid cell. */}
              <div className="overflow-x-auto">
                <div className="grid justify-center" style={{ gridTemplateColumns: "minmax(0, max-content)" }}>
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={activeTab}
                      style={{ gridColumn: 1, gridRow: 1, willChange: "opacity, transform" }}
                      initial={{ opacity: 0, y: -24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 24 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
              fr: "Reprenez le contrôle de tous vos fichiers",
              en: "Take back control of every file",
            })}
          </h3>
          <p className="mt-5 font-inter text-[15px] md:text-base leading-[1.75] text-gray-300">
            {t({
              fr: "Fini les heures perdues à chercher le bon fichier ou la dernière version. Atlas transforme tout votre désordre Excel en une carte vivante et instantanément lisible : chaque dossier devient une planète, chaque rapport une étoile. Retrouvez n'importe quel fichier en quelques secondes, suivez l'avancement de vos équipes en temps réel et gardez une longueur d'avance sur toute votre activité, sans jamais quitter votre environnement de travail.",
              en: "Stop losing hours hunting for the right file or the latest version. Atlas turns your Excel chaos into a living, instantly readable map: every folder becomes a planet, every report a star. Find any file in seconds, track your teams' progress in real time, and stay one step ahead of your whole operation, without ever leaving your working environment.",
            })}
          </p>
        </motion.div>

        {/* Atlas detail visual — client-supplied demo video (2560×854 → 3:2).
            Framed to match the section: sky-blue tinted border + soft glow,
            ratio set to the source so it fills with no letterbox bars. */}
        <motion.div
          className="max-w-5xl mx-auto mt-10 md:mt-12"
          variants={fadeInUp}
        >
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
