import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Value-props — split-card layout (à la Bubble "Native Mobile"): one unified
 * rounded card with a light-blue text panel (eyebrow pill + headline +
 * paragraph + CTA) and a blue panel holding the product mockup.
 *
 * Desktop (lg+): the two panels sit side by side, text left / image right.
 * Mobile (< lg): they stack like Bubble's "Native Mobile" block — the image
 * on top, then the text below, ending with a full-width CTA button.
 */
export default function ValueProps({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();

  return (
    <div className="relative max-w-7xl mx-auto py-16 md:py-24">
      <div
        data-nav-shy
        className="grid lg:grid-cols-[1.45fr_1fr] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]"
      >
        {/* TEXT — light-blue gradient panel: eyebrow + headline + paragraph + CTA */}
        <div className="bg-gradient-to-br from-[#f5f8ff] via-[#d3e4fc] to-[#a9c6f4] dark:from-[#0c1830] dark:via-[#0f1d3a] dark:to-[#1c3360] p-8 md:p-14 lg:p-16 flex flex-col justify-center">
          <span className="inline-flex w-fit items-center rounded-full border border-blue-300/70 dark:border-blue-400/30 bg-white/60 dark:bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-300">
            {t({ fr: "Automatisation sur-mesure", en: "Tailored automation" })}
          </span>

          <h3 className="font-poppins font-normal text-[2rem] md:text-[2.6rem] leading-[1.1] tracking-[-0.03em] text-[#111827] dark:text-white mt-6">
            {t({ fr: "Vos tâches Excel, automatisées en un clic.", en: "Your Excel work, automated in one click." })}
          </h3>

          <p className="font-inter mt-5 text-base md:text-[17px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-md">
            {t({
              fr: "Une automatisation sur-mesure ne devrait pas prendre des mois. On la livre en quelques jours, adaptée à votre processus, sans que personne ait à maîtriser Excel.",
              en: "Tailored automation shouldn't take months. We deliver it in days, built around your process, with no one needing to master Excel.",
            })}
          </p>

          {/* Full-width on mobile (Bubble-style), auto width on desktop. */}
          <button
            onClick={openBooking}
            className="group mt-8 md:mt-9 inline-flex w-full md:w-fit items-center justify-center gap-2 px-7 py-4 md:py-3.5 rounded-full text-[16px] md:text-[15px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px transition-all duration-150"
          >
            {t({ fr: "Réserver un appel", en: "Book a call" })}
            <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-[3px] transition-transform duration-150" />
          </button>
        </div>

        {/* IMAGE — hero image fills the whole panel. Light backdrop (same family
            as the text panel) so the image's transparent edges blend in. On
            phones it sits ON TOP of the text (order-first), matching Bubble's
            "Native Mobile" stacked layout. */}
        <div className="relative min-h-[300px] md:min-h-[440px] max-md:order-first overflow-hidden bg-gradient-to-br from-[#eef4ff] to-[#d6e6fd] dark:from-[#0f1d3a] dark:to-[#152a52]">
          <img
            src="/ora_hero_violet-v3.png"
            alt={t({ fr: "Interface Ora : automatisations Excel disponibles", en: "Ora interface: available Excel automations" })}
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.12]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
