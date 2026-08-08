/**
 * DeliverablesShowcase — le second encadré de la page de téléchargement,
 * posé à droite du bloc de texte (le texte est à sa gauche).
 *
 * Même grammaire que DownloadShowcase, en composition miroir : le panneau
 * carré penche vers le teal, la fenêtre de l'application déborde à gauche et
 * en bas, et la carte flottante est en bas à droite. Le premier encadré montre
 * la demande, celui-ci montre ce qui sort du logiciel.
 *
 * Toutes les cotes sont en `cqw` (1cqw = 1 % de la largeur du panneau) : la
 * composition garde ses proportions à toutes les tailles d'écran.
 */

import { Check, FileText, Presentation, Table2 } from "lucide-react";
import { useLang } from "../lib/i18n";

const PANEL_LIGHT =
  "radial-gradient(60% 50% at 56% 62%, rgba(255,255,255,0.66), transparent 72%), " +
  "linear-gradient(138deg, #93d2ca 0%, #a9dcd6 26%, #bfdcf1 58%, #a8c5f5 86%, #96b5f2 100%)";

const PANEL_DARK =
  "radial-gradient(60% 50% at 56% 62%, rgba(148,197,255,0.15), transparent 72%), " +
  "linear-gradient(138deg, #10484b 0%, #13484f 26%, #17415e 58%, #1a3a68 86%, #17325f 100%)";

/** Les trois pièces du dossier, dans l'ordre de génération. */
const FILES = [
  {
    icon: Table2,
    tone: "bg-teal-50 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300",
    name: "Bilan développé - Nexio SAS.xlsx",
    fr: "Classeur à formules vivantes",
    en: "Workbook with live formulas",
  },
  {
    icon: FileText,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    name: "Bilan développé - Nexio SAS.pdf",
    fr: "Dossier prêt à envoyer",
    en: "Report ready to send",
  },
  {
    icon: Presentation,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    name: "Bilan développé - Nexio SAS.pptx",
    fr: "Présentation du rendez-vous",
    en: "Deck for the meeting",
  },
];

