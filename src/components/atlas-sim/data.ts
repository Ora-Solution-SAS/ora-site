/**
 * Atlas simulation — types + fictional dataset.
 *
 * Source of truth: docs/atlas-site-simulation-brief.md (Ora_V2). All copy is
 * French, colors/labels are the production values. Data is fictional but
 * credible (audit / PE firm). Nothing here talks to a real API.
 */

/* ------------------------------------------------------------------ types */

export type ProjectType = "deal_pe" | "audit" | "ma_target" | "custom";
export type Visibility = "private" | "team" | "company";

export type ProjectIconId =
  | "FileSearch"
  | "Building2"
  | "Layers"
  | "FolderOpen"
  | "Briefcase"
  | "BarChart3"
  | "Target"
  | "Sparkles"
  | "FileSpreadsheet";

export type ProjectColorId =
  | "emerald"
  | "violet"
  | "blue"
  | "pink"
  | "amber"
  | "cyan"
  | "indigo"
  | "slate";

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  icon: ProjectIconId;
  color: ProjectColorId;
  visibility: Visibility;
  pinned: boolean;
  createdBy: string; // member id
  createdLabel: string;
  updatedLabel: string;
  managerIds: string[];
}

export type DocFormat = "xlsx" | "csv" | "pdf" | "docx";
export type DocStatus = "draft" | "in_progress" | "review" | "done" | "archived";
export type Approval = "none" | "pending" | "approved" | "changes_requested";

export interface Doc {
  id: string;
  projectId: string;
  name: string; // sans extension
  format: DocFormat;
  sizeLabel: string; // « 2.4 Mo »
  updatedLabel: string; // « il y a 2 h »
  status: DocStatus;
  approval: Approval;
  assigneeIds: string[];
  /** facetId -> valueIds */
  facets: Record<string, string[]>;
  /** libre-layout position in the galaxy, 0..1000 x 0..600 */
  gx: number;
  gy: number;
  lockedBy?: string; // member id who has it open in Excel
}

export type LinkType =
  | "source"
  | "derived"
  | "consolidation"
  | "deliverable"
  | "control"
  | "reference"
  | "manual";

export interface DocLink {
  id: string;
  from: string; // doc id
  to: string; // doc id
  type: LinkType;
  label?: string; // ex. nom de l'automatisation qui a produit le fichier
}

export interface Member {
  id: string;
  name: string;
  email: string;
  color: string; // avatar bg
  isManager?: boolean;
}

export type AutoCategory = "quality" | "audit" | "finance" | "export";
export type AutoOutput = "produces" | "modifies" | "analyzes";

export interface Automation {
  id: string;
  title: string;
  category: AutoCategory;
  output: AutoOutput;
  durationLabel: string; // « ≈ 2 s »
  description: string;
  prereq: string;
  whenToUse: string;
  input: string;
  result: string;
  example: { before: string; after: string };
  /** name given to the produced file, if output === "produces" */
  producesName?: string;
}

export interface HistoryEvent {
  id: string;
  docId: string;
  kind:
    | "created"
    | "status"
    | "assigned"
    | "submitted"
    | "approved"
    | "changes"
    | "reopened"
    | "modified"
    | "opened_excel";
  actorId: string;
  label: string;
  dateLabel: string;
}

export interface Comment {
  id: string;
  docId: string;
  authorId: string;
  body: string;
  dateLabel: string;
  isChangeRequest?: boolean;
}

/* -------------------------------------------------------------- catalogs */

export const PROJECT_TYPES: {
  id: ProjectType;
  label: string;
  hint: string;
  icon: ProjectIconId;
  tint: ProjectColorId;
}[] = [
  { id: "deal_pe", label: "Deal PE", hint: "Investissement, carve-out, exit", icon: "Briefcase", tint: "violet" },
  { id: "audit", label: "Audit", hint: "Commissariat, mission ponctuelle", icon: "FileSearch", tint: "emerald" },
  { id: "ma_target", label: "M&A target", hint: "Cible d'acquisition, due diligence", icon: "Layers", tint: "blue" },
  { id: "custom", label: "Custom", hint: "Autre type de projet", icon: "FolderOpen", tint: "slate" },
];

