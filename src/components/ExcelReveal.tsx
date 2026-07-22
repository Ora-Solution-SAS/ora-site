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

type Unit = { el: HTMLElement; yPage: number; colShift: number };

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
        fr: "Cessez de gaspiller des heures sur des tâches répétitives, chronophages et sans valeur ajoutée, sur Excel.",
        en: "Stop wasting hours on repetitive, time-consuming, zero-value tasks in Excel.",
      }),
      gradient: ["Excel"],
    },
    {
      text: t({
        fr: "Nous automatisons et optimisons le temps que vous passez sur Excel, pour l'allouer au conseil.",
        en: "We automate and optimize the time you spend in Excel, so you can devote it to advisory.",
      }),
      gradient: ["automatisons", "conseil", "automate", "advisory"],
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
    let measured = false;

    /* Measure every letter once: its page-Y centre, plus a horizontal shift
       (fraction of the line advanced × line height) so the frontier flows in
       READING ORDER — end of a line lines up with the start of the next. */
    const measure = () => {
      const els = unitElsRef.current;
      const sy = window.scrollY;
      units = els.map((el) => {
        const r = el.getBoundingClientRect();
        const p = el.closest("p");
        const pr = p ? p.getBoundingClientRect() : r;
        const lineH = p ? parseFloat(getComputedStyle(p).lineHeight) || r.height : r.height;
        const colP = pr.width > 0 ? (r.left + r.width / 2 - pr.left) / pr.width : 0;
        return {
          el,
          yPage: r.top + r.height / 2 + sy,
          colShift: (colP - 0.5) * lineH,
        };
      });
      measured = units.length > 0 && units.some((u) => u.yPage > 0);
    };

    const frame = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight || 1;
      const lo = FOCUS - BAND / 2;
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        const pEff = (u.yPage - sy + u.colShift) / vh;
        let x = (pEff - lo) / BAND;
        x = x < 0 ? 0 : x > 1 ? 1 : x;
        const e = x * x * (3 - 2 * x); // smoothstep — buttery ramp
        u.el.style.filter = e < 0.01 ? "none" : `blur(${(e * BLUR_MAX).toFixed(2)}px)`;
        u.el.style.opacity = (1 - e * (1 - OP_MIN)).toFixed(3);
        // Subtle settle: unread letters sit a touch low, rise as they sharpen.
        u.el.style.transform = e < 0.01 ? "none" : `translateY(${(e * RISE_EM).toFixed(3)}em)`;
      }
      if (active) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (active) return;
      if (!measured) measure();
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

  /* Render a word: letter-by-letter spans inside a nowrap word wrapper so
     line wrapping stays word-based. Gradient keywords stay ONE span (splitting
     a background-clip:text gradient per letter would restripe it). */
  const renderWord = (w: string, isGrad: boolean, key: number) => {
    if (isGrad) {
      return (
        <span key={key} className="inline-block whitespace-nowrap" style={{ marginRight: "0.26em" }}>
          <span
            ref={collect}
            className="inline-block text-brand-gradient"
            style={{ willChange: "opacity, filter, transform" }}
          >
            {w}
          </span>
        </span>
      );
    }
    return (
      <span key={key} className="inline-block whitespace-nowrap" style={{ marginRight: "0.26em" }}>
        {[...w].map((ch, ci) => (
          <span
            key={ci}
            ref={collect}
            className="inline-block"
            style={{ willChange: "opacity, filter, transform" }}
          >
            {ch}
          </span>
        ))}
      </span>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="excel-reveal"
      data-nav-dark
      className="relative hidden md:block bg-black"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-[38vh]">
        {phrases.map((phrase, pi) => {
          const grad = phrase.gradient.map((g) => g.toLowerCase());
          return (
            <p
              key={pi}
              className="font-instrument font-normal text-white text-center"
              style={{
                fontSize: "clamp(2.3rem, 5vw, 4.1rem)",
                lineHeight: 1.14,
                letterSpacing: "-0.03em",
                marginBottom: pi < phrases.length - 1 ? "24vh" : "20vh",
              }}
            >
              {phrase.text.split(" ").map((w, wi) => {
                const clean = w.replace(/[.,;:!?]/g, "").toLowerCase();
                return renderWord(w, grad.includes(clean), wi);
              })}
            </p>
          );
        })}

        {/* Conclusion */}
        <p
          className="font-instrument font-normal text-white text-center"
          style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)", lineHeight: 1.1, letterSpacing: "-0.035em" }}
        >
          {renderWord(t({ fr: "Découvrez", en: "Meet" }), false, 0)}
          <span className="inline-block whitespace-nowrap">
            <span ref={collect} className="inline-block text-brand-gradient" style={{ willChange: "opacity, filter, transform" }}>
              Ora.
            </span>
          </span>
        </p>
      </div>
    </section>
  );
}
