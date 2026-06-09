import { useLang } from "@/lib/i18n";

/**
 * Value-props block — a longer, lighter headline with two highlighted phrases,
 * a two-column benefit checklist (rows separated by thin rules), and a product
 * mockup floating on a soft panel to the right. Clean two-column composition
 * (text ↔ image), inspired by modern agency landing pages.
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
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch py-16 md:py-24">
      {/* LEFT — headline + benefit checklist */}
      <div>
        <h3 className="font-poppins font-normal text-[1.7rem] md:text-[2.15rem] leading-[1.22] tracking-[-0.02em] text-[#111827] dark:text-white">
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

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          {columns.map((col, ci) => (
            <ul key={ci} className="flex flex-col">
              {col.map((item) => (
                <li
                  key={item}
                  className="font-inter font-medium text-base md:text-[17px] text-[#111827] dark:text-white py-5 border-b border-gray-200 dark:border-white/10"
                >
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* RIGHT — mockup, height matched EXACTLY to the left column (top + bottom
          aligned). object-cover trims a little blue top/bottom if needed. On
          mobile (single column) it falls back to its natural height. */}
      <div
        className="relative w-full rounded-[24px] overflow-hidden aspect-[4/3] lg:aspect-auto"
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
