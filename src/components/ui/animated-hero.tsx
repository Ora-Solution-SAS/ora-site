import { motion, type Variants } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Hero title — static promise (positioning direction A): the outcome for the
 * ICP (sensitive financial dossiers, automated + orchestrated) followed by
 * the ownership punchline in the brand gradient. The punchline echoes the
 * Privacy section headline ("Vos données vous appartiennent") on purpose, so
 * the data-ownership message is the consistent spine of the site — the single
 * strongest argument for a buyer who is skeptical about where data goes.
 * Light weight + contained size + balanced wrapping keeps it airy.
 * Name kept as `AnimatedHeroTitle` so callers don't change; entrance
 * animation comes from the `.hero-stagger` fade-up in Hero.tsx.
 */
/* Ultra-smooth, GPU-composited entrance: each line rises + fades in with a
   subtle scale, staggered. Transform + opacity only (no blur) so it stays
   buttery on phones. A small delayChildren lets the page paint first so the
   motion is actually seen on arrival. */
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
    <motion.h1
      variants={titleContainer}
      initial="hidden"
      animate="show"
      style={{ willChange: "transform, opacity" }}
      className="font-poppins font-medium md:font-normal text-[clamp(2.15rem,8.8vw,2.8rem)] md:text-[clamp(2.2rem,3.6vw,2.9rem)] leading-[1.08] md:leading-[1.15] tracking-[-0.03em] text-[#111827] dark:text-white text-center max-w-[26rem] sm:max-w-4xl mx-auto [text-wrap:balance]"
    >
      <motion.span variants={titleLine} className="block">
        {t({
          fr: "Prenez le contrôle de vos dossiers.",
          en: "Take control of every file.",
        })}
      </motion.span>
      <motion.span variants={titleLine} className="block mt-1 md:mt-2 text-brand-gradient">
        {t({ fr: "Automatisés, orchestrés, et à vous.", en: "Automated, orchestrated, and yours." })}
      </motion.span>
    </motion.h1>
  );
}
