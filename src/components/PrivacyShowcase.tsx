import { motion } from "framer-motion";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";

/** Small inline Swiss flag (red rounded square + white cross). */
function SwissFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="#D52B1E" />
      <rect x="13.5" y="7" width="5" height="18" rx="1" fill="#fff" />
      <rect x="7" y="13.5" width="18" height="5" rx="1" fill="#fff" />
    </svg>
  );
}

/**
 * Privacy section — REFONTE sobre et minimaliste (client 2026-08-04, référence
 * monday.com « Les entreprises nous font confiance ») : un grand titre, puis
 * trois cartes plates bord fin sur fond uni. Une carte texte qui porte le
 * détail sécurité avec ses marqueurs réels en pied (RGPD, Suisse, CLOUD Act,
 * MFA), et deux cartes à grand chiffre.
 *
 * Remplace la version « tuiles Joko » : tuiles bleues animées (cadenas, nuage,
 * coche qui se dessinent), halos radiaux, paragraphes dépliés au survol. Tout
 * ce théâtre est retiré au profit du calme monday ; seul reste le fade-up
 * d'entrée, commun à tout le site. L'ancienne version est dans git si besoin.
 *
 * RÈGLE INCHANGÉE (mémoire projet) : aucune preuve fabriquée. Pas de logo
 * SOC 2 / ISO à la monday puisque ces certifications n'existent pas chez Ora ;
 * les deux chiffres affichés (0 et 100 %) sont des engagements réels déjà
 * revendiqués ailleurs sur le site, pas des statistiques inventées.
 */

interface PrivacyShowcaseProps {
  theme: "light" | "dark";
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
} as const;

