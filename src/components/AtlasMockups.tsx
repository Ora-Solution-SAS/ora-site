import {
  Home,
  Globe,
  Users,
  Zap,
  Settings,
  LogOut,
  Maximize2,
  MessageSquare,
  Bell,
  Sparkles,
  FileSpreadsheet,
  Plus,
  Network,
  Building2,
  FileSearch,
  Layers,
  Inbox,
  ArrowRight,
  ChevronRight,
  Crown,
  FileText,
  Maximize,
  Minus,
  type LucideIcon,
} from "lucide-react";

/**
 * ORA Atlas — 3 static "app screenshot" mockups for the landing page.
 *
 * Built per spec:
 *   - Mockup 1: Accueil (personal dashboard)
 *   - Mockup 2: Vue manager (team list)
 *   - Mockup 3: Vue Galaxy (project graph)
 *
 * Each mockup uses the shared <WindowShell> (titlebar + sidebar + topbar)
 * with the appropriate active nav item and page title.
 *
 * Natural size ~1020px wide; the showcase scales/scrolls these to fit
 * the landing-page container.
 */

// ─────────────────────────────────────────────────────────────────
//  SHARED — Window shell pieces
// ─────────────────────────────────────────────────────────────────

type NavItemId = "home" | "atlas" | "manager" | "engineering";

const NAV_ITEMS: { id: NavItemId; icon: LucideIcon; label: string }[] = [
  { id: "home", icon: Home, label: "Accueil" },
  { id: "atlas", icon: Globe, label: "Atlas" },
  { id: "manager", icon: Users, label: "Vue manager" },
  { id: "engineering", icon: Zap, label: "Engineering" },
];

