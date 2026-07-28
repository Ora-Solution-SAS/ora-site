import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import InViewVideo from "./InViewVideo";

/**
 * AutomationGallery — the "catalogue" wall that follows the six detailed
 * use-case cards (client, 2026-07-27, monday.com reference).
 *
 * Three columns of small cards, each just a visual + the automation name +
 * its family. Deliberately zoomed-out and simple: the point is the SHEER
 * NUMBER of automations, not the detail of any one of them (the six cards
 * above already do that job).
 *
 * Scroll mechanic: as the section travels through the viewport the two OUTER
 * columns drift up while the CENTRE column drifts down, then the page moves
 * on. Driven by a direct scroll listener rather than a scroll-linked
 * animation library: the same approach proved dependable elsewhere on this
 * page, and it is trivial to reason about.
 *
 * A handful of flagship rows reuse the real demo clips (lazy-loaded, so they
 * only download once visible); everything else uses a cheap CSS glyph, which
 * is what keeps ~18 cards affordable.
 */

type Glyph = "rows" | "bars" | "check" | "match" | "pdf" | "calendar" | "merge" | "shield";
type Item = { name: string; family: string; glyph: Glyph; video?: string };

const GA_CSS = `
.ga-card{background:#fff;border-radius:16px;overflow:hidden;
  border:1px solid rgba(15,23,42,.06);
  box-shadow:0 10px 26px -14px rgba(15,23,42,.22)}
.dark .ga-card{background:#101828;border-color:rgba(255,255,255,.08)}
.ga-viz{position:relative;aspect-ratio:16/10;overflow:hidden;
  background:linear-gradient(160deg,#f4f8ff,#eaf1fb)}
.dark .ga-viz{background:linear-gradient(160deg,#0f1b33,#0c1526)}
.ga-viz video{width:100%;height:100%;object-fit:cover;display:block}

/* ── Glyphes : représentations minimales, en CSS pur ── */
.ga-g{position:absolute;inset:0;padding:14px;display:flex;flex-direction:column;
  justify-content:center;gap:6px}
.ga-line{height:7px;border-radius:3px;background:#dbe6f7}
.dark .ga-line{background:rgba(255,255,255,.13)}
.ga-line.a{background:#bcd4f5}.dark .ga-line.a{background:rgba(147,197,253,.35)}
.ga-line.g{background:#a7e8cd}.dark .ga-line.g{background:rgba(52,211,153,.38)}
.ga-line.w{background:#f6d9a8}.dark .ga-line.w{background:rgba(251,191,36,.38)}
.ga-row{display:flex;align-items:center;gap:7px}
.ga-row .ga-line{flex:1}
.ga-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;background:#34d399}
.ga-dot.w{background:#fbbf24}
.ga-bars{display:flex;align-items:flex-end;gap:6px;height:100%;padding:6px 0}
.ga-bars i{flex:1;border-radius:3px 3px 0 0;background:#bcd4f5}
.dark .ga-bars i{background:rgba(147,197,253,.34)}
.ga-bars i.hi{background:#3b82f6}.dark .ga-bars i.hi{background:#3b82f6}
.ga-two{display:flex;align-items:center;gap:8px;height:100%}
.ga-two .col{flex:1;display:flex;flex-direction:column;gap:6px}
.ga-link{width:16px;height:2px;border-radius:2px;background:#93c5fd;flex-shrink:0}
.ga-sheet{position:relative;height:100%;border-radius:8px;background:#fff;
  border:1px solid #e6edf9;padding:9px;display:flex;flex-direction:column;gap:5px}
.dark .ga-sheet{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09)}
.ga-sheet .tag{position:absolute;right:8px;top:8px;font-size:7px;font-weight:800;
  letter-spacing:.05em;color:#dc2626;background:#fee2e2;border-radius:4px;padding:2px 5px}
.ga-cal{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;height:100%}
.ga-cal i{border-radius:4px;background:#dbe6f7}
.dark .ga-cal i{background:rgba(255,255,255,.12)}
.ga-cal i.on{background:#3b82f6}
.ga-shield{display:grid;place-items:center;height:100%}
`;

const ITEMS: Item[][] = [
  // Colonne 1
  [
    { name: "Automatisation FEC", family: "Audit", glyph: "check", video: "/final-fec.mp4" },
    { name: "Lettrage automatique", family: "Finance", glyph: "match" },
    { name: "Échantillonnage documenté", family: "Audit", glyph: "rows" },
    { name: "Balance âgée 30/60/90", family: "Finance", glyph: "bars" },
    { name: "Anonymiser des colonnes", family: "Qualité", glyph: "shield" },
    { name: "Séquence de pièces", family: "Audit", glyph: "rows" },
  ],
  // Colonne 2 (centre)
  [
    { name: "Reporting mensuel", family: "Contrôle de gestion", glyph: "bars", video: "/ora_reporting_v3.mp4" },
    { name: "Cadrage de TVA", family: "Finance", glyph: "check" },
    { name: "Agréger des fichiers identiques", family: "Qualité", glyph: "merge" },
    { name: "Rapprochement bancaire", family: "Trésorerie", glyph: "match" },
    { name: "Synthèse par filiale", family: "Reporting", glyph: "bars" },
    { name: "Relance des écarts", family: "Suivi", glyph: "calendar" },
  ],
  // Colonne 3
  [
    { name: "Extraction PDF", family: "Ressaisie", glyph: "pdf", video: "/ora_pdf_extract.mp4" },
    { name: "Pointage de comptes", family: "Révision", glyph: "match", video: "/ora_pointage_v3.mp4" },
    { name: "Tests sur le journal", family: "Audit", glyph: "rows" },
    { name: "Formatage pour logiciel métier", family: "Export", glyph: "merge" },
    { name: "Nettoyage des doublons", family: "Qualité", glyph: "check" },
    { name: "Contrôle de cohérence", family: "Contrôle", glyph: "calendar" },
  ],
];