export const PROJECT_ICONS: ProjectIconId[] = [
  "FileSearch",
  "Building2",
  "Layers",
  "FolderOpen",
  "Briefcase",
  "BarChart3",
  "Target",
  "Sparkles",
  "FileSpreadsheet",
];

export const PROJECT_COLORS: { id: ProjectColorId; label: string; solid: string; soft: string; text: string }[] = [
  { id: "emerald", label: "Émeraude", solid: "#10b981", soft: "#d1fae5", text: "#047857" },
  { id: "violet", label: "Violet", solid: "#8b5cf6", soft: "#ede9fe", text: "#6d28d9" },
  { id: "blue", label: "Bleu", solid: "#3b82f6", soft: "#dbeafe", text: "#1d4ed8" },
  { id: "pink", label: "Rose", solid: "#ec4899", soft: "#fce7f3", text: "#be185d" },
  { id: "amber", label: "Ambre", solid: "#f59e0b", soft: "#fef3c7", text: "#b45309" },
  { id: "cyan", label: "Cyan", solid: "#0ea5e9", soft: "#e0f2fe", text: "#0369a1" },
  { id: "indigo", label: "Indigo", solid: "#6366f1", soft: "#e0e7ff", text: "#4338ca" },
  { id: "slate", label: "Ardoise", solid: "#64748b", soft: "#f1f5f9", text: "#334155" },
];

export const colorOf = (id: ProjectColorId) => PROJECT_COLORS.find((c) => c.id === id)!;

export const VISIBILITIES: { id: Visibility; label: string; hint: string }[] = [
  { id: "private", label: "Privé", hint: "Visible par vous uniquement." },
  { id: "team", label: "Équipe", hint: "Visible par toute votre équipe." },
  { id: "company", label: "Entreprise", hint: "Visible par toutes les équipes de votre entreprise." },
];

/** Chips visibilité / type — recettes exactes du brief. */
export const VISIBILITY_CHIP: Record<Visibility, string> = {
  private: "bg-slate-100 text-slate-700",
  team: "bg-blue-50 text-blue-700",
  company: "bg-violet-50 text-violet-700",
};
export const TYPE_CHIP: Record<ProjectType, string> = {
  deal_pe: "bg-violet-50 text-violet-700",
  audit: "bg-emerald-50 text-emerald-700",
  ma_target: "bg-blue-50 text-blue-700",
  custom: "bg-slate-100 text-slate-700",
};
export const TYPE_LABEL: Record<ProjectType, string> = {
  deal_pe: "Deal PE",
  audit: "Audit",
  ma_target: "M&A target",
  custom: "Custom",
};

