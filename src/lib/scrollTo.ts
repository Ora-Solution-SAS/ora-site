/**
 * Shared "animated scroll to a section" used by the nav ribbon and the
 * Solutions menu.
 *
 * Motion: slow start, accelerating finish (easeInCubic) — the effect the user
 * liked. It also suppresses the Hero scroll-lock for the duration via the
 * `__oraSuppressHeroLock` flag, so the animation can travel through the
 * "Découvrez Ora." section without being captured mid-flight.
 */
export function animatedScrollToId(id: string, offset = -80) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as any).__lenis;
  if (lenis) {
    (window as any).__oraSuppressHeroLock = true;
    const clear = () => {
      (window as any).__oraSuppressHeroLock = false;
    };
    lenis.scrollTo(el, {
      offset,
      duration: 1.5,
      // easeInCubic — slow at the start, accelerating toward the target.
      easing: (t: number) => t * t * t,
      lock: true,
      force: true,
      onComplete: clear,
    });
    // Safety net in case onComplete never fires (interrupted scroll).
    window.setTimeout(clear, 2400);
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
