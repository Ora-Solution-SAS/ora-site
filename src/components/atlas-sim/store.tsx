/**
 * Atlas simulation — central store (React context).
 *
 * One provider holds the whole simulated app state (projects, docs, links,
 * history, comments, overlays, toasts). Screens consume it via useSim().
 * Everything responds instantly with simulated data (brief §5).
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AUTOMATIONS,
  INITIAL_COMMENTS,
  INITIAL_DOCS,
  INITIAL_HISTORY,
  INITIAL_LINKS,
  INITIAL_PROJECTS,
  nextId,
  type Approval,
  type Automation,
  type Comment,
  type Doc,
  type DocLink,
  type DocStatus,
  type HistoryEvent,
  type LinkType,
  type Project,
  type ProjectColorId,
  type ProjectIconId,
  type ProjectType,
  type Visibility,
} from "./data";

export type Screen = { view: "home" } | { view: "project"; projectId: string };

export interface NewProjectInput {
  name: string;
  type: ProjectType;
  icon: ProjectIconId;
  color: ProjectColorId;
  visibility: Visibility;
}

export interface SimState {
  screen: Screen;
  projects: Project[];
  docs: Doc[];
  links: DocLink[];
  history: HistoryEvent[];
  comments: Comment[];
  favoriteAutoIds: string[];
  savedViews: string[];
  /** doc currently opened in the inspector drawer (null = closed) */
  inspectorDocId: string | null;
  /** doc whose automation workspace is open (null = closed) */
  automationDocId: string | null;
  wizardOpen: boolean;
  addFileOpen: boolean;
  toast: string | null;
  /** current tab of the open project view (lifted here so the guided tour can drive it) */
  projectTab: "list" | "galaxy";
  /** active step of the guided tour (null = tour not running) */
  tourStep: number | null;
}

export interface SimActions {
  goHome: () => void;
  openProject: (projectId: string) => void;
  openWizard: () => void;
  closeWizard: () => void;
  createProject: (input: NewProjectInput) => void;
  togglePin: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  setProjectAppearance: (projectId: string, icon: ProjectIconId, color: ProjectColorId) => void;
  setProjectVisibility: (projectId: string, v: Visibility) => void;

  setProjectTab: (tab: "list" | "galaxy") => void;
  startTour: () => void;
  setTourStep: (n: number) => void;
  endTour: () => void;

  openInspector: (docId: string) => void;
  closeInspector: () => void;
  openAutomation: (docId: string) => void;
  closeAutomation: () => void;
  openAddFile: () => void;
  closeAddFile: () => void;

  addDoc: (doc: Omit<Doc, "id">) => string;
  patchDoc: (docId: string, patch: Partial<Doc>) => void;
  deleteDocs: (docIds: string[]) => void;
  renameDoc: (docId: string, name: string) => void;
  setDocStatus: (docId: string, status: DocStatus) => void;
  setDocApproval: (docId: string, approval: Approval, note?: string) => void;
  addComment: (docId: string, body: string, isChangeRequest?: boolean) => void;
  addLink: (link: Omit<DocLink, "id">) => void;
  retypeLink: (linkId: string, type: LinkType) => void;
  removeLink: (linkId: string) => void;
  toggleFavoriteAuto: (autoId: string) => boolean; // false = limit reached
  saveView: (name: string) => void;
  logEvent: (docId: string, kind: HistoryEvent["kind"], label: string, actorId?: string) => void;
  /** Persist an automation result as a new doc linked « Dérivé » to its source. Returns the new doc id. */
  saveAutomationResult: (sourceDocId: string, auto: Automation, name: string) => string;
  showToast: (message: string) => void;
}

const SimCtx = createContext<{ state: SimState; actions: SimActions } | null>(null);

export function useSim() {
  const ctx = useContext(SimCtx);
  if (!ctx) throw new Error("useSim must be used inside <SimProvider>");
  return ctx;
}

