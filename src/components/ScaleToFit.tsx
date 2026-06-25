import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * ScaleToFit — shrinks a fixed-width child (e.g. the 1020px Atlas mockups) so
 * it always fits the available width, instead of horizontally scrolling on
 * narrow screens. On wide screens (child ≤ container) it just centers at
 * scale 1, so desktop is unchanged.
 *
 * It measures the child's natural (untransformed) size via offsetWidth/Height
 * — CSS transforms don't affect those — then applies `transform: scale()` and
 * reserves the scaled height so no empty space is left below.
 *
 * Safe for the interactive galaxy: its pointer math is ratio-based on
 * getBoundingClientRect(), which already accounts for the transform.
 */
export default function ScaleToFit({
  children,
  maxScale = 1,
}: {
  children: ReactNode;
  maxScale?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ scale: number; height?: number; left: number }>({
    scale: 1,
    height: undefined,
    left: 0,
  });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const compute = () => {
      const avail = outer.clientWidth;
      const natW = inner.offsetWidth;
      const natH = inner.offsetHeight;
      if (!natW || !avail) return;
      const scale = Math.min(maxScale, avail / natW);
      setLayout({ scale, height: natH * scale, left: Math.max(0, (avail - natW * scale) / 2) });
    };

    // rAF-batch so we read sizes after layout settles (and to coalesce bursts).
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; compute(); });
    };

    compute();
    // ResizeObserver covers container/content changes; the window listener is
    // a belt-and-suspenders fallback for orientation changes and resizes the
    // observer may miss.
    const ro = new ResizeObserver(schedule);
    ro.observe(outer);
    ro.observe(inner);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [maxScale]);

  return (
    <div ref={outerRef} className="relative w-full overflow-hidden" style={{ height: layout.height }}>
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          top: 0,
          left: layout.left,
          width: "max-content",
          transform: `scale(${layout.scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
