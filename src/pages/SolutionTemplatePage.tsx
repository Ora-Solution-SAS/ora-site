/**
 * SolutionTemplatePage — Template de page Solution par métier
 *
 * Usage : dupliquer ce fichier pour chaque métier cible.
 * Personnaliser les constantes METIER_BADGE, METIER_NAME, HERO_TITLE_*,
 * solutions[], testimonials[], heroStats[] et le composant MetierIllustration.
 *
 * Sections :
 *  1. Hero — titre fixe + illustration métier SVG
 *  2. Solution cards — cas d'usage métier
 *  3. Testimonials — "Vrais professionnels, vrais résultats"
 *  4. CTA — réservation d'appel
 */

import { useState, useEffect } from "react";
import {
  ArrowRight, BarChart3, FileText, Mail, Zap,
  Star, CheckCircle, Clock, RefreshCcw,
} from "lucide-react";

/* ── Page identity — à personnaliser par métier ──────────────────── */
const METIER_BADGE  = "Ora pour la Finance";           // badge dans la bulle hero
const METIER_NAME   = "la Finance & le Contrôle de gestion"; // pour la section 2
const HERO_TITLE_L1 = "Vos cycles financiers,";
const HERO_TITLE_L2 = "automatisés par Ora.";

/* ── Solutions métier — à personnaliser ──────────────────────────── */
const solutions = [
  {
    icon: BarChart3,
    title: "Reporting automatisé",
    desc: "Générez vos tableaux de bord financiers en quelques secondes. Ora agrège vos sources Excel, met à jour vos KPIs et diffuse vos rapports automatiquement.",
  },
  {
    icon: FileText,
    title: "Clôtures accélérées",
    desc: "Réduisez votre cycle de clôture de plusieurs jours à quelques heures. Ora automatise les écritures récurrentes et les rapprochements internes.",
  },
  {
    icon: Mail,
    title: "Diffusion automatique",
    desc: "Planifiez l'envoi de vos reportings par e-mail, à la bonne personne, au bon moment. Zéro oubli, zéro pièce jointe incorrecte.",
  },
  {
    icon: Zap,
    title: "Alertes intelligentes",
    desc: "Recevez une alerte proactive dès qu'un indicateur franchit un seuil critique. Ora surveille vos données 24h/24.",
  },
  {
    icon: Clock,
    title: "Gain de temps mesurable",
    desc: "En moyenne, nos clients récupèrent 5 heures par semaine dès le premier mois. Un ROI immédiat, sans changer vos outils.",
  },
  {
    icon: RefreshCcw,
    title: "Synchronisation en temps réel",
    desc: "Vos fichiers Excel, Google Sheets et vos e-mails sont synchronisés en continu. Vos données sont toujours à jour.",
  },
];

/* ── Testimonials — à personnaliser ──────────────────────────────── */
const testimonials = [
  {
    quote: "Avant Ora, mes clôtures mensuelles me prenaient 3 jours entiers. Aujourd'hui, c'est 4 heures. Mes équipes peuvent enfin se concentrer sur l'analyse.",
    name: "Marie Durand",
    role: "Directrice Administrative et Financière",
    company: "Groupe Lemaire",
    stars: 5,
  },
  {
    quote: "Fini les erreurs de copier-coller. Nos reportings sont générés et envoyés automatiquement chaque lundi matin. Un gain de temps considérable pour toute l'équipe.",
    name: "Thomas Petit",
    role: "Contrôleur de gestion",
    company: "Nexio SAS",
    stars: 5,
  },
  {
    quote: "L'intégration avec Excel était mon critère numéro un. Ora s'est connecté à nos fichiers existants en moins d'une semaine. Le résultat est bluffant.",
    name: "Sophie Martin",
    role: "Responsable Comptable",
    company: "Atelier Créatif",
    stars: 5,
  },
];

/* ── Stat pills hero ─────────────────────────────────────────────── */
const heroStats = [
  { value: "5h+",     label: "récupérées / semaine" },
  { value: "0",       label: "erreur de saisie" },
  { value: "< 1 sem", label: "pour démarrer" },
];

