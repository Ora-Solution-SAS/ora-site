import { useRef, useEffect } from "react";
import { useLang } from "@/lib/i18n";

/* ── Bending-Spoons letter-by-letter scroll-reveal ───────────────────
 *  Pure-black section, phrases stacked as normal flowing text, page scrolls
 *  NORMALLY. A "reading frontier" sweeps through the text as you scroll:
 *  every LETTER's blur + opacity derives from its position along the reading
 *  order — letters above/left of the frontier are crisp white, letters
 *  after it melt into blur, with a smoothstep gradient across roughly one
 *  line of text. Because the horizontal position feeds the formula, letters
 *  of the SAME line sharpen left → right (exactly the Bending Spoons look),
 *  and previously-read phrases stay crisp above.
 *
 *  Perf: letter positions are measured ONCE (and on resize / font load);
 *  each rAF frame only reads scrollY and writes filter/opacity.
 *  Desktop only (hidden on mobile). */

const FOCUS = 0.56; //   viewport fraction where the frontier sits
// Hyper-sensitive to scroll: a TIGHT transition band (~one line of reading
// distance) so the reveal edge is crisp and each letter flips blurred→sharp
// with only a few px of scroll — the sweep tracks the finger letter by letter.
const BAND = 0.10; //    height of the sharp→blurred transition band
const BLUR_MAX = 14; //  px on unread letters
const OP_MIN = 0.08; //  faintest opacity (upcoming text barely ghosted)
const RISE_EM = 0.12; // unread letters sit slightly low and rise into place

type Unit = { el: HTMLElement; yInSec: number; colShift: number; lastB: number; lastO: number };

type Phrase = { text: string; gradient: string[] };