export const STATUSES: {
  id: DocStatus;
  label: string;
  chip: string;
  dot: string;
  /** solid color used by the galaxy « Statut » lens */
  solid: string;
}[] = [
  { id: "draft", label: "À faire", chip: "bg-slate-100 text-slate-600", dot: "bg-slate-400", solid: "#94a3b8" },
  { id: "in_progress", label: "En cours", chip: "bg-blue-50 text-blue-600", dot: "bg-blue-500", solid: "#3b82f6" },
  { id: "review", label: "En revue", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500", solid: "#f59e0b" },
  { id: "done", label: "Terminé", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", solid: "#10b981" },
  { id: "archived", label: "Archivé", chip: "bg-slate-100 text-slate-400", dot: "bg-slate-300", solid: "#cbd5e1" },
];
export const statusOf = (id: DocStatus) => STATUSES.find((s) => s.id === id)!;

export const APPROVALS: Record<
  Exclude<Approval, "none">,
  { label: string; chip: string; solid: string }
> = {
  pending: { label: "En attente d'approbation", chip: "bg-amber-50 text-amber-700", solid: "#f59e0b" },
  approved: { label: "Approuvé", chip: "bg-emerald-50 text-emerald-700", solid: "#10b981" },
  changes_requested: { label: "Modifications demandées", chip: "bg-red-50 text-red-600", solid: "#ef4444" },
};

/** Couleurs de format (anneau des nœuds galaxie + icônes fichiers). */
export const FORMAT_COLOR: Record<DocFormat, string> = {
  xlsx: "#22c55e",
  csv: "#0ea5e9",
  pdf: "#ef4444",
  docx: "#3b82f6",
};
export const FORMAT_LABEL: Record<DocFormat, string> = {
  xlsx: "XLSX",
  csv: "CSV",
  pdf: "PDF",
  docx: "DOCX",
};

export const LINK_TYPES: {
  id: LinkType;
  label: string;
  color: string;
  dash?: string; // stroke-dasharray
  wide?: boolean;
  arrow: boolean;
}[] = [
  { id: "source", label: "Source", color: "#0ea5e9", arrow: true },
  { id: "derived", label: "Dérivé", color: "#7c3aed", arrow: true },
  { id: "consolidation", label: "Consolidation", color: "#6366f1", wide: true, arrow: true },
  { id: "deliverable", label: "Livrable", color: "#10b981", wide: true, arrow: true },
  { id: "control", label: "Contrôle", color: "#f59e0b", dash: "5 3", arrow: true },
  { id: "reference", label: "Référence", color: "#94a3b8", dash: "4 3", arrow: false },
  { id: "manual", label: "Lien libre", color: "#a1a8b8", arrow: false },
];
export const linkTypeOf = (id: LinkType) => LINK_TYPES.find((t) => t.id === id)!;

/* ---------------------------------------------------------------- facets */

export interface FacetValue {
  id: string;
  label: string;
  color: string;
}
export interface Facet {
  id: string;
  label: string;
  values: FacetValue[];
}

export const FACETS: Facet[] = [
  {
    id: "workstream",
    label: "Workstream",
    values: [
      { id: "compta", label: "Comptabilité", color: "#4361ee" },
      { id: "fiscal", label: "Fiscal", color: "#10b981" },
      { id: "social", label: "Social", color: "#f59e0b" },
      { id: "juridique", label: "Juridique", color: "#8b5cf6" },
    ],
  },
  {
    id: "phase",
    label: "Phase",
    values: [
      { id: "interim", label: "Intérim", color: "#0ea5e9" },
      { id: "final", label: "Final", color: "#ef4444" },
    ],
  },
  {
    id: "confidentialite",
    label: "Confidentialité",
    values: [
      { id: "interne", label: "Interne", color: "#14b8a6" },
      { id: "restreint", label: "Restreint", color: "#ec4899" },
    ],
  },
];
export const facetValueOf = (facetId: string, valueId: string) =>
  FACETS.find((f) => f.id === facetId)?.values.find((v) => v.id === valueId);

/* --------------------------------------------------------------- members */

export const MEMBERS: Member[] = [
  { id: "me", name: "Vous", email: "vous@cabinet.fr", color: "#3b82f6" },
  { id: "claire", name: "Claire Martin", email: "claire.martin@cabinet.fr", color: "#8b5cf6", isManager: true },
  { id: "paul", name: "Paul Durand", email: "paul.durand@cabinet.fr", color: "#10b981" },
  { id: "sophie", name: "Sophie Bernard", email: "sophie.bernard@cabinet.fr", color: "#f59e0b" },
];
export const memberOf = (id: string) => MEMBERS.find((m) => m.id === id)!;
export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/* ------------------------------------------------------------ automations */

export const AUTO_CATEGORIES: { id: AutoCategory; label: string; color: string; soft: string }[] = [
  { id: "quality", label: "Qualité", color: "#10b981", soft: "#d1fae5" },
  { id: "audit", label: "Audit", color: "#3b82f6", soft: "#dbeafe" },
  { id: "finance", label: "Finance", color: "#8b5cf6", soft: "#ede9fe" },
  { id: "export", label: "Export", color: "#d97706", soft: "#fef3c7" },
];
export const autoCategoryOf = (id: AutoCategory) => AUTO_CATEGORIES.find((c) => c.id === id)!;

export const AUTO_OUTPUT: Record<AutoOutput, { label: string; chip: string }> = {
  produces: { label: "Produit un fichier", chip: "bg-blue-50 text-blue-700" },
  modifies: { label: "Modifie le fichier", chip: "bg-amber-50 text-amber-700" },
  analyzes: { label: "Analyse", chip: "bg-slate-100 text-slate-600" },
};

export const AUTOMATIONS: Automation[] = [
  {
    id: "retraitement-fec",
    title: "Retraitement FEC",
    category: "quality",
    output: "produces",
    durationLabel: "≈ 2 s",
    description: "Nettoie et normalise un FEC : dates, comptes, libellés et soldes prêts pour l'analyse.",
    prereq: "Un FEC au format XLSX ou CSV.",
    whenToUse: "Dès réception d'un FEC client, avant toute revue analytique.",
    input: "FEC brut (XLSX ou CSV), colonnes standard DGFiP.",
    result: "Un nouveau fichier retraité, relié au FEC d'origine.",
    example: { before: "FEC janvier brut, 12 340 lignes", after: "FEC retraité, 12 297 lignes normalisées" },
    producesName: "FEC retraité",
  },
  {
    id: "detection-doublons",
    title: "Détection de doublons",
    category: "audit",
    output: "analyzes",
    durationLabel: "≈ 2 s",
    description: "Repère les écritures en double par montant, date et libellé approché.",
    prereq: "Un journal ou un FEC avec colonnes montant et date.",
    whenToUse: "Pendant la revue des journaux, pour cibler les anomalies.",
    input: "Journal comptable ou FEC.",
    result: "Un rapport d'analyse : doublons suspects et lignes concernées.",
    example: { before: "12 297 écritures", after: "14 doublons suspects identifiés" },
  },
  {
    id: "export-pdf",
    title: "Export PDF",
    category: "export",
    output: "produces",
    durationLabel: "≈ 2 s",
    description: "Met en page le classeur et l'exporte en PDF prêt à partager.",
    prereq: "Un fichier XLSX avec au moins une feuille.",
    whenToUse: "Pour transmettre un livrable figé au client ou au manager.",
    input: "Classeur XLSX.",
    result: "Un PDF paginé, en-têtes et pieds de page inclus.",
    example: { before: "Balance générale.xlsx", after: "Balance générale.pdf, 9 pages" },
    producesName: "Balance générale (PDF)",
  },
  {
    id: "rapprochement-bancaire",
    title: "Rapprochement bancaire",
    category: "finance",
    output: "produces",
    durationLabel: "≈ 2 s",
    description: "Rapproche le relevé bancaire du grand livre et isole les écarts.",
    prereq: "Relevé bancaire et grand livre sur la même période.",
    whenToUse: "À chaque clôture mensuelle.",
    input: "Deux fichiers XLSX ou CSV.",
    result: "Un état de rapprochement avec les écarts surlignés.",
    example: { before: "482 mouvements", after: "479 rapprochés, 3 écarts" },
    producesName: "État de rapprochement",
  },
];

/* --------------------------------------------------------------- dataset */

let seq = 100;
export const nextId = (prefix: string) => `${prefix}-${seq++}`;

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "p-alpha",
    name: "Audit Alpha 2026",
    type: "audit",
    icon: "FileSearch",
    color: "emerald",
    visibility: "team",
    pinned: true,
    createdBy: "claire",
    createdLabel: "12 juin",
    updatedLabel: "il y a 2 h",
    managerIds: ["claire"],
  },
  {
    id: "p-newco",
    name: "Acquisition NewCo",
    type: "deal_pe",
    icon: "Briefcase",
    color: "violet",
    visibility: "team",
    pinned: false,
    createdBy: "me",
    createdLabel: "3 juin",
    updatedLabel: "il y a 3 j",
    managerIds: ["claire"],
  },
  {
    id: "p-notes",
    name: "Notes de mission",
    type: "custom",
    icon: "FolderOpen",
    color: "slate",
    visibility: "private",
    pinned: false,
    createdBy: "me",
    createdLabel: "28 mai",
    updatedLabel: "il y a 5 j",
    managerIds: [],
  },
];

