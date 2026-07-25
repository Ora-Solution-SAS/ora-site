import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, MousePointerClick, Zap } from "lucide-react";
import { useLang } from "@/lib/i18n";
import AutomationCarousel, { SelectedAutomationCard } from "@/components/demo/AutomationCarousel";
import DropZone from "@/components/demo/DropZone";
import LeadForm from "@/components/demo/LeadForm";
import RunView from "@/components/demo/RunView";
import DeliveryView from "@/components/demo/DeliveryView";
import { getAutomation } from "@/components/demo/data";
import {
  DemoApiError,
  createDemoJob,
  getJobStatus,
  type DemoJob,
  type DemoLead,
  type JobStatus,
} from "@/components/demo/demoApi";

// Online demo funnel (/demo). The visitor picks an automation in the
// carousel, drops a file, fills the progressive lead form, then the run
// starts while the magic-link email is sent; the download itself lives
// behind the magic link (/demo?ml=<job_id>), which doubles as the email
// verification.
//
// The page currently runs on the mocked API in components/demo/demoApi.ts;
// swapping to the real ora-demo-service backend only touches that module.

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: "home" | "politique-confidentialite") => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function readMagicLinkParam(): string | null {
  return new URLSearchParams(window.location.search).get("ml");
}

function StepBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
      {label}
    </span>
  );
}

