import { Check, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * ProblemSection — clean two-column comparison (Softriver-style): no cards,
 * just two columns with row dividers. Left (without Ora) muted with grey ✕,
 * right (with Ora) dark with brand-gradient ✓. No fabricated stats.
 */

export default function ProblemSection() {
  const { t } = useLang();

  const pains = [
    t({ fr: "Copier-coller et retraitements refaits à la main, chaque mois.", en: "Copy-paste and rework redone by hand, every month." }),
    t({ fr: "Fichiers trop sensibles pour ChatGPT ou un tableur partagé.", en: "Files too sensitive for ChatGPT or a shared spreadsheet." }),
    t({ fr: "Tout repose sur les rares personnes qui maîtrisent Excel.", en: "Everything rests on the few people who master Excel." }),
    t({ fr: "Recruter à temps plein juste pour gérer ces fichiers.", en: "Hiring full-time just to handle these files." }),
  ];

  const gains = [
    t({ fr: "Vos tâches Excel exécutées en un clic, à l'identique.", en: "Your Excel tasks run in one click, exactly as they are." }),
    t({ fr: "Données chiffrées de bout en bout, hébergées en Europe.", en: "Data encrypted end-to-end, hosted in Europe." }),
    t({ fr: "Aucune maîtrise d'Excel requise.", en: "No Excel mastery required." }),
    t({ fr: "Mis en place en quelques jours, sans recrutement.", en: "Set up in a few days, no hiring." }),
  ];

  return (
    <div id="probleme" className="relative mb-24 md:mb-32 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
          {t({ fr: "Le problème", en: "The problem" })}
        </span>
        <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
          {t({ fr: "Votre Excel vous coûte plus que du temps", en: "Your Excel work costs more than time" })}
        </h2>
        <p className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
          {t({
            fr: "Le travail Excel des équipes finance est lent, manuel et risqué, sur des données qu'on ne peut confier à personne.",
            en: "Finance teams' Excel work is slow, manual and risky, on data that can't be handed to anyone.",
          })}
        </p>
      </div>

      <div data-nav-shy className="grid md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12 max-w-5xl mx-auto">
        {/* Without Ora — muted */}
        <div>
          <h3 className="font-poppins font-semibold text-2xl md:text-[1.9rem] tracking-[-0.02em] text-gray-900 dark:text-white mb-1">
            {t({ fr: "Sans Ora", en: "Without Ora" })}
          </h3>
          <div className="mt-5 border-t border-gray-200 dark:border-white/10">
            {pains.map((p, i) => (
              <div key={i} className="flex items-center gap-3.5 min-h-[72px] border-b border-gray-200 dark:border-white/10">
                <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
                </span>
                <span className="font-inter text-base md:text-[17px] leading-snug text-gray-600 dark:text-gray-300">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* With Ora — dark text + brand ✓ */}
        <div>
          <h3 className="font-poppins font-semibold text-2xl md:text-[1.9rem] tracking-[-0.02em] text-gray-900 dark:text-white mb-1">
            {t({ fr: "Avec Ora", en: "With Ora" })}
          </h3>
          <div className="mt-5 border-t border-gray-200 dark:border-white/10">
            {gains.map((g, i) => (
              <div key={i} className="flex items-center gap-3.5 min-h-[72px] border-b border-gray-200 dark:border-white/10">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#0d9488] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </span>
                <span className="font-inter text-base md:text-[17px] leading-snug text-gray-900 dark:text-white">{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
