import { forwardRef, useRef, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowRight, Volume2, VolumeX, RotateCcw, ChevronDown, ShieldCheck, FileText } from "lucide-react";
import { AnimatedHeroTitle } from "./ui/animated-hero";
import { useLang } from "@/lib/i18n";

/* ── CSS ─────────────────────────────────────────────────────── */
const heroCSS = `
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-stagger { opacity: 0; }
.hero-ready .hero-stagger {
  animation: heroFadeUp 0.9s cubic-bezier(.22,1,.36,1) forwards;
}
.hero-d0 { animation-delay:   0ms; }
.hero-d1 { animation-delay:  60ms; }
.hero-d2 { animation-delay: 180ms; }
.hero-d3 { animation-delay: 310ms; }
.hero-d4 { animation-delay: 440ms; }
.hero-d5 { animation-delay: 570ms; }

@media (prefers-reduced-motion: reduce) {
  .hero-stagger { animation: none !important; opacity: 1 !important; }
  .reveal        { opacity: 1 !important; transform: none !important; }
}

.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 800ms cubic-bezier(.22,1,.36,1),
              transform 800ms cubic-bezier(.22,1,.36,1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* Browser chrome frame */
.browser-frame {
  background: #f0f0f0;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.10),
    0 8px 24px rgba(0,0,0,0.05),
    0 0 0 1px rgba(0,0,0,0.04);
  overflow: hidden;
}
.browser-chrome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.browser-dots  { display: flex; gap: 6px; flex-shrink: 0; }
.browser-dot   { width: 11px; height: 11px; border-radius: 50%; }
.browser-dot-red   { background: #ff5f57; }
.browser-dot-amber { background: #febc2e; }
.browser-dot-green { background: #28c840; }

.browser-urlbar {
  flex: 1;
  height: 24px;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #9ca3af;
  font-family: Inter, sans-serif;
  max-width: 240px;
  margin: 0 auto;
}
`;

/* ── Types ───────────────────────────────────────────────────── */
interface HeroProps {
  theme: "light" | "dark";
  scrollToSection: (id: string) => void;
  openBooking: () => void;
}

/* ── Hero trust-row assets ───────────────────────────────────────
 *  "Fonctionne avec" integration logos, shown as an overlapping circle
 *  stack (Excel in front). google-sheets.png / google-docs.png are not
 *  in public/logos/ yet — until they are added, their circle hides itself
 *  via the <img> onError handler (no broken-image icon). */
const INTEGRATIONS = [
  { name: "Excel", src: "/logos/excel-new.png" },
  { name: "PDF", src: "/logos/pdf.avif" },
  { name: "Apple Numbers", src: "/logos/numbers.svg" },
  { name: "Google Sheets", src: "/logos/google-sheets.png" },
  { name: "Google Docs", src: "/logos/google-docs.png" },
];

/* Small CSS Swiss flag (red rounded square + white cross). No asset needed,
   stays crisp at any size. Used in the "Hébergement Suisse" trust signal. */
function SwissFlag() {
  return (
    <span aria-hidden className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d52b1e] ring-1 ring-black/5 shadow-sm">
      <span className="absolute left-1/2 top-1/2 h-4 w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-white" />
      <span className="absolute left-1/2 top-1/2 h-[5px] w-4 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-white" />
    </span>
  );
}

function EuFlag() {
  return (
    <span aria-hidden className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#003399] ring-1 ring-black/5 shadow-sm">
      <svg viewBox="0 0 32 32" className="h-full w-full">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          const r = 9.5;
          return <circle key={i} cx={16 + r * Math.cos(a)} cy={16 + r * Math.sin(a)} r={1.35} fill="#ffcc00" />;
        })}
      </svg>
    </span>
  );
}

/* One logo in the "Fonctionne avec" stack. If its image is missing (file not
   added yet), it falls back to a visible neutral circle so the slot stays in
   view — drop the real logo into public/logos/ and it upgrades automatically. */
