import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Download,
  FileSpreadsheet,
  Lock,
  RefreshCcw,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import OraLogoSpinner from "@/components/OraLogoSpinner";
import { getAutomation } from "./data";
import {
  CREDITS_TOTAL,
  JOB_STEPS,
  buildResultBlob,
  formatFileSize,
  getJobStatus,
  resultFileName,
  type JobStatus,
} from "./demoApi";

type Props = {
  jobId: string;
  openBooking: () => void;
  onRestart: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Landing view of the magic link (/demo?ml=<job_id>). Three states:
//  - the job is still running: live progress, auto-flips to "ready"
//  - the job is done: download card + credits + booking CTA
//  - unknown job id: expired-link message
export default function DeliveryView({ jobId, openBooking, onRestart }: Props) {
  const { t } = useLang();
  const [status, setStatus] = useState<JobStatus>(() => getJobStatus(jobId));

  useEffect(() => {
    if (status.status === "done" || status.status === "not_found") return;
    const id = setInterval(() => setStatus(getJobStatus(jobId)), 800);
    return () => clearInterval(id);
  }, [jobId, status.status]);

  const download = () => {
    const job = status.job;
    if (!job) return;
    const url = URL.createObjectURL(buildResultBlob(job));
    const a = document.createElement("a");
    a.href = url;
    a.download = resultFileName(job);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // ── Expired / unknown link ────────────────────────────────────────────────
  if (status.status === "not_found") {
    return (
      <div className="mx-auto max-w-lg rounded-[24px] border border-gray-200/60 bg-white p-10 text-center dark:border-white/[0.06] dark:bg-white/[0.02]">
        <h2 className="font-poppins text-[24px] font-semibold tracking-[-0.03em]">
          {t({ fr: "Ce lien a expiré", en: "This link has expired" })}
        </h2>
        <p className="mt-3 font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400">
          {t({
            fr: "Les fichiers de démonstration ne sont conservés que quelques minutes, le temps de leur traitement. Relancez une automatisation pour obtenir un nouveau lien.",
            en: "Demo files are only kept for a few minutes while they are processed. Run an automation again to get a fresh link.",
          })}
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-7 py-3.5 font-inter text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
        >
          <RefreshCcw size={16} />
          {t({ fr: "Relancer une automatisation", en: "Run an automation again" })}
        </button>
      </div>
    );
  }

  const job = status.job!;
  const automation = getAutomation(job.automationKey);
  const running = status.status === "running";
  const currentStep = JOB_STEPS[Math.min(status.stepIndex, JOB_STEPS.length - 1)];

  return (
    <div className="mx-auto max-w-xl">
      {/* Verified-email chip: the magic link itself proves the address */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400">
          <BadgeCheck size={13} />
          {t({ fr: "Adresse vérifiée", en: "Address verified" })} · {job.lead.email}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {running ? (
          // ── Still running when the visitor arrives from the email ──────
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-[24px] border border-gray-200/60 bg-white p-10 text-center dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="flex justify-center">
              <OraLogoSpinner size={72} gradientId="g-demo-delivery" />
            </div>
            <h2 className="mt-6 font-poppins text-[26px] font-semibold tracking-[-0.03em]">
              {t({ fr: "Encore quelques instants", en: "Just a few more moments" })}
            </h2>
            <p className="mt-2 font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400">
              {automation ? t(automation.title) : job.automationKey}
              {t({
                fr: " travaille encore sur votre fichier. Cette page se mettra à jour toute seule dès qu'il est prêt.",
                en: " is still working on your file. This page will refresh by itself as soon as it is ready.",
              })}
            </p>

            <div className="mx-auto mt-7 max-w-sm">
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#0d9488] transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.round(status.progress * 100)}%` }}
                />
              </div>
              <p className="mt-3 font-inter text-[13px] font-medium text-gray-500 dark:text-gray-400">
                {t(currentStep.label)}
              </p>
            </div>
          </motion.div>
        ) : (
          // ── Ready: deliver the file ────────────────────────────────────
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-[24px] border border-gray-200/60 bg-white p-10 text-center dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white shadow-[0_10px_30px_-8px_rgba(59,130,246,0.55)]"
            >
              <Check size={30} strokeWidth={3} />
            </motion.span>

            <h2 className="mt-6 font-poppins text-[28px] font-semibold tracking-[-0.03em]">
              {t({ fr: "Votre fichier est prêt", en: "Your file is ready" })}
            </h2>
            <p className="mt-2 font-inter text-[14.5px] text-gray-500 dark:text-gray-400">
              {automation ? t(automation.title) : job.automationKey}
              {t({ fr: " a terminé en quelques secondes.", en: " finished in seconds." })}
            </p>

            {/* File card */}
            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-gray-200/70 bg-[#fcfbf7] p-4 text-left dark:border-white/[0.08] dark:bg-white/[0.03]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white">
                <FileSpreadsheet size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-inter text-[14px] font-semibold">
                  {resultFileName(job)}
                </p>
                <p className="font-inter text-[12px] text-gray-500 dark:text-gray-400">
                  {automation ? t(automation.outputLabel) : ""} ·{" "}
                  {t({ fr: "généré depuis", en: "generated from" })} {job.fileName} (
                  {formatFileSize(job.fileSize)})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={download}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-7 py-3.5 font-inter text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
            >
              <Download size={17} />
              {t({ fr: "Télécharger mon fichier", en: "Download my file" })}
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 font-inter text-[12px] text-gray-400 dark:text-gray-500">
              <Lock size={12} />
              {t({
                fr: "Votre fichier source a déjà été supprimé de nos serveurs.",
                en: "Your source file has already been deleted from our servers.",
              })}
            </p>

            {/* Credits + next actions */}
            <div className="mt-8 border-t border-gray-100 pt-6 dark:border-white/[0.06]">
              <p className="font-inter text-[13.5px] text-gray-600 dark:text-gray-300">
                {t({ fr: "Il vous reste ", en: "You have " })}
                <span className="font-semibold text-[#111827] dark:text-white">
                  {status.creditsLeft} {t({ fr: "essais gratuits", en: "free runs" })}
                </span>
                {t({ fr: ` sur ${CREDITS_TOTAL}.`, en: ` left out of ${CREDITS_TOTAL}.` })}
              </p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onRestart}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-6 py-3 font-inter text-[14px] font-semibold text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150 hover:border-[#3b82f6] hover:bg-[#3b82f6] hover:text-white dark:border-white/20 dark:text-gray-300"
                >
                  <RefreshCcw size={15} />
                  {t({ fr: "Tester une autre automatisation", en: "Try another automation" })}
                </button>
                <button
                  type="button"
                  onClick={openBooking}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-6 py-3 font-inter text-[14px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
                >
                  {t({ fr: "Voir Ora sur vos volumes réels", en: "See Ora on your real volumes" })}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
