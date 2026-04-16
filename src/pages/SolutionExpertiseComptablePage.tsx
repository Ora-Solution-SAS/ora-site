/**
 * SolutionExpertiseComptablePage — Page Solution : Expertise Comptable
 *
 * Basée sur SolutionTemplatePage.
 * Illustration : "Transformation Card" — panneau épuré montrant 3 tâches
 * comptables automatisées (avant → après). Système visuel simple et
 * adaptable à chaque métier : modifier les 3 lignes et le badge suffit.
 */

import { useState, useEffect } from "react";
import {
  ArrowRight, RefreshCcw, Clock, FileText,
  BarChart3, Zap, Star, CheckCircle, Folder,
} from "lucide-react";

/* ── Page identity ───────────────────────────────────────────────── */
const METIER_BADGE  = "Ora pour les Experts-Comptables";
const METIER_NAME   = "l'Expertise Comptable";
const HERO_TITLE_L1 = "Votre cabinet,";
const HERO_TITLE_L2 = "libéré du superflu.";

/* ── Solutions métier ────────────────────────────────────────────── */
const solutions = [
  {
    icon: RefreshCcw,
    title: "Rapprochements automatisés",
    desc: "Vos rapprochements bancaires et intercomptes sont traités en quelques minutes. Ora croise vos relevés avec vos écritures et signale chaque écart sans intervention manuelle.",
  },
  {
    icon: Clock,
    title: "Clôtures accélérées",
    desc: "Réduisez votre cycle de clôture de plusieurs jours à quelques heures. Ora automatise les écritures récurrentes, les relances de pièces et la consolidation.",
  },
  {
    icon: FileText,
    title: "Liasses fiscales préparées",
    desc: "Préparez vos déclarations TVA et liasses fiscales directement depuis vos fichiers Excel. Moins d'erreurs, moins de ressaisie, plus de sérénité en période de dépôt.",
  },
  {
    icon: BarChart3,
    title: "Reporting client automatisé",
    desc: "Générez et envoyez automatiquement les tableaux de bord de vos clients chaque mois. Le bon rapport, à la bonne personne, au bon moment.",
  },
  {
    icon: Zap,
    title: "Détection des anomalies",
    desc: "Ora surveille vos fichiers et vous alerte dès qu'une écriture est douteuse, un solde anormal ou un seuil critique franchi. Anticipez au lieu de subir.",
  },
  {
    icon: Folder,
    title: "Dossiers de révision simplifiés",
    desc: "Constituez et mettez à jour vos dossiers de révision sans travail de mise en forme. Ora structure, classe et vérifie pour vous, mission après mission.",
  },
];

/* ── Testimonials ────────────────────────────────────────────────── */
const testimonials = [
  {
    quote: "Nos rapprochements bancaires prenaient une journée entière chaque mois. Avec Ora, c'est vingt minutes. Un vrai soulagement pour toute l'équipe.",
    name: "Julie Bernard",
    role: "Expert-comptable associée",
    company: "BDC & Associés",
    stars: 5,
  },
  {
    quote: "La préparation des liasses, c'était le cauchemar de fin d'exercice. Ora a automatisé 80% de la saisie. On se concentre enfin sur le conseil à valeur ajoutée.",
    name: "Pierre Moreau",
    role: "Directeur de cabinet",
    company: "Moreau Expertise",
    stars: 5,
  },
  {
    quote: "En trois jours, on a connecté Ora à nos fichiers Excel existants. Nos clients reçoivent maintenant leur tableau de bord automatiquement chaque semaine.",
    name: "Camille Rousseau",
    role: "Responsable de mission",
    company: "Expertise & Conseil",
    stars: 5,
  },
];

/* ── Stat pills hero ─────────────────────────────────────────────── */
const heroStats = [
  { value: "5h+",      label: "récupérées / semaine" },
  { value: "0",        label: "saisie manuelle" },
  { value: "< 1 sem",  label: "pour démarrer" },
];

