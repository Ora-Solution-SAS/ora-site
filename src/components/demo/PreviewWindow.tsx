import { useMemo, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { PreviewChart, PreviewData, PreviewSheet, PreviewStyle } from "./demoApi";

// The "Excel window" preview: window chrome, bottom sheet tabs, a spreadsheet
// grid with row/column headers, cell styles, merged ranges, and the charts
// redrawn as SVG. Copy/context menu are disabled and a diagonal watermark
// overlays the grid; the full interactive workbook (live pivots, formulas,
// native charts) only exists in the downloaded file.

const ROW_H = 26;
const VIRTUAL_THRESHOLD = 400;
const OVERSCAN = 12;
const CHART_COLORS = ["#3b82f6", "#0d9488", "#94a3b8", "#2563eb", "#f59e0b"];

function colLetter(i: number): string {
  let n = i + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function letterToIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

type MergeMap = {
  anchors: Map<string, { colSpan: number; rowSpan: number }>;
  covered: Set<string>;
};

function buildMerges(merges: string[]): MergeMap {
  const anchors = new Map<string, { colSpan: number; rowSpan: number }>();
  const covered = new Set<string>();
  for (const rng of merges) {
    const m = rng.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!m) continue;
    const c1 = letterToIndex(m[1]);
    const r1 = parseInt(m[2], 10);
    const c2 = letterToIndex(m[3]);
    const r2 = parseInt(m[4], 10);
    anchors.set(`${r1}:${c1}`, { colSpan: c2 - c1 + 1, rowSpan: r2 - r1 + 1 });
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (r !== r1 || c !== c1) covered.add(`${r}:${c}`);
      }
    }
  }
  return { anchors, covered };
}

function cellStyle(style: PreviewStyle | undefined): React.CSSProperties {
  if (!style) return {};
  return {
    backgroundColor: style.bg,
    color: style.c,
    fontWeight: style.b ? 600 : undefined,
    fontStyle: style.i ? "italic" : undefined,
    fontSize: style.sz ? `${Math.min(style.sz, 18)}px` : undefined,
    textAlign: style.a as React.CSSProperties["textAlign"],
  };
}

// ── SVG chart redraw ─────────────────────────────────────────────────────────
function compactNum(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1_000) return `${Math.round(v / 1_000)} k`;
  return `${Math.round(v)}`;
}