/* ── CSS local ───────────────────────────────────────────────────── */
const pageCSS = `
/* ── Hero stagger ── */
@keyframes solFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sol-stagger { opacity: 0; }
.sol-ready .sol-stagger {
  animation: solFadeUp 0.85s cubic-bezier(.22,1,.36,1) forwards;
}
.sol-d1 { animation-delay:  60ms; }
.sol-d2 { animation-delay: 180ms; }
.sol-d3 { animation-delay: 300ms; }
.sol-d4 { animation-delay: 420ms; }
.sol-d5 { animation-delay: 540ms; }

/* ── Illustration entrance ── */
.sol-illus { opacity: 0; }
.sol-ready .sol-illus {
  animation: solFadeUp 1s cubic-bezier(.22,1,.36,1) 500ms forwards;
}

/* ── Card reveal on scroll ── */
@keyframes solCardIn {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sol-card { opacity: 0; }
.sol-card.visible {
  animation: solCardIn 0.7s cubic-bezier(.22,1,.36,1) forwards;
}

/* ── Testimonial reveal ── */
@keyframes solTestiIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sol-testi { opacity: 0; }
.sol-testi.visible {
  animation: solTestiIn 0.65s cubic-bezier(.22,1,.36,1) forwards;
}
`;

/* ════════════════════════════════════════════════════════════════════
   Illustration SVG — Finance & Contrôle de gestion
   À remplacer par une illustration adaptée à chaque métier.
════════════════════════════════════════════════════════════════════ */
function MetierIllustration({ dk }: { dk: boolean }) {
  const panelFill   = dk ? "rgba(255,255,255,0.028)" : "rgba(255,255,255,0.95)";
  const gridStroke  = dk ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.05)";
  const textMuted   = dk ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.28)";
  const dotFill     = dk ? "#111827" : "#ffffff";
  const badgeBg1    = dk ? "rgba(59,130,246,0.14)" : "rgba(59,130,246,0.07)";
  const badgeBg2    = dk ? "rgba(13,148,136,0.14)" : "rgba(13,148,136,0.07)";
  const badgeStr1   = dk ? "rgba(59,130,246,0.55)" : "rgba(59,130,246,0.35)";
  const badgeStr2   = dk ? "rgba(13,148,136,0.55)" : "rgba(13,148,136,0.35)";
  const donutTrack  = dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  // Circumference for r=38: 2π×38 ≈ 238.8 → 75% ≈ 179, 25% ≈ 60
  const donutDash   = "179 60";

  return (
    <svg
      viewBox="0 0 460 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 480, height: "auto" }}
      aria-hidden
    >
      <defs>
        {/* Gradient bleu → teal (horizontal) */}
        <linearGradient id="fi-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        {/* Gradient teal → bleu */}
        <linearGradient id="fi-h2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        {/* Gradient area fill (transparent vers le bas) */}
        <linearGradient id="fi-area" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
        </linearGradient>
        {/* Gradient contour panel */}
        <linearGradient id="fi-panel-str" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.28" />
        </linearGradient>
        {/* Glow doux (ligne principale) */}
        <filter id="fi-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Glow fort (point culminant + badge texte) */}
        <filter id="fi-glow-s" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Clip au périmètre du panel */}
        <clipPath id="fi-clip">
          <rect x="32" y="44" width="268" height="197" rx="16" />
        </clipPath>
      </defs>

      {/* ── Halo ambiant derrière le panel ── */}
      <ellipse cx="166" cy="142" rx="190" ry="150"
        fill={dk ? "rgba(59,130,246,0.07)" : "rgba(59,130,246,0.05)"}
        style={{ filter: "blur(52px)" }} />

      {/* ═══════════════════════════════════════
          PANEL PRINCIPAL
      ═══════════════════════════════════════ */}
      <rect x="32" y="44" width="268" height="197" rx="16"
        fill={panelFill}
        stroke="url(#fi-panel-str)" strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 10px 40px ${dk ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.07)"})` }} />

      {/* Bande header du panel */}
      <rect x="33.5" y="45.5" width="265" height="36" rx="15"
        fill={dk ? "rgba(59,130,246,0.07)" : "rgba(59,130,246,0.04)"} />
      <line x1="32" y1="81" x2="300" y2="81"
        stroke="url(#fi-h)" strokeWidth="0.8" opacity="0.3" />

      {/* Trois points colorés (fenêtre fictive) */}
      <circle cx="54" cy="63" r="4.5" fill="#3b82f6" opacity="0.75"
        filter="url(#fi-glow)" />
      <circle cx="69" cy="63" r="4.5" fill="#0d9488" opacity="0.65" />
      <circle cx="84" cy="63" r="4.5"
        fill={dk ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)"} />

      {/* Label fictif dans le header */}
      <rect x="104" y="57" width="92" height="11" rx="5.5"
        fill={dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.055)"} />
      <rect x="204" y="57" width="52" height="11" rx="5.5"
        fill="url(#fi-h)" opacity="0.28" />

      {/* ── Grille horizontale ── */}
      {[102, 120, 138, 157, 175, 194].map((y) => (
        <line key={y} x1="46" y1={y} x2="288" y2={y}
          stroke={gridStroke} strokeWidth="1"
          clipPath="url(#fi-clip)" />
      ))}

      {/* ── Labels axe Y (gauche, hors panel) ── */}
      {[["100k", 106], ["75k", 138], ["50k", 175]].map(([lbl, y]) => (
        <text key={lbl} x="28" y={Number(y) + 4}
          fontSize="7.5" fill={textMuted}
          textAnchor="end" fontFamily="Inter, sans-serif">
          {lbl}
        </text>
      ))}

      {/* ── Zone de remplissage sous la courbe principale ── */}
      <path
        d="M46,210 L90,178 L134,155 L178,132 L216,112 L258,93 L288,79 L288,239 L46,239 Z"
        fill="url(#fi-area)"
        clipPath="url(#fi-clip)" />

      {/* ── Courbe principale (bleu, néon doux) ── */}
      <path
        d="M46,210 L90,178 L134,155 L178,132 L216,112 L258,93 L288,79"
        stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#fi-glow)"
        clipPath="url(#fi-clip)" />

      {/* ── Courbe secondaire (teal, pointillés) ── */}
      <path
        d="M46,222 L90,204 L134,187 L178,172 L216,157 L258,145 L288,138"
        stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="5.5 3.5" opacity="0.6"
        clipPath="url(#fi-clip)" />

      {/* ── Point de données médian (cercle ouvert) ── */}
      <circle cx="178" cy="132" r="4.5"
        fill={dotFill} stroke="#3b82f6" strokeWidth="2.2"
        filter="url(#fi-glow)" />

      {/* ── Point culminant (filled, fort néon) ── */}
      <circle cx="288" cy="79" r="6"
        fill="#3b82f6" filter="url(#fi-glow-s)" />

      {/* ── Labels mois (axe X) ── */}
      {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"].map((m, i) => (
        <text key={m} x={46 + i * 48} y="254"
          fontSize="8" fill={textMuted}
          textAnchor="middle" fontFamily="Inter, sans-serif">
          {m}
        </text>
      ))}

      {/* ═══════════════════════════════════════
          BADGE FLOTTANT 1 : ROI (haut-droite)
      ═══════════════════════════════════════ */}
      {/* Glow derrière le badge */}
      <rect x="311" y="45" width="86" height="58" rx="13"
        fill="none" stroke="#3b82f6" strokeWidth="6" opacity="0.06"
        style={{ filter: "blur(4px)" }} />
      <rect x="311" y="45" width="86" height="58" rx="13"
        fill={badgeBg1} stroke={badgeStr1} strokeWidth="1.2" />
      <text x="354" y="70" fontSize="15" fill="#3b82f6"
        textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700"
        filter="url(#fi-glow)">
        +23.4 %
      </text>
      <text x="354" y="86" fontSize="8.5" fill={textMuted}
        textAnchor="middle" fontFamily="Inter, sans-serif">
        productivité
      </text>
      {/* Connecteur vers le point culminant */}
      <line x1="311" y1="74" x2="295" y2="79"
        stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2.5" opacity="0.35" />

      {/* ═══════════════════════════════════════
          BADGE FLOTTANT 2 : temps (bas-gauche)
      ═══════════════════════════════════════ */}
      <rect x="32" y="266" width="92" height="58" rx="13"
        fill="none" stroke="#0d9488" strokeWidth="6" opacity="0.06"
        style={{ filter: "blur(4px)" }} />
      <rect x="32" y="266" width="92" height="58" rx="13"
        fill={badgeBg2} stroke={badgeStr2} strokeWidth="1.2" />
      <text x="78" y="291" fontSize="15" fill="#0d9488"
        textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700"
        filter="url(#fi-glow)">
        5h / sem
      </text>
      <text x="78" y="307" fontSize="8.5" fill={textMuted}
        textAnchor="middle" fontFamily="Inter, sans-serif">
        récupérées
      </text>

      {/* ═══════════════════════════════════════
          MINI BARRES (centre bas)
      ═══════════════════════════════════════ */}
      {[30, 44, 25, 55, 38, 60, 46].map((h, i) => (
        <rect key={i}
          x={155 + i * 22} y={338 - h} width="14" height={h} rx="3"
          fill="url(#fi-h)"
          opacity={0.22 + i * 0.07} />
      ))}
      <text x="240" y="352" fontSize="7.5" fill={textMuted}
        textAnchor="middle" fontFamily="Inter, sans-serif">
        Heures économisées / semaine
      </text>

      {/* ═══════════════════════════════════════
          DONUT (bas-droite)
      ═══════════════════════════════════════ */}
      {/* Piste */}
      <circle cx="392" cy="302" r="38"
        stroke={donutTrack} strokeWidth="10" fill="none" />
      {/* Arc progressif (75%) avec néon */}
      <circle cx="392" cy="302" r="38"
        stroke="url(#fi-h2)" strokeWidth="10" fill="none"
        strokeDasharray={donutDash}
        strokeLinecap="round"
        transform="rotate(-90 392 302)"
        filter="url(#fi-glow)" />
      {/* Label central */}
      <text x="392" y="298" fontSize="12" fill={dk ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)"}
        textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700">
        75 %
      </text>
      <text x="392" y="312" fontSize="7.5" fill={textMuted}
        textAnchor="middle" fontFamily="Inter, sans-serif">
        automatisé
      </text>

      {/* ── Points décoratifs ── */}
      {([[14, 28], [448, 20], [14, 362], [450, 348], [336, 160]] as [number, number][]).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.8"
          fill="#3b82f6" opacity={0.13 + i * 0.04} />
      ))}
    </svg>
  );
}

