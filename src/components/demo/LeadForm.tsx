import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Localized } from "./data";
import type { DemoLead } from "./demoApi";

type Props = {
  submitting: boolean;
  onSubmit: (lead: DemoLead) => void;
  onOpenPrivacy: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export const TIME_OPTIONS: { key: string; label: Localized }[] = [
  { key: "lt1h", label: { fr: "Moins d'1 heure", en: "Under 1 hour" } },
  { key: "1to3h", label: { fr: "1 à 3 heures", en: "1 to 3 hours" } },
  { key: "halfday", label: { fr: "Une demi-journée", en: "Half a day" } },
  { key: "dayplus", label: { fr: "Une journée ou plus", en: "A day or more" } },
];

export const SECTOR_OPTIONS: { key: string; label: Localized }[] = [
  { key: "expertise-comptable", label: { fr: "Expertise comptable", en: "Accounting" } },
  { key: "audit", label: { fr: "Audit", en: "Audit" } },
  { key: "finance", label: { fr: "Finance / Investissement", en: "Finance / Investment" } },
  { key: "banque", label: { fr: "Banque d'affaires", en: "Investment banking" } },
  { key: "etudiant", label: { fr: "Étudiant", en: "Student" } },
  { key: "perso", label: { fr: "Utilisation personnelle", en: "Personal use" } },
  { key: "autre", label: { fr: "Autre", en: "Other" } },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inputClass =
  "w-full rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 font-inter text-[14.5px] text-[#111827] placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500/60";

const labelClass =
  "mb-1.5 block font-inter text-[13px] font-medium text-gray-600 dark:text-gray-400";

/** Wrapper animating each progressively revealed block (height + fade). */
function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="pt-5">{children}</div>
    </motion.div>
  );
}

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: Localized }[];
  value: string | null;
  onChange: (key: string) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-2 font-inter text-[13px] font-medium transition-all duration-150
              ${
                active
                  ? "border-blue-400 bg-blue-50/70 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/[0.12] dark:text-blue-300"
                  : "border-gray-200/80 bg-white text-gray-600 hover:-translate-y-px hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/[0.05]"
              }`}
          >
            {t(o.label)}
          </button>
        );
      })}
    </div>
  );
}

// The form reveals its fields progressively: names first, then email, then
// time spent (the four mandatory answers), then the optional block with the
// submit button. Once a stage has been revealed it stays visible, even if the
// visitor clears a field afterwards.
export default function LeadForm({ submitting, onSubmit, onOpenPrivacy }: Props) {
  const { t } = useLang();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [timeSpent, setTimeSpent] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState<string | null>(null);

  const namesDone = firstName.trim().length > 0 && lastName.trim().length > 0;
  const emailDone = EMAIL_RE.test(email.trim());
  const timeDone = timeSpent !== null;
  const allMandatoryDone = namesDone && emailDone && timeDone;

  // 1 = names, 2 = +email, 3 = +time spent, 4 = +optional fields and submit
  const [stage, setStage] = useState(1);
  useEffect(() => {
    if (namesDone && stage < 2) setStage(2);
    if (namesDone && emailDone && stage < 3) setStage(3);
    if (namesDone && emailDone && timeDone && stage < 4) setStage(4);
  }, [namesDone, emailDone, timeDone, stage]);

  const submit = () => {
    if (!allMandatoryDone || submitting) return;
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      timeSpent: timeSpent!,
      phone: phone.trim() || undefined,
      sector: sector ?? undefined,
    });
  };

  return (
    <form
      className="mx-auto max-w-xl rounded-[24px] border border-gray-200/60 bg-white p-7 shadow-[0_20px_60px_-10px_rgba(96,165,250,0.14),0_8px_24px_-8px_rgba(96,165,250,0.08)] dark:border-white/[0.06] dark:bg-white/[0.02] md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Stage 1: first and last name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="demo-firstname" className={labelClass}>
            {t({ fr: "Prénom", en: "First name" })}
          </label>
          <input
            id="demo-firstname"
            className={inputClass}
            autoComplete="given-name"
            placeholder={t({ fr: "Marie", en: "Jane" })}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="demo-lastname" className={labelClass}>
            {t({ fr: "Nom", en: "Last name" })}
          </label>
          <input
            id="demo-lastname"
            className={inputClass}
            autoComplete="family-name"
            placeholder={t({ fr: "Dupont", en: "Doe" })}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {/* Stage 2: email */}
        {stage >= 2 && (
          <Reveal key="email">
            <label htmlFor="demo-email" className={labelClass}>
              {t({ fr: "Email professionnel", en: "Work email" })}
            </label>
            <input
              id="demo-email"
              type="email"
              className={inputClass}
              autoComplete="email"
              placeholder={t({ fr: "marie@cabinet.fr", en: "jane@firm.com" })}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-1.5 font-inter text-[12px] text-gray-400 dark:text-gray-500">
              {t({
                fr: "Vous y recevrez le lien de téléchargement de votre fichier.",
                en: "You will receive the download link for your file there.",
              })}
            </p>
          </Reveal>
        )}

        {/* Stage 3: time normally spent on this task */}
        {stage >= 3 && (
          <Reveal key="time">
            <span className={labelClass}>
              {t({
                fr: "Temps passé habituellement sur cette tâche",
                en: "Time you usually spend on this task",
              })}
            </span>
            <ChipSelect options={TIME_OPTIONS} value={timeSpent} onChange={setTimeSpent} />
          </Reveal>
        )}

        {/* Stage 4: optional fields + submit */}
        {stage >= 4 && (
          <Reveal key="optional">
            <div className="border-t border-gray-100 pt-5 dark:border-white/[0.06]">
              <p className="mb-4 font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                {t({ fr: "Facultatif", en: "Optional" })}
              </p>

              <label htmlFor="demo-phone" className={labelClass}>
                {t({ fr: "Téléphone", en: "Phone" })}
              </label>
              <input
                id="demo-phone"
                type="tel"
                className={inputClass}
                autoComplete="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <span className={`${labelClass} mt-4`}>
                {t({ fr: "Secteur d'activité", en: "Industry" })}
              </span>
              <ChipSelect options={SECTOR_OPTIONS} value={sector} onChange={setSector} />
            </div>

            <button
              type="submit"
              disabled={!allMandatoryDone || submitting}
              className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 font-inter text-[15px] font-semibold text-white transition-all duration-150
                ${
                  allMandatoryDone && !submitting
                    ? "bg-[#3b82f6] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
                    : "cursor-not-allowed bg-gray-300 dark:bg-white/10"
                }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t({ fr: "Envoi du fichier", en: "Uploading file" })}
                </>
              ) : (
                <>
                  {t({ fr: "Lancer maintenant", en: "Run it now" })}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="mt-4 text-center font-inter text-[11.5px] leading-relaxed text-gray-400 dark:text-gray-500">
              {t({
                fr: "En lançant l'automatisation, vous acceptez notre ",
                en: "By running the automation, you accept our ",
              })}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="underline underline-offset-2 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                {t({ fr: "politique de confidentialité", en: "privacy policy" })}
              </button>
              {t({
                fr: ". Votre fichier est traité puis supprimé, jamais stocké.",
                en: ". Your file is processed then deleted, never stored.",
              })}
            </p>
          </Reveal>
        )}
      </AnimatePresence>
    </form>
  );
}
