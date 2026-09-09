import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Bell,
  FileSpreadsheet,
  FileText,
  Gauge,
  Globe,
  Home,
  Landmark,
  LayoutGrid,
  MessageCircle,
  Moon,
  Paperclip,
  PenLine,
  Percent,
  PieChart,
  Plus,
  Presentation,
  RotateCcw,
  Scale,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

/* Visuels de la page produit, v2 du 2026-09-09 au soir. Le client a fourni
   six captures de l'application RÉELLE (barre latérale Accueil / Agent /
   Modules / Atlas, page Agent, module Changement de structure, lecture d'un
   FEC par l'agent, Excel côte à côte avec le volet Ora) et sa bibliothèque
   d'étude legora (galerie-legora-ui.html). Consignes : reprendre ces écrans,
   les mettre en scène à la manière legora (encadré de verre très flouté sur
   un fond de couleur pour le héro, studio en dégradé gris pour les rangées),
   et des animations dans la grille des modules comme leur « Explore the
   suite of tools ». Tous les libellés et chiffres viennent des captures :
   FEC 2025 Negoce du Port, 230 lignes, résultat 44 144 €, trésorerie
   290 284 €. Seul le prénom de la salutation est remplacé (le compte de dev
   s'appelle « Test », la démo du site dit « Claire »). */

/* ── Mise à l'échelle ────────────────────────────────────────────────────
   Chaque maquette est dessinée à largeur fixe puis réduite au conteneur par
   transform, comme les mockups Atlas : le texte reste net et la composition
   ne se réagence jamais. */
function useScale(designW: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => setScale(el.clientWidth / designW);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designW]);
  return { ref, scale };
}

/* Les fonds de scène, calqués sur les mises en scène de la bibliothèque
   legora : un studio gris dégradé, un sable chaud, un bleu discret. */
const STAGES: Record<string, string> = {
  studio: "linear-gradient(160deg, #eceef1 0%, #f6f7f8 45%, #e2e5e9 100%)",
  sand: "linear-gradient(160deg, #f3efe7 0%, #faf8f3 50%, #e9e4d9 100%)",
  blue: "linear-gradient(160deg, #e7edf6 0%, #f4f7fb 50%, #dfe7f2 100%)",
  night: "#0d1526",
};

function Stage({
  variant,
  children,
  designW,
  className = "aspect-[16/10]",
}: {
  variant: keyof typeof STAGES;
  children: ReactNode;
  designW: number;
  className?: string;
}) {
  const { ref, scale } = useScale(designW);
  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ background: STAGES[variant] }}
    >
      {variant === "night" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(90% 80% at 50% 0%, rgba(59,130,246,0.16) 0%, transparent 65%)" }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

/* La fenêtre macOS commune : pastilles, titre « Ora », corps blanc. */
function AppWindow({ width, children, style }: { width: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="overflow-hidden rounded-[14px] bg-white font-inter shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.07]"
      style={{ width, ...style }}
    >
      <div className="relative flex h-9 items-center justify-center border-b border-[#eef1f5] bg-white">
        <div className="absolute left-4 flex items-center gap-2">
          <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[12px] font-medium text-[#64748b]">Ora</span>
      </div>
      {children}
    </div>
  );
}

/* La barre latérale réelle de l'application (capture du 2026-09-09). */
function AppSidebar() {
  const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium";
  return (
    <div className="flex w-[218px] shrink-0 flex-col border-r border-[#eef1f5] px-3.5 pb-4 pt-5">
      <div className="flex items-center gap-2 px-2">
        <img src="/logos/icon-color.png" alt="" className="h-5 w-auto" />
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-[#0f172a]">Ora</span>
      </div>
      <div className="mt-6 flex flex-col gap-0.5">
        <div className={`${item} bg-[#eef2f7] text-[#0f172a]`}>
          <Home className="h-4 w-4 text-[#475569]" /> Accueil
        </div>
        <div className={`${item} text-[#475569]`}>
          <Sparkles className="h-4 w-4" /> Agent
        </div>
        <div className="py-1 pl-10 text-[12px] text-[#94a3b8]">Conversations</div>
        <div className={`${item} text-[#475569]`}>
          <LayoutGrid className="h-4 w-4" /> Modules
        </div>
        <div className={`${item} text-[#475569]`}>
          <Globe className="h-4 w-4" /> Atlas
        </div>
      </div>
      <div className="mt-auto rounded-xl bg-[#f6f8fb] p-3.5 ring-1 ring-[#eef1f5]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
          <p className="text-[12.5px] font-semibold text-[#0f172a]">Outils</p>
        </div>
        <p className="mt-1 text-[11.5px] leading-[1.5] text-[#94a3b8]">Votre journée, vos relances</p>
      </div>
    </div>
  );
}

function AppTopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f1f5f9] px-7 py-3.5">
      <p className="text-[14px] font-semibold text-[#0f172a]">{title}</p>
      <div className="flex items-center gap-3">
        <Moon className="h-4 w-4 text-[#94a3b8]" />
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#475569] ring-1 ring-[#e2e8f0]">
          <MessageCircle className="h-3.5 w-3.5" /> Messages
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#475569] ring-1 ring-[#e2e8f0]">
          <Bell className="h-3.5 w-3.5" /> Notifications
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#3b82f6] text-[10px] font-semibold text-white">1</span>
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] text-[12px] font-semibold text-white">C</span>
      </div>
    </div>
  );
}