function IntegrationCircle({
  name, src, front, style,
}: { name: string; src: string; front: boolean; style?: CSSProperties }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      title={name}
      style={style}
      className={`relative flex items-center justify-center rounded-full bg-white dark:bg-[#1a2332] ${
        front
          ? "h-14 w-14 ring-1 ring-gray-200 dark:ring-white/15 shadow-lg"
          : "h-10 w-10 ring-1 ring-gray-200/70 dark:ring-white/10 shadow-sm"
      }`}
    >
      {failed ? (
        <FileText aria-hidden className={`text-gray-300 dark:text-gray-600 ${front ? "h-6 w-6" : "h-4 w-4"}`} />
      ) : (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className={`object-contain ${front ? "h-7 w-7" : "h-5 w-5"}`}
        />
      )}
    </span>
  );
}

/* Web3Forms public access key for the hero callback form. Free key from
   https://web3forms.com — leads land in the inbox tied to that key. Either
   set VITE_WEB3FORMS_KEY in a .env file, or replace the placeholder below. */
const WEB3FORMS_ACCESS_KEY =
  (import.meta.env as Record<string, string | undefined>).VITE_WEB3FORMS_KEY ||
  "YOUR_WEB3FORMS_ACCESS_KEY";

/* Availability badge → click opens a quick callback capture (email or phone,
   delivered via Web3Forms) plus a direct "book a meeting" path to Cal.com. */
