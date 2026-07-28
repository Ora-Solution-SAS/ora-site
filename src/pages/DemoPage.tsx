import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Download, Lock, MousePointerClick, RefreshCcw, Zap } from "lucide-react";
import { useLang } from "@/lib/i18n";
import AutomationCarousel, { SelectedAutomationCard } from "@/components/demo/AutomationCarousel";
import DropZone from "@/components/demo/DropZone";
import FormModal from "@/components/demo/FormModal";
import PreviewWindow from "@/components/demo/PreviewWindow";
import RunView from "@/components/demo/RunView";
import SentView from "@/components/demo/SentView";
import DeliveryView from "@/components/demo/DeliveryView";
import { getAutomation } from "@/components/demo/data";
import {
  DemoApiError,
  claimDemoJob,
  createDemoJob,
  getJobPreview,
  getJobStatus,
  type DemoJob,
  type DemoLead,
  type JobStatus,
  type PreviewData,
} from "@/components/demo/demoApi";

// Online demo funnel (/demo), preview-first flow:
//   pick automation -> drop file -> anonymous run -> Excel-window preview
//   -> "download" opens the lead form popup (claim: credit + magic link)
//   -> check-your-inbox -> magic link -> delivery (/demo?ml=<job_id>).
//
// The page talks to ora-demo-service (or its browser mock, see demoApi.ts).

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

/** Horizontal 3-step trail (Choose · Drop · Download) shown at the top of the
 *  funnel stage — replaces the isolated "Étape N" badge so the visitor sees
 *  the WHOLE journey and where they stand in it (layout redesign 2026-07-28). */
