import { motion, type Variants } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Hero title — two distinct renders so the work we did on mobile never touches
 * the desktop site:
 *   • Mobile (< md): a tighter, larger two-phrase promise ("Take control of
 *     every file." / "Automated, orchestrated, and yours.") with an
 *     ultra-smooth GPU-composited entrance animation.
 *   • Desktop (>= md): the original main version — the static promise
 *     (sensitive financial dossiers, automated + orchestrated) followed by the
 *     ownership punchline in the brand gradient. Entrance comes from the
 *     `.hero-stagger` fade-up in Hero.tsx.
 * Name kept as `AnimatedHeroTitle` so callers don't change.
 */

/* Ultra-smooth, GPU-composited entrance for the mobile title: each line rises +
   fades in with a subtle scale, staggered. Transform + opacity only (no blur)
   so it stays buttery on phones. A small delayChildren lets the page paint
   first so the motion is actually seen on arrival. */
const titleContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2, delayChildren: 0.25 },
  },
};

const titleLine: Variants = {
  hidden: { opacity: 0, y: 38, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedHeroTitle() {
  const { t } = useLang();
  return (
    <>
      {/* Mobile-only title — our reworked two-phrase promise + entrance animation */}
      <motion.h1
        variants={titleContainer}
        initial="hidden"
        animate="show"
        style={{ willChange: "transform, opacity" }}
        className="md:hidden font-poppins font-normal text-[clamp(2.15rem,8.8vw,2.8rem)] leading-[1.08] tracking-[-0.03em] text-[#111827] dark:text-white text-center max-w-[26rem] sm:max-w-4xl mx-auto [text-wrap:balance]"
      >
        <motion.span variants={titleLine} className="block">
          {t({
            fr: "Prenez le contrôle de vos dossiers.",
            en: "Take control of every file.",
          })}
        </motion.span>
        <motion.span variants={titleLine} className="block mt-1 text-brand-gradient">
          {t({ fr: "Automatisés, orchestrés, et à vous.", en: "Automated, orchestrated, and yours." })}
        </motion.span>
      </motion.h1>

      {/* Desktop-only title — original main version, untouched */}
      <h1 className="hidden md:block hero-stagger hero-d1 font-poppins font-normal text-[clamp(2.2rem,3.6vw,2.9rem)] leading-[1.15] tracking-[-0.03em] text-[#111827] dark:text-white text-center max-w-4xl mx-auto [text-wrap:balance]">
        <span className="block">
          {t({
            fr: "Vos dossiers financiers les plus sensibles, automatisés et orchestrés.",
            en: "Your most sensitive financial dossiers, automated and orchestrated.",
          })}
        </span>
        <span className="block mt-2 text-brand-gradient">
          {t({ fr: "Vos données vous appartiennent.", en: "Your data stays yours." })}
        </span>
      </h1>
    </>
  );
}
