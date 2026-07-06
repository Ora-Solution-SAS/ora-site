import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, TrendingDown } from "lucide-react";
import { useLang } from "../lib/i18n";
import type { QualifierAnswers } from "./QualifierFlow";

/**
 * Result / "aha" screen shown right after the qualifier, before Cal.com.
 *
 * Purpose: turn the visitor's three taps into a quantified, visceral loss
 * (loss aversion + anchoring), then offer the call as the natural fix.
 *
 * Maths are deliberately conservative:
 *  - 48 working weeks/year (accounts for holidays + leave)
 *  - 90% reduction with Ora (we sell the gap, not perfection)
 *  - bucket → midpoint mapping is anchored on the lower end of each band
 */

const WORK_WEEKS_PER_YEAR = 48;
const HOURS_PER_MONTH_FULLTIME = 160; // 40h/week * 4 weeks
const HOURS_PER_WEEK_FULLTIME = 40;
const ORA_REDUCTION = 0.9; // 90% time saved with Ora

/**
 * Map the hours-bucket id (from QualifierFlow) to a conservative midpoint.
 * Using ids (not labels) so this stays language-agnostic.
 */
function hoursMidpointFromId(hoursId: string): number {
  switch (hoursId) {
    case "lt5":
      return 3;
    case "5to15":
      return 10;
    case "15to30":
      return 22;
    case "gt30":
      return 40;
    default:
      return 8;
  }
}

/**
 * Animate a number from 0 to target over `duration` ms with ease-out cubic.
 */
function useCountUp(target: number, duration = 1400, delay = 250): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const startTimer = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return value;
}

type Props = {
  answers: QualifierAnswers;
  onContinue: () => void;
  onBack: () => void;
};

export default function QualifierResult({ answers, onContinue, onBack }: Props) {
  const { t, lang } = useLang();
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const weeklyHours = hoursMidpointFromId(answers.hours.id);
  const annualLost = weeklyHours * WORK_WEEKS_PER_YEAR;
  const annualWithOra = Math.round(annualLost * (1 - ORA_REDUCTION));
  const annualSaved = annualLost - annualWithOra;

  // Pick the unit (months vs weeks) that gives the most intuitive number
  const months = annualSaved / HOURS_PER_MONTH_FULLTIME;
  const weeks = annualSaved / HOURS_PER_WEEK_FULLTIME;
  const equivalentLabel =
    months >= 1.5
      ? lang === "fr"
        ? `${Math.round(months)} mois de travail à temps plein`
        : `${Math.round(months)} months of full-time work`
      : lang === "fr"
        ? `${Math.round(weeks)} semaines de travail à temps plein`
        : `${Math.round(weeks)} weeks of full-time work`;

  const displayedLost = useCountUp(annualLost);

  return (
    <div className="flex flex-col h-full min-h-[460px] px-6 md:px-8 py-7">
      {/* Header: back arrow + step indicator */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all duration-150"
          aria-label={t({ fr: "Retour", en: "Back" })}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-inter text-[11px] uppercase tracking-[0.16em] text-blue-500 dark:text-blue-400 font-semibold">
          {t({ fr: "Votre estimation", en: "Your estimate" })}
        </p>
        <div className="w-8" />
      </div>

      {/* Headline */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="font-poppins font-semibold text-lg md:text-xl tracking-[-0.02em] leading-snug text-[#111827] dark:text-white"
      >
        {t({
          fr: "Sur la tâche que vous avez identifiée,",
          en: "On the task you flagged,",
        })}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="font-poppins font-medium text-lg md:text-xl tracking-[-0.02em] leading-snug text-gray-500 dark:text-gray-400 mt-0.5"
      >
        {t({ fr: "votre équipe perd", en: "your team loses" })}
      </motion.p>

      {/* Big number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 flex items-baseline gap-2 flex-wrap"
      >
        <span className="font-poppins font-bold text-[3.25rem] md:text-[4.25rem] leading-none tracking-[-0.04em] text-brand-gradient">
          {displayedLost.toLocaleString(locale)}h
        </span>
        <span className="font-inter text-base text-gray-500 dark:text-gray-400">
          {t({ fr: "par an.", en: "per year." })}
        </span>
      </motion.div>

      {/* Equivalent in tangible time units */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-gray-600 dark:text-gray-300"
      >
        {t({
          fr: `Soit l'équivalent de ${equivalentLabel}.`,
          en: `That's the equivalent of ${equivalentLabel}.`,
        })}
      </motion.p>

      {/* With Ora row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 1.05 }}
        className="mt-6 flex items-start gap-3 p-4 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-gradient-to-br from-blue-50/60 to-teal-50/40 dark:from-blue-500/[0.06] dark:to-teal-500/[0.04]"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white flex-shrink-0 mt-0.5">
          <TrendingDown className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter font-semibold text-[14px] text-[#111827] dark:text-white">
            {t({ fr: "Avec Ora :", en: "With Ora:" })}{" "}
            <span className="text-brand-gradient">
              {annualWithOra.toLocaleString(locale)}h
              {t({ fr: "/an", en: "/yr" })}
            </span>
          </p>
          <p className="font-inter text-[12.5px] leading-snug text-gray-500 dark:text-gray-400 mt-1">
            {t({
              fr: `Votre équipe récupère ~${annualSaved.toLocaleString(locale)}h chaque année, sur cette seule tâche.`,
              en: `Your team reclaims ~${annualSaved.toLocaleString(locale)}h every year, on this single task.`,
            })}
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="mt-auto pt-6"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.42)] hover:-translate-y-px transition-all duration-150"
        >
          {t({ fr: "Voir ce qu'on vous offre", en: "See what we've prepared for you" })}
          <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-[3px] transition-transform duration-150" />
        </button>
        <p className="mt-2.5 text-center text-[11.5px] text-gray-400 dark:text-gray-500">
          {t({
            fr: "Estimation conservatrice basée sur 48 semaines travaillées par an.",
            en: "Conservative estimate based on 48 working weeks per year.",
          })}
        </p>
      </motion.div>
    </div>
  );
}
