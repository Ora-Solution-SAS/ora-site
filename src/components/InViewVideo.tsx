import { useEffect, useRef, type CSSProperties } from "react";

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
  /** Restart from frame 0 each time it scrolls into view. Default true. */
  resetOnEnter?: boolean;
  /** Fraction of the video that must be visible before it starts. Default 0.35. */
  threshold?: number;
  /**
   * Expands the observer's viewport so playback starts slightly BEFORE the
   * video scrolls fully into view. A positive bottom value (default 20%) makes
   * the video begin a touch early as the user approaches it.
   */
  rootMargin?: string;
};

/**
 * Muted, looping, inline video that only starts playing once it scrolls into
 * the viewport — and (by default) restarts from the beginning on entry, so the
 * user always catches the demo from frame 0 instead of mid-loop. Pauses when
 * scrolled out of view.
 *
 * Note: no `autoPlay` attribute — playback is driven by IntersectionObserver.
 * `muted` is kept because browsers require it for programmatic play() without
 * a user gesture.
 */
export default function InViewVideo({
  src,
  className,
  style,
  resetOnEnter = true,
  threshold = 0.35,
  rootMargin = "0px 0px 20% 0px",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (resetOnEnter) {
            // Guard: setting currentTime before metadata loads can throw.
            try {
              el.currentTime = 0;
            } catch {
              /* metadata not ready yet — playback still starts from ~0 */
            }
          }
          // play() rejects if interrupted (e.g. quick scroll past); ignore.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [resetOnEnter, threshold, rootMargin]);

  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      className={className}
      style={style}
    />
  );
}
