import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * SwipeDeck — sous `upTo`, présente son contenu À SA TAILLE DE BUREAU dans une
 * bande qui se fait glisser du doigt. Au-dessus, il est TRANSPARENT.
 *
 * POURQUOI (client 2026-08-20, quatrième arbitrage) : « c'est catastrophique »,
 * puis, sur proposition, le modèle Linear retenu — maquettes à taille réelle
 * qu'on fait défiler, plutôt que réduites pour tenir dans l'écran.
 *
 * Les trois passes précédentes butaient toutes sur la même arithmétique :
 *   390 px d'écran − 40 px de marges = 350 px ;
 *   350 px en deux colonnes = 165 px ;
 *   45 signes par ligne dans 165 px = un corps de 7 px.
 * Autrement dit, TANT QU'ON VEUT FAIRE TENIR LA COMPOSITION DU BUREAU DANS
 * L'ÉCRAN, le texte passe sous le seuil de lisibilité. Ce n'est pas une
 * question de goût, c'est une question de largeur disponible.
 *
 * Ce composant tranche autrement : on renonce à faire tenir. La maquette garde
 * SA taille — donc elle est exactement celle du bureau, et non une réduction —
 * et c'est la fenêtre qui se déplace sur elle. Le texte, lui, récupère toute la
 * largeur ailleurs dans le panneau.
 *
 * ── Ce qui fait qu'on comprend qu'on peut glisser ──────────────────────────
 *   · la bande DÉBORDE des deux bords (marges négatives annulant le
 *     rembourrage de section) : un contenu coupé net au bord de l'écran se lit
 *     comme un contenu coupé ; un contenu qui sort de l'écran se lit comme un
 *     contenu qui continue ;
 *   · `scroll-snap` aimante la maquette en position de départ ;
 *   · la barre de défilement est masquée, et un liseré de progression la
 *     remplace — visible seulement s'il y a effectivement de quoi glisser.
 *
 * ⚠ NE PAS poser `data-lenis-prevent` dessus. L'attribut couperait AUSSI le
 * défilement vertical de la page quand le doigt part de la maquette, or celle-
 * ci fait plusieurs centaines de pixels de haut : on resterait coincé dessus.
 * Lenis ne pilote que l'axe vertical et laisse passer le geste horizontal.
 */
export default function SwipeDeck({
  designWidth,
  upTo = 1024,
  label,
  className,
  children,
}: {
  /** Largeur imposée au contenu sous `upTo`, en pixels CSS. */
  designWidth: number;
  /** Au-dessus de cette largeur de fenêtre, le composant ne fait rien. */
  upTo?: number;
  /** Nom accessible de la zone défilante. */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < upTo,
  );

  useEffect(() => {
    const read = () => setNarrow(window.innerWidth < upTo);
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, [upTo]);

  /* ⚠ FRAGMENT NU AU-DESSUS DE `upTo`, comme DesktopScale, et pour la même
     raison : une div intercalée casse les chaînes de `height: 100%` et
     l'étirement des enfants directs de grille. Le bureau doit retrouver son
     arbre au nœud près. */
  if (!narrow) return <>{children}</>;

  return (
    <Deck designWidth={designWidth} label={label} className={className}>
      {children}
    </Deck>
  );
}

function Deck({
  designWidth,
  label,
  className,
  children,
}: {
  designWidth: number;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const read = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      setScrollable(max > 12);
      setProgress(max > 0 ? rail.scrollLeft / max : 0);
    };

    read();
    rail.addEventListener("scroll", read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(rail);
    return () => {
      rail.removeEventListener("scroll", read);
      ro.disconnect();
    };
  }, []);

  return (
    /* ⚠ `min-w-0` ET `max-w-full`, et ce n'est pas de la ceinture-bretelles :
       sans eux, la boîte se cale sur la largeur MAX-CONTENU de la maquette dès
       qu'elle est enfant d'une grille ou d'un flex (`min-width: auto` est la
       valeur initiale pour eux), l'`overflow-x` du rail ne rogne plus rien, et
       la page déborde. Sur téléphone c'est PIRE qu'un débordement : Chrome
       élargit le viewport de mise en page pour absorber le débord, `innerWidth`
       passe de 390 à 1261, ce composant se croit sur un bureau et se désactive
       — la maquette repasse en grand, ce qui entretient le débordement.
       Boucle observée le 2026-08-20, puis mesurée. */
    <div className={`min-w-0 max-w-full ${className ?? ""}`}>
      <div
        ref={railRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        /* `-mx-5 px-5` : la bande file d'un bord à l'autre de l'écran en
           annulant le rembourrage de section, mais son contenu reste aligné
           sur la colonne de texte au repos grâce au rembourrage rendu.
           `scroll-p-5` aligne l'aimantation sur cette même colonne. */
        className="-mx-5 flex snap-x snap-mandatory scroll-p-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="shrink-0 snap-start" style={{ width: designWidth }}>
          {children}
        </div>
        {/* Respiration en fin de course : sans elle, la dernière colonne de la
            maquette colle au bord droit de l'écran en fin de glissement. */}
        <div aria-hidden className="w-5 shrink-0" />
      </div>

      {/* Le liseré de progression, seulement s'il y a de quoi glisser : sur une
          tablette large la maquette tient déjà, un rail immobile ferait croire
          à un contrôle mort. */}
      {scrollable && (
        <div aria-hidden className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#0a2540]/[0.09] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#3b82f6]/70 transition-[width,margin] duration-150 ease-out"
            style={{ width: "38%", marginLeft: `${progress * 62}%` }}
          />
        </div>
      )}
    </div>
  );
}
