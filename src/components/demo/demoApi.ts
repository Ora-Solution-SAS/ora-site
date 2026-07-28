import type { Localized } from "./data";

// Front-end API layer for the online demo. Two modes behind one surface:
//
// - REAL mode: talks to ora-demo-service (FastAPI). In dev this is the
//   DEFAULT (http://127.0.0.1:8900, run `uvicorn app.main:app --port 8900`
//   in ora-demo-service). In production it requires VITE_DEMO_API_URL at
//   build time. localStorage["ora-demo-api-url"] overrides the URL in dev.
// - MOCK mode: simulates everything in the browser, persisting jobs in
//   localStorage so the magic-link URL (/demo?ml=<job_id>) survives reloads.
//   Default in production builds without VITE_DEMO_API_URL; in dev, force it
//   with localStorage.setItem("ora-demo-api-url", "mock") for pure
//   front-end work without the service running.
//
// HTTP contract (ora-demo-service/app/main.py — keep both in sync):
//   POST /demo/jobs                multipart {file, automation_key} -> {job_id}
//                                  (anonymous, rate limited per IP)
//   GET  /demo/jobs/:id            -> status + preview_ready + claimed
//   GET  /demo/jobs/:id/preview    -> per-sheet extract for the viewer
//   POST /demo/jobs/:id/claim      lead form -> {credits_left} + magic link
//   GET  /demo/jobs/:id/download   -> result file (requires a claim)

export type DemoLead = {
  firstName: string;
  lastName: string;
  email: string;
  /** Key of the selected "time normally spent" option. */
  timeSpent: string;
  phone?: string;
  sector?: string;
};

export type DemoJob = {
  jobId: string;
  automationKey: string;
  fileName: string;
  fileSize: number;
  startedAt: number;
  /** Mock only: set once the visitor claims the download. */
  claimedEmail?: string;
};

export type JobStatus = {
  status: "running" | "done" | "error" | "not_found";
  /** Index into JOB_STEPS of the step currently running (or last step when done). */
  stepIndex: number;
  /** 0..1 overall progress. */
  progress: number;
  /** Null until the job has been claimed with an email. */
  creditsLeft: number | null;
  previewReady: boolean;
  claimed: boolean;
  /** Display metadata (present unless status is "not_found"). */
  automationKey?: string;
  sourceName?: string;
  sourceSize?: number;
  email?: string | null;
  outputName?: string | null;
};

// ── Preview payload (mirrors app/preview.py) ─────────────────────────────────

export type PreviewStyle = {
  bg?: string;
  c?: string;
  b?: boolean;
  i?: boolean;
  sz?: number;
  a?: "left" | "center" | "right";
};

export type PreviewCell = { v: string; s?: string };

export type PreviewChart = {
  kind: "line" | "bar";
  title: string;
  categories: string[];
  series: { name: string; values: number[] }[];
};

export type PreviewSheet = {
  name: string;
  kind: "grid" | "pivot";
  rows: PreviewCell[][];
  widths: number[];
  merges: string[];
  charts: PreviewChart[];
  truncated: boolean;
  total_rows: number;
  note?: string;
};

export type PreviewData = {
  file_name: string;
  styles: Record<string, PreviewStyle>;
  sheets: PreviewSheet[];
};

/** Typed error so the UI can localize the message. */
export class DemoApiError extends Error {
  code: "no_credits" | "file_too_large" | "rejected" | "network" | "rate_limited";
  constructor(code: DemoApiError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

export const CREDITS_TOTAL = 5;

export const JOB_STEPS: { key: string; label: Localized }[] = [
  { key: "upload", label: { fr: "Réception sécurisée du fichier", en: "Secure file upload" } },
  { key: "analyze", label: { fr: "Analyse de la structure", en: "Analyzing the structure" } },
  { key: "run", label: { fr: "Exécution de l'automatisation", en: "Running the automation" } },
  { key: "output", label: { fr: "Génération du fichier de sortie", en: "Generating the output file" } },
  { key: "cleanup", label: { fr: "Suppression du fichier source", en: "Deleting the source file" } },
];

// ── Mode resolution ──────────────────────────────────────────────────────────

function resolveApiUrl(): string | null {
  const env = import.meta.env.VITE_DEMO_API_URL as string | undefined;
  if (import.meta.env.DEV) {
    try {
      const override = window.localStorage.getItem("ora-demo-api-url");
      if (override === "mock") return null;
      if (override) return override.replace(/\/+$/, "");
    } catch {
      // Storage unavailable: fall through to the defaults.
    }
    return env ? env.replace(/\/+$/, "") : "http://127.0.0.1:8900";
  }
  return env ? env.replace(/\/+$/, "") : null;
}

const API_URL = resolveApiUrl();

/** True when the page talks to a real ora-demo-service instance. */
export const usingRealApi = API_URL !== null;

// ── Mock internals ───────────────────────────────────────────────────────────

// Simulated duration of each step, in seconds.
const STEP_DURATIONS = [1, 2, 5, 2, 1];
const TOTAL_DURATION = STEP_DURATIONS.reduce((a, b) => a + b, 0);

const STORAGE_KEY = "ora-demo-mock-jobs";

function readJobs(): DemoJob[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoJob[]) : [];
  } catch {
    return [];
  }
}

