import { useLang } from "@/lib/i18n";

/**
 * Value-props block — a longer, lighter headline with two highlighted phrases,
 * a two-column benefit checklist (rows separated by thin rules), and a product
 * mockup floating on a soft panel to the right. Clean two-column composition
 * (text ↔ image), inspired by modern agency landing pages.
 */
export default function ValueProps() {
  const { t } = useLang();

  // Benefits in ROW order (left, right, left, right…): the grid auto-places
  // them two per row, so each row shares one height and the separator rules
  // of the two columns stay perfectly aligned even when a label wraps.
  const benefits: string[] = [
    t({ fr: "Gagnez des heures chaque semaine", en: "Save hours every week" }),
    t({ fr: "Zéro saisie manuelle", en: "Zero manual entry" }),
    t({ fr: "Déployé en quelques heures", en: "Live in just hours" }),
    t({ fr: "100% local et sécurisé", en: "100% local & secure" }),
    t({ fr: "Aucune IA, du vrai sur-mesure", en: "No AI, real design talent" }),
    t({ fr: "Conçu pour votre métier", en: "Built for your business" }),
  ];

  return (
    <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-24">
      {/* LEFT — headline + benefit checklist */}
      <div>
        <h3 className="font-poppins font-normal text-[1.5rem] md:text-[1.95rem] leading-[1.34] tracking-[-0.01em] text-[#111827] dark:text-white">
          {t({ fr: "Nous pensons qu'une ", en: "We believe " })}
          <span className="text-[#3b82f6]">
            {t({ fr: "automatisation puissante", en: "powerful automation" })}
          </span>
          {t({
            fr: " ne devrait pas prendre des mois. On transforme vos tâches Excel en automatisations en un clic, ",
            en: " shouldn't take months. So we turn your Excel work into a one-click workflow, ",
          })}
          <span className="text-[#3b82f6]">
            {t({ fr: "en quelques minutes.", en: "in just minutes." })}
          </span>
        </h3>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          {benefits.map((item) => (
            <div
              key={item}
              className="flex items-center font-inter font-medium text-base md:text-[17px] text-[#111827] dark:text-white py-5 border-b border-gray-300 dark:border-white/25"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — mockup. The box keeps the image's native 4:3 ratio at EVERY
          breakpoint (the PNG is 2003×1502), so object-cover is an exact fit:
          the full mockup always shows, never zoomed or cropped, regardless of
          how tall the text column gets (e.g. the longer French copy). The
          column is vertically centered (items-center) so the image floats
          balanced next to the text instead of being stretched to its height. */}
      <div
        className="relative w-full rounded-[24px] overflow-hidden aspect-[4/3]"
        style={{
          boxShadow:
            "0 24px 70px -22px rgba(59,130,246,0.28), 0 8px 30px -12px rgba(13,148,136,0.15)",
        }}
      >
        <img
          src="/value-automation-v11.png"
          alt={t({
            fr: "Interface Ora : automatisations Excel disponibles",
            en: "Ora interface: available Excel automations",
          })}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}