/* ── CSS local ───────────────────────────────────────────────────── */
const pageCSS = `
/* ── Hero stagger ── */
@keyframes ecFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ec-stagger { opacity: 0; }
.ec-ready .ec-stagger {
  animation: ecFadeUp 0.85s cubic-bezier(.22,1,.36,1) forwards;
}
.ec-d1 { animation-delay:  60ms; }
.ec-d2 { animation-delay: 180ms; }
.ec-d3 { animation-delay: 300ms; }
.ec-d4 { animation-delay: 420ms; }
.ec-d5 { animation-delay: 540ms; }

/* ── Illustration entrance ── */
.ec-illus { opacity: 0; }
.ec-ready .ec-illus {
  animation: ecFadeUp 1s cubic-bezier(.22,1,.36,1) 500ms forwards;
}

/* ── Logo Ora : pulse doux au point de convergence ── */
@keyframes ecLogoPulse {
  0%, 100% { transform: scale(1);    opacity: 0.88; }
  50%       { transform: scale(1.10); opacity: 1;    }
}
.ec-logo-pulse {
  transform-box: fill-box;
  transform-origin: center;
}
.ec-ready .ec-logo-pulse {
  animation: ecLogoPulse 3.2s ease-in-out infinite;
  animation-delay: 1.5s;
}

/* ── Card reveal on scroll ── */
@keyframes ecCardIn {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ec-card { opacity: 0; }
.ec-card.visible {
  animation: ecCardIn 0.7s cubic-bezier(.22,1,.36,1) forwards;
}

/* ── Testimonial reveal ── */
@keyframes ecTestiIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ec-testi { opacity: 0; }
.ec-testi.visible {
  animation: ecTestiIn 0.65s cubic-bezier(.22,1,.36,1) forwards;
}

`;

/* ════════════════════════════════════════════════════════════════════
   Illustration SVG — Expertise Comptable
   Concept : "Chaos → Ordre"
   Des flux financiers désorganisés (factures éparpillées) convergent
   vers un unique point, d'où émerge une seule flèche propre et droite.
════════════════════════════════════════════════════════════════════ */

/* Positions des factures : [cx, cy, rotation, largeur, hauteur] */
const INVOICES: [number, number, number, number, number][] = [
  [52,  38, -13, 44, 30],
  [36, 104,   9, 46, 28],
  [70, 172,  -7, 40, 28],
  [32, 244,  14, 46, 30],
  [118, 52, -19, 38, 26],
  [104, 208,  8, 42, 28],
];

/* Point de convergence */
const CX = 224, CY = 152;

/* Courbes de connexion : control points pour chaque facture */
const CONTROLS: [number, number][] = [
  [148,  76],
  [138, 124],
  [150, 160],
  [138, 208],
  [170,  86],
  [160, 190],
];

