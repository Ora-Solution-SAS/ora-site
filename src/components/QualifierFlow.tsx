import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Search,
  TrendingUp,
  Building2,
  Calculator,
  Briefcase,
  FileText,
  Layers,
  GitMerge,
  Database,
  MoreHorizontal,
  Clock,
  ArrowLeft,
  Video,
  Phone,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "../lib/i18n";

/**
 * Preply-style multi-step qualifier shown before Cal.com loads.
 *
 * Psychology:
 *  - Each tap is a micro-commitment (Cialdini)
 *  - The user articulates their pain in their own taps (anchoring)
 *  - The team arrives at the call with context (less generic, more useful)
 *
 * Surfaces 3 single-question screens with big tappable cards, then calls
 * onComplete(answers). Each answer carries both a stable `id` (used by the
 * downstream result screen for calculations) and a resolved `label` in the
 * current language (used for Cal.com notes / analytics display).
 */

export type Answer = { id: string; label: string };

export type QualifierAnswers = {
  format: Answer;
  sector: Answer;
  pain: Answer;
  hours: Answer;
};

type Msg = { fr: string; en: string };

type Option = {
  id: string;
  label: Msg;
  icon: LucideIcon;
};

type Step = {
  key: keyof QualifierAnswers;
  question: Msg;
  options: Option[];
};

const STEPS: Step[] = [
  {
    key: "format",
    question: {
      fr: "Comment préférez-vous qu'on échange ?",
      en: "How would you like to meet?",
    },
    options: [
      {
        id: "visio",
        label: { fr: "Visioconférence", en: "Video call" },
        icon: Video,
      },
      {
        id: "phone",
        label: { fr: "Téléphone", en: "Phone call" },
        icon: Phone,
      },
      {
        id: "onsite",
        label: { fr: "Sur place", en: "In person" },
        icon: MapPin,
      },
    ],
  },
  {
    key: "sector",
    question: {
      fr: "Quel est votre métier ?",
      en: "What's your field?",
    },
    options: [
      { id: "audit", label: { fr: "Audit", en: "Audit" }, icon: Search },
      {
        id: "fonds",
        label: { fr: "Fonds d'investissement", en: "Investment fund" },
        icon: TrendingUp,
      },
      {
        id: "banque",
        label: { fr: "Banque d'affaires", en: "Investment banking" },
        icon: Building2,
      },
      {
        id: "expertise",
        label: { fr: "Expertise comptable", en: "Accounting firm" },
        icon: Calculator,
      },
      { id: "autre", label: { fr: "Autre", en: "Other" }, icon: Briefcase },
    ],
  },
  {
    key: "pain",
    question: {
      fr: "Quelle tâche Excel vous coûte le plus de temps ?",
      en: "Which Excel task eats the most of your time?",
    },
    options: [
      {
        id: "reporting",
        label: { fr: "Reporting mensuel", en: "Monthly reporting" },
        icon: FileText,
      },
      {
        id: "consolidation",
        label: { fr: "Consolidation", en: "Consolidation" },
        icon: Layers,
      },
      {
        id: "reconciliation",
        label: { fr: "Réconciliation", en: "Reconciliation" },
        icon: GitMerge,
      },
      {
        id: "data",
        label: { fr: "Mise à jour de données", en: "Data updates" },
        icon: Database,
      },
      {
        id: "autre",
        label: { fr: "Autre", en: "Other" },
        icon: MoreHorizontal,
      },
    ],
  },
  {
    key: "hours",
    question: {
      fr: "Combien d'heures par semaine votre équipe y consacre ?",
      en: "How many hours per week does your team spend on it?",
    },
    options: [
      {
        id: "lt5",
        label: { fr: "Moins de 5h", en: "Less than 5h" },
        icon: Clock,
      },
      { id: "5to15", label: { fr: "5 à 15h", en: "5 to 15h" }, icon: Clock },
      {
        id: "15to30",
        label: { fr: "15 à 30h", en: "15 to 30h" },
        icon: Clock,
      },
      {
        id: "gt30",
        label: { fr: "Plus de 30h", en: "More than 30h" },
        icon: Clock,
      },
    ],
  },
];

type Props = {
  onComplete: (answers: QualifierAnswers) => void;
};

