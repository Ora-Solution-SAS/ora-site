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
//   POST /demo/jobs                multipart {file, automation_key, lead...}
//                                  -> {job_id, credits_left}
//   GET  /demo/jobs/:id            -> {status, step_index, progress,
//                                      credits_left, automation_key,
//                                      source_name, source_size, output_name,
//                                      email}
//   GET  /demo/jobs/:id/download   -> result file (Content-Disposition)

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
  lead: DemoLead;
  startedAt: number;
};

export type JobStatus = {
  status: "running" | "done" | "error" | "not_found";
  /** Index into JOB_STEPS of the step currently running (or last step when done). */
  stepIndex: number;
  /** 0..1 overall progress. */
  progress: number;
  creditsLeft: number;
  /** Display metadata (present unless status is "not_found"). */
  automationKey?: string;
  sourceName?: string;
  sourceSize?: number;
  email?: string;
  outputName?: string | null;
};

/** Typed error so the UI can localize the message. */
export class DemoApiError extends Error {
  code: "no_credits" | "file_too_large" | "rejected" | "network";
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

// Simulated duration of each step, in seconds (total ~27s: long enough to
// showcase the "still running after the magic link" state).
const STEP_DURATIONS = [2, 4, 13, 6, 2];
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

function creditsLeftFor(jobs: DemoJob[]): number {
  return Math.max(0, CREDITS_TOTAL - jobs.length);
}

function mockResultName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "resultat";
  return `${base}_ora.txt`;
}

function mockStatus(jobId: string): JobStatus {
  const jobs = readJobs();
  const job = jobs.find((j) => j.jobId === jobId);
  if (!job) {
    return { status: "not_found", stepIndex: 0, progress: 0, creditsLeft: creditsLeftFor(jobs) };
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
  return {
    status: progress >= 1 ? "done" : "running",
    stepIndex,
    progress,
    creditsLeft: creditsLeftFor(jobs),
    automationKey: job.automationKey,
    sourceName: job.fileName,
    sourceSize: job.fileSize,
    email: job.lead.email,
    outputName: progress >= 1 ? mockResultName(job.fileName) : null,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/** POST /demo/jobs — uploads the file, creates the lead, starts the run and
 * triggers the magic-link email. */
export async function createDemoJob(input: {
  file: File;
  automationKey: string;
  lead: DemoLead;
}): Promise<DemoJob> {
  if (API_URL) {
    const form = new FormData();
    form.append("file", input.file);
    form.append("automation_key", input.automationKey);
    form.append("first_name", input.lead.firstName);
    form.append("last_name", input.lead.lastName);
    form.append("email", input.lead.email);
    form.append("time_spent", input.lead.timeSpent);
    if (input.lead.phone) form.append("phone", input.lead.phone);
    if (input.lead.sector) form.append("sector", input.lead.sector);

    let res: Response;
    try {
      res = await fetch(`${API_URL}/demo/jobs`, { method: "POST", body: form });
    } catch {
      throw new DemoApiError("network", "Demo service unreachable");
    }
    if (res.status === 402) throw new DemoApiError("no_credits", "No credits left");
    if (res.status === 413) throw new DemoApiError("file_too_large", "File too large");
    if (!res.ok) throw new DemoApiError("rejected", `Upload rejected (${res.status})`);
    const data = (await res.json()) as { job_id: string };
    return {
      jobId: data.job_id,
      automationKey: input.automationKey,
      fileName: input.file.name,
      fileSize: input.file.size,
      lead: input.lead,
      startedAt: Date.now(),
    };
  }

  const job: DemoJob = {
    jobId: `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    automationKey: input.automationKey,
    fileName: input.file.name,
    fileSize: input.file.size,
    lead: input.lead,
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
      return { status: "not_found", stepIndex: 0, progress: 0, creditsLeft: 0 };
    }
    const d = await res.json();
    return {
      status: d.status,
      stepIndex: d.step_index ?? 0,
      progress: d.progress ?? 0,
      creditsLeft: d.credits_left ?? 0,
      automationKey: d.automation_key,
      sourceName: d.source_name,
      sourceSize: d.source_size,
      email: d.email,
      outputName: d.output_name ?? null,
    };
  }
  return mockStatus(jobId);
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
