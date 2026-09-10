import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Bell,
  Check,
  FileSpreadsheet,
  FileText,
  Gauge,
  Globe,
  Home,
  Landmark,
  LayoutGrid,
  MessageCircle,
  Moon,
  Palette,
  Paperclip,
  PieChart,
  Plus,
  RotateCcw,
  Scale,
  Store,
} from "lucide-react";

/* L'étoile Ora : QUATRE branches concaves (le ✦ du logiciel), pas le
   Sparkles de Lucide — le client a signalé la différence, captures à
   l'appui (2026-09-09, 21 h). À réutiliser pour toute évocation de
   l'assistant. */
function OraStar({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 2C12.9 7.6 16.4 11.1 22 12C16.4 12.9 12.9 16.4 12 22C11.1 16.4 7.6 12.9 2 12C7.6 11.1 11.1 7.6 12 2Z" />
    </svg>
  );
}

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
  /* Aplat ivoire fourni par le client (2026-09-10) pour la scène Excel. */
  paper: "#f4f2ed",
  night: "#000000",
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
          <OraStar className="h-4 w-4" /> Agent
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
          <OraStar className="h-3.5 w-3.5 text-[#3b82f6]" />
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
      <OraStar className="h-4 w-4 text-[#3b82f6]" />
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
  /* La fenêtre est plus grande que le panneau et ANCRÉE EN HAUT À GAUCHE :
     elle sort du cadre en bas et à droite, où le bord de l'encadré la coupe
     (client 2026-09-10 : « qu'elle prenne plus de place mais surtout soit un
     peu cachée en bas à droite par la délimitation de l'encadré »). Le coin
     visible est celui qui porte l'argument : la barre latérale, la
     salutation, les deux gestes et la barre de l'assistant. Ne pas
     re-centrer : le débordement est l'effet recherché, pas un défaut. */
  const { ref, scale } = useScale(1010);
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

      <div
        className="absolute"
        style={{ left: "4%", top: "11%", transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {/* L'encadré de verre, gris clair et très flouté. */}
        <div className="rounded-[26px] bg-white/40 p-5 shadow-[0_40px_90px_-30px_rgba(15,23,42,0.35)] ring-1 ring-white/60 backdrop-blur-2xl">
          <AppWindow width={1180}>
            <div className="flex">
              <AppSidebar />
              <div className="min-w-0 flex-1">
                <AppTopBar title="Accueil" />
                <div className="px-8 pb-9 pt-6">
                  {/* La salutation de l'app est GRANDE ET FINE (capture du
                      client : « Re-bonjour, Test » en graisse normale), pas en
                      semi-gras. */}
                  <h3 className="text-[34px] font-normal tracking-[-0.022em] text-[#1e293b]">
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
            <OraStar className="mt-1 h-4 w-4 shrink-0 text-[#3b82f6]" />
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

          {/* La barre de saisie, en bas comme dans l'app : sans elle on ne
              comprend pas qu'on peut répondre (client 2026-09-10). */}
          <div className="mt-6 rounded-2xl px-4 pb-3 pt-3.5 ring-1 ring-[#e2e8f0]">
            <p className="text-[13.5px] text-[#94a3b8]">
              Demandez : « explique la formation du résultat en trois phrases »
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Plus className="h-4 w-4 text-[#64748b]" />
              <Paperclip className="h-4 w-4 text-[#94a3b8]" />
              <span className="flex-1 text-[11.5px] text-[#cbd5e1]">
                Entrée envoie, Maj et Entrée sautent une ligne
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bfd7fb]">
                <ArrowUp className="h-4 w-4 text-white" />
              </span>
            </div>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-[#94a3b8]">
            Chiffres du moteur, anonymisés avant l'envoi ; à relire par le cabinet.
          </p>
        </div>
      </AppWindow>
    </Stage>
  );
}


/* ── 4. Excel côte à côte avec le volet Ora, sur la capture du 2026-09-10 :
   la BALANCE MENSUELLE produite par FEC Studio, et l'agent qui vient d'y
   appliquer un fond rouge sur la sélection. Deux choses que le client a
   demandé de montrer : le double écran réel, et le menu de propositions qui
   s'ouvre au clic sur le « + ». Le fond rouge n'est pas décoratif : c'est
   la preuve que l'agent ÉCRIT dans le classeur, pas seulement qu'il lit. */
