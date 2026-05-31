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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2800);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <h1 className="hero-stagger hero-d1 font-poppins text-[clamp(2.2rem,5.5vw,4rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#111827] dark:text-white text-center">
      <span className="block">{t({ fr: "Plus jamais de", en: "No more" })}</span>
      <span className="block relative pb-3" style={{ clipPath: "inset(0 -9999px)" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={`${lang}-${titleNumber}`}
            className="inline-block text-brand-gradient whitespace-nowrap"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {titles[titleNumber]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
