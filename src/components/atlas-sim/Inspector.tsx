/**
 * Atlas simulation — document inspector drawer.
 *
 * Right-side drawer inside the 1020x660 sim window (absolute, never fixed).
 * Header: file identity + quick actions (open in Excel flow, automation,
 * copy, share). Body: status/approval tracking with a simulated manager
 * panel, assignees, facet categories, file info, discussion thread and the
 * filtered audit trail, plus a danger zone. Everything is driven by useSim().
 */
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  HardDrive,
  Lock,
  MoreHorizontal,
  PencilLine,
  Play,
  RotateCcw,
  Send,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import {
  APPROVALS,
  FACETS,
  facetValueOf,
  FORMAT_LABEL,
  MEMBERS,
  memberOf,
  STATUSES,
  type Doc,
  type DocStatus,
  type HistoryEvent,
} from "./data";
import { FileTile } from "./icons";
import {
  Avatar,
  BtnPrimary,
  BtnSoft,
  Chip,
  EASE,
  Eyebrow,
  Input,
  MenuItem,
  Modal,
  ModalClose,
  OptionCard,
  Popover,
} from "./ui";
import { useSim } from "./store";

/* ------------------------------------------------------- history catalog */

type HistoryGroup = "status" | "validation" | "file";
type TypeFilter = "all" | HistoryGroup;

const KIND_META: Record<
  HistoryEvent["kind"],
  { bg: string; color: string; Icon: LucideIcon; group: HistoryGroup }
> = {
  created: { bg: "#dbeafe", color: "#1d4ed8", Icon: FilePlus2, group: "file" },
  status: { bg: "#e0e7ff", color: "#4338ca", Icon: ArrowRightLeft, group: "status" },
  assigned: { bg: "#fce7f3", color: "#be185d", Icon: UserPlus, group: "file" },
  submitted: { bg: "#fef3c7", color: "#b45309", Icon: Clock, group: "validation" },
  approved: { bg: "#d1fae5", color: "#047857", Icon: CheckCircle2, group: "validation" },
  changes: { bg: "#fee2e2", color: "#b91c1c", Icon: AlertCircle, group: "validation" },
  reopened: { bg: "#f1f5f9", color: "#334155", Icon: RotateCcw, group: "validation" },
  modified: { bg: "#e0f2fe", color: "#0369a1", Icon: PencilLine, group: "file" },
  opened_excel: { bg: "#d1fae5", color: "#047857", Icon: ExternalLink, group: "file" },
};

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "status", label: "Statut" },
  { id: "validation", label: "Validation" },
  { id: "file", label: "Fichier" },
];

/* ----------------------------------------------------------------- root */

export default function Inspector() {
  const { state } = useSim();
  const doc = state.docs.find((d) => d.id === state.inspectorDocId);
  if (!doc) return null;
  // Keyed by doc id so local UI state (edit modes, filters) resets when
  // navigating between documents with the arrow keys.
  return <InspectorDrawer key={doc.id} doc={doc} />;
}

