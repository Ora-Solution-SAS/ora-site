import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileSpreadsheet, Lock, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { DemoAutomation } from "./data";
import { formatFileSize } from "./demoApi";

type Props = {
  automation: DemoAutomation;
  file: File | null;
  onFile: (file: File | null) => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function extensionOf(name: string): string {
  const m = name.toLowerCase().match(/\.[^.]+$/);
  return m ? m[0] : "";
}

export default function DropZone({ automation, file, onFile }: Props) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Incremented on every rejected file to retrigger the shake animation.
  const [errorKey, setErrorKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const acceptsText = automation.accepts.join(", ");

  const tryAccept = (candidate: File | undefined | null) => {
    if (!candidate) return;
    if (!automation.accepts.includes(extensionOf(candidate.name))) {
      setError(
        t({
          fr: `Format non pris en charge. Formats acceptés : ${acceptsText}`,
          en: `Unsupported format. Accepted formats: ${acceptsText}`,
        })
      );
      setErrorKey((k) => k + 1);
      return;
    }
    setError(null);
    onFile(candidate);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={automation.accepts.join(",")}
        className="hidden"
        onChange={(e) => {
          tryAccept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {file ? (
          // ── Compact state: file accepted ────────────────────────────────
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto flex max-w-xl items-center gap-4 rounded-[24px] border border-teal-200/80 bg-teal-50/50 p-5 shadow-[0_22px_60px_-26px_rgba(15,23,42,0.26),0_3px_10px_-6px_rgba(15,23,42,0.10)] dark:border-teal-500/25 dark:bg-teal-500/[0.06] dark:shadow-none"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white">
              <FileSpreadsheet size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-inter text-[14.5px] font-semibold">{file.name}</p>
              <p className="font-inter text-[12.5px] text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)} · {t({ fr: "prêt à être traité", en: "ready to process" })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onFile(null)}
              aria-label={t({ fr: "Retirer le fichier", en: "Remove file" })}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.08] dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          // ── Drop area ───────────────────────────────────────────────────
          <motion.div
            key={`zone-${errorKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: errorKey ? [0, -9, 9, -6, 6, 0] : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mx-auto max-w-2xl"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                tryAccept(e.dataTransfer.files?.[0]);
              }}
              /* La page est entièrement blanche (client 2026-07-30) : sans
                 ombre, cette zone blanche sur fond blanc disparaissait. Une
                 ombre large et douce la décolle du fond, et elle se creuse au
                 survol puis au glisser pour accompagner le geste. */
              className={`relative cursor-pointer overflow-hidden rounded-[28px] border-2 border-dashed px-6 py-14 text-center transition-all duration-300
                ${
                  dragging
                    ? "scale-[1.015] border-[#3b82f6] bg-blue-50/70 shadow-[0_36px_90px_-24px_rgba(59,130,246,0.42),0_6px_18px_-8px_rgba(15,23,42,0.12)] dark:bg-blue-500/[0.08]"
                    : error
                      ? "border-red-300 bg-white shadow-[0_24px_60px_-24px_rgba(220,38,38,0.28),0_3px_10px_-6px_rgba(15,23,42,0.10)] dark:border-red-500/40 dark:bg-white/[0.02]"
                      : "border-gray-300/80 bg-white shadow-[0_26px_70px_-28px_rgba(15,23,42,0.26),0_3px_10px_-6px_rgba(15,23,42,0.10)] hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-[0_34px_84px_-26px_rgba(59,130,246,0.30),0_5px_14px_-7px_rgba(15,23,42,0.12)] dark:border-white/15 dark:bg-white/[0.02] dark:shadow-none dark:hover:border-blue-500/40 dark:hover:bg-blue-500/[0.04]"
                }`}
            >
              {/* Soft ambient glow behind the icon */}
              <div
                aria-hidden
                className={`pointer-events-none absolute left-1/2 top-10 h-32 w-64 -translate-x-1/2 rounded-full transition-opacity duration-300 ${dragging ? "opacity-100" : "opacity-60"}`}
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgba(59,130,246,0.16) 0%, transparent 75%)",
                }}
              />

              <motion.span
                animate={dragging ? { y: -6, scale: 1.06 } : { y: [0, -7, 0] }}
                transition={
                  dragging
                    ? { duration: 0.25, ease: EASE }
                    : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white shadow-[0_10px_30px_-8px_rgba(59,130,246,0.55)]"
              >
                <CloudUpload size={28} />
              </motion.span>

              <p className="mt-6 font-inter text-[17px] font-semibold">
                {dragging
                  ? t({ fr: "Déposez, on s'occupe du reste", en: "Drop it, we handle the rest" })
                  : t({ fr: "Glissez votre fichier ici", en: "Drag your file here" })}
              </p>
              <p className="mt-1 font-inter text-[13.5px] text-gray-500 dark:text-gray-400">
                {t({ fr: "ou cliquez pour le sélectionner", en: "or click to browse" })}
              </p>

              <span className="mt-5 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                {t({ fr: "Formats acceptés", en: "Accepted formats" })} : {acceptsText}
              </span>

              {error && (
                <p className="mt-4 font-inter text-[13px] font-medium text-red-500">✗ {error}</p>
              )}
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 font-inter text-[12.5px] text-gray-400 dark:text-gray-500">
              <Lock size={13} />
              {t({
                fr: "Votre fichier est traité puis supprimé immédiatement. Il n'est jamais stocké.",
                en: "Your file is processed then deleted immediately. It is never stored.",
              })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
