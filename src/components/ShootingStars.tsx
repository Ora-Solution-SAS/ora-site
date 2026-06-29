import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

/**
 * ShootingStars — one or two stars that streak down the screen as the user
 * scrolls out of the "Découvrez Ora." reveal and into the dark Atlas section,
 * fading away (dissolving into the black) as the dark background takes over.
 *
 * Mounted between ExcelReveal and AtlasShowcase. A zero-height marker (in normal
 * flow at that boundary) feeds a scroll progress; a fixed, pointer-events-none
 * overlay draws the stars. On the Atlas-fills-screen end the stars are already
 * faded out — so they "disappear into the background".
 */
export default function ShootingStars() {
  const markerRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const p = useSpring(progress, { stiffness: 90, damping: 26, mass: 0.5 });

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = markerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // 0 when the boundary sits ~at the bottom of the viewport, 1 once it has
      // travelled ~1.2 viewports up (Atlas dark is filling the screen).
      const prog = (vh - rect.top) / (vh * 1.2);
      progress.set(Math.min(1, Math.max(0, prog)));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [progress]);

  return (
    <div ref={markerRef} aria-hidden className="relative h-0">
      <div className="fixed inset-0 z-[30] overflow-hidden pointer-events-none">
        {/* down-right, earlier */}
        <Star p={p} start={0.04} end={0.5} x0={30} x1={52} angle={36} />
        {/* down-left, later */}
        <Star p={p} start={0.32} end={0.84} x0={66} x1={48} angle={-34} />
      </div>
    </div>
  );
}

function Star({
  p,
  start,
  end,
  x0,
  x1,
  angle,
}: {
  p: MotionValue<number>;
  start: number;
  end: number;
  x0: number;
  x1: number;
  angle: number;
}) {
  const local = useTransform(p, [start, end], [0, 1]);
  const top = useTransform(local, [0, 1], ["-12%", "116%"]);
  const left = useTransform(local, [0, 1], [`${x0}%`, `${x1}%`]);
  // fade in at the start, fade out as it descends into the dark
  const opacity = useTransform(local, [0, 0.12, 0.62, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ position: "absolute", top, left, opacity, willChange: "transform, opacity" }}
    >
      <div style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100% 50%" }} className="relative">
        {/* trail */}
        <div
          style={{
            width: 150,
            height: 2.5,
            borderRadius: 3,
            background:
              "linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.55) 62%, rgba(191,219,254,0.95) 100%)",
            filter: "drop-shadow(0 0 6px rgba(96,165,250,0.55))",
          }}
        />
        {/* bright head */}
        <div
          style={{
            position: "absolute",
            right: -2,
            top: "50%",
            width: 8,
            height: 8,
            marginTop: -4,
            borderRadius: "50%",
            background: "#eaf3ff",
            boxShadow:
              "0 0 10px 3px rgba(147,197,253,0.85), 0 0 26px 8px rgba(59,130,246,0.45)",
          }}
        />
      </div>
    </motion.div>
  );
}
