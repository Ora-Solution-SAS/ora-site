import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { DEMO_AUTOMATIONS, type DemoAutomation } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Illustration side of the big card ────────────────────────────────────────
// Drawn before/after placeholder, replaced by automation.image when provided
// (real screenshot of the produced workbook/PDF).
function Illustration({ automation }: { automation: DemoAutomation }) {
  const { t } = useLang();
  if (automation.image) {
    return (
      <img
        src={automation.image}
        alt={t(automation.title)}
        className="h-full w-full object-cover"
      />
    );
  }

  const { previewVariant: variant } = automation;
  const inputExt = automation.accepts[0].replace(".", "").toUpperCase();

  return (
    <div
      className="flex h-full min-h-[220px] flex-col items-center justify-center gap-5 bg-blue-50/60 px-6 py-8 dark:bg-blue-500/[0.05]"
      aria-hidden
    >
      <div className="flex items-center gap-4">
        {/* Before */}
        <div className="relative h-[120px] w-[94px] -rotate-2 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
          <div className="flex flex-col gap-1.5 px-2.5 pt-3">
            <div className="h-1.5 w-14 rounded-full bg-gray-300 dark:bg-white/20" />
            <div className="h-1.5 w-9 rounded-full bg-gray-300 dark:bg-white/20" />
            <div className={`h-1.5 w-16 rounded-full ${variant === "diagnostic" ? "bg-red-400/80" : "bg-gray-300 dark:bg-white/20"}`} />
            <div className="h-1.5 w-7 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-white/20" />
            <div className="h-1.5 w-10 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
          <span className="absolute bottom-1.5 right-2 font-inter text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {inputExt}
          </span>
        </div>

        <ArrowRight size={20} className="shrink-0 text-[#3b82f6]" />

        {/* After */}
        <div className="relative h-[120px] w-[94px] rotate-2 rounded-xl border border-blue-200/80 bg-white shadow-[0_10px_24px_-8px_rgba(59,130,246,0.4)] dark:border-blue-500/30 dark:bg-white/[0.06]">
          <div className="flex flex-col gap-1.5 px-2.5 pt-2.5">
            <div className="h-2.5 w-full rounded-sm bg-gradient-to-r from-[#3b82f6] to-[#0d9488] opacity-90" />
            <div className="h-1.5 w-14 rounded-full bg-blue-300/80 dark:bg-blue-400/50" />
            <div className={`h-1.5 w-12 rounded-full ${variant === "diagnostic" ? "bg-teal-400" : "bg-gray-300 dark:bg-white/25"}`} />
            <div className="h-1.5 w-16 rounded-full bg-gray-300 dark:bg-white/25" />
            <div className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-white/25" />
          </div>
          {variant === "workbook" && (
            <div className="absolute bottom-2 left-2.5 flex gap-1">
              <span className="h-2 w-5 rounded-sm bg-[#3b82f6]/70" />
              <span className="h-2 w-5 rounded-sm bg-[#0d9488]/70" />
              <span className="h-2 w-5 rounded-sm bg-gray-300 dark:bg-white/20" />
            </div>
          )}
          {variant === "pdf" && (
            <span className="absolute bottom-2 right-2 rounded bg-red-500/90 px-1.5 py-0.5 font-inter text-[9px] font-bold uppercase text-white">
              PDF
            </span>
          )}
          {variant === "chart" && (
            <div className="absolute bottom-2 left-2.5 flex items-end gap-1" aria-hidden>
              <span className="h-2 w-1.5 rounded-sm bg-[#3b82f6]/50" />
              <span className="h-3.5 w-1.5 rounded-sm bg-[#3b82f6]/70" />
              <span className="h-2.5 w-1.5 rounded-sm bg-[#0d9488]/60" />
              <span className="h-4 w-1.5 rounded-sm bg-[#0d9488]/90" />
              <span className="h-3 w-1.5 rounded-sm bg-[#3b82f6]/80" />
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white shadow">
            <Check size={13} strokeWidth={3.5} />
          </span>
        </div>
      </div>
      <p className="font-inter text-[11.5px] font-medium uppercase tracking-[0.14em] text-blue-400/80 dark:text-blue-400/60">
        {t({ fr: "Aperçu illustratif", en: "Illustrative preview" })}
      </p>
    </div>
  );
}

// ── One big carousel card ────────────────────────────────────────────────────
function CarouselCard({
  automation,
  active,
  onSelect,
}: {
  automation: DemoAutomation;
  active: boolean;
  onSelect: () => void;
}) {
  const { t } = useLang();
  const { Icon } = automation;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-200/70 bg-white shadow-[0_20px_60px_-10px_rgba(96,165,250,0.16),0_8px_24px_-8px_rgba(96,165,250,0.08)] dark:border-white/[0.08] dark:bg-white/[0.02] md:flex-row">
      {/* Illustration: top on mobile, right on desktop */}
      <div className="order-first md:order-last md:w-[46%] md:shrink-0">
        <Illustration automation={automation} />
      </div>

      {/* Text side */}
      <div className="flex flex-1 flex-col p-7 md:p-9">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white">
          <Icon size={22} />
        </span>
        <h3 className="mt-5 font-poppins text-[22px] font-semibold tracking-[-0.02em] md:text-[26px]">
          {t(automation.title)}
        </h3>
        <p className="mt-2.5 max-w-md font-inter text-[14px] leading-relaxed text-gray-600 dark:text-gray-300">
          {t(automation.desc)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 font-inter text-[10.5px] font-semibold uppercase tracking-[0.08em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            {t(automation.acceptsLabel)}
          </span>
          <ArrowRight size={11} className="text-gray-300 dark:text-gray-600" />
          <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 font-inter text-[10.5px] font-semibold uppercase tracking-[0.08em] text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400">
            {t(automation.outputLabel)}
          </span>
        </div>

        <div className="mt-7 md:mt-auto md:pt-7">
          <button
            type="button"
            onClick={onSelect}
            tabIndex={active ? 0 : -1}
            className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-7 py-3.5 font-inter text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
          >
            {t({ fr: "Choisir cette automatisation", en: "Choose this automation" })}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compact summary card shown once an automation is selected ────────────────
export function SelectedAutomationCard({
  automation,
  onChange,
}: {
  automation: DemoAutomation;
  onChange: () => void;
}) {
  const { t } = useLang();
  const { Icon } = automation;

  return (
    <div className="mx-auto flex max-w-2xl items-center gap-4 rounded-2xl border border-blue-300/70 bg-blue-50/40 p-4 dark:border-blue-500/30 dark:bg-blue-500/[0.06]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white">
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-inter text-[15px] font-semibold">{t(automation.title)}</p>
        <p className="truncate font-inter text-[12.5px] text-gray-500 dark:text-gray-400">
          {t(automation.acceptsLabel)} → {t(automation.outputLabel)}
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 font-inter text-[12.5px] font-semibold text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150 hover:border-[#3b82f6] hover:bg-[#3b82f6] hover:text-white dark:border-white/20 dark:text-gray-300"
      >
        <RefreshCcw size={13} />
        {t({ fr: "Changer", en: "Change" })}
      </button>
    </div>
  );
}

// ── The carousel itself ──────────────────────────────────────────────────────
// One big card centered, neighbours peeking on the sides (dimmed, scaled
// down). Arrows, dots, keyboard arrows and horizontal swipe all navigate;
// clicking a peeked card brings it to the front.
export default function AutomationCarousel({ onSelect }: { onSelect: (key: string) => void }) {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(0);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    // ResizeObserver instead of a one-shot measure: on a cold page load the
    // element can report width 0 at mount time; the observer fires as soon as
    // layout settles (and on every later resize).
    const measure = () => setVw(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const n = DEMO_AUTOMATIONS.length;
  const desktop = vw >= 768;
  const peek = desktop ? 64 : 16;
  const gap = desktop ? 24 : 12;
  const cardW = Math.max(0, vw - 2 * (peek + gap));
  // Active card left edge sits at peek+gap: equal peek on both sides.
  const x = peek + gap - index * (cardW + gap);

  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <div className="relative">
        <div ref={viewportRef} className="overflow-hidden">
          {vw > 0 && (
            <motion.div
              className="flex items-stretch"
              style={{ gap }}
              animate={{ x }}
              transition={{ duration: 0.55, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1);
                else if (info.offset.x > 70) go(-1);
              }}
            >
              {DEMO_AUTOMATIONS.map((a, i) => (
                <motion.div
                  key={a.key}
                  animate={{ scale: i === index ? 1 : 0.94, opacity: i === index ? 1 : 0.45 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  style={{ width: cardW }}
                  className={`shrink-0 ${i === index ? "" : "cursor-pointer"}`}
                  onClick={i === index ? undefined : () => setIndex(i)}
                  aria-hidden={i !== index}
                >
                  {/* Peeked cards: clicks bring them to the front, never select */}
                  <div className={`h-full ${i === index ? "" : "pointer-events-none"}`}>
                    <CarouselCard automation={a} active={i === index} onSelect={() => onSelect(a.key)} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t({ fr: "Automatisation précédente", en: "Previous automation" })}
          className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200/80 bg-white text-gray-600 shadow-[0_4px_16px_rgba(15,23,42,0.10)] transition-all duration-150 hover:-translate-y-[calc(50%+1px)] hover:border-[#3b82f6] hover:text-[#3b82f6] dark:border-white/10 dark:bg-[#1c2537] dark:text-gray-300 md:left-2"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t({ fr: "Automatisation suivante", en: "Next automation" })}
          className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200/80 bg-white text-gray-600 shadow-[0_4px_16px_rgba(15,23,42,0.10)] transition-all duration-150 hover:-translate-y-[calc(50%+1px)] hover:border-[#3b82f6] hover:text-[#3b82f6] dark:border-white/10 dark:bg-[#1c2537] dark:text-gray-300 md:right-2"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots + counter */}
      <div className="mt-7 flex items-center justify-center gap-2">
        {DEMO_AUTOMATIONS.map((a, i) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t(a.title)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-gradient-to-r from-[#3b82f6] to-[#0d9488]"
                : "w-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20"
            }`}
          />
        ))}
        <span className="ml-3 font-inter text-[12px] font-medium text-gray-400 dark:text-gray-500">
          {index + 1} / {n}
        </span>
      </div>
    </div>
  );
}
