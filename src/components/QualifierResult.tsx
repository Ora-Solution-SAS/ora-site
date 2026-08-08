import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CalendarCheck } from "lucide-react";
import { useLang } from "../lib/i18n";
import type { QualifierAnswers } from "./QualifierFlow";

/**
 * Result screen shown right after the qualifier, before Cal.com.
 *
 * RÉÉCRIT le 2026-08-03, client : « un formulaire moins pompeux en heures
 * gagnées ». La version précédente en faisait trop, sur trois plans à la fois :
 *
 *  1. Elle annonçait jusqu'à 1 920 h perdues par an en corps 4,25 rem, puis
 *     « soit l'équivalent de 11 mois de travail à temps plein ». Le lecteur d'un
 *     cabinet sait compter : un chiffre présenté comme un choc se lit comme un
 *     argument de vente, et l'effet se retourne.
 *  2. Elle promettait une réduction de 90 % (ORA_REDUCTION = 0.9). Ce chiffre ne
 *     reposait sur aucune mesure. Il est SUPPRIMÉ, pas adouci : une fourchette
 *     inventée resterait inventée.
 *  3. Son bouton disait « Voir ce qu'on vous offre » et menait au calendrier,
 *     l'étape cadeau étant désactivée. Il promettait donc ce que l'écran suivant
 *     ne tenait pas.
 *
 * Ce qui reste est le seul chiffre réellement fondé : celui que le visiteur
 * vient de donner, annualisé. L'arithmétique est affichée à côté du résultat
 * pour qu'il puisse la refaire de tête, ce qui vaut mieux qu'un gros nombre à
 * prendre sur parole. La persuasion tient alors à sa propre réponse, pas à la
 * nôtre.
 */

/** 48 et non 52 : congés et jours fériés déduits. Volontairement bas. */
const WORK_WEEKS_PER_YEAR = 48;

/** Milieu de tranche, ancré sur le BAS de chaque fourchette : « 5 à 15h »
 *  devient 8 et non 10. On préfère sous-estimer, un chiffre gonflé se retourne
 *  contre nous dès que l'interlocuteur le vérifie.
 *  Indexé sur les identifiants, pas les libellés, pour rester indépendant de la
 *  langue affichée. */
function hoursMidpointFromId(hoursId: string): number {
  switch (hoursId) {
    case "lt5":
      return 3;
    case "5to15":
      return 8;
    case "15to30":
      return 18;
    case "gt30":
      return 32;
    default:
      return 8;
  }
}

/** Compte de 0 à la cible. Conservé, mais plus lent et sur un nombre plus
 *  petit : il souligne le chiffre au lieu de le mettre en scène. */
function useCountUp(target: number, duration = 1100, delay = 300): number {
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
  const annualHours = weeklyHours * WORK_WEEKS_PER_YEAR;
  const displayed = useCountUp(annualHours);

  // La tâche que le visiteur vient de désigner, reprise telle quelle. C'est ce
  // qui rend l'écran concret : on lui parle de SON sujet, pas d'un cas générique.
  const tache = answers.pain.label.toLowerCase();

  return (
    <div className="flex flex-col h-full min-h-[460px] px-6 md:px-8 py-7">
      {/* En-tête : retour + repère d'étape */}
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
          {t({ fr: "Ce que vous nous avez dit", en: "What you told us" })}
        </p>
        <div className="w-8" />
      </div>

      {/* Rappel de sa propre réponse, avant le chiffre. L'ordre compte : le
          lecteur reconnaît d'abord sa phrase, donc il accepte le calcul. */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="font-inter text-[15px] leading-relaxed text-gray-600 dark:text-gray-300"
      >
        {t({
          fr: `Environ ${weeklyHours} h par semaine sur ${tache}.`,
          en: `Around ${weeklyHours} h a week on ${tache}.`,
        })}
      </motion.p>

      {/* Le chiffre. Corps 3 rem et non 4,25, et bleu de marque plein plutôt que
          le dégradé, qui virait au vert sur les nombres longs. */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 flex items-baseline gap-2.5 flex-wrap"
      >
        <span className="font-poppins font-semibold text-[2.75rem] md:text-[3rem] leading-none tracking-[-0.035em] text-[#2563eb] dark:text-blue-400">
          {displayed.toLocaleString(locale)} h
        </span>
        <span className="font-inter text-[15px] text-gray-500 dark:text-gray-400">
          {t({ fr: "sur l'année.", en: "over the year." })}
        </span>
      </motion.div>

      {/* L'arithmétique en clair, juste sous le résultat : le lecteur peut la
          refaire de tête. Un chiffre vérifiable convainc mieux qu'un chiffre
          spectaculaire. */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-2 font-inter text-[12.5px] text-gray-400 dark:text-gray-500"
      >
        {t({
          fr: `${weeklyHours} h x ${WORK_WEEKS_PER_YEAR} semaines travaillées, congés déduits.`,
          en: `${weeklyHours} h x ${WORK_WEEKS_PER_YEAR} working weeks, leave excluded.`,
        })}
      </motion.p>

      {/* Ce que fait l'appel. Aucune promesse chiffrée : c'est précisément la
          ligne où la version précédente annonçait 90 % de gain. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.7 }}
        className="mt-6 flex items-start gap-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/60 dark:border-white/[0.08] dark:bg-blue-500/[0.06]"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2563eb] text-white flex-shrink-0 mt-0.5">
          <CalendarCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter font-semibold text-[14px] text-[#111827] dark:text-white">
            {t({ fr: "En 30 minutes", en: "In 30 minutes" })}
          </p>
          <p className="font-inter text-[12.5px] leading-relaxed text-gray-600 dark:text-gray-400 mt-1">
            {t({
              fr: "on regarde ces heures de près et on vous dit lesquelles Ora peut reprendre, sur vos propres fichiers. Franchement, y compris si la réponse est peu.",
              en: "we look at those hours closely and tell you which ones Ora can take over, on your own files. Straight, including if the answer is not many.",
            })}
          </p>
        </div>
      </motion.div>

      {/* Bouton. Le libellé dit désormais ce qui arrive vraiment ensuite : le
          calendrier. « Voir ce qu'on vous offre » renvoyait à l'étape cadeau,
          qui est désactivée. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-auto pt-6"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-[#2563eb] shadow-[0_2px_12px_rgba(37,99,235,0.28)] hover:bg-[#1d4ed8] hover:shadow-[0_4px_24px_rgba(37,99,235,0.38)] hover:-translate-y-px transition-all duration-150"
        >
          {t({ fr: "Choisir mon créneau", en: "Pick my slot" })}
          <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-[3px] transition-transform duration-150" />
        </button>
        <p className="mt-2.5 text-center font-inter text-[11.5px] text-gray-400 dark:text-gray-500">
          {t({
            fr: "30 min, gratuit, sans engagement.",
            en: "30 min, free, no commitment.",
          })}
        </p>
      </motion.div>
    </div>
  );
}
