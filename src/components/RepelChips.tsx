import { useEffect, useRef } from "react";

/**
 * RepelChips — nuage de petites étiquettes qui S'ÉCARTENT du curseur (client
 * 2026-08-06, carte « Bilan développé » : « des petits encadrés de texte qui
 * s'éloignent quand on essaye de passer notre curseur dessus »).
 *
 * Les postes du bilan fuient la souris : on ne peut pas les attraper un par un,
 * ce qui est exactement le propos de la carte — un bilan ne se lit pas ligne à
 * ligne, il se regarde.
 *
 * Trois partis pris qui font toute la douceur du mouvement :
 *   · les étiquettes sont en `pointer-events: none`. Sans ça, celle qui fuit
 *     déclenche un `mouseleave` en partant et un `mouseenter` en revenant :
 *     l'étiquette se met à vibrer. Ici c'est le CONTENEUR qui écoute, elles ne
 *     reçoivent jamais rien ;
 *   · la position de repos vient de `offsetLeft/offsetTop`, jamais de
 *     `getBoundingClientRect()` : le rectangle inclut le `transform` déjà posé,
 *     donc la mesure se déplacerait avec l'étiquette et la poussée
 *     s'emballerait. `offsetLeft` ignore les transformations, il donne le point
 *     d'ancrage ;
 *   · la poussée est écrite d'un coup, et c'est une TRANSITION CSS longue qui
 *     l'amortit. Le retard entre le curseur et l'étiquette, c'est elle.
 *
 * PAS DE `will-change` PERMANENT, et c'est une correction de performance
 * mesurée (2026-08-07, « fluidifie le scroll »). Les étiquettes le portaient en
 * dur, plus une translation 3D nulle au repos : deux façons d'exiger une couche
 * composite. Relevé sur la page, 18 des 25 couches promues étaient ces
 * étiquettes, immobiles 99 % du temps. Chacune coûte de la mémoire GPU et du
 * travail de composition à chaque image — et le défilement de ce site est
 * piloté par Lenis, donc sur le thread principal : tout ce qu'on lui rend, il
 * le rend au scroll.
 *
 * Le drapeau est désormais posé au moment où l'étiquette s'écarte et retiré
 * quand elle revient. C'est exactement l'usage prévu de `will-change` : une
 * promesse à court terme, pas une déclaration permanente.
 *
 * Le curseur est suivi sur `window` plutôt que sur le conteneur : une étiquette
 * du bord doit commencer à s'écarter AVANT que la souris n'entre dans la carte.
 * L'écoute n'est branchée que pendant que la carte est à l'écran.
 */

export type Chip = {
  label: string;
  /** Position d'ancrage, en pourcentage du conteneur (coin haut-gauche). */
  x: number;
  y: number;
  /** Étiquette teintée plutôt que blanche, pour le rythme. `advice` est la
   *  phrase de lecture du bilan (« ✦ Conseil : … ») : la seule à porter un
   *  liseré bleu affirmé, pour qu'elle se distingue des postes chiffrés. */
  tone?: "blue" | "teal" | "advice";
};

/** Rayon d'influence et amplitude, en pixels. RECUL NETTEMENT ACCENTUÉ le
 *  2026-08-07 (« que l'animation de rétractation soit plus prononcée ») : la
 *  poussée passe de 78 à 130 px et le rayon de 165 à 205. Les deux vont
 *  ensemble — pousser plus fort dans le même rayon ferait détaler les
 *  étiquettes d'un coup sec au lieu de les faire refluer. */
const RADIUS = 205;
const PUSH = 130;

export default function RepelChips({ chips, className }: { chips: Chip[]; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let px = -9999;
    let py = -9999;

    const apply = () => {
      raf = 0;
      const box = host.getBoundingClientRect();
      const mx = px - box.left;
      const my = py - box.top;
      for (const el of [...host.children] as HTMLElement[]) {
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const d = Math.hypot(dx, dy) || 1;
        if (d > RADIUS) {
          // On EFFACE au lieu d'écrire une translation nulle, et on rend sa
          // couche au navigateur. Voir le pavé sur `will-change` plus bas.
          if (el.style.transform) {
            el.style.transform = "";
            el.style.willChange = "";
          }
          continue;
        }
        // Décroissance douce : poussée maximale sous le curseur, nulle au bord
        // du rayon, sans marche au passage.
        const f = 1 - d / RADIUS;
        const k = PUSH * f * f * (3 - 2 * f);
        el.style.willChange = "transform";
        el.style.transform = `translate3d(${((dx / d) * k).toFixed(2)}px, ${((dy / d) * k).toFixed(2)}px, 0)`;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onGone = () => {
      px = -9999;
      py = -9999;
      schedule();
    };

    // Écoute branchée seulement quand la carte est visible.
    let listening = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === listening) return;
        listening = entry.isIntersecting;
        if (listening) {
          window.addEventListener("pointermove", onMove, { passive: true });
          window.addEventListener("pointerdown", onMove, { passive: true });
          document.addEventListener("pointerleave", onGone);
        } else {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerdown", onMove);
          document.removeEventListener("pointerleave", onGone);
          onGone();
        }
      },
      { threshold: 0 },
    );
    io.observe(host);

    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onGone);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [chips]);

  return (
    <div ref={hostRef} className={`relative ${className ?? ""}`}>
      {chips.map((c) => (
        <span
          key={c.label}
          className={`pointer-events-none absolute whitespace-nowrap rounded-[11px] px-3.5 py-2.5 font-inter text-[12.5px] md:text-[13.5px] font-medium ring-1 ${
            c.tone === "advice"
              ? "bg-[#eef4ff]/95 text-[#1d4ed8] ring-[#3b82f6]/40 shadow-[0_10px_28px_-12px_rgba(37,99,235,0.5)]"
              : c.tone === "blue"
                ? "bg-[#e8f0fe]/90 text-[#2563eb] ring-[#3b82f6]/20 shadow-[0_6px_18px_-10px_rgba(37,99,235,0.5)]"
                : c.tone === "teal"
                  ? "bg-[#e6f5f2]/90 text-[#0f766e] ring-[#0d9488]/20 shadow-[0_6px_18px_-10px_rgba(13,148,136,0.45)]"
                  : "bg-white/[0.92] text-[#0a2540] ring-[#0a2540]/[0.08] shadow-[0_8px_22px_-12px_rgba(10,37,64,0.35)]"
          }`}
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            // Amortisseur du mouvement : la poussée est posée d'un trait, la
            // transition fait tout le reste.
            transition: "transform 720ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}
