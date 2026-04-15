import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

// SVG geometry from LogoHourglass — official Ora icon, 200×200 viewBox
const LOGO_BARS: [number, number, number, number][] = [
  [187, 72, 87, 10],   // A — short, upper-right
  [186, 125, 37, 34],  // C — long,  upper-mid
  [162, 165, 13, 73],  // D — long,  lower-mid
  [115, 190, 14, 128], // B — short, lower-left
];

type OraLogoSpinnerProps = {
  size?: number; // px, defaults to 80
  gradientId?: string; // unique SVG gradient id to avoid conflicts when rendered twice
};

export default function OraLogoSpinner({
  size = 80,
  gradientId = "g-ora-spinner",
}: OraLogoSpinnerProps) {
  const groupRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const b0 = useRef<SVGPathElement>(null);
  const b1 = useRef<SVGPathElement>(null);
  const b2 = useRef<SVGPathElement>(null);
  const b3 = useRef<SVGPathElement>(null);
  const barRefs = [b0, b1, b2, b3];

  useEffect(() => {
    const run = async () => {
      const g = groupRef.current;
      const ring = ringRef.current;
      const bars = barRefs.map((r) => r.current).filter(Boolean) as SVGPathElement[];
      if (!g || !ring || bars.length !== 4) return;

      // ── Phase 1: wind up ──────────────────────────────
      await Promise.all([
        animate(g, { rotate: [0, 360] }, { duration: 0.75, ease: [0.4, 0, 0.6, 1] }),
        ...bars.map((bar, i) =>
          animate(bar, { strokeDashoffset: [0, 1] }, { duration: 0.5, delay: i * 0.03, ease: [0.4, 0, 1, 1] })
        ),
      ]);

      // ── Phase 2: ring draws in ─────────────────────────
      await animate(ring, { strokeDashoffset: [1, 0] }, { duration: 0.35, ease: [0, 0, 0.4, 1] });

      // ── Phase 3: ring spins ────────────────────────────
      await animate(ring, { rotate: [0, 720] }, { duration: 1.3, ease: "linear" });

      // ── Phase 4: ring draws out ────────────────────────
      await animate(ring, { strokeDashoffset: [0, 1] }, { duration: 0.3, ease: [0.6, 0, 1, 1] });
      animate(ring, { rotate: 0 }, { duration: 0 });

      // ── Phase 5: unwind ───────────────────────────────
      await Promise.all([
        animate(g, { rotate: [360, 0] }, { duration: 0.75, ease: [0.4, 0, 0.6, 1] }),
        ...bars.map((bar, i) =>
          animate(bar, { strokeDashoffset: [1, 0] }, { duration: 0.5, delay: i * 0.03, ease: [0, 0, 0.6, 1] })
        ),
      ]);
    };

    const start = setTimeout(run, 600);
    return () => clearTimeout(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{ width: size, height: size, filter: "drop-shadow(0 0 20px rgba(59,130,246,0.25))" }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="10" y1="10"
            x2="190" y2="190"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        <g
          ref={groupRef}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          {LOGO_BARS.map(([x1, y1, x2, y2], i) => (
            <path
              key={i}
              ref={barRefs[i]}
              d={`M${x1} ${y1}L${x2} ${y2}`}
              stroke={`url(#${gradientId})`}
              strokeWidth={20}
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              style={{ strokeDasharray: "1 1", strokeDashoffset: 0 }}
            />
          ))}
        </g>

        <circle
          ref={ringRef}
          cx={100}
          cy={100}
          r={65}
          stroke={`url(#${gradientId})`}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={{
            strokeDasharray: "1 1",
            strokeDashoffset: 1,
            transformBox: "fill-box",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
    </div>
  );
}