/* ── Props ───────────────────────────────────────────────────────── */
interface SolutionTemplatePageProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

/* ════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════════════════════════ */
export default function SolutionTemplatePage({ theme, openBooking }: SolutionTemplatePageProps) {
  const dk = theme === "dark";
  const [ready, setReady] = useState(false);

  /* Mount */
  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    window.scrollTo({ top: 0 });
  }, []);

  /* Scroll-triggered card reveal */
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".sol-card, .sol-testi");
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
  const bg          = dk ? "#111827" : "#fcfbf7";
  const bgContrast  = dk ? "#0f172a" : "#ffffff";
  const textPrimary    = dk ? "text-white"    : "text-gray-900";
  const textSecondary  = dk ? "text-gray-400" : "text-gray-500";
  const borderMuted    = dk ? "border-white/[0.07]" : "border-gray-200/70";
  const cardBg         = dk ? "bg-white/[0.03]" : "bg-white";

  return (
    <div className={ready ? "sol-ready" : ""}>
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

              {/* Badge "Ora pour..." */}
              <div
                className={[
                  "sol-stagger sol-d1",
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full",
                  "text-[11px] font-inter font-semibold uppercase tracking-[0.16em] mb-7",
                  dk
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-blue-50 text-blue-600 border border-blue-100",
                ].join(" ")}
              >
                {METIER_BADGE}
              </div>

              {/* Titre fixe — deux lignes */}
              <h1
                className={[
                  "sol-stagger sol-d2",
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
                  "sol-stagger sol-d3",
                  "font-inter mt-6 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.8]",
                  textSecondary,
                ].join(" ")}
              >
                Ora s'intègre silencieusement à vos outils Excel, e-mails et fichiers.
                Vos reportings, consolidations et alertes tournent seuls pendant que
                vous vous concentrez sur ce qui compte vraiment.
              </p>

              {/* CTA */}
              <div className="sol-stagger sol-d4 mt-9">
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
              <div className="sol-stagger sol-d5 mt-10 flex flex-wrap gap-3">
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

            {/* ── Colonne droite : illustration métier ── */}
            <div className="sol-illus flex justify-center items-center">
              <MetierIllustration dk={dk} />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. SOLUTIONS METIER — grille de cartes
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-10"
        style={{ background: bgContrast }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header section */}
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
              Des automatisations concrètes, adaptées aux enjeux du métier de{" "}
              {METIER_NAME}. Opérationnelles en moins d'une semaine.
            </p>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((sol, i) => {
              const Icon = sol.icon;
              return (
                <div
                  key={i}
                  className={[
                    "sol-card p-7 rounded-[20px] border transition-colors duration-200",
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
                  "sol-testi flex flex-col gap-5 p-7 rounded-[20px] border",
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
              Prêt à transformer votre quotidien ?
            </h2>

            <p className={["font-inter mt-4 text-[1.05rem] leading-relaxed", textSecondary].join(" ")}>
              30 minutes, sans engagement. On vous montre ce qu'Ora peut automatiser
              dans votre contexte dès la première semaine.
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
