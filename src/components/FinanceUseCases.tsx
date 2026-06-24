import {
  BarChart3,
  Layers,
  LineChart,
  Calculator,
  Wand2,
  GitCompare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * FinanceUseCases — answers the finance buyer's first question ("does it do
 * MY work?") with named, recognizable workflows. Descriptions stay truthful:
 * they say what Ora automates, with no fabricated metrics or results.
 */

type UseCase = { icon: LucideIcon; title: string; desc: string };

export default function FinanceUseCases({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();

  const cases: UseCase[] = [
    {
      icon: BarChart3,
      title: t({ fr: "Reporting récurrent", en: "Recurring reporting" }),
      desc: t({
        fr: "Vos reportings mensuels et hebdomadaires produits automatiquement à partir de vos fichiers.",
        en: "Your monthly and weekly reports produced automatically from your files.",
      }),
    },
    {
      icon: Layers,
      title: t({ fr: "Consolidation de fichiers", en: "File consolidation" }),
      desc: t({
        fr: "Fusionnez des dizaines de fichiers en un format unique, sans copier-coller.",
        en: "Merge dozens of files into a single format, with no copy-paste.",
      }),
    },
    {
      icon: LineChart,
      title: t({ fr: "Tableaux de bord & suivi", en: "Dashboards & tracking" }),
      desc: t({
        fr: "Indicateurs et tableaux de bord d'activité mis à jour automatiquement à partir de vos sources.",
        en: "KPIs and activity dashboards refreshed automatically from your sources.",
      }),
    },
    {
      icon: Calculator,
      title: t({ fr: "Modèles & calculs Excel", en: "Excel models & calculations" }),
      desc: t({
        fr: "Vos modèles exécutés sans erreur, sans que personne ait à maîtriser Excel.",
        en: "Your models run without errors, with no one needing to master Excel.",
      }),
    },
    {
      icon: Wand2,
      title: t({ fr: "Nettoyage & mise en forme", en: "Data cleanup & reshaping" }),
      desc: t({
        fr: "Normalisation, dédoublonnage et remise en forme de fichiers bruts, à chaque import.",
        en: "Normalization, dedup and reshaping of raw files, on every import.",
      }),
    },
    {
      icon: GitCompare,
      title: t({ fr: "Rapprochements & contrôles", en: "Cross-checks & controls" }),
      desc: t({
        fr: "Croisez et contrôlez vos fichiers, avec les écarts automatiquement mis en évidence.",
        en: "Cross-check and control your files, with discrepancies automatically flagged.",
      }),
    },
  ];

  return (
    <div id="cas-usage" className="relative mb-20 md:mb-28 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
          {t({ fr: "Cas d'usage", en: "Use cases" })}
        </span>
        <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
          {t({ fr: "Ce qu'Ora automatise pour vos équipes", en: "What Ora automates for your teams" })}
        </h2>
        <p className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
          {t({
            fr: "Le travail Excel répétitif et confidentiel de vos équipes finance, contrôle de gestion et opérations, reproduit à l'identique de votre processus. Sans que personne ait à maîtriser Excel.",
            en: "The repetitive, confidential Excel work of your finance, controlling and operations teams, reproduced exactly like your own process. With no one needing to master Excel.",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {cases.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h3 className="font-poppins font-semibold text-[17px] text-gray-900 dark:text-white leading-snug">
                {c.title}
              </h3>
              <p className="font-inter mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {c.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Catch-all: the buyer's exact workflow, even if not listed. */}
      <div className="mt-10 flex flex-col items-center text-center gap-4">
        <p className="font-inter text-base text-gray-600 dark:text-gray-300">
          {t({
            fr: "Votre processus n'est pas dans la liste ? On l'automatise à l'identique, sans template générique.",
            en: "Your process isn't on the list? We automate it exactly as it is, no generic template.",
          })}
        </p>
        <button
          onClick={openBooking}
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px transition-all duration-150"
        >
          {t({ fr: "Décrivez-nous votre workflow", en: "Tell us your workflow" })}
          <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
        </button>
      </div>
    </div>
  );
}
