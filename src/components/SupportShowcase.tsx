import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import DownloadShowcase from "./DownloadShowcase";

/**
 * SupportShowcase — section « Accompagnement » (client 2026-08-11).
 *
 * LA DEMANDE, mot pour mot : « le but, c'est de leur faire comprendre qu'on les
 * accompagne dans la prise en main du logiciel et qu'on est accessible à tout
 * le monde à tout moment. Ils peuvent prendre un rendez-vous avec nous à tout
 * moment, même le week-end, à partir de rendez-vous qui peuvent être pris dans
 * la partie Mon espace Ora. La réplication du screen, c'est pour leur faire
 * comprendre que c'est un logiciel desktop qui s'installe assez facilement. »
 *
 * LE VISUEL EST RÉUTILISÉ, PAS RECOPIÉ. La capture fournie est le hero de la
 * page de téléchargement, et son panneau est déjà un composant autonome
 * (DownloadShowcase : dimensionné en cqw, thème géré en interne, aucune prop de
 * contexte). Le rendre une seconde fois ici donne la réplication exacte
 * demandée, et les deux emplacements ne pourront jamais diverger.
 *
 * LA COMPOSITION suit la capture : panneau à gauche, discours à droite, eyebrow
 * bleu, titre fin en deux temps dont le second en dégradé de marque. Le titre
 * est en Instrument Sans graisse normale, la face fine du site, comme les
 * titres de Privacy et Control retravaillés le même jour.
 *
 * CE QUI N'Y EST PAS, ET POURQUOI : les deux boutons « Télécharger pour Mac /
 * Windows » de la capture. L'objectif n°1 du site est la prise de rendez-vous ;
 * poser un téléchargement en concurrence du CTA ici enverrait le visiteur
 * ailleurs juste avant la FAQ. Le fait que ce soit une application de bureau
 * qui s'installe vite est donc dit par la ligne de plateformes et par le
 * panneau, pas par un second bouton.
 *
 * AUCUNE PREUVE FABRIQUÉE (règle projet) : pas de délai de réponse, pas de
 * nombre de cabinets accompagnés, pas de note de satisfaction. Seulement ce qui
 * est vrai et vérifiable côté produit.
 *
 * ⚠ À VENIR : une vidéo doit remplacer ou compléter le panneau de gauche
 * (« mon but à plus tard, c'est de faire une vidéo pour cette partie aussi pour
 * expliquer tout ça »). Le point d'insertion est la colonne de gauche ci-
 * dessous ; le reste de la section n'aura pas à bouger.
 */

interface SupportShowcaseProps {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: "espace-client") => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
} as const;

export default function SupportShowcase({ theme, openBooking, onNavigate }: SupportShowcaseProps) {
  const { t } = useLang();
  const dk = theme === "dark";

  // Trois promesses en liste filetée, sans icône : même langage que la page de
  // téléchargement, dont cette section reprend la mise en scène.
  const rows = [
    {
      title: t({ fr: "Installée en quelques secondes", en: "Installed in seconds" }),
      body: t({
        fr: "Une application de bureau, sur Mac comme sur Windows. Un fichier à ouvrir, rien à paramétrer, et le traitement reste sur votre machine.",
        en: "A desktop app, on Mac and on Windows. One file to open, nothing to configure, and processing stays on your machine.",
      }),
    },
    {
      title: t({ fr: "Un rendez-vous quand vous voulez", en: "A meeting whenever you want" }),
      body: t({
        fr: "Depuis Mon espace Ora, vous ouvrez le calendrier et vous prenez le créneau qui vous arrange. Les week-ends sont ouverts.",
        en: "From My Ora space, you open the calendar and take the slot that suits you. Weekends are open.",
      }),
    },
    {
      title: t({ fr: "Sans profil technique", en: "No technical background needed" }),
      body: t({
        fr: "Aucun langage à apprendre. On paramètre vos premiers traitements avec vous, et si une tâche résiste, on la reprend ensemble.",
        en: "No language to learn. We set up your first runs with you, and if a task resists, we go through it together.",
      }),
    },
  ];

  return (
    <section
      id="accompagnement"
      data-nav-shy
      // Fond de CONTRASTE (#fcfbf7 / #0f172a) : la section est prise entre
      // Contrôle total et la FAQ, toutes deux en blanc pur ou noir pur. Sans
      // cette respiration, l'accompagnement se lirait comme la suite du bloc
      // sécurité alors qu'il change complètement de sujet.
      className="relative px-6 md:px-12 py-24 md:py-32"
      style={{ background: dk ? "#0f172a" : "#fcfbf7" }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Colonne visuelle. Sur mobile elle passe SOUS le discours : le
            panneau est carré, il mangerait le premier écran avant qu'on ait lu
            de quoi il s'agit. C'est aussi ici que viendra la vidéo. */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          <DownloadShowcase />
        </motion.div>

        <div className="order-1 lg:order-2">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400"
          >
            {t({ fr: "Accompagnement", en: "Support" })}
          </motion.p>

          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            className="mt-3 font-instrument font-normal tracking-[-0.025em] leading-[1.08] text-[2.1rem] md:text-[2.6rem] xl:text-[2.9rem] text-[#111827] dark:text-white"
          >
            {t({ fr: "La prise en main, ", en: "Getting started, " })}
            <span className="text-brand-gradient">
              {t({ fr: "on la fait ensemble.", en: "we do it together." })}
            </span>
          </motion.h2>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mt-6 max-w-xl font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400"
          >
            {t({
              fr: "Ora s'installe sur votre poste, puis on reste là. Un rendez-vous suffit pour qu'on configure vos premiers traitements avec vous, à votre rythme, aussi souvent que nécessaire.",
              en: "Ora installs on your machine, then we stay around. One meeting is enough for us to set up your first runs with you, at your pace, as often as needed.",
            })}
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
            className="mt-8 max-w-xl divide-y divide-gray-200/70 border-t border-gray-200/70 dark:divide-white/10 dark:border-white/10"
          >
            {rows.map((r) => (
              <div key={r.title} className="py-4">
                <h3 className="font-poppins font-semibold text-[15.5px] tracking-[-0.01em] text-[#111827] dark:text-white">
                  {r.title}
                </h3>
                <p className="mt-1.5 font-inter text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-400">
                  {r.body}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={openBooking}
              className="group inline-flex items-center gap-2 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] px-6 py-3 font-inter font-semibold text-[14.5px] text-white shadow-[0_2px_12px_rgba(59,130,246,0.28)] transition-all duration-150 hover:-translate-y-px"
            >
              {t({ fr: "Réserver un appel", en: "Book a call" })}
              <ArrowUpRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            {/* Second bouton vers Mon espace Ora : c'est LÀ que vivent les
                rendez-vous une fois client, la section doit donc y mener. */}
            <button
              type="button"
              onClick={() => onNavigate("espace-client")}
              className="inline-flex items-center rounded-full border border-gray-300 dark:border-white/15 px-6 py-3 font-inter font-semibold text-[14.5px] text-[#111827] dark:text-white hover:bg-white dark:hover:bg-white/[0.06] transition-colors"
            >
              {t({ fr: "Mon espace Ora", en: "My Ora space" })}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