export const INITIAL_DOCS: Doc[] = [
  {
    id: "d-fec",
    projectId: "p-alpha",
    name: "FEC janvier",
    format: "xlsx",
    sizeLabel: "2.4 Mo",
    updatedLabel: "il y a 2 h",
    status: "in_progress",
    approval: "none",
    assigneeIds: ["me"],
    facets: { workstream: ["compta"], phase: ["interim"] },
    gx: 180,
    gy: 300,
  },
  {
    id: "d-balance",
    projectId: "p-alpha",
    name: "Balance générale",
    format: "xlsx",
    sizeLabel: "1.1 Mo",
    updatedLabel: "il y a 5 h",
    status: "done",
    approval: "approved",
    assigneeIds: ["paul"],
    facets: { workstream: ["compta"], phase: ["interim"], confidentialite: ["interne"] },
    gx: 470,
    gy: 150,
  },
  {
    id: "d-releve",
    projectId: "p-alpha",
    name: "Relevé bancaire T1",
    format: "csv",
    sizeLabel: "640 Ko",
    updatedLabel: "il y a 1 j",
    status: "in_progress",
    approval: "none",
    assigneeIds: ["sophie"],
    facets: { workstream: ["compta"] },
    gx: 200,
    gy: 470,
    lockedBy: "sophie",
  },
  {
    id: "d-dd",
    projectId: "p-alpha",
    name: "Rapport de due diligence",
    format: "pdf",
    sizeLabel: "8.2 Mo",
    updatedLabel: "il y a 3 j",
    status: "review",
    approval: "pending",
    assigneeIds: ["me", "paul"],
    facets: { workstream: ["juridique"], confidentialite: ["restreint"], phase: ["final"] },
    gx: 800,
    gy: 300,
  },
  {
    id: "d-notes-synthese",
    projectId: "p-notes",
    name: "Synthèse entretiens",
    format: "docx",
    sizeLabel: "310 Ko",
    updatedLabel: "il y a 5 j",
    status: "draft",
    approval: "none",
    assigneeIds: [],
    facets: {},
    gx: 400,
    gy: 300,
  },
  {
    id: "d-newco-ic",
    projectId: "p-newco",
    name: "Info memo NewCo",
    format: "pdf",
    sizeLabel: "4.6 Mo",
    updatedLabel: "il y a 3 j",
    status: "in_progress",
    approval: "none",
    assigneeIds: ["me"],
    facets: { confidentialite: ["restreint"] },
    gx: 350,
    gy: 250,
  },
];

