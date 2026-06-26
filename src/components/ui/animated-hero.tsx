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
    <h1 className="hero-stagger hero-d1 font-poppins font-bold md:font-normal text-[clamp(1.6rem,6.2vw,2.1rem)] md:text-[clamp(2.2rem,3.6vw,2.9rem)] leading-[1.18] md:leading-[1.15] tracking-[-0.03em] text-[#111827] dark:text-white text-center max-w-[19rem] sm:max-w-4xl mx-auto [text-wrap:balance]">
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
  );
}