function StepTrail({ active, labels }: { active: 1 | 2 | 3; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < active;
        const current = n === active;
        return (
          <div key={label} className="flex items-center gap-3 md:gap-4">
            {i > 0 && (
              <span
                aria-hidden
                className={`h-px w-8 md:w-14 ${done || current ? "bg-blue-300 dark:bg-blue-500/50" : "bg-gray-200 dark:bg-white/10"}`}
              />
            )}
            <span className="inline-flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-inter text-[12px] font-semibold transition-colors ${
                  current
                    ? "bg-[#3b82f6] text-white shadow-[0_2px_10px_rgba(59,130,246,0.35)]"
                    : done
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      : "border border-gray-300 text-gray-400 dark:border-white/20 dark:text-gray-500"
                }`}
              >
                {n}
              </span>
              <span
                className={`font-inter text-[13px] font-semibold ${
                  current ? "text-[#111827] dark:text-white" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DemoPage({ theme, openBooking, onNavigate }: Props) {
  const { t } = useLang();
  const dk = theme === "dark";
  const bg = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";

  // Magic-link landing (delivery space) vs the funnel itself.
  const [mlJobId, setMlJobId] = useState<string | null>(() => readMagicLinkParam());

  const [phase, setPhase] = useState<"funnel" | "processing" | "preview" | "sent">("funnel");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [job, setJob] = useState<DemoJob | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [lead, setLead] = useState<DemoLead | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number>(0);

  const previewFetched = useRef(false);
  const automation = getAutomation(selectedKey);

  const scrollTop = useCallback(() => {
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0 });
  }, []);

  // Keep the delivery view in sync with browser back/forward on /demo?ml=...
  useEffect(() => {
    const onPop = () => setMlJobId(readMagicLinkParam());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // The magic-link redirect appends the Supabase session as a URL fragment
  // (#access_token=...). It is not used yet: scrub it so the token never
  // lingers in the address bar or browser history. When download-auth
  // enforcement lands, capture the session here before scrubbing.
  useEffect(() => {
    if (mlJobId && window.location.hash.includes("access_token")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.search
      );
    }
  }, [mlJobId]);

  // If the visitor switches automation, drop a file that is no longer valid.
  useEffect(() => {
    if (!automation || !file) return;
    const ext = (file.name.toLowerCase().match(/\.[^.]+$/) ?? [""])[0];
    if (!automation.accepts.includes(ext)) setFile(null);
  }, [automation, file]);

  // Poll the job while processing; swap to the preview once it completes.
  useEffect(() => {
    if (phase !== "processing" || !job) return;
    let cancelled = false;
    let timer: number | undefined;
    const tick = async () => {
      try {
        const s = await getJobStatus(job.jobId);
        if (cancelled) return;
        setStatus(s);
        if (s.status === "done") {
          if (s.previewReady && !previewFetched.current) {
            previewFetched.current = true;
            try {
              const p = await getJobPreview(job.jobId);
              if (!cancelled) setPreview(p);
            } catch {
              // Preview unavailable: the fallback card still allows claiming.
            }
          }
          if (!cancelled) {
            setPhase("preview");
            scrollTop();
          }
          return;
        }
        if (s.status === "running") timer = window.setTimeout(tick, 800);
      } catch {
        if (!cancelled) timer = window.setTimeout(tick, 2000);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [phase, job, scrollTop]);

  const handleLaunch = async () => {
    if (!file || !automation || launching) return;
    setLaunching(true);
    setLaunchError(null);
    try {
      const created = await createDemoJob({ file, automationKey: automation.key });
      previewFetched.current = false;
      setPreview(null);
      setJob(created);
      setStatus(null);
      setPhase("processing");
      scrollTop();
    } catch (err) {
      if (err instanceof DemoApiError && err.code === "rate_limited") {
        setLaunchError(t({
          fr: "Limite d'essais atteinte pour aujourd'hui depuis votre connexion. Revenez demain, ou réservez une démo complète.",
          en: "Daily trial limit reached from your connection. Come back tomorrow, or book a full demo.",
        }));
      } else if (err instanceof DemoApiError && err.code === "file_too_large") {
        setLaunchError(t({
          fr: "Fichier trop volumineux (50 Mo maximum).",
          en: "File too large (50 MB max).",
        }));
      } else {
        setLaunchError(t({
          fr: "Le service de démonstration est injoignable. Réessayez dans un instant.",
          en: "The demo service is unreachable. Try again in a moment.",
        }));
      }
    } finally {
      setLaunching(false);
    }
  };

  const handleClaim = async (submitted: DemoLead) => {
    if (!job || claiming) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await claimDemoJob(job.jobId, submitted);
      setLead(submitted);
      setCreditsLeft(res.creditsLeft);
      setModalOpen(false);
      setPhase("sent");
      scrollTop();
    } catch (err) {
      if (err instanceof DemoApiError && err.code === "no_credits") {
        setClaimError(t({
          fr: "Cette adresse a épuisé ses 5 fichiers offerts. Réservez une démo pour aller plus loin.",
          en: "This address has used its 5 free files. Book a demo to go further.",
        }));
      } else {
        setClaimError(t({
          fr: "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.",
          en: "Submission failed. Check your connection and try again.",
        }));
      }
    } finally {
      setClaiming(false);
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
    setLaunchError(null);
    setJob(null);
    setStatus(null);
    setPreview(null);
    setModalOpen(false);
    setClaimError(null);
    setLead(null);
    previewFetched.current = false;
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

  // ── Processing screen: anonymous run in progress ──────────────────────────
  if (phase === "processing" && job && automation) {
    const failed = status?.status === "error";
    return (
      <div className="min-h-screen px-6 pb-24 pt-36 md:px-12" style={{ backgroundColor: bg }}>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <StepBadge label={t({ fr: "Lancement réussi", en: "Run started" })} />
          <h1 className="mt-5 font-poppins text-[clamp(1.9rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em]">
            {t({ fr: "Ora travaille pour vous", en: "Ora is working for you" })}
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-inter text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Quelques instants : l'aperçu de votre fichier s'affichera automatiquement.",
              en: "A few moments: the preview of your file will appear automatically.",
            })}
          </p>
        </div>
        {status && <RunView automation={automation} job={job} status={status} />}
        {failed && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-7 py-3.5 font-inter text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] active:translate-y-0"
            >
              <RefreshCcw size={16} />
              {t({ fr: "Réessayer avec un autre fichier", en: "Try again with another file" })}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Preview: the Excel window + the download CTA ──────────────────────────
  if (phase === "preview" && job && automation) {
    return (
      <div className="min-h-screen px-6 pb-24 pt-36 md:px-12" style={{ backgroundColor: bg }}>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <StepBadge label={t({ fr: "Traitement terminé", en: "Run complete" })} />
          <h1 className="mt-5 font-poppins text-[clamp(1.9rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em]">
            {t({ fr: "Votre fichier est prêt", en: "Your file is ready" })}
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-inter text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Parcourez l'aperçu ci-dessous, feuille par feuille. Le fichier complet (tableaux croisés dynamiques vivants, graphiques natifs, formules) vous attend au téléchargement.",
              en: "Browse the preview below, sheet by sheet. The full file (live pivot tables, native charts, formulas) awaits at download.",
            })}
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <PreviewWindow preview={preview} />
            </motion.div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[24px] border border-gray-200/60 bg-white p-10 text-center dark:border-white/[0.06] dark:bg-white/[0.02]">
              <p className="font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                {t({
                  fr: "L'aperçu n'est pas disponible pour ce fichier, mais votre résultat est bien prêt au téléchargement.",
                  en: "No preview is available for this file, but your result is ready to download.",
                })}
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setClaimError(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-8 py-4 font-inter text-[15.5px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
            >
              <Download size={17} />
              {t({ fr: "Télécharger le fichier complet", en: "Download the full file" })}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 font-inter text-[12.5px] text-gray-400 dark:text-gray-500">
              <Lock size={13} />
              {t({
                fr: "Gratuit : 5 fichiers offerts par adresse email, lien envoyé par email.",
                en: "Free: 5 files per email address, link sent by email.",
              })}
            </p>
          </div>
        </div>

        <FormModal
          open={modalOpen}
          submitting={claiming}
          error={claimError}
          onClose={() => setModalOpen(false)}
          onSubmit={handleClaim}
          onOpenPrivacy={() => onNavigate("politique-confidentialite")}
        />
      </div>
    );
  }

  // ── Email sent: the magic link gates the download ─────────────────────────
  if (phase === "sent" && job && lead) {
    return (
      <div className="min-h-screen px-6 pb-24 pt-36 md:px-12" style={{ backgroundColor: bg }}>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <StepBadge label={t({ fr: "Dernière étape", en: "Final step" })} />
          <h1 className="mt-5 font-poppins text-[clamp(1.9rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em]">
            {t({ fr: "Votre fichier arrive", en: "Your file is on its way" })}
          </h1>
        </div>
        <SentView
          email={lead.email}
          creditsLeft={creditsLeft}
          onResend={async () => {
            await claimDemoJob(job.jobId, lead);
          }}
          onSimulateMagicLink={() => openDelivery(job.jobId)}
        />
      </div>
    );
  }

  // ── The funnel ────────────────────────────────────────────────────────────
  const stepLabels = [
    t({ fr: "Choisissez", en: "Choose" }),
    t({ fr: "Déposez", en: "Drop" }),
    t({ fr: "Téléchargez", en: "Download" }),
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      {/* HERO — compact (layout redesign 2026-07-28) : the headline block is
          tightened so the automation picker is visible without scrolling; the
          whole journey is announced by the 3-step trail just below. */}
      <section className="px-6 pb-10 pt-32 text-center md:px-12 md:pb-12 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            {t({ fr: "Démo interactive", en: "Interactive demo" })}
          </span>
          <h1 className="mt-5 font-poppins text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
            {t({ fr: "Testez Ora sur ", en: "Try Ora on " })}
            <span className="text-brand-gradient whitespace-nowrap">
              {t({ fr: "vos propres fichiers", en: "your own files" })}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl font-inter text-[15.5px] leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Choisissez une automatisation, déposez un fichier et regardez le résultat en quelques instants. Directement dans votre navigateur.",
              en: "Pick an automation, drop a file and see the result in moments. Right in your browser.",
            })}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
          collapses into a compact summary card with the drop zone below. The
          step trail on top tracks the visitor through the whole journey. */}
      <section className="px-6 pb-16 pt-10 md:px-12 md:pb-20 md:pt-12" style={{ backgroundColor: bgContrast }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 md:mb-12">
            <StepTrail active={automation ? 2 : 1} labels={stepLabels} />
          </div>
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
                  <h2 className="font-poppins text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                    {t({ fr: "Quelle tâche voulez-vous ", en: "Which task should we " })}
                    <span className="whitespace-nowrap">{t({ fr: "automatiser ?", en: "automate?" })}</span>
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
                  <h2 className="font-poppins text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                    {t({ fr: "À vous de jouer", en: "Your turn" })}
                  </h2>
                </div>

                <SelectedAutomationCard
                  automation={automation}
                  onChange={() => {
                    setSelectedKey(null);
                    setFile(null);
                    setLaunchError(null);
                  }}
                />

                <div className="mt-8">
                  <DropZone automation={automation} file={file} onFile={setFile} />
                </div>

                {/* Launch: the run starts anonymously, the form comes at
                    download time, after the preview. */}
                <AnimatePresence>
                  {file && (
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
                        disabled={launching}
                        onClick={handleLaunch}
                        className={`inline-flex items-center gap-2 rounded-full px-8 py-4 font-inter text-[15.5px] font-semibold text-white transition-all duration-150 ${
                          launching
                            ? "cursor-wait bg-[#3b82f6]/70"
                            : "bg-[#3b82f6] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
                        }`}
                      >
                        {launching
                          ? t({ fr: "Envoi du fichier...", en: "Uploading..." })
                          : t({ fr: "Lancer l'automatisation", en: "Run the automation" })}
                        <ArrowRight size={17} />
                      </button>
                      {launchError && (
                        <p className="mx-auto mt-4 max-w-md font-inter text-[13px] font-medium text-red-500">
                          ✗ {launchError}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
