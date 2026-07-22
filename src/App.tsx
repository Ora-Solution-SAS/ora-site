import { useEffect, useState, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom"; // used for booking modal
import Lenis from "lenis";
import { Analytics } from "@vercel/analytics/react";
import ForBusinessPage from "./pages/ForBusinessPage";
import OraExperiencePage from "./pages/OraExperiencePage";
import SolutionTemplatePage from "./pages/SolutionTemplatePage";
import SolutionExpertiseComptablePage from "./pages/SolutionExpertiseComptablePage";
import SolutionAuditPage from "./pages/SolutionAuditPage";
import SolutionFondsInvestissementPage from "./pages/SolutionFondsInvestissementPage";
import SolutionBanqueAffairesPage from "./pages/SolutionBanqueAffairesPage";
import ConfidentialitePage from "./pages/ConfidentialitePage";
import PricingPage from "./pages/PricingPage";
import MentionsLegalesPage from "./pages/MentionsLegalesPage";
import PolitiqueConfidentialitePage from "./pages/PolitiqueConfidentialitePage";
import CGUPage from "./pages/CGUPage";
import DownloadPage from "./pages/DownloadPage";
import NotFoundPage from "./pages/NotFoundPage";
import { animatedScrollToId } from "./lib/scrollTo";
import OraLogoSpinner from "./components/OraLogoSpinner";
import QualifierFlow, { type QualifierAnswers } from "./components/QualifierFlow";
import QualifierResult from "./components/QualifierResult";
import GiftReveal from "./components/GiftReveal";
import StackingCards from "./components/StackingCards";
import AtlasShowcase from "./components/AtlasShowcase";
import IndustrySelector from "./components/IndustrySelector";
import PrivacyShowcase from "./components/PrivacyShowcase";
import ExcelReveal from "./components/ExcelReveal";
// import EnterpriseReady from "./components/EnterpriseReady"; // masqué pour l'instant
// import FinanceUseCases from "./components/FinanceUseCases"; // masqué pour l'instant
import ProblemSection from "./components/ProblemSection";
import UseCases from "./components/UseCases";
import FAQ from "./components/FAQ";
// === Subtle "bubble" animation for HOW IT WORKS steps ===
const bubbleStyles = `
/* === Booking loading screen fade-out === */
@keyframes loaderFadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; visibility: hidden; }
}
.booking-loading-screen.fade-out {
  animation: loaderFadeOut 0.6s ease-out forwards;
}

/* === Light hero animated aurora (subtle moving blue/pink) === */
@keyframes auroraFloat {
  0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
  50%  { transform: translate3d(2%, 1.5%, 0) scale(1.06); }
  100% { transform: translate3d(-2%, -1%, 0) scale(1); }
}

/* auroraHue removed — filter: hue-rotate() causes expensive repaints */

@keyframes auroraShift {
  0%   { background-position: 12% 18%, 88% 20%, 52% 92%; opacity: 0.95; }
  50%  { background-position: 18% 22%, 82% 16%, 58% 88%; opacity: 0.85; }
  100% { background-position: 12% 18%, 88% 20%, 52% 92%; opacity: 0.95; }
}

.hero-aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform: translateZ(0);
  will-change: transform;
  contain: layout paint;
}

.hero-aurora::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(520px 520px at 12% 18%, rgba(191,227,255,0.55) 0%, rgba(191,227,255,0.20) 35%, rgba(191,227,255,0.00) 70%),
    radial-gradient(560px 560px at 88% 20%, rgba(255,214,236,0.52) 0%, rgba(255,214,236,0.18) 35%, rgba(255,214,236,0.00) 70%),
    radial-gradient(620px 620px at 52% 92%, rgba(200,231,255,0.42) 0%, rgba(200,231,255,0.14) 35%, rgba(200,231,255,0.00) 70%);
  background-repeat: no-repeat;
  background-size: 120% 120%, 120% 120%, 120% 120%;
  opacity: 0.92;
  animation:
    auroraFloat 12s ease-in-out infinite,
    auroraShift 10s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-aurora::before {
    animation: none !important;
  }
}

@keyframes bubble {
  0% { opacity: 0; transform: translateY(6px) scale(0.8); }
  30% { opacity: 0.6; }
  50% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-8px) scale(0.9); }
}
.animate-bubble {
  animation: bubble 2.4s ease-in-out infinite;
}

/* === Ora experience video placeholder subtle shimmer === */
@keyframes placeholderGlow {
  0% { background-position: 0% 50%; opacity: 0.85; }
  50% { background-position: 100% 50%; opacity: 1; }
  100% { background-position: 0% 50%; opacity: 0.9; }
}

.placeholder-anim {
  background-image: linear-gradient(
    110deg,
    rgba(56,189,248,0.10) 0%,
    rgba(147,197,253,0.18) 40%,
    rgba(236,72,153,0.14) 65%,
    rgba(56,189,248,0.10) 100%
  );
  background-size: 200% 200%;
  animation: placeholderGlow 5.2s ease-in-out infinite;
}

/* === Ora experience video cinematic reveal === */
@keyframes videoReveal {
  0% {
    opacity: 0;
    transform: perspective(1200px) rotateY(-6deg) translateX(80px) scale(0.88);
  }
  60% {
    opacity: 0.85;
    transform: perspective(1200px) rotateY(-1deg) translateX(8px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: perspective(1200px) rotateY(0deg) translateX(0) scale(1);
  }
}

.video-reveal {
  opacity: 0;
  transform: perspective(1200px) rotateY(-6deg) translateX(80px) scale(0.88);
}

.video-reveal.visible {
  animation: videoReveal 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}


/* === Phone ringing animation for Discovery call step === */
@keyframes phoneRing {
  0%, 100% { transform: rotate(0deg); }
  4% { transform: rotate(14deg); }
  8% { transform: rotate(-14deg); }
  12% { transform: rotate(10deg); }
  16% { transform: rotate(-10deg); }
  20% { transform: rotate(6deg); }
  24% { transform: rotate(0deg); }
}
@keyframes phonePulse1 {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes phonePulse2 {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(2.8); opacity: 0; }
}
@keyframes phonePulse3 {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(3.4); opacity: 0; }
}
@keyframes phoneGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes phoneDot {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

@keyframes iconRing {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  15% { transform: rotate(-10deg) translateY(-1px); }
  30% { transform: rotate(10deg) translateY(-1px); }
  45% { transform: rotate(-6deg) translateY(0); }
  60% { transform: rotate(6deg) translateY(0); }
}

@keyframes iconPlug {
  0%, 100% { transform: translateX(0); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-2px); }
}

@keyframes iconPlan {
  0%, 100% { transform: translateY(0); opacity: 0.95; }
  50% { transform: translateY(-2px); opacity: 1; }
}

@keyframes iconLaunch {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(6deg); }
}

.icon-ring { animation: iconRing 1.4s ease-in-out infinite; transform-origin: 50% 50%; }
.icon-plug { animation: iconPlug 1.2s ease-in-out infinite; }
.icon-plan { animation: iconPlan 1.6s ease-in-out infinite; }
.icon-launch { animation: iconLaunch 1.3s ease-in-out infinite; }

.icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: rgba(56,189,248,0.10);
}
.dark .icon-chip {
  background: rgba(56,189,248,0.16);
}

/* === Hero suggestions rail (stealth scrollbar) === */
.suggestion-rail {
  scrollbar-width: thin; /* Firefox */
  scrollbar-gutter: stable both-edges;
  scrollbar-color: rgba(56,189,248,0.18) transparent;
}
.dark .suggestion-rail {
  scrollbar-color: rgba(56,189,248,0.14) transparent;
}

.suggestion-rail::-webkit-scrollbar {
  height: 4px;
}
.suggestion-rail::-webkit-scrollbar-track {
  background: transparent;
}
.suggestion-rail::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,0.18);
  border-radius: 9999px;
}
.dark .suggestion-rail::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,0.14);
}

/* reveal a bit more on hover */
.suggestion-rail:hover {
  scrollbar-color: rgba(56,189,248,0.35) transparent;
}
.dark .suggestion-rail:hover {
  scrollbar-color: rgba(56,189,248,0.28) transparent;
}
.suggestion-rail:hover::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,0.35);
}
.dark .suggestion-rail:hover::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,0.28);
}


/* === Button hover text wipe (down out, up in) === */
.btn-wipe {
  position: relative;
  overflow: hidden;
}
.btn-wipe .btn-wipe-inner {
  position: relative;
  display: inline-block;
  line-height: 1;
}
.btn-wipe .btn-wipe-out,
.btn-wipe .btn-wipe-in {
  display: inline-block;
  transition: transform 260ms ease, opacity 260ms ease;
  will-change: transform, opacity;
}
.btn-wipe .btn-wipe-in {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-120%);
  opacity: 0;
}
.btn-wipe:hover .btn-wipe-out {
  transform: translateY(120%);
  opacity: 0;
}
.btn-wipe:hover .btn-wipe-in {
  transform: translateY(0%);
  opacity: 1;
}

/* === Stunning quote animations === */
@keyframes quoteGlowSweep {
  0% { transform: translateX(-120%); opacity: 0; }
  15% { opacity: 0.75; }
  100% { transform: translateX(120%); opacity: 0; }
}

@keyframes quotePop {
  0% { opacity: 0; transform: translateY(26px) scale(0.96); }
  60% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.quote-pop {
  animation: quotePop 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}

.quote-shine {
  position: relative;
  display: inline-block;
}

.quote-shine::after {
  content: "";
  position: absolute;
  inset: -18px -26px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.55), rgba(59,130,246,0.35), transparent);
  filter: blur(14px);
  opacity: 0;
  transform: translateX(-120%);
  pointer-events: none;
}

.quote-shine.on::after {
  opacity: 1;
  animation: quoteGlowSweep 1.9s ease-out 120ms both;
}

/* === Hero caption (fancy, subtle) === */
@keyframes heroCaptionIn {
  0% { opacity: 0; }
  60% { opacity: 1; }
  100% { opacity: 1; }
}
.hero-caption {
  position: relative;
  display: inline-block;
}
.hero-caption-inner {
  position: relative;
  display: inline-block;
  animation: heroCaptionIn 1100ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
  will-change: opacity;
}

@keyframes heroCaptionShine {
  0% { transform: translateX(-140%); opacity: 0; }
  18% { opacity: 0.9; }
  100% { transform: translateX(140%); opacity: 0; }
}
.hero-caption::after {
  content: "";
  position: absolute;
  left: -24%;
  right: -24%;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.42), rgba(59,130,246,0.26), transparent);
  filter: blur(14px);
  opacity: 0;
  transform: translateX(-140%);
  pointer-events: none;
  animation: heroCaptionShine 2.1s ease-out 520ms both;
}
/* Planet orbits for Ora experience card 1 */
@keyframes orbit1 {
  0%   { transform: rotate(0deg) translateX(90px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
}
@keyframes orbit2 {
  0%   { transform: rotate(120deg) translateX(130px) rotate(-120deg); }
  100% { transform: rotate(480deg) translateX(130px) rotate(-480deg); }
}
@keyframes orbit3 {
  0%   { transform: rotate(240deg) translateX(60px) rotate(-240deg); }
  100% { transform: rotate(600deg) translateX(60px) rotate(-600deg); }
}
@keyframes orbitRing {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
.planet {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
}
.orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
  top: 50%;
  left: 50%;
}

@keyframes stepFadeIn {
  0% { opacity: 0; transform: translateY(10px) scale(0.98); }
  50% { opacity: 0.7; }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes heroEntrance {
  0%   { opacity: 0; transform: translateY(22px); }
  60%  { opacity: 0.8; }
  100% { opacity: 1; transform: translateY(0); }
}
.hero-enter {
  opacity: 0;
  animation: heroEntrance 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.hero-enter-d1 { animation-delay: 0ms; }
.hero-enter-d2 { animation-delay: 200ms; }
.hero-enter-d3 { animation-delay: 400ms; }
.hero-enter-d4 { animation-delay: 900ms; }

/* Subtle badge attention pulse — plays after all entrance anims are done */
@keyframes badgeNotice {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  30%  { transform: scale(1.045); box-shadow: 0 0 18px 4px rgba(59,130,246,0.18); }
  60%  { transform: scale(0.99); box-shadow: 0 0 6px 1px rgba(59,130,246,0.06); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
}
@keyframes badgeShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.badge-notice {
  animation: badgeNotice 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.6s both,
             badgeShimmer 1.4s ease 2.8s both;
  background-size: 200% 100%;
  background-image: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255,255,255,0.18) 46%,
    rgba(255,255,255,0.22) 50%,
    rgba(255,255,255,0.18) 54%,
    transparent 70%
  );
}

@keyframes heroLineReveal {
  0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
  15%  { opacity: 1; }
  100% { clip-path: inset(0 0% 0 0); opacity: 1; }
}
.hero-line-reveal {
  display: inline-block;
  opacity: 0;
  animation: heroLineReveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* === Feature row reveal — dark mode only (white bg had jank) === */
@keyframes featReveal {
  from { opacity: 0; transform: translate3d(0, 24px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.dark .feat-row .feat-child { opacity: 0; }
.dark .feat-row.feat-visible .feat-child {
  animation: featReveal 0.65s cubic-bezier(.22,1,.36,1) var(--feat-delay, 0ms) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-bubble,
  .icon-ring,
  .icon-plug,
  .icon-plan,
  .icon-launch,
  .quote-pop,
  .hero-caption-inner {
    animation: none !important;
  }
  .btn-wipe .btn-wipe-out,
  .btn-wipe .btn-wipe-in {
    transition: none !important;
  }
}

/* Hide Cal.com default loading spinner */
cal-inline-widget .loader,
cal-inline-widget [data-testid="loader"],
cal-inline-widget .cal-loading {
  display: none !important;
}

/* Final CTA — subtle grid fading at the edges */
.cta-grid {
  -webkit-mask-image: radial-gradient(ellipse 75% 65% at 50% 50%, #000 25%, transparent 78%);
  mask-image: radial-gradient(ellipse 75% 65% at 50% 50%, #000 25%, transparent 78%);
}

/* Final CTA — floating decorative cards */
@keyframes ctaFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}
.cta-float { animation: ctaFloat 7s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .cta-float { animation: none; }
}
`;
import Cal from "@calcom/embed-react";
import { Card } from "./components/ui/card";
import Navigation from "./components/Navigation";
import { OraFooter } from "./components/Footer";
// OraGallery = the Bending-Spoons-style 6-video carousel hero. Preserved intact
// and ready to swap back in once the real demo clips are available (just replace
// <OraHeroVideo> below with <OraGallery>). Temporarily replaced by a single
// demo video via OraHeroVideo.
// import OraGallery from "./components/OraGallery";
// OraHeroVideo (single ora-1.mp4 demo) replaced by the scroll-driven demo
// below. File kept for reference.
// import OraHeroVideo from "./components/OraHeroVideo";
import OraHeroDemo from "./components/OraHeroDemo";
// DemoVideoCurtain (white "Vos dossiers financiers…" panel) removed: the main
// demo (ora-1.mp4) now lives in the hero. Component file kept for reference.
// import DemoVideoCurtain from "./components/DemoVideoCurtain";
import { useLang } from "./lib/i18n";
import {
  Clock,
  Shield,
  CheckCircle2,
  X,
  Zap,
  ArrowRight,
  FileSpreadsheet,
  Mail,
  BarChart3,
} from "lucide-react";

// ← Replace with your Cal.com username/event-slug once your account is set up
// Example: "raphael-gaugain/discovery-call"
const CAL_LINK = "raphael-gaugain-cfjl0b/discovery-call";

// Direct booking / contact email shown as an alternative to the calendar.
const BOOKING_EMAIL = "raphael.gaugain@ora-solution.com";

// === Scroll Fade-In Wrapper ===
type FadeInOnScrollProps = {
  children: ReactNode;
  delay?: number; // in ms
  className?: string;
  direction?: "up" | "left" | "right";
  onVisible?: () => void;
};

const FadeInOnScroll = ({
  children,
  delay = 0,
  className = "",
  direction = "up",
  onVisible,
}: FadeInOnScrollProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (onVisible) onVisible();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [onVisible]);

  const hiddenTransform =
    direction === "left"
      ? "translateX(-60px)"
      : direction === "right"
        ? "translateX(60px)"
        : "translateY(60px)";

  return (
    <div
      ref={ref}
      className={`transform-gpu ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0,0,0)" : hiddenTransform,
        transition:
          "opacity 800ms cubic-bezier(.22,1,.36,1), transform 800ms cubic-bezier(.22,1,.36,1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};


// === URL-based routing helpers ===
type Page =
  | "home"
  | "for-business"
  | "ora-experience"
  | "solution-template"
  | "solution-expertise-comptable"
  | "solution-audit"
  | "solution-fonds-investissement"
  | "solution-banque-affaires"
  | "confidentialite"
  | "pricing"
  | "mentions-legales"
  | "politique-confidentialite"
  | "cgu"
  | "telechargement"
  | "not-found";

const PAGE_TO_PATH: Record<Page, string> = {
  "home": "/",
  "for-business": "/for-business",
  "ora-experience": "/ora-experience",
  "solution-template": "/solution-template",
  "solution-expertise-comptable": "/solution-expertise-comptable",
  "solution-audit": "/solution-audit",
  "solution-fonds-investissement": "/solution-fonds-investissement",
  "solution-banque-affaires": "/solution-banque-affaires",
  "confidentialite": "/confidentialite",
  "pricing": "/pricing",
  "mentions-legales": "/mentions-legales",
  "politique-confidentialite": "/politique-confidentialite",
  "cgu": "/cgu",
  // Hidden client download page: reachable only via this private direct link.
  // NOT added to HIDDEN_PAGES (that would 404 it) and NOT linked in nav/footer.
  "telechargement": "/telechargement/ora-app",
  "not-found": "/not-found",
};

const PATH_TO_PAGE: Record<string, Page> = Object.fromEntries(
  (Object.entries(PAGE_TO_PATH) as [Page, string][]).map(([p, path]) => [path, p])
);

// Pages temporarily hidden until they go live. Direct URL access to any of
// these resolves to the 404 page, and their nav/footer links are removed.
// To re-enable a page, delete it from this set and restore its links.
const HIDDEN_PAGES = new Set<Page>(["ora-experience", "pricing", "confidentialite"]);

function getPageFromPath(pathname: string): Page {
  const page = PATH_TO_PAGE[pathname] ?? "not-found";
  return HIDDEN_PAGES.has(page) ? "not-found" : page;
}

const App = () => {
  const { t, lang } = useLang();

  // Smooth scroll with inertia (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.15,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    (window as any).__lenis = lenis;

    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  // Scroll to top on initial page load / refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingReady, setBookingReady] = useState(false);
  const [bookingFading, setBookingFading] = useState(false);
  // 4-phase booking funnel:
  //  - "qualifier" : 3-question Preply-style mini-flow
  //  - "result"    : quantified loss + "with Ora" comparison (the aha moment)
  //  - "gift"      : reciprocity reveal — personalized before/after video +
  //                  free audit + "already prepared" automation for their field
  //  - "calendar"  : Cal.com embed with pre-filled notes
  type BookingPhase = "qualifier" | "result" | "gift" | "calendar";
  const [bookingPhase, setBookingPhase] = useState<BookingPhase>("qualifier");
  const [qualifierAnswers, setQualifierAnswers] = useState<QualifierAnswers | null>(null);

  const openBooking = () => {
    setIsBookingOpen(true);
    // Reset funnel state so each opening starts fresh
    setBookingPhase("qualifier");
    setQualifierAnswers(null);
    setBookingReady(false);
    setBookingFading(false);
  };

  // Called when the user finishes the 3-question qualifier → show result screen.
  const handleQualifierComplete = (answers: QualifierAnswers) => {
    setQualifierAnswers(answers);
    setBookingPhase("result");
  };

  // Result screen → calendar. The "gift" reveal step is temporarily skipped
  // (not finished yet). To restore it, replace this body with
  // `setBookingPhase("gift")` — the gift phase, its handlers, the GiftReveal
  // render branch and the left-panel copy are all still in place below.
  const handleResultContinue = () => {
    setBookingPhase("calendar");
    setBookingReady(false);
    setBookingFading(false);
    setTimeout(() => {
      setBookingFading(true);
      setTimeout(() => setBookingReady(true), 500);
    }, 900);
  };

  // Allow stepping back from the result screen to the last qualifier question.
  const handleResultBack = () => {
    setBookingPhase("qualifier");
  };

  // Gift screen → transition to Cal.com with a brief loading screen.
  const handleGiftContinue = () => {
    setBookingPhase("calendar");
    setBookingReady(false);
    setBookingFading(false);
    setTimeout(() => {
      setBookingFading(true);
      setTimeout(() => setBookingReady(true), 500);
    }, 900);
  };

  // Step back from the gift screen to the result estimate.
  const handleGiftBack = () => {
    setBookingPhase("result");
  };

  // Build the Cal.com "Additional notes" string from the qualifier answers,
  // so the team arrives at the call with full context.
  const bookingNotes = qualifierAnswers
    ? lang === "fr"
      ? `Format souhaité : ${qualifierAnswers.format.label}\nMétier : ${qualifierAnswers.sector.label}\nTâche prioritaire : ${qualifierAnswers.pain.label}\nVolume hebdo : ${qualifierAnswers.hours.label}`
      : `Preferred format: ${qualifierAnswers.format.label}\nField: ${qualifierAnswers.sector.label}\nMain task: ${qualifierAnswers.pain.label}\nWeekly volume: ${qualifierAnswers.hours.label}`
    : "";



  const [page, setPage] = useState<Page>(() => getPageFromPath(window.location.pathname));
  const [notFoundKey, setNotFoundKey] = useState(0);

  // Handle browser back / forward
  useEffect(() => {
    const onPopState = () => {
      const newPage = getPageFromPath(window.location.pathname);
      if (newPage === "not-found") setNotFoundKey((k) => k + 1);
      setPage(newPage);
      const lenis = (window as any).__lenis;
      if (lenis) {
        // Ensure Lenis isn't left stopped by Hero's scroll-lock state machine
        lenis.start();
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigateTo = (target: Page) => {
    // Hidden pages always resolve to 404, even if a stray link points to them.
    if (target === "not-found" || HIDDEN_PAGES.has(target)) {
      setNotFoundKey((k) => k + 1);
      setPage("not-found");
      window.history.pushState({}, "", PAGE_TO_PATH["not-found"]);
      const lenis = (window as any).__lenis;
      if (lenis) { lenis.start(); lenis.scrollTo(0, { immediate: true }); }
      else window.scrollTo({ top: 0 });
      return;
    }
    if (target === page) return;
    setPage(target);
    window.history.pushState({}, "", PAGE_TO_PATH[target]);
    const lenis = (window as any).__lenis;
    if (lenis) {
      // Ensure Lenis isn't left stopped by Hero's scroll-lock state machine
      lenis.start();
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  // ── Nav ribbon → homepage sections (animated scroll, no hard redirect) ────
  // Two events flow in:
  //   • `ora:goto-industry` {id}  — Solutions menu: select a branch + scroll to
  //     the IndustrySelector (it owns the animated scroll on `ora:select-industry`).
  //   • `ora:goto-section`  {id}  — any other nav link: animated scroll to a
  //     section by element id.
  // If we're not on the homepage, we switch to it first and replay once mounted.
  const pendingNavRef = useRef<{ kind: "industry" | "section"; id: string } | null>(null);

  const fireNav = (kind: "industry" | "section", id: string) => {
    if (kind === "industry") {
      window.dispatchEvent(new CustomEvent("ora:select-industry", { detail: { id } }));
    } else {
      animatedScrollToId(id);
    }
  };

  useEffect(() => {
    const route = (kind: "industry" | "section", id?: string) => {
      if (!id) return;
      if (page === "home") fireNav(kind, id);
      else {
        pendingNavRef.current = { kind, id };
        navigateTo("home");
      }
    };
    const onIndustry = (e: Event) => route("industry", (e as CustomEvent).detail?.id);
    const onSection = (e: Event) => route("section", (e as CustomEvent).detail?.id);
    window.addEventListener("ora:goto-industry", onIndustry);
    window.addEventListener("ora:goto-section", onSection);
    return () => {
      window.removeEventListener("ora:goto-industry", onIndustry);
      window.removeEventListener("ora:goto-section", onSection);
    };
  }, [page]);

  // Once the homepage is back and mounted, replay a pending nav action.
  useEffect(() => {
    if (page !== "home" || !pendingNavRef.current) return;
    const { kind, id } = pendingNavRef.current;
    pendingNavRef.current = null;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => fireNav(kind, id)),
    );
    return () => cancelAnimationFrame(raf);
  }, [page]);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("ora-theme-v2");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const benefitsRef = useRef<HTMLElement | null>(null);
  const [_benefitsPhase, setBenefitsPhase] = useState<"problem" | "solution">("problem");




  // Handle light / dark theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    // localStorage is written only when the user manually toggles (see onToggleTheme)
  }, [theme]);

  // Follow system preference changes when no manual override is stored
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (!window.localStorage.getItem("ora-theme-v2")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);


  // Benefits phase swap (problem -> solution) — rAF throttled
  const benefitsPhaseRef = useRef<"problem" | "solution">("problem");
  useEffect(() => {
    let raf = 0;

    const compute = () => {
      raf = 0;
      const section = benefitsRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;

      const start = viewportH * 0.8;
      const end = viewportH * 0.2;
      const raw = (start - rect.top) / (rect.height + start - end);
      const p = Math.min(1, Math.max(0, raw));

      const nextPhase: "problem" | "solution" = p > 0.4 ? "solution" : "problem";
      if (nextPhase !== benefitsPhaseRef.current) {
        benefitsPhaseRef.current = nextPhase;
        setBenefitsPhase(nextPhase);
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // How it works timeline progress (fills the center line as you scroll) — rAF throttled





  return (
    <div
      className={`min-h-screen text-[#111827] dark:text-white transition-colors duration-300 ease-in-out ${theme === "light"
        ? "bg-[#ffffff]"
        : "bg-background"
        }`}
    >
      <style>{bubbleStyles}</style>

      {/* Global nav is hidden on the standalone client download page */}
      {page !== "telechargement" && (
        <Navigation
          theme={theme}
          onToggleTheme={() => {
            // Toggle provisoire — session uniquement, ne persiste pas en localStorage
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          onBookCall={() => openBooking()}
          currentPage={page}
          onNavigate={navigateTo}
        />
      )}

      {page === "not-found" ? (
        <NotFoundPage key={notFoundKey} theme={theme} onNavigate={navigateTo} />
      ) : page === "for-business" ? (
        <ForBusinessPage theme={theme} openBooking={openBooking} />
      ) : page === "ora-experience" ? (
        <OraExperiencePage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "solution-template" ? (
        <SolutionTemplatePage theme={theme} openBooking={openBooking} />
      ) : page === "solution-expertise-comptable" ? (
        <SolutionExpertiseComptablePage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "solution-audit" ? (
        <SolutionAuditPage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "solution-fonds-investissement" ? (
        <SolutionFondsInvestissementPage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "solution-banque-affaires" ? (
        <SolutionBanqueAffairesPage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "confidentialite" ? (
        <ConfidentialitePage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "pricing" ? (
        <PricingPage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "mentions-legales" ? (
        <MentionsLegalesPage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "politique-confidentialite" ? (
        <PolitiqueConfidentialitePage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "cgu" ? (
        <CGUPage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : page === "telechargement" ? (
        <DownloadPage
          theme={theme}
          openBooking={openBooking}
          onNavigate={navigateTo}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ) : (
      <>

      {/* Right-edge scroll-spy nav removed at the client's request. */}

      {/* HERO — black section at the very top. Scroll-driven product demo
          (sticky scrub, fake Ora app + animated cursor) under the headline via
          OraHeroDemo. Swap back to <OraGallery> for the 6-video curved
          carousel once the real clips are ready. */}
      <OraHeroDemo theme={theme} openBooking={openBooking} />

      {/* ── "Your time is your most valuable asset" scroll-reveal ──
          ExcelReveal: pure-black Bending-Spoons progressive-blur reveal, normal
          flow (no scroll-lock). `bg-black` on the wrapper keeps the seam from
          the (darkened) demo above pure black — no white flash. */}
      <div className="relative bg-black">
        <ExcelReveal />
      </div>

      {/* FEATURES — alternating video + text rows */}
      <section id="features" className="relative pt-32 md:pt-44 pb-0 px-6 md:px-12 bg-white dark:bg-black md:dark:bg-background">
        {/* Ambient blue/pink tints — pure radial gradients, NO blur filter
            (same perf rule as the experience section). The section is very
            tall, so blobs are sprinkled along it. Every ellipse fades to
            transparent BEFORE the edges (center ± 0.7×radius within 0-100%)
            so no hard line forms against adjacent sections. Content wrappers
            below are position:relative so they paint above this layer. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(34% 16% at 6% 5%, rgba(59,130,246,0.30) 0%, transparent 72%), radial-gradient(34% 16% at 94% 5%, rgba(59,130,246,0.30) 0%, transparent 72%), radial-gradient(50% 12% at 45% 28%, rgba(59,130,246,0.22) 0%, transparent 70%), radial-gradient(45% 12% at 85% 32%, rgba(59,130,246,0.22) 0%, transparent 70%), radial-gradient(55% 13% at 15% 58%, rgba(59,130,246,0.28) 0%, transparent 70%), radial-gradient(50% 12% at 50% 75%, rgba(59,130,246,0.20) 0%, transparent 70%), radial-gradient(45% 10% at 80% 88%, rgba(236,72,153,0.08) 0%, transparent 70%)"
                : "radial-gradient(34% 16% at 6% 5%, rgba(59,130,246,0.28) 0%, transparent 72%), radial-gradient(34% 16% at 94% 5%, rgba(59,130,246,0.28) 0%, transparent 72%), radial-gradient(50% 12% at 45% 28%, rgba(59,130,246,0.20) 0%, transparent 70%), radial-gradient(45% 12% at 85% 32%, rgba(59,130,246,0.21) 0%, transparent 70%), radial-gradient(55% 13% at 15% 58%, rgba(59,130,246,0.26) 0%, transparent 70%), radial-gradient(50% 12% at 50% 75%, rgba(59,130,246,0.18) 0%, transparent 70%), radial-gradient(45% 10% at 80% 88%, rgba(236,72,153,0.08) 0%, transparent 70%)",
            // Fade the tint layer in/out at the very top and bottom so its
            // edges never form a hard horizontal line against the adjacent
            // white sections (hero above, next section below).
            // Fade the tint in much lower so the top of this section stays
            // clean white — seamless with the white demo section above it (no
            // visible demarcation line).
            maskImage:
              "linear-gradient(to bottom, transparent 0, transparent 360px, #000 620px, #000 calc(100% - 200px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, transparent 360px, #000 620px, #000 calc(100% - 200px), transparent 100%)",
          }}
        />
        {/* Use cases — Bending-Spoons-style blue cards showing concretely
            what Ora automates (FEC Studio, monthly reporting), with the real
            demo clips. Placed right above the "coûte plus que du temps"
            problem section. */}
        <UseCases openBooking={openBooking} />

        {/* Problem — the "il me comprend" moment before the product. */}
        <ProblemSection />

        {/* Finance use-cases — masqué pour l'instant. Réactiver : décommenter
            l'import en haut, ce bloc, et l'entrée "cas-usage" dans SectionNav.
        <FinanceUseCases openBooking={openBooking} /> */}

        {/* ValuePropsFlip (FEC Studio) moved into the stacking wrapper below so
            the feature cards can rise up and cover it, one by one. */}
      </section>

      {/* ── PRÊT POUR L'ENTREPRISE — masqué pour l'instant. Réactiver :
          décommenter l'import en haut, ce bloc, et l'entrée "enterprise"
          dans SectionNav.
      <EnterpriseReady /> */}

      {/* ── FEC STUDIO + STACKING FEATURE CARDS + ATLAS ──────────────────
          One shared `relative` wrapper so every `sticky` element inside pins
          against it: FEC Studio (ValuePropsFlip) pins first, then each feature
          card rises up and fully covers the previous one, then a spacer keeps
          the last card on screen a while, and finally AtlasShowcase (z-20)
          rises up over the whole stack. */}
      <div className="relative bg-white dark:bg-[#0f172a] pt-16 md:pt-24">
        {/* FEC Studio / "Vos tâches Excel automatisées" cards removed for now.
            The stack starts directly with the three feature cards. */}
        <StackingCards />
        {/* Breathing room: the last card stays on screen before Atlas rises. */}
        <div aria-hidden className="h-[40vh] md:h-[95vh]" />
        <AtlasShowcase />
      </div>

      {/* L'expérience Ora (carousel) + l'offre « tout inclus » ont été
          retirés pour l'instant. La section Industries prend leur place,
          juste après Atlas, sur fond sombre. */}

      {/* ── INDUSTRIES ───────────────────────────────────────────────── */}
      {/* Pick a field → see concrete automation examples → jump to the
          dedicated solution page.
          TEMPORAIREMENT MASQUÉ (pas fini) — repasser `false` à `true`. */}
      {false && <IndustrySelector theme={theme} openBooking={openBooking} />}

      {/* ── CONFIDENTIALITÉ ──────────────────────────────────────────── */}
      {/* Scroll-driven animated stage (padlock locks, cloud arrives) +
          3 trust cards. See PrivacyShowcase.tsx. */}
      <PrivacyShowcase theme={theme} />

      {/* ── FAQ — preempts finance/procurement objections ────────────── */}
      <FAQ />

      {/* ── CTA FINAL (Monday-style) ─────────────────────────────────── *
       *  Closing section : thin two-line headline (2nd line brand        *
       *  gradient), dual CTA, subtle grid + floating decorative cards.    *
       *  TEMPORAIREMENT MASQUÉ — repasser `false` à `true` pour réactiver. *
       * ───────────────────────────────────────────────────────────────── */}
      {false && (
      <section className="relative overflow-hidden px-6 md:px-12 pt-40 md:pt-56 pb-24 md:pb-32 min-h-[70vh] flex items-center bg-white dark:bg-black md:dark:bg-[#111827]">
        {/* Subtle grid, fading at the edges */}
        <div
          className="cta-grid absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage: `linear-gradient(to right, ${
              theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)"
            } 1px, transparent 1px), linear-gradient(to bottom, ${
              theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)"
            } 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />

        {/* Ambient glow — pure radial gradient (no blur filter, which is
            expensive to repaint while scrolling and caused jank). */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[560px] rounded-full pointer-events-none"
          aria-hidden
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 72%)"
                : "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 72%)",
          }}
        />

        {/* Floating decorative cards — desktop only */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none" aria-hidden>
          {[
            { pos: "top-[14%] left-[6%]",      delay: "0s",   icon: Zap,             label: t({ fr: "Automatisation lancée", en: "Workflow started" }) },
            { pos: "top-[18%] right-[7%]",     delay: "1.4s", icon: BarChart3,       label: t({ fr: "Rapport généré", en: "Report generated" }) },
            { pos: "bottom-[16%] left-[10%]",  delay: "2.1s", icon: FileSpreadsheet, label: t({ fr: "Excel mis à jour", en: "Excel updated" }) },
            { pos: "bottom-[14%] right-[9%]",  delay: "0.7s", icon: Mail,            label: t({ fr: "Envoi automatique", en: "Auto-sent" }) },
          ].map((c) => {
            const CardIcon = c.icon;
            return (
              <div
                key={c.pos}
                className={`cta-float absolute ${c.pos} rounded-2xl border shadow-lg px-4 py-3 flex items-center gap-3 ${
                  theme === "dark" ? "bg-white/[0.05] border-white/10" : "bg-white border-gray-200/70"
                }`}
                style={{ animationDelay: c.delay, willChange: "transform" }}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-blue-500/25 to-teal-500/25"
                      : "bg-gradient-to-br from-blue-100 to-teal-100"
                  }`}
                >
                  <CardIcon className={`w-4 h-4 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className={`text-[11px] font-inter font-semibold tracking-tight ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    {c.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#0d9488]" />
                    <div className={`h-1.5 w-6 rounded-full ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeInOnScroll>
            <h2 className="font-poppins font-light tracking-[-0.04em] leading-[1.06] text-4xl md:text-6xl text-[#111827] dark:text-white">
              <span className="block">
                {t({ fr: "Prenez une longueur d'avance sur", en: "Move faster than the competition with" })}
              </span>
              <span className="block text-brand-gradient">
                {t({ fr: "vos concurrents grâce à l'automatisation.", en: "automated Excel workflows." })}
              </span>
            </h2>
          </FadeInOnScroll>

          <FadeInOnScroll delay={120}>
            <p className="mt-7 mx-auto font-inter text-base md:text-lg leading-[1.7] max-w-xl text-gray-500 dark:text-gray-400">
              {t({
                fr: "Un appel simple, sans jargon. Vous nous décrivez votre quotidien, on identifie ce qu'Ora peut automatiser. Vous repartez avec un plan concret.",
                en: "A simple call, no jargon. You walk us through your day-to-day, we identify what Ora can automate. You leave with a concrete plan.",
              })}
            </p>
          </FadeInOnScroll>

          <FadeInOnScroll delay={220}>
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={openBooking}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-inter font-semibold text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0 bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.5)]"
              >
                {t({ fr: "Réserver mon appel", en: "Get started" })}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
              </button>
              <button
                onClick={() => navigateTo("for-business")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-inter font-semibold border transition-all duration-150 hover:-translate-y-px active:translate-y-0 border-gray-300 text-[#111827] hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06]"
              >
                {t({ fr: "Voir nos solutions", en: "View solutions" })}
              </button>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={300}>
            <p className="mt-5 text-[12px] text-gray-400 dark:text-gray-600">
              {t({ fr: "Gratuit · 30 minutes · Sans engagement", en: "Free · 30 minutes · No commitment" })}
            </p>
          </FadeInOnScroll>
        </div>
      </section>
      )}

      {/* ── CTA FINAL (provisoire) — un seul bouton centré, collé à la phrase
          "Ora, c'est automatiser sans renoncer à vos données" du pont. ──── */}
      <section className="relative px-6 md:px-12 pt-16 md:pt-8 pb-44 md:pb-56 flex justify-center bg-white dark:bg-black md:dark:bg-[#111827]">
        <button
          onClick={openBooking}
          className="group inline-flex items-center gap-3 px-12 py-6 rounded-full text-lg md:text-xl font-inter font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 bg-[#3b82f6] hover:bg-[#2f75e6] shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.55)]"
        >
          {t({ fr: "Réserver mon appel", en: "Get started" })}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-150" />
        </button>
      </section>

      </>
      )}

      {/* Booking modal — portal, visible on all pages */}
      {isBookingOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/40 backdrop-blur-xl px-4 max-md:py-6 max-md:overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsBookingOpen(false); }}
        >
          <div className="relative w-full max-w-3xl">
            <Card className="relative overflow-hidden border-0 shadow-2xl rounded-[28px] bg-white dark:bg-black md:dark:bg-[#111827]">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="absolute right-5 top-5 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-5">
                {/* LEFT — Brand panel (copy adapts across all 3 phases) */}
                <div className="md:col-span-2 bg-gradient-to-br from-[#3b82f6] to-[#0d9488] p-6 md:p-8 flex flex-col justify-between text-white overflow-hidden md:min-h-0 rounded-t-[26px] md:rounded-l-[26px] md:rounded-tr-none">
                  <div>
                    <img src="/logos/logo-white.png" alt="Ora" className="h-7 w-auto" />
                    <h3 className="mt-5 text-xl md:text-2xl font-semibold leading-snug text-white">
                      {bookingPhase === "qualifier"
                        ? t({ fr: "Préparons votre appel.", en: "Let's prep your call." })
                        : bookingPhase === "result"
                          ? t({ fr: "Votre estimation.", en: "Your estimate." })
                          : bookingPhase === "gift"
                            ? t({ fr: "Un cadeau pour démarrer.", en: "A gift to get started." })
                            : t({ fr: "Choisissez votre créneau", en: "Pick your time slot" })}
                    </h3>
                    <p className="mt-3 text-white/75 text-sm leading-relaxed">
                      {bookingPhase === "qualifier"
                        ? t({
                            fr: "3 questions rapides, et on vous prépare un audit et une démo d'automatisation offerts, adaptés à votre métier.",
                            en: "3 quick questions, and we'll prepare a free audit and an automation demo tailored to your field.",
                          })
                        : bookingPhase === "result"
                          ? t({
                              fr: "Voici ce que cette tâche coûte à votre équipe chaque année, et ce qu'Ora pourrait changer.",
                              en: "Here's what this task costs your team every year, and what Ora could change.",
                            })
                          : bookingPhase === "gift"
                            ? t({
                                fr: "On vous apporte de la valeur avant même l'appel. Récupérez-la en réservant votre créneau.",
                                en: "We bring you value before the call even happens. Claim it by booking your slot.",
                              })
                            : t({
                                fr: "On a votre contexte. Choisissez le moment qui vous convient. On arrive avec un plan adapté à votre métier.",
                                en: "We've got your context. Pick a time that works. We'll arrive with a plan tailored to your field.",
                              })}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3 hidden md:block">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white/90">{t({ fr: "30 min · Gratuit · Sans engagement", en: "30 min · Free · No commitment" })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white/90">{t({ fr: "Plan d'automatisation sur mesure", en: "Tailored automation plan" })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white/90">{t({ fr: "Vos données restent privées", en: "Your data stays private" })}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT — 3 phases: qualifier → result → calendar */}
                <div className="md:col-span-3 relative">
                  {bookingPhase === "qualifier" && (
                    <QualifierFlow onComplete={handleQualifierComplete} />
                  )}

                  {bookingPhase === "result" && qualifierAnswers && (
                    <QualifierResult
                      answers={qualifierAnswers}
                      onContinue={handleResultContinue}
                      onBack={handleResultBack}
                    />
                  )}

                  {bookingPhase === "gift" && qualifierAnswers && (
                    <GiftReveal
                      answers={qualifierAnswers}
                      onContinue={handleGiftContinue}
                      onBack={handleGiftBack}
                    />
                  )}

                  {bookingPhase === "calendar" && (
                    <>
                      {/* Short loading transition between result and calendar */}
                      {!bookingReady && (
                        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-black md:dark:bg-[#111827] ${bookingFading ? "booking-loading-screen fade-out" : ""}`}>
                          <OraLogoSpinner gradientId="g-booking" size={64} />
                          <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
                            {t({ fr: "Préparation de votre créneau...", en: "Preparing your slot..." })}
                          </p>
                        </div>
                      )}

                      <div
                        className={`p-2 md:p-3 overflow-y-auto transition-opacity duration-500 max-h-[68vh] md:max-h-[80vh] ${bookingReady ? "opacity-100" : "opacity-0"}`}
                      >
                        {CAL_LINK ? (
                          <Cal
                            calLink={CAL_LINK}
                            style={{ width: "100%", height: "100%", overflow: "auto" }}
                            config={{
                              layout: "month_view" as const,
                              theme: theme === "dark" ? "dark" : "light",
                              lang: lang,
                              // Pre-fill the Cal.com "Additional notes" field with the
                              // qualifier answers so the team has full context upfront.
                              notes: bookingNotes,
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                              <Clock className="w-7 h-7 text-blue-500" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {t({ fr: "Réservation bientôt disponible", en: "Booking coming soon" })}
                            </h4>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                              {t({
                                fr: "Notre système de prise de rendez-vous est en cours de configuration.",
                                en: "Our scheduling system is being set up right now.",
                              })}
                            </p>
                          </div>
                        )}

                        {/* Direct-email alternative to the calendar */}
                        <div className="mt-2 pt-3 border-t border-gray-100 dark:border-white/10 text-center">
                          <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 font-inter">
                            {t({ fr: "Vous préférez écrire ? Contactez-nous à ", en: "Prefer to write? Reach us at " })}
                            <a
                              href={`mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
                                t({ fr: "Demande de rendez-vous Ora", en: "Ora call request" }),
                              )}`}
                              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {BOOKING_EMAIL}
                            </a>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>,
        document.body
      )}


      {/* FOOTER — visible on all pages except the standalone download page */}
      {page !== "telechargement" && (
        <FadeInOnScroll>
          <OraFooter
            onNavigate={navigateTo}
            onBookCall={openBooking}
            theme={theme}
          />
        </FadeInOnScroll>
      )}

      <Analytics />
    </div>
  );
};

export default App;