function CallbackBadge({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the panel on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const contact = value.trim();
    if (!contact || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "Nouvelle demande de rappel — site Ora",
          from_name: "Site Ora",
          contact,
          message: `Demande de rappel rapide. Coordonnées : ${contact}`,
        }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      setStatus(data.success ? "ok" : "error");
      if (data.success) setValue("");
    } catch {
      setStatus("error");
    }
  };

  return (
    // z-50 lifts the badge + its panel above the animated title spans, whose
    // transforms create stacking contexts that would otherwise paint over the
    // panel (the title text was showing through it).
    <div ref={wrapRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-inter font-medium text-gray-700 dark:text-gray-300 backdrop-blur-sm transition-colors hover:border-gray-300 dark:hover:border-white/20"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {t({ fr: "On vous rappelle en moins d'1 heure", en: "We call you back within the hour" })}
        <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[300px] -translate-x-1/2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] p-4 text-left shadow-xl">
          {status === "ok" ? (
            <div className="py-2 text-center">
              <p className="font-poppins font-semibold text-sm text-gray-900 dark:text-white">
                {t({ fr: "C'est noté, on vous rappelle vite.", en: "Got it, we'll call you shortly." })}
              </p>
              <p className="font-inter mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                {t({ fr: "En général en moins d'une heure.", en: "Usually within the hour." })}
              </p>
            </div>
          ) : (
            <>
              <p className="font-inter text-[13px] leading-snug text-gray-600 dark:text-gray-300">
                {t({ fr: "Laissez votre email ou téléphone, on vous rappelle.", en: "Leave your email or phone, we'll call you back." })}
              </p>
              <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t({ fr: "Email ou téléphone", en: "Email or phone" })}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/[0.03] px-3 py-2 text-[14px] font-inter text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center justify-center rounded-lg bg-[#3b82f6] px-4 py-2 text-[14px] font-inter font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:opacity-60"
                >
                  {status === "sending"
                    ? t({ fr: "Envoi...", en: "Sending..." })
                    : t({ fr: "Être rappelé", en: "Get a callback" })}
                </button>
                {status === "error" && (
                  <p className="font-inter text-[12px] text-red-500">
                    {t({ fr: "Une erreur est survenue. Réessayez.", en: "Something went wrong. Please try again." })}
                  </p>
                )}
              </form>

              <div className="my-3 flex items-center gap-3 text-[12px] text-gray-400">
                <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                {t({ fr: "ou", en: "or" })}
                <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              </div>

              <button
                type="button"
                onClick={() => { setOpen(false); openBooking(); }}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-white/15 px-4 py-2 text-[14px] font-inter font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06]"
              >
                {t({ fr: "Prendre un rendez-vous", en: "Book a meeting" })}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────── */
const Hero = forwardRef<HTMLElement, HeroProps>(
  ({ scrollToSection, openBooking }, ref) => {
    const { t } = useLang();

    /* ── Mount animation ── */
    const [heroReady, setHeroReady] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setHeroReady(true)); }, []);

    /* ────────────────────────────────────────────────────────────── *
     *  Hero video — autoplay with user controls
     *  ──────────────────────────────────────────────────────────── *
     *  We try to autoplay WITH sound first. If the browser blocks it
     *  (most cases, due to autoplay policy), we fall back to muted
     *  and update the UI so the top-right button reflects the state.
     *  Two gates can pause the video:
     *    • isVisible        — is the video ≥30% in viewport?
     *    • isManuallyPaused — did the user click to pause? */
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    // The video plays once (no loop). When it finishes we surface a replay
    // button instead of looping it back automatically.
    const [hasEnded, setHasEnded] = useState(false);

    // Trim just the very start of the clip (the awkward first instant) while
    // still showing the beginning of the animation. Tweak this single value to
    // cut more or less. The clip still ends at its natural end.
    const VIDEO_START = 0.5;

    // Track visibility
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      const observer = new IntersectionObserver(
        ([entry]) =>
          setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.3),
        { threshold: [0, 0.3, 0.6, 1] },
      );
      observer.observe(video);
      return () => observer.disconnect();
    }, []);

    // Coordination — try to autoplay with sound. If the browser
    // blocks it, fall back to muted and sync the UI state.
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const shouldPlay = isVisible && !isManuallyPaused && !hasEnded;

      if (shouldPlay && video.paused) {
        video.muted = isMuted;
        video.play().catch(() => {
          // Autoplay-with-sound blocked → retry muted
          if (!video.muted) {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          }
        });
      } else if (!shouldPlay && !video.paused) {
        video.pause();
      }
    // isMuted is intentionally excluded — toggleMute handles user-driven
    // mute changes directly on the element (no re-render needed).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, isManuallyPaused, hasEnded]);

    // Restart the video from the beginning (used by the replay button and by
    // clicking the video once it has finished).
    const replay = () => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = VIDEO_START;
      setHasEnded(false);
      setIsManuallyPaused(false);
      video.play().catch(() => {});
    };

    const togglePlayPause = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.ended || hasEnded) {
        replay();
        return;
      }
      if (video.paused) {
        setIsManuallyPaused(false);
        video.play().catch(() => {});
      } else {
        setIsManuallyPaused(true);
        video.pause();
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      const next = !video.muted;
      video.muted = next;
      setIsMuted(next);
    };

    /* ══════════════════════════════════════════════════════════ */
    return (
      <>
        <style>{heroCSS}</style>

        <section
          ref={ref}
          id="hero"
          className={`relative${heroReady ? " hero-ready" : ""}`}
        >
          {/* Background blobs — overflow-hidden ici pour clipper les cercles hors-section */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute inset-0 bg-white dark:bg-[#111827]" />
            <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)", filter: "blur(60px)" }} />
            <div className="absolute top-1/2 -left-20 w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(13,148,136,0.06) 0%,transparent 60%)", filter: "blur(60px)" }} />
          </div>

          {/* ═══ SECTION 1 — above the fold ═══ */}
          <div className="relative z-10 pt-28 md:pt-32 lg:pt-36 pb-16 md:pb-24">
            <div className="max-w-6xl mx-auto px-6 lg:px-10 text-center">

              <AnimatedHeroTitle />

              <p className="hero-stagger hero-d2 mt-8 md:mt-9 text-[clamp(1rem,2vw,1.175rem)] leading-[1.75] text-gray-500 dark:text-gray-400 font-inter max-w-2xl mx-auto">
                {t({
                  fr: "Ora exécute votre travail Excel et PDF en local, chiffré et tracé, par-dessus vos fichiers existants. Vos données confidentielles restent chez vous, en Europe.",
                  en: "Ora runs your Excel and PDF work locally, encrypted and audit-trailed, on top of your existing files. Your confidential data stays with you, in Europe.",
                })}
              </p>

              <div className="hero-stagger hero-d3 mt-10 md:mt-11 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={openBooking}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                >
                  {t({ fr: "Réserver un appel", en: "Book a call" })}
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
                </button>
                <button
                  onClick={() => scrollToSection("demo-preview")}
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] dark:hover:bg-[#3b82f6] dark:hover:text-white dark:hover:border-[#3b82f6] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150"
                >
                  {t({ fr: "Voir la démo", en: "Watch the demo" })}
                </button>
              </div>

              {/* Availability badge — sits just below the CTAs. Click opens a
                  callback capture + booking. relative z-50 keeps the open panel
                  above the video below it. */}
              <div className="hero-stagger hero-d4 relative z-50 mt-8 flex justify-center">
                <CallbackBadge openBooking={openBooking} />
              </div>
            </div>

            {/* ── Browser frame ──────────────────────────────────
                Autoplays muted, plays once (no loop), no scroll lock.
                When it finishes, a replay button appears. The user can
                scroll past freely. The "Voir la démo" button above
                just smooth-scrolls to this section.               */}
            <div
              id="demo-preview"
              className="hero-stagger hero-d5 relative z-10 mt-10 mx-auto max-w-7xl px-1 sm:px-6 lg:px-10"
            >
              {/* Browser frame — clean visible chrome. The video area is
                  covered by a white overlay until the user scrolls; when
                  they do, the overlay slides upward and fades out while
                  the video gently rises into view + starts playing. */}
              <div className="browser-frame">
                <div className="relative overflow-hidden">
                  <video
                    ref={videoRef}
                    src="/ora-1.mp4"
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    onClick={togglePlayPause}
                    onEnded={() => setHasEnded(true)}
                    className="w-full aspect-[16/9] object-cover block cursor-pointer"
                    onLoadedMetadata={(e) => {
                      e.currentTarget.playbackRate = 1.0;
                      // Pre-seek so the first frame is ready the instant the
                      // white overlay clears (no flash of black). Starts 1s in
                      // to skip the awkward opening moment of the clip.
                      e.currentTarget.currentTime = VIDEO_START;
                    }}
                  />

                  {/* Mute / unmute toggle — top right (hidden once ended) */}
                  {!hasEnded && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? t({ fr: "Activer le son", en: "Unmute" }) : t({ fr: "Couper le son", en: "Mute" })}
                      aria-pressed={!isMuted}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center shadow-lg ring-1 ring-white/15 hover:bg-black/75 hover:ring-white/30 transition-all duration-150"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Replay overlay — shown when the video has played through.
                      No auto-loop: the user explicitly chooses to replay. */}
                  {hasEnded && (
                    <button
                      type="button"
                      onClick={replay}
                      aria-label={t({ fr: "Revoir la vidéo", en: "Replay the video" })}
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[1px] transition-opacity duration-200"
                    >
                      <span className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-black/65 text-white text-[15px] font-semibold font-inter shadow-lg ring-1 ring-white/20 hover:bg-black/80 transition-all duration-150">
                        <RotateCcw className="w-4 h-4" />
                        {t({ fr: "Revoir la vidéo", en: "Replay" })}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Light social proof — single compact line below the demo. */}
            <div className="hero-stagger hero-d5 mt-12 md:mt-14 max-w-6xl mx-auto px-6 lg:px-10">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-inter text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span>{t({ fr: "Fonctionne avec", en: "Works with" })}</span>
                  <div className="flex items-center">
                    {INTEGRATIONS.map((it, i) => {
                      // Excel sits in front: bigger, fully opaque, on top. The
                      // others tuck behind it, smaller and dimmed, tightly stacked.
                      const front = i === 0;
                      return (
                        <IntegrationCircle
                          key={it.name}
                          name={it.name}
                          src={it.src}
                          front={front}
                          style={{ marginLeft: front ? 0 : -18, zIndex: 50 - i, opacity: front ? 1 : 0.85 }}
                        />
                      );
                    })}
                  </div>
                </div>

                <span className="hidden sm:inline-block h-3.5 w-px bg-gray-300 dark:bg-white/15" aria-hidden />

                <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  {t({ fr: "Sécurité et conformité", en: "Security & compliance" })}
                </span>

                <span className="hidden sm:inline-block h-3.5 w-px bg-gray-300 dark:bg-white/15" aria-hidden />

                <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <EuFlag />
                    <SwissFlag />
                  </span>
                  {t({ fr: "Hébergement UE et Suisse", en: "EU and Swiss hosting" })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Logos slider — masqué en V1, à réactiver avec les premiers clients ── */}
          {/* <div className="hero-stagger hero-d5 mx-auto max-w-6xl px-6 lg:px-10">
            <LogosSlider />
          </div> */}

        </section>
      </>
    );
  },
);

Hero.displayName = "Hero";
export default Hero;
