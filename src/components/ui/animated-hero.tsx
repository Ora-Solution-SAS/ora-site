import { motion } from "framer-motion";
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
export function AnimatedHeroTitle() {
  const { t } = useLang();
  return (
    <h1 className="font-poppins font-medium md:font-normal text-[clamp(2.15rem,8.8vw,2.8rem)] md:text-[clamp(2.2rem,3.6vw,2.9rem)] leading-[1.08] md:leading-[1.15] tracking-[-0.03em] text-[#111827] dark:text-white text-center max-w-[26rem] sm:max-w-4xl mx-auto [text-wrap:balance]">
      <motion.span
        className="block"
        initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        {t({
          fr: "Prenez le contrôle de vos dossiers.",
          en: "Take control of every file.",
        })}
      </motion.span>
      <motion.span
        className="block mt-1 md:mt-2 text-brand-gradient"
        initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
      >
        {t({ fr: "Automatisés, orchestrés, et à vous.", en: "Automated, orchestrated, and yours." })}
      </motion.span>
    </h1>
  );
}