function writeJobs(jobs: DemoJob[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // Storage unavailable (private mode): the in-tab flow still works.
  }
}

function mockCreditsLeft(jobs: DemoJob[]): number {
  return Math.max(0, CREDITS_TOTAL - jobs.filter((j) => j.claimedEmail).length);
}

function mockResultName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "resultat";
  return `${base}_ora.txt`;
}

function mockStatus(jobId: string): JobStatus {
  const jobs = readJobs();
  const job = jobs.find((j) => j.jobId === jobId);
  if (!job) {
    return {
      status: "not_found", stepIndex: 0, progress: 0, creditsLeft: null,
      previewReady: false, claimed: false,
    };
  }
  const elapsed = (Date.now() - job.startedAt) / 1000;
  const progress = Math.min(1, elapsed / TOTAL_DURATION);
  let stepIndex = 0;
  let acc = 0;
  for (let i = 0; i < STEP_DURATIONS.length; i++) {
    acc += STEP_DURATIONS[i];
    stepIndex = i;
    if (elapsed < acc) break;
  }
  const done = progress >= 1;
  return {
    status: done ? "done" : "running",
    stepIndex,
    progress,
    creditsLeft: job.claimedEmail ? mockCreditsLeft(jobs) : null,
    previewReady: done,
    claimed: Boolean(job.claimedEmail),
    automationKey: job.automationKey,
    sourceName: job.fileName,
    sourceSize: job.fileSize,
    email: job.claimedEmail ?? null,
    outputName: done ? mockResultName(job.fileName) : null,
  };
}

// Canned preview so the mock exercises the viewer without the service.
const MOCK_PREVIEW: PreviewData = {
  file_name: "apercu_ora.xlsx",
  styles: {
    h: { bg: "#3b82f6", c: "#ffffff", b: true },
    n: { a: "right" },
    t: { b: true, sz: 14 },
  },
  sheets: [
    {
      name: "Synthèse",
      kind: "grid",
      widths: [30, 18],
      merges: [],
      charts: [],
      truncated: false,
      total_rows: 6,
      rows: [
        [{ v: "Synthèse du dossier", s: "t" }, { v: "" }],
        [{ v: "Indicateur", s: "h" }, { v: "Valeur", s: "h" }],
        [{ v: "Écritures" }, { v: "26 672", s: "n" }],
        [{ v: "Chiffre d'affaires" }, { v: "19 049 828,36", s: "n" }],
        [{ v: "Charges" }, { v: "6 759 985,69", s: "n" }],
        [{ v: "Équilibre débits / crédits" }, { v: "OK", s: "n" }],
      ],
    },
    {
      name: "Saisonnalité",
      kind: "grid",
      widths: [12, 16, 14],
      merges: [],
      truncated: false,
      total_rows: 7,
      rows: [
        [{ v: "Mois", s: "h" }, { v: "CA", s: "h" }, { v: "Part du CA", s: "h" }],
        [{ v: "2024-01" }, { v: "1 402 331,10", s: "n" }, { v: "7,4 %", s: "n" }],
        [{ v: "2024-02" }, { v: "1 288 004,55", s: "n" }, { v: "6,8 %", s: "n" }],
        [{ v: "2024-03" }, { v: "1 511 246,80", s: "n" }, { v: "7,9 %", s: "n" }],
        [{ v: "2024-04" }, { v: "1 476 990,12", s: "n" }, { v: "7,8 %", s: "n" }],
        [{ v: "2024-05" }, { v: "1 630 700,44", s: "n" }, { v: "8,6 %", s: "n" }],
        [{ v: "2024-06" }, { v: "1 705 512,03", s: "n" }, { v: "9,0 %", s: "n" }],
      ],
      charts: [
        {
          kind: "line",
          title: "Saisonnalité du chiffre d'affaires",
          categories: ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06"],
          series: [{
            name: "CA mensuel",
            values: [1402331, 1288004, 1511246, 1476990, 1630700, 1705512],
          }],
        },
      ],
    },
  ],
};

// ── Public API ───────────────────────────────────────────────────────────────

