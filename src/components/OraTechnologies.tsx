import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * OraTechnologies — "Nos technologies", the Bending-Spoons-style tech section
 * under Atlas. Three dark cards (Minerva/Juno format: white SERIF title, grey
 * one-liner, abstract SVG visual), each answering a buyer objection:
 *   1. Deterministic engine  — no AI guessing on your numbers, auditable.
 *   2. Native automation     — RPA drives existing tools, no API/migration.
 *   3. Local models          — AI on-machine, client data stays at the firm.
 *
 * Ported from site-design-proprietary-tech/proprietary-tech-cards.html
 * (2026-07-24). Per its README: SVG viewBoxes/coords/gradients must NOT be
 * modified (compositions are pixel-calibrated), and the beam in card 1 uses
 * <rect>s, never a <line> (a vertical line has a zero-width bbox, so SVG
 * gradients/filters fail on it). Serif card titles are a deliberate exception
 * to the Poppins heading rule: the white-serif / grey-sans contrast IS the
 * Bending-Spoons effect. The section is ALWAYS dark (like ExcelReveal) so the
 * black cards read in both themes.
 */

const PT_CSS = `
.pt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;width:100%;max-width:1320px;margin:0 auto}
@media (max-width:1023px){.pt-grid{grid-template-columns:1fr;max-width:520px}}
.pt-card{position:relative;display:flex;flex-direction:column;min-height:520px;border-radius:28px;overflow:hidden;isolation:isolate;
  background:radial-gradient(140% 110% at 50% 0%,#101013 0%,#0a0a0c 45%,#060607 100%);
  border:1px solid rgba(255,255,255,.055)}
.pt-head{text-align:center;padding:46px 32px 0}
.pt-name{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:clamp(26px,2.4vw,33px);letter-spacing:.01em;color:#ffffff}
.pt-line{margin-top:12px;font-size:14.5px;line-height:1.55;color:#8a8f98;max-width:300px;margin-left:auto;margin-right:auto}
.pt-viz{margin-top:auto;line-height:0}
.pt-viz svg{width:100%;height:auto;display:block}
@media (max-width:1023px){.pt-card{min-height:0}.pt-viz{margin-top:12px}}
.pt-pulse{animation:ptPulse 5s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.pt-pulse-slow{animation:ptPulse 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ptPulse{0%,100%{opacity:.72;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
/* Self-running micro-motions: crawling dashes, a light pulse descending the
   beam, twinkling data points, a breathing sphere, a glint sweeping the dome.
   (Satellite orbits are SMIL animateMotion in the SVG itself.) */
.pt-dash{animation:ptDash 16s linear infinite}
@keyframes ptDash{to{stroke-dashoffset:-160}}
.pt-beampulse{animation:ptBeam 2.8s ease-in infinite;transform-box:fill-box}
@keyframes ptBeam{0%{transform:translateY(0);opacity:0}15%{opacity:1}75%{opacity:1}100%{transform:translateY(258px);opacity:0}}
.pt-twinkle{animation:ptTwinkle 4.2s ease-in-out infinite}
.pt-twinkle.t2{animation-delay:1.4s}
.pt-twinkle.t3{animation-delay:2.6s}
@keyframes ptTwinkle{0%,100%{opacity:.3}50%{opacity:.95}}
.pt-breathe{animation:ptBreathe 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ptBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
.pt-domesweep{stroke-dasharray:64 550;animation:ptDome 5.5s linear infinite}
@keyframes ptDome{from{stroke-dashoffset:614}to{stroke-dashoffset:-64}}
@media (prefers-reduced-motion:reduce){
  .pt-pulse,.pt-pulse-slow,.pt-dash,.pt-twinkle,.pt-breathe{animation:none}
  .pt-beampulse,.pt-domesweep{display:none}
}
`;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function OraTechnologies() {
  const { t } = useLang();
  // SMIL orbit animations can't be disabled from CSS: skip rendering them
  // entirely under prefers-reduced-motion and show the static satellites.
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <section id="technologies" data-nav-dark className="relative bg-black px-6 md:px-12 py-24 md:py-32">
      <style>{PT_CSS}</style>

      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
          {t({ fr: "Sous le capot", en: "Under the hood" })}
        </span>
        <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-white mt-4">
          {t({ fr: "Nos technologies", en: "Our technology" })}
        </h2>
        <p className="font-inter mt-4 text-base md:text-lg text-gray-400">
          {t({
            fr: "Pas de boîte noire : voici sur quoi Ora repose.",
            en: "No black box: this is what Ora runs on.",
          })}
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        <div className="pt-grid">
          {/* 1 · Deterministic engine — funnel of discs: raw data to one exact output */}
          <motion.div className="pt-card" variants={fadeUp}>
            <div className="pt-head">
              <h3 className="pt-name">{t({ fr: "Moteur déterministe", en: "Deterministic engine" })}</h3>
              <p className="pt-line">
                {t({
                  fr: "Des règles, pas des suppositions. Mêmes entrées, mêmes sorties, chaque étape auditable.",
                  en: "Rules, not guesses. Same input, same output, every step auditable.",
                })}
              </p>
            </div>
            <div className="pt-viz">
              <svg viewBox="0 0 520 470" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="pt1-beam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset=".45" stopColor="#3b82f6" stopOpacity=".55" />
                    <stop offset=".85" stopColor="#93c5fd" stopOpacity=".9" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>
                  <radialGradient id="pt1-disc" cx=".5" cy=".4" r=".7">
                    <stop offset="0" stopColor="#ffffff" stopOpacity=".07" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>
                  <filter id="pt1-blur" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="9" />
                  </filter>
                  <linearGradient id="pt1-pulsegrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset=".5" stopColor="#ffffff" stopOpacity=".95" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* raw data points, scattered at the top (twinkling) */}
                <circle className="pt-twinkle" cx="205" cy="70" r="2.4" fill="#ffffff" opacity=".5" />
                <circle className="pt-twinkle t2" cx="245" cy="56" r="2.8" fill="#ffffff" opacity=".75" />
                <circle className="pt-twinkle t3" cx="291" cy="74" r="2" fill="#ffffff" opacity=".45" />
                <circle className="pt-twinkle t2" cx="323" cy="60" r="2.4" fill="#ffffff" opacity=".6" />
                <circle className="pt-twinkle" cx="263" cy="86" r="1.8" fill="#ffffff" opacity=".65" />
                <circle className="pt-twinkle t3" cx="178" cy="88" r="1.8" fill="#ffffff" opacity=".4" />
                <circle className="pt-twinkle t2" cx="345" cy="90" r="1.7" fill="#93c5fd" opacity=".6" />

                {/* funnel: smaller and sharper discs (top dashes crawl) */}
                <ellipse className="pt-dash" cx="260" cy="128" rx="190" ry="46" fill="none" stroke="#ffffff" strokeOpacity=".26" strokeWidth="1.4" strokeDasharray="7 9" />
                <ellipse cx="260" cy="196" rx="150" ry="37" fill="url(#pt1-disc)" stroke="#ffffff" strokeOpacity=".34" strokeWidth="1.3" />
                <ellipse cx="260" cy="258" rx="108" ry="27" fill="rgba(59,130,246,.05)" stroke="#ffffff" strokeOpacity=".5" strokeWidth="1.3" />
                <ellipse cx="260" cy="314" rx="66" ry="17" fill="rgba(59,130,246,.09)" stroke="#ffffff" strokeOpacity=".78" strokeWidth="1.4" />

                {/* central beam (rects: a vertical <line> has a zero-width bbox) */}
                <rect x="255" y="60" width="10" height="318" fill="#3b82f6" opacity=".14" />
                <rect x="258" y="58" width="4" height="320" fill="#3b82f6" opacity=".3" />
                <rect x="258.9" y="56" width="2.2" height="322" fill="url(#pt1-beam)" />
                {/* light pulse travelling down the beam */}
                <rect className="pt-beampulse" x="258.2" y="56" width="3.6" height="64" fill="url(#pt1-pulsegrad)" />

                {/* output: one exact point */}
                <circle className="pt-pulse" cx="260" cy="382" r="16" fill="#3b82f6" opacity=".5" filter="url(#pt1-blur)" />
                <circle cx="260" cy="382" r="4.5" fill="#ffffff" />

                {/* teal base ring */}
                <ellipse cx="260" cy="404" rx="204" ry="50" fill="none" stroke="#0d9488" strokeOpacity=".38" strokeWidth="1.2" />
              </svg>
            </div>
          </motion.div>

          {/* 2 · Native automation — Ora core orbited by the firm's existing tools */}
          <motion.div className="pt-card" variants={fadeUp}>
            <div className="pt-head">
              <h3 className="pt-name">{t({ fr: "Automatisation native", en: "Native automation" })}</h3>
              <p className="pt-line">
                {t({
                  fr: "Le RPA pilote les outils que vous utilisez déjà : Excel, navigateur, ERP. Sans API, sans migration.",
                  en: "RPA that drives the tools you already use. No API, no migration.",
                })}
              </p>
            </div>
            <div className="pt-viz">
              <svg viewBox="0 0 520 470" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <radialGradient id="pt2-halo" cx=".5" cy=".5" r=".5">
                    <stop offset="0" stopColor="#3b82f6" stopOpacity=".28" />
                    <stop offset=".7" stopColor="#3b82f6" stopOpacity=".07" />
                    <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="pt2-core" cx=".38" cy=".34" r=".8">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset=".45" stopColor="#bfdbfe" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </radialGradient>
                </defs>

                {/* core halo */}
                <circle className="pt-pulse-slow" cx="260" cy="240" r="138" fill="url(#pt2-halo)" />

                {/* orbit rings — satellites travel their ellipse via SMIL
                    animateMotion (paths = the exact rings, inside the same
                    rotated groups); static fallback under reduced motion. */}
                <g transform="rotate(-16 260 240)">
                  <ellipse cx="260" cy="240" rx="195" ry="62" fill="none" stroke="#ffffff" strokeOpacity=".22" strokeWidth="1.2" />
                  {reduced ? (
                    <>
                      <circle cx="419.7" cy="275.6" r="5.5" fill="#e2e8f0" />
                      <circle cx="419.7" cy="275.6" r="10.5" fill="none" stroke="#e2e8f0" strokeOpacity=".35" strokeWidth="1" />
                      <circle cx="71.6" cy="224" r="3.4" fill="#ffffff" opacity=".55" />
                    </>
                  ) : (
                    <>
                      <g>
                        <circle r="5.5" fill="#e2e8f0" />
                        <circle r="10.5" fill="none" stroke="#e2e8f0" strokeOpacity=".35" strokeWidth="1" />
                        <animateMotion dur="18s" repeatCount="indefinite" begin="-4s" path="M 455,240 a 195,62 0 1,1 -390,0 a 195,62 0 1,1 390,0" />
                      </g>
                      <g>
                        <circle r="3.4" fill="#ffffff" opacity=".55" />
                        <animateMotion dur="18s" repeatCount="indefinite" begin="-13s" path="M 455,240 a 195,62 0 1,1 -390,0 a 195,62 0 1,1 390,0" />
                      </g>
                    </>
                  )}
                </g>
                <g transform="rotate(14 260 240)">
                  <ellipse cx="260" cy="240" rx="152" ry="82" fill="none" stroke="#ffffff" strokeOpacity=".15" strokeWidth="1.2" />
                  {reduced ? (
                    <circle cx="184" cy="311" r="4.8" fill="#cbd5e1" opacity=".9" />
                  ) : (
                    <g>
                      <circle r="4.8" fill="#cbd5e1" opacity=".9" />
                      <animateMotion dur="13s" repeatCount="indefinite" begin="-6s" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path="M 412,240 a 152,82 0 1,1 -304,0 a 152,82 0 1,1 304,0" />
                    </g>
                  )}
                </g>
                <g transform="rotate(-3 260 240)">
                  <ellipse cx="260" cy="240" rx="226" ry="44" fill="none" stroke="#0d9488" strokeOpacity=".4" strokeWidth="1.2" />
                  {reduced ? (
                    <circle cx="455.7" cy="218" r="4" fill="#2dd4bf" opacity=".85" />
                  ) : (
                    <g>
                      <circle r="4" fill="#2dd4bf" opacity=".85" />
                      <animateMotion dur="26s" repeatCount="indefinite" begin="-9s" path="M 486,240 a 226,44 0 1,1 -452,0 a 226,44 0 1,1 452,0" />
                    </g>
                  )}
                </g>

                {/* core */}
                <circle cx="260" cy="240" r="27" fill="url(#pt2-core)" />
                <circle cx="260" cy="240" r="37" fill="none" stroke="#93c5fd" strokeOpacity=".35" strokeWidth="1" />
              </svg>
            </div>
          </motion.div>

          {/* 3 · Local models — sphere under a dome: data stays at the firm */}
          <motion.div className="pt-card" variants={fadeUp}>
            <div className="pt-head">
              <h3 className="pt-name">{t({ fr: "Modèles locaux", en: "Local models" })}</h3>
              <p className="pt-line">
                {t({
                  fr: "L'IA tourne sur votre machine. Les données de vos clients ne quittent jamais le cabinet.",
                  en: "AI runs on your machine. Client data never leaves the firm.",
                })}
              </p>
            </div>
            <div className="pt-viz">
              <svg viewBox="0 0 520 470" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <radialGradient id="pt3-sphere" cx=".36" cy=".3" r=".85">
                    <stop offset="0" stopColor="#f8fafc" />
                    <stop offset=".5" stopColor="#cbd5e1" />
                    <stop offset=".85" stopColor="#64748b" />
                    <stop offset="1" stopColor="#475569" />
                  </radialGradient>
                  <linearGradient id="pt3-dome" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#3b82f6" stopOpacity=".15" />
                    <stop offset=".5" stopColor="#5eead4" stopOpacity=".65" />
                    <stop offset="1" stopColor="#3b82f6" stopOpacity=".15" />
                  </linearGradient>
                  <filter id="pt3-blur" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="14" />
                  </filter>
                </defs>

                {/* teal glow under the sphere */}
                <ellipse className="pt-pulse-slow" cx="260" cy="352" rx="118" ry="22" fill="#0d9488" opacity=".18" filter="url(#pt3-blur)" />

                {/* base disc */}
                <ellipse cx="260" cy="352" rx="205" ry="50" fill="rgba(255,255,255,.035)" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.2" />

                {/* data points staying inside (twinkling) */}
                <circle className="pt-twinkle" cx="150" cy="330" r="1.8" fill="#5eead4" opacity=".6" />
                <circle className="pt-twinkle t2" cx="352" cy="322" r="1.6" fill="#ffffff" opacity=".45" />
                <circle className="pt-twinkle t3" cx="312" cy="346" r="1.4" fill="#5eead4" opacity=".4" />

                {/* sphere (slow breathing) */}
                <circle className="pt-breathe" cx="260" cy="268" r="82" fill="url(#pt3-sphere)" />

                {/* protective dome + glint sweeping along the arc */}
                <path d="M 65 352 A 195 195 0 0 1 455 352" fill="none" stroke="url(#pt3-dome)" strokeWidth="1.5" />
                <path className="pt-domesweep" d="M 65 352 A 195 195 0 0 1 455 352" fill="none" stroke="#5eead4" strokeOpacity=".85" strokeWidth="1.6" />
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