export function SimProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ view: "home" });
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [links, setLinks] = useState<DocLink[]>(INITIAL_LINKS);
  const [history, setHistory] = useState<HistoryEvent[]>(INITIAL_HISTORY);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [favoriteAutoIds, setFavoriteAutoIds] = useState<string[]>(["retraitement-fec"]);
  const [savedViews, setSavedViews] = useState<string[]>([]);
  const [inspectorDocId, setInspectorDocId] = useState<string | null>(null);
  const [automationDocId, setAutomationDocId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [addFileOpen, setAddFileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<"list" | "galaxy">("list");
  const [tourStep, setTourStepState] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const logEvent = useCallback(
    (docId: string, kind: HistoryEvent["kind"], label: string, actorId = "me") => {
      setHistory((h) => [
        { id: nextId("h"), docId, kind, actorId, label, dateLabel: "à l'instant" },
        ...h,
      ]);
    },
    []
  );

  const actions = useMemo<SimActions>(
    () => ({
      goHome: () => {
        setScreen({ view: "home" });
        setInspectorDocId(null);
        setAutomationDocId(null);
      },
      openProject: (projectId) => {
        setProjectTab("list");
        setScreen({ view: "project", projectId });
      },
      setProjectTab: (tab) => setProjectTab(tab),
      startTour: () => setTourStepState(0),
      setTourStep: (n) => setTourStepState(n),
      endTour: () => setTourStepState(null),
      openWizard: () => setWizardOpen(true),
      closeWizard: () => setWizardOpen(false),
      createProject: (input) => {
        const id = nextId("p");
        setProjects((ps) => [
          {
            id,
            name: input.name || "Nouveau projet",
            type: input.type,
            icon: input.icon,
            color: input.color,
            visibility: input.visibility,
            pinned: false,
            createdBy: "me",
            createdLabel: "à l'instant",
            updatedLabel: "à l'instant",
            managerIds: input.visibility === "private" ? [] : ["claire"],
          },
          ...ps,
        ]);
        setWizardOpen(false);
        setScreen({ view: "project", projectId: id });
      },
      togglePin: (projectId) =>
        setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, pinned: !p.pinned } : p))),
      renameProject: (projectId, name) =>
        setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, name } : p))),
      setProjectAppearance: (projectId, icon, color) =>
        setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, icon, color } : p))),
      setProjectVisibility: (projectId, v) =>
        setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, visibility: v } : p))),

      openInspector: (docId) => setInspectorDocId(docId),
      closeInspector: () => setInspectorDocId(null),
      openAutomation: (docId) => {
        setInspectorDocId(null);
        setAutomationDocId(docId);
      },
      closeAutomation: () => setAutomationDocId(null),
      openAddFile: () => setAddFileOpen(true),
      closeAddFile: () => setAddFileOpen(false),

      addDoc: (doc) => {
        const id = nextId("d");
        setDocs((ds) => [...ds, { ...doc, id }]);
        setHistory((h) => [
          { id: nextId("h"), docId: id, kind: "created", actorId: "me", label: "Document créé", dateLabel: "à l'instant" },
          ...h,
        ]);
        return id;
      },
      patchDoc: (docId, patch) =>
        setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, ...patch } : d))),
      deleteDocs: (docIds) => {
        setDocs((ds) => ds.filter((d) => !docIds.includes(d.id)));
        setLinks((ls) => ls.filter((l) => !docIds.includes(l.from) && !docIds.includes(l.to)));
        setInspectorDocId((cur) => (cur && docIds.includes(cur) ? null : cur));
      },
      renameDoc: (docId, name) =>
        setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, name } : d))),
      setDocStatus: (docId, status) => {
        setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, status, updatedLabel: "à l'instant" } : d)));
        setHistory((h) => [
          {
            id: nextId("h"),
            docId,
            kind: "status",
            actorId: "me",
            label: `Statut modifié : ${
              status === "draft" ? "À faire" : status === "in_progress" ? "En cours" : status === "review" ? "En revue" : status === "done" ? "Terminé" : "Archivé"
            }`,
            dateLabel: "à l'instant",
          },
          ...h,
        ]);
      },
      setDocApproval: (docId, approval, note) => {
        setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, approval } : d)));
        const meta: Partial<Record<Approval, { kind: HistoryEvent["kind"]; label: string; actor: string }>> = {
          pending: { kind: "submitted", label: "Soumis pour validation", actor: "me" },
          approved: { kind: "approved", label: "Approuvé", actor: "claire" },
          changes_requested: { kind: "changes", label: "Modifications demandées", actor: "claire" },
          none: { kind: "reopened", label: "Document rouvert", actor: "claire" },
        };
        const m = meta[approval];
        if (m) {
          setHistory((h) => [
            { id: nextId("h"), docId, kind: m.kind, actorId: m.actor, label: m.label, dateLabel: "à l'instant" },
            ...h,
          ]);
        }
        if (approval === "changes_requested" && note) {
          setComments((cs) => [
            ...cs,
            { id: nextId("c"), docId, authorId: "claire", body: note, dateLabel: "à l'instant", isChangeRequest: true },
          ]);
        }
      },
      addComment: (docId, body, isChangeRequest) =>
        setComments((cs) => [
          ...cs,
          { id: nextId("c"), docId, authorId: "me", body, dateLabel: "à l'instant", isChangeRequest },
        ]),
      addLink: (link) => setLinks((ls) => [...ls, { ...link, id: nextId("l") }]),
      retypeLink: (linkId, type) =>
        setLinks((ls) => ls.map((l) => (l.id === linkId ? { ...l, type } : l))),
      removeLink: (linkId) => setLinks((ls) => ls.filter((l) => l.id !== linkId)),
      toggleFavoriteAuto: (autoId) => {
        let ok = true;
        setFavoriteAutoIds((ids) => {
          if (ids.includes(autoId)) return ids.filter((i) => i !== autoId);
          if (ids.length >= 8) {
            ok = false;
            return ids;
          }
          return [...ids, autoId];
        });
        return ok;
      },
      saveView: (name) => setSavedViews((vs) => (vs.includes(name) ? vs : [...vs, name])),
      logEvent,
      saveAutomationResult: (sourceDocId, auto, name) => {
        const source = docs.find((d) => d.id === sourceDocId);
        const id = nextId("d");
        setDocs((ds) => {
          const src = ds.find((d) => d.id === sourceDocId);
          return [
            ...ds,
            {
              id,
              projectId: src?.projectId ?? source?.projectId ?? "p-alpha",
              name,
              format: auto.id === "export-pdf" ? "pdf" : "xlsx",
              sizeLabel: "2.1 Mo",
              updatedLabel: "à l'instant",
              status: "draft",
              approval: "none",
              assigneeIds: ["me"],
              facets: src?.facets ?? {},
              gx: Math.min(940, (src?.gx ?? 400) + 250),
              gy: Math.max(60, (src?.gy ?? 300) - 90),
            },
          ];
        });
        setLinks((ls) => [
          ...ls,
          { id: nextId("l"), from: sourceDocId, to: id, type: "derived", label: auto.title },
        ]);
        setHistory((h) => [
          { id: nextId("h"), docId: id, kind: "created", actorId: "me", label: `Document créé par « ${auto.title} »`, dateLabel: "à l'instant" },
          ...h,
        ]);
        return id;
      },
      showToast,
    }),
    [docs, logEvent, showToast]
  );

  const state: SimState = {
    screen,
    projects,
    docs,
    links,
    history,
    comments,
    favoriteAutoIds,
    savedViews,
    inspectorDocId,
    automationDocId,
    wizardOpen,
    addFileOpen,
    toast,
    projectTab,
    tourStep,
  };

  return <SimCtx.Provider value={{ state, actions }}>{children}</SimCtx.Provider>;
}

export { AUTOMATIONS };