/** POST /demo/jobs — anonymous upload, starts the run. */
export async function createDemoJob(input: {
  file: File;
  automationKey: string;
}): Promise<DemoJob> {
  if (API_URL) {
    const form = new FormData();
    form.append("file", input.file);
    form.append("automation_key", input.automationKey);

    let res: Response;
    try {
      res = await fetch(`${API_URL}/demo/jobs`, { method: "POST", body: form });
    } catch {
      throw new DemoApiError("network", "Demo service unreachable");
    }
    if (res.status === 429) throw new DemoApiError("rate_limited", "Rate limited");
    if (res.status === 413) throw new DemoApiError("file_too_large", "File too large");
    if (!res.ok) throw new DemoApiError("rejected", `Upload rejected (${res.status})`);
    const data = (await res.json()) as { job_id: string };
    return {
      jobId: data.job_id,
      automationKey: input.automationKey,
      fileName: input.file.name,
      fileSize: input.file.size,
      startedAt: Date.now(),
    };
  }

  const job: DemoJob = {
    jobId: `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    automationKey: input.automationKey,
    fileName: input.file.name,
    fileSize: input.file.size,
    startedAt: Date.now(),
  };
  const jobs = readJobs();
  jobs.push(job);
  writeJobs(jobs);
  // Simulated network latency of the upload.
  await new Promise((r) => setTimeout(r, 600));
  return job;
}

/** GET /demo/jobs/:id */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  if (API_URL) {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/demo/jobs/${encodeURIComponent(jobId)}`);
    } catch {
      throw new DemoApiError("network", "Demo service unreachable");
    }
    if (res.status === 404) {
      return {
        status: "not_found", stepIndex: 0, progress: 0, creditsLeft: null,
        previewReady: false, claimed: false,
      };
    }
    const d = await res.json();
    return {
      status: d.status,
      stepIndex: d.step_index ?? 0,
      progress: d.progress ?? 0,
      creditsLeft: d.credits_left ?? null,
      previewReady: Boolean(d.preview_ready),
      claimed: Boolean(d.claimed),
      automationKey: d.automation_key,
      sourceName: d.source_name,
      sourceSize: d.source_size,
      email: d.email ?? null,
      outputName: d.output_name ?? null,
    };
  }
  return mockStatus(jobId);
}

/** GET /demo/jobs/:id/preview — the extract rendered by the Excel window. */
export async function getJobPreview(jobId: string): Promise<PreviewData> {
  if (API_URL) {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/demo/jobs/${encodeURIComponent(jobId)}/preview`);
    } catch {
      throw new DemoApiError("network", "Demo service unreachable");
    }
    if (!res.ok) throw new DemoApiError("rejected", `No preview (${res.status})`);
    return (await res.json()) as PreviewData;
  }
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_PREVIEW;
}

/** POST /demo/jobs/:id/claim — the lead form: consumes a credit and sends
 * the magic link. */
export async function claimDemoJob(
  jobId: string,
  lead: DemoLead
): Promise<{ creditsLeft: number }> {
  if (API_URL) {
    const form = new FormData();
    form.append("first_name", lead.firstName);
    form.append("last_name", lead.lastName);
    form.append("email", lead.email);
    form.append("time_spent", lead.timeSpent);
    if (lead.phone) form.append("phone", lead.phone);
    if (lead.sector) form.append("sector", lead.sector);

    let res: Response;
    try {
      res = await fetch(`${API_URL}/demo/jobs/${encodeURIComponent(jobId)}/claim`, {
        method: "POST",
        body: form,
      });
    } catch {
      throw new DemoApiError("network", "Demo service unreachable");
    }
    if (res.status === 402) throw new DemoApiError("no_credits", "No credits left");
    if (!res.ok) throw new DemoApiError("rejected", `Claim rejected (${res.status})`);
    const d = (await res.json()) as { credits_left: number };
    return { creditsLeft: d.credits_left };
  }

  const jobs = readJobs();
  const job = jobs.find((j) => j.jobId === jobId);
  if (!job) throw new DemoApiError("rejected", "Unknown job");
  if (!job.claimedEmail && mockCreditsLeft(jobs) <= 0) {
    throw new DemoApiError("no_credits", "No credits left");
  }
  job.claimedEmail = lead.email.toLowerCase();
  writeJobs(jobs);
  await new Promise((r) => setTimeout(r, 500));
  return { creditsLeft: mockCreditsLeft(readJobs()) };
}

/** Name of the produced file, for display before/after completion. */
export function resultFileName(status: JobStatus): string {
  if (status.outputName) return status.outputName;
  return mockResultName(status.sourceName ?? "resultat");
}

/** GET /demo/jobs/:id/download — triggers the browser download.
 * Real mode navigates an anchor to the endpoint (Content-Disposition does the
 * rest; once Supabase auth lands this becomes an authenticated fetch). Mock
 * mode fabricates a small placeholder file client-side. */
export function downloadResult(jobId: string, status: JobStatus): void {
  if (API_URL) {
    const a = document.createElement("a");
    a.href = `${API_URL}/demo/jobs/${encodeURIComponent(jobId)}/download`;
    a.download = resultFileName(status);
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const content = [
    "Ora, démonstration en ligne",
    "",
    `Automatisation : ${status.automationKey ?? ""}`,
    `Fichier source : ${status.sourceName ?? ""}`,
    "",
    "Ce fichier est un aperçu généré par la maquette du site.",
    "Le résultat réel sera produit par le service de démonstration Ora.",
    "",
    "This file is a placeholder generated by the website mockup.",
    "The real output will be produced by the Ora demo service.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = resultFileName(status);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
