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
    //
    // INTERRUPTEUR D'ACTIVITÉ (2026-08-05, client : « fluidifie le scroll dans
    // la partie des encadrés, c'est encore un peu bugué »). Le throttle en rAF
    // ci-dessus avait plafonné le coût à une lecture par image et par instance,
    // mais ce coût était payé EN PERMANENCE : dix instances vivantes sur la
    // page, donc dix `getBoundingClientRect` — dix recalculs de mise en page
    // forcés — à chaque image de chaque défilement, y compris quand la section
    // est à des milliers de pixels de l'écran et qu'aucune de ces animations
    // n'a la moindre chance de se déclencher.
    //
    // Un IntersectionObserver sert ici d'INTERRUPTEUR, et surtout PAS d'oracle :
    // la décision de jouer l'entrée reste prise par `measure()`, sur la
    // géométrie réelle, pour les raisons expliquées en tête de ce fichier. L'IO
    // ne fait que dire « cet élément est assez près pour que ça vaille la peine
    // de mesurer ». La marge le réveille avant que ça compte, donc il est
    // toujours actif au moment où la décision se joue.
    //
    // MARGE RAMENÉE DE 150 À 40 % le 2026-08-07 (« fluidifie le scroll »). À
    // 150 %, un élément se déclarait vivant trois écrans avant d'être visible,
    // et le hook a une dizaine d'instances sur la page : la moitié d'entre
    // elles lisaient donc `getBoundingClientRect` à chaque image, ce qui force
    // un recalcul de style. À 40 % la décision se prend toujours largement à
    // temps — l'entrée se joue à 95 % de la hauteur d'écran — mais deux ou
    // trois instances mesurent au lieu de cinq ou six.
    let rafId = 0;
    let live = false;
    const onScroll = () => {
      if (!live || rafId) return;
      rafId = requestAnimationFrame(() => { rafId = 0; measure(); });
    };
    const onVisible = () => { if (!document.hidden && live) measure(); };

    const io = new IntersectionObserver(
      ([e]) => {
        live = e.isIntersecting;
        if (live) measure();
      },
      { rootMargin: "40% 0px 40% 0px" },
    );
    io.observe(el);

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [armed]);

  return { ref, entered, armed, hidden: armed && !entered };
}
