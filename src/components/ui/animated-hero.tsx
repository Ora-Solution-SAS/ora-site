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
    <h1 className="hero-stagger hero-d1 font-poppins font-medium md:font-normal text-[clamp(1.9rem,7.6vw,2.5rem)] md:text-[clamp(2.2rem,3.6vw,2.9rem)] leading-[1.1] md:leading-[1.15] tracking-[-0.03em] text-[#111827] dark:text-white text-center max-w-[23rem] sm:max-w-4xl mx-auto [text-wrap:balance]">
      <span className="block">
        {t({
          fr: "Prenez le contrôle de vos dossiers.",
          en: "Take control of every file.",
        })}
      </span>
      <span className="block mt-1 md:mt-2 text-brand-gradient">
        {t({ fr: "Automatisés, orchestrés, et à vous.", en: "Automated, orchestrated, and yours." })}
      </span>
    </h1>
  );
}
