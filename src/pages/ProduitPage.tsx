import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  APP_MOCKUPS_CSS,
  APP_MODULES,
  MockAgentLecture,
  MockAssistant,
  MockCoteACote,
  MockHeroAccueil,
  ModuleCard,
} from "../components/produit/AppMockups";
import { useLang } from "@/lib/i18n";
import { BOOKING_CTA } from "@/lib/bookingCta";

interface ProduitPageProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

/* Page produit, composée le 2026-09-09 sur le modèle de legora.com/product/
   editor (référence fournie par le client) : héro en deux colonnes avec le
   média au bord droit, bande d'énoncé « étiquette à gauche, phrase à droite »,
   trois rangées média 2/3 + texte 1/3 en alternance, bande noire avec sa
   table de métadonnées, grille de modules, clôture. La typographie et les
   couleurs restent celles d'Ora (Instrument Sans / Inter, un seul bleu).
   Les médias étaient d'abord les vidéos de démo ; remplacés le jour même par
   des maquettes JSX des écrans ACTUELS du logiciel (client : « en reprenant
   ce à quoi ressemble actuellement le software »), voir AppMockups.tsx. */

const pageCSS = `
@keyframes prdFadeUp {
  from { opacity: 0; transform: translateY(26px); }
  to   { opacity: 1; transform: translateY(0); }
}
.prd-stagger { opacity: 0; }
.prd-ready .prd-stagger { animation: prdFadeUp 0.85s cubic-bezier(.22,1,.36,1) forwards; }
.prd-d1 { animation-delay: 60ms; }
.prd-d2 { animation-delay: 160ms; }
.prd-d3 { animation-delay: 300ms; }
.prd-d4 { animation-delay: 440ms; }

@keyframes prdRevealIn {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.prd-reveal { opacity: 0; }
.prd-reveal.visible { animation: prdRevealIn 0.75s cubic-bezier(.22,1,.36,1) forwards; }

/* « Les textes en gros un peu plus fins » (client 2026-09-09). Instrument
   Sans n'a pas de graisse sous 400 : le seul levier d'affinage est le lissage
   WebKit, documenté dans CLAUDE.md, et il suffit chez le client (Safari). */
.prd-thin { -webkit-font-smoothing: antialiased; }
`;

/* L'œil de section : la même convention que le reste du site (12 px, Inter
   semi-gras, capitales espacées, encre #6b7688 sur clair). */
function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <p
      className={`font-inter text-[12px] font-semibold uppercase tracking-[0.08em] ${
        onDark ? "text-white/50" : "text-[#6b7688]"
      }`}
    >
      {children}
    </p>
  );
}

function CtaButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#3b82f6] px-7 py-3.5 font-inter text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
    >
      {label}
      <ArrowRight className="h-4 w-4 opacity-80 transition-all duration-150 group-hover:translate-x-[3px] group-hover:opacity-100" />
    </button>
  );
}

