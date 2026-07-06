/**
 * Atlas simulation — project view (header, toolbar, document list, galaxy).
 *
 * List/galaxy toggle, grouping, sorting, facet filters, saved views and a
 * floating multi-select bar. Everything runs on the simulated store.
 */
import { useMemo, useState, type CSSProperties } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  Bookmark,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  List,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Network,
  PencilLine,
  Play,
  Plus,
  Rows3,
  Search,
  SlidersHorizontal,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  APPROVALS,
  FACETS,
  FORMAT_LABEL,
  PROJECT_COLORS,
  PROJECT_ICONS,
  STATUSES,
  TYPE_LABEL,
  VISIBILITIES,
  facetValueOf,
  memberOf,
  statusOf,
  type Approval,
  type Doc,
  type DocStatus,
  type FacetValue,
  type Visibility,
} from "./data";
import {
  BtnPrimary,
  BtnSoft,
  Card,
  Chip,
  EASE,
  Eyebrow,
  Input,
  MenuItem,
  Modal,
  ModalClose,
  Popover,
} from "./ui";
import { FileIcon, PROJECT_ICON, ProjectTile } from "./icons";
import { useSim } from "./store";
import GalaxyView from "./GalaxyView";

const VIS_ICON: Record<Visibility, LucideIcon> = {
  private: Lock,
  team: Users,
  company: Building2,
};

const APPROVAL_ICON: Record<Exclude<Approval, "none">, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  changes_requested: AlertCircle,
};

type SortId = "recent" | "added" | "name" | "status";
const SORTS: { id: SortId; label: string }[] = [
  { id: "recent", label: "Récents" },
  { id: "added", label: "Ajout récent" },
  { id: "name", label: "Nom (A-Z)" },
  { id: "status", label: "Statut" },
];

interface RowGroup {
  key: string;
  label: string;
  dotColor: string;
  docs: Doc[];
}

/** Small toolbar pill (popover trigger / toggle). */
const pillCls = (active: boolean) =>
  `inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium font-inter transition-colors duration-150 ${
    active
      ? "border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]"
      : "border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f5f8ff]"
  }`;

/** Round icon-button used for row quick actions. */
function RowIconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[#6b7280] transition-colors duration-150 hover:border-[#e5e7eb] hover:bg-white"
    >
      {children}
    </button>
  );
}

