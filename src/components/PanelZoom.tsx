import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * PanelZoom — le bouton d'agrandissement des panneaux de la section à onglets,
 * et la fenêtre qu'il ouvre.
 *
 * ── D'OÙ VIENT LE DESSIN ──────────────────────────────────────────────────
 * Client 2026-08-15, deux captures : la pastille au repos (aplat très pâle,
 * crochets colorés) et la même au survol (aplat plein, crochets blancs).
 * « Mets-le pour prévisionnel, bilan développé, changement de structure etc. »
 *
 * ⚠ LA COULEUR N'EST PAS CELLE DES CAPTURES, ET C'EST DÉLIBÉRÉ. Elles montrent
 * un indigo (~#4f39f6). Le même jour, l'audit a retiré du site les quatre bleus
 * concurrents dont un indigo #6161FF qui vivait dans la barre de navigation, et
 * CLAUDE.md porte désormais la règle « un seul bleu, un seul survol ». Poser un
 * indigo neuf ici rouvrirait exactement ce qui vient d'être fermé. La pastille
 * reprend donc la FORME, les deux états et les proportions des captures, dans le
 * bleu de marque. C'est un écart signalé au client, pas une inattention : si
 * l'indigo est voulu, il y a deux valeurs à changer dans ce fichier.
 *
 * ── CE QUE FAIT LE BOUTON ─────────────────────────────────────────────────
 * Il ouvre le visuel du panneau en grand. C'est la seule chose qu'une icône
 * d'agrandissement peut vouloir dire, et c'est déjà ce que fait son jumeau dans
 * la grille bento (`aria-label="En savoir plus"`, Maximize2) : deux affordances
 * identiques sur la même page doivent faire la même chose.
 *
 * La fenêtre reprend les quatre comportements que l'audit du jour a posés sur la
 * modale de réservation : Escape, focus qui entre et qui revient, verrou de
 * défilement, `role="dialog"`. Ils ne sont pas recopiés par goût de la symétrie,
 * c'est le minimum pour qu'une fenêtre modale soit utilisable au clavier.
 */

/** Les crochets des captures : deux coins en diagonale, sans flèches. */
function ExpandGlyph() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 4h6v6" />
      <path d="M10 20H4v-6" />
    </svg>
  );
}

/**
 * La pastille. Les deux états viennent des captures :
 *   · au repos  — aplat très pâle, crochets en bleu de marque ;
 *   · au survol — aplat plein en bleu de marque, crochets blancs.
 * Le survol est porté par le GROUPE du panneau (`group-hover/panel`) autant que
 * par la pastille elle-même : sur les captures, le second état correspond au
 * curseur « sur l'encadré », pas seulement sur les vingt-huit pixels du bouton.
 */
export function ZoomButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-4 top-4 z-20 grid h-8 w-8 place-items-center rounded-[9px] bg-[#eef3ff] text-[#3b82f6] ring-1 ring-[#3b82f6]/15 transition-colors duration-150 group-hover/panel:bg-[#3b82f6] group-hover/panel:text-white group-hover/panel:ring-[#3b82f6] hover:bg-[#2563eb] hover:text-white hover:ring-[#2563eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 dark:bg-white/[0.08] dark:text-white/70 dark:ring-white/10"
    >
      <ExpandGlyph />
    </button>
  );
}

export function ZoomOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const enter = window.setTimeout(
      () => boxRef.current?.querySelector<HTMLElement>("button")?.focus(),
      50,
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(enter);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        /* `w-full` plafonné à 1200 px : les visuels des panneaux sont dessinés
           entre 880 et 1180 px de large, au-delà on agrandirait du vide. */
        className="relative w-full max-w-[1200px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute -top-1 right-0 z-10 grid h-9 w-9 -translate-y-full place-items-center rounded-full bg-white/15 text-white transition-colors duration-150 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <div className="overflow-hidden rounded-[18px] bg-white p-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] md:p-8 dark:bg-[#111827]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
