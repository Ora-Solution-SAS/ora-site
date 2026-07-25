import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { DEMO_AUTOMATIONS, type DemoAutomation } from "./data";

type Props = {
  theme: "light" | "dark";
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

// Small illustrated before/after placeholder shown inside each card.
// Pure CSS/divs so it can be swapped later for real screenshots.
function MiniExample({
  variant,
  inputExt,
  active,
}: {
  variant: DemoAutomation["previewVariant"];
  inputExt: string;
  active: boolean;
}) {
  const messyRows = (
    <div className="flex flex-col gap-1 px-1.5 pt-1.5">
      <div className="h-1 w-8 rounded-full bg-gray-300 dark:bg-white/20" />
      <div className="h-1 w-5 rounded-full bg-gray-300 dark:bg-white/20" />
      <div className={`h-1 w-9 rounded-full ${variant === "diagnostic" ? "bg-red-400/80" : "bg-gray-300 dark:bg-white/20"}`} />
      <div className="h-1 w-4 rounded-full bg-gray-200 dark:bg-white/10" />
      <div className="h-1 w-7 rounded-full bg-gray-300 dark:bg-white/20" />
    </div>
  );

  const cleanRows = (
    <div className="flex flex-col gap-1 px-1.5 pt-1">
      <div className="h-1.5 w-full rounded-sm bg-gradient-to-r from-[#3b82f6] to-[#0d9488] opacity-90" />
      <div className="h-1 w-9 rounded-full bg-blue-300/80 dark:bg-blue-400/50" />
      <div className={`h-1 w-8 rounded-full ${variant === "diagnostic" ? "bg-teal-400" : "bg-gray-300 dark:bg-white/25"}`} />
      <div className="h-1 w-9 rounded-full bg-gray-300 dark:bg-white/25" />
      <div className="h-1 w-6 rounded-full bg-gray-300 dark:bg-white/25" />
    </div>
  );

  return (
    <div className="flex h-full items-center justify-center gap-2.5" aria-hidden>
      {/* Before */}
      <div className="relative h-[74px] w-[58px] -rotate-2 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        {messyRows}
        <span className="absolute bottom-1 right-1 rounded px-1 text-[7px] font-inter font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {inputExt.replace(".", "").toUpperCase()}
        </span>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={15}
        className={`shrink-0 text-[#3b82f6] transition-transform duration-300 ${active ? "translate-x-0.5" : ""}`}
      />

      {/* After */}
      <div className="relative h-[74px] w-[58px] rotate-2 rounded-lg border border-blue-200/80 bg-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.35)] dark:border-blue-500/30 dark:bg-white/[0.05]">
        {cleanRows}
        {variant === "workbook" && (
          <div className="absolute bottom-1 left-1.5 flex gap-0.5">
            <span className="h-1.5 w-3 rounded-sm bg-[#3b82f6]/70" />
            <span className="h-1.5 w-3 rounded-sm bg-[#0d9488]/70" />
            <span className="h-1.5 w-3 rounded-sm bg-gray-300 dark:bg-white/20" />
          </div>
        )}
        {variant === "pdf" && (
          <span className="absolute bottom-1 right-1 rounded bg-red-500/90 px-1 py-px text-[7px] font-inter font-bold uppercase text-white">
            PDF
          </span>
        )}
        <span className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white shadow">
          <Check size={9} strokeWidth={3.5} />
        </span>
      </div>
    </div>
  );
}

function AutomationCard({
  automation,
  selected,
  dimmed,
  onSelect,
}: {
  automation: DemoAutomation;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const { t } = useLang();
  const { Icon } = automation;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative w-full text-left sm:w-[300px] rounded-[24px] border p-6 transition-all duration-300
        ${
          selected
            ? "border-blue-400 bg-blue-50/70 shadow-[0_20px_60px_-10px_rgba(96,165,250,0.28)] dark:border-blue-500/60 dark:bg-blue-500/[0.08]"
            : "border-gray-200/70 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_20px_60px_-10px_rgba(96,165,250,0.20),0_8px_24px_-8px_rgba(96,165,250,0.10)] dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-blue-500/40"
        }
        ${dimmed ? "opacity-60 hover:opacity-100" : ""}`}
    >
      {/* Selected check badge */}
      <span
        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300
          ${
            selected
              ? "scale-100 bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white opacity-100"
              : "scale-50 opacity-0"
          }`}
      >
        <Check size={13} strokeWidth={3} />
      </span>

      {/* Icon tile */}
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300
          ${
            selected
              ? "bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white"
              : "bg-blue-50 text-[#3b82f6] group-hover:bg-gradient-to-br group-hover:from-[#3b82f6] group-hover:to-[#0d9488] group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400"
          }`}
      >
        <Icon size={20} />
      </span>

      <h3 className="mt-4 font-poppins text-[17px] font-semibold tracking-[-0.02em]">
        {t(automation.title)}
      </h3>

      {/* Tagline <-> description crossfade (space reserved: no layout shift) */}
      <div className="relative mt-1.5 min-h-[92px]">
        <p
          className={`absolute inset-0 font-inter text-[13.5px] leading-relaxed text-gray-500 transition-all duration-300 dark:text-gray-400
            ${selected ? "-translate-y-1 opacity-0" : "group-hover:-translate-y-1 group-hover:opacity-0"}`}
        >
          {t(automation.tagline)}
        </p>
        <p
          className={`absolute inset-0 font-inter text-[12.5px] leading-relaxed text-gray-600 transition-all duration-300 dark:text-gray-300
            ${selected ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"}`}
        >
          {t(automation.desc)}
        </p>
      </div>

      {/* Illustrated example, brightens on hover / selection */}
      <div
        className={`mt-3 rounded-2xl border border-gray-100 bg-[#fcfbf7] py-3 transition-all duration-300 dark:border-white/[0.05] dark:bg-white/[0.02]
          ${selected ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
      >
        <MiniExample
          variant={automation.previewVariant}
          inputExt={automation.accepts[0]}
          active={selected}
        />
      </div>

      {/* Input / output chips */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 font-inter text-[10.5px] font-semibold uppercase tracking-[0.08em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
          {t(automation.acceptsLabel)}
        </span>
        <ArrowRight size={11} className="text-gray-300 dark:text-gray-600" />
        <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 font-inter text-[10.5px] font-semibold uppercase tracking-[0.08em] text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400">
          {t(automation.outputLabel)}
        </span>
      </div>
    </button>
  );
}

export default function AutomationPicker({ selectedKey, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-5">
      {DEMO_AUTOMATIONS.map((a) => (
        <AutomationCard
          key={a.key}
          automation={a}
          selected={selectedKey === a.key}
          dimmed={selectedKey !== null && selectedKey !== a.key}
          onSelect={() => onSelect(a.key)}
        />
      ))}
    </div>
  );
}
