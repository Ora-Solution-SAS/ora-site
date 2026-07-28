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
    // Measured straight from the scroll handler rather than inside a
    // requestAnimationFrame: rAF is throttled (or frozen) whenever the tab is
    // not in the foreground, which would silently skip the trigger. The cost
    // is one getBoundingClientRect per scroll event, and React bails out when
    // the boolean does not actually change, so no extra render happens.
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [armed]);

  return { ref, entered, armed, hidden: armed && !entered };
}
