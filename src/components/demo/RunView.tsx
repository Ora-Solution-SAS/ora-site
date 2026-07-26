import { motion } from "framer-motion";
import { Check, Loader2, Lock, MailCheck, Wand2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { DemoAutomation } from "./data";
import { JOB_STEPS, usingRealApi, type DemoJob, type JobStatus } from "./demoApi";

type Props = {
  automation: DemoAutomation;
  job: DemoJob;
  status: JobStatus;
  /** Mock only: stands in for clicking the link in the email. */
  onSimulateMagicLink: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function RunView({ automation, job, status, onSimulateMagicLink }: Props) {
  const { t } = useLang();
  const done = status.status === "done";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto max-w-4xl"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* ── Live journal ──────────────────────────────────────────────── */}
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

          {done && (
            <p className="mt-5 font-inter text-[13px] font-medium text-[#0d9488]">
              {t({
                fr: "✓ Traitement terminé. Votre fichier vous attend derrière le lien envoyé par email.",
                en: "✓ Processing finished. Your file is waiting behind the emailed link.",
              })}
            </p>
          )}

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

        {/* ── Magic link instructions (the action the visitor must take) ── */}
        <div className="relative overflow-hidden rounded-[24px] border border-blue-200/70 bg-blue-50/50 p-7 dark:border-blue-500/25 dark:bg-blue-500/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(59,130,246,0.18) 0%, transparent 75%)",
            }}
          />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white shadow-[0_10px_30px_-8px_rgba(59,130,246,0.5)]">
            <MailCheck size={22} />
          </span>

          <h3 className="mt-5 font-poppins text-[20px] font-semibold tracking-[-0.02em]">
            {t({ fr: "Vérifiez votre boîte mail", en: "Check your inbox" })}
          </h3>
          <p className="mt-2 font-inter text-[14px] leading-relaxed text-gray-600 dark:text-gray-300">
            {t({ fr: "Nous venons d'envoyer un lien sécurisé à ", en: "We just sent a secure link to " })}
            <span className="font-semibold text-[#111827] dark:text-white">{job.lead.email}</span>
            {t({
              fr: ". Cliquez-le pour ouvrir votre espace de téléchargement : votre fichier vous y attendra.",
              en: ". Click it to open your download space: your file will be waiting there.",
            })}
          </p>
          <p className="mt-3 font-inter text-[12.5px] text-gray-500 dark:text-gray-400">
            {t({
              fr: "Rien reçu après une minute ? Jetez un œil à vos courriers indésirables.",
              en: "Nothing after a minute? Have a look at your spam folder.",
            })}
          </p>

          {/* Mock mode only (front-end dev without the service): stands in
              for clicking the real email link. Never rendered in real mode. */}
          {!usingRealApi && (
            <button
              type="button"
              onClick={onSimulateMagicLink}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-blue-300 px-5 py-2.5 font-inter text-[13px] font-semibold text-blue-600 transition-all duration-150 hover:bg-blue-100/60 dark:border-blue-500/40 dark:text-blue-400 dark:hover:bg-blue-500/[0.10]"
            >
              {t({
                fr: "Simuler le clic sur le lien (maquette)",
                en: "Simulate the link click (mockup)",
              })}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