export default function QualifierFlow({ onComplete }: Props) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QualifierAnswers>>({});
  const [direction, setDirection] = useState<1 | -1>(1);

  /* Voir le pavé au rendu du titre : le focus doit suivre l'étape, sinon il
     retombe sur le corps du document à chaque réponse. La première étape est
     EXCLUE — à l'ouverture, c'est la modale qui place le focus sur son premier
     élément, et le lui reprendre ferait sauter deux fois le lecteur.

     ⚠ RÉFÉRENCE DE RAPPEL, ET PAS UN useEffect SUR `step`, et c'est un
     correctif : l'AnimatePresence est en `mode="wait"`, donc au changement
     d'étape l'ancien bloc SORT (260 ms) avant que le nouveau ne soit monté. Un
     effet déclenché sur `step` s'exécute bien avant, alors que la référence
     pointe encore le nœud sortant ou rien du tout — mesuré : le focus restait
     sur `document.body`. Une référence de rappel est appelée au MONTAGE du
     nouveau titre, c'est-à-dire au seul instant où il existe. */
  const focusHeading = useCallback(
    (el: HTMLHeadingElement | null) => {
      if (el && step > 0) el.focus();
    },
    [step],
  );

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleAnswer = (answer: Answer) => {
    const next = { ...answers, [currentStep.key]: answer };
    setAnswers(next);
    if (isLast) {
      // Small delay so the user sees the selected state before the screen swaps
      setTimeout(() => onComplete(next as QualifierAnswers), 180);
    } else {
      setDirection(1);
      setTimeout(() => setStep((s) => s + 1), 180);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[460px] px-6 md:px-8 py-7">
      {/* Header: back arrow + progress dots */}
      <div className="flex items-center justify-between mb-7">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
          aria-label={t({ fr: "Retour", en: "Back" })}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-[#3b82f6]"
                  : i < step
                    ? "w-1.5 bg-blue-500/50 dark:bg-blue-400/50"
                    : "w-1.5 bg-gray-200 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
        <div className="w-8" />
      </div>

      {/* Animated question + options */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col"
          aria-live="polite"
        >
          {/* Le repère d'étape passe en GRIS. En bleu, il rivalisait avec le
              seul accent qui doit compter dans cette colonne, celui de la
              réponse choisie et du bouton. */}
          <p className="mb-2 font-inter text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#6b7688] dark:text-gray-500">
            {t({ fr: "Étape", en: "Step" })} {step + 1} / {STEPS.length}
          </p>
          {/* Instrument Sans, comme tous les grands titres du site depuis le
              2026-08-12 : le Poppins semi-gras appartenait à une génération
              précédente de la page et se voyait dès qu'on ouvrait la fenêtre
              par-dessus une section refaite. */}
          {/* ── LE FOCUS SUIT LA QUESTION (audit du 2026-08-15) ─────────────
              Sélectionner une réponse démonte la `motion.div` qui porte
              l'option focalisée : le focus retombait donc sur `document.body`,
              et l'utilisateur au clavier devait re-tabuler DEPUIS LE HAUT DU
              DOCUMENT à chacune des quatre étapes. Sur le seul chemin de
              conversion du site, en silence.
              Le titre reçoit `tabIndex={-1}` et le focus à chaque changement
              d'étape : le lecteur d'écran annonce la nouvelle question, et la
              tabulation suivante tombe sur la première option.
              `aria-live="polite"` sur le conteneur double l'annonce pour les
              lecteurs qui ne suivent pas le focus. */}
          <h3
            ref={focusHeading}
            tabIndex={-1}
            className="mb-6 font-instrument text-[1.35rem] font-normal leading-[1.16] tracking-[-0.025em] text-[#111827] outline-none dark:text-white md:text-[1.6rem]"
          >
            {t(currentStep.question)}
          </h3>

          <div className="flex flex-col gap-2">
            {currentStep.options.map((opt) => {
              const Icon = opt.icon;
              const resolvedLabel = t(opt.label);
              const isSelected = answers[currentStep.key]?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswer({ id: opt.id, label: resolvedLabel })}
                  /* RAYON COURT ET LISERÉ D'UN PIXEL, à la place du rayon 16 px
                     et du fond bleu pâle : c'est le gabarit des lignes de la
                     maquette Prévisionnel et des panneaux de la page. Le survol
                     ne soulève plus le bouton — un `-translate-y-px` sur cinq
                     options empilées fait sautiller la colonne entière au
                     passage de la souris. */
                  className={`group flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-left ring-1 transition-colors duration-150 ${
                    isSelected
                      ? "bg-[#f4f7fd] ring-[#3b82f6]/45 dark:bg-blue-500/[0.10] dark:ring-blue-500/50"
                      : "bg-white ring-[#0a2540]/[0.09] hover:bg-[#f8fafd] dark:bg-white/[0.02] dark:ring-white/[0.10] dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] ring-1 transition-colors duration-150 ${
                      isSelected
                        ? "bg-white text-[#3b82f6] ring-[#3b82f6]/25 dark:bg-white/10 dark:ring-blue-500/30"
                        : "bg-white text-gray-400 ring-[#0a2540]/[0.09] dark:bg-white/[0.04] dark:text-gray-400 dark:ring-white/10"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                  </div>
                  <span
                    className={`font-inter text-[14px] ${
                      isSelected
                        ? "font-semibold text-[#111827] dark:text-white"
                        : "font-medium text-[#42506b] dark:text-gray-300"
                    }`}
                  >
                    {resolvedLabel}
                  </span>
                  {isSelected && (
                    <span className="ml-auto grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#3b82f6]">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
