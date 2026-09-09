import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import InViewVideo from "../components/InViewVideo";
import { useLang } from "@/lib/i18n";
import { BOOKING_CTA } from "@/lib/bookingCta";

interface ProduitPageProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

/* Page produit, composée le 2026-09-09 sur le modèle de legora.com/product/
   editor (référence fournie par le client) : héro en deux colonnes avec le
   média au bord droit, bande d'énoncé « étiquette à gauche, phrase à droite »,
   trois rangées média 2/3 + texte 1/3 en alternance, bande noire vidéo avec
   sa table de métadonnées, grille de modules, clôture. La typographie et les
   couleurs restent celles d'Ora (Instrument Sans / Inter, un seul bleu). */

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

  const bg = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";

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
        fr: "La même chaîne produit le même résultat à chaque exécution. Du FEC déposé au bilan développé, chaque chiffre reste traçable jusqu'à sa source, et chaque étape est consignée dans le journal.",
        en: "The same chain produces the same result on every run. From the ledger you drop to the finished balance sheet, every figure stays traceable to its source, and every step is logged.",
      }),
      video: "/demo-automatisation.mp4",
      poster: "/posters/demo-automatisation.jpg",
    },
    {
      eyebrow: t({ fr: "Du classeur au livrable", en: "From workbook to deliverable" }),
      title: t({ fr: "Le reporting, prêt à envoyer", en: "Reporting, ready to send" }),
      desc: t({
        fr: "Le classeur reçu est retraité, mis en forme et monté sur votre modèle. Le même livrable sort chaque mois, jusqu'à l'envoi par mail.",
        en: "The workbook you receive is cleaned, formatted and built on your own template. The same deliverable comes out every month, all the way to the email.",
      }),
      video: "/ora_reporting_v3.mp4",
      poster: "/posters/ora_reporting_v3.jpg",
    },
    {
      eyebrow: t({ fr: "Vos PDF, enfin exploitables", en: "Your PDFs, finally usable" }),
      title: t({ fr: "L'extraction, sans ressaisie", en: "Extraction, no re-keying" }),
      desc: t({
        fr: "Factures, relevés et liasses PDF sont lus et transformés en tableau Excel exploitable. Chaque ligne, montant et référence extraits fidèlement, prêts à traiter.",
        en: "Invoices, statements and PDF files are read and turned into a usable Excel table. Every line, amount and reference extracted faithfully, ready to work with.",
      }),
      video: "/ora_pdf_extract_v5.mp4",
      poster: "/posters/ora_pdf_extract_v5.jpg",
    },
  ];

  const modules = [
    {
      title: t({ fr: "FEC Studio", en: "FEC Studio" }),
      desc: t({
        fr: "Le FEC importé, son intégrité contrôlée en quelques secondes, le dossier documenté.",
        en: "The ledger imported, its integrity checked in seconds, the file documented.",
      }),
      poster: "/posters/ora_fec_demo_v2.jpg",
      alt: t({ fr: "Import d'un FEC dans Ora", en: "Importing a ledger file into Ora" }),
    },
    {
      title: t({ fr: "Pointage de comptes", en: "Account matching" }),
      desc: t({
        fr: "Les comptes pointés automatiquement, les écarts ressortent immédiatement.",
        en: "Accounts matched automatically, discrepancies stand out immediately.",
      }),
      poster: "/posters/ora_pointage_v4.jpg",
      alt: t({ fr: "Pointage de comptes dans Ora", en: "Account matching in Ora" }),
    },
    {
      title: t({ fr: "Réconciliation", en: "Reconciliation" }),
      desc: t({
        fr: "Les écritures rapprochées et lettrées, les écarts prêts à justifier.",
        en: "Entries reconciled and matched, discrepancies ready to justify.",
      }),
      poster: "/posters/ora_reconciliation.jpg",
      alt: t({ fr: "Réconciliation d'écritures dans Ora", en: "Reconciling entries in Ora" }),
    },
    {
      title: t({ fr: "Formatage pour logiciel métier", en: "Formatting for your software" }),
      desc: t({
        fr: "Vos fichiers mis au format attendu par votre logiciel, prêts à importer.",
        en: "Your files converted to the format your software expects, ready to import.",
      }),
      poster: "/posters/ora_formatage.jpg",
      alt: t({ fr: "Formatage d'un fichier d'import dans Ora", en: "Formatting an import file in Ora" }),
    },
  ];

  return (
    <div className={ready ? "prd-ready" : ""}>
      <style>{pageCSS}</style>

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
                  className={`prd-stagger prd-d2 mt-8 font-instrument text-[clamp(2.5rem,4.8vw,4rem)] font-normal leading-[1.04] tracking-[-0.035em] ${
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

            {/* Média : le film du FEC, collé au bord droit sur grand écran. */}
            <div className="prd-stagger prd-d2 overflow-hidden rounded-2xl ring-1 ring-black/5 lg:h-[82vh] lg:rounded-r-none lg:rounded-l-3xl">
              <InViewVideo
                src="/final-fec.mp4"
                poster="/posters/final-fec.jpg"
                className="h-full w-full object-cover"
                threshold={0.1}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Bande d'énoncé : étiquette à gauche, phrase à droite ────── */}
      <section className="py-24 md:py-32" style={{ background: bgContrast }}>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="prd-reveal grid gap-8 lg:grid-cols-[1fr_2fr]">
            <Eyebrow>{t({ fr: "De la donnée brute au livrable", en: "From raw data to deliverable" })}</Eyebrow>
            <p className={`max-w-[34ch] font-instrument text-[clamp(1.6rem,2.6vw,2.15rem)] font-normal leading-[1.18] tracking-[-0.02em] ${dk ? "text-white" : "text-[#111827]"}`}>
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
          <div className="flex flex-col gap-20 md:gap-28">
            {features.map((f, i) => (
              <div key={i} className="prd-reveal grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
                <div className={`overflow-hidden rounded-[18px] ring-1 ring-black/5 lg:col-span-2 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  {/* h-auto, pas d'aspect imposé : les clips n'ont pas tous le
                      même ratio (demo-automatisation fait 1660 x 1080) et un
                      object-cover rognerait la barre de titre de l'app. */}
                  <InViewVideo
                    src={f.video}
                    poster={f.poster}
                    className="block h-auto w-full"
                  />
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <Eyebrow>{f.eyebrow}</Eyebrow>
                  <h2 className={`mt-4 font-instrument text-[1.7rem] font-normal leading-[1.12] tracking-[-0.025em] md:text-[1.95rem] ${dk ? "text-white" : "text-[#111827]"}`}>
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
      <section data-nav-dark className="py-24 md:py-32" style={{ background: "#111827" }}>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="prd-reveal">
            <Eyebrow onDark>{t({ fr: "Ora en action", en: "Ora in action" })}</Eyebrow>
            <p className="mt-4 max-w-[38ch] font-instrument text-[clamp(1.5rem,2.3vw,1.95rem)] font-normal leading-[1.2] tracking-[-0.02em] text-white">
              {t({
                fr: "L'assistant répond sur vos dossiers, montre ses sources et lance les traitements.",
                en: "The assistant answers on your files, shows its sources and runs the processing.",
              })}
            </p>
          </div>

          <div className="prd-reveal mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12" data-delay="120">
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 lg:col-span-2">
              <InViewVideo
                src="/ORA_demo_Assistant_six_usages.mp4"
                poster="/posters/ORA_demo_Assistant_six_usages.jpg"
                className="aspect-video w-full object-cover"
              />
            </div>
            {/* La table de métadonnées de la référence, calée en bas. */}
            <div className="flex flex-col justify-end">
              <dl className="divide-y divide-white/10 border-t border-white/10">
                {[
                  { label: t({ fr: "Titre", en: "Title" }), value: t({ fr: "L'assistant, six usages", en: "The assistant, six uses" }) },
                  { label: t({ fr: "Durée", en: "Duration" }), value: t({ fr: "56 secondes", en: "56 seconds" }) },
                  { label: t({ fr: "Module", en: "Module" }), value: t({ fr: "Assistant Ora", en: "Ora assistant" }) },
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

      {/* ── La grille des modules ───────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: bgContrast }}>
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
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m, i) => (
              <div key={m.title} className="prd-reveal" data-delay={String(i * 90)}>
                <div className="overflow-hidden rounded-[14px] ring-1 ring-black/5">
                  <img src={m.poster} alt={m.alt} loading="lazy" className="aspect-video w-full object-cover" />
                </div>
                <h3 className={`mt-4 font-inter text-[15px] font-semibold ${dk ? "text-white" : "text-[#111827]"}`}>
                  {m.title}
                </h3>
                <p className="mt-1.5 font-inter text-[13px] leading-[1.6] text-[#5b6577]">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clôture ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ background: bg }}>
        <div className="prd-reveal mx-auto max-w-2xl px-6 text-center">
          <h2 className={`font-instrument text-[clamp(2rem,3.4vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.03em] ${dk ? "text-white" : "text-[#111827]"}`}>
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