function InspectorDrawer({ doc }: { doc: Doc }) {
  const { state, actions } = useSim();

  // Header
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(doc.name);
  const [moreOpen, setMoreOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  // Suivi
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [changesText, setChangesText] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  // Catégories
  const [facetEdit, setFacetEdit] = useState(false);
  // Discussion
  const [commentText, setCommentText] = useState("");
  // Historique
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [authorOpen, setAuthorOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [historyShown, setHistoryShown] = useState(5);
  // Danger zone
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* -------------------------------------------------------- keyboard */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (excelOpen) setExcelOpen(false);
        else if (deleteOpen) setDeleteOpen(false);
        else actions.closeInspector();
        return;
      }
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !excelOpen && !deleteOpen) {
        const siblings = state.docs.filter((d) => d.projectId === doc.projectId);
        const idx = siblings.findIndex((d) => d.id === doc.id);
        const next = siblings[e.key === "ArrowDown" ? idx + 1 : idx - 1];
        if (next) {
          e.preventDefault();
          actions.openInspector(next.id);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [actions, state.docs, doc.id, doc.projectId, excelOpen, deleteOpen]);

  /* --------------------------------------------------------- helpers */

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== doc.name) actions.renameDoc(doc.id, trimmed);
    setEditingName(false);
  };

  const cloneDoc = () => {
    actions.addDoc({
      projectId: doc.projectId,
      name: `${doc.name} (copie)`,
      format: doc.format,
      sizeLabel: doc.sizeLabel,
      updatedLabel: "à l'instant",
      status: "draft",
      approval: "none",
      assigneeIds: [...doc.assigneeIds],
      facets: Object.fromEntries(Object.entries(doc.facets).map(([k, v]) => [k, [...v]])),
      gx: doc.gx + 40,
      gy: doc.gy + 40,
    });
  };

  const openReadOnly = () => {
    setExcelOpen(false);
    actions.logEvent(doc.id, "opened_excel", "Ouvert dans Excel (lecture seule)");
    actions.showToast("Ouverture dans Excel (lecture seule)…");
  };

  const openNormal = () => {
    setExcelOpen(false);
    actions.logEvent(doc.id, "opened_excel", "Ouvert dans Excel");
    actions.showToast("Ouverture dans Excel…");
  };

  const copyAndOpen = () => {
    cloneDoc();
    setExcelOpen(false);
    actions.showToast("Copie créée et ouverte dans Excel…");
  };

  const pickStatus = (status: DocStatus) => {
    actions.setDocStatus(doc.id, status);
    setConfirmSubmit(status === "done" && doc.approval === "none");
  };

  const toggleAssignee = (memberId: string) => {
    const on = doc.assigneeIds.includes(memberId);
    actions.patchDoc(doc.id, {
      assigneeIds: on
        ? doc.assigneeIds.filter((i) => i !== memberId)
        : [...doc.assigneeIds, memberId],
    });
    if (!on) actions.logEvent(doc.id, "assigned", `Assigné à ${memberOf(memberId).name}`);
  };

  const toggleFacet = (facetId: string, valueId: string) => {
    const cur = doc.facets[facetId] ?? [];
    const next = cur.includes(valueId) ? cur.filter((v) => v !== valueId) : [...cur, valueId];
    const facets = { ...doc.facets, [facetId]: next };
    if (next.length === 0) delete facets[facetId];
    actions.patchDoc(doc.id, { facets });
  };

  const sendChanges = () => {
    actions.setDocApproval(doc.id, "changes_requested", changesText.trim() || undefined);
    actions.showToast("Modifications demandées");
    setChangesOpen(false);
    setChangesText("");
  };

  const sendComment = () => {
    const body = commentText.trim();
    if (!body) return;
    actions.addComment(doc.id, body);
    setCommentText("");
  };

  /* ----------------------------------------------------- derived data */

  const frozen = doc.approval === "approved";
  const hasFacets = Object.values(doc.facets).some((ids) => ids.length > 0);
  const docComments = state.comments.filter((c) => c.docId === doc.id).slice(-10);
  const filteredEvents = state.history.filter(
    (ev) =>
      ev.docId === doc.id &&
      (authorFilter === "all" || ev.actorId === authorFilter) &&
      (typeFilter === "all" || KIND_META[ev.kind].group === typeFilter)
  );
  const ApprovalIcon =
    doc.approval === "pending" ? Clock : doc.approval === "approved" ? CheckCircle2 : AlertCircle;

  const linkBtn =
    "text-[11.5px] font-medium font-inter text-[#3b82f6] transition-colors hover:text-[#2563eb]";
  const filterPill =
    "flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11.5px] font-medium font-inter text-[#6b7280] transition-colors hover:bg-[#f5f8ff]";

  return (
    <>
      {/* Transparent click-catcher behind the drawer */}
      <div className="absolute inset-0 z-20" onClick={actions.closeInspector} />

      <div
        data-tour="inspector"
        className="absolute inset-y-0 right-0 z-30 flex w-[480px] flex-col border-l border-[#e5e7eb] bg-white shadow-[-24px_0_48px_-24px_rgba(15,23,42,.25)]"
        style={{ animation: `ora-drawer-in 200ms ${EASE}` }}
      >
        <ModalClose onClick={actions.closeInspector} />

        {/* ------------------------------------------------------ header */}
        <div className="border-b border-[#eef0f5] p-4">
          <div className="flex items-start gap-3 pr-7">
            <FileTile format={doc.format} size={38} />
            <div className="min-w-0 flex-1">
              {editingName ? (
                <input
                  type="text"
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") commitName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="w-full rounded-lg border border-[#e5e7eb] bg-white px-2 py-0.5 text-[15px] font-poppins font-semibold text-[#111827] outline-none transition-shadow focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(doc.name);
                    setEditingName(true);
                  }}
                  className="group flex max-w-full items-center gap-1.5 text-left"
                >
                  <span className="truncate text-[15px] font-poppins font-semibold text-[#111827]">
                    {doc.name}
                  </span>
                  <PencilLine
                    size={12}
                    strokeWidth={2.2}
                    className="shrink-0 text-[#9ca3af] opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              )}
              <div className="mt-0.5 text-[10.5px] font-inter text-[#9ca3af]">
                {FORMAT_LABEL[doc.format]} · {doc.sizeLabel} · MAJ {doc.updatedLabel}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setExcelOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#10b981] px-3 py-1.5 text-[12px] font-semibold font-inter text-white transition-colors hover:bg-[#0ea371]"
            >
              <ExternalLink size={12} strokeWidth={2.4} />
              Ouvrir dans Excel
            </button>
            <span data-tour="inspector-auto" className="inline-flex">
              <BtnSoft small onClick={() => actions.openAutomation(doc.id)}>
                <Play size={12} strokeWidth={2.4} />
                Automatisation
              </BtnSoft>
            </span>
            {doc.approval === "approved" && (
              <BtnSoft
                small
                onClick={() => {
                  cloneDoc();
                  actions.showToast(`Copie créée : ${doc.name} (copie)`);
                }}
              >
                <Copy size={12} strokeWidth={2.4} />
                Copier
              </BtnSoft>
            )}
            <BtnSoft
              small
              onClick={() =>
                actions.showToast("Partage disponible après exécution d'une automatisation")
              }
            >
              <Send size={12} strokeWidth={2.4} />
              Envoyer
            </BtnSoft>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
              >
                <MoreHorizontal size={14} strokeWidth={2.4} />
              </button>
              {moreOpen && (
                <Popover onClose={() => setMoreOpen(false)} className="right-0 top-full mt-1.5" width={210}>
                  <MenuItem
                    onClick={() => {
                      setMoreOpen(false);
                      actions.showToast("Basculez en vue Galaxie pour voir la lignée");
                    }}
                  >
                    Voir dans la galaxie
                  </MenuItem>
                </Popover>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------- body */}
        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          <div className="space-y-5 p-4">
            {/* SUIVI */}
            <div>
              <Eyebrow>Suivi</Eyebrow>
              <div className={`mt-2 flex flex-wrap gap-1.5 ${frozen ? "pointer-events-none opacity-60" : ""}`}>
                {STATUSES.map((s) => {
                  const active = doc.status === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pickStatus(s.id)}
                      className={`rounded-full border px-2.5 py-1 text-[11.5px] font-medium font-inter transition-colors ${
                        active
                          ? `${s.chip} border-transparent`
                          : "border-[#e5e7eb] bg-white text-[#9ca3af] hover:bg-[#f5f8ff]"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {confirmSubmit && doc.approval === "none" && (
                <div
                  className="mt-2 rounded-xl border border-[#eef0f5] p-3"
                  style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}
                >
                  <div className="text-[12.5px] font-semibold font-inter text-[#111827]">
                    Soumettre pour validation ?
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <BtnPrimary
                      small
                      onClick={() => {
                        actions.setDocApproval(doc.id, "pending");
                        setConfirmSubmit(false);
                      }}
                    >
                      Soumettre
                    </BtnPrimary>
                    <BtnSoft small onClick={() => setConfirmSubmit(false)}>
                      Plus tard
                    </BtnSoft>
                  </div>
                </div>
              )}

              {doc.approval !== "none" && (
                <div className="mt-2">
                  <Chip className={APPROVALS[doc.approval].chip}>
                    <ApprovalIcon size={11} strokeWidth={2.4} />
                    {APPROVALS[doc.approval].label}
                  </Chip>
                </div>
              )}

              {doc.approval === "pending" && (
                <div className="mt-2 rounded-xl border border-[#eef0f5] p-3">
                  <div className="text-[11px] font-inter text-[#6b7280]">
                    Validation manager (vous êtes Claire dans la démo)
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        actions.setDocApproval(doc.id, "approved");
                        actions.showToast("Document approuvé");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#10b981] px-3 py-1.5 text-[12px] font-semibold font-inter text-white transition-colors hover:bg-[#0ea371]"
                    >
                      <Check size={12} strokeWidth={2.6} />
                      Approuver
                    </button>
                    <BtnSoft small onClick={() => setChangesOpen((o) => !o)}>
                      Modifs
                    </BtnSoft>
                  </div>
                  {changesOpen && (
                    <div className="mt-2" style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}>
                      <textarea
                        rows={3}
                        value={changesText}
                        autoFocus
                        onChange={(e) => setChangesText(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Modifications attendues…"
                        className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white p-2.5 text-[12.5px] font-inter text-[#111827] placeholder:text-[#9ca3af] outline-none transition-shadow focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
                      />
                      <div className="mt-1.5 flex gap-1.5">
                        <BtnPrimary small onClick={sendChanges}>
                          Envoyer
                        </BtnPrimary>
                        <BtnSoft
                          small
                          onClick={() => {
                            setChangesOpen(false);
                            setChangesText("");
                          }}
                        >
                          Annuler
                        </BtnSoft>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {doc.approval === "approved" && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] font-inter text-[#6b7280]">
                    <Lock size={12} strokeWidth={2.2} />
                    Document approuvé et gelé.
                  </div>
                  <BtnSoft
                    small
                    onClick={() => {
                      actions.setDocApproval(doc.id, "none");
                      actions.showToast("Document rouvert");
                    }}
                  >
                    Rouvrir
                  </BtnSoft>
                </div>
              )}

              {/* Assignés */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <Eyebrow>Assignés</Eyebrow>
                  <div className="relative">
                    <button type="button" onClick={() => setAssignOpen(true)} className={linkBtn}>
                      Assigner
                    </button>
                    {assignOpen && (
                      <Popover onClose={() => setAssignOpen(false)} className="right-0 top-full mt-1.5" width={220}>
                        {MEMBERS.map((m) => (
                          <MenuItem
                            key={m.id}
                            active={doc.assigneeIds.includes(m.id)}
                            onClick={() => toggleAssignee(m.id)}
                          >
                            <Avatar name={m.name} color={m.color} size={18} />
                            {m.name}
                          </MenuItem>
                        ))}
                      </Popover>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-1.5">
                  {doc.assigneeIds.length === 0 ? (
                    <div className="text-[12px] font-inter text-[#9ca3af]">Personne n'est assigné</div>
                  ) : (
                    doc.assigneeIds.map((id) => {
                      const m = memberOf(id);
                      return (
                        <div key={id} className="flex items-center gap-2">
                          <Avatar name={m.name} color={m.color} size={22} />
                          <span className="text-[12.5px] font-inter text-[#111827]">{m.name}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* CATÉGORIES */}
            <div>
              <div className="flex items-center justify-between">
                <Eyebrow>Catégories</Eyebrow>
                <button type="button" onClick={() => setFacetEdit((v) => !v)} className={linkBtn}>
                  {facetEdit ? "Terminé" : "Modifier"}
                </button>
              </div>
              {facetEdit ? (
                <div className="mt-2 space-y-2.5">
                  {FACETS.map((f) => (
                    <div key={f.id}>
                      <div className="text-[11px] font-inter text-[#6b7280]">{f.label}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {f.values.map((v) => {
                          const on = (doc.facets[f.id] ?? []).includes(v.id);
                          return (
                            <Chip
                              key={v.id}
                              onClick={() => toggleFacet(f.id, v.id)}
                              className={on ? "" : "bg-slate-100 text-slate-500"}
                              style={on ? { background: `${v.color}1a`, color: v.color } : undefined}
                            >
                              {v.label}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasFacets ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(doc.facets).flatMap(([facetId, valueIds]) =>
                    valueIds.map((valueId) => {
                      const v = facetValueOf(facetId, valueId);
                      if (!v) return null;
                      return (
                        <Chip
                          key={`${facetId}-${valueId}`}
                          style={{ background: `${v.color}1a`, color: v.color }}
                        >
                          {v.label}
                        </Chip>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="mt-2 text-[12px] font-inter text-[#9ca3af]">Aucune catégorie</div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div>
              <Eyebrow>Informations</Eyebrow>
              <div className="mt-2 space-y-1.5 text-[12px] font-inter">
                <div className="flex items-center gap-2">
                  <HardDrive size={13} strokeWidth={2.2} className="text-[#9ca3af]" />
                  <span className="text-[#6b7280]">Taille</span>
                  <span className="ml-auto text-[#111827]">{doc.sizeLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} strokeWidth={2.2} className="text-[#9ca3af]" />
                  <span className="text-[#6b7280]">MAJ</span>
                  <span className="ml-auto text-[#111827]">{doc.updatedLabel}</span>
                </div>
              </div>
            </div>

            {/* DISCUSSION */}
            <div>
              <Eyebrow>Discussion</Eyebrow>
              <div className="mt-2 space-y-3">
                {docComments.map((c) => {
                  const m = memberOf(c.authorId);
                  return (
                    <div key={c.id}>
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} color={m.color} size={22} />
                        <span className="text-[12px] font-semibold font-inter text-[#111827]">{m.name}</span>
                        <span className="text-[10.5px] font-inter text-[#9ca3af]">{c.dateLabel}</span>
                      </div>
                      {c.isChangeRequest ? (
                        <div className="ml-[30px] mt-0.5 rounded-xl bg-[#fee2e2]/60 p-2 text-[12.5px] font-inter text-[#991b1b]">
                          {c.body}
                        </div>
                      ) : (
                        <div className="ml-[30px] mt-0.5 text-[12.5px] font-inter text-[#374151]">{c.body}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={commentText}
                  onChange={setCommentText}
                  placeholder="Écrire un commentaire…"
                  onEnter={sendComment}
                />
                <button
                  type="button"
                  onClick={sendComment}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white transition-colors hover:bg-[#2563eb]"
                >
                  <Send size={14} strokeWidth={2.2} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => actions.showToast("Fil complet disponible dans l'app")}
                className={`mt-2 ${linkBtn}`}
              >
                Ouvrir le fil
              </button>
            </div>

            {/* HISTORIQUE */}
            <div>
              <Eyebrow>Historique</Eyebrow>
              <div className="mt-2 flex gap-1.5">
                <div className="relative">
                  <button type="button" onClick={() => setAuthorOpen(true)} className={filterPill}>
                    {authorFilter === "all" ? "Auteur" : memberOf(authorFilter).name}
                    <ChevronDown size={11} strokeWidth={2.4} />
                  </button>
                  {authorOpen && (
                    <Popover onClose={() => setAuthorOpen(false)} className="left-0 top-full mt-1.5" width={200}>
                      <MenuItem
                        active={authorFilter === "all"}
                        onClick={() => {
                          setAuthorFilter("all");
                          setAuthorOpen(false);
                          setHistoryShown(5);
                        }}
                      >
                        Tous
                      </MenuItem>
                      {MEMBERS.map((m) => (
                        <MenuItem
                          key={m.id}
                          active={authorFilter === m.id}
                          onClick={() => {
                            setAuthorFilter(m.id);
                            setAuthorOpen(false);
                            setHistoryShown(5);
                          }}
                        >
                          {m.name}
                        </MenuItem>
                      ))}
                    </Popover>
                  )}
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setTypeOpen(true)} className={filterPill}>
                    {typeFilter === "all" ? "Type" : TYPE_FILTERS.find((t) => t.id === typeFilter)!.label}
                    <ChevronDown size={11} strokeWidth={2.4} />
                  </button>
                  {typeOpen && (
                    <Popover onClose={() => setTypeOpen(false)} className="left-0 top-full mt-1.5" width={180}>
                      {TYPE_FILTERS.map((t) => (
                        <MenuItem
                          key={t.id}
                          active={typeFilter === t.id}
                          onClick={() => {
                            setTypeFilter(t.id);
                            setTypeOpen(false);
                            setHistoryShown(5);
                          }}
                        >
                          {t.label}
                        </MenuItem>
                      ))}
                    </Popover>
                  )}
                </div>
              </div>
              <div className="mt-2.5 space-y-2.5">
                {filteredEvents.slice(0, historyShown).map((ev) => {
                  const meta = KIND_META[ev.kind];
                  const Icon = meta.Icon;
                  return (
                    <div key={ev.id} className="flex items-start gap-2">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon size={12} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-inter text-[#374151]">{ev.label}</div>
                        <div className="text-[10.5px] font-inter text-[#9ca3af]">
                          {memberOf(ev.actorId).name} · {ev.dateLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredEvents.length > historyShown && (
                <BtnSoft small className="mt-2 w-full" onClick={() => setHistoryShown((n) => n + 5)}>
                  Charger plus
                </BtnSoft>
              )}
            </div>

            {/* DANGER ZONE */}
            <div className="rounded-xl border border-[#fee2e2] p-3">
              <div className="text-[12px] font-semibold font-inter text-[#ef4444]">Supprimer le document</div>
              <p className="mt-1 text-[11.5px] font-inter leading-snug text-[#6b7280]">
                Le document sera déplacé à la corbeille, restaurable pendant 30 jours par un administrateur.
              </p>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-2 rounded-full border border-[#fecaca] bg-white px-3 py-1.5 text-[12px] font-semibold font-inter text-[#ef4444] transition-colors hover:bg-[#fee2e2]"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------- open-in-Excel flow */}
      {excelOpen && (
        <Modal maxW={400} onClose={() => setExcelOpen(false)}>
          <ModalClose onClick={() => setExcelOpen(false)} />
          {doc.approval === "approved" ? (
            <>
              <div className="pr-7 text-[15px] font-poppins font-semibold text-[#111827]">
                Document approuvé, en lecture seule
              </div>
              <p className="mt-2 text-[12.5px] font-inter leading-relaxed text-[#6b7280]">
                Ce document est gelé par une approbation. Vous pouvez le consulter, ou créer une copie modifiable.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <BtnSoft onClick={openReadOnly}>Ouvrir en lecture seule</BtnSoft>
                <BtnPrimary onClick={copyAndOpen}>Créer une copie modifiable</BtnPrimary>
              </div>
            </>
          ) : doc.lockedBy ? (
            <>
              <div className="flex gap-2 rounded-xl border border-[#f59e0b]/30 bg-[#fef3c7] p-3 pr-8 text-[12px] font-inter text-[#92400e]">
                <TriangleAlert size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                <span>
                  {memberOf(doc.lockedBy).name.split(" ")[0]} a ce document ouvert (vu il y a 5 min). Il
                  s'ouvrira en lecture seule. Pour le modifier, créez-en une copie.
                </span>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <BtnSoft onClick={openReadOnly}>Ouvrir en lecture seule</BtnSoft>
                <BtnPrimary onClick={copyAndOpen}>Créer une copie</BtnPrimary>
              </div>
            </>
          ) : (
            <>
              <div className="pr-7 text-[15px] font-poppins font-semibold text-[#111827]">
                Comment souhaitez-vous ouvrir ce document ?
              </div>
              <div className="mt-3 space-y-2">
                <OptionCard
                  icon={<PencilLine size={15} strokeWidth={2.2} />}
                  title="Mode édition"
                  hint="Vous modifiez le fichier, il se synchronise à chaque enregistrement."
                  onClick={openNormal}
                />
                <OptionCard
                  icon={<Eye size={15} strokeWidth={2.2} />}
                  title="Mode lecture seule"
                  hint="Consultation sans risque de modification."
                  onClick={openNormal}
                />
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ------------------------------------------------- delete confirm */}
      {deleteOpen && (
        <Modal maxW={400} onClose={() => setDeleteOpen(false)}>
          <ModalClose onClick={() => setDeleteOpen(false)} />
          <div className="pr-7 text-[15px] font-poppins font-semibold text-[#111827]">
            Supprimer ce document ?
          </div>
          <p className="mt-2 text-[12.5px] font-inter leading-relaxed text-[#6b7280]">
            Le document sera déplacé à la corbeille, restaurable pendant 30 jours par un administrateur.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <BtnSoft onClick={() => setDeleteOpen(false)}>Annuler</BtnSoft>
            <button
              type="button"
              onClick={() => {
                actions.deleteDocs([doc.id]);
                actions.showToast("Document supprimé");
              }}
              className="rounded-full bg-[#ef4444] px-4 py-2 text-[13px] font-semibold font-inter text-white transition-colors hover:bg-[#dc2626]"
            >
              Supprimer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
