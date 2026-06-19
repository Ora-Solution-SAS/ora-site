import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

export function AnimatedHeroTitle() {
  const { lang, t } = useLang();
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () =>
      lang === "fr"
        ? [
            "reportings manuels.",
            "consolidations fastidieuses.",
            "retraitements Excel.",
            "dashboards à la main.",
          ]
        : [
            "manual reporting.",
            "tedious consolidations.",
            "Excel cleanup work.",
            "hand-built dashboards.",
          ],
    [lang],
  );

  // Reset index whenever the list changes so we never render out-of-range.
  useEffect(() => {
    setTitleNumber(0);
  }, [titles]);

  // Shorter dwell so the headline keeps flowing — the long transition below
  // does most of the "screen time", leaving only a brief readable hold.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2800);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <h1 className="hero-stagger hero-d1 font-poppins text-[clamp(1.6rem,6.5vw,2.5rem)] md:text-[clamp(2.6rem,6vw,4.75rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#111827] dark:text-white text-center">
      <span className="block">{t({ fr: "Plus jamais de", en: "No more" })}</span>
      {/* Animated rotating phrase. `mode="wait"` guarantees ONE phrase on
          screen at a time: the outgoing phrase fully leaves (quick slide up +
          fade) before the incoming one arrives (smooth slide up from below +
          fade) — no ghosting/overlap. The gradient stays correct because the
          phrase is an inline-block sized to its own text (see CLAUDE.md);
          clipPath hides the vertical slide without clipping wide phrases. */}
      <span className="block relative pb-3" style={{ clipPath: "inset(0 -9999px)" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={`${lang}-${titleNumber}`}
            className="inline-block text-brand-gradient whitespace-nowrap"
            initial={{ opacity: 0, y: "0.45em", filter: "blur(5px)" }}
            animate={{
              opacity: 1, y: "0em", filter: "blur(0px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0, y: "-0.45em", filter: "blur(5px)",
              transition: { duration: 0.28, ease: [0.6, 0, 0.9, 0.3] },
            }}
          >
            {titles[titleNumber]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