function Sidebar({ active }: { active: NavItemId }) {
  return (
    <div className="w-[220px] bg-[#f6f7fb] p-4 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#4361ee] flex items-center justify-center text-white font-bold text-[15px]">
          O
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight text-[#0f172a]">Ora</div>
          <div className="text-[11px] text-[#94a3b8] leading-tight">Atlas</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mt-6 mb-2">
        Navigation
      </div>
      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <div
              key={item.id}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium ${
                isActive ? "bg-[#eef2ff] text-[#4361ee]" : "text-[#475569]"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1 bottom-1 w-0.5 bg-[#4361ee] rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* COMPTE (pushed to bottom) */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mt-auto mb-2">
        Compte
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium text-[#475569]">
          <Settings className="w-4 h-4" />
          <span>Paramètres</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium text-[#475569]">
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </div>
      </div>
      <div className="text-[10px] text-[#94a3b8] mt-3 px-3">v0.1 · démo</div>
    </div>
  );
}

function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="h-14 bg-white border-b border-[#eef0f5] px-6 flex items-center justify-between flex-shrink-0">
      {/* Breadcrumb */}
      <div className="text-[13.5px]">
        <span className="font-semibold text-[#0f172a]">{title}</span>
        <span className="text-[#94a3b8]"> · {subtitle}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="bg-[#4361ee] text-white px-3 h-8 rounded-lg text-[12px] font-semibold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Mode extension
        </button>
        <button className="h-8 px-3 rounded-lg border border-[#e6e9f0] text-[12px] font-medium text-[#475569] flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5" />
          Plein écran
        </button>
        <button className="h-8 w-8 rounded-lg border border-[#e6e9f0] flex items-center justify-center text-[#475569]">
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button className="h-8 w-8 rounded-lg border border-[#e6e9f0] flex items-center justify-center text-[#475569]">
          <Bell className="w-3.5 h-3.5" />
        </button>
        <div className="bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Synchronisé
        </div>
        <div className="w-7 h-7 rounded-full bg-[#4361ee] text-white text-[12px] font-bold flex items-center justify-center">
          R
        </div>
      </div>
    </div>
  );
}

function WindowShell({
  activeNav,
  pageTitle,
  pageSubtitle,
  height,
  children,
}: {
  activeNav: NavItemId;
  pageTitle: string;
  pageSubtitle: string;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-white"
      style={{ width: 1020, height, fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}
    >
      {/* macOS titlebar */}
      <div className="h-9 bg-[#f6f7fb] border-b border-[#e6e9f0] flex items-center px-4 relative">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#475569] font-medium pointer-events-none">
          ORA Atlas
        </div>
      </div>

      <div className="flex" style={{ height: height - 36 }}>
        <Sidebar active={activeNav} />
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          <Topbar title={pageTitle} subtitle={pageSubtitle} />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MOCKUP 1 — Accueil (personal dashboard)
// ─────────────────────────────────────────────────────────────────

export function MockupHome() {
  return (
    <WindowShell
      activeNav="home"
      pageTitle="Accueil"
      pageSubtitle="Espace personnel"
      height={680}
    >
      <div className="px-8 py-8" style={{ maxWidth: 1100 }}>
        {/* Hero */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#0f172a]">
              Bon après-midi, Raphaël
            </h1>
            <p className="text-[12.5px] text-[#475569] mt-1.5">
              Samedi 23 mai · Espace personnel
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-[11px] font-bold border border-[#e6e9f0] rounded-[10px] bg-white px-3.5 py-1.5 text-[#475569]">
              Période · 30 derniers jours
            </div>
            <button className="bg-[#4361ee] rounded-[10px] px-3 py-1.5 text-white text-[11.5px] font-bold flex items-center gap-2">
              <div className="bg-white/20 rounded-md w-5 h-5 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              Engineering
              <Zap className="w-2.5 h-2.5" />
            </button>
            <button className="rounded-lg bg-[#4361ee] px-4 py-2 text-[13px] font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-[15px] h-[15px]" />
              Ouvrir un fichier
            </button>
          </div>
        </div>

        {/* Strip 4 cards */}
        <div className="grid grid-cols-4 gap-2.5 mt-6">
          {/* Card 1 — CONTINUER (action) */}
          <div className="rounded-2xl border border-[#4361ee]/30 bg-[#eef2ff]/40 p-4 relative">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Continuer
            </div>
            <div className="text-[14px] font-bold text-[#0f172a] mt-2">
              Aucun fichier récent
            </div>
            <div className="text-[11px] text-[#475569] mt-1">
              Ajoutez un fichier pour commencer
            </div>
            <ArrowRight className="w-4 h-4 text-[#94a3b8] absolute top-4 right-4" />
          </div>
          {/* Card 2 — BOÎTE DE RÉCEPTION (action) */}
          <div className="rounded-2xl border border-[#4361ee]/30 bg-[#eef2ff]/40 p-4 relative">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Boîte de réception
            </div>
            <div className="text-[14px] font-bold text-[#0f172a] mt-2">
              Tout est à jour
            </div>
            <div className="text-[11px] text-[#475569] mt-1">Aucune alerte</div>
            <Inbox className="w-4 h-4 text-[#94a3b8] absolute top-4 right-4" />
          </div>
          {/* Card 3 — HEURES ÉCONOMISÉES */}
          <div className="rounded-2xl border border-[#e6e9f0] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Heures économisées
            </div>
            <div className="text-[28px] font-bold text-[#0f172a] mt-2 leading-none">
              0,0 h
            </div>
            <div className="text-[11px] text-[#475569] mt-2">
              Estimation conservatrice
            </div>
          </div>
          {/* Card 4 — PROJETS ACTIFS */}
          <div className="rounded-2xl border border-[#e6e9f0] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Projets actifs
            </div>
            <div className="text-[28px] font-bold text-[#0f172a] mt-2 leading-none">
              3
            </div>
            <div className="text-[11px] text-[#475569] mt-2">
              Mis à jour sous 30 j
            </div>
          </div>
        </div>

        {/* DÉMARRER */}
        <div className="mt-9">
          <div className="text-[12px] font-bold tracking-wider text-[#0f172a] mb-3.5">
            DÉMARRER
          </div>
          <div className="grid grid-cols-3 gap-3.5">
            <StartTile
              icon={FileSpreadsheet}
              tint="bg-emerald-100 text-emerald-700"
              title="Ouvrir un fichier"
              desc="Excel ou CSV → automatisations"
              selected
            />
            <StartTile
              icon={Plus}
              tint="bg-[#eef2ff] text-[#4361ee]"
              title="Nouveau projet"
              desc="Deal PE, audit, M&A…"
            />
            <StartTile
              icon={Network}
              tint="bg-violet-100 text-violet-700"
              title="Tous les Atlas"
              desc="Liste de vos projets"
            />
          </div>
        </div>

        {/* DOSSIERS ACTIFS */}
        <div className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-bold tracking-wider text-[#0f172a]">
              DOSSIERS ACTIFS
            </div>
            <button className="text-[11px] font-bold text-[#4361ee]">
              Tout voir →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ProjectMiniCard
              icon={Building2}
              tint="bg-violet-100 text-violet-700"
              title="Acquisition NewCo"
              meta="8 fichiers · Deal PE"
              badge={{ label: "🔒 Privé", className: "bg-slate-100 text-slate-700" }}
            />
            <ProjectMiniCard
              icon={FileSearch}
              tint="bg-emerald-100 text-emerald-700"
              title="Audit Bouygues 2026"
              meta="5 fichiers · Audit"
              badge={{ label: "👥 Équipe", className: "bg-blue-50 text-blue-700" }}
            />
            <ProjectMiniCard
              icon={Layers}
              tint="bg-blue-100 text-blue-700"
              title="DD Datadog target"
              meta="12 fichiers · M&A target"
              badge={{ label: "🏢 Entreprise", className: "bg-violet-50 text-violet-700" }}
            />
          </div>
        </div>

        {/* Bannière Engineering */}
        <div className="mt-10 mb-2 bg-[#4361ee] rounded-2xl px-6 py-5 text-white flex items-center gap-5 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-[22px] h-[22px]" />
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-bold">Ora Engineering Solutions</div>
            <div className="text-[12.5px] text-white/85 mt-0.5">
              Une automatisation sur-mesure ? Décrivez votre besoin, on la livre clé en main.
            </div>
          </div>
          <Zap className="w-5 h-5 text-white/80 flex-shrink-0" />
        </div>
      </div>
    </WindowShell>
  );
}

function StartTile({
  icon: Icon,
  tint,
  title,
  desc,
  selected = false,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  desc: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 flex items-center gap-4 ${
        selected ? "border-[#e6e9f0] ring-2 ring-[#4361ee]/30" : "border-[#e6e9f0]"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-bold text-[#0f172a]">{title}</div>
        <div className="text-[11.5px] text-[#475569] mt-0.5">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
    </div>
  );
}

function ProjectMiniCard({
  icon: Icon,
  tint,
  title,
  meta,
  badge,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  meta: string;
  badge: { label: string; className: string };
}) {
  return (
    <div className="rounded-2xl border border-[#e6e9f0] bg-white p-4 flex items-center gap-3 relative">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#0f172a] truncate">{title}</div>
        <div className="text-[11px] text-[#475569] mt-0.5">{meta}</div>
      </div>
      <div className={`absolute top-3 right-3 ${badge.className} rounded-md px-1.5 py-0.5 text-[10px] font-semibold`}>
        {badge.label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MOCKUP 2 — Vue manager (team list)
// ─────────────────────────────────────────────────────────────────

const TEAMS = [
  { name: "Équipe Audit", members: 4, projects: 12, lead: true },
  { name: "Équipe M&A Tech", members: 6, projects: 8, lead: true },
  { name: "Équipe Deal PE", members: 3, projects: 5, lead: false },
  { name: "Équipe Restructuring", members: 2, projects: 3, lead: false },
  { name: "Équipe DD Industries", members: 5, projects: 9, lead: false },
  { name: "Équipe Compliance", members: 2, projects: 4, lead: true },
];

export function MockupManager() {
  return (
    <WindowShell
      activeNav="manager"
      pageTitle="Vue manager"
      pageSubtitle="Vos équipes"
      height={620}
    >
      <div className="px-8 py-8" style={{ maxWidth: 1000 }}>
        {/* Hero */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 items-start">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
              <Users className="w-[22px] h-[22px]" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-[26px] font-bold text-[#0f172a] leading-tight">
                Vue manager
              </h1>
              <p className="text-[12.5px] text-[#475569] mt-1 max-w-md">
                Pilotez vos équipes et visualisez les projets que vos membres partagent avec vous.
              </p>
            </div>
          </div>
          <button className="rounded-lg bg-[#4361ee] px-4 py-2 text-[13px] font-semibold text-white flex items-center gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            Nouvelle équipe
          </button>
        </div>

        {/* VOS ÉQUIPES */}
        <div className="mt-8">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-3">
            Vos équipes
          </div>
          <div className="grid grid-cols-3 gap-3">
            {TEAMS.map((team) => (
              <div
                key={team.name}
                className="rounded-2xl border border-[#e6e9f0] bg-white p-4 flex items-start gap-3 cursor-pointer hover:bg-[#f5f7ff]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#eef2ff] text-[#4361ee] flex items-center justify-center flex-shrink-0">
                  <Users className="w-[18px] h-[18px]" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-[14px] font-semibold text-[#0f172a] truncate">
                      {team.name}
                    </div>
                    {team.lead && <Crown className="w-3.5 h-3.5 text-[#d97706] fill-[#fbbf24] flex-shrink-0" />}
                  </div>
                  <div className="text-[11.5px] text-[#475569] mt-0.5">
                    {team.members} membre{team.members > 1 ? "s" : ""} · {team.projects} projet{team.projects > 1 ? "s" : ""}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94a3b8] flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </WindowShell>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MOCKUP 3 — Vue Galaxy (project graph)
// ─────────────────────────────────────────────────────────────────

type NodeFormat = "xlsx" | "csv" | "pdf";

type GalaxyNode = {
  id: string;
  label: string;
  format: NodeFormat;
  x: number;
  y: number;
  degree: number;
};

type GalaxyEdge = { from: string; to: string };

const FORMAT_STYLE: Record<NodeFormat, { color: string; icon: LucideIcon }> = {
  xlsx: { color: "#22c55e", icon: FileSpreadsheet },
  csv: { color: "#0ea5e9", icon: FileText },
  pdf: { color: "#ef4444", icon: FileText },
};

// A central selected file surrounded by 5 well-spaced satellites — a calm,
// readable constellation with lots of breathing room. No edge labels, no
// legend, no minimap: just the files and how they connect.
const NODES: GalaxyNode[] = [
  { id: "n0", label: "analyses_marges.xlsx", format: "xlsx", x: 500, y: 300, degree: 5 },
  { id: "n1", label: "dashboard_KPIs.xlsx", format: "xlsx", x: 500, y: 95, degree: 1 },
  { id: "n2", label: "audit_provisions.xlsx", format: "xlsx", x: 815, y: 200, degree: 1 },
  { id: "n3", label: "rapport_DD_v3.pdf", format: "pdf", x: 775, y: 470, degree: 1 },
  { id: "n4", label: "clients_export.csv", format: "csv", x: 235, y: 460, degree: 1 },
  { id: "n5", label: "compta_2024.xlsx", format: "xlsx", x: 205, y: 185, degree: 1 },
];

const EDGES: GalaxyEdge[] = [
  { from: "n0", to: "n1" },
  { from: "n0", to: "n2" },
  { from: "n0", to: "n3" },
  { from: "n0", to: "n4" },
  { from: "n0", to: "n5" },
];

const SELECTED_NODE_ID = "n0";

function nodeSize(degree: number) {
  return Math.min(30, 18 + degree * 2);
}

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const c1x = x1 + dx * 0.5;
  const c1y = y1;
  const c2x = x2 - dx * 0.5;
  const c2y = y2;
  return `M ${x1},${y1} C ${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
}

export function MockupGalaxy() {
  const nodesById = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <WindowShell
      activeNav="atlas"
      pageTitle="Atlas"
      pageSubtitle="Acquisition NewCo"
      height={720}
    >
      <div className="px-8 py-8 flex flex-col" style={{ height: "100%" }}>
        {/* Project header — trimmed metadata for a calmer top */}
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="flex gap-3 items-start">
            <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#0f172a] leading-tight">
                Acquisition NewCo
              </h1>
              <div className="flex items-center gap-2 text-[12px] text-[#475569] mt-1.5">
                <span className="rounded-full border border-[#e6e9f0] bg-white px-2.5 py-0.5 text-[11px] font-semibold">
                  Deal PE
                </span>
                <span>· 6 fichiers</span>
              </div>
            </div>
          </div>
          <button className="rounded-lg bg-[#4361ee] px-4 py-2 text-[13px] font-semibold text-white flex items-center gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            Ajouter un fichier
          </button>
        </div>

        {/* Tabs Liste / Galaxy / Kanban */}
        <div className="flex gap-1.5 rounded-xl border border-[#e6e9f0] bg-white p-1 w-fit mb-4">
          <div className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#475569]">
            📋 Liste
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#eef2ff] text-[#4361ee]">
            🌐 Galaxy
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#475569]">
            📊 Kanban
          </div>
        </div>

        {/* Canvas — full-width, intentionally sparse: a soft radial wash and a
            faint dot grid, with the constellation given plenty of empty space. */}
        <div
          className="relative rounded-2xl border border-[#e6e9f0] overflow-hidden flex-1"
          style={{
            background: `
              radial-gradient(ellipse at 50% 42%, rgba(67,97,238,0.05) 0%, transparent 55%),
              #fbfcfe
            `,
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.11) 0.9px, transparent 0.9px)",
            backgroundSize: "30px 30px",
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Clean links — no labels, no arrows, just soft connecting curves */}
            {EDGES.map((edge, i) => {
              const from = nodesById[edge.from];
              const to = nodesById[edge.to];
              return (
                <path
                  key={i}
                  d={bezierPath(from.x, from.y, to.x, to.y)}
                  stroke="rgba(67,97,238,0.20)"
                  strokeWidth={1.5}
                  fill="none"
                />
              );
            })}
          </svg>

          {/* Nodes — positioned over the SVG using % of 1000×600 canvas */}
          {NODES.map((node) => {
            const isSelected = node.id === SELECTED_NODE_ID;
            const size = nodeSize(node.degree) + (isSelected ? 4 : 0);
            const formatStyle = FORMAT_STYLE[node.format];
            const Icon = formatStyle.icon;
            const iconSize = Math.round(size * 0.55);

            return (
              <div
                key={node.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${(node.x / 1000) * 100}%`,
                  top: `${(node.y / 600) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Node circle — white with a file-type colored ring; the
                    selected hub gets a soft brand glow for gentle focus. */}
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: size * 2,
                    height: size * 2,
                    background: isSelected
                      ? "linear-gradient(135deg, #4f6cf0 0%, #3451d1 100%)"
                      : "white",
                    border: isSelected ? "none" : `1.5px solid ${formatStyle.color}`,
                    boxShadow: isSelected
                      ? "0 0 0 6px rgba(67,97,238,0.12), 0 10px 28px rgba(67,97,238,0.30)"
                      : `0 2px 6px ${formatStyle.color}22, 0 1px 2px rgba(15,23,42,0.05)`,
                  }}
                >
                  <Icon
                    style={{
                      width: iconSize,
                      height: iconSize,
                      color: isSelected ? "white" : formatStyle.color,
                    }}
                    strokeWidth={2.25}
                  />
                </div>
                {/* Label — subtle white pill */}
                <div
                  className="font-medium text-center mt-2 px-2 py-0.5 rounded-md inline-block truncate"
                  style={{
                    fontSize: 10.5,
                    maxWidth: 150,
                    color: "#0f172a",
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {node.label}
                </div>
              </div>
            );
          })}

          {/* Minimal zoom controls (bottom-right) */}
          <div className="absolute bottom-3 right-3 flex flex-col rounded-lg border border-[#e6e9f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] overflow-hidden">
            {[Plus, Minus, Maximize].map((Icon, i) => (
              <button
                key={i}
                className="w-7 h-7 flex items-center justify-center text-[#475569] hover:bg-[#f6f7fb] border-b border-[#e6e9f0] last:border-b-0"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </WindowShell>
  );
}
