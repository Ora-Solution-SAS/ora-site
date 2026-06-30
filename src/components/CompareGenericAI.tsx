import { Check, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * CompareGenericAI — handles the "why not just use ChatGPT/Copilot in Excel?"
 * objection. Honest two-column comparison: generic AI (muted, ✕) vs Ora
 * (branded, ✓). Differentiators are all real per the product reference:
 * deterministic/reproducible, one-click reuse, audit trail + approval,
 * confidential (encrypted, EU-hosted, no model training).
 */
export default function CompareGenericAI() {
  const { t } = useLang();

  const rows = [
    {
      dim: t({ fr: "Résultat", en: "Output" }),
      ai: t({ fr: "Varie d'une exécution à l'autre", en: "Varies from one run to the next" }),
      ora: t({ fr: "Déterministe et reproductible, à l'identique", en: "Deterministic and reproducible, every time" }),
    },
    {
      dim: t({ fr: "Réutilisation", en: "Reuse" }),
      ai: t({ fr: "Il faut re-formuler le prompt à chaque fois", en: "You re-prompt every single time" }),
      ora: t({ fr: "Relancé en 1 clic sur vos fichiers", en: "Re-run in one click on your files" }),
    },
    {
      dim: t({ fr: "Traçabilité", en: "Traceability" }),
      ai: t({ fr: "Aucune trace, aucune validation", en: "No trail, no approval" }),
      ora: t({ fr: "Journal d'audit par document + validation manager", en: "Per-document audit trail + manager approval" }),
    },
    {
      dim: t({ fr: "Confidentialité", en: "Confidentiality" }),
      ai: t({ fr: "Vos données partent dans un LLM public", en: "Your data goes into a public LLM" }),
      ora: t({ fr: "Chiffré, hébergé en Europe, jamais utilisé pour entraîner des modèles", en: "Encrypted, EU-hosted, never used to train models" }),
    },
    {
      dim: t({ fr: "Sur-mesure", en: "Tailored" }),
      ai: t({ fr: "Réponses génériques", en: "Generic answers" }),
      ora: t({ fr: "Construit pour votre processus exact, livré en quelques jours", en: "Built for your exact process, delivered in days" }),
    },
  ];

  return (
    <section
      data-nav-shy
      className="relative py-24 md:py-32 px-6 md:px-12 bg-white dark:bg-black md:dark:bg-[#0f172a]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {t({ fr: "Pourquoi pas ChatGPT ?", en: "Why not ChatGPT?" })}
          </span>
          <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
            {t({ fr: "Pas un chatbot. Un outil que vous pouvez auditer.", en: "Not a chatbot. A tool you can audit." })}
          </h2>
          <p className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "L'IA générique improvise. Sur des données financières confidentielles, vous avez besoin de résultats reproductibles, tracés et contrôlés.",
              en: "Generic AI improvises. On confidential financial data, you need results that are reproducible, traced and controlled.",
            })}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02]">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[0.8fr_1fr_1fr]">
            <div className="hidden sm:block p-5" />
            <div className="p-5 border-l border-gray-200 dark:border-white/10">
              <span className="font-poppins font-semibold text-[15px] md:text-base text-gray-500 dark:text-gray-400">
                {t({ fr: "ChatGPT / Copilot", en: "ChatGPT / Copilot" })}
              </span>
            </div>
            <div className="p-5 border-l border-gray-200 dark:border-white/10 bg-gradient-to-br from-[#3b82f6]/[0.06] to-[#0d9488]/[0.06]">
              <span className="font-poppins font-semibold text-[15px] md:text-base text-[#111827] dark:text-white">
                Ora
              </span>
            </div>
          </div>

          {rows.map((r, i) => (
            <div
              key={r.dim}
              className={`grid grid-cols-[1fr_1fr] sm:grid-cols-[0.8fr_1fr_1fr] border-t border-gray-200 dark:border-white/10 ${
                i % 2 === 1 ? "bg-gray-50/60 dark:bg-white/[0.015]" : ""
              }`}
            >
              {/* Dimension label — full width on mobile (spans both cols), own col on sm+ */}
              <div className="col-span-2 sm:col-span-1 px-5 pt-4 pb-1 sm:py-5">
                <span className="font-inter font-semibold text-[13px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  {r.dim}
                </span>
              </div>
              <div className="px-5 py-4 sm:py-5 border-l border-gray-200 dark:border-white/10 flex items-start gap-2.5">
                <span className="w-5 h-5 mt-0.5 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                </span>
                <span className="font-inter text-[14px] md:text-[15px] leading-snug text-gray-600 dark:text-gray-300">
                  {r.ai}
                </span>
              </div>
              <div className="px-5 py-4 sm:py-5 border-l border-gray-200 dark:border-white/10 flex items-start gap-2.5 bg-gradient-to-br from-[#3b82f6]/[0.04] to-[#0d9488]/[0.04]">
                <span className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#0d9488] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                </span>
                <span className="font-inter text-[14px] md:text-[15px] leading-snug text-[#111827] dark:text-white">
                  {r.ora}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