function PromptBar({ placeholder, width }: { placeholder: string; width?: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-full bg-white py-3 pl-5 pr-3 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)] ring-1 ring-[#eef1f5]"
      style={width ? { width } : undefined}
    >
      <Plus className="h-4 w-4 text-[#64748b]" />
      <Sparkles className="h-4 w-4 text-[#3b82f6]" />
      <span className="flex-1 truncate text-[13.5px] text-[#94a3b8]">{placeholder}</span>
      <Paperclip className="h-4 w-4 shrink-0 text-[#94a3b8]" />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#bfd7fb]">
        <ArrowUp className="h-4 w-4 text-white" />
      </span>
    </div>
  );
}

/* ── 1. Héro : l'accueil réel (barre latérale comprise), posé sur un
   encadré de verre très flouté, lui-même sur un fond de couleur : la mise
   en scène du héro legora, la photo de bureau remplacée par des nappes de
   couleur, comme demandé. ───────────────────────────────────────────────── */
export function MockHeroAccueil() {
  const { ref, scale } = useScale(1400);
  const files = [
    { icon: FileText, tint: "#64748b", bg: "#f1f5f9", name: "FEC 2025 Negoce du Port", kind: "TXT" },
    { icon: FileSpreadsheet, tint: "#16a34a", bg: "#f0fdf4", name: "Fais la balance", kind: "XLSX · FEC" },
  ];
  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "linear-gradient(150deg, #dce7f5 0%, #ecf1f8 40%, #f6f3ec 100%)" }}
    >
      {/* Les nappes de couleur qui donnent au verre quelque chose à flouter. */}
      <div className="pointer-events-none absolute -left-[10%] top-[-20%] h-[70%] w-[55%] rounded-full opacity-70" style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.35), transparent)" }} />
      <div className="pointer-events-none absolute bottom-[-25%] right-[-8%] h-[75%] w-[50%] rounded-full opacity-60" style={{ background: "radial-gradient(closest-side, rgba(13,148,136,0.28), transparent)" }} />
      <div className="pointer-events-none absolute left-[35%] top-[55%] h-[50%] w-[40%] rounded-full opacity-50" style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.9), transparent)" }} />

      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
        {/* L'encadré de verre, gris clair et très flouté. */}
        <div className="rounded-[26px] bg-white/40 p-6 shadow-[0_40px_90px_-30px_rgba(15,23,42,0.35)] ring-1 ring-white/60 backdrop-blur-2xl">
          <AppWindow width={1180}>
            <div className="flex">
              <AppSidebar />
              <div className="min-w-0 flex-1">
                <AppTopBar title="Accueil" />
                <div className="px-8 pb-9 pt-6">
                  <h3 className="text-[30px] font-semibold tracking-[-0.02em] text-[#0f172a]">
                    Passez une bonne journée, Claire
                  </h3>
                  <p className="mt-1 text-[13px] text-[#64748b]">Mercredi 9 septembre</p>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-5 py-2.5 text-[13.5px] font-semibold text-white">
                      <FileText className="h-4 w-4" />
                      Ouvrir un fichier avec Ora
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white py-2.5 text-[13.5px] font-semibold text-[#0f172a] ring-1 ring-[#e2e8f0]" style={{ paddingLeft: 18, paddingRight: 18 }}>
                      <Plus className="h-4 w-4" />
                      Nouveau projet
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white py-2.5 text-[13.5px] font-semibold text-[#0f172a] ring-1 ring-[#e2e8f0]" style={{ paddingLeft: 18, paddingRight: 18 }}>
                      <RotateCcw className="h-4 w-4" />
                      Reprendre
                      <ArrowRight className="h-3.5 w-3.5 text-[#94a3b8]" />
                    </span>
                  </div>

                  <div className="mt-5">
                    <PromptBar placeholder="Demandez : « analyse cette plaquette »" />
                  </div>

                  <p className="mt-8 text-[14.5px] font-semibold text-[#0f172a]">Vos modules</p>
                  <div className="mt-3 grid grid-cols-3 gap-3.5">
                    {APP_MODULES.slice(0, 3).map((m) => (
                      <div key={m.title} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-[#eef1f5]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: m.bg }}>
                          <m.icon className="h-4 w-4" style={{ color: m.tint }} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold text-[#0f172a]">{m.title}</p>
                          <p className="truncate text-[11px] text-[#94a3b8]">{m.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-7 text-[14.5px] font-semibold text-[#0f172a]">Reprendre</p>
                  <div className="mt-3 divide-y divide-[#f1f5f9] rounded-2xl ring-1 ring-[#eef1f5]">
                    {files.map((f) => (
                      <div key={f.name} className="flex items-center gap-3.5 px-5 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: f.bg }}>
                          <f.icon style={{ color: f.tint, width: 17, height: 17 }} />
                        </span>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-[#0f172a]">{f.name}</p>
                          <p className="text-[11.5px] text-[#94a3b8]">{f.kind}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium text-[#64748b]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
                          À faire
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AppWindow>
        </div>
      </div>
    </div>
  );
}

/* ── 2. L'agent lit un FEC (capture réelle de la conversation) ──────────── */
export function MockAgentLecture() {
  return (
    <Stage variant="studio" designW={1060}>
      <AppWindow width={780}>
        <div className="px-9 pb-8 pt-6">
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f6f8fb] px-3.5 py-2 text-[12.5px] font-medium text-[#0f172a] ring-1 ring-[#e8edf3]">
              <FileSpreadsheet className="h-4 w-4 text-[#16a34a]" />
              FEC 2025 Negoce du Port (xlsx).xlsx
              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#94a3b8] ring-1 ring-[#e2e8f0]">FEC</span>
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#3b82f6]" />
            <div className="min-w-0">
              <p className="text-[13.5px] leading-[1.65] text-[#334155]">
                Document reconnu : <span className="font-semibold text-[#0f172a]">FEC (fichier des écritures comptables)</span>. Les signes :
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {[
                  "colonnes JournalCode, EcritureDate, CompteNum et Débit/Crédit reconnues",
                  "18 des 18 colonnes légales présentes",
                  "230 lignes d'écritures",
                ].map((li) => (
                  <li key={li} className="flex items-baseline gap-2.5 text-[13px] text-[#475569]">
                    <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-[#94a3b8]" />
                    {li}
                  </li>
                ))}
              </ul>
              <p className="mt-3.5 text-[14px] leading-[1.65] text-[#0f172a]">
                Document lu. Résultat de l'exercice : <span className="font-semibold">44 144 €</span>. Trésorerie
                nette : <span className="font-semibold">290 284 €</span>. 2 points de lecture calculés. Posez vos
                questions : je réponds sur ces seuls chiffres, et je cite la provenance de chaque jugement.
              </p>
              <p className="mt-4 text-[12px] text-[#94a3b8]">Mal typé ? Dites-moi ce que c'est :</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Balance", "Grand livre", "Plaquette", "Liasse fiscale", "Tableau libre"].map((c) => (
                  <span key={c} className="rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#334155] ring-1 ring-[#e2e8f0]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppWindow>
    </Stage>
  );
}

/* ── 3. Le dossier prêt à générer (banc `?preview-dossier`) ─────────────── */
export function MockDossier() {
  const outputs = [
    { icon: FileSpreadsheet, label: "Classeur", kind: "XLSX", tint: "#16a34a", bg: "#f0fdf4" },
    { icon: FileText, label: "Dossier", kind: "PDF", tint: "#dc2626", bg: "#fef2f2" },
    { icon: Presentation, label: "Présentation", kind: "PPTX", tint: "#d97706", bg: "#fffbeb" },
  ];
  return (
    <Stage variant="sand" designW={1000}>
      <AppWindow width={680}>
        <div className="px-12 pb-9 pt-9 text-center">
          <div className="mx-auto flex items-center justify-center rounded-2xl bg-[#eff6ff]" style={{ width: 52, height: 52 }}>
            <FileText className="h-6 w-6 text-[#3b82f6]" />
          </div>
          <h3 className="mt-4 text-[21px] font-semibold tracking-[-0.01em] text-[#0f172a]">Tout est prêt</h3>
          <p className="mx-auto mt-2 max-w-[430px] text-[13px] leading-[1.65] text-[#64748b]">
            Classeur, dossier PDF et présentation, en une génération, à la charte du cabinet. Le design et les
            slides s'ajustent ensuite, devant les pièces produites.
          </p>
          <div className="mt-5 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-2.5 text-[13.5px] font-semibold text-white">
              <FileText className="h-4 w-4" />
              Générer le dossier
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[12.5px] font-medium text-[#334155] ring-1 ring-[#e2e8f0]">
              <Settings2 className="h-4 w-4" />
              Réglages du dossier
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2.5 border-t border-[#f1f5f9] pt-5">
            {outputs.map((o) => (
              <span key={o.label} className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#334155] ring-1 ring-[#e8edf3]" style={{ background: o.bg }}>
                <o.icon className="h-3.5 w-3.5" style={{ color: o.tint }} />
                {o.label}
                <span className="text-[#94a3b8]">{o.kind}</span>
              </span>
            ))}
          </div>
        </div>
      </AppWindow>
    </Stage>
  );
}

/* ── 4. Excel côte à côte avec le volet Ora (captures réelles) ──────────── */
const FEC_ROWS: [string, string, string, string, string][] = [
  ["AN", "À-nouveaux", "211000", "Terrains", "40 000,00"],
  ["AN", "À-nouveaux", "215400", "Matériel industriel", "96 000,00"],
  ["AN", "À-nouveaux", "370000", "Stocks de marchandises", "24 500,00"],
  ["VE", "Ventes", "411000", "Clients", "50 820,00"],
  ["VE", "Ventes", "707000", "Ventes de marchandises", "42 350,00"],
  ["BQ", "Banque", "512000", "Banque", "38 720,00"],
  ["AC", "Achats", "607000", "Achats de marchandises", "18 720,00"],
  ["OD", "Opérations", "641000", "Rémunérations du personnel", "12 400,00"],
];

export function MockCoteACote() {
  const suggestions = [
    { icon: Percent, label: "Calcule la TVA", tint: "#0284c7", bg: "#f0f9ff" },
    { icon: Landmark, label: "Quel impôt sur les sociétés ?", tint: "#d97706", bg: "#fffbeb" },
    { icon: Scale, label: "Fais la balance", tint: "#16a34a", bg: "#f0fdf4" },
    { icon: ShieldCheck, label: "Y a-t-il des anomalies ?", tint: "#dc2626", bg: "#fef2f2" },
    { icon: PenLine, label: "Éditer le document", tint: "#7c3aed", bg: "#f5f3ff" },
    { icon: TrendingUp, label: "Explique la formation du résultat", tint: "#2563eb", bg: "#eff6ff" },
  ];
  return (
    <Stage variant="blue" designW={1180}>
      <div className="flex items-stretch gap-4">
        {/* Excel, resserré à l'essentiel */}
        <div className="w-[620px] overflow-hidden rounded-[12px] bg-white font-inter shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.07]">
          <div className="flex items-center gap-2.5 border-b border-[#e6e8ec] bg-[#f6f8fa] px-4 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1d6f42]">
              <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-[12px] font-semibold text-[#1e293b]">FEC 2025 Negoce du Port (xlsx)</span>
            <span className="ml-auto text-[11px] text-[#94a3b8]">Enregistrement automatique</span>
          </div>
          <div className="flex gap-4 border-b border-[#e6e8ec] px-4 py-1.5 text-[11px] text-[#475569]">
            {["Accueil", "Insertion", "Formules", "Données", "Révision", "Affichage"].map((t, i) => (
              <span key={t} className={i === 0 ? "font-semibold text-[#1d6f42]" : ""}>{t}</span>
            ))}
          </div>
          <table className="w-full border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-[#f8fafc] text-left text-[#475569]">
                {["JournalCode", "JournalLib", "CompteNum", "CompteLib", "Débit"].map((h) => (
                  <th key={h} className="border border-[#eef1f5] px-2 py-1.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#334155]">
              {FEC_ROWS.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={`border border-[#f1f5f9] px-2 py-1.5 ${j === 4 ? "text-right" : ""}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Le volet Ora */}
        <div className="flex w-[330px] flex-col overflow-hidden rounded-[12px] bg-white font-inter shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.07]">
          <div className="flex items-center gap-2 border-b border-[#eef1f5] px-4 py-3">
            <Sparkles className="h-4 w-4 text-[#3b82f6]" />
            <span className="text-[13px] font-semibold text-[#0f172a]">Agent</span>
            <span className="ml-auto rounded bg-[#f6f8fb] px-2 py-0.5 text-[10px] font-medium text-[#64748b] ring-1 ring-[#e8edf3]">Côte à côte</span>
          </div>
          <div className="flex-1 px-3.5 py-3">
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 ring-1 ring-[#f1f5f9]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: s.bg }}>
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.tint }} />
                  </span>
                  <span className="text-[12px] font-medium text-[#334155]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-3.5 pb-3.5">
            <div className="flex items-center gap-2 rounded-full py-2 pl-4 pr-2 ring-1 ring-[#e2e8f0]">
              <span className="flex-1 text-[12px] text-[#94a3b8]">Demandez : « q »</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b82f6]">
                <ArrowUp className="h-3 w-3 text-white" />
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-[1.5] text-[#94a3b8]">
              Chiffres du moteur, anonymisés avant l'envoi ; à relire par le cabinet.
            </p>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ── 5. La page Agent, sur la bande sombre : le foyer conversationnel ───── */
export function MockAssistant() {
  const convs = [
    { name: "FEC 2025 Negoce du Port (xlsx).xlsx", when: "à l'instant" },
    { name: "Fais la balance", when: "il y a 2 min" },
    { name: "Fais la balance", when: "il y a 3 h" },
  ];
  return (
    <Stage variant="night" designW={1040}>
      <AppWindow width={820}>
        <div className="px-10 pb-8 pt-7 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-[#3b82f6]" />
          <h3 className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-[#0f172a]">
            Passez une bonne journée, Claire
          </h3>
          <p className="mt-1 text-[13px] text-[#64748b]">Mercredi 9 septembre</p>
          <div className="mx-auto mt-5 max-w-[560px] text-left">
            <PromptBar placeholder="Demandez : « explique la formation du résultat en trois phrases »" />
          </div>
          <p className="mt-7 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
            Conversations récentes
          </p>
          <div className="mt-2.5 divide-y divide-[#f1f5f9] rounded-2xl text-left ring-1 ring-[#eef1f5]">
            {convs.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-3" style={{ paddingLeft: 18, paddingRight: 18 }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4]">
                  <FileSpreadsheet style={{ color: "#16a34a", width: 15, height: 15 }} />
                </span>
                <div className="flex-1">
                  <p className="text-[12.5px] font-semibold text-[#0f172a]">{c.name}</p>
                  <p className="text-[11px] text-[#94a3b8]">FEC 2025 Negoce du Port (xlsx).xlsx · FEC</p>
                </div>
                <span className="text-[11px] text-[#94a3b8]">{c.when}</span>
              </div>
            ))}
          </div>
        </div>
      </AppWindow>
    </Stage>
  );
}

/* ── 6. Les modules, avec leurs scènes animées ───────────────────────────
   L'équivalent des vignettes animées du « Explore the suite of tools » de
   legora : chaque module porte une petite scène qui joue en boucle, dessinée
   en CSS. Les keyframes vivent dans APP_MOCKUPS_CSS, injecté par la page ;
   tout est coupé sous prefers-reduced-motion. */
export const APP_MOCKUPS_CSS = `
@keyframes mkSwapA { 0%, 45% { transform: scaleY(1); } 55%, 95% { transform: scaleY(0.45); } 100% { transform: scaleY(1); } }
@keyframes mkSwapB { 0%, 45% { transform: scaleY(0.45); } 55%, 95% { transform: scaleY(1); } 100% { transform: scaleY(0.45); } }
@keyframes mkGrow { 0% { transform: scaleY(0); } 12% { transform: scaleY(1); } 82% { transform: scaleY(1); } 95%, 100% { transform: scaleY(0); } }
@keyframes mkDraw { 0% { stroke-dashoffset: 240; } 45%, 80% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -240; } }
@keyframes mkRise { 0% { opacity: 0; transform: translateY(8px); } 15% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; } 95%, 100% { opacity: 0; } }
@keyframes mkFill { 0% { transform: scaleX(0); } 30%, 85% { transform: scaleX(1); } 100% { transform: scaleX(0); } }
@keyframes mkNeedle { 0%, 10% { transform: rotate(-52deg); } 45%, 60% { transform: rotate(38deg); } 90%, 100% { transform: rotate(-52deg); } }
@keyframes mkPulse { 0%, 100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
.mk-anim { animation-duration: 4.4s; animation-iteration-count: infinite; animation-timing-function: cubic-bezier(.45,0,.25,1); }
@media (prefers-reduced-motion: reduce) { .mk-anim { animation: none !important; } }
.prd-module-card { transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s; }
.prd-module-card:hover { transform: translateY(-3px); box-shadow: 0 18px 40px -18px rgba(15,23,42,0.18); }
.prd-module-card:hover .prd-module-arrow { transform: translateX(3px); }
.prd-module-arrow { transition: transform 0.25s; }
`;

function SceneStructure() {
  const bars = [64, 44, 82];
  return (
    <div className="flex h-full items-end justify-center gap-8 pb-8">
      <div className="flex items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="mk-anim w-4 origin-bottom rounded-t-md bg-[#f5b04c]" style={{ height: h, animationName: "mkSwapA", animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <ArrowLeftRight className="mb-6 h-4 w-4 text-[#c8b58f]" />
      <div className="flex items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="mk-anim w-4 origin-bottom rounded-t-md bg-[#d97706]" style={{ height: h, animationName: "mkSwapB", animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

function SceneBilan() {
  const bars = [26, 44, 62, 38, 78];
  return (
    <div className="flex h-full items-end justify-center gap-2.5 pb-8">
      {bars.map((h, i) => (
        <div key={i} className="mk-anim w-6 origin-bottom rounded-t-md" style={{ height: h, background: i === 4 ? "#7c3aed" : "#c4b5fd", animationName: "mkGrow", animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  );
}

function ScenePrevisionnel() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full px-6 py-5">
      {[28, 55, 82].map((y) => (
        <line key={y} x1="8" x2="192" y1={y} y2={y} stroke="#dbe4f0" strokeWidth="1" />
      ))}
      <path d="M8 92 C 50 88, 70 70, 100 62 S 160 30, 192 18" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" className="mk-anim" style={{ strokeDasharray: 240, animationName: "mkDraw" }} />
      <circle cx="192" cy="18" r="4" fill="#2563eb" className="mk-anim" style={{ animationName: "mkPulse" }} />
    </svg>
  );
}

function SceneImmobilier() {
  const rows = ["Loyers", "Emprunt", "Apport"];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-7">
      {rows.map((r, i) => (
        <div key={r} className="mk-anim flex items-center gap-3" style={{ animationName: "mkRise", animationDelay: `${i * 0.22}s` }}>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d1fae5]">
            <Landmark className="h-3.5 w-3.5 text-[#059669]" />
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e6f4ee]">
            <div className="mk-anim h-full origin-left rounded-full bg-[#34d399]" style={{ width: `${78 - i * 18}%`, animationName: "mkFill", animationDelay: `${i * 0.22}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneEvaluation() {
  return (
    <div className="relative flex h-full items-center justify-center">
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={i}
            className="mk-anim absolute h-2.5 w-2.5 rounded-full bg-[#fca5a5]"
            style={{ left: `calc(50% + ${Math.cos(a) * 52}px)`, top: `calc(50% + ${Math.sin(a) * 38}px)`, animationName: "mkPulse", animationDelay: `${i * 0.3}s` }}
          />
        );
      })}
      <span className="flex h-12 w-12 rotate-45 items-center justify-center rounded-xl bg-[#fee2e2] ring-1 ring-[#fecaca]">
        <Scale className="h-5 w-5 -rotate-45 text-[#dc2626]" />
      </span>
    </div>
  );
}

function SceneBudget() {
  return (
    <div className="relative flex h-full items-end justify-center pb-6">
      <svg viewBox="0 0 120 66" className="h-[72%]">
        <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#e0f2fe" strokeWidth="9" strokeLinecap="round" />
        <path d="M10 60 A 50 50 0 0 1 78 16" fill="none" stroke="#0284c7" strokeWidth="9" strokeLinecap="round" />
        <g className="mk-anim" style={{ transformOrigin: "60px 60px", animationName: "mkNeedle" }}>
          <line x1="60" y1="60" x2="60" y2="22" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="60" r="4.5" fill="#0f172a" />
      </svg>
    </div>
  );
}

export const APP_MODULES = [
  {
    icon: ArrowLeftRight,
    tint: "#d97706",
    bg: "#fffbeb",
    stage: "linear-gradient(160deg, #faf3e4 0%, #fdf9f0 60%, #f5ecd9 100%)",
    title: "Changement de structure",
    sub: "Comparatif avant / après",
    Scene: SceneStructure,
  },
  {
    icon: PieChart,
    tint: "#7c3aed",
    bg: "#f5f3ff",
    stage: "linear-gradient(160deg, #efecfa 0%, #f8f6fd 60%, #e8e3f6 100%)",
    title: "Bilan développé et SIG",
    sub: "Le bilan et la formation du résultat",
    Scene: SceneBilan,
  },
  {
    icon: Store,
    tint: "#2563eb",
    bg: "#eff6ff",
    stage: "linear-gradient(160deg, #e8eefa 0%, #f4f8fd 60%, #dfe9f7 100%)",
    title: "Prévisionnel d'activité",
    sub: "Dix métiers et neuf filières agricoles : le plan banque",
    Scene: ScenePrevisionnel,
  },
  {
    icon: Landmark,
    tint: "#059669",
    bg: "#ecfdf5",
    stage: "linear-gradient(160deg, #e6f4ec 0%, #f3faf6 60%, #ddeee5 100%)",
    title: "Prévisionnel immobilier",
    sub: "Dossier banque en 5 min",
    Scene: SceneImmobilier,
  },
  {
    icon: Scale,
    tint: "#dc2626",
    bg: "#fef2f2",
    stage: "linear-gradient(160deg, #f9ebe9 0%, #fcf5f4 60%, #f3e0dd 100%)",
    title: "Évaluation d'entreprise",
    sub: "Cinq approches combinées",
    Scene: SceneEvaluation,
  },
  {
    icon: Gauge,
    tint: "#0284c7",
    bg: "#f0f9ff",
    stage: "linear-gradient(160deg, #e6f0f7 0%, #f2f8fc 60%, #dcebf4 100%)",
    title: "Suivi budgétaire",
    sub: "Réalisé contre budget",
    Scene: SceneBudget,
  },
];

export function ModuleCard({ module: m }: { module: (typeof APP_MODULES)[number] }) {
  return (
    <div className="prd-module-card overflow-hidden rounded-2xl bg-white font-inter shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-[#e8edf3]">
      <div className="h-[150px]" style={{ background: m.stage }}>
        <m.Scene />
      </div>
      <div className="flex items-center gap-3.5" style={{ padding: 18 }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: m.bg }}>
          <m.icon className="h-5 w-5" style={{ color: m.tint }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#0f172a]">{m.title}</p>
          <p className="mt-0.5 truncate text-[13px] text-[#5b6577]">{m.sub}</p>
        </div>
        <ArrowRight className="prd-module-arrow h-4 w-4 shrink-0 text-[#94a3b8]" />
      </div>
    </div>
  );
}