export const INITIAL_LINKS: DocLink[] = [
  { id: "l-1", from: "d-fec", to: "d-balance", type: "consolidation" },
  { id: "l-2", from: "d-releve", to: "d-balance", type: "control", label: "Rapprochement" },
  { id: "l-3", from: "d-balance", to: "d-dd", type: "deliverable" },
];

export const INITIAL_HISTORY: HistoryEvent[] = [
  { id: "h-1", docId: "d-fec", kind: "created", actorId: "claire", label: "Document créé", dateLabel: "12 juin" },
  { id: "h-2", docId: "d-fec", kind: "assigned", actorId: "claire", label: "Assigné à Vous", dateLabel: "12 juin" },
  { id: "h-3", docId: "d-fec", kind: "status", actorId: "me", label: "Statut modifié : En cours", dateLabel: "il y a 2 j" },
  { id: "h-4", docId: "d-fec", kind: "opened_excel", actorId: "me", label: "Ouvert dans Excel", dateLabel: "il y a 2 h" },
  { id: "h-5", docId: "d-balance", kind: "created", actorId: "paul", label: "Document créé", dateLabel: "12 juin" },
  { id: "h-6", docId: "d-balance", kind: "submitted", actorId: "paul", label: "Soumis pour validation", dateLabel: "il y a 1 j" },
  { id: "h-7", docId: "d-balance", kind: "approved", actorId: "claire", label: "Approuvé", dateLabel: "il y a 5 h" },
  { id: "h-8", docId: "d-dd", kind: "submitted", actorId: "me", label: "Soumis pour validation", dateLabel: "il y a 3 j" },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c-1",
    docId: "d-fec",
    authorId: "claire",
    body: "Pense à vérifier les écritures de janvier avant le retraitement.",
    dateLabel: "il y a 1 j",
  },
  {
    id: "c-2",
    docId: "d-fec",
    authorId: "me",
    body: "Oui, je lance le retraitement ce matin.",
    dateLabel: "il y a 2 h",
  },
  {
    id: "c-3",
    docId: "d-dd",
    authorId: "claire",
    body: "Merci de compléter la section 4 avant validation.",
    dateLabel: "il y a 2 j",
    isChangeRequest: true,
  },
];
