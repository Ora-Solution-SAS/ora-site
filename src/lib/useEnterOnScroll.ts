import { useEffect, useRef, useState } from "react";

/**
 * Plays a one-shot entrance when the element is ACTUALLY on screen, and
 * replays it if the reader scrolls back above it.
 *
 * Deliberately scroll-driven rather than IntersectionObserver-based. These
 * visuals live inside `position: sticky` cards, and IO proved unreliable
 * there (client, 2026-07-27): it reported an intersection before the layout
 * had settled, so the entrance ran — and finished — while the visual was
 * still off screen. The reader saw nothing on the way down and only got the
 * animation after scrolling back up and down again.
 *
 * Two things make this version dependable:
 *   • the geometry is re-measured from `getBoundingClientRect()` on every
 *     scroll frame, so it always reflects the real position, sticky or not;
 *   • a layout guard ignores the first measurements while the viewport or
 *     the element still has no size — that degenerate state is exactly what
 *     used to trigger the entrance far too early.
 */
export function useEnterOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [armed] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      // Layout not ready (zero viewport or zero-height element): measuring now
      // would wrongly report the element as on screen.
      if (!vh || !r.height) return;

      if (r.top < vh * 0.95 && r.bottom > 0) {
        // Genuinely visible: play.
        setEntered(true);
      } else if (r.top >= vh) {
        // Back below the fold: re-arm so it plays again on the way down.
        setEntered(false);
      }
      // Scrolled past upwards (r.bottom <= 0): leave it played.
    };
    // Throttlé en rAF (2026-08-03). Avant, `measure()` était branché DIRECTEMENT
    // sur `scroll`, soit un getBoundingClientRect par événement. Ce hook a dix
    // instances vivantes sur la page, et `scroll` émet plusieurs événements par
    // image : cela faisait donc des dizaines de lectures de mise en page forcées
    // par image, sur TOUTE la page, y compris là où aucune de ces animations
    // n'est visible. En rAF, c'est au pire dix lectures par image.
    //
    // Le commentaire d'origine écartait rAF au motif qu'il est gelé quand
    // l'onglet n'est pas au premier plan, ce qui pouvait faire manquer le
    // déclenchement. Deux garde-fous couvrent ce cas : une mesure DIRECTE au
    // retour au premier plan, et une autre au redimensionnement. Le
    // déclenchement reste donc fiable, sans le coût par événement.
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = 0; measure(); });
    };
    const onVisible = () => { if (!document.hidden) measure(); };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [armed]);

  return { ref, entered, armed, hidden: armed && !entered };
}
