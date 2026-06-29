import { useRef, useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * ProblemSection — comparison of work "Without Ora" vs "With Ora".
 * Desktop: two side-by-side columns. Mobile: a single box at a time inside a
 * horizontal swipe carousel — you start on "Without Ora" and swipe (or tap the
 * segmented control / dots) horizontally into the "With Ora" box.
 */
export default function ProblemSection() {
  const { t } = useLang();

  const pains = [
    t({ fr: "Copier-coller et retraitements refaits à la main, chaque mois.", en: "Copy-paste and rework redone by hand, every month." }),
    t({ fr: "Fichiers trop sensibles pour ChatGPT ou un tableur partagé.", en: "Files too sensitive for ChatGPT or a shared spreadsheet." }),
    t({ fr: "Tout repose sur les rares personnes qui maîtrisent Excel.", en: "Everything rests on the few people who master Excel." }),
    t({ fr: "Recruter à temps plein juste pour gérer ces fichiers.", en: "Hiring full-time just to handle these files." }),
  ];

  const gains = [
    t({ fr: "Vos tâches Excel exécutées en un clic, à l'identique.", en: "Your Excel tasks run in one click, exactly as they are." }),
    t({ fr: "Données chiffrées de bout en bout, hébergées en Europe.", en: "Data encrypted end-to-end, hosted in Europe." }),
    t({ fr: "Aucune maîtrise d'Excel requise.", en: "No Excel mastery required." }),
    t({ fr: "Mis en place en quelques jours, sans recrutement.", en: "Set up in a few days, no hiring." }),
  ];

  return (
    <div id="probleme" className="relative mb-24 md:mb-32 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-20">
        <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
          {t({ fr: "Le problème", en: "The problem" })}
        </span>
        <h2 className="font-poppins font-semibold text-[1.4rem] md:text-[2.75rem] tracking-[-0.03em] leading-[1.2] md:leading-[1.12] text-[#111827] dark:text-white mt-2 md:mt-4">
          {t({ fr: "Votre Excel vous coûte plus que du temps", en: "Your Excel work costs more than time" })}
        </h2>
        <p className="font-inter mt-2.5 md:mt-5 text-[0.9rem] md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
          {t({
            fr: "Le travail Excel des équipes finance est lent, manuel et risqué, sur des données qu'on ne peut confier à personne.",
            en: "Finance teams' Excel work is slow, manual and risky, on data that can't be handed to anyone.",
          })}
        </p>
      </div>

      {/* Mobile — one box at a time, horizontal swipe between them. */}
      <MobileCompare pains={pains} gains={gains} />

      {/* Desktop / tablet — side-by-side columns. */}
      <div data-nav-shy className="hidden md:grid md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12 max-w-5xl mx-auto">
        {/* Without Ora — muted */}
        <div>
          <h3 className="font-poppins font-semibold text-xl md:text-[1.9rem] tracking-[-0.02em] text-gray-900 dark:text-white mb-1">
            {t({ fr: "Sans Ora", en: "Without Ora" })}
          </h3>
          <div className="mt-5 border-t border-gray-200 dark:border-white/10">
            {pains.map((p, i) => (
              <div key={i} className="flex items-center gap-3.5 min-h-[72px] border-b border-gray-200 dark:border-white/10">
                <span className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={3} />
                </span>
                <span className="font-inter text-[17px] leading-snug text-gray-800 dark:text-gray-100">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* With Ora — dark text + brand ✓ */}
        <div>
          <h3 className="font-poppins font-semibold text-xl md:text-[1.9rem] tracking-[-0.02em] text-gray-900 dark:text-white mb-1">
            {t({ fr: "Avec Ora", en: "With Ora" })}
          </h3>
          <div className="mt-5 border-t border-gray-200 dark:border-white/10">
            {gains.map((g, i) => (
              <div key={i} className="flex items-center gap-3.5 min-h-[72px] border-b border-gray-200 dark:border-white/10">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#0d9488] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </span>
                <span className="font-inter text-[17px] leading-snug text-gray-900 dark:text-white">{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mobile-only swipe carousel: "Without Ora" then "With Ora", one full-width
   box at a time. Swipe horizontally, or tap the segmented control / dots. */
function MobileCompare({ pains, gains }: { pains: string[]; gains: string[] }) {
  const { t } = useLang();
  const [idx, setIdx] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const slides = [
    { key: "without", title: t({ fr: "Sans Ora", en: "Without Ora" }), items: pains, positive: false },
    { key: "with", title: t({ fr: "Avec Ora", en: "With Ora" }), items: gains, positive: true },
  ];

  const go = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.offsetWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.offsetWidth));
  };

  return (
    <div className="md:hidden">
      {/* Segmented control */}
      <div className="mx-auto mb-5 flex w-fit items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-white/[0.06]">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => go(i)}
            className={`rounded-full px-4 py-1.5 font-inter text-[13px] font-semibold transition-colors ${
              idx === i
                ? `bg-white shadow-sm dark:bg-white/10 ${s.positive ? "text-[#0d9488] dark:text-teal-300" : "text-gray-900 dark:text-white"}`
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Slides */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {slides.map((s) => (
          <div key={s.key} className="w-full shrink-0 snap-center px-0.5">
            <div
              className={`rounded-[24px] border p-5 ${
                s.positive
                  ? "border-transparent bg-gradient-to-br from-[#3b82f6]/[0.07] to-[#0d9488]/[0.07] ring-1 ring-[#0d9488]/20"
                  : "border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.02]"
              }`}
            >
              <h3 className="font-poppins text-xl font-semibold tracking-[-0.02em] text-gray-900 dark:text-white">
                {s.title}
              </h3>
              <div className="mt-3 divide-y divide-gray-200 border-t border-gray-200 dark:divide-white/10 dark:border-white/10">
                {s.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        s.positive ? "bg-gradient-to-br from-[#3b82f6] to-[#0d9488]" : "bg-gray-200 dark:bg-white/10"
                      }`}
                    >
                      {s.positive ? (
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      ) : (
                        <X className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" strokeWidth={3} />
                      )}
                    </span>
                    <span className="font-inter text-[14px] leading-snug text-gray-800 dark:text-gray-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => go(i)}
            aria-label={s.title}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === i ? "w-6 bg-gradient-to-r from-[#3b82f6] to-[#0d9488]" : "w-1.5 bg-gray-300 dark:bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Swipe hint — only on the first box */}
      <div
        className={`mt-2 flex items-center justify-center gap-1 font-inter text-[12px] text-gray-400 transition-opacity duration-300 ${
          idx === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        {t({ fr: "Glissez pour voir avec Ora", en: "Swipe to see it with Ora" })}
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
