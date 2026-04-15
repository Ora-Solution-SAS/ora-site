import { useEffect, useState, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom"; // used for booking modal
import Lenis from "lenis";
import ForBusinessPage from "./pages/ForBusinessPage";
import OraExperiencePage from "./pages/OraExperiencePage";
import NotFoundPage from "./pages/NotFoundPage";
import OraLogoSpinner from "./components/OraLogoSpinner";
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
`;
import Cal from "@calcom/embed-react";
import { Card } from "./components/ui/card";
import Navigation from "./components/Navigation";
import { OraFooter } from "./components/Footer";
import Hero from "./components/Hero";
import {
  Clock,
  Shield,
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Database,
  GitMerge,
} from "lucide-react";

// ← Replace with your Cal.com username/event-slug once your account is set up
// Example: "raphael-gaugain/discovery-call"
const CAL_LINK = "raphael-gaugain-cfjl0b/discovery-call";

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


// === Feature row: animates in dark mode, always visible in light mode ===
const FeatureRow = ({
  children,
  isReversed,
}: {
  children: ReactNode;
  isReversed: boolean;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("feat-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`feat-row grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center${isReversed ? " feat-row-reversed" : ""}`}
    >
      {children}
    </div>
  );
};

const App = () => {
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

  const openBooking = () => {
    setIsBookingOpen(true);
    setBookingReady(false);
    setBookingFading(false);
    setTimeout(() => {
      setBookingFading(true);
      setTimeout(() => setBookingReady(true), 600);
    }, 1400);
  };
  // Smooth scroll helper used by CTA buttons
  const scrollToSection = (id: string) => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(`#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };



  const [page, setPage] = useState<"home" | "for-business" | "ora-experience" | "not-found">("home");
  const [notFoundKey, setNotFoundKey] = useState(0);

  const navigateTo = (target: "home" | "for-business" | "ora-experience" | "not-found") => {
    if (target === "not-found") {
      setNotFoundKey((k) => k + 1);
      setPage("not-found");
    } else {
      if (target === page) return;
      setPage(target);
    }
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0 });
  };

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

  // Spotlight mouse tracking (RAF-throttled to avoid layout thrashing)
  useEffect(() => {
    const spotlight = document.getElementById("cursor-spotlight");
    if (!spotlight) return;

    let rafId = 0;
    let mx = 0;
    let my = 0;

    const tick = () => {
      rafId = 0;
      spotlight.style.transform = `translate3d(${mx}px,${my}px,0)`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      spotlight.style.opacity = "1";
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const handleMouseLeave = () => {
      spotlight.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
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
        ? "bg-[#fcfbf7]"
        : "bg-background"
        }`}
    >
      <style>{bubbleStyles}</style>

      {/* Spotlight */}
      <div id="cursor-spotlight" className="cursor-spotlight" />

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

      {page === "not-found" ? (
        <NotFoundPage key={notFoundKey} theme={theme} onNavigate={navigateTo} />
      ) : page === "for-business" ? (
        <ForBusinessPage theme={theme} openBooking={openBooking} />
      ) : page === "ora-experience" ? (
        <OraExperiencePage theme={theme} openBooking={openBooking} onNavigate={navigateTo} />
      ) : (
      <>

      <Hero
        theme={theme}
        scrollToSection={scrollToSection}
        openBooking={openBooking}
      />

      {/* FEATURES — alternating video + text rows */}
      <section id="features" className="relative -mt-16 pt-24 md:pt-32 pb-36 md:pb-56 px-6 md:px-12 bg-white dark:bg-background">
        <div className="features-heading text-center mb-20 md:mb-28">
          <FadeInOnScroll direction="up">
            <h2 className="font-poppins text-4xl md:text-[3.75rem] font-bold tracking-[-0.04em] leading-[1.12] text-[#111827] dark:text-white">
              Découvrez{" "}
              <span className="text-brand-gradient">Ora.</span>
            </h2>
          </FadeInOnScroll>
          <FadeInOnScroll direction="up" delay={180}>
            <p className="mt-5 text-[clamp(1rem,2vw,1.125rem)] leading-[1.75] text-gray-500 dark:text-gray-400 font-inter max-w-2xl mx-auto">
              Des automatisations concrètes, adaptées à vos données et à vos processus métier.
            </p>
          </FadeInOnScroll>
        </div>
        <div className="max-w-6xl mx-auto space-y-36 md:space-y-52">
          {[
            {
              tag: "Reporting",
              title: "Des rapports mensuels générés en quelques secondes",
              desc: "Ora collecte vos données, les nettoie, applique votre logique et génère des rapports impeccables, prêts à partager. Fini les soirées à formater des tableaux avant les réunions.",
              icon: TrendingUp,
              grad: "linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 50%, #f5f0ff 100%)",
              video: "/Montlhy_Repor.mov",
            },
            {
              tag: "Réconciliation",
              title: "Réconciliez des milliers de lignes sans effort",
              desc: "Relevés bancaires, factures, exports CRM... Ora croise vos sources, détecte les écarts et produit un fichier de réconciliation propre à chaque fois.",
              icon: ShieldCheck,
              grad: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
            },
            {
              tag: "Traitement de données",
              title: "Données brutes en entrée, résultats structurés en sortie",
              desc: "CSV, PDF, emails... quelle que soit la source, Ora extrait, normalise et redirige vos données au bon endroit. Votre équipe analyse les résultats, pas les lignes.",
              icon: Zap,
              grad: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fdf2f8 100%)",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isReversed = idx % 2 !== 0;

            return (
              <FeatureRow key={idx} isReversed={isReversed}>
                {/* Text side */}
                <div className={isReversed ? "lg:order-2" : ""}>
                  <div className="feat-child flex items-center gap-2.5 mb-5" style={{ "--feat-delay": "0ms" } as React.CSSProperties}>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-500 dark:text-blue-400">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="feat-child text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]" style={{ "--feat-delay": "90ms" } as React.CSSProperties}>
                    {item.title}
                  </h3>
                  <p className="feat-child mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-lg" style={{ "--feat-delay": "170ms" } as React.CSSProperties}>
                    {item.desc}
                  </p>
                </div>

                {/* Video side */}
                <div className={`feat-child${isReversed ? " lg:order-1" : ""}`} style={{ "--feat-delay": "60ms" } as React.CSSProperties}>
                  <div
                    className="rounded-[24px] overflow-hidden border border-gray-200/60 dark:border-white/[0.06]"
                    style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)" }}
                  >
                    {(item as typeof item & { video?: string }).video ? (
                      <video
                        src={(item as typeof item & { video?: string }).video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full aspect-[16/10] object-cover"
                      />
                    ) : (
                      <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-white/[0.03] flex items-center justify-center">
                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-white dark:bg-white/10 shadow-lg flex items-center justify-center cursor-pointer">
                            <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Voir la démo</span>
                        </div>
                        <div
                          className="absolute inset-0 opacity-60 dark:opacity-30"
                          style={{ background: item.grad }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </FeatureRow>
            );
          })}
        </div>
      </section>

      {/* ── L'EXPÉRIENCE ORA ────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-[#fcfbf7] dark:bg-[#0f172a]">
        <div className="max-w-5xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="font-poppins font-bold tracking-[-0.03em] text-3xl md:text-5xl leading-[1.12] text-[#111827] dark:text-white">
                L'expérience <span className="text-brand-gradient">Ora.</span>
              </h2>
              <p className="mt-4 mx-auto text-base leading-relaxed max-w-lg text-gray-500 dark:text-gray-400">
                Opérationnel en moins d'une semaine. Nous configurons tout pour vous, sans toucher à votre organisation actuelle.
              </p>
            </div>
          </FadeInOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: Database,
                title: "Ora s'intègre à Excel",
                desc: "Ora fonctionne comme une extension dans votre Excel existant. Vos fichiers restent les mêmes, Ora gère les automatisations en arrière-plan.",
              },
              {
                num: "02",
                icon: GitMerge,
                title: "Des automatisations sur mesure",
                desc: "Nous configurons vos premiers workflows avec vous. Et si vos besoins évoluent, vous pouvez demander de nouvelles automatisations à tout moment, sans délai.",
              },
              {
                num: "03",
                icon: CheckCircle2,
                title: "Laissez faire Ora, reprenez le contrôle",
                desc: "Ora s'occupe de la production. Rapports, réconciliations, envois automatiques : tout est prêt quand vous en avez besoin.",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeInOnScroll key={i} delay={i * 100}>
                  <div className="p-6 rounded-[22px] border border-gray-200/70 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
                        Étape {step.num}
                      </span>
                    </div>
                    <h3 className="font-poppins font-bold tracking-tight text-[1rem] leading-snug mb-2 text-[#111827] dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                      {step.desc}
                    </p>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>

          <FadeInOnScroll delay={350}>
            <div className="flex justify-center mt-10">
              <button
                onClick={() => navigateTo("ora-experience")}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150"
              >
                Découvrir l'expérience Ora
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-white dark:bg-[#111827]">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <div
              className="rounded-[32px] border border-blue-100 dark:border-blue-500/15 px-8 md:px-16 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center"
              style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%)" }}
            >
              {/* Left — pitch */}
              <div>
                <div className="inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 bg-blue-100 text-blue-700 border border-blue-200">
                  Appel découverte
                </div>
                <h2 className="font-poppins font-bold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.12] text-[#111827] mb-4">
                  30 minutes pour tout changer.
                </h2>
                <p className="text-base leading-relaxed text-gray-600 mb-8">
                  Un appel simple, sans jargon. Vous nous décrivez votre quotidien, on identifie ce qu'Ora peut automatiser. Vous repartez avec un plan concret.
                </p>
                <button
                  onClick={openBooking}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.42)] hover:-translate-y-px transition-all duration-150"
                >
                  Réserver mon appel
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
                </button>
                <p className="mt-3 text-[12px] text-gray-400">Gratuit · Sans engagement</p>
              </div>

              {/* Right — what to expect */}
              <div className="flex flex-col gap-5">
                {[
                  {
                    icon: Clock,
                    title: "30 minutes chrono",
                    desc: "Un format court et structuré, pensé pour aller à l'essentiel.",
                  },
                  {
                    icon: Zap,
                    title: "Identification de vos automatisations",
                    desc: "On passe en revue vos tâches répétitives et on repère ce qu'Ora peut prendre en charge immédiatement.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Un plan sur mesure",
                    desc: "Vous repartez avec une proposition concrète, adaptée à votre métier et vos outils actuels.",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/70 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-[14px] text-[#111827] mb-0.5">{item.title}</p>
                        <p className="text-[13px] leading-relaxed text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      </>
      )}

      {/* Booking modal — portal, visible on all pages */}
      {isBookingOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsBookingOpen(false); }}
        >
          {/* Loading screen with animated logo */}
          {!bookingReady && (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#fcfbf7] dark:bg-[#111827] ${bookingFading ? "booking-loading-screen fade-out" : ""}`}>
              <OraLogoSpinner gradientId="g-booking" size={72} />
              <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">Chargement du calendrier...</p>
            </div>
          )}

          <div className={`relative w-full max-w-3xl transition-all duration-500 ${bookingReady ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <Card className="relative overflow-hidden border-0 shadow-2xl rounded-[28px] bg-white dark:bg-[#111827]">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="absolute right-5 top-5 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-5">
                {/* LEFT — Brand panel */}
                <div className="md:col-span-2 bg-gradient-to-br from-[#3b82f6] to-[#0d9488] p-6 md:p-8 flex flex-col justify-between text-white overflow-hidden min-h-[220px] md:min-h-0 rounded-t-[26px] md:rounded-l-[26px] md:rounded-tr-none">
                  <div>
                    <img src="/logos/logo-white.png" alt="Ora" className="h-7 w-auto" />
                    <h3 className="mt-5 text-xl md:text-2xl font-semibold leading-snug text-white">
                      Réservez un appel découverte
                    </h3>
                    <p className="mt-3 text-white/75 text-sm leading-relaxed">
                      Dites-nous ce que vous souhaitez automatiser. Nous analyserons vos processus et reviendrons avec les prochaines étapes.
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white/90">30 min · Gratuit · Sans engagement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white/90">Plan d'automatisation sur mesure</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white/90">Vos données restent privées</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT — Cal.com embed */}
                <div className="md:col-span-3 relative p-2 md:p-3 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                  {CAL_LINK ? (
                    <Cal
                      calLink={CAL_LINK}
                      style={{ width: "100%", height: "100%", overflow: "auto" }}
                      config={{
                        layout: "month_view" as const,
                        theme: theme === "dark" ? "dark" : "light",
                        lang: "fr",
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
                      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                        <Clock className="w-7 h-7 text-blue-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Réservation bientôt disponible
                      </h4>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Notre système de prise de rendez-vous est en cours de configuration.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>,
        document.body
      )}


      {/* FOOTER — visible on all pages */}
      <FadeInOnScroll>
        <OraFooter
          onNavigate={navigateTo}
          onBookCall={openBooking}
          theme={theme}
        />
      </FadeInOnScroll>

    </div>
  );
};

export default App;