export default function ProduitPage({ theme, openBooking }: ProduitPageProps) {
  const { t } = useLang();
  const dk = theme === "dark";
  const [ready, setReady] = useState(false);

  /* Un SEUL fond clair d'un bout à l'autre (client 2026-09-09 : « plus de
     cohérence de couleur background... le background blanc derrière qui coupe
     tout ») : l'alternance beige/blanc de CLAUDE.md est débrayée sur cette
     page, comme chez legora où le corps est un seul blanc cassé et où la
     variété vient des panneaux médias. */
  const bg = dk ? "#111827" : "#fcfbf7";

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    window.scrollTo({ top: 0 });
  }, []);

  // Scroll reveals, same IntersectionObserver pattern as the other pages.
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".prd-reveal");
    if (!blocks.length) return;
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
      { threshold: 0.15 },
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      eyebrow: t({ fr: "Un résultat reproductible", en: "A reproducible result" }),
      title: t({ fr: "Automatisez. Sans surprise.", en: "Automate. No surprises." }),
      desc: t({
        fr: "Déposez un fichier : l'agent le reconnaît, le vérifie et le lit avant tout traitement. Les 18 colonnes légales du FEC, les 230 lignes, le résultat de l'exercice. Il répond sur ces seuls chiffres, et cite la provenance de chaque jugement.",
        en: "Drop a file: the agent recognizes it, checks it and reads it before any processing. The ledger's 18 legal columns, its 230 lines, the year's result. It answers on those figures alone, and cites where every judgement comes from.",
      }),
      visual: <MockAgentLecture />,
    },
    {
      eyebrow: t({ fr: "Dans Excel, à côté du classeur", en: "In Excel, beside the workbook" }),
      title: t({ fr: "L'agent, côte à côte avec Excel", en: "The agent, side by side with Excel" }),
      desc: t({
        fr: "Ora se range à côté du classeur et écrit dedans. Demandez la balance, un fond de couleur sur la sélection, une correction : le geste est fait dans Excel, sur votre poste, et le journal du moteur garde chaque étape.",
        en: "Ora docks next to the workbook and writes into it. Ask for the balance, a fill colour on the selection, a correction: the move happens inside Excel, on your machine, and the engine log keeps every step.",
      }),
      visual: <MockCoteACote />,
    },
  ];

  return (
    <div className={ready ? "prd-ready" : ""}>
      <style>{pageCSS + APP_MOCKUPS_CSS}</style>

      {/* ── Héro : texte à gauche, média au bord droit ──────────────── */}
      <section className="overflow-hidden pt-[68px]" style={{ background: bg }}>
        <div className="mx-auto max-w-[1600px] pl-6 pr-6 lg:pl-8 lg:pr-0">
          <div className="grid gap-10 py-10 lg:grid-cols-[minmax(360px,440px)_1fr] lg:gap-14 lg:py-12">

            {/* Colonne texte : fil d'Ariane en haut, argument et geste en bas,
                comme la référence. */}
            <div className="flex flex-col lg:min-h-[74vh] lg:justify-between lg:py-4">
              <div>
                <p className="prd-stagger prd-d1 font-inter text-[13px]">
                  <span className="text-[#6b7688]">{t({ fr: "Produit", en: "Product" })}</span>
                  <span className="mx-2 text-[#6b7688]">/</span>
                  <span className={dk ? "text-white" : "text-[#111827]"}>
                    {t({ fr: "L'application", en: "The app" })}
                  </span>
                </p>
                <h1
                  className={`prd-thin prd-stagger prd-d2 mt-8 font-instrument text-[clamp(2.2rem,4vw,3.4rem)] font-normal leading-[1.06] tracking-[-0.03em] ${
                    dk ? "text-white" : "text-[#111827]"
                  }`}
                >
                  {t({ fr: "Le travail sur Excel, automatisé.", en: "Excel work, automated." })}
                </h1>
              </div>

              <div className="mt-10 lg:mt-0">
                <p className={`prd-stagger prd-d3 max-w-[42ch] font-inter text-[15px] leading-[1.7] ${dk ? "text-gray-400" : "text-[#42506b]"}`}>
                  {t({
                    fr: "Ora est l'application qui enchaîne vos traitements récurrents, de la donnée brute au livrable final. Le traitement reste sur votre poste, le résultat est reproductible, chaque étape est consignée.",
                    en: "Ora is the app that runs your recurring work, from raw data to the final deliverable. Processing stays on your machine, results are reproducible, every step is logged.",
                  })}
                </p>
                <div className="prd-stagger prd-d4 mt-6">
                  <CtaButton onClick={openBooking} label={t(BOOKING_CTA)} />
                </div>
              </div>
            </div>

            {/* Média : l'écran d'accueil du logiciel, collé au bord droit sur
                grand écran, cadré à la manière du héro legora.
                ⚠ SUR GRAND ÉCRAN IL REMONTE SOUS LA BARRE DE NAVIGATION et
                redescend jusqu'au bas de la section (client 2026-09-10 :
                « chez legora le fond prend aussi l'espace du haut »). Les
                marges négatives annulent le `py-12` de la grille ; la hauteur
                les récupère (72vh + 2 × 48 px) pour que le panneau touche les
                deux bords sans étirer la colonne de texte. */}
            <div className="prd-stagger prd-d2 h-[340px] overflow-hidden rounded-2xl ring-1 ring-black/5 sm:h-[440px] lg:-mt-12 lg:-mb-12 lg:h-[calc(72vh+96px)] lg:rounded-r-none lg:rounded-bl-3xl lg:rounded-tl-none">
              <MockHeroAccueil />
            </div>

          </div>
        </div>
      </section>

      {/* ── Bande d'énoncé : étiquette à gauche, phrase à droite ────── */}
      <section className="py-20 md:py-28" style={{ background: bg }}>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="prd-reveal grid gap-8 lg:grid-cols-[1fr_2fr]">
            <Eyebrow>{t({ fr: "De la donnée brute au livrable", en: "From raw data to deliverable" })}</Eyebrow>
            <p className={`prd-thin max-w-[36ch] font-instrument text-[clamp(1.45rem,2.2vw,1.9rem)] font-normal leading-[1.22] tracking-[-0.015em] ${dk ? "text-white" : "text-[#111827]"}`}>
              {t({ fr: "Vous déposez un fichier, Ora déroule la chaîne complète. ", en: "Drop a file, and Ora runs the full chain. " })}
              <span className="text-[#6b7688]">
                {t({
                  fr: "Contrôles, retraitements, mise en forme : le livrable sort au format attendu, prêt à envoyer.",
                  en: "Checks, rework, formatting: the deliverable comes out in the expected format, ready to send.",
                })}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Trois rangées média + texte, en alternance ──────────────── */}
      <section className="py-20 md:py-28" style={{ background: bg }}>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="flex flex-col gap-28 md:gap-44">
            {features.map((f, i) => (
              /* Le média occupe TROIS QUARTS de la rangée, pas deux tiers
                 (client 2026-09-10, deux demandes d'agrandissement successives
                 sur la rangée Excel). Le texte tient encore sur une colonne de
                 ~330 px à 1440, sa mesure reste sous 45 caractères. */
              <div key={i} className="prd-reveal grid items-start gap-8 lg:grid-cols-4 lg:gap-12">
                <div className={`overflow-hidden rounded-[18px] ring-1 ring-black/5 lg:col-span-3 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  {f.visual}
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <Eyebrow>{f.eyebrow}</Eyebrow>
                  <h2 className={`prd-thin mt-4 font-instrument text-[1.55rem] font-normal leading-[1.15] tracking-[-0.02em] md:text-[1.8rem] ${dk ? "text-white" : "text-[#111827]"}`}>
                    {f.title}
                  </h2>
                  <p className={`mt-4 max-w-[46ch] font-inter text-[15px] leading-[1.7] ${dk ? "text-gray-400" : "text-[#5b6577]"}`}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bande noire : la démonstration de l'assistant ───────────── */}
      {/* data-nav-dark : la barre de navigation passe en blanc sur noir tant
          que la section est sous le bandeau, comme sur les zones Atlas. */}
      {/* Noir pur, pas le #111827 de la charte : demande datée du client
          (2026-09-09 : « j'aimerais que la partie sombre soit vraiment
          noire »), même statut d'exception que le noir d'ExcelReveal. */}
      <section data-nav-dark className="py-24 md:py-32" style={{ background: "#000000" }}>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="prd-reveal">
            <Eyebrow onDark>{t({ fr: "Ora en action", en: "Ora in action" })}</Eyebrow>
            <p className="prd-thin mt-4 max-w-[40ch] font-instrument text-[clamp(1.4rem,2.1vw,1.8rem)] font-normal leading-[1.24] tracking-[-0.015em] text-white">
              {t({
                fr: "L'agent répond sur vos dossiers, cite la provenance de chaque jugement et lance les traitements.",
                en: "The agent answers on your files, cites where every judgement comes from and runs the processing.",
              })}
            </p>
          </div>

          <div className="prd-reveal mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12" data-delay="120">
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 lg:col-span-2">
              <MockAssistant />
            </div>
            {/* La table de métadonnées de la référence, calée en bas. Les
                valeurs reprennent les garanties que l'écran affiche lui-même. */}
            <div className="flex flex-col justify-end">
              <dl className="divide-y divide-white/10 border-t border-white/10">
                {[
                  { label: t({ fr: "Module", en: "Module" }), value: t({ fr: "Agent Ora", en: "Ora agent" }) },
                  { label: t({ fr: "Sources", en: "Sources" }), value: t({ fr: "Citées pour chaque jugement", en: "Cited for every judgement" }) },
                  { label: t({ fr: "Envoi", en: "Sending" }), value: t({ fr: "Chiffres anonymisés", en: "Anonymized figures" }) },
                  { label: t({ fr: "Relecture", en: "Review" }), value: t({ fr: "Par le cabinet", en: "By the firm" }) },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 py-3.5">
                    <dt className="font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">{row.label}</dt>
                    <dd className="font-inter text-[14px] text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── La grille des modules, scènes animées façon « Explore the
          suite of tools » ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: bg }}>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="prd-reveal">
            <h2 className={`font-inter text-[15px] font-semibold ${dk ? "text-white" : "text-[#111827]"}`}>
              {t({ fr: "Explorer les modules", en: "Explore the modules" })}
            </h2>
            <p className="mt-1.5 font-inter text-[14px] text-[#5b6577]">
              {t({
                fr: "Chaque module s'appuie sur la même chaîne de traitement.",
                en: "Every module runs on the same processing chain.",
              })}
            </p>
          </div>
          {/* Les six modules de l'écran d'accueil du logiciel, mêmes
              intitulés et mêmes teintes, chacun surmonté de sa scène animée. */}
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {APP_MODULES.map((m, i) => (
              <div key={m.title} className="prd-reveal" data-delay={String(i * 70)}>
                <ModuleCard module={m} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clôture ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ background: bg }}>
        <div className="prd-reveal mx-auto max-w-2xl px-6 text-center">
          <h2 className={`prd-thin font-instrument text-[clamp(1.8rem,2.9vw,2.4rem)] font-normal leading-[1.14] tracking-[-0.025em] ${dk ? "text-white" : "text-[#111827]"}`}>
            {t({ fr: "Prêt à voir Ora sur vos fichiers ?", en: "Ready to see Ora on your files?" })}
          </h2>
          <p className="mt-4 font-inter text-[16px] leading-[1.7] text-[#5b6577]">
            {t({
              fr: "Écrivez-nous, et venez avec un cas concret : nous regardons ensemble ce qu'Ora peut en faire.",
              en: "Write to us, and bring a real case: we will look together at what Ora can do with it.",
            })}
          </p>
          <div className="mt-8">
            <CtaButton onClick={openBooking} label={t(BOOKING_CTA)} />
          </div>
        </div>
      </section>
    </div>
  );
}