const MOIS = ["2025-01", "2025-02", "2025-03", "2025-04"];
const BALANCE_ROWS: [string, string, string[], string][] = [
  ["101000", "Capital", ["-60 000,00", "", "", ""], "-60 000,00"],
  ["164000", "Emprunts", ["-78 000,00", "", "", ""], "-78 000,00"],
  ["215400", "Matériel industriel", ["96 000,00", "", "", ""], "96 000,00"],
  ["401000", "Fournisseurs", ["-39 100,00", "-900,00", "-900,00", "-900,00"], "-81 400,00"],
  ["411000", "Clients", ["40 300,00", "2 100,00", "2 100,00", "2 100,00"], "63 400,00"],
  ["421000", "Personnel, rémunérations dues", ["-15 100,00", "0,00", "0,00", "0,00"], "-15 100,00"],
  ["512000", "Banque", ["68 784,00", "27 792,00", "15 556,00", "19 392,00"], "290 284,00"],
  ["607000", "Achats de marchandises", ["18 720,00", "19 040,00", "19 360,00", "20 000,00"], "245 760,00"],
  ["641000", "Rémunérations du personnel", ["12 400,00", "12 400,00", "12 400,00", "12 400,00"], "148 800,00"],
  ["645000", "Charges de sécurité sociale", ["5 208,00", "5 208,00", "5 208,00", "5 208,00"], "62 496,00"],
  ["445710", "TVA collectée 20 %", ["-8 470,00", "-8 640,00", "-8 810,00", "-8 980,00"], "-112 860,00"],
  ["707000", "Ventes de marchandises", ["-42 350,00", "-43 200,00", "-44 050,00", "-44 900,00"], "-564 300,00"],
];

/* L'écran de bureau : la barre de menus macOS, le fond de bureau, et les
   fenêtres posées dessus. Ajouté le 2026-09-10 (client : « je veux que tu
   mettes les éléments du 3e encadré comme dans un écran en plus de
   l'encadré ») : sur les captures fournies, Excel et le volet Ora sont deux
   fenêtres d'un même écran, pas deux images côte à côte. Les libellés de la
   barre sont ceux d'Excel sur macOS, dans l'ordre de la capture. */
