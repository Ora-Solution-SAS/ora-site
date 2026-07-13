import { Check, X } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * ProblemSection — clean two-column comparison (Softriver-style): no cards,
 * just two columns with row dividers. Left (without Ora) muted with grey ✕,
 * right (with Ora) dark with brand-gradient ✓. No fabricated stats.
 *
 * Entrance: the header fades up in sequence, then each column staggers its
 * rows in with a directional slide (Avec Ora from the left, Sans Ora from the
 * right) and a small icon pop. Everything plays once, when scrolled into view.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const rowFrom = (dir: -1 | 1): Variants => ({
  hidden: { opacity: 0, x: dir * 22, y: 8 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: EASE } },
});
const iconPop: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 18, delay: 0.06 } },
};

const rowLeft = rowFrom(-1);
const rowRight = rowFrom(1);

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
      <motion.div
        className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.span
          className="block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400"
          variants={itemUp}
        >
          {t({ fr: "Le problème", en: "The problem" })}
        </motion.span>
        <motion.h2
          className="font-poppins font-medium text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4"
          variants={itemUp}
        >
          {t({ fr: "Votre Excel vous coûte plus que du temps", en: "Your Excel work costs more than time" })}
        </motion.h2>
        <motion.p
          className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400"
          variants={itemUp}
        >
          {t({
            fr: "Le travail Excel des équipes finance est lent, manuel et risqué, sur des données qu'on ne peut confier à personne.",
            en: "Finance teams' Excel work is slow, manual and risky, on data that can't be handed to anyone.",
          })}
        </motion.p>
      </motion.div>

      {/* Two framed comparison panels. "Avec Ora" is a solid light-blue
          brand card with white text; "Sans Ora" a greyish-white card with
          dark text — deliberately mute next to the blue one. */}
      <div data-nav-shy className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* With Ora — dark text + brand ✓ */}
          <motion.div
            className="rounded-3xl bg-gradient-to-br from-[#4f93f7] to-[#3b82f6] dark:from-[#3b82f6] dark:to-[#2f6fe0] border border-blue-400/40 dark:border-blue-300/25 shadow-[0_28px_70px_-30px_rgba(59,130,246,0.55)] hover:shadow-[0_40px_90px_-28px_rgba(59,130,246,0.7)] transition-shadow duration-300 p-7 md:p-9"
            whileHover={{ y: -6, scale: 1.012 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h3
              className="font-poppins font-medium text-2xl md:text-[1.9rem] tracking-[-0.02em] text-white mb-1"
              variants={rowLeft}
            >
              {t({ fr: "Avec Ora", en: "With Ora" })}
            </motion.h3>
            <div className="mt-5 border-t border-white/25">
              {gains.map((g, i) => (
                <motion.div key={i} className="flex items-center gap-3.5 min-h-[72px] border-b last:border-b-0 border-white/25" variants={rowLeft}>
                  <motion.span
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                    variants={iconPop}
                  >
                    <Check className="w-4 h-4 text-[#3b82f6]" strokeWidth={3} />
                  </motion.span>
                  <span className="font-inter text-base md:text-[17px] leading-snug text-white">{g}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Without Ora — muted */}
          <motion.div
            className="rounded-3xl bg-gray-100/80 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 shadow-[0_24px_60px_-40px_rgba(17,24,39,0.18)] hover:shadow-[0_34px_80px_-36px_rgba(17,24,39,0.3)] transition-shadow duration-300 p-7 md:p-9"
            whileHover={{ y: -6, scale: 1.012 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h3
              className="font-poppins font-medium text-2xl md:text-[1.9rem] tracking-[-0.02em] text-gray-900 dark:text-white mb-1"
              variants={rowRight}
            >
              {t({ fr: "Sans Ora", en: "Without Ora" })}
            </motion.h3>
            <div className="mt-5 border-t border-gray-200 dark:border-white/10">
              {pains.map((p, i) => (
                <motion.div key={i} className="flex items-center gap-3.5 min-h-[72px] border-b last:border-b-0 border-gray-200 dark:border-white/10" variants={rowRight}>
                  <motion.span
                    className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0"
                    variants={iconPop}
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={3} />
                  </motion.span>
                  <span className="font-inter text-base md:text-[17px] leading-snug text-gray-900 dark:text-gray-100">{p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
    </div>
  );
}
