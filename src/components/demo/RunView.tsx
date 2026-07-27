import { motion } from "framer-motion";
import { Check, Loader2, Lock, Wand2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { DemoAutomation } from "./data";
import { JOB_STEPS, type DemoJob, type JobStatus } from "./demoApi";

type Props = {
  automation: DemoAutomation;
  job: DemoJob;
  status: JobStatus;
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Live journal while the automation runs. The run is anonymous at this
// stage: as soon as it completes, the page swaps to the preview window (the
// lead form only appears when the visitor asks to download).
export default function RunView({ automation, job, status }: Props) {
  const { t } = useLang();
  const done = status.status === "done";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto max-w-xl"
    >
      <div className="rounded-[24px] border border-gray-200/60 bg-white p-7 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white">
            <Wand2 size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="font-poppins text-[16px] font-semibold tracking-[-0.02em]">
              {t(automation.title)}
            </h3>
            <p className="truncate font-inter text-[12.5px] text-gray-500 dark:text-gray-400">
              {job.fileName}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#0d9488] transition-[width] duration-700 ease-out"
            style={{ width: `${Math.round(status.progress * 100)}%` }}
          />
        </div>

        <ul className="mt-6 space-y-3.5">
          {JOB_STEPS.map((step, i) => {
            const stepDone = done || i < status.stepIndex;
            const running = !done && i === status.stepIndex;
            return (
              <li key={step.key} className="flex items-center gap-3">
                {stepDone ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-[#0d9488]">
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                ) : running ? (
                  <Loader2 size={18} className="shrink-0 animate-spin text-[#3b82f6]" />
                ) : (
                  <span className="mx-[5px] h-2 w-2 shrink-0 rounded-full bg-gray-200 dark:bg-white/15" />
                )}
                <span
                  className={`font-inter text-[13.5px] ${
                    stepDone
                      ? "text-gray-500 dark:text-gray-400"
                      : running
                        ? "font-medium text-[#111827] dark:text-white"
                        : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {t(step.label)}
                </span>
              </li>
            );
          })}
        </ul>

        {status.status === "error" && (
          <p className="mt-5 font-inter text-[13px] font-medium text-red-500">
            {t({
              fr: "✗ Le traitement n'a pas abouti. Vérifiez le contenu du fichier et réessayez.",
              en: "✗ The run did not complete. Check the file content and try again.",
            })}
          </p>
        )}

        <p className="mt-6 flex items-center gap-1.5 font-inter text-[12px] text-gray-400 dark:text-gray-500">
          <Lock size={12} />
          {t({
            fr: "Traitement éphémère : aucun fichier conservé.",
            en: "Ephemeral processing: no file is kept.",
          })}
        </p>
      </div>
    </motion.div>
  );
}
