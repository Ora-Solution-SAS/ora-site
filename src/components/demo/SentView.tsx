import { useState } from "react";
import { motion } from "framer-motion";
import { MailCheck, RefreshCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { CREDITS_TOTAL, usingRealApi } from "./demoApi";

type Props = {
  email: string;
  creditsLeft: number;
  /** Re-sends the magic link (idempotent claim with the same email). */
  onResend: () => Promise<void>;
  /** Mock only: stands in for clicking the real email link. */
  onSimulateMagicLink: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Shown right after the form popup is submitted: the magic-link email is on
// its way, the download happens behind it.
export default function SentView({ email, creditsLeft, onResend, onSimulateMagicLink }: Props) {
  const { t } = useLang();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative mx-auto max-w-xl overflow-hidden rounded-[24px] border border-blue-200/70 bg-blue-50/50 p-8 text-center dark:border-blue-500/25 dark:bg-blue-500/[0.06]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(59,130,246,0.18) 0%, transparent 75%)",
        }}
      />
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white shadow-[0_10px_30px_-8px_rgba(59,130,246,0.5)]">
        <MailCheck size={26} />
      </span>

      <h2 className="mt-5 font-poppins text-[24px] font-semibold tracking-[-0.03em]">
        {t({ fr: "Vérifiez votre boîte mail", en: "Check your inbox" })}
      </h2>
      <p className="mx-auto mt-2 max-w-md font-inter text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-300">
        {t({ fr: "Nous venons d'envoyer un lien sécurisé à ", en: "We just sent a secure link to " })}
        <span className="font-semibold text-[#111827] dark:text-white">{email}</span>
        {t({
          fr: ". Cliquez-le pour vérifier votre adresse et télécharger votre fichier.",
          en: ". Click it to verify your address and download your file.",
        })}
      </p>
      <p className="mt-3 font-inter text-[12.5px] text-gray-500 dark:text-gray-400">
        {t({
          fr: "Rien reçu après une minute ? Jetez un œil à vos courriers indésirables.",
          en: "Nothing after a minute? Have a look at your spam folder.",
        })}
      </p>

      <p className="mt-5 font-inter text-[13px] text-gray-600 dark:text-gray-300">
        {t({ fr: "Il vous reste ", en: "You have " })}
        <span className="font-semibold">{creditsLeft}</span>
        {t({
          fr: ` fichiers offerts sur ${CREDITS_TOTAL}.`,
          en: ` free files left out of ${CREDITS_TOTAL}.`,
        })}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={resending || resent}
          onClick={async () => {
            setResending(true);
            try {
              await onResend();
              setResent(true);
            } finally {
              setResending(false);
            }
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-inter text-[13px] font-semibold transition-all duration-150 ${
            resent
              ? "cursor-default border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400"
              : "border-gray-300 text-gray-600 hover:border-[#3b82f6] hover:text-[#3b82f6] dark:border-white/20 dark:text-gray-300"
          }`}
        >
          <RefreshCcw size={13} className={resending ? "animate-spin" : ""} />
          {resent
            ? t({ fr: "Email renvoyé", en: "Email resent" })
            : t({ fr: "Renvoyer l'email", en: "Resend the email" })}
        </button>

        {/* Mock mode only (front-end dev without the service). */}
        {!usingRealApi && (
          <button
            type="button"
            onClick={onSimulateMagicLink}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-blue-300 px-5 py-2.5 font-inter text-[13px] font-semibold text-blue-600 transition-all duration-150 hover:bg-blue-100/60 dark:border-blue-500/40 dark:text-blue-400 dark:hover:bg-blue-500/[0.10]"
          >
            {t({
              fr: "Simuler le clic sur le lien (maquette)",
              en: "Simulate the link click (mockup)",
            })}
          </button>
        )}
      </div>
    </motion.div>
  );
}