function DesktopScreen({ width, children }: { width: number; children: ReactNode }) {
  const menus = ["Fichier", "Édition", "Affichage", "Insérer", "Mise en forme", "Outils", "Données", "Fenêtre", "Aide"];
  return (
    <div
      /* ⚠ shrink-0 : le conteneur du Stage fait la largeur du panneau AVANT
         mise à l'échelle, donc une maquette plus large que lui est comprimée
         par le flex et son contenu se casse. C'est le scale qui doit la
         réduire, pas le flex. */
      className="shrink-0 overflow-hidden rounded-[18px] font-inter shadow-[0_40px_100px_-30px_rgba(15,23,42,0.45),0_2px_10px_rgba(15,23,42,0.10)] ring-1 ring-black/[0.10]"
      style={{ width }}
    >
      <div className="flex h-[30px] items-center gap-4 border-b border-black/[0.06] bg-[#f3f3f1] px-4">
        <span className="text-[11.5px] font-bold text-[#1e293b]">Excel</span>
        {menus.map((m) => (
          <span key={m} className="text-[11.5px] text-[#334155]">{m}</span>
        ))}
        <span className="ml-auto text-[11.5px] text-[#334155]">Jeu. 10 sept. 10:28</span>
      </div>
      <div
        className="flex items-stretch p-7"
        style={{ background: "linear-gradient(150deg, #cfd8e6 0%, #dfe6ef 45%, #c9d3e2 100%)" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ⚠ LE MENU DU BOUTON « + » A ÉTÉ RETIRÉ le 2026-09-10 (client : « je veux
   qu'il soit supprimé, on le mettra plus tard »). Sa constante PLUS_MENU et
   son encadré vivaient ici ; les récupérer au commit 21e0f81 plutôt que de
   les réécrire, les huit libellés et leurs pastilles venaient d'une capture
   de l'application. */

/* Panneau court et large : les trois blocs se CHEVAUCHENT légèrement (client
   2026-09-10), ce qui resserre la composition et raccourcit l'encadré. Les
   marges négatives font l'empilement, les z-index l'ordre : Excel dessous, le
   volet par-dessus, le menu au-dessus de tout. */
export function MockCoteACote() {
  return (
    <Stage variant="paper" designW={1250} className="aspect-[2/1]">
      <DesktopScreen width={1076}>
        {/* Excel : la balance mensuelle, fond rouge appliqué par l'agent */}
        <div className="relative z-0 w-[640px] shrink-0 overflow-hidden rounded-[12px] bg-white font-inter shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.07]">
          <div className="flex items-center gap-2.5 border-b border-[#e6e8ec] bg-[#f6f8fa] px-4 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1d6f42]">
              <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-[12px] font-semibold text-[#1e293b]">FEC 2025 Negoce du Port (xlsx)_studio</span>
            <span className="ml-auto text-[11px] text-[#94a3b8]">Enregistrement automatique</span>
          </div>
          <div className="flex gap-4 border-b border-[#e6e8ec] px-4 py-1.5 text-[11px] text-[#475569]">
            {["Accueil", "Insertion", "Formules", "Données", "Affichage", "Ora"].map((t, i) => (
              <span key={t} className={i === 0 ? "font-semibold text-[#1d6f42]" : i === 5 ? "font-semibold text-[#3b82f6]" : ""}>{t}</span>
            ))}
          </div>
          <div className="px-4 pt-3">
            <p className="text-[12.5px] font-bold text-[#0f172a]">BALANCE MENSUELLE</p>
            <p className="mt-0.5 text-[9.5px] italic text-[#94a3b8]">
              Le solde de chaque compte, mois par mois, en colonnes.
            </p>
          </div>
          <table className="mt-2 w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="bg-[#2f6db4] text-left text-white">
                <th className="px-2.5 py-1.5 font-semibold">Compte</th>
                <th className="px-2.5 py-1.5 font-semibold">Libellé</th>
                {MOIS.map((m) => (
                  <th key={m} className="px-2 py-1.5 text-right font-semibold">{m}</th>
                ))}
                <th className="px-2.5 py-1.5 text-right font-semibold">Total général</th>
              </tr>
            </thead>
            <tbody className="text-[#334155]">
              {BALANCE_ROWS.map((r) => (
                /* Le fond rouge que l'agent vient d'appliquer. */
                <tr key={r[0]} className="bg-[#fde8e8]">
                  <td className="px-2.5 py-[4px]">{r[0]}</td>
                  <td className="px-2.5 py-[4px]">{r[1]}</td>
                  {r[2].map((v, i) => (
                    <td key={i} className="px-2 py-[4px] text-right">{v}</td>
                  ))}
                  <td className="px-2.5 py-[4px] text-right">{r[3]}</td>
                </tr>
              ))}
              <tr className="bg-[#fde8e8] font-semibold text-[#0f172a] ring-1 ring-[#2f6db4]">
                <td className="px-2.5 py-[4px]" colSpan={2}>Total général</td>
                {MOIS.map((m) => (
                  <td key={m} className="px-2 py-[4px] text-right">0,00</td>
                ))}
                <td className="px-2.5 py-[4px] text-right">0,00</td>
              </tr>
            </tbody>
          </table>
          <div className="flex gap-1.5 border-t border-[#e6e8ec] bg-[#f6f8fa] px-3 py-1.5 text-[9px]">
            {["Sommaire", "Paramètres", "Synthèse du dossier", "Balance mensuelle", "Balances (données)"].map((t, i) => (
              <span
                key={t}
                className={
                  i === 3
                    ? "rounded px-2 py-0.5 font-semibold text-[#0f172a] ring-1 ring-[#dbe3ec]"
                    : "rounded bg-[#c0392b] px-2 py-0.5 font-medium text-white"
                }
                style={i === 3 ? { background: "#fdf6e3" } : undefined}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Le volet Ora, avec le menu du « + » ouvert */}
        <div className="relative z-10 ml-3 flex w-[360px] shrink-0 flex-col overflow-hidden rounded-[12px] bg-white font-inter shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.07]">
          <div className="flex items-center gap-2 border-b border-[#eef1f5] px-4 py-3">
            <OraStar className="h-4 w-4 text-[#3b82f6]" />
            <span className="text-[13px] font-semibold text-[#0f172a]">Fais la balance</span>
            <span className="ml-auto rounded bg-[#f6f8fb] px-2 py-0.5 text-[10px] font-medium text-[#64748b] ring-1 ring-[#e8edf3]">Côte à côte</span>
          </div>

          <div className="flex-1 px-4 py-3.5">
            <div className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-[#f1f5f9] px-3.5 py-2 text-[11.5px] font-medium text-[#0f172a]">
                peux-tu mettre en rouge la zone sélectionnée
              </p>
            </div>
            <div className="mt-3 rounded-xl ring-1 ring-[#eef1f5]">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff]">
                  <Palette style={{ width: 15, height: 15, color: "#3b82f6" }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-semibold text-[#0f172a]">
                    Édition du classeur · fond rouge · sélection A8:…
                  </p>
                  <p className="text-[10.5px] text-[#94a3b8]">Terminé</p>
                </div>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10b981]">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] leading-[1.6] text-[#334155]">
              Voici le résultat. Fond rouge appliqué sur : Balance mensuelle (lignes 8 à 34,
              colonnes 1 à 16). Le classeur se rouvre dans Excel.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f172a] ring-1 ring-[#e2e8f0]">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#1d6f42]" />
                Ouvrir le classeur
              </span>
              <span className="text-[11px] font-medium text-[#64748b]">Éditer côte à côte</span>
            </div>
          </div>

          <div className="relative px-4 pb-3.5">
            <div className="flex items-center gap-2 rounded-full py-2 pl-3.5 pr-2 ring-1 ring-[#e2e8f0]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eff6ff]">
                <Plus className="h-3.5 w-3.5 text-[#3b82f6]" />
              </span>
              <span className="flex-1 text-[11.5px] text-[#94a3b8]">Demandez : « quelles questions… »</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b82f6]">
                <ArrowUp className="h-3 w-3 text-white" />
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-[1.5] text-[#94a3b8]">
              Chiffres du moteur, anonymisés avant l'envoi ; à relire par le cabinet.
            </p>
          </div>
        </div>
      </DesktopScreen>
    </Stage>
  );
}

/* ── 5. La page Agent, sur la bande noire : le foyer conversationnel
   (capture du 2026-09-09, 21 h), plus les gestes 1-clic que le client
   voulait garder ailleurs sur la page. ──────────────────────────────────── */
export function MockAssistant() {
  const convs = [
    { icon: FileText, tint: "#64748b", bg: "#f1f5f9", name: "Fais la balance", sub: "FEC-2024-comptoir-des-flandres.txt · FEC", when: "à l'instant" },
    { icon: FileSpreadsheet, tint: "#16a34a", bg: "#f0fdf4", name: "Éditer le document", sub: "Terrain d'édition Ora.xlsx · Balance", when: "il y a 7 min" },
    { icon: OraStar, tint: "#3b82f6", bg: "#eff6ff", name: "Éditer le document", sub: "Sans document · conversation", when: "il y a 28 min" },
  ];
  return (
    <Stage variant="night" designW={1040}>
      <AppWindow width={820}>
        <div className="px-10 pb-8 pt-7 text-center">
          <OraStar className="mx-auto h-6 w-6 text-[#3b82f6]" />
          <h3 className="mt-3 text-[30px] font-normal tracking-[-0.022em] text-[#1e293b]">
            Heureux de vous revoir, Claire
          </h3>
          <p className="mt-1 text-[13px] text-[#64748b]">Mercredi 9 septembre</p>
          <div className="mx-auto mt-5 max-w-[560px] text-left">
            <PromptBar placeholder="Demandez : « explique la formation du résultat en trois phrases »" />
          </div>
          <div className="mt-3.5 flex justify-center gap-2">
            {["Calcule la TVA", "Y a-t-il des anomalies ?", "Quel impôt sur les sociétés ?"].map((q) => (
              <span key={q} className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#475569] ring-1 ring-[#e2e8f0]">
                {q}
              </span>
            ))}
          </div>
          <p className="mt-6 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
            Conversations récentes
          </p>
          <div className="mt-2.5 divide-y divide-[#f1f5f9] rounded-2xl text-left ring-1 ring-[#eef1f5]">
            {convs.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-3" style={{ paddingLeft: 18, paddingRight: 18 }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: c.bg }}>
                  <c.icon style={{ color: c.tint, width: 15, height: 15 }} />
                </span>
                <div className="flex-1">
                  <p className="text-[12.5px] font-semibold text-[#0f172a]">{c.name}</p>
                  <p className="text-[11px] text-[#94a3b8]">{c.sub}</p>
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

/* ── 6. Les modules, en vignettes verticales animées ─────────────────────
   La reprise du « Explore the suite of tools » de legora, précisée par le
   client (captures des deux états à l'appui) : des RECTANGLES VERTICAUX à
   fond de couleur unie, et dedans des éléments d'interface qui BOUGENT :
   pastilles qui basculent d'état comme leur « Sources », étapes qui
   défilent comme leur « Step 1 / Step 2 », curseur qui va cliquer une
   cellule, lignes d'un document qui s'écrivent. Titre et description sous
   la carte, pas dedans. Les keyframes vivent dans APP_MOCKUPS_CSS ; tout
   est coupé sous prefers-reduced-motion. */
export const APP_MOCKUPS_CSS = `
@keyframes mkCycle { 0% { opacity: 0; transform: translateY(5px); } 4% { opacity: 1; transform: translateY(0); } 30% { opacity: 1; transform: translateY(0); } 36%, 100% { opacity: 0; transform: translateY(-5px); } }
@keyframes mkActive { 0% { opacity: 0; } 5% { opacity: 1; } 30% { opacity: 1; } 37%, 100% { opacity: 0; } }
@keyframes mkLineIn { 0% { opacity: 0; transform: translateY(3px); } 6% { opacity: 1; transform: translateY(0); } 86% { opacity: 1; } 94%, 100% { opacity: 0; } }
@keyframes mkCursor { 0%, 12% { transform: translate(0, 0); } 38% { transform: translate(-86px, -74px); } 50%, 78% { transform: translate(-86px, -74px); } 100% { transform: translate(0, 0); } }
@keyframes mkPop { 0%, 42% { opacity: 0; transform: scale(0.96); } 50% { opacity: 1; transform: scale(1); } 84% { opacity: 1; } 92%, 100% { opacity: 0; } }
@keyframes mkSweep { 0%, 10% { transform: translateY(0); } 28%, 42% { transform: translateY(38px); } 60%, 74% { transform: translateY(76px); } 92%, 100% { transform: translateY(0); } }
.mkv { animation-duration: 6s; animation-iteration-count: infinite; animation-timing-function: cubic-bezier(.4,0,.2,1); }
@media (prefers-reduced-motion: reduce) { .mkv { animation: none !important; } }
`;

/* Le curseur noir des vignettes legora. */
function VCursor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} width="18" height="18">
      <path d="M5 3 L19 12.5 L12.2 13.8 L15.2 20.4 L12.6 21.5 L9.7 14.9 L5 18.6 Z" fill="#0f172a" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

/* Une pile de pastilles dont l'état actif tourne, comme le sélecteur
   « Sources » de legora : la version translucide dessous, la version pleine
   qui s'allume à tour de rôle par-dessus. */
function ChipCycle({ label, chips, dark = false }: { label: string; chips: string[]; dark?: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className={`text-[13px] font-medium ${dark ? "text-white/90" : "text-[#334155]"}`}>{label}</p>
      <div className="mt-3 flex flex-col items-center gap-2">
        {chips.map((c, i) => (
          <div key={c} className="relative">
            <span
              className={`block rounded-xl px-4 py-2 text-[13px] font-medium ${
                dark ? "bg-white/20 text-white/75" : "bg-white/45 text-[#64748b]"
              }`}
            >
              {c}
            </span>
            <span
              className="mkv absolute inset-0 flex items-center justify-center rounded-xl bg-white text-[13px] font-medium text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
              style={{ animationName: "mkActive", animationDelay: `${i * 2}s`, opacity: 0 }}
            >
              {c}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Les étapes qui se succèdent dans une même puce de verre, comme le
   « Step 1 / Step 2 » du panneau Workflows de legora. */
function StepCycle({ steps }: { steps: [string, string][] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-[86px] w-[240px] rounded-2xl bg-white/55 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-white/60 backdrop-blur-md">
        {steps.map(([step, action], i) => (
          <div
            key={step}
            className="mkv absolute inset-0 flex flex-col justify-center px-5"
            style={{ animationName: "mkCycle", animationDelay: `${i * 2}s`, opacity: 0 }}
          >
            <p className="text-[12px] font-medium text-[#64748b]">{step}</p>
            <p className="mt-1.5 flex items-center gap-2 text-[13.5px] font-semibold text-[#0f172a]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#3b82f6]">
                <ArrowRight className="h-3 w-3 text-white" />
              </span>
              {action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Le document dont les lignes s'écrivent, comme la carte Word Add-In. */
function SceneBilanDoc() {
  const lines = [88, 96, 74, 0, 92, 83, 90, 58];
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-[290px] w-[210px] rounded-md bg-white px-6 py-6 shadow-[0_18px_44px_rgba(15,23,42,0.14)]">
        <p className="text-[11px] font-bold text-[#0f172a]">Bilan développé et SIG</p>
        <div className="mt-1 h-[3px] w-9 rounded bg-[#e2e8f0]" />
        <div className="mt-4">
          {lines.map((w, i) =>
            w === 0 ? (
              <div key={i} className="h-2.5" />
            ) : (
              <div
                key={i}
                className="mkv mt-[8px] h-[5px] rounded-sm bg-[#e5e7eb]"
                style={{ width: `${w}%`, animationName: "mkLineIn", animationDelay: `${0.35 * i}s`, opacity: 0 }}
              />
            ),
          )}
        </div>
        <div className="mkv mt-4 overflow-hidden rounded-[4px] border border-[#eef1f5]" style={{ animationName: "mkPop", opacity: 0 }}>
          <div className="flex bg-[#f8fafc] px-2 py-1 text-[8.5px] font-semibold text-[#475569]">
            <span className="flex-1">Solde intermédiaire</span>
            <span>2025</span>
          </div>
          {["Marge globale", "Valeur ajoutée", "Résultat"].map((r) => (
            <div key={r} className="flex border-t border-[#f1f5f9] px-2 py-1 text-[8.5px] text-[#334155]">
              <span className="flex-1">{r}</span>
              <div className="my-auto h-[4px] w-8 rounded-sm bg-[#e5e7eb]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* La table dont une cellule s'ouvre sous le curseur, comme la carte
   Tabular Review. */
function SceneTableCursor() {
  const rows = ["Loyers annuels", "Emprunt", "Travaux", "Apport", "Assurance"];
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="w-[220px] rounded-lg bg-white/80 p-3 shadow-[0_14px_36px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[10.5px] font-semibold text-[#334155]">Hypothèses</p>
          <Plus className="h-3 w-3 text-[#94a3b8]" />
        </div>
        {rows.map((r) => (
          <div key={r} className="mb-1.5 flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-[#eef1f5]">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#ecfdf5]">
              <Landmark style={{ width: 9, height: 9, color: "#059669" }} />
            </span>
            <span className="text-[9.5px] text-[#475569]">{r}</span>
            <div className="ml-auto h-[4px] w-10 rounded-sm bg-[#eef1f5]" />
          </div>
        ))}
      </div>
      <div
        className="mkv absolute left-1/2 top-1/2 w-[150px] -translate-x-[20%] -translate-y-[80%] rounded-lg bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.22)]"
        style={{ animationName: "mkPop", opacity: 0 }}
      >
        <p className="text-[9.5px] font-semibold text-[#0f172a]">Loyers annuels</p>
        <div className="mt-1.5 h-[4px] w-[80%] rounded-sm bg-[#e5e7eb]" />
        <div className="mt-1 h-[4px] w-[55%] rounded-sm bg-[#e5e7eb]" />
        <p className="mt-2 text-[9px] font-medium text-[#2563eb]">Voir dans le dossier</p>
      </div>
      <VCursor className="mkv absolute" style={{ right: "18%", bottom: "12%", animationName: "mkCursor" }} />
    </div>
  );
}

/* Le suivi dont le surlignage balaie les lignes, écart signalé au passage. */
function SceneBudgetSweep() {
  const rows = ["Charges de personnel", "Achats consommés", "Services extérieurs"];
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative w-[230px] rounded-lg bg-white p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
        <div className="flex justify-between px-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.05em] text-[#94a3b8]">
          <span>Poste</span>
          <span>Réalisé / budget</span>
        </div>
        <div className="relative">
          <div
            className="mkv absolute left-0 right-0 top-0 h-[34px] rounded-md bg-[#eff6ff] ring-1 ring-[#bfdbfe]"
            style={{ animationName: "mkSweep" }}
          />
          {rows.map((r) => (
            <div key={r} className="relative flex h-[34px] items-center gap-2 px-2" style={{ marginBottom: 4 }}>
              <span className="text-[9.5px] text-[#334155]">{r}</span>
              <div className="ml-auto flex w-16 flex-col gap-1">
                <div className="h-[4px] w-full rounded-sm bg-[#dbeafe]">
                  <div className="h-full rounded-sm bg-[#3b82f6]" style={{ width: "72%" }} />
                </div>
                <div className="h-[4px] w-full rounded-sm bg-[#eef1f5]" />
              </div>
            </div>
          ))}
        </div>
        <div
          className="mkv absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[9.5px] font-semibold text-[#b45309] shadow-[0_8px_22px_rgba(15,23,42,0.16)]"
          style={{ animationName: "mkPop", opacity: 0 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
          Écart repéré
        </div>
      </div>
    </div>
  );
}

export const APP_MODULES = [
  {
    icon: ArrowLeftRight,
    tint: "#d97706",
    bg: "#fffbeb",
    stage: "#ece9e1",
    title: "Changement de structure",
    sub: "Comparatif avant / après",
    Scene: () => (
      <ChipCycle
        label="Pourquoi changer ?"
        chips={["Améliorer le net du dirigeant", "Protéger le dirigeant", "Capitaliser et réinvestir"]}
      />
    ),
  },
  {
    icon: PieChart,
    tint: "#7c3aed",
    bg: "#f5f3ff",
    stage: "#ced6d1",
    title: "Bilan développé et SIG",
    sub: "Le bilan et la formation du résultat",
    Scene: SceneBilanDoc,
  },
  {
    icon: Store,
    tint: "#2563eb",
    bg: "#eff6ff",
    stage: "#cfd9e5",
    title: "Prévisionnel d'activité",
    sub: "Dix métiers et neuf filières agricoles : le plan banque",
    Scene: () => (
      <StepCycle
        steps={[
          ["Étape 1", "Le métier"],
          ["Étape 2", "Les hypothèses"],
          ["Étape 3", "Le dossier banque"],
        ]}
      />
    ),
  },
  {
    icon: Landmark,
    tint: "#059669",
    bg: "#ecfdf5",
    stage: "#dde6df",
    title: "Prévisionnel immobilier",
    sub: "Dossier banque en 5 min",
    Scene: SceneTableCursor,
  },
  {
    icon: Scale,
    tint: "#dc2626",
    bg: "#fef2f2",
    stage: "#e08f4f",
    title: "Évaluation d'entreprise",
    sub: "Cinq approches combinées",
    Scene: () => <ChipCycle dark label="Approches" chips={["Multiples", "DCF", "Patrimoniale"]} />,
  },
  {
    icon: Gauge,
    tint: "#0284c7",
    bg: "#f0f9ff",
    stage: "#d8dde3",
    title: "Suivi budgétaire",
    sub: "Réalisé contre budget",
    Scene: SceneBudgetSweep,
  },
];

export function ModuleCard({ module: m }: { module: (typeof APP_MODULES)[number] }) {
  return (
    <div className="font-inter">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[10px]" style={{ background: m.stage }}>
        <m.Scene />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[#111827]">{m.title}</h3>
      <p className="mt-1 text-[13px] leading-[1.6] text-[#5b6577]">{m.sub}</p>
    </div>
  );
}
