import { useEffect, useRef, useState, type ReactNode } from "react";
import useMeasure from "react-use-measure";
import { useIsNarrow } from "@/lib/useIsNarrow";

interface DesktopThumbProps {
  /** La largeur pour laquelle la maquette est dessinée. */
  width?: number;
  /** Ouvre la maquette en grand ; le cadre entier est la cible du doigt. */
  onOpen?: () => void;
  /** Ce que le lecteur d'écran annonce à la place du cadre. */
  label?: string;
  children: ReactNode;
}

/**
 * ── LA MAQUETTE DU PC, RÉDUITE À LA LARGEUR DU TÉLÉPHONE ────────────────────
 *
 * Les maquettes de produit sont des fenêtres d'application dessinées pour
 * ~990 px. Laissées à leurs propres points de rupture sur un écran de 390, elles
 * se recomposent : la barre latérale disparaît, les métiers passent d'une grille
 * à une liste, la carte flottante tombe sous la fenêtre. Le panneau Prévisionnel
 * y gagnait 1 268 px de haut pour 340 de large, et ce n'est plus la même image
 * que celle validée sur PC — c'est un autre écran.
 *
 * Ici la maquette garde sa largeur de dessin et sa mise en page (`force-desktop`
 * rallume les variantes `sm/md/lg` par l'ascendance, voir tailwind.config.cjs),
 * puis l'ensemble est réduit à l'échelle. Le rendu est celui du PC au pixel
 * près, à un facteur d'échelle près.
 *
 * Ce que la réduction coûte, et ce qui le rattrape : à 34 %, un texte de 14 px
 * tombe sous 5 px — la forme se lit, pas le contenu. Le cadre entier est donc un
 * bouton, et `onOpen` ouvre la maquette en grand.
 *
 * Au-delà de `md`, le composant s'efface : ses enfants sont rendus tels quels.
 */
export default function DesktopThumb({
  width = 990,
  onOpen,
  label,
  children,
}: DesktopThumbProps) {
  const narrow = useIsNarrow();
  // La place disponible. Ici `getBoundingClientRect` convient : cet élément-ci
  // ne porte pas de transformation.
  const [hostRef, host] = useMeasure();
  // La hauteur de la maquette dépliée, en revanche, se lit sur `offsetHeight` et
  // PAS sur une mesure de rectangle : le rectangle est renvoyé APRÈS
  // transformation, et le multiplier par l'échelle l'appliquerait deux fois —
  // la vignette se retrouvait au carré de l'échelle, tronquée aux deux tiers.
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Une maquette ne se pose pas d'un coup : ses blocs montent en cascade à
    // l'entrée dans l'écran, et sa hauteur ne se fixe qu'au bout. L'observateur
    // suit ces variations plutôt que d'en figer une trop tôt.
    const ro = new ResizeObserver(() => setContentH(el.offsetHeight));
    ro.observe(el);
    setContentH(el.offsetHeight);
    return () => ro.disconnect();
  }, [narrow, children]);

  if (!narrow) return <>{children}</>;

  const scale = host.width ? Math.min(1, host.width / width) : 1;
  // Tant que la mesure n'est pas revenue, on ne réserve rien : une hauteur
  // devinée ferait sauter la page au premier rendu utile.
  const height = contentH ? Math.round(contentH * scale) : undefined;

  return (
    <div ref={hostRef} className="relative w-full overflow-hidden" style={{ height }}>
      <div
        ref={contentRef}
        className="force-desktop origin-top-left"
        style={{ width, transform: `scale(${scale})` }}
      >
        {children}
      </div>
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={label}
          className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        />
      )}
    </div>
  );
}