export default function ExcelReveal() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const unitElsRef = useRef<HTMLElement[]>([]);

  const phrases: Phrase[] = [
    {
      text: t({
        fr: "Votre temps est votre actif le plus précieux.",
        en: "Your time is your most valuable asset.",
      }),
      gradient: ["temps", "time"],
    },
    {
      text: t({
        fr: "Des relevés PDF à ressaisir, des balances Excel brutes à retraiter, des comptes à rapprocher. À chaque clôture.",
        en: "PDF statements to re-key, raw Excel balances to rework, accounts to reconcile. Every close.",
      }),
      // Highlight the manual TASK verbs — the action the accountant does by
      // hand is more telling than the file format.
      gradient: ["ressaisir", "retraiter", "rapprocher", "re-key", "rework", "reconcile"],
    },
    {
      text: t({
        fr: "On automatise cette chaîne de bout en bout, de la ressaisie au livrable, pour que vous consacriez votre expertise au conseil.",
        en: "We automate that chain end to end, from data entry to deliverable, so your expertise goes to advisory.",
      }),
      gradient: ["expertise", "conseil", "advisory"],
    },
    {
      text: t({
        fr: "Nous accompagnons les cabinets d'expertise comptable et d'audit. Gain de temps, confidentialité, meilleure organisation.",
        en: "We work with accounting and audit firms. Time saved, confidentiality, better organisation.",
      }),
      gradient: ["temps", "confidentialité", "organisation", "time", "confidentiality"],
    },
  ];

  unitElsRef.current = [];
  const collect = (el: HTMLElement | null) => {
    if (el && !unitElsRef.current.includes(el)) unitElsRef.current.push(el);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let units: Unit[] = [];
    let raf = 0;
    let active = false;
    let lastSecTop = Number.NaN; // skip the whole loop when nothing scrolled

    /* Measure every letter ONCE, relative to the SECTION (not the page): its
       centre offset inside the section + a horizontal shift (fraction of the
       line advanced × line height) so the frontier flows in READING ORDER.
       Section-relative offsets stay valid even if content above the section
       reflows (which, with page-Y offsets, caused the reveal to "jump"). */
    const measure = () => {
      const els = unitElsRef.current;
      const secTop = section.getBoundingClientRect().top;
      units = els.map((el) => {
        const r = el.getBoundingClientRect();
        const p = el.closest("p");
        const pr = p ? p.getBoundingClientRect() : r;
        const lineH = p ? parseFloat(getComputedStyle(p).lineHeight) || r.height : r.height;
        const colP = pr.width > 0 ? (r.left + r.width / 2 - pr.left) / pr.width : 0;
        return {
          el,
          yInSec: r.top - secTop + r.height / 2,
          colShift: (colP - 0.5) * lineH,
          lastB: -1,
          lastO: -1,
        };
      });
      lastSecTop = Number.NaN; // force a repaint on the next frame
    };

    /* One getBoundingClientRect per frame (the section), then pure math per
       letter. We only WRITE styles that actually changed (quantised), so at a
       steady scroll only the ~one line crossing the band repaints — the blur
       filter is never re-rasterised on the hundreds of already-settled
       letters. That is what keeps it buttery. */
    const frame = () => {
      const secTop = section.getBoundingClientRect().top;
      if (secTop !== lastSecTop) {
        lastSecTop = secTop;
        const vh = window.innerHeight || 1;
        const lo = FOCUS - BAND / 2;
        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          const pEff = (secTop + u.yInSec + u.colShift) / vh;
          let x = (pEff - lo) / BAND;
          x = x < 0 ? 0 : x > 1 ? 1 : x;
          const e = x * x * (3 - 2 * x); // smoothstep — buttery ramp
          const bQ = Math.round(e * BLUR_MAX * 4) / 4; // 0.25px steps
          const oQ = Math.round((1 - e * (1 - OP_MIN)) * 50) / 50; // 0.02 steps
          if (bQ === u.lastB && oQ === u.lastO) continue; // nothing to do
          u.lastB = bQ;
          u.lastO = oQ;
          const s = u.el.style;
          s.filter = bQ < 0.06 ? "" : `blur(${bQ}px)`;
          s.opacity = oQ >= 0.999 ? "" : String(oQ);
          s.transform = e < 0.01 ? "" : `translateY(${(e * RISE_EM).toFixed(3)}em)`;
        }
      }
      if (active) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (active) return;
      // Always re-measure when the section comes into view: offsets are
      // section-relative (scroll-independent) and cheap at word granularity,
      // so this is robust to any layout that wasn't final at mount.
      measure();
      active = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
    };

    const onResize = () => {
      measure();
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "25% 0px 25% 0px" },
    );
    io.observe(section);
    window.addEventListener("resize", onResize);
    (document as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready?.then(() => {
      measure();
    });
    measure();
    frame(); // paint initial state once even if not yet active

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [t]);

  /* Render a word as ONE animated span (blur + opacity + rise applied at the
     WORD level). Far fewer elements than per-letter → only ~35 composited
     layers instead of 250+, so scrolling stays buttery. The reading-order
     cascade (colShift per word) still sweeps word after word left→right, which
     at this font size reads as a continuous reveal — and matches how Bending
     Spoons blurs (by word/region, not per glyph). */
  const wordStyle = { marginRight: "0.26em", willChange: "opacity, filter, transform" } as const;
  const renderWord = (w: string, isGrad: boolean, key: number) => (
    <span
      key={key}
      ref={collect}
      className={`inline-block whitespace-nowrap ${isGrad ? "text-brand-gradient" : ""}`}
      style={wordStyle}
    >
      {w}
    </span>
  );

  return (
    <section
      ref={sectionRef}
      id="excel-reveal"
      data-nav-dark
      className="relative hidden md:block bg-black"
    >
      {/* Bending-Spoons layout: LEFT-aligned, full-width, big type. Stacked
          with a gap so ~2 phrases are on screen at once (previous crisp above,
          next blurred below). pb = black breathing space after the last line.
          PADDING, not a child margin (a margin collapses out → white line). */}
      <div className="px-6 md:px-[5.5vw] pt-[30vh] pb-[16vh]">
        {phrases.map((phrase, pi) => {
          const grad = phrase.gradient.map((g) => g.toLowerCase());
          return (
            <p
              key={pi}
              className="font-instrument font-normal text-white text-left text-balance"
              style={{
                fontSize: "clamp(2.1rem, 4.4vw, 5rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.035em",
                // Balance the wrapped lines so no lone word is left on the last
                // line (a widow) — complete, even lines read much better.
                textWrap: "balance",
                marginBottom: "14vh",
              }}
            >
              {phrase.text.split(" ").map((w, wi) => {
                const clean = w.replace(/[.,;:!?]/g, "").toLowerCase();
                return renderWord(w, grad.includes(clean), wi);
              })}
            </p>
          );
        })}

        {/* Conclusion — « Découvrez Ora » scrolls with the flow and reveals
            word-by-word LAST, like the phrases (no pinned panel). */}
        <p
          className="font-instrument font-normal text-white text-left"
          style={{ fontSize: "clamp(2.6rem, 6vw, 6.5rem)", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 0 }}
        >
          {renderWord(t({ fr: "Découvrez", en: "Meet" }), false, 90)}
          {renderWord("Ora.", true, 91)}
        </p>
      </div>
    </section>
  );
}