function MetierIllustration({ dk }: { dk: boolean }) {
  const invoiceFill   = dk ? "rgba(255,255,255,0.04)"  : "rgba(255,255,255,0.88)";
  const invoiceStroke = dk ? "rgba(255,255,255,0.16)"  : "rgba(15,23,42,0.14)";
  const invoiceLine   = dk ? "rgba(255,255,255,0.09)"  : "rgba(0,0,0,0.09)";
  const connStroke    = dk ? "rgba(99,155,246,0.32)"   : "rgba(59,130,246,0.20)";

  return (
    <svg
      viewBox="0 0 460 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 480, height: "auto" }}
      aria-hidden
    >
      <defs>
        {/* Gradient pour l'illustration (connecteurs, accents) */}
        <linearGradient id="ec-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        {/* Gradient pour la flèche — userSpaceOnUse pour fonctionner sur un line/path */}
        <linearGradient id="ec-arrow-g" x1={CX + 8} y1={CY} x2="420" y2={CY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <filter id="ec-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ec-glow-s" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Halo doux autour du point de convergence ── */}
      <ellipse cx={CX} cy={CY} rx="70" ry="55"
        fill={dk ? "rgba(59,130,246,0.10)" : "rgba(59,130,246,0.07)"}
        style={{ filter: "blur(38px)" }} />

      {/* ── Halo doux sur la flèche ── */}
      <ellipse cx="350" cy={CY} rx="100" ry="28"
        fill={dk ? "rgba(13,148,136,0.07)" : "rgba(13,148,136,0.05)"}
        style={{ filter: "blur(24px)" }} />

      {/* ── Factures + connecteurs ── */}
      {INVOICES.map(([cx, cy, rot, w, h], i) => {
        const [qx, qy] = CONTROLS[i];
        /* dasharray alterne : certains traits pleins, d'autres pointillés */
        const dash = i % 3 === 0 ? "5 3.5" : i % 3 === 1 ? "none" : "2.5 4";
        const connOpacity = 0.55 + i * 0.05;

        return (
          <g key={i}>
            {/* Connecteur courbe : facture → convergence */}
            <path
              d={`M${cx},${cy} Q${qx},${qy} ${CX},${CY}`}
              stroke={connStroke}
              strokeWidth={i % 2 === 0 ? "1" : "0.85"}
              strokeDasharray={dash}
              fill="none"
              opacity={connOpacity}
            />

            {/* Facture (rect pivoté, style "brouillon") */}
            <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
              <rect
                x={-w / 2} y={-h / 2}
                width={w} height={h} rx="3"
                fill={invoiceFill}
                stroke={invoiceStroke}
                strokeWidth="1"
                style={{
                  filter: `drop-shadow(0 2px 6px ${dk ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.06)"})`,
                }}
              />
              {/* Lignes internes — simulent du texte/données */}
              <line x1={-w / 2 + 6} y1={-h / 2 + 8}  x2={w / 2 - 8}  y2={-h / 2 + 8}  stroke={invoiceLine} strokeWidth="0.9" />
              <line x1={-w / 2 + 6} y1={-h / 2 + 14} x2={w / 2 - 12} y2={-h / 2 + 14} stroke={invoiceLine} strokeWidth="0.9" />
              {h > 26 && (
                <line x1={-w / 2 + 6} y1={-h / 2 + 20} x2={w / 2 - 16} y2={-h / 2 + 20} stroke={invoiceLine} strokeWidth="0.9" />
              )}
              {/* Petit accent coloré en haut à droite de chaque facture */}
              <rect
                x={w / 2 - 12} y={-h / 2 + 4}
                width={8} height={5} rx="1.5"
                fill={i % 2 === 0 ? "#3b82f6" : "#0d9488"}
                opacity="0.35"
              />
            </g>
          </g>
        );
      })}

      {/* ── Logo Ora au point de convergence (animé) ── */}
      {/* Halo doux derrière le logo */}
      <circle cx={CX} cy={CY} r="28"
        fill={dk ? "rgba(59,130,246,0.10)" : "rgba(59,130,246,0.07)"}
        style={{ filter: "blur(10px)" }} />
      {/* Cercle de fond */}
      <circle cx={CX} cy={CY} r="22"
        fill={dk ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)"}
        stroke={dk ? "rgba(59,130,246,0.30)" : "rgba(59,130,246,0.18)"}
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 4px 14px ${dk ? "rgba(0,0,0,0.40)" : "rgba(59,130,246,0.14)"})` }}
      />
      {/* Logo icon Ora avec pulse */}
      <g className="ec-logo-pulse">
        <image
          href="/logos/icon-color.png"
          x={CX - 13} y={CY - 13}
          width="26" height="26"
        />
      </g>

      {/* ── Flèche propre (gradient bleu → teal) ── */}
      {/* Halo doux sous la flèche */}
      <line
        x1={CX + 24} y1={CY}
        x2="420" y2={CY}
        stroke="#3b82f6"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.09"
      />
      {/* Ligne principale avec gradient userSpaceOnUse */}
      <line
        x1={CX + 24} y1={CY}
        x2="416" y2={CY}
        stroke="url(#ec-arrow-g)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Pointe de flèche */}
      <polygon
        points={`416,${CY - 9} 436,${CY} 416,${CY + 9}`}
        fill="#0d9488"
        filter="url(#ec-glow)"
      />

      {/* ── Points décoratifs ── */}
      {([[14, 20], [446, 18], [14, 284], [446, 282]] as [number, number][]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5"
          fill="#3b82f6" opacity={0.10 + i * 0.03} />
      ))}
    </svg>
  );
}

/* ── Props ───────────────────────────────────────────────────────── */
interface Props {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: "home" | "for-business" | "ora-experience" | "solution-template" | "solution-expertise-comptable" | "not-found") => void;
}

/* ════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════════════════════════ */
export default function SolutionExpertiseComptablePage({ theme, openBooking, onNavigate }: Props) {
  const dk = theme === "dark";
  const [ready, setReady] = useState(false);

  /* Mount */
  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    window.scrollTo({ top: 0 });
  }, []);

  /* Scroll-triggered card reveal */
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".ec-card, .ec-testi");
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            setTimeout(() => el.classList.add("visible"), parseInt(delay, 10));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  /* ── Design tokens ─────────────────────────────────────────────── */
  const bg             = dk ? "#111827" : "#fcfbf7";
  const bgContrast     = dk ? "#0f172a" : "#ffffff";
  const textPrimary    = dk ? "text-white"    : "text-gray-900";
  const textSecondary  = dk ? "text-gray-400" : "text-gray-500";
  const borderMuted    = dk ? "border-white/[0.07]" : "border-gray-200/70";
  const cardBg         = dk ? "bg-white/[0.03]" : "bg-white";

  return (
    <div className={ready ? "ec-ready" : ""}>
      <style>{pageCSS}</style>

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32 px-6 lg:px-10"
        style={{ background: bg }}
      >
        {/* Halo arrière-plan */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full"
            style={{
              background: dk
                ? "radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 65%)"
                : "radial-gradient(ellipse, rgba(191,220,255,0.48) 0%, transparent 65%)",
              filter: "blur(72px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── Colonne gauche : copy ── */}
            <div className="max-w-[540px]">

              {/* Badge */}
              <div
                className={[
                  "ec-stagger ec-d1",
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full",
                  "text-[11px] font-inter font-semibold uppercase tracking-[0.16em] mb-7",
                  dk
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-blue-50 text-blue-600 border border-blue-100",
                ].join(" ")}
              >
                {METIER_BADGE}
              </div>

              {/* Titre */}
              <h1
                className={[
                  "ec-stagger ec-d2",
                  "font-poppins text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]",
                  textPrimary,
                ].join(" ")}
              >
                <span className="block">{HERO_TITLE_L1}</span>
                <span className="block text-brand-gradient">{HERO_TITLE_L2}</span>
              </h1>

              {/* Sous-titre */}
              <p
                className={[
                  "ec-stagger ec-d3",
                  "font-inter mt-6 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.8]",
                  textSecondary,
                ].join(" ")}
              >
                Ora automatise vos rapprochements, clôtures et liasses fiscales
                directement depuis Excel. Vos collaborateurs se concentrent sur
                ce qui compte : le conseil à valeur ajoutée.
              </p>

              {/* CTA */}
              <div className="ec-stagger ec-d4 mt-9">
                <button
                  onClick={openBooking}
                  className={[
                    "group inline-flex items-center gap-2.5 px-7 py-3.5",
                    "rounded-full text-[15px] font-inter font-semibold text-white",
                    "transition-all duration-150 hover:-translate-y-px active:translate-y-0",
                    "bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600",
                    "shadow-[0_1px_3px_rgba(0,0,0,0.10),0_8px_24px_rgba(37,99,235,0.32)]",
                    "hover:shadow-[0_1px_3px_rgba(0,0,0,0.10),0_10px_32px_rgba(37,99,235,0.44)]",
                  ].join(" ")}
                >
                  Réserver un appel découverte
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-[3px] transition-all duration-150" />
                </button>
              </div>

              {/* Stats pills */}
              <div className="ec-stagger ec-d5 mt-10 flex flex-wrap gap-3">
                {heroStats.map((s) => (
                  <div
                    key={s.label}
                    className={[
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-inter border",
                      dk
                        ? "bg-white/[0.04] border-white/[0.08] text-gray-300"
                        : "bg-white border-gray-200/60 text-gray-600",
                    ].join(" ")}
                  >
                    <span className="font-semibold text-blue-500">{s.value}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Colonne droite : illustration ── */}
            <div className="ec-illus flex justify-center items-center">
              <MetierIllustration dk={dk} />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. SOLUTIONS METIER
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-10"
        style={{ background: bgContrast }}
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2
              className={[
                "font-poppins text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]",
                textPrimary,
              ].join(" ")}
            >
              Ce qu'Ora fait pour vous
            </h2>
            <p className={["font-inter mt-4 text-[1.05rem] leading-relaxed", textSecondary].join(" ")}>
              Des automatisations concrètes, adaptées aux enjeux de{" "}
              {METIER_NAME}. Opérationnelles en moins d'une semaine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((sol, i) => {
              const Icon = sol.icon;
              return (
                <div
                  key={i}
                  className={[
                    "ec-card p-7 rounded-[20px] border transition-colors duration-200",
                    borderMuted, cardBg,
                    dk ? "hover:bg-white/[0.05]" : "hover:bg-gray-50/70",
                  ].join(" ")}
                  data-delay={String(i * 80)}
                >
                  <div
                    className={[
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-5",
                      dk ? "bg-blue-500/10" : "bg-blue-50",
                    ].join(" ")}
                  >
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3
                    className={[
                      "font-poppins text-[16px] font-semibold tracking-tight leading-snug mb-2",
                      textPrimary,
                    ].join(" ")}
                  >
                    {sol.title}
                  </h3>
                  <p className={["font-inter text-[14px] leading-relaxed", textSecondary].join(" ")}>
                    {sol.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Callout Excel ── */}
          <div
            className={[
              "mt-12 flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-5 rounded-2xl border",
              borderMuted,
              dk ? "bg-white/[0.025]" : "bg-blue-50/40",
            ].join(" ")}
          >
            <p className={["font-inter text-[15px] leading-relaxed flex-1", textSecondary].join(" ")}>
              Ora se branche directement sur vos fichiers Excel existants.
              Aucune migration, aucune refonte de processus.
            </p>
            <button
              onClick={() => onNavigate("ora-experience")}
              className={[
                "font-inter text-[14px] font-semibold whitespace-nowrap",
                "flex items-center gap-1.5 shrink-0",
                "hover:gap-2.5 transition-all duration-150",
                dk ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700",
              ].join(" ")}
            >
              L'expérience Ora
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-10"
        style={{ background: bg }}
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16 max-w-xl mx-auto">
            <p
              className={[
                "font-inter text-[11px] font-semibold uppercase tracking-[0.18em] mb-4",
                dk ? "text-blue-400" : "text-blue-600",
              ].join(" ")}
            >
              Témoignages
            </p>
            <h2
              className={[
                "font-poppins text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]",
                textPrimary,
              ].join(" ")}
            >
              Vrais professionnels.
              <br />
              Vrais résultats.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={[
                  "ec-testi flex flex-col gap-5 p-7 rounded-[20px] border",
                  borderMuted, cardBg,
                ].join(" ")}
                data-delay={String(i * 100)}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <blockquote
                  className={["font-inter text-[15px] leading-relaxed flex-1", textSecondary].join(" ")}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-2 border-t border-inherit">
                  <div
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      "font-inter text-[13px] font-semibold",
                      dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-600",
                    ].join(" ")}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className={["font-inter text-[13px] font-semibold", textPrimary].join(" ")}>
                      {t.name}
                    </p>
                    <p className={["font-inter text-[12px]", textSecondary].join(" ")}>
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CTA
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-28 px-6 lg:px-10"
        style={{ background: bgContrast }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className={[
              "rounded-[32px] px-10 py-16 border",
              borderMuted,
              dk ? "bg-white/[0.03]" : "bg-gray-50/80",
            ].join(" ")}
          >
            <CheckCircle className="w-10 h-10 text-blue-500 mx-auto mb-6" />

            <h2
              className={[
                "font-poppins text-[clamp(1.6rem,3vw,2.5rem)] font-semibold tracking-[-0.03em]",
                textPrimary,
              ].join(" ")}
            >
              Prêt à transformer votre cabinet ?
            </h2>

            <p className={["font-inter mt-4 text-[1.05rem] leading-relaxed", textSecondary].join(" ")}>
              30 minutes, sans engagement. On vous montre ce qu'Ora peut automatiser
              dans votre cabinet dès la première semaine.
            </p>

            <button
              onClick={openBooking}
              className={[
                "mt-9 group inline-flex items-center gap-2.5 px-8 py-4",
                "rounded-full text-[15px] font-inter font-semibold text-white",
                "transition-all duration-150 hover:-translate-y-px active:translate-y-0",
                "bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600",
                "shadow-[0_4px_20px_rgba(37,99,235,0.28)]",
                "hover:shadow-[0_6px_28px_rgba(37,99,235,0.42)]",
              ].join(" ")}
            >
              Réserver un appel gratuit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
            </button>

            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {["Sans engagement", "Démarrage en moins d'une semaine", "Support dédié inclus"].map((label) => (
                <span
                  key={label}
                  className={["font-inter flex items-center gap-1.5 text-[13px]", textSecondary].join(" ")}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