function ChartSvg({ chart }: { chart: PreviewChart }) {
  const W = 460;
  const H = 230;
  const PAD = { top: 30, right: 12, bottom: 34, left: 46 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const allValues = chart.series.flatMap((s) => s.values);
  const maxV = Math.max(...allValues, 0);
  const minV = Math.min(...allValues, 0);
  const span = maxV - minV || 1;
  const y = (v: number) => PAD.top + ih - ((v - minV) / span) * ih;

  const n = Math.max(...chart.series.map((s) => s.values.length), 1);
  const labelEvery = Math.max(1, Math.ceil(n / 8));

  return (
    <div className="shrink-0 rounded-xl border border-gray-200/80 bg-white p-3">
      <svg width={W} height={H} role="img" aria-label={chart.title}>
        <text x={PAD.left} y={16} fontSize={12} fontWeight={600} fill="#111827" fontFamily="Inter, sans-serif">
          {chart.title}
        </text>
        {[0, 0.5, 1].map((f) => {
          const val = minV + span * f;
          const yy = y(val);
          return (
            <g key={f}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yy} y2={yy} stroke="#e5e7eb" strokeWidth={1} />
              <text x={PAD.left - 5} y={yy + 3} fontSize={9} fill="#9ca3af" textAnchor="end" fontFamily="Inter, sans-serif">
                {compactNum(val)}
              </text>
            </g>
          );
        })}
        {chart.kind === "bar"
          ? chart.series.map((serie, si) => {
              const groupW = iw / n;
              const barW = Math.max(3, (groupW * 0.7) / chart.series.length);
              return serie.values.map((v, i) => {
                const x = PAD.left + i * groupW + groupW * 0.15 + si * barW;
                const y0 = y(Math.max(0, minV));
                const yv = y(v);
                return (
                  <rect
                    key={`${si}-${i}`}
                    x={x}
                    y={Math.min(yv, y0)}
                    width={barW}
                    height={Math.max(2, Math.abs(y0 - yv))}
                    rx={1.5}
                    fill={CHART_COLORS[si % CHART_COLORS.length]}
                    opacity={0.9}
                  />
                );
              });
            })
          : chart.series.map((serie, si) => {
              const step = iw / Math.max(serie.values.length - 1, 1);
              const points = serie.values
                .map((v, i) => `${PAD.left + i * step},${y(v)}`)
                .join(" ");
              return (
                <polyline
                  key={si}
                  points={points}
                  fill="none"
                  stroke={CHART_COLORS[si % CHART_COLORS.length]}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
        {chart.categories.slice(0, n).map((cat, i) =>
          i % labelEvery === 0 ? (
            <text
              key={i}
              x={PAD.left + (chart.kind === "bar" ? (i + 0.5) * (iw / n) : i * (iw / Math.max(n - 1, 1)))}
              y={H - PAD.bottom + 14}
              fontSize={9}
              fill="#6b7280"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              {String(cat).slice(0, 9)}
            </text>
          ) : null
        )}
      </svg>
      {chart.series.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 px-1">
          {chart.series.map((serie, si) => (
            <span key={si} className="inline-flex items-center gap-1.5 font-inter text-[10.5px] text-gray-500">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS[si % CHART_COLORS.length] }}
              />
              {serie.name || `Série ${si + 1}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Watermark overlay ────────────────────────────────────────────────────────
function Watermark() {
  const items = Array.from({ length: 24 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="flex h-full w-full flex-wrap content-between justify-between p-6">
        {items.map((_, i) => (
          <span
            key={i}
            className="-rotate-[24deg] select-none whitespace-nowrap font-inter text-[15px] font-semibold text-gray-900/[0.055]"
          >
            Aperçu · ora-solution.com
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Grid (one sheet) ─────────────────────────────────────────────────────────
function SheetGrid({
  sheet,
  styles,
}: {
  sheet: PreviewSheet;
  styles: Record<string, PreviewStyle>;
}) {
  const { t } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const virtual = sheet.rows.length > VIRTUAL_THRESHOLD;
  const merges = useMemo(
    () => (virtual ? buildMerges([]) : buildMerges(sheet.merges)),
    [sheet, virtual]
  );

  const colWidths = sheet.widths.map((w) => Math.max(44, Math.round(w * 7.4)));

  let start = 0;
  let end = sheet.rows.length;
  if (virtual) {
    start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
    end = Math.min(sheet.rows.length, start + Math.ceil(560 / ROW_H) + OVERSCAN * 2);
  }

  return (
    <div
      ref={scrollRef}
      onScroll={virtual ? (e) => setScrollTop((e.target as HTMLDivElement).scrollTop) : undefined}
      className="relative h-[560px] select-none overflow-auto bg-white"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <table
        className="border-separate font-inter"
        style={{ borderSpacing: 0, tableLayout: "fixed", width: "max-content" }}
      >
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 w-11 border-b border-r border-gray-300 bg-[#f1f3f6] px-1 text-[10px] font-medium text-gray-400" />
            {colWidths.map((w, i) => (
              <th
                key={i}
                style={{ width: w, minWidth: w }}
                className="sticky top-0 z-20 border-b border-r border-gray-200 bg-[#f1f3f6] px-1 py-0.5 text-center text-[10.5px] font-medium text-gray-500"
              >
                {colLetter(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {virtual && start > 0 && (
            <tr style={{ height: start * ROW_H }}>
              <td colSpan={colWidths.length + 1} />
            </tr>
          )}
          {sheet.rows.slice(start, end).map((row, ri) => {
            const r = start + ri + 1;
            return (
              <tr key={r} style={{ height: ROW_H }}>
                <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-[#f1f3f6] px-1 text-center text-[10px] text-gray-400">
                  {r}
                </td>
                {row.map((cell, ci) => {
                  const c = ci + 1;
                  if (merges.covered.has(`${r}:${c}`)) return null;
                  const span = merges.anchors.get(`${r}:${c}`);
                  return (
                    <td
                      key={c}
                      colSpan={span?.colSpan}
                      rowSpan={span?.rowSpan}
                      style={cellStyle(cell.s ? styles[cell.s] : undefined)}
                      className="overflow-hidden whitespace-nowrap border-b border-r border-gray-100 px-1.5 text-[12px] leading-[25px] text-gray-800"
                    >
                      {cell.v}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {virtual && end < sheet.rows.length && (
            <tr style={{ height: (sheet.rows.length - end) * ROW_H }}>
              <td colSpan={colWidths.length + 1} />
            </tr>
          )}
        </tbody>
      </table>

      {/* Charts redrawn under the grid data */}
      {sheet.charts.length > 0 && (
        <div className="flex flex-wrap gap-4 px-4 py-5">
          {sheet.charts.map((chart, i) => (
            <ChartSvg key={i} chart={chart} />
          ))}
        </div>
      )}

      {(sheet.truncated || sheet.note === "tcd") && (
        <div className="px-4 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 font-inter text-[11.5px] font-medium text-blue-700">
            <Eye size={12} />
            {sheet.note === "tcd"
              ? t({
                  fr: "Aperçu statique : dans le fichier téléchargé, cette feuille est un vrai tableau croisé dynamique Excel, réorganisable librement.",
                  en: "Static preview: in the downloaded file this sheet is a real, freely reorganizable Excel pivot table.",
                })
              : t({
                  fr: `Aperçu limité aux ${sheet.rows.length} premières lignes (${sheet.total_rows} au total dans le fichier).`,
                  en: `Preview limited to the first ${sheet.rows.length} rows (${sheet.total_rows} in the file).`,
                })}
          </span>
        </div>
      )}
    </div>
  );
}

// ── The window ───────────────────────────────────────────────────────────────
export default function PreviewWindow({ preview }: { preview: PreviewData }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const sheet = preview.sheets[Math.min(active, preview.sheets.length - 1)];

  return (
    <div className="overflow-hidden rounded-[16px] border border-gray-300/80 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)]">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-[#f6f7f9] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex-1 truncate text-center font-inter text-[12.5px] font-medium text-gray-600">
          {preview.file_name}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 font-inter text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-600">
          <Eye size={10} />
          {t({ fr: "Aperçu", en: "Preview" })}
        </span>
      </div>

      {/* Grid + watermark */}
      <div className="relative">
        <Watermark />
        <SheetGrid key={sheet.name} sheet={sheet} styles={preview.styles} />
      </div>

      {/* Excel-style bottom sheet tabs */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-t border-gray-200 bg-[#f6f7f9] px-2 pt-1">
        {preview.sheets.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => setActive(i)}
            className={`whitespace-nowrap rounded-t-md px-3.5 py-1.5 font-inter text-[12px] transition-colors duration-100 ${
              i === active
                ? "border-x border-t border-gray-200 bg-white font-semibold text-[#0d9488] shadow-[inset_0_2px_0_#0d9488]"
                : "text-gray-500 hover:bg-gray-200/60"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
