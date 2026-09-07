import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { VideoWithScrubber } from "./InViewVideo";
import { useLang } from "@/lib/i18n";
import { animatedScrollToId } from "@/lib/scrollTo";
import OraAppScene from "./OraAppScene";

/**
 * OraHeroMobile — le hero des téléphones (< 768 px), monté à la place de la
 * scène au défilement d'OraHeroDemo, qui est une grammaire de souris.
 *
 * ── CE QUE LE PREMIER ÉCRAN PORTE, ET RIEN D'AUTRE ──────────────────────────
 * Refonte du 2026-09-07, sur trois captures de datasnipper.com fournies par le
 * client : « c'est bien plus clair, bien plus propre, bien plus dégagé ».
 * Ce qui produit cet effet chez eux n'est pas une couleur ni une police, c'est
 * une RÈGLE DE RATIONNEMENT : un seul groupe par écran, et du blanc entre les
 * groupes plutôt que du contenu.
 *
 * Le hero portait sept groupes empilés — pastille, titre, phrase, bouton,
 * trois lignes de réassurance, la réplique du logiciel, une séquence dépôt →
 * livrables en quatre cartes, un second bouton. Le premier écran s'arrêtait au
 * milieu de la réassurance : le visiteur voyait la promesse et une liste de
 * garanties, jamais le produit.
 *
 * Il en porte quatre, dans cet ordre : la promesse, la phrase qui l'explique,
 * l'appel, le produit. La réassurance passe SOUS le produit — elle rassure
 * quelqu'un déjà convaincu, elle ne convainc personne — et la séquence dépôt →
 * livrables est retirée (client, même jour : « c'est pas ce que je veux »).
 *
 * ── L'APPEL N'EST PAS PLEINE LARGEUR ────────────────────────────────────────
 * DataSnipper étend le sien d'un bord à l'autre. Ici non : le même bouton a
 * déjà été jugé « trop gros » à 350 px le 2026-09-07. Il garde donc sa largeur
 * propre, et gagne en présence par la hauteur (54 px) et l'ombre portée. La
 * seconde action est un lien, pas un second bouton plein : deux pleins côte à
 * côte se disputent le regard, et c'est la réservation qui compte.
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

  return (
    <div className="relative px-6 pb-14">
      {/* ── 1. LA PROMESSE, CENTRÉE DANS L'ÉCRAN ─────────────────────────────
             `min-h-svh` et centrage vertical, comme la référence : chez elle le
             titre est au milieu de l'écran, pas posé sous la barre. Ici il
             commençait 48 px sous le haut de page — et comme l'en-tête est
             FIXE et haut de 68 px, la pastille de marque passait dessous, à
             hauteur du logo : deux logos sur la même ligne, ce que le client a
             relevé (« this double logo... is not good »).
             Le retrait haut vaut donc la hauteur de l'en-tête, et `svh` plutôt
             que `vh` : sur téléphone, `vh` compte la barre d'URL rétractée, ce
             qui pousse le second bouton hors de l'écran tant qu'elle est là.

             ⚠ 76svh ET NON 100 (client 2026-09-07 : « too much gap between the
             button… and the actual replication »). À pleine hauteur, le
             centrage laissait 161 px de vide sous le second bouton, plus le
             rembourrage : 217 px avant la réplique du logiciel, soit un quart
             d'écran de rien. Le bloc reste centré — c'est ce qui met le titre au
             milieu et non sous la barre — mais dans les trois quarts de
             l'écran : l'écart tombe à une centaine de pixels, assez pour
             respirer, trop peu pour qu'on croie la page finie. */}
      <motion.div
        {...rise(0)}
        className="flex min-h-[76svh] flex-col justify-center pb-6 pt-[68px] text-center"
      >
        {/* SANS LA MARQUE EN IMAGE : l'en-tête porte déjà le logo, dix pixels
            plus haut. Les deux se lisaient comme un doublon, et la pastille
            n'a pas besoin de le répéter pour dire ce qu'elle dit. */}
        <span className="font-instrument text-[14px] font-medium uppercase tracking-[0.14em] text-brand-gradient">
          {t({ fr: "Ora Solution en action", en: "Ora Solution in action" })}
        </span>

        {/* Same face as the desktop hero (Instrument Sans, documented
            exception to the Poppins rule) so both read as one identity. */}
        {/* `antialiased` : même amaigrissement que le hero desktop, et pour la
            même raison — Instrument Sans n'a pas de graisse sous 400, le
            lissage en niveaux de gris est le seul levier. Voir le pavé dans
            OraHeroDemo.tsx. */}
        {/* h1 : c'est le titre de la page sur téléphone, le hero desktop
            étant masqué sous md. Voir le pavé d'OraHeroDemo.
            La borne haute monte de 2,9 à 3,1 rem : sur la référence, le titre
            occupe le tiers de l'écran à lui seul, et c'est lui qui fait la
            hiérarchie — tout le reste de la page est plus petit que lui. La
            borne fluide reste à 9,6vw : à 10,4 la première ligne venait mourir
            sur le bord droit, ce qui se lit comme un débordement même quand
            rien ne dépasse (mesuré : aucun, de 320 à 430 px). */}
        <h1 className="antialiased mt-6 font-instrument font-normal text-[clamp(2.1rem,9.6vw,3.1rem)] leading-[1.04] tracking-[-0.038em] text-[#111827] dark:text-white">
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
            d'OraHeroDemo : elle nomme le LOGICIEL, client 2026-08-18).
            Encre remontée de `gray-500` à #4b5563 : sous un titre de 3,2 rem,
            le gris précédent lisait comme une légende et non comme la phrase
            qui porte l'offre. */}
        <p className="mx-auto mt-4 max-w-[34ch] font-instrument font-normal text-[17px] leading-[1.5] text-[#4b5563] dark:text-gray-400">
          {t({
            fr: "Le logiciel qui reprend le répétitif comptable, pour rediriger votre temps vers le conseil.",
            en: "The software that takes over repetitive accounting work, redirecting your time to advisory.",
          })}
        </p>

        {/* ── 2. LES DEUX ACTIONS ──────────────────────────────────────────
            Motif de la référence : l'appel qui engage, et à côté la sortie de
            secours pour qui n'est pas prêt à parler à quelqu'un. La seconde
            descend vers la démo déjà servie par la page — elle n'ajoute pas de
            contenu, elle ouvre un chemin.
            ⚠ L'APPEL MÈNE À LA RÉSERVATION depuis le 2026-08-26 : le lien vers
            la web app est retiré du site (voir le pavé d'OraHeroDemo). Les deux
            heros portent le même. */}
        {/* ⚠ DEUX BOUTONS DE MÊME TAILLE, ET C'EST LA DEMANDE (client
            2026-09-07, capture à l'appui : « they have two buttons that are
            exactly the same size, which I'd like you to copy »). Même largeur,
            même hauteur, même rayon : ce qui les sépare est la SURFACE — encre
            pleine pour l'appel qui engage, surface blanche cerclée pour la
            sortie de secours de qui n'est pas prêt à parler à quelqu'un.
            Cela revient sur le bouton à largeur propre posé plus tôt le même
            jour, quand la consigne était l'inverse : le pleine largeur était
            « trop gros » dans un hero à sept groupes. Il ne l'est plus dans un
            hero qui n'en porte que quatre, et c'est cette forme-là que la
            référence utilise.
            Le rayon reste celui d'Ora, `rounded-full` : la référence a des
            coins presque droits, mais tous les appels du site sont ronds, en-tête
            compris. Copier son rayon romprait avec le reste des pages. */}
        <div className="mt-9 flex flex-col gap-3">
          <button
            type="button"
            onClick={openBooking}
            className="inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#3b82f6] font-inter text-[16.5px] font-semibold text-white shadow-[0_16px_34px_-14px_rgba(59,130,246,0.75)] transition-transform duration-150 active:scale-[0.98] active:bg-[#2563eb]"
          >
            {t({ fr: "Réserver un appel", en: "Book a call" })}
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => animatedScrollToId("automatisations", -70)}
            className="inline-flex h-[56px] w-full items-center justify-center gap-2.5 rounded-full bg-white font-inter text-[16.5px] font-semibold text-[#111827] ring-1 ring-inset ring-[#0a2540]/[0.14] transition-transform duration-150 active:scale-[0.98] active:bg-[#f7f8fa] dark:bg-white/[0.06] dark:text-white dark:ring-white/15"
          >
            <Play className="h-[13px] w-[13px] translate-x-[0.5px] fill-current text-[#3b82f6]" strokeWidth={0} />
            {t({ fr: "Voir le logiciel", en: "See the software" })}
          </button>
        </div>
      </motion.div>

      {/* ── 3. LE PRODUIT ────────────────────────────────────────────────────
             OraAppScene, le composant même du hero de bureau : il se compose à
             1180 × 720 et se met tout seul à l'échelle de son cadre, il suffit
             de lui donner le rapport de la scène. Aucune règle responsive
             là-dedans — l'image est celle du PC, à l'échelle près, barre
             latérale et grille d'accès rapides comprises.
             `mt-12` et non `mt-8` : c'est le blanc qui sépare deux groupes, et
             la référence en met toujours plus qu'on ne croit. */}
      <motion.div
        {...rise(0.08)}
        className="mt-4 overflow-hidden rounded-[20px] bg-white ring-1 ring-black/[0.06] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] dark:ring-white/10"
      >
        <div className="aspect-[1180/720] w-full">
          <OraAppScene />
        </div>
      </motion.div>

      {/* ── LA DÉMO, SOUS LA RÉPLIQUE ────────────────────────────────────────
             ora-1.mp4, le film du produit : la réplique montre l'écran, le clip
             montre ce qu'on en fait. Client 2026-09-07 : « add the video demo
             under this software replication ».
             ⚠ 23 Mo, ET RIEN NE LES TÉLÉCHARGE AVANT L'ENTRÉE DANS L'ÉCRAN.
             InViewVideo pose `preload="metadata"` — quelques dizaines de
             kilo-octets d'en-tête — et n'appelle `play()` qu'à l'intersection :
             le corps du fichier ne part qu'à ce moment. La première image
             s'affiche entre-temps depuis le poster, sinon le cadre resterait
             noir sur du blanc. La barre de lecture donne au visiteur la main
             sur un mouvement qu'il n'a pas demandé. */}
      <motion.div {...rise(0.12)} className="mt-4">
        <VideoWithScrubber
          src="/ora-1.mp4"
          poster="/posters/ora-1.jpg"
          frameClassName="relative overflow-hidden rounded-[20px] ring-1 ring-[#0a2540]/[0.10] shadow-[0_24px_60px_-30px_rgba(10,37,64,0.45)] dark:ring-white/10"
          frameStyle={{ aspectRatio: "16 / 9" }}
          className="block h-full w-full object-cover"
        />
      </motion.div>

      {/* ── 4. LA RÉASSURANCE, APRÈS LE PRODUIT ──────────────────────────────
             ⚠ MÊME RANGÉE QUE LE HERO DE BUREAU (2026-08-21), au mot près : les
             deux doivent dire la même chose, c'est le même écran vu sur deux
             tailles. Voir le pavé d'OraHeroDemo pour les arbitrages — notamment
             pourquoi « 100 % EU » est devenu « Hébergé en Europe » (Genève n'est
             pas dans l'Union) et pourquoi « no LLM » n'y figure pas.
             Elle occupait le bas du PREMIER écran, entre l'appel et le produit :
             trois garanties lues par quelqu'un qui ne sait pas encore ce qu'on
             lui vend. Elle passe sous le produit, et en séparateurs plutôt qu'en
             liste à puces — une ligne de bas de page, pas un argumentaire. */}
      <motion.ul
        {...rise(0.14)}
        className="mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 font-inter text-[13px] text-gray-400 dark:text-gray-500"
      >
        {[
          t({ fr: "Hébergé en Europe", en: "Hosted in Europe" }),
          t({ fr: "Chiffré sur votre appareil", en: "Encrypted on your device" }),
          t({ fr: "Même fichier, même résultat", en: "Same file, same result" }),
        ].map((line, i) => (
          <li key={line} className="flex items-center gap-2.5">
            {line}
            {i < 2 && <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />}
          </li>
        ))}
      </motion.ul>

      {/* ⚠ PAS DE TROISIÈME APPEL ICI (client 2026-09-07 : « remove the black
             button »). Le hero en porte déjà deux, de même taille, à un écran
             au-dessus ; celui-ci refermait la section sur un troisième, plein
             et noir, juste après la vidéo. La conversion reste servie par les
             deux du premier écran et par ceux des sections suivantes. */}
    </div>
  );
}