function DocRow({
  doc,
  selected,
  onToggleSelect,
}: {
  doc: Doc;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const { actions } = useSim();
  const chips = FACETS.flatMap((f) =>
    (doc.facets[f.id] ?? [])
      .map((vid) => facetValueOf(f.id, vid))
      .filter((v): v is FacetValue => Boolean(v))
  );
  const shown = chips.slice(0, 3);
  const extra = chips.length - shown.length;
  const st = statusOf(doc.status);
  const ApprovalIcon = doc.approval !== "none" ? APPROVAL_ICON[doc.approval] : null;

  return (
    <div
      // Anchor the guided tour to the FEC row (the one it walks the user through).
      data-tour={doc.id === "d-fec" ? "doc-row" : undefined}
      className="group/row flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition-colors duration-150 hover:bg-[#f5f8ff]"
      onClick={() => actions.openInspector(doc.id)}
    >
      {/* selection gutter */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        className={`flex w-5 shrink-0 items-center justify-center transition-opacity duration-150 ${
          selected ? "" : "opacity-0 group-hover/row:opacity-100"
        }`}
      >
        <span
          className={`flex h-3.5 w-3.5 items-center justify-center rounded border transition-colors duration-150 ${
            selected ? "border-[#3b82f6] bg-[#3b82f6] text-white" : "border-[#d1d5db] bg-white"
          }`}
        >
          {selected && <Check size={10} strokeWidth={3} />}
        </span>
      </button>

      <FileIcon format={doc.format} size={16} />

      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold font-inter text-[#111827]">{doc.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] font-inter text-[#9ca3af]">
          <span className="whitespace-nowrap">
            {FORMAT_LABEL[doc.format]} · {doc.sizeLabel} · {doc.updatedLabel}
          </span>
          {shown.map((v) => (
            <Chip
              key={v.id}
              dotColor={v.color}
              className="bg-slate-100 text-slate-500 transition-colors duration-150 group-hover/row:bg-[var(--fcbg)] group-hover/row:text-[var(--fctx)]"
              style={{ "--fcbg": `${v.color}14`, "--fctx": v.color } as CSSProperties}
            >
              {v.label}
            </Chip>
          ))}
          {extra > 0 && <Chip className="bg-slate-100 text-slate-500">+{extra}</Chip>}
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Chip className={st.chip} dotColor={st.solid}>
          {st.label}
        </Chip>
        {doc.approval !== "none" && ApprovalIcon && (
          <Chip className={APPROVALS[doc.approval].chip}>
            <ApprovalIcon size={11} strokeWidth={2.4} />
            {APPROVALS[doc.approval].label}
          </Chip>
        )}
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100">
          <RowIconBtn
            title="Ouvrir dans Excel"
            onClick={(e) => {
              e.stopPropagation();
              actions.logEvent(doc.id, "opened_excel", "Ouvert dans Excel");
              actions.showToast("Ouverture dans Excel…");
            }}
          >
            <ExternalLink size={13} strokeWidth={2.2} />
          </RowIconBtn>
          <RowIconBtn
            title="Automatisation"
            onClick={(e) => {
              e.stopPropagation();
              actions.openAutomation(doc.id);
            }}
          >
            <Play size={13} strokeWidth={2.2} />
          </RowIconBtn>
          <ChevronRight size={13} strokeWidth={2.2} className="text-[#9ca3af]" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectView({ projectId }: { projectId: string }) {
  const { state, actions } = useSim();

  /* ------------------------------------------------------------ local state */
  // View tab is lifted into the store so the guided tour can switch to Galaxie.
  const view = state.projectTab;
  const setView = actions.setProjectTab;
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<string>("none"); // "none" | "status" | facetId
  const [sortBy, setSortBy] = useState<SortId>("recent");
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [pop, setPop] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [viewName, setViewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const p = state.projects.find((pr) => pr.id === projectId);
  const projectDocs = useMemo(
    () => state.docs.filter((d) => d.projectId === projectId),
    [state.docs, projectId]
  );

  const hasFacetFilters = FACETS.some((f) => (filters[f.id] ?? []).length > 0);
  const assignedCount = projectDocs.filter((d) => d.assigneeIds.includes("me")).length;

  /* ------------------------------------------------- filter + sort + group */
  const sortedDocs = useMemo(() => {
    let ds = projectDocs;
    const q = search.trim().toLowerCase();
    if (q) ds = ds.filter((d) => d.name.toLowerCase().includes(q));
    if (assignedToMe) ds = ds.filter((d) => d.assigneeIds.includes("me"));
    ds = ds.filter((d) =>
      FACETS.every((f) => {
        const sel = filters[f.id] ?? [];
        if (sel.length === 0) return true;
        const vals = d.facets[f.id] ?? [];
        return sel.some((s) => vals.includes(s));
      })
    );
    const out = [...ds];
    if (sortBy === "added") out.reverse();
    else if (sortBy === "name") out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    else if (sortBy === "status")
      out.sort(
        (a, b) =>
          STATUSES.findIndex((s) => s.id === a.status) - STATUSES.findIndex((s) => s.id === b.status)
      );
    return out;
  }, [projectDocs, search, assignedToMe, filters, sortBy]);

  const groups = useMemo<RowGroup[] | null>(() => {
    if (groupBy === "none") return null;
    if (groupBy === "status") {
      return STATUSES.map((s) => ({
        key: s.id,
        label: s.label,
        dotColor: s.solid,
        docs: sortedDocs.filter((d) => d.status === s.id),
      })).filter((g) => g.docs.length > 0);
    }
    const facet = FACETS.find((f) => f.id === groupBy);
    if (!facet) return null;
    const gs: RowGroup[] = facet.values.map((v) => ({
      key: v.id,
      label: v.label,
      dotColor: v.color,
      docs: sortedDocs.filter((d) => (d.facets[facet.id] ?? []).includes(v.id)),
    }));
    const none = sortedDocs.filter((d) => (d.facets[facet.id] ?? []).length === 0);
    if (none.length > 0) gs.push({ key: "__none", label: "Sans valeur", dotColor: "#cbd5e1", docs: none });
    return gs.filter((g) => g.docs.length > 0);
  }, [groupBy, sortedDocs]);

  if (!p) return null;

  /* ---------------------------------------------------------------- helpers */
  const togglePop = (id: string) => setPop((cur) => (cur === id ? null : id));

  const toggleSelect = (id: string) =>
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleFilter = (facetId: string, valueId: string) =>
    setFilters((prev) => {
      const cur = prev[facetId] ?? [];
      const next = cur.includes(valueId) ? cur.filter((v) => v !== valueId) : [...cur, valueId];
      return { ...prev, [facetId]: next };
    });

  const clearFilters = () => setFilters({});

  const commitName = () => {
    const n = nameDraft.trim();
    if (n) actions.renameProject(p.id, n);
    setEditingName(false);
  };

  const submitView = () => {
    const n = viewName.trim();
    if (!n) return;
    actions.saveView(n);
    setViewName("");
  };

  const applyStatusToSelection = (status: DocStatus) => {
    selection.forEach((id) => actions.setDocStatus(id, status));
    setSelection(new Set());
    setPop(null);
    actions.showToast("Statut mis à jour");
  };

  const applyCategoryToSelection = (facetId: string, valueId: string) => {
    selection.forEach((id) => {
      const doc = state.docs.find((d) => d.id === id);
      if (!doc) return;
      const cur = doc.facets[facetId] ?? [];
      const merged = cur.includes(valueId) ? cur : [...cur, valueId];
      actions.patchDoc(id, { facets: { ...doc.facets, [facetId]: merged } });
    });
    setSelection(new Set());
    setPop(null);
    actions.showToast("Catégorie appliquée");
  };

  const confirmDeleteSelection = () => {
    actions.deleteDocs([...selection]);
    setSelection(new Set());
    setConfirmDelete(false);
    actions.showToast("Document(s) supprimé(s)");
  };

  /* -------------------------------------------------------- derived header */
  const statusSummary = STATUSES.map((s) => ({
    s,
    count: projectDocs.filter((d) => d.status === s.id).length,
  })).filter((x) => x.count > 0);

  const activeVis = VISIBILITIES.find((v) => v.id === p.visibility)!;
  const VisIcon = VIS_ICON[p.visibility];

  const activeFilterChips = FACETS.flatMap((f) =>
    (filters[f.id] ?? [])
      .map((vid) => ({ facet: f, value: facetValueOf(f.id, vid) }))
      .filter((x): x is { facet: (typeof FACETS)[number]; value: FacetValue } => Boolean(x.value))
  );

  return (
    <div className="relative flex h-full flex-col">
      {/* ============================================================ header */}
      <div className="px-7 pt-5">
        <button
          type="button"
          onClick={actions.goHome}
          className="inline-flex items-center gap-1 text-[12px] font-medium font-inter text-[#6b7280] transition-colors duration-150 hover:text-[#111827]"
        >
          <ArrowLeft size={13} strokeWidth={2.4} />
          Retour
        </button>

        <div className="mt-2 flex items-center gap-3">
          {/* appearance popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => togglePop("appearance")}
              className="rounded-xl transition-transform duration-150 hover:-translate-y-px"
              title="Apparence du projet"
            >
              <ProjectTile icon={p.icon} color={p.color} size={40} />
            </button>
            {pop === "appearance" && (
              <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={352}>
                <div className="px-1.5 pt-1 text-[12.5px] font-semibold font-inter text-[#111827]">
                  Apparence du projet
                </div>
                <div className="mt-2 flex items-center gap-1 px-1.5">
                  {PROJECT_ICONS.map((ic) => {
                    const IconCmp = PROJECT_ICON[ic];
                    return (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => actions.setProjectAppearance(p.id, ic, p.color)}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-150 ${
                          p.icon === ic
                            ? "bg-[#eff6ff] text-[#3b82f6] ring-1 ring-[#3b82f6]"
                            : "text-[#6b7280] hover:bg-[#f5f8ff]"
                        }`}
                      >
                        <IconCmp size={15} strokeWidth={2.2} />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2.5 flex items-center gap-2 px-1.5 pb-1">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => actions.setProjectAppearance(p.id, p.icon, c.id)}
                      className="h-6 w-6 rounded-full transition-transform duration-150 hover:-translate-y-px"
                      style={{
                        background: c.solid,
                        boxShadow:
                          p.color === c.id ? `0 0 0 2px #ffffff, 0 0 0 4px ${c.solid}` : undefined,
                      }}
                    />
                  ))}
                </div>
              </Popover>
            )}
          </div>

          {/* editable name */}
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                else if (e.key === "Escape") setEditingName(false);
                e.stopPropagation();
              }}
              onBlur={() => setEditingName(false)}
              className="min-w-0 border-b border-[#3b82f6] bg-transparent font-poppins text-[26px] font-semibold tracking-[-0.02em] text-[#111827] outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setNameDraft(p.name);
                setEditingName(true);
              }}
              className="group/name flex min-w-0 items-center gap-2 text-left"
            >
              <span className="truncate font-poppins text-[26px] font-semibold tracking-[-0.02em] text-[#111827]">
                {p.name}
              </span>
              <PencilLine
                size={13}
                strokeWidth={2.2}
                className="shrink-0 text-[#9ca3af] opacity-0 transition-opacity duration-150 group-hover/name:opacity-100"
              />
            </button>
          )}

          {/* info popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => togglePop("info")}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#9ca3af] transition-colors duration-150 hover:bg-[#f5f8ff] hover:text-[#6b7280]"
              title="Détails du projet"
            >
              <Info size={15} strokeWidth={2.2} />
            </button>
            {pop === "info" && (
              <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={250}>
                <div className="px-2.5 pt-1 text-[12.5px] font-semibold font-inter text-[#111827]">
                  Détails du projet
                </div>
                <div className="mt-1.5 pb-1">
                  {[
                    ["Type", TYPE_LABEL[p.type]],
                    ["Fichiers", String(projectDocs.length)],
                    ["Créé par", memberOf(p.createdBy).name],
                    ["Créé le", p.createdLabel],
                    ["Modifié", p.updatedLabel],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3 px-2.5 py-1 text-[11.5px] font-inter">
                      <span className="text-[#9ca3af]">{label}</span>
                      <span className="text-right font-medium text-[#374151]">{value}</span>
                    </div>
                  ))}
                </div>
              </Popover>
            )}
          </div>

          {/* status summary */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {statusSummary.map(({ s, count }) => (
              <Chip key={s.id} className={s.chip} dotColor={s.solid}>
                {count} {s.id === "done" && count > 1 ? "terminés" : s.label.toLowerCase()}
              </Chip>
            ))}
          </div>
        </div>

        {/* ====================================================== actions row */}
        <div className="mt-3 flex items-center gap-2">
          {/* visibility pill */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => togglePop("visibility")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-medium font-inter text-[#6b7280] transition-colors duration-150 hover:bg-[#f5f8ff]"
            >
              <VisIcon size={13} strokeWidth={2.2} />
              {activeVis.label}
              <ChevronDown size={12} strokeWidth={2.4} className="text-[#9ca3af]" />
            </button>
            {pop === "visibility" && (
              <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={280}>
                {VISIBILITIES.map((v) => {
                  const IconCmp = VIS_ICON[v.id];
                  return (
                    <MenuItem
                      key={v.id}
                      active={p.visibility === v.id}
                      onClick={() => {
                        actions.setProjectVisibility(p.id, v.id);
                        setPop(null);
                      }}
                    >
                      <IconCmp size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 self-start" />
                      <span className="min-w-0">
                        <span className="block">{v.label}</span>
                        <span className="block text-[10.5px] font-normal text-[#9ca3af]">{v.hint}</span>
                      </span>
                    </MenuItem>
                  );
                })}
              </Popover>
            )}
          </div>

          {p.visibility !== "private" && (
            <BtnSoft small onClick={() => actions.showToast("Discussion du projet (démo)")}>
              <MessageSquare size={13} strokeWidth={2.2} />
              Discussion
            </BtnSoft>
          )}

          <div className="ml-auto flex items-center gap-2">
            <BtnPrimary onClick={actions.openAddFile}>
              <Plus size={14} strokeWidth={2.4} />
              Ajouter un fichier
            </BtnPrimary>

            {/* overflow menu */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => togglePop("menu")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] transition-colors duration-150 hover:bg-[#f5f8ff]"
              >
                <MoreHorizontal size={15} strokeWidth={2.2} />
              </button>
              {pop === "menu" && (
                <Popover onClose={() => setPop(null)} className="right-0 top-full mt-2" width={230}>
                  <MenuItem
                    danger
                    onClick={() => {
                      actions.showToast("Suppression désactivée dans la démo");
                      setPop(null);
                    }}
                  >
                    Supprimer le projet
                  </MenuItem>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 px-7">
        {/* search */}
        <div className="relative">
          <Search
            size={13}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document…"
            className="h-8 w-[190px] rounded-full border border-[#e5e7eb] bg-white pl-8 pr-3 text-[12px] font-inter text-[#111827] outline-none transition-shadow duration-150 placeholder:text-[#9ca3af] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
          />
        </div>

        {/* group by */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => togglePop("group")}
            className={pillCls(groupBy !== "none")}
          >
            <Rows3 size={13} strokeWidth={2.2} />
            Regrouper
          </button>
          {pop === "group" && (
            <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={210}>
              {[{ id: "none", label: "Aucun" }, { id: "status", label: "Statut" }, ...FACETS.map((f) => ({ id: f.id, label: f.label }))].map(
                (opt) => (
                  <MenuItem
                    key={opt.id}
                    active={groupBy === opt.id}
                    onClick={() => {
                      setGroupBy(opt.id);
                      setPop(null);
                    }}
                  >
                    {opt.label}
                  </MenuItem>
                )
              )}
            </Popover>
          )}
        </div>

        {/* sort */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => togglePop("sort")}
            className={pillCls(sortBy !== "recent")}
          >
            <ArrowUpDown size={13} strokeWidth={2.2} />
            Trier
          </button>
          {pop === "sort" && (
            <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={210}>
              {SORTS.map((opt) => (
                <MenuItem
                  key={opt.id}
                  active={sortBy === opt.id}
                  onClick={() => {
                    setSortBy(opt.id);
                    setPop(null);
                  }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Popover>
          )}
        </div>

        {/* assigned to me */}
        <button type="button" onClick={() => setAssignedToMe((v) => !v)} className={pillCls(assignedToMe)}>
          Assignés à moi
          <span
            className={`rounded-full px-1.5 text-[10.5px] font-semibold ${
              assignedToMe ? "bg-white text-[#3b82f6]" : "bg-[#f1f5f9] text-[#6b7280]"
            }`}
          >
            {assignedCount}
          </span>
        </button>

        {/* filters */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => togglePop("filters")}
            className={pillCls(hasFacetFilters)}
          >
            <SlidersHorizontal size={13} strokeWidth={2.2} />
            Filtres
          </button>
          {pop === "filters" && (
            <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={300}>
              {FACETS.map((f) => (
                <div key={f.id} className="px-1.5 py-1.5">
                  <Eyebrow>{f.label}</Eyebrow>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {f.values.map((v) => {
                      const on = (filters[f.id] ?? []).includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleFilter(f.id, v.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium font-inter transition-colors duration-150"
                          style={
                            on
                              ? { background: `${v.color}1a`, color: v.color, borderColor: "transparent" }
                              : { background: "#ffffff", color: "#6b7280", borderColor: "#e5e7eb" }
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: v.color }} />
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="px-2.5 pb-1 pt-1.5 text-[11.5px] font-medium font-inter text-[#3b82f6] hover:underline"
              >
                Tout effacer
              </button>
            </Popover>
          )}
        </div>

        {/* saved views */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => togglePop("views")}
            className={pillCls(false)}
          >
            <Bookmark size={13} strokeWidth={2.2} />
            Vues
          </button>
          {pop === "views" && (
            <Popover onClose={() => setPop(null)} className="left-0 top-full mt-2" width={260}>
              {state.savedViews.length === 0 ? (
                <div className="px-2.5 py-1.5 text-[11.5px] font-inter text-[#9ca3af]">
                  Aucune vue enregistrée.
                </div>
              ) : (
                state.savedViews.map((name) => (
                  <MenuItem
                    key={name}
                    onClick={() => {
                      actions.showToast(`Vue « ${name} » appliquée`);
                      setPop(null);
                    }}
                  >
                    <Bookmark size={12} strokeWidth={2.2} className="shrink-0 text-[#9ca3af]" />
                    {name}
                  </MenuItem>
                ))
              )}
              <div className="my-1.5 border-t border-[#eef0f5]" />
              <div className="flex items-center gap-1.5 px-1 pb-1">
                <Input
                  value={viewName}
                  onChange={setViewName}
                  onEnter={submitView}
                  placeholder="Nom de la vue…"
                  className="!h-8 !rounded-lg !px-2.5 !text-[12px]"
                />
                <BtnPrimary small onClick={submitView}>
                  Enregistrer
                </BtnPrimary>
              </div>
            </Popover>
          )}
        </div>

        {/* list / galaxy toggle */}
        <div data-tour="view-toggle" className="ml-auto flex items-center rounded-full border border-[#e5e7eb] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium font-inter transition-colors duration-150 ${
              view === "list" ? "bg-[#eff6ff] text-[#3b82f6]" : "text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            <List size={13} strokeWidth={2.2} />
            Liste
          </button>
          <button
            type="button"
            onClick={() => setView("galaxy")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium font-inter transition-colors duration-150 ${
              view === "galaxy" ? "bg-[#eff6ff] text-[#3b82f6]" : "text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            <Network size={13} strokeWidth={2.2} />
            Galaxie
          </button>
        </div>
      </div>

      {/* active facet filter chips */}
      {hasFacetFilters && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 px-7">
          {activeFilterChips.map(({ facet, value }) => (
            <Chip
              key={`${facet.id}-${value.id}`}
              dotColor={value.color}
              className="border border-[#e5e7eb] bg-white text-[#374151]"
            >
              {facet.label}: {value.label}
              <button
                type="button"
                onClick={() => toggleFilter(facet.id, value.id)}
                className="text-[#9ca3af] transition-colors hover:text-[#111827]"
              >
                <X size={11} strokeWidth={2.4} />
              </button>
            </Chip>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11.5px] font-medium font-inter text-[#3b82f6] hover:underline"
          >
            Tout réinitialiser
          </button>
        </div>
      )}

      {/* ========================================================== content */}
      <div className="mt-3 min-h-0 flex-1 px-7 pb-6">
        {view === "galaxy" ? (
          <div className="h-full min-h-0" data-tour="galaxy">
            <GalaxyView projectId={projectId} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto" data-lenis-prevent data-tour="doc-list">
            <Card className="divide-y divide-[#eef0f5] overflow-hidden">
              {sortedDocs.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="text-[13.5px] font-semibold font-inter text-[#111827]">Aucun document</div>
                  <p className="mt-1 text-[12px] font-inter text-[#6b7280]">
                    Ajoutez un fichier, ou ajustez les filtres si certains sont masqués.
                  </p>
                </div>
              ) : groups ? (
                groups.map((g) => (
                  <div key={g.key} className="divide-y divide-[#eef0f5]">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: g.dotColor }} />
                      <span className="text-[10.5px] font-semibold font-inter uppercase tracking-[0.14em] text-[#9ca3af]">
                        {g.label}
                      </span>
                      <span className="text-[10.5px] font-inter text-[#9ca3af]">{g.docs.length}</span>
                    </div>
                    {g.docs.map((doc) => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        selected={selection.has(doc.id)}
                        onToggleSelect={() => toggleSelect(doc.id)}
                      />
                    ))}
                  </div>
                ))
              ) : (
                sortedDocs.map((doc) => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    selected={selection.has(doc.id)}
                    onToggleSelect={() => toggleSelect(doc.id)}
                  />
                ))
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ============================================== multi-select bar */}
      {selection.size > 0 && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          <div
            className="flex items-center gap-3 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 shadow-[0_12px_32px_-8px_rgba(15,23,42,.25)]"
            style={{ animation: `ora-modal-pop 180ms ${EASE}` }}
          >
            <span className="whitespace-nowrap text-[12px] font-semibold font-inter text-[#111827]">
              {selection.size} sélectionné(s)
            </span>

            {/* bulk status */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => togglePop("barStatus")}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium font-inter text-[#374151] transition-colors duration-150 hover:bg-[#f5f8ff]"
              >
                Statut
                <ChevronDown size={12} strokeWidth={2.4} className="text-[#9ca3af]" />
              </button>
              {pop === "barStatus" && (
                <Popover onClose={() => setPop(null)} className="bottom-full left-0 mb-2" width={200}>
                  {STATUSES.map((s) => (
                    <MenuItem key={s.id} onClick={() => applyStatusToSelection(s.id)}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
                      {s.label}
                    </MenuItem>
                  ))}
                </Popover>
              )}
            </div>

            {/* bulk category */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => togglePop("barCategory")}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium font-inter text-[#374151] transition-colors duration-150 hover:bg-[#f5f8ff]"
              >
                Catégorie
                <ChevronDown size={12} strokeWidth={2.4} className="text-[#9ca3af]" />
              </button>
              {pop === "barCategory" && (
                <Popover onClose={() => setPop(null)} className="bottom-full left-0 mb-2" width={280}>
                  {FACETS.map((f) => (
                    <div key={f.id} className="px-1.5 py-1.5">
                      <Eyebrow>{f.label}</Eyebrow>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {f.values.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => applyCategoryToSelection(f.id, v.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[11px] font-medium font-inter text-[#6b7280] transition-colors duration-150 hover:bg-[#f5f8ff]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: v.color }} />
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </Popover>
              )}
            </div>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-full px-2 py-1 text-[12px] font-medium font-inter text-[#ef4444] transition-colors duration-150 hover:bg-[#fee2e2]"
            >
              Supprimer
            </button>

            <button
              type="button"
              onClick={() => setSelection(new Set())}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#9ca3af] transition-colors duration-150 hover:bg-[#f5f8ff] hover:text-[#6b7280]"
            >
              <X size={13} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}

      {/* ================================================= delete confirm */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)} maxW={400}>
          <ModalClose onClick={() => setConfirmDelete(false)} />
          <div className="pr-8 font-poppins text-[16px] font-semibold tracking-[-0.01em] text-[#111827]">
            Supprimer {selection.size} document(s) ?
          </div>
          <p className="mt-2 text-[12.5px] font-inter leading-relaxed text-[#6b7280]">
            Ils seront déplacés à la corbeille (récupérables 30 jours par un administrateur).
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <BtnSoft onClick={() => setConfirmDelete(false)}>Annuler</BtnSoft>
            <button
              type="button"
              onClick={confirmDeleteSelection}
              className="rounded-full bg-[#ef4444] px-4 py-2 text-[13px] font-semibold font-inter text-white transition-colors duration-150 hover:bg-[#dc2626]"
            >
              Supprimer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
