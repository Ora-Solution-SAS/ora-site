import type { Localized } from "./data";

// Front-end API layer for the online demo.
//
// MOCK IMPLEMENTATION: the real backend (ora-demo-service, FastAPI on
// Infomaniak Jelastic) is not deployed yet. This module simulates it entirely
// in the browser so the whole UX can be built and reviewed. The exported
// surface mirrors the future HTTP contract 1:1; swapping to the real service
// means reimplementing these functions with fetch() calls. Nothing else in
// the flow components changes.
//
// Mirrored contract:
//   POST /demo/jobs                multipart {file, automation_key, lead...}
//                                  -> {job_id} + sends the magic-link email
//   GET  /demo/jobs/:id            -> {status, step_index, progress, credits_left}
//   GET  /demo/jobs/:id/download   -> result file (gated by magic-link session)
//
// Jobs are persisted in localStorage so the simulated magic-link URL
// (/demo?ml=<job_id>) keeps working after a reload or in a new tab, exactly
// like a real email link would. Progress is derived from elapsed time, so no
// timer state needs to survive navigation.

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
  status: "running" | "done" | "not_found";
  /** Index into JOB_STEPS of the step currently running (or last step when done). */
  stepIndex: number;
  /** 0..1 overall progress. */
  progress: number;
  creditsLeft: number;
  job?: DemoJob;
};

export const CREDITS_TOTAL = 5;

export const JOB_STEPS: { key: string; label: Localized }[] = [
  { key: "upload", label: { fr: "Réception sécurisée du fichier", en: "Secure file upload" } },
  { key: "analyze", label: { fr: "Analyse de la structure", en: "Analyzing the structure" } },
  { key: "run", label: { fr: "Exécution de l'automatisation", en: "Running the automation" } },
  { key: "output", label: { fr: "Génération du fichier de sortie", en: "Generating the output file" } },
  { key: "cleanup", label: { fr: "Suppression du fichier source", en: "Deleting the source file" } },
];

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

/** POST /demo/jobs — uploads the file, creates the lead, starts the run and
 * triggers the magic-link email. The mock only records metadata. */
export async function createDemoJob(input: {
  file: File;
  automationKey: string;
  lead: DemoLead;
}): Promise<DemoJob> {
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

/** GET /demo/jobs/:id — progress is derived from elapsed time. */
export function getJobStatus(jobId: string): JobStatus {
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
    if (elapsed < acc) {
      stepIndex = i;
      break;
    }
    stepIndex = i;
  }
  return {
    status: progress >= 1 ? "done" : "running",
    stepIndex,
    progress,
    creditsLeft: creditsLeftFor(jobs),
    job,
  };
}

/** Name of the produced file. The mock always produces a .txt placeholder;
 * the real service returns the automation's actual output (.xlsx / .pdf). */
export function resultFileName(job: DemoJob): string {
  const base = job.fileName.replace(/\.[^.]+$/, "") || "resultat";
  return `${base}_ora.txt`;
}

/** GET /demo/jobs/:id/download — the mock generates a small placeholder file
 * client-side; the real service streams the automation output. */
export function buildResultBlob(job: DemoJob): Blob {
  const content = [
    "Ora, démonstration en ligne",
    "",
    `Automatisation : ${job.automationKey}`,
    `Fichier source : ${job.fileName}`,
    "",
    "Ce fichier est un aperçu généré par la maquette du site.",
    "Le résultat réel sera produit par le service de démonstration Ora.",
    "",
    "This file is a placeholder generated by the website mockup.",
    "The real output will be produced by the Ora demo service.",
  ].join("\n");
  return new Blob([content], { type: "text/plain;charset=utf-8" });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