function GlyphViz({ kind }: { kind: Glyph }) {
  if (kind === "bars") {
    return (
      <div className="ga-g">
        <div className="ga-bars">
          <i style={{ height: "42%" }} /><i style={{ height: "68%" }} />
          <i style={{ height: "54%" }} className="hi" /><i style={{ height: "86%" }} />
          <i style={{ height: "62%" }} className="hi" /><i style={{ height: "38%" }} />
        </div>
      </div>
    );
  }
  if (kind === "check") {
    return (
      <div className="ga-g">
        {[0, 1, 2].map((i) => (
          <div className="ga-row" key={i}>
            <span className={`ga-dot${i === 1 ? " w" : ""}`} />
            <span className={`ga-line${i === 1 ? " w" : " g"}`} />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "match") {
    return (
      <div className="ga-g">
        <div className="ga-two">
          <div className="col"><span className="ga-line a" /><span className="ga-line" /><span className="ga-line" /></div>
          <span className="ga-link" />
          <div className="col"><span className="ga-line a" /><span className="ga-line" /><span className="ga-line g" /></div>
        </div>
      </div>
    );
  }
  if (kind === "pdf") {
    return (
      <div className="ga-g">
        <div className="ga-sheet">
          <span className="tag">PDF</span>
          <span className="ga-line" style={{ width: "55%" }} />
          <span className="ga-line" /><span className="ga-line" />
          <span className="ga-line a" style={{ width: "70%" }} />
        </div>
      </div>
    );
  }
  if (kind === "calendar") {
    return (
      <div className="ga-g">
        <div className="ga-cal">
          {Array.from({ length: 12 }).map((_, i) => (
            <i key={i} className={i === 2 || i === 7 ? "on" : ""} />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "merge") {
    return (
      <div className="ga-g">
        <div className="ga-two">
          <div className="col"><span className="ga-line" /><span className="ga-line" /></div>
          <span className="ga-link" />
          <div className="col" style={{ flex: 1.4 }}>
            <span className="ga-line a" /><span className="ga-line" /><span className="ga-line" /><span className="ga-line" />
          </div>
        </div>
      </div>
    );
  }
  if (kind === "shield") {
    return (
      <div className="ga-g">
        <div className="ga-shield">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
      </div>
    );
  }
  // "rows"
  return (
    <div className="ga-g">
      <span className="ga-line a" style={{ width: "62%" }} />
      <span className="ga-line" /><span className="ga-line" />
      <span className="ga-line" style={{ width: "78%" }} />
    </div>
  );
}

export default function AutomationGallery() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const colRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;
    // Amplitude of the opposing drift, in px. The outer columns travel up by
    // this much while the centre one travels down (and vice versa).
    const A = 110;

    const apply = () => {
      const vh = window.innerHeight;
      const r = section.getBoundingClientRect();
      if (!vh || !r.height) return;
      // 0 when the section's top reaches the bottom of the screen,
      // 1 when its bottom reaches the top. 0.5 = centred, nothing offset.
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const offset = (p - 0.5) * A;
      const outer = colRefs[0].current && colRefs[2].current;
      if (outer) {
        colRefs[0].current!.style.transform = `translate3d(0, ${-offset}px, 0)`;
        colRefs[2].current!.style.transform = `translate3d(0, ${-offset}px, 0)`;
      }
      if (colRefs[1].current) {
        colRefs[1].current.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
    // colRefs is a stable array of refs created once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={sectionRef} className="relative mt-24 md:mt-36">
      <style>{GA_CSS}</style>

      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          {t({ fr: "Le catalogue", en: "The catalogue" })}
        </span>
        <h3 className="font-poppins font-semibold text-2xl md:text-[2.1rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-3">
          {t({
            fr: "Et des dizaines d'autres, déjà prêtes",
            en: "And dozens more, already built",
          })}
        </h3>
      </div>

      {/* Les colonnes dérivent en sens opposés pendant le défilement. La zone
          est volontairement un peu rognée en haut et en bas pour que le
          mouvement se lise sans laisser de vide. */}
      <div className="relative overflow-hidden max-w-[94rem] mx-auto px-2 md:px-6"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)",
          maskImage: "linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)",
        }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 py-6">
          {ITEMS.map((col, ci) => (
            <div
              key={ci}
              ref={colRefs[ci]}
              className={`flex flex-col gap-3 md:gap-5${ci === 2 ? " max-lg:hidden" : ""}`}
              style={{ willChange: "transform" }}
            >
              {col.map((item) => (
                <div className="ga-card" key={item.name}>
                  <div className="ga-viz">
                    {item.video ? (
                      <InViewVideo src={item.video} />
                    ) : (
                      <GlyphViz kind={item.glyph} />
                    )}
                  </div>
                  <div className="px-3.5 py-3">
                    <div className="font-inter font-semibold text-[13px] md:text-[13.5px] leading-tight text-[#111827] dark:text-white truncate">
                      {item.name}
                    </div>
                    <div className="mt-1 font-inter text-[11px] text-gray-500 dark:text-gray-400">
                      {item.family}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
