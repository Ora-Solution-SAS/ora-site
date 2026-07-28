import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import LeadForm from "./LeadForm";
import type { DemoLead } from "./demoApi";

type Props = {
  open: boolean;
  submitting: boolean;
  /** Localized error shown above the form (e.g. no credits left). */
  error?: string | null;
  onClose: () => void;
  onSubmit: (lead: DemoLead) => void;
  onOpenPrivacy: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

// The lead form as a popup over the preview: filling it is what unlocks the
// full file (credit consumption + magic-link email happen on submit).
export default function FormModal({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
  onOpenPrivacy,
}: Props) {
  const { t } = useLang();

  // Freeze the page scroll (Lenis) while the modal is open.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as any).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-gray-950/50 px-4 py-10 backdrop-blur-sm md:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t({ fr: "Fermer", en: "Close" })}
              className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:text-gray-800 dark:border-white/10 dark:bg-[#1c2537] dark:text-gray-300"
            >
              <X size={16} />
            </button>

            <div className="mb-4 rounded-[24px] bg-transparent text-center">
              <h3 className="font-poppins text-[24px] font-semibold tracking-[-0.03em] text-white">
                {t({ fr: "Recevez votre fichier complet", en: "Get your full file" })}
              </h3>
              <p className="mx-auto mt-1.5 max-w-md font-inter text-[13.5px] leading-relaxed text-gray-200">
                {t({
                  fr: "Votre compte démo se crée automatiquement, avec 5 fichiers offerts. Le lien de téléchargement arrive par email.",
                  en: "Your demo account is created automatically, with 5 free files. The download link arrives by email.",
                })}
              </p>
            </div>

            {error && (
              <p className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center font-inter text-[13px] font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                ✗ {error}
              </p>
            )}

            <LeadForm
              submitting={submitting}
              onSubmit={onSubmit}
              onOpenPrivacy={onOpenPrivacy}
              submitLabel={{ fr: "Recevoir mon fichier", en: "Get my file" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
