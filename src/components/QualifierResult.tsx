import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useLang } from "../lib/i18n";
import type { QualifierAnswers } from "./QualifierFlow";

/**
 * L'écran posé entre le questionnaire et le calendrier.
 *
 * ── LE CHIFFRE ANNUEL A ÉTÉ RETIRÉ (client 2026-08-15) ─────────────────────
 * « La partie appel est un peu bullshit. » Le mot visait ce qu'il y avait au
 * milieu de cet écran : un compteur qui montait jusqu'à « 1 440 h sur l'année »
 * en corps 3 rem, obtenu en multipliant une tranche déclarée par 48 semaines.
 *
 * Le raisonnement de la version précédente était que ce chiffre venait du
 * visiteur, donc qu'il était honnête. Il l'était arithmétiquement, et il restait
 * un calcul de vendeur : personne ne coche « 5 à 15 h » en pensant à un total
 * annuel, et le lui renvoyer en grand, c'est lui faire dire quelque chose qu'il
 * n'a pas dit. Un directeur financier lit ce compteur pour ce qu'il est, la
 * mise en scène d'une réponse à choix multiples. Le retirer coûte un effet et
 * fait gagner la seule chose qui compte ici, d'être cru.
 *
 * CE QUI LE REMPLACE ne contient AUCUN nombre calculé par nous : les quatre
 * réponses relues telles quelles, puis trois lignes sur ce que fait la
 * demi-heure. La preuve passe du chiffre à la précision — le visiteur reconnaît
 * ses propres mots, ce qui est le seul « nous avons compris » qui ne se fabrique
 * pas. Les constantes qui servaient au calcul (WORK_WEEKS_PER_YEAR, les milieux
 * de tranche, le compteur useCountUp) sont parties avec.
 *
 * MISE EN PAGE : la grammaire du reste du site, celle des panneaux et de la
 * maquette Prévisionnel — des LIGNES séparées par des filets d'un pixel,
 * libellé effacé à gauche, valeur en encre à droite. Plus de carte bleue à
 * liseré arrondi, plus de pastille d'icône pleine.
 */

type Props = {
  answers: QualifierAnswers;
  onContinue: () => void;
  onBack: () => void;
};

export default function QualifierResult({ answers, onContinue, onBack }: Props) {
  const { t } = useLang();

  /* Les quatre réponses, relues dans l'ordre où elles ont été données. Les
     libellés sont ceux des boutons, pas des reformulations : une reformulation,
     même fidèle, rouvrirait la question de savoir si on a bien compris. */
  const recap = [
    { k: t({ fr: "Métier", en: "Field" }), v: answers.sector.label },
    { k: t({ fr: "Ce qui coûte le plus", en: "Biggest cost" }), v: answers.pain.label },
    { k: t({ fr: "Temps par semaine", en: "Time per week" }), v: answers.hours.label },
    { k: t({ fr: "Format", en: "Format" }), v: answers.format.label },
  ];

  /* Ce que fait l'appel, en trois gestes VÉRIFIABLES le jour même. Aucun
     pourcentage, aucune durée gagnée : la troisième ligne dit d'ailleurs que le
     plan repart avec le visiteur même s'il ne signe pas, ce qui est la seule
     façon de rendre les deux premières crédibles. */
  const call = [
    t({
      fr: "On ouvre un de vos fichiers et on refait le trajet à la main, avec vous.",
      en: "We open one of your files and walk through it by hand, with you.",
    }),
    t({
      fr: "On vous dit ce qu'Ora reprend, et ce qu'il ne reprend pas.",
      en: "We tell you what Ora takes over, and what it does not.",
    }),
    t({
      fr: "Vous repartez avec le plan écrit, que vous alliez plus loin ou non.",
      en: "You leave with the plan in writing, whether you go further or not.",
    }),
  ];

  return (
    <div className="flex h-full min-h-[460px] flex-col px-6 py-7 md:px-8">
      {/* En-tête : retour + repère d'étape */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-all duration-150 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          aria-label={t({ fr: "Retour", en: "Back" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="font-inter text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#6b7688] dark:text-gray-500">
          {t({ fr: "Ce que vous nous avez dit", en: "What you told us" })}
        </p>
        <div className="w-8" />
      </div>

      {/* LE RÉCAPITULATIF, en lignes à filets. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        {recap.map((r) => (
          <div
            key={r.k}
            className="flex items-baseline justify-between gap-6 border-t border-[#0a2540]/[0.08] py-2.5 first:border-t-0 dark:border-white/10"
          >
            <span className="shrink-0 font-inter text-[12.5px] text-[#6b7688] dark:text-gray-500">{r.k}</span>
            <span className="text-right font-inter text-[13.5px] font-medium text-[#111827] dark:text-white">
              {r.v}
            </span>
          </div>
        ))}
      </motion.div>

      {/* CE QUE FAIT L'APPEL. Le titre est une petite capitale espacée, comme
          les intitulés de section des maquettes : il annonce un bloc, il ne
          rivalise pas avec le récapitulatif au-dessus. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="mt-7"
      >
        <p className="font-inter text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#6b7688] dark:text-gray-500">
          {t({ fr: "Ce qu'on fait en 30 minutes", en: "What we do in 30 minutes" })}
        </p>
        <ul className="mt-3">
          {call.map((li) => (
            <li
              key={li}
              className="flex items-start gap-2.5 border-t border-[#0a2540]/[0.08] py-2.5 first:border-t-0 dark:border-white/10"
            >
              <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[#3b82f6]" strokeWidth={2.6} />
              <span className="font-inter text-[13px] leading-relaxed text-[#42506b] dark:text-gray-300">{li}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Bouton. Rayon court comme les boutons de section du site, et non la
          pilule : c'est la même famille que « Télécharger l'application » et
          « Essayer dans le navigateur ». */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        className="mt-auto pt-6"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group inline-flex w-full items-center justify-center gap-2.5 rounded-[8px] bg-[#3b82f6] px-6 py-3.5 font-inter text-[14.5px] font-semibold text-white transition-colors duration-150 hover:bg-[#2563eb]"
        >
          {t({ fr: "Choisir mon créneau", en: "Pick my slot" })}
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </div>
  );
}
