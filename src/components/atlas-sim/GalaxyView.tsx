/**
 * Atlas simulation — Galaxy view.
 *
 * SVG graph of a project's documents: nodes sized by degree, typed bezier
 * links, layout toggle (free / by flow), status & approval lenses, lineage
 * focus. Everything stays inside the 1020x660 sim window (no `fixed`).
 */
import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { GitBranch } from "lucide-react";
import {
  APPROVALS,
  FORMAT_COLOR,
  LINK_TYPES,
  linkTypeOf,
  STATUSES,
  statusOf,
  type Doc,
  type DocLink,
} from "./data";
import { useSim } from "./store";
import { EASE, Eyebrow, MenuItem, Popover } from "./ui";

type Layout = "free" | "flux";
type Lens = "status" | "approval" | null;

interface Pt {
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ pills */

function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium font-inter backdrop-blur transition-colors duration-150 ${
        active
          ? "border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]"
          : "border-[#e5e7eb] bg-white/90 text-[#6b7280] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- layout */

/** Free layout: gx 0..1000 → x, gy 0..600 → y scaled into the 560 viewBox. */
function freePositions(docs: Doc[]): Map<string, Pt> {
  const map = new Map<string, Pt>();
  for (const d of docs) map.set(d.id, { x: d.gx, y: (d.gy * 560) / 600 });
  return map;
}

/** Flow layout: topological columns (sources left), even vertical spread. */
function fluxPositions(docs: Doc[], links: DocLink[]): Map<string, Pt> {
  const parents = new Map<string, string[]>();
  for (const d of docs) parents.set(d.id, []);
  for (const l of links) parents.get(l.to)?.push(l.from);

  const memo = new Map<string, number>();
  const colOf = (id: string, trail: Set<string>): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    if (trail.has(id)) return 0; // cycle guard
    trail.add(id);
    const ps = parents.get(id) ?? [];
    const col = ps.length === 0 ? 0 : 1 + Math.max(...ps.map((p) => colOf(p, trail)));
    trail.delete(id);
    memo.set(id, col);
    return col;
  };

  const byCol = new Map<number, Doc[]>();
  for (const d of docs) {
    const c = colOf(d.id, new Set());
    const arr = byCol.get(c) ?? [];
    arr.push(d);
    byCol.set(c, arr);
  }

  const map = new Map<string, Pt>();
  for (const [col, group] of byCol) {
    group.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const x = Math.min(880, 140 + col * 240);
    const n = group.length;
    group.forEach((d, i) => {
      const y = n === 1 ? 280 : 90 + (i * (470 - 90)) / (n - 1);
      map.set(d.id, { x, y });
    });
  }
  return map;
}

/* ------------------------------------------------------------------- view */

export default function GalaxyView({ projectId }: { projectId: string }) {
  const { state, actions } = useSim();
  const containerRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<Layout>("free");
  const [lens, setLens] = useState<Lens>(null);
  const [lineage, setLineage] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [linkMenu, setLinkMenu] = useState<{ linkId: string; x: number; y: number } | null>(null);

  const docs = useMemo(
    () => state.docs.filter((d) => d.projectId === projectId),
    [state.docs, projectId]
  );
  const links = useMemo(() => {
    const ids = new Set(docs.map((d) => d.id));
    return state.links.filter((l) => ids.has(l.from) && ids.has(l.to));
  }, [state.links, docs]);

  /** Docs present at mount don't replay the entrance animation. */
  const initialIds = useRef<Set<string> | null>(null);
  if (initialIds.current === null) initialIds.current = new Set(docs.map((d) => d.id));

  const degree = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of links) {
      m.set(l.from, (m.get(l.from) ?? 0) + 1);
      m.set(l.to, (m.get(l.to) ?? 0) + 1);
    }
    return m;
  }, [links]);
  const radiusOf = (docId: string) => 9 + Math.min(6, (degree.get(docId) ?? 0) * 2);

  const pos = useMemo(
    () => (layout === "flux" ? fluxPositions(docs, links) : freePositions(docs)),
    [layout, docs, links]
  );

  /** Lineage focus: selected node + transitive ancestors and descendants. */
  const lineageSet = useMemo(() => {
    if (!lineage || !selectedId || !docs.some((d) => d.id === selectedId)) return null;
    const grow = (start: string, dir: "down" | "up") => {
      const set = new Set([start]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const l of links) {
          const a = dir === "down" ? l.from : l.to;
          const b = dir === "down" ? l.to : l.from;
          if (set.has(a) && !set.has(b)) {
            set.add(b);
            grew = true;
          }
        }
      }
      return set;
    };
    return new Set([...grow(selectedId, "down"), ...grow(selectedId, "up")]);
  }, [lineage, selectedId, docs, links]);

  const nodeDimmed = (id: string) => Boolean(lineageSet && !lineageSet.has(id));
  const linkDimmed = (l: DocLink) =>
    Boolean(lineageSet && !(lineageSet.has(l.from) && lineageSet.has(l.to)));

  /** Convert a click to container px (the sim frame may be CSS-scaled). */
  const openLinkMenu = (e: ReactMouseEvent, linkId: string) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const kx = rect.width / el.offsetWidth || 1;
    const ky = rect.height / el.offsetHeight || 1;
    const x = (e.clientX - rect.left) / kx;
    const y = (e.clientY - rect.top) / ky;
    setLinkMenu({
      linkId,
      x: Math.max(8, Math.min(x, el.offsetWidth - 198)),
      y: Math.max(8, Math.min(y, el.offsetHeight - 312)),
    });
  };

  const fillOf = (doc: Doc): { fill: string; stroke: string; strokeWidth: number } => {
    if (lens === "status")
      return { fill: statusOf(doc.status).solid, stroke: "#ffffff", strokeWidth: 2 };
    if (lens === "approval")
      return {
        fill: doc.approval === "none" ? "#cbd5e1" : APPROVALS[doc.approval].solid,
        stroke: "#ffffff",
        strokeWidth: 2,
      };
    return { fill: "#ffffff", stroke: FORMAT_COLOR[doc.format], strokeWidth: 2.5 };
  };

  const menuLink = linkMenu ? links.find((l) => l.id === linkMenu.linkId) : undefined;

  const legendRows =
    lens === "status"
      ? STATUSES.map((s) => ({ label: s.label, color: s.solid }))
      : lens === "approval"
        ? [
            { label: APPROVALS.pending.label, color: APPROVALS.pending.solid },
            { label: APPROVALS.approved.label, color: APPROVALS.approved.solid },
            { label: APPROVALS.changes_requested.label, color: APPROVALS.changes_requested.solid },
            { label: "Sans approbation", color: "#cbd5e1" },
          ]
        : [];

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-[#e5e7eb]"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #f6f9ff 0%, #fcfbf7 70%)" }}
    >
      {/* ------------------------------------------------ lens controls */}
      <div className="absolute left-0 top-0 z-10 m-3 flex flex-col items-start gap-1.5">
        <div className="flex gap-1.5">
          <Pill active={layout === "free"} onClick={() => setLayout("free")}>
            Disposition libre
          </Pill>
          <Pill active={layout === "flux"} onClick={() => setLayout("flux")}>
            Par flux (liens)
          </Pill>
        </div>
        <div className="flex gap-1.5">
          <Pill active={lens === "status"} onClick={() => setLens(lens === "status" ? null : "status")}>
            Statut
          </Pill>
          <Pill
            active={lens === "approval"}
            onClick={() => setLens(lens === "approval" ? null : "approval")}
          >
            Approbation
          </Pill>
        </div>
        <div className="flex gap-1.5">
          <Pill active={lineage} onClick={() => setLineage((v) => !v)}>
            <GitBranch size={12} strokeWidth={2.2} />
            Lignée
          </Pill>
        </div>
      </div>

      {/* ------------------------------------------------------- legend */}
      {lens && (
        <div className="absolute bottom-0 left-0 z-10 m-3 flex flex-col gap-1 rounded-xl border border-[#e5e7eb] bg-white/90 p-2 backdrop-blur">
          {legendRows.map((row) => (
            <div key={row.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.color }} />
              <span className="text-[10.5px] font-medium font-inter text-[#6b7280]">{row.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------- hint */}
      <div className="absolute bottom-0 right-0 z-10 m-3 rounded-full border border-[#eef0f5] bg-white/80 px-2.5 py-1 text-[10.5px] font-inter text-[#9ca3af]">
        Double-clic ou clic droit : ouvrir l'inspecteur
      </div>

      {/* -------------------------------------------------------- graph */}
      <svg
        viewBox="0 0 1000 560"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        onClick={() => setSelectedId(null)}
      >
        <defs>
          {LINK_TYPES.filter((t) => t.arrow).map((t) => (
            <marker
              key={t.id}
              id={`arrow-${t.id}`}
              viewBox="0 0 10 10"
              refX={8}
              refY={5}
              markerWidth={9}
              markerHeight={9}
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={t.color} />
            </marker>
          ))}
        </defs>

        {/* links under nodes */}
        {links.map((l) => {
          const a = pos.get(l.from);
          const b = pos.get(l.to);
          if (!a || !b) return null;
          const t = linkTypeOf(l.type);
          const ra = radiusOf(l.from);
          const rb = radiusOf(l.to);
          const vx = b.x - a.x;
          const vy = b.y - a.y;
          const dist = Math.hypot(vx, vy) || 1;
          const ux = vx / dist;
          const uy = vy / dist;
          const sx = a.x + ux * (ra + 1);
          const sy = a.y + uy * (ra + 1);
          const ex = b.x - ux * (rb + (t.arrow ? 4 : 1));
          const ey = b.y - uy * (rb + (t.arrow ? 4 : 1));
          const half = (ex - sx) / 2;
          const c1x = sx + half;
          const c2x = ex - half;
          const d = `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ey}, ${ex} ${ey}`;
          // cubic bezier midpoint (t = 0.5)
          const mx = (sx + 3 * c1x + 3 * c2x + ex) / 8;
          const my = (sy + ey) / 2;
          const labelW = l.label ? l.label.length * 5.4 + 10 : 0;
          return (
            <g
              key={l.id}
              style={{ opacity: linkDimmed(l) ? 0.08 : 1, transition: `opacity 300ms ${EASE}` }}
            >
              <path
                d={d}
                fill="none"
                stroke={t.color}
                strokeWidth={t.id === "manual" ? 1 : t.wide ? 2.5 : 1.5}
                strokeDasharray={t.dash}
                markerEnd={t.arrow ? `url(#arrow-${t.id})` : undefined}
              />
              {/* invisible wide hit area */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                className="cursor-pointer"
                onClick={(e) => openLinkMenu(e, l.id)}
              />
              {l.label && (
                <g className="pointer-events-none">
                  <rect
                    x={mx - labelW / 2}
                    y={my - 7}
                    width={labelW}
                    height={14}
                    rx={7}
                    fill="#ffffff"
                    stroke="#e5e7eb"
                  />
                  <text
                    x={mx}
                    y={my}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fill="#6b7280"
                    className="font-inter"
                  >
                    {l.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {docs.map((doc) => {
          const p = pos.get(doc.id);
          if (!p) return null;
          const r = radiusOf(doc.id);
          const paint = fillOf(doc);
          const selected = selectedId === doc.id;
          const isNew = !initialIds.current!.has(doc.id);
          return (
            <g
              key={doc.id}
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
                transition: `transform 400ms ${EASE}, opacity 300ms ${EASE}`,
                opacity: nodeDimmed(doc.id) ? 0.08 : 1,
              }}
            >
              <g
                className="cursor-pointer"
                style={isNew ? { animation: `ora-modal-pop 300ms ${EASE}` } : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(doc.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  actions.openInspector(doc.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  actions.openInspector(doc.id);
                }}
                onMouseEnter={() => setHoverId(doc.id)}
                onMouseLeave={() => setHoverId((cur) => (cur === doc.id ? null : cur))}
              >
                {selected && (
                  <>
                    <circle r={r + 6} fill="none" stroke="#3b82f6" strokeWidth={2} />
                    <circle r={r + 4} fill="none" stroke="#ffffff" strokeWidth={3} />
                  </>
                )}
                <circle r={r} fill={paint.fill} stroke={paint.stroke} strokeWidth={paint.strokeWidth} />
                <text
                  y={r + 15}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#374151"
                  stroke="#ffffff"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  className="font-inter"
                  style={{ paintOrder: "stroke" }}
                >
                  {doc.name}
                </text>
                {hoverId === doc.id && (
                  <g
                    transform={`translate(${r + 4}, ${-(r + 4)})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.openAutomation(doc.id);
                    }}
                  >
                    <circle r={8} fill="#3b82f6" />
                    <path d="M -2.2 -3.4 L 3.8 0 L -2.2 3.4 Z" fill="#ffffff" />
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>

      {/* ---------------------------------------------------- link menu */}
      {linkMenu && menuLink && (
        <div className="absolute z-30" style={{ left: linkMenu.x, top: linkMenu.y }}>
          <Popover onClose={() => setLinkMenu(null)} width={190}>
            <Eyebrow className="px-2.5 pb-1 pt-1.5">Type de lien</Eyebrow>
            {LINK_TYPES.map((t) => (
              <MenuItem
                key={t.id}
                active={t.id === menuLink.type}
                onClick={() => {
                  actions.retypeLink(menuLink.id, t.id);
                  setLinkMenu(null);
                }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: t.color }} />
                {t.label}
              </MenuItem>
            ))}
            <div className="my-1 h-px bg-[#eef0f5]" />
            <MenuItem
              danger
              onClick={() => {
                actions.removeLink(menuLink.id);
                setLinkMenu(null);
              }}
            >
              Supprimer
            </MenuItem>
          </Popover>
        </div>
      )}
    </div>
  );
}
