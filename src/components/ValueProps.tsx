import { useLang } from "@/lib/i18n";

/**
 * Value-props block — headline statement with two highlighted phrases, a
 * two-column benefit checklist (rows separated by thin rules), and a visual
 * card on the right. Layout inspired by modern agency landing pages, adapted
 * to Ora's content. Rendered as a plain block so it nests inside the Features
 * section, just below the "Meet Ora." heading.
 */
export default function ValueProps() {
  const { t } = useLang();

  // Two columns of short benefits (3 each), separated by thin rules.
  const columns: string[][] = [
    [
      t({ fr: "Gagnez des heures chaque semaine", en: "Save hours every week" }),
      t({ fr: "Déployé en quelques jours", en: "Live in just days" }),
      t({ fr: "Aucune IA, du vrai sur-mesure", en: "No AI, real design talent" }),
    ],
    [
      t({ fr: "Zéro saisie manuelle", en: "Zero manual entry" }),
      t({ fr: "100% local et sécurisé", en: "100% local & secure" }),
      t({ fr: "Conçu pour votre métier", en: "Built for your business" }),
    ],
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-12 lg:gap-16 items-start py-16 md:py-24">
      {/* LEFT — headline + benefit checklist */}
      <div>
        <h3 className="font-poppins font-medium text-[1.9rem] md:text-[2.6rem] leading-[1.18] tracking-[-0.03em] text-[#111827] dark:text-white">
          {t({ fr: "Nous pensons qu'une ", en: "We believe " })}
          <span className="text-[#3b82f6]">
            {t({ fr: "automatisation puissante", en: "powerful automation" })}
          </span>
          {t({
            fr: " ne devrait pas prendre des mois. On transforme vos tâches Excel en un workflow en un clic, ",
            en: " shouldn't take months. So we turn your Excel work into a one-click workflow, ",
          })}
          <span className="text-[#3b82f6]">
            {t({ fr: "en quelques jours.", en: "in just days." })}
          </span>
        </h3>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          {columns.map((col, ci) => (
            <ul key={ci} className="flex flex-col">
              {col.map((item) => (
                <li
                  key={item}
                  className="font-inter text-[15px] md:text-base text-gray-700 dark:text-gray-300 py-4 border-b border-gray-200 dark:border-white/10"
                >
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* RIGHT — product mockup (Excel + Ora automations). */}
      <div
        className="relative rounded-[28px] overflow-hidden w-full"
        style={{
          boxShadow:
            "0 24px 70px -20px rgba(59,130,246,0.30), 0 8px 30px -10px rgba(13,148,136,0.18)",
        }}
      >
        <img
          src="/value-automation-v3.png"
          alt={t({
            fr: "Interface Ora : automatisations Excel disponibles",
            en: "Ora interface: available Excel automations",
          })}
          className="w-full h-auto block"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}
