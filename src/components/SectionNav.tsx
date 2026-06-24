import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

/**
 * SectionNav — right-edge scroll-spy (à la "The Patch"): a compact vertical
 * list of the homepage sections that highlights the active one as you scroll
 * and jumps to it on click. Desktop only. Appears once past the hero.
 *
 * Visibility: it becomes fully transparent whenever it overlaps a visual
 * element (anything tagged `data-nav-shy` — mockups, cards, dark sections),
 * so it never sits on top of content; otherwise it's shown.
 *
 * Text color adapts: always-dark sections (Atlas, Industries) — or the whole
 * site in dark mode — get light text; light sections get brand blue.
 */

const SECTIONS = [
  { id: "probleme", fr: "Le problème", en: "The problem" },
  { id: "atlas", fr: "Atlas", en: "Atlas" },
  { id: "industries", fr: "Secteurs", en: "Sectors" },
  { id: "faq", fr: "FAQ", en: "FAQ" },
];

// Sections rendered on an always-dark background, regardless of theme.
const FORCE_DARK = new Set(["atlas", "industries"]);

export default function SectionNav({ theme }: { theme: "light" | "dark" }) {
  const { t } = useLang();
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(SECTIONS[0].id);
  const [visible, setVisible] = useState(false);
  const [overVisual, setOverVisual] = useState(false);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      // Show only once the user has scrolled past most of the hero.
      setVisible(window.scrollY > window.innerHeight * 0.6);

      // Active = the last section whose top has crossed the 40% trigger line.
      const line = window.innerHeight * 0.4;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive((p) => (p !== current ? current : p));

      // Hide entirely if the nav overlaps any tagged visual element.
      const nav = navRef.current;
      if (nav) {
        const nr = nav.getBoundingClientRect();
        let over = false;
        document.querySelectorAll<HTMLElement>("[data-nav-shy]").forEach((el) => {
          const r = el.getBoundingClientRect();
          const apart = r.right < nr.left || r.left > nr.right || r.bottom < nr.top || r.top > nr.bottom;
          if (!apart) over = true;
        });
        setOverVisual((p) => (p !== over ? over : p));
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onDark = theme === "dark" || FORCE_DARK.has(active);
  const activeColor = onDark ? "#ffffff" : "#3b82f6";
  const idleColor = onDark ? "rgba(255,255,255,0.5)" : "rgba(15,23,42,0.4)";
  const shown = visible && !overVisual;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as any).__lenis;
    if (lenis?.scrollTo) lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Navigation des sections"
      className={`hidden lg:flex fixed right-6 xl:right-9 top-1/2 -translate-y-1/2 z-40 flex-col items-start gap-4 transition-opacity duration-300 ${
        shown ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {SECTIONS.map((s) => {
        const on = active === s.id;
        const color = on ? activeColor : idleColor;
        return (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            className="group flex items-center gap-3 transition-colors duration-200"
            style={{ color }}
          >
            <span className="flex w-7 items-center">
              <span
                className="h-[2px] rounded-full transition-all duration-300"
                style={{ width: on ? 26 : 12, background: color }}
              />
            </span>
            <span
              className={`text-[12.5px] whitespace-nowrap font-inter transition-all duration-200 ${on ? "font-semibold" : "font-medium"}`}
            >
              {t({ fr: s.fr, en: s.en })}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
