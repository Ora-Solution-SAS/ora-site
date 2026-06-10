import { useEffect, useRef, type CSSProperties } from "react";

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
  /** Restart from frame 0 each time it scrolls into view. Default true. */
  resetOnEnter?: boolean;
  /** Fraction of the video that must be visible before it starts. Default 0.35. */
  threshold?: number;
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
      { threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [resetOnEnter, threshold]);

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
