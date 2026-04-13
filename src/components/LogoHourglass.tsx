import { useTransform, motion, type MotionValue } from "framer-motion";
import { useRef, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   LogoHourglass v3 — SVG path-based logo ⇄ hourglass morph

   Uses <path> with strokeLinecap="round" to perfectly match
   the original Ora icon capsules. Endpoints are animated via
   direct DOM writes (no React re-renders) for 60 fps smoothness.

   Key facts from the official SVG:
   • 4 bars at 31.5°, stroke-width 50 in 450×450
   • 2 SHORT bars (A top-right, B bottom-left) — 118 px scaled
   • 2 LONG bars (C upper-mid, D lower-mid) — 175 px scaled
   • Gradient: blue #3b82f6 → teal #0d9488

   Timeline  (progress 0 → 1):
   [0.00 – 0.06]  Fade in
   [0.06 – 0.34]  Logo → hourglass morph
   [0.22 – 0.36]  Cap bars grow in
   [0.34 – 0.64]  Hold + sand particles
   [0.62 – 0.76]  Cap bars shrink out
   [0.64 – 0.92]  Hourglass → logo morph
   [0.92 – 1.00]  Static logo
   ══════════════════════════════════════════════════════════════ */

/* ── Geometry ─────────────────────────────────────────────── */
const STROKE = 20;

/* ── Logo state  [x1, y1,  x2,  y2] ──────────────────────── *
 *  Endpoints scaled to a 200×200 viewBox from the official SVG.
 *  All bars at 31.5°. Convention: point-1 is upper-right end. */
const LOGO: [number, number, number, number][] = [
  [187, 72, 87, 10],    // A — SHORT, upper-right region
  [186, 125, 37, 34],   // C — LONG,  upper-mid
  [162, 165, 13, 73],   // D — LONG,  lower-mid
  [115, 190, 14, 128],  // B — SHORT, lower-left region
];

/* ── Hourglass state  [x1, y1,  x2,  y2] ─────────────────── *
 *  Pinch point at (100, 100).  Corners at edges of viewBox.
 *  Mapping chosen to minimise travel:
 *    A (short, top-right)  → top-right /   — barely moves
 *    C (long,  upper-mid)  → top-left  \   — swings left
 *    D (long,  lower-mid)  → bottom-right\ — swings right
 *    B (short, bottom-left) → bottom-left/ — barely moves   */
const HOUR: [number, number, number, number][] = [
  [190, 12, 100, 100],   // A → top-right /
  [10, 12, 100, 100],    // C → top-left  \
  [190, 188, 100, 100],  // D → bottom-right \
  [10, 188, 100, 100],   // B → bottom-left  /
];

/* ── Cap bars (top + bottom edges of hourglass) ───────────── *
 *  Grow outward from center point, then shrink back.          */
const CAP_FROM: [number, number, number, number][] = [
  [100, 12, 100, 12],    // top cap: starts as a dot
  [100, 188, 100, 188],  // bottom cap: starts as a dot
];
const CAP_TO: [number, number, number, number][] = [
  [10, 12, 190, 12],     // top cap: full width
  [10, 188, 190, 188],   // bottom cap: full width
];

/* ── Timing ───────────────────────────────────────────────── */
const MORPH_IN: [number, number] = [0.06, 0.34];
const MORPH_OUT: [number, number] = [0.64, 0.92];
const CAP_IN: [number, number] = [0.22, 0.36];
const CAP_OUT: [number, number] = [0.62, 0.76];

// Bars A & B (small move) morph slightly faster; C & D (big swing) slightly later
const BAR_STAGGER = [0, 0.02, 0.02, 0] as const;

/* ── Easing — smooth cubic in/out ─────────────────────────── */
function ease(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/* ── Interpolation ────────────────────────────────────────── */
function lerp4(
  p: number,
  from: [number, number, number, number],
  to: [number, number, number, number],
  inR: [number, number],
  outR: [number, number],
  stagger = 0,
): [number, number, number, number] {
  const iS = inR[0] + stagger,
    iE = inR[1] + stagger;
  const oS = outR[0] + stagger,
    oE = outR[1] + stagger;

  if (p <= iS || p >= oE) return from;
  if (p >= iE && p <= oS) return to;

  let t: number, a: readonly number[], b: readonly number[];
  if (p < iE) {
    t = ease((p - iS) / (iE - iS));
    a = from;
    b = to;
  } else {
    t = ease((p - oS) / (oE - oS));
    a = to;
    b = from;
  }
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ];
}

function toD(pts: [number, number, number, number]): string {
  return `M${pts[0].toFixed(1)} ${pts[1].toFixed(1)}L${pts[2].toFixed(1)} ${pts[3].toFixed(1)}`;
}

/* ── Sand grains ──────────────────────────────────────────── */
interface Grain {
  x: number;
  r: number;
  s: number;
  e: number;
  c: string;
}
const GRAINS: Grain[] = [
  { x: 99, r: 3.0, s: 0.35, e: 0.53, c: "#3b82f6" },
  { x: 101, r: 2.3, s: 0.38, e: 0.56, c: "#1a8f87" },
  { x: 100, r: 3.2, s: 0.41, e: 0.59, c: "#2e7dd6" },
  { x: 98, r: 2.0, s: 0.44, e: 0.61, c: "#0d9488" },
  { x: 102, r: 2.6, s: 0.47, e: 0.64, c: "#3576cc" },
];

function useGrain(progress: MotionValue<number>, g: Grain) {
  const d = g.e - g.s;
  const y = useTransform(
    progress,
    [g.s, g.s + d * 0.35, g.s + d * 0.5, g.s + d * 0.65, g.e],
    [45, 86, 100, 114, 155],
  );
  const opacity = useTransform(
    progress,
    [g.s, g.s + d * 0.15, g.e - d * 0.15, g.e],
    [0, 0.75, 0.75, 0],
  );
  return { y, opacity };
}

/* ── Component ────────────────────────────────────────────── */
export const LogoHourglass: React.FC<{ progress: MotionValue<number> }> = ({
  progress,
}) => {
  /* Refs for direct DOM updates (zero React re-renders) */
  const b0 = useRef<SVGPathElement>(null);
  const b1 = useRef<SVGPathElement>(null);
  const b2 = useRef<SVGPathElement>(null);
  const b3 = useRef<SVGPathElement>(null);
  const capT = useRef<SVGPathElement>(null);
  const capB = useRef<SVGPathElement>(null);
  const barRefs = [b0, b1, b2, b3];

  useEffect(() => {
    function update(p: number) {
      // 4 main bars
      for (let i = 0; i < 4; i++) {
        const pts = lerp4(p, LOGO[i], HOUR[i], MORPH_IN, MORPH_OUT, BAR_STAGGER[i]);
        barRefs[i].current?.setAttribute("d", toD(pts));
      }
      // 2 cap bars
      for (let i = 0; i < 2; i++) {
        const pts = lerp4(p, CAP_FROM[i], CAP_TO[i], CAP_IN, CAP_OUT);
        [capT, capB][i].current?.setAttribute("d", toD(pts));
      }
    }
    update(progress.get());
    return progress.on("change", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  /* Framer Motion values */
  const fadeIn = useTransform(progress, [0, 0.06], [0, 1]);
  const scale = useTransform(
    progress,
    [0, 0.32, 0.38, 0.60, 0.66, 1],
    [1, 1, 1.03, 1.03, 1, 1],
  );
  const capOpacity = useTransform(progress, [0.22, 0.36, 0.62, 0.76], [0, 1, 1, 0]);

  /* Sand grains */
  const g0 = useGrain(progress, GRAINS[0]);
  const g1 = useGrain(progress, GRAINS[1]);
  const g2 = useGrain(progress, GRAINS[2]);
  const g3 = useGrain(progress, GRAINS[3]);
  const g4 = useGrain(progress, GRAINS[4]);
  const grains = [g0, g1, g2, g3, g4];

  return (
    <motion.div
      className="w-48 md:w-64 lg:w-72"
      style={{
        opacity: fadeIn,
        scale,
        filter:
          "drop-shadow(0 0 32px rgba(59,130,246,0.18)) drop-shadow(0 0 12px rgba(13,148,136,0.12))",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="ora-g"
            x1="10"
            y1="10"
            x2="190"
            y2="190"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* ── 4 main bars ── */}
        <path
          ref={b0}
          d={toD(LOGO[0])}
          stroke="url(#ora-g)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={b1}
          d={toD(LOGO[1])}
          stroke="url(#ora-g)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={b2}
          d={toD(LOGO[2])}
          stroke="url(#ora-g)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={b3}
          d={toD(LOGO[3])}
          stroke="url(#ora-g)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Cap bars (top + bottom) ── */}
        <motion.path
          ref={capT}
          d={toD(CAP_FROM[0])}
          stroke="url(#ora-g)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          style={{ opacity: capOpacity }}
        />
        <motion.path
          ref={capB}
          d={toD(CAP_FROM[1])}
          stroke="url(#ora-g)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          style={{ opacity: capOpacity }}
        />

        {/* ── Sand grains ── */}
        {grains.map((g, i) => (
          <motion.circle
            key={`g${i}`}
            cx={GRAINS[i].x}
            cy={0}
            r={GRAINS[i].r}
            fill={GRAINS[i].c}
            style={{ y: g.y, opacity: g.opacity }}
          />
        ))}
      </svg>
    </motion.div>
  );
};