export default function DeliverablesShowcase({ className = "" }: { className?: string }) {
  const { t } = useLang();

  return (
    <div
      data-shot="deliverables"
      className={`relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-[4cqw] text-left ${className}`}
      style={{ containerType: "inline-size" }}
    >
      <div className="absolute inset-0 dark:hidden" aria-hidden="true" style={{ background: PANEL_LIGHT }} />
      <div
        className="absolute inset-0 hidden dark:block"
        aria-hidden="true"
        style={{ background: PANEL_DARK }}
      />

      {/* ── La fenêtre de l'application, débordante à gauche et en bas ────── */}
      <div className="absolute bottom-[-9cqw] left-[-3cqw] right-[14cqw] top-[11cqw] flex flex-col overflow-hidden rounded-[2.4cqw] bg-white/65 shadow-[0_2cqw_6cqw_-2cqw_rgba(15,23,42,0.30)] ring-[0.16cqw] ring-white/60 backdrop-blur-[2px] dark:bg-white/[0.07] dark:ring-white/10">
        {/* Onglets */}
        <div className="flex shrink-0 items-center gap-[1.2cqw] px-[4.4cqw] pt-[1.8cqw]">
          <span className="inline-flex items-center gap-[1cqw] rounded-[1.2cqw] px-[1.6cqw] py-[0.9cqw] font-inter text-[1.85cqw] font-medium text-[#111827]/45 dark:text-white/45">
            <span className="h-[1.7cqw] w-[1.7cqw] rounded-[0.5cqw] bg-[#111827]/15 dark:bg-white/20" />
            {t({ fr: "Aperçu", en: "Preview" })}
          </span>
          <span className="inline-flex items-center gap-[1cqw] rounded-[1.2cqw] bg-white px-[1.6cqw] py-[0.9cqw] font-inter text-[1.85cqw] font-semibold text-[#111827] shadow-[0_0.4cqw_1.2cqw_-0.6cqw_rgba(15,23,42,0.25)] dark:bg-[#111827] dark:text-white">
            <span className="h-[1.7cqw] w-[1.7cqw] rounded-[0.5cqw] bg-gradient-to-r from-[#3b82f6] to-[#0d9488]" />
            {t({ fr: "Livrables", en: "Deliverables" })}
          </span>
        </div>

        {/* En-tête du dossier */}
        <div className="mt-[2.4cqw] flex shrink-0 items-baseline justify-between px-[4.4cqw]">
          <span className="font-poppins text-[2.5cqw] font-semibold tracking-[-0.01em] text-[#111827] dark:text-white">
            {t({ fr: "Dossier Nexio SAS", en: "Nexio SAS file" })}
          </span>
          <span className="font-inter text-[1.7cqw] text-[#111827]/45 dark:text-white/45">
            {t({ fr: "exercice 2025", en: "FY 2025" })}
          </span>
        </div>

        {/* Les trois pièces */}
        <div className="mt-[2cqw] flex flex-col gap-[1.4cqw] px-[4.4cqw]">
          {FILES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-[2cqw] rounded-[1.6cqw] bg-white/85 px-[2.2cqw] py-[1.8cqw] ring-[0.14cqw] ring-white/70 dark:bg-white/[0.06] dark:ring-white/10"
              >
                <span className={`inline-flex h-[5cqw] w-[5cqw] shrink-0 items-center justify-center rounded-[1.2cqw] ${f.tone}`}>
                  <Icon className="h-[2.6cqw] w-[2.6cqw]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-inter text-[2.1cqw] font-semibold text-[#111827] dark:text-white">
                    {f.name}
                  </span>
                  <span className="block truncate font-inter text-[1.7cqw] text-[#111827]/45 dark:text-white/45">
                    {t(f)}
                  </span>
                </span>
                <Check className="h-[2.4cqw] w-[2.4cqw] shrink-0 text-teal-600 dark:text-teal-400" />
              </div>
            );
          })}
        </div>

        {/* Rappel de la source, qui referme la boucle avec le premier encadré.
            Posé sous les fichiers et bridé en largeur : il reste au-dessus et
            à gauche de la carte flottante, donc toujours lisible. */}
        <div className="mt-[3.4cqw] w-[36cqw] px-[4.4cqw]">
          <span className="block font-inter text-[1.6cqw] uppercase tracking-[0.12em] text-[#111827]/35 dark:text-white/35">
            {t({ fr: "Sources", en: "Sources" })}
          </span>
          <span className="mt-[0.8cqw] block font-inter text-[1.8cqw] leading-[1.5] text-[#111827]/50 dark:text-white/50">
            {t({ fr: "FEC 2025, balance, grand livre", en: "FEC 2025, trial balance, ledger" })}
          </span>
        </div>
      </div>

      {/* ── La carte flottante, en bas à droite ──────────────────────────── */}
      <div className="absolute bottom-[9cqw] left-[30cqw] right-[5cqw] rounded-[3.2cqw] bg-white px-[3.4cqw] py-[3cqw] shadow-[0_2cqw_5cqw_-1.6cqw_rgba(15,23,42,0.30)] dark:bg-[#111827]">
        <div className="flex items-center gap-[1.4cqw]">
          <span className="inline-flex h-[3.2cqw] w-[3.2cqw] items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Check className="h-[2cqw] w-[2cqw]" />
          </span>
          <span className="font-poppins text-[2.4cqw] font-semibold tracking-[-0.01em] text-[#111827] dark:text-white">
            {t({ fr: "Aux couleurs du cabinet", en: "In the firm's colours" })}
          </span>
        </div>
        <p className="mt-[1.6cqw] font-inter text-[1.9cqw] leading-[1.5] text-[#111827]/50 dark:text-white/50">
          {t({
            fr: "Logo, polices et palette appliqués aux trois pièces, sans remise en forme.",
            en: "Logo, fonts and palette applied to all three files, no reformatting.",
          })}
        </p>
        <div className="mt-[2cqw] flex items-center gap-[1cqw]">
          <span className="h-[2cqw] w-[2cqw] rounded-[0.6cqw] bg-[#3b82f6]" />
          <span className="h-[2cqw] w-[2cqw] rounded-[0.6cqw] bg-[#0d9488]" />
          <span className="h-[2cqw] w-[2cqw] rounded-[0.6cqw] bg-[#111827] dark:bg-white/75" />
          <span className="ml-[0.8cqw] font-inter text-[1.7cqw] text-[#111827]/40 dark:text-white/40">
            Cabinet Valmy
          </span>
        </div>
      </div>
    </div>
  );
}
