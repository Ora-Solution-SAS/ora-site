import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Check, FileText } from "lucide-react";
import { useLang } from "@/lib/i18n";
import OraAppScene from "./OraAppScene";

/**
 * OraHeroMobile — the hero for phones (< 768px), rendered instead of the
 * scroll-driven <OraHeroDemo> scene.
 *
 * Why a separate component rather than scaling the desktop scene down: the
 * desktop scene is a fixed 1040x640 stage holding a 1180x720 replica of the
 * app. Fitting either into a 327px-wide phone column gives a scale of ~0.29,
 * which renders the app's 7-13.5px type at 2-4px. Cropping instead of scaling
 * does not save it: the replica's type only stays legible at scale ~1, and at
 * that scale a 327px window shows 28% of the interface width, i.e. a fragment
 * with no meaning.
 *
 * So the app is RECOMPOSED at phone width: same story, same copy, same
 * colours as OraAppScene, laid out full-width so every line is legible. Same
 * approach as OraExperienceCarousel, which already ships a distinct touch
 * branch instead of shrinking its desktop one.
 *
 * No simulated mouse cursor and no scroll scrub here: both are desktop
 * grammar. The story reads top to bottom, in one normal scroll.
 */

/**
 * Arrivée au MONTAGE, pas au `whileInView`. Deux raisons : c'est le hero, donc
 * tout est vu tout de suite ou presque, et surtout un `whileInView` qui ne
 * partirait pas laisserait le bloc à `opacity: 0`, c'est-à-dire un hero vide.
 * Même patron que le titre du hero desktop (OraHeroDemo).
 */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function OraHeroMobile({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();

  /** What Ora gives back, told as a list instead of chips floating over the UI. */
  const outputs = [
    {
      icon: <BarChart3 className="h-[17px] w-[17px]" strokeWidth={2.2} />,
      tint: "bg-[#e8f0ff] text-[#2f6ff0]",
      title: t({ fr: "Reporting généré", en: "Report generated" }),
      sub: t({ fr: "Mis en forme, prêt à envoyer", en: "Formatted, ready to send" }),
    },
    {
      icon: <Check className="h-[17px] w-[17px]" strokeWidth={2.6} />,
      tint: "bg-[#f0ecfe] text-[#7c53e8]",
      title: t({ fr: "398 000 lignes contrôlées", en: "398,000 rows checked" }),
      sub: t({ fr: "Écritures atypiques repérées", en: "Unusual entries flagged" }),
    },
    {
      icon: <FileText className="h-[17px] w-[17px]" strokeWidth={2.2} />,
      tint: "bg-[#fef3e2] text-[#d97a06]",
      title: t({ fr: "Synthèse PDF", en: "PDF summary" }),
      sub: t({ fr: "Livrable final, en un clic", en: "Final deliverable, one click" }),
    },
  ];

  return (
    <div className="relative px-5 pt-14 pb-10">
      {/* Soft brand glow behind the phone card.
          ⚠ `max-w-full` : le commentaire d'origine la disait « clipped by the
          parent section », ce qui était faux — mesuré à 375 px, ce disque de
          420 px atteignait x = 398 et participait au débordement horizontal de
          la page. Rien ne la rognait. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] -z-10 h-[420px] w-[420px] max-w-full -translate-x-1/2 rounded-full opacity-70 dark:opacity-40"
        style={{ background: "radial-gradient(circle at 40% 35%, #ffffff, #eef2fb 62%, transparent 74%)" }}
      />

      {/* ── Titre ─────────────────────────────────────────────────────── */}
      <motion.div {...rise(0)} className="text-center">
        <span className="inline-flex items-center gap-2 font-instrument font-medium text-[15px] tracking-[-0.01em]">
          <img
            src="/logos/icon-color.png"
            alt=""
            aria-hidden
            className="h-[1.2em] w-auto select-none"
            draggable={false}
          />
          <span className="text-brand-gradient">
            {t({ fr: "Ora Solution en action", en: "Ora Solution in action" })}
          </span>
        </span>

        {/* Same face as the desktop hero (Instrument Sans, documented
            exception to the Poppins rule) so both read as one identity. */}
        {/* `antialiased` : même amaigrissement que le hero desktop, et pour la
            même raison — Instrument Sans n'a pas de graisse sous 400, le
            lissage en niveaux de gris est le seul levier. Voir le pavé dans
            OraHeroDemo.tsx. */}
        {/* h1 : c'est le titre de la page sur téléphone, le hero desktop
            étant masqué sous md. Voir le pavé d'OraHeroDemo. */}
        <h1 className="antialiased mt-3 font-instrument font-normal text-[clamp(2.05rem,9.4vw,2.9rem)] leading-[1.06] tracking-[-0.035em] text-[#111827] dark:text-white">
          {/* Seconde ligne en dégradé de marque (client 2026-08-11 : « repasse
              cela en bleu »), au mot et au traitement près comme le hero
              desktop, sinon mobile et desktop ne montrent plus le même
              titre. */}
          <span className="block">{t({ fr: "Plus de productivité,", en: "More productivity," })}</span>
          <span className="block text-brand-gradient">
            {t({ fr: "plus d'analyse, plus de conseil.", en: "more analysis, more advisory." })}
          </span>
        </h1>

        {/* Même phrase que le hero desktop, au mot près (voir le pavé
            d'OraHeroDemo : elle nomme le LOGICIEL, client 2026-08-18). */}
        <p className="mt-3.5 font-instrument font-normal text-[16.5px] leading-[1.45] text-gray-500 dark:text-gray-400">
          {t({
            fr: "Le logiciel qui reprend le répétitif comptable, pour rediriger votre temps vers le conseil.",
            en: "The software that takes over repetitive accounting work, redirecting your time to advisory.",
          })}
        </p>

        {/* Cible tactile à 48 px : au-dessus des 44 px recommandés, et le
            bouton se pose à sa propre largeur au lieu de tenir les 350 px de
            l'écran. Pleine largeur, il lisait comme la validation d'un
            formulaire et repoussait la rangée de preuve hors du premier écran ;
            sur PC le même appel fait 193 px.
            ⚠ Mène à la RÉSERVATION depuis le 2026-08-26, comme le hero de
            bureau : le lien vers la web app est retiré du site (voir le pavé
            de OraHeroDemo). Les deux heros portent le même appel. */}
        <button
          type="button"
          onClick={openBooking}
          className="mt-5 inline-flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-6 font-inter text-[15.5px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(59,130,246,0.6)] active:bg-[#2563eb]"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>

        {/* ⚠ MÊME RANGÉE DE PREUVE QUE LE HERO DE BUREAU (2026-08-21), au mot
            près : les deux doivent dire la même chose, c'est le même écran vu
            sur deux tailles. Voir le pavé de OraHeroDemo pour le détail des
            arbitrages — notamment pourquoi « 100 % EU » est devenu « Hébergé en
            Europe » (Genève n'est pas dans l'Union) et pourquoi « no LLM » n'y
            figure pas.
            Empilée et non sur une ligne : à cette largeur, la liste à « ✦ » du
            bureau se coupait n'importe où. La quatrième mention est donc
            abandonnée ici — quatre lignes de réassurance repousseraient la
            réplique du logiciel hors du premier écran. */}
        <ul className="mt-4 flex flex-col items-center gap-1.5 font-inter text-[13.5px] text-gray-400 dark:text-gray-500">
          {[
            t({ fr: "Hébergé en Europe, hors CLOUD Act", en: "Hosted in Europe, outside the CLOUD Act" }),
            t({ fr: "Chiffré sur votre appareil", en: "Encrypted on your device" }),
            t({ fr: "Même fichier, même résultat", en: "Same file, same result" }),
          ].map((line) => (
            <li key={line} className="flex items-center gap-1.5">
              <Check className="h-[13px] w-[13px] shrink-0 text-emerald-500" strokeWidth={3} />
              {line}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ── LA RÉPLIQUE DU LOGICIEL, CELLE DU PC ────────────────────────────
             Ce bloc a longtemps été une SECONDE maquette, réécrite pour le
             téléphone : fenêtre en pleine largeur, barre latérale supprimée,
             accès rapides en liste, fichiers empilés. Elle était fidèle en
             contenu et fausse en image — plus de 700 px de haut, et pas l'écran
             que le PC montre.
             C'est maintenant OraAppScene, le composant même du hero de bureau.
             Il se compose à 1180 × 720 et se met tout seul à l'échelle de son
             cadre : il suffit de lui donner le rapport de la scène pour qu'il
             tienne entier, barre latérale et grille d'accès rapides comprises.
             Aucune règle responsive là-dedans — la scène est dessinée à taille
             fixe, donc l'image est celle du PC, à l'échelle près. */}
      <motion.div
        {...rise(0.08)}
        className="mt-8 overflow-hidden rounded-[20px] bg-white ring-1 ring-black/[0.06] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] dark:ring-white/10"
      >
        <div className="aspect-[1180/720] w-full">
          <OraAppScene />
        </div>
      </motion.div>

      {/* ── L'histoire entrée → sortie, en liste plutôt qu'en pastilles
             flottantes (elles se chevauchaient et devenaient illisibles). ── */}
      <motion.div {...rise(0.14)} className="mt-9">
        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
          {t({ fr: "Vous déposez", en: "You drop in" })}
        </p>
        <div className="mt-2.5 flex items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 ring-1 ring-black/[0.05] shadow-[0_8px_24px_-14px_rgba(15,23,42,0.3)] dark:bg-white/[0.04] dark:ring-white/10">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f7ee] text-[#177245]">
            <FileText className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <b className="block font-inter text-[13.5px] font-bold text-[#111827] dark:text-white">
              balance_2025.xlsx
            </b>
            <span className="block font-inter text-[11.5px] text-gray-500 dark:text-gray-400">
              {t({ fr: "Déposé dans Ora", en: "Dropped into Ora" })}
            </span>
          </span>
        </div>

        <div className="my-3 flex justify-center" aria-hidden>
          <svg width="16" height="22" viewBox="0 0 16 22" fill="none" className="text-gray-300 dark:text-gray-600">
            <path d="M8 1v20m0 0 5-5m-5 5-5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
          {t({ fr: "Ora vous rend", en: "Ora hands back" })}
        </p>
        <div className="mt-2.5 flex flex-col gap-2">
          {outputs.map((o) => (
            <div
              key={o.title}
              className="flex items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 ring-1 ring-black/[0.05] shadow-[0_8px_24px_-14px_rgba(15,23,42,0.3)] dark:bg-white/[0.04] dark:ring-white/10"
            >
              <span className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] ${o.tint}`}>
                {o.icon}
              </span>
              <span className="min-w-0">
                <b className="block font-inter text-[13.5px] font-bold text-[#111827] dark:text-white">{o.title}</b>
                <span className="block font-inter text-[11.5px] text-gray-500 dark:text-gray-400">{o.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA de conversion : le but du site reste la prise de rendez-vous. */}
      <motion.button
        {...rise(0.2)}
        onClick={openBooking}
        className="mt-7 inline-flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#111827] px-6 font-inter font-semibold text-[15.5px] text-white active:bg-[#0b1220] dark:bg-white dark:text-[#111827]"
      >
        {t({ fr: "Réserver un appel", en: "Book a call" })}
        <ArrowRight className="h-[18px] w-[18px]" />
      </motion.button>
    </div>
  );
}