export default function PrivacyShowcase({ theme }: PrivacyShowcaseProps) {
  const { t } = useLang();
  const dk = theme === "dark";

  const badges = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      label: t({ fr: "Conforme RGPD", en: "GDPR compliant" }),
    },
    {
      icon: <SwissFlag className="w-4 h-4" />,
      label: t({ fr: "Hébergé en Suisse", en: "Hosted in Switzerland" }),
    },
    {
      icon: <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />,
      label: t({ fr: "Hors CLOUD Act", en: "Outside the CLOUD Act" }),
    },
    {
      icon: <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      label: t({ fr: "MFA", en: "MFA" }),
    },
  ];

  const stats = [
    {
      intro: t({
        fr: "Vos fichiers servent à votre travail, à rien d'autre.",
        en: "Your files serve your work, nothing else.",
      }),
      figure: "0",
      caption: t({
        fr: "donnée client utilisée pour entraîner un modèle d'IA",
        en: "client data point used to train an AI model",
      }),
    },
    {
      intro: t({
        fr: "Francfort et Genève, hors de portée du CLOUD Act américain.",
        en: "Frankfurt and Geneva, out of reach of the US CLOUD Act.",
      }),
      figure: "100 %",
      caption: t({
        fr: "de vos données hébergées en Europe, chiffrées avant l'envoi",
        en: "of your data hosted in Europe, encrypted before it is sent",
      }),
    },
  ];

  // Cartes plates : fond uni, bord fin, zéro ombre — la sobriété monday.
  const cardCls = dk
    ? "rounded-[20px] bg-white/[0.03] ring-1 ring-white/[0.08]"
    : "rounded-[20px] bg-white ring-1 ring-gray-200/90";

  return (
    <section
      id="securite"
      data-nav-shy
      className="relative px-6 md:px-12 pt-44 md:pt-64 pb-20 md:pb-28"
      style={{ background: dk ? "#000000" : "#ffffff" }}
    >
      {/* ÉLARGI de 6xl à 7xl (client 2026-08-05 : « pour la partie sécurité à la
          fin fais en sorte d'agrandir les encadrés »). Les trois cartes gagnent
          128 px de large à elles trois, et l'intérieur suit : padding, corps de
          texte et grands chiffres montent d'un cran chacun, sinon les cartes
          n'auraient fait que s'étirer autour du même contenu. */}
      <div className="relative max-w-7xl mx-auto">
        {/* ── Header : gros titre calme, à la monday ─────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-7 md:mb-9"
        >
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {t({ fr: "Confidentialité", en: "Privacy" })}
          </span>
          {/* TITRE FIN ET PETIT (client 2026-08-11 : « des titres bien plus
              fins », et pour celui-ci « beaucoup plus petits et beaucoup plus
              fins »). Deux conséquences sur le code :
              · La face passe de Poppins semibold à Instrument Sans en graisse
                normale. C'est la face fine DÉJÀ en service sur le site (hero,
                page de téléchargement, StackingCards) et l'exception documentée
                à la règle Poppins. On n'utilise PAS font-light sur Poppins :
                le guide de style l'interdit explicitement.
              · Le chasse passe de 3,1 à 2 rem, et la marge sous le bloc de
                12/16 à 7/9 — « les encadrés juste en dessous ». Le titre reste
                au-dessus des titres de cartes (1,75 rem) : la hiérarchie tient
                par la taille ET par le contraste de graisse, fine pour la
                section, semibold pour les cartes. */}
          <h2 className="font-instrument font-normal text-[1.55rem] md:text-[2rem] tracking-[-0.02em] leading-[1.15] text-[#111827] dark:text-white mt-3">
            {t({ fr: "Vos données vous appartiennent.", en: "Your data belongs to you." })}
          </h2>
        </motion.div>

        {/* ── Trois cartes plates : texte sécurité + deux grands chiffres ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr] gap-5 md:gap-7 items-stretch">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`${cardCls} p-9 md:p-12 flex flex-col md:col-span-2 lg:col-span-1`}
          >
            <h3 className="font-poppins font-semibold text-2xl md:text-[1.75rem] tracking-[-0.02em] text-[#111827] dark:text-white">
              {t({ fr: "Sécurité de bout en bout", en: "End-to-end security" })}
            </h3>
            <p className="font-inter mt-5 text-[16px] md:text-[17px] leading-relaxed text-gray-500 dark:text-gray-400">
              {t({
                fr: "Le traitement s'exécute en local, sur votre machine. Avec Atlas, notre orchestration de fichiers, vos données sont chiffrées sur votre appareil avant tout envoi : nos serveurs ne stockent que des données illisibles. L'accès est cloisonné par organisation, équipe et utilisateur, refusé par défaut.",
                en: "Processing runs locally, on your machine. With Atlas, our file orchestration, your data is encrypted on your device before anything is sent: our servers only store unreadable data. Access is isolated per organisation, team and user, denied by default.",
              })}
            </p>
            {/* Marqueurs réels en pied de carte, là où monday pose ses logos. */}
            <div className="mt-auto pt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-inter text-[14px] font-medium text-gray-500 dark:text-gray-400">
              {badges.map((b) => (
                <span key={b.label} className="inline-flex items-center gap-2">
                  {b.icon}
                  {b.label}
                </span>
              ))}
            </div>
          </motion.div>

          {stats.map((s, i) => (
            <motion.div
              key={s.figure}
              {...fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 * (i + 1) }}
              className={`${cardCls} p-9 md:p-12 flex flex-col items-center text-center`}
            >
              <p className="font-inter text-[15px] md:text-[16px] leading-relaxed text-gray-500 dark:text-gray-400">
                {s.intro}
              </p>
              <div className="flex-1 flex items-center py-6">
                <span className="font-poppins font-semibold text-[4.6rem] md:text-[5.6rem] leading-none tracking-[-0.03em] text-[#111827] dark:text-white">
                  {s.figure}
                </span>
              </div>
              <p className="font-inter font-semibold text-[15px] md:text-[16px] leading-snug text-[#111827] dark:text-white max-w-[260px]">
                {s.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
