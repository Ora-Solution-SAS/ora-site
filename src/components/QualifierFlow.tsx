import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
                  ? "w-6 bg-gradient-to-r from-[#3b82f6] to-[#0d9488]"
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
        >
          <p className="font-inter text-[11px] uppercase tracking-[0.16em] text-blue-500 dark:text-blue-400 font-semibold mb-2">
            {t({ fr: "Étape", en: "Step" })} {step + 1} / {STEPS.length}
          </p>
          <h3 className="font-poppins font-semibold text-xl md:text-[1.6rem] tracking-[-0.02em] leading-[1.2] text-[#111827] dark:text-white mb-6">
            {t(currentStep.question)}
          </h3>

          <div className="flex flex-col gap-2.5">
            {currentStep.options.map((opt) => {
              const Icon = opt.icon;
              const resolvedLabel = t(opt.label);
              const isSelected = answers[currentStep.key]?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswer({ id: opt.id, label: resolvedLabel })}
                  className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all duration-150 ${
                    isSelected
                      ? "border-blue-400 dark:border-blue-500/60 bg-blue-50/70 dark:bg-blue-500/[0.10]"
                      : "border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.05] hover:-translate-y-px"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-colors duration-150 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white"
                        : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-inter font-medium text-[14.5px] text-[#111827] dark:text-white">
                    {resolvedLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
