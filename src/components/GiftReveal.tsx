import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Gift, Sparkles, CheckCircle2 } from "lucide-react";
import { useLang } from "../lib/i18n";
import type { QualifierAnswers } from "./QualifierFlow";

/**
 * Gift / reciprocity screen — shown after the loss estimate, before Cal.com.
 *
 * Persuasion design (discussed with the client, McKinsey-style):
 *  - Reciprocity (Cialdini): we hand real value BEFORE asking for the call.
 *  - "Already prepared for you": the automation is framed as present + made
 *    for their exact profile, not an abstract future freebie → open loop that
 *    the call closes.
 *  - Contrast: the personalized before/after video shows the current manual
 *    pain vs Ora, then the 3rd act — what the reclaimed time becomes (advisory,
 *    client relationships). That 3rd act is what sells.
 *
 * The gift is personalized from the qualifier's `sector` answer.
 */

type Msg = { fr: string; en: string };

export interface SectorGift {
  /** The "already prepared" automation, phrased as a gift. */
  automation: Msg;
  /** Per-profile before/after video. */
  videoSrc: string;
  /** Small caption shown above the video. */
  videoLabel: Msg;
  /** What the reclaimed time becomes (3rd act of the contrast). */
  freedTime: Msg;
}

/**
 * IMPORTANT — placeholder videos.
 * `videoSrc` currently points at existing automation clips so the feature
 * works today. Replace each with a real 3-act "before → Ora → reclaimed time"
 * video per profile (drop files e.g. in /public/gift/ and update the paths).
 */
const GIFT_BY_SECTOR: Record<string, SectorGift> = {
  expertise: {
    automation: {
      fr: "une automatisation de rapprochement bancaire",
      en: "a bank reconciliation automation",
    },
    videoSrc: "/ora_story3-v2.mp4",
    videoLabel: {
      fr: "Rapprochement bancaire · avant / après",
      en: "Bank reconciliation · before / after",
    },
    freedTime: {
      fr: "du temps rendu au conseil et à la relation client",
      en: "time given back to advisory and client relationships",
    },
  },
  audit: {
    automation: {
      fr: "une automatisation de lettrage et de tests de détail",
      en: "a matching & test-of-detail automation",
    },
    videoSrc: "/feature-automate-v3.mp4",
    videoLabel: {
      fr: "Lettrage & tests · avant / après",
      en: "Matching & tests · before / after",
    },
    freedTime: {
      fr: "du temps rendu aux zones de risque et au jugement",
      en: "time given back to risk areas and judgment",
    },
  },
  banque: {
    automation: {
      fr: "une automatisation de retraitement de data room",
      en: "a data-room retreatment automation",
    },
    videoSrc: "/feature-automate-v2.mp4",
    videoLabel: {
      fr: "Data room · avant / après",
      en: "Data room · before / after",
    },
    freedTime: {
      fr: "du temps rendu à l'analyse du deal",
      en: "time given back to deal analysis",
    },
  },
  fonds: {
    automation: {
      fr: "une automatisation de reporting portefeuille",
      en: "a portfolio reporting automation",
    },
    videoSrc: "/ora_story4-v2.mp4",
    videoLabel: {
      fr: "Reporting portefeuille · avant / après",
      en: "Portfolio reporting · before / after",
    },
    freedTime: {
      fr: "du temps rendu à l'analyse et à la relation LP",
      en: "time given back to analysis and LP relationships",
    },
  },
  autre: {
    automation: {
      fr: "une automatisation sur mesure pour votre métier",
      en: "a custom automation for your work",
    },
    videoSrc: "/try1.mp4",
    videoLabel: {
      fr: "Automatisation · avant / après",
      en: "Automation · before / after",
    },
    freedTime: {
      fr: "du temps rendu à l'analyse et au conseil",
      en: "time given back to analysis and advisory",
    },
  },
};

/** Resolve the gift for a qualifier sector id (falls back to "autre"). */
export function giftForSector(id: string): SectorGift {
  return GIFT_BY_SECTOR[id] ?? GIFT_BY_SECTOR.autre;
}

type Props = {
  answers: QualifierAnswers;
  onContinue: () => void;
  onBack: () => void;
};

export default function GiftReveal({ answers, onContinue, onBack }: Props) {
  const { t } = useLang();
  const gift = giftForSector(answers.sector.id);

  return (
    <div className="flex flex-col h-full min-h-[460px] px-6 md:px-8 py-7">
      {/* Header: back + eyebrow */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all duration-150"
          aria-label={t({ fr: "Retour", en: "Back" })}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-inter text-[11px] uppercase tracking-[0.16em] text-blue-500 dark:text-blue-400 font-semibold">
          {t({ fr: "Votre cadeau", en: "Your gift" })}
        </p>
        <div className="w-8" />
      </div>

      {/* Headline */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="font-poppins font-semibold text-lg md:text-xl tracking-[-0.02em] leading-snug text-[#111827] dark:text-white"
      >
        {t({
          fr: "On vous a déjà préparé quelque chose.",
          en: "We've already prepared something for you.",
        })}
      </motion.h3>

      {/* Personalized before/after video */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4"
      >
        <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500 font-semibold mb-2">
          {t(gift.videoLabel)}
        </p>
        <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.03]">
          <video
            src={gift.videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full aspect-video object-cover block"
          />
        </div>
      </motion.div>

      {/* 3-act benefit caption */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-4 text-[14.5px] md:text-[15px] leading-relaxed text-gray-600 dark:text-gray-300"
      >
        {t({
          fr: "Ce qui vous prend une matinée aujourd'hui, en un clic. À la clé, ",
          en: "What takes you a whole morning today, in one click. In return, ",
        })}
        <span className="font-semibold text-[#111827] dark:text-white">{t(gift.freedTime)}</span>.
      </motion.p>

      {/* The gift, made concrete */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-4 p-4 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-gradient-to-br from-blue-50/60 to-teal-50/40 dark:from-blue-500/[0.06] dark:to-teal-500/[0.04]"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-inter font-semibold text-[13px] text-[#111827] dark:text-white">
            {t({ fr: "On vous offre, pour l'appel :", en: "For the call, we're giving you:" })}
          </span>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-[15px] h-[15px] text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <span className="font-inter text-[13px] leading-snug text-gray-700 dark:text-gray-200">
              {t({ fr: "Un audit d'automatisation de vos fichiers, offert.", en: "A free automation audit of your files." })}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Sparkles className="w-[15px] h-[15px] text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="font-inter text-[13px] leading-snug text-gray-700 dark:text-gray-200">
              {t({ fr: "Déjà prête pour vous : ", en: "Already prepared for you: " })}
              <span className="font-semibold text-[#111827] dark:text-white">{t(gift.automation)}</span>
              {t({ fr: ", mise en place en direct.", en: ", set up live." })}
            </span>
          </li>
        </ul>
      </motion.div>

      {/* CTA → calendar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mt-auto pt-5"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.42)] hover:-translate-y-px transition-all duration-150"
        >
          {t({ fr: "Réserver mon créneau et récupérer mon cadeau", en: "Book my slot and claim my gift" })}
          <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-[3px] transition-transform duration-150" />
        </button>
      </motion.div>
    </div>
  );
}