export default function DemoPage({ theme, openBooking, onNavigate }: Props) {
  const { t } = useLang();
  const dk = theme === "dark";
  const bg = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";

  // Magic-link landing (delivery space) vs the funnel itself.
  const [mlJobId, setMlJobId] = useState<string | null>(() => readMagicLinkParam());

  const [phase, setPhase] = useState<"funnel" | "processing">("funnel");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<DemoApiError["code"] | null>(null);
  const [job, setJob] = useState<DemoJob | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);

  const formRef = useRef<HTMLElement>(null);

  const automation = getAutomation(selectedKey);

  const scrollToEl = (el: HTMLElement | null) => {
    if (!el) return;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.05 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollTop = () => {
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0 });
  };

  // Keep the delivery view in sync with browser back/forward on /demo?ml=...
  useEffect(() => {
    const onPop = () => setMlJobId(readMagicLinkParam());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (formOpen) {
      const id = setTimeout(() => scrollToEl(formRef.current), 80);
      return () => clearTimeout(id);
    }
  }, [formOpen]);

  // If the visitor switches automation, drop a file that is no longer valid.
  useEffect(() => {
    if (!automation || !file) return;
    const ext = (file.name.toLowerCase().match(/\.[^.]+$/) ?? [""])[0];
    if (!automation.accepts.includes(ext)) setFile(null);
  }, [automation, file]);

  // Poll the job while the processing screen is shown.
  useEffect(() => {
    if (phase !== "processing" || !job) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await getJobStatus(job.jobId);
        if (!cancelled) setStatus(s);
      } catch {
        // Network hiccup: keep the last status, the next tick retries.
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [phase, job]);

  const handleSubmit = async (lead: DemoLead) => {
    if (!file || !automation || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createDemoJob({ file, automationKey: automation.key, lead });
      setJob(created);
      setPhase("processing");
      scrollTop();
    } catch (err) {
      setSubmitError(err instanceof DemoApiError ? err.code : "network");
    } finally {
      setSubmitting(false);
    }
  };

  const openDelivery = (jobId: string) => {
    window.history.pushState({}, "", `/demo?ml=${jobId}`);
    setMlJobId(jobId);
    scrollTop();
  };

  const restart = () => {
    window.history.pushState({}, "", "/demo");
    setMlJobId(null);
    setPhase("funnel");
    setSelectedKey(null);
    setFile(null);
    setFormOpen(false);
    setJob(null);
    setStatus(null);
    scrollTop();
  };

  // ── Magic-link landing: the delivery space ────────────────────────────────
  if (mlJobId) {
    return (
      <div className="min-h-screen px-6 pb-24 pt-36 md:px-12" style={{ backgroundColor: bg }}>
        <DeliveryView jobId={mlJobId} openBooking={openBooking} onRestart={restart} />
      </div>
    );
  }

  // ── Processing screen: run in progress + "check your inbox" ──────────────
  if (phase === "processing" && job && automation) {
    return (
      <div className="min-h-screen px-6 pb-24 pt-36 md:px-12" style={{ backgroundColor: bg }}>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <StepBadge label={t({ fr: "Lancement réussi", en: "Run started" })} />
          <h1 className="mt-5 font-poppins text-[clamp(1.9rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em]">
            {t({ fr: "Ora travaille pour vous", en: "Ora is working for you" })}
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-inter text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Pendant que votre fichier est traité, confirmez votre adresse email : c'est là que tout se passe ensuite.",
              en: "While your file is being processed, confirm your email address: that is where everything happens next.",
            })}
          </p>
        </div>
        {status && (
          <RunView
            automation={automation}
            job={job}
            status={status}
            onSimulateMagicLink={() => openDelivery(job.jobId)}
          />
        )}
      </div>
    );
  }

  // ── The funnel ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      {/* HERO */}
      <section className="px-6 pb-16 pt-36 text-center md:px-12 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-poppins text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
            <span className="block">{t({ fr: "Testez Ora sur", en: "Try Ora on" })}</span>
            <span className="block text-brand-gradient">
              {t({ fr: "vos propres fichiers", en: "your own files" })}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl font-inter text-[15.5px] leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Choisissez une automatisation, déposez un fichier et récupérez le résultat en quelques minutes. Directement dans votre navigateur.",
              en: "Pick an automation, drop a file and get the result back in minutes. Right in your browser.",
            })}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { Icon: Lock, label: { fr: "Fichiers jamais stockés", en: "Files never stored" } },
              { Icon: MousePointerClick, label: { fr: "Sans installation", en: "No install needed" } },
              { Icon: Zap, label: { fr: "Résultat instantané", en: "Instant results" } },
            ].map(({ Icon, label }) => (
              <span
                key={label.en}
                className="inline-flex items-center gap-1.5 font-inter text-[13px] font-medium text-gray-500 dark:text-gray-400"
              >
                <Icon size={14} className="text-[#0d9488]" />
                {t(label)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS 1 + 2 share one stage: the carousel picks the automation, then
          collapses into a compact summary card with the drop zone below. */}
      <section className="px-6 py-16 md:px-12 md:py-20" style={{ backgroundColor: bgContrast }}>
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait" initial={false}>
            {!automation ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <StepBadge label={t({ fr: "Étape 1 · Choisissez", en: "Step 1 · Choose" })} />
                  <h2 className="mt-5 font-poppins text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                    {t({ fr: "Quelle tâche voulez-vous automatiser ?", en: "Which task should we automate?" })}
                  </h2>
                  <p className="mt-3 font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                    {t({
                      fr: "Découvrez quelques automatisations proposées par Ora.",
                      en: "Discover a few of the automations Ora offers.",
                    })}
                  </p>
                </div>
                <AutomationCarousel onSelect={setSelectedKey} />
              </motion.div>
            ) : (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="mx-auto mb-8 max-w-2xl text-center">
                  <StepBadge label={t({ fr: "Étape 2 · Déposez", en: "Step 2 · Drop" })} />
                  <h2 className="mt-5 font-poppins text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                    {t({ fr: "À vous de jouer", en: "Your turn" })}
                  </h2>
                </div>

                <SelectedAutomationCard
                  automation={automation}
                  onChange={() => {
                    setSelectedKey(null);
                    setFile(null);
                    setFormOpen(false);
                  }}
                />

                <div className="mt-8">
                  <DropZone automation={automation} file={file} onFile={setFile} />
                </div>

                {/* Launch button appears once a file is in */}
                <AnimatePresence>
                  {file && !formOpen && (
                    <motion.div
                      key="launch"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="mt-8 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => setFormOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-8 py-4 font-inter text-[15.5px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
                      >
                        {t({ fr: "Lancer l'automatisation", en: "Run the automation" })}
                        <ArrowRight size={17} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* STEP 3: progressive lead form */}
      <AnimatePresence>
        {automation && formOpen && (
          <motion.section
            ref={formRef}
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="px-6 pb-24 pt-16 md:px-12 md:pt-20"
            style={{ backgroundColor: bg }}
          >
            <div className="mx-auto max-w-4xl">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <StepBadge label={t({ fr: "Étape 3 · Dernière ligne droite", en: "Step 3 · Final stretch" })} />
                <h2 className="mt-5 font-poppins text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                  {t({ fr: "Dites-nous où envoyer le résultat", en: "Tell us where to send the result" })}
                </h2>
                <p className="mt-3 font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {t({
                    fr: "Votre compte démo se crée automatiquement, avec vos essais gratuits.",
                    en: "Your demo account is created automatically, with your free runs.",
                  })}
                </p>
              </div>

              <LeadForm
                submitting={submitting}
                onSubmit={handleSubmit}
                onOpenPrivacy={() => onNavigate("politique-confidentialite")}
              />

              {submitError && (
                <p className="mx-auto mt-5 max-w-xl text-center font-inter text-[13.5px] font-medium text-red-500">
                  ✗{" "}
                  {t(
                    submitError === "no_credits"
                      ? {
                          fr: "Vous avez utilisé vos 5 essais gratuits. Réservez un appel pour aller plus loin.",
                          en: "You have used your 5 free runs. Book a call to go further.",
                        }
                      : submitError === "file_too_large"
                        ? {
                            fr: "Fichier trop volumineux : 50 Mo maximum.",
                            en: "File too large: 50 MB maximum.",
                          }
                        : submitError === "rejected"
                          ? {
                              fr: "Le fichier n'a pas été accepté. Vérifiez le format et réessayez.",
                              en: "The file was not accepted. Check the format and try again.",
                            }
                          : {
                              fr: "Le service de démonstration est injoignable. Réessayez dans un instant.",
                              en: "The demo service is unreachable. Try again in a moment.",
                            }
                  )}
                </p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
