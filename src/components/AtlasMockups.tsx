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
  FileText,
  Maximize,
  Minus,
  List,
  LayoutGrid,
  Lock,
  FolderPlus,
  X,
  Calendar,
  Clock,
  Link2,
  Activity,
  ExternalLink,
  Check,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { useState, useRef, Fragment } from "react";
import { motion } from "framer-motion";

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

function Sidebar({ active, dark }: { active: NavItemId; dark?: boolean }) {
  const c = dark
    ? { bg: "#0f172a", text: "#f1f5f9", sub: "#64748b", item: "#94a3b8", activeBg: "#1e293b", activeText: "#93c5fd", accent: "#60a5fa" }
    : { bg: "#f6f7fb", text: "#0f172a", sub: "#94a3b8", item: "#475569", activeBg: "#eef2ff", activeText: "#4361ee", accent: "#4361ee" };
  return (
    <div className="w-[220px] p-4 flex flex-col flex-shrink-0" style={{ background: c.bg }}>
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#4361ee] flex items-center justify-center text-white font-bold text-[15px]">
          O
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight" style={{ color: c.text }}>Ora</div>
          <div className="text-[11px] leading-tight" style={{ color: c.sub }}>Atlas</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="text-[10px] font-bold uppercase tracking-wider mt-6 mb-2" style={{ color: c.sub }}>
        Navigation
      </div>
      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <div
              key={item.id}
              className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium"
              style={{ background: isActive ? c.activeBg : "transparent", color: isActive ? c.activeText : c.item }}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: c.accent }} />
              )}
            </div>
          );
        })}
      </div>

      {/* COMPTE (pushed to bottom) */}
      <div className="text-[10px] font-bold uppercase tracking-wider mt-auto mb-2" style={{ color: c.sub }}>
        Compte
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium" style={{ color: c.item }}>
          <Settings className="w-4 h-4" />
          <span>Paramètres</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium" style={{ color: c.item }}>
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </div>
      </div>
      <div className="text-[10px] mt-3 px-3" style={{ color: c.sub }}>v0.1 · démo</div>
    </div>
  );
}

function Topbar({ title, subtitle, dark }: { title: string; subtitle: string; dark?: boolean }) {
  const c = dark
    ? { bg: "#0f172a", border: "#1e293b", title: "#f1f5f9", sub: "#64748b", btnBorder: "#334155", btnText: "#94a3b8" }
    : { bg: "#ffffff", border: "#eef0f5", title: "#0f172a", sub: "#94a3b8", btnBorder: "#e6e9f0", btnText: "#475569" };
  return (
    <div className="h-14 px-6 flex items-center justify-between flex-shrink-0 border-b" style={{ background: c.bg, borderColor: c.border }}>
      {/* Breadcrumb */}
      <div className="text-[13.5px]">
        <span className="font-semibold" style={{ color: c.title }}>{title}</span>
        <span style={{ color: c.sub }}> · {subtitle}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="bg-[#4361ee] text-white px-3 h-8 rounded-lg text-[12px] font-semibold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Mode extension
        </button>
        <button className="h-8 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-1.5" style={{ borderColor: c.btnBorder, color: c.btnText }}>
          <Maximize2 className="w-3.5 h-3.5" />
          Plein écran
        </button>
        <button className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ borderColor: c.btnBorder, color: c.btnText }}>
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ borderColor: c.btnBorder, color: c.btnText }}>
          <Bell className="w-3.5 h-3.5" />
        </button>
        <div className="rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5" style={dark ? { background: "rgba(16,185,129,0.16)", color: "#6ee7b7" } : { background: "#d1fae5", color: "#047857" }}>
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
  dark,
  children,
}: {
  activeNav: NavItemId;
  pageTitle: string;
  pageSubtitle: string;
  height: number;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl ring-1 ${dark ? "ring-white/10" : "ring-black/5"}`}
      style={{ width: 1020, height, background: dark ? "#0b1120" : "#ffffff", fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}
    >
      {/* macOS titlebar */}
      <div className="h-9 flex items-center px-4 relative border-b" style={{ background: dark ? "#0f172a" : "#f6f7fb", borderColor: dark ? "#1e293b" : "#e6e9f0" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-medium pointer-events-none" style={{ color: dark ? "#64748b" : "#475569" }}>
          ORA Atlas
        </div>
      </div>

      <div className="flex" style={{ height: height - 36 }}>
        <Sidebar active={activeNav} dark={dark} />
        <div className="flex-1 min-w-0 flex flex-col" style={{ background: dark ? "#0b1120" : "#ffffff" }}>
          <Topbar title={pageTitle} subtitle={pageSubtitle} dark={dark} />
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
      height={720}
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
              badge={{ icon: Lock, label: "Privé", className: "bg-slate-100 text-slate-700" }}
            />
            <ProjectMiniCard
              icon={FileSearch}
              tint="bg-emerald-100 text-emerald-700"
              title="Audit Bouygues 2026"
              meta="5 fichiers · Audit"
              badge={{ icon: Users, label: "Équipe", className: "bg-blue-50 text-blue-700" }}
            />
            <ProjectMiniCard
              icon={Layers}
              tint="bg-blue-100 text-blue-700"
              title="DD Datadog target"
              meta="12 fichiers · M&A target"
              badge={{ icon: Building2, label: "Entreprise", className: "bg-violet-50 text-violet-700" }}
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
  badge: { label: string; className: string; icon: LucideIcon };
}) {
  const BadgeIcon = badge.icon;
  return (
    <div className="rounded-2xl border border-[#e6e9f0] bg-white p-4 flex items-center gap-3 relative">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#0f172a] truncate">{title}</div>
        <div className="text-[11px] text-[#475569] mt-0.5">{meta}</div>
      </div>
      <div className={`absolute top-3 right-3 ${badge.className} rounded-md px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-1`}>
        <BadgeIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
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
      height={720}
    >
      <div className="px-8 py-10" style={{ maxWidth: 1000 }}>
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
        <div className="mt-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-4">
            Vos équipes
          </div>
          <div className="grid grid-cols-3 gap-4">
            {TEAMS.map((team) => (
              <div
                key={team.name}
                className="rounded-2xl border border-[#e6e9f0] bg-white p-5 flex items-start gap-3 cursor-pointer hover:bg-[#f5f7ff]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#eef2ff] text-[#4361ee] flex items-center justify-center flex-shrink-0">
                  <Users className="w-[18px] h-[18px]" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[#0f172a] truncate">
                    {team.name}
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
          <div className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#475569] flex items-center gap-1.5">
            <List className="w-3.5 h-3.5" strokeWidth={2.25} /> Liste
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#eef2ff] text-[#4361ee] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" strokeWidth={2.25} /> Galaxy
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#475569] flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.25} /> Kanban
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

// ─────────────────────────────────────────────────────────────────
//  INTERACTIVE Galaxy — same app screen, but visitors add their own
//  folders directly in it (local sandbox, no backend).
// ─────────────────────────────────────────────────────────────────

type Person = { initials: string; color: string };

type GFile = {
  id: string;
  label: string;            // file name without extension
  format: NodeFormat;
  x: number;                // logical position in a 1000×600 canvas space
  y: number;
  hub?: boolean;
  size: string;
  modified: string;
  access: Person[];
  activity: { who: string; action: string; when: string }[];
};

type GLink = { a: string; b: string };

const GALAXY_TYPES: { format: NodeFormat; label: string }[] = [
  { format: "xlsx", label: "Excel" },
  { format: "pdf", label: "PDF" },
  { format: "csv", label: "CSV" },
];

const GALAXY_EXT: Record<NodeFormat, string> = { xlsx: ".xlsx", pdf: ".pdf", csv: ".csv" };

const PEOPLE: Record<"ML" | "TB" | "SR" | "V", Person> = {
  ML: { initials: "ML", color: "#f59e0b" },
  TB: { initials: "TB", color: "#8b5cf6" },
  SR: { initials: "SR", color: "#ec4899" },
  V: { initials: "V", color: "#4361ee" },
};

// Starting constellation: a central workbook linked to four related files.
const INITIAL_FILES: GFile[] = [
  {
    id: "f0", label: "analyses_marges", format: "xlsx", x: 500, y: 300, hub: true,
    size: "2,4 Mo", modified: "il y a 2 h",
    access: [PEOPLE.ML, PEOPLE.TB, PEOPLE.V],
    activity: [
      { who: "Marie", action: "a modifié 3 cellules", when: "il y a 2 h" },
      { who: "Thomas", action: "a consulté le fichier", when: "hier" },
      { who: "Vous", action: "avez partagé l'accès", when: "lun." },
    ],
  },
  {
    id: "f1", label: "dashboard_KPIs", format: "xlsx", x: 800, y: 135,
    size: "1,1 Mo", modified: "il y a 5 h",
    access: [PEOPLE.ML, PEOPLE.V],
    activity: [
      { who: "Marie", action: "a mis à jour les graphiques", when: "il y a 5 h" },
      { who: "Vous", action: "avez ouvert le fichier", when: "il y a 5 h" },
    ],
  },
  {
    id: "f2", label: "audit_provisions", format: "xlsx", x: 820, y: 440,
    size: "880 Ko", modified: "hier",
    access: [PEOPLE.TB, PEOPLE.V],
    activity: [
      { who: "Thomas", action: "a ajouté une note", when: "hier" },
      { who: "Vous", action: "avez consulté", when: "hier" },
    ],
  },
  {
    id: "f3", label: "rapport_DD_v3", format: "pdf", x: 470, y: 515,
    size: "3,2 Mo", modified: "il y a 3 j",
    access: [PEOPLE.SR, PEOPLE.TB, PEOPLE.V],
    activity: [
      { who: "Sofia", action: "a exporté en PDF", when: "il y a 3 j" },
      { who: "Thomas", action: "a laissé un commentaire", when: "il y a 3 j" },
    ],
  },
  {
    id: "f4", label: "clients_export", format: "csv", x: 175, y: 210,
    size: "420 Ko", modified: "il y a 1 sem.",
    access: [PEOPLE.V],
    activity: [{ who: "Vous", action: "avez importé le fichier", when: "il y a 1 sem." }],
  },
];

const INITIAL_LINKS: GLink[] = [
  { a: "f0", b: "f1" },
  { a: "f0", b: "f2" },
  { a: "f0", b: "f3" },
  { a: "f0", b: "f4" },
];

// Tiny faux preview rendered in the detail panel, themed per file type.
function FilePreview({ format, dark }: { format: NodeFormat; dark?: boolean }) {
  const c = dark
    ? { gut: "#0f172a", gutText: "#64748b", head: "#14532d", headText: "#bbf7d0", cell: "#111827", cellAlt: "#0f172a", text: "#e2e8f0", border: "#334155", paper: "#0f172a", line: "#1e293b", lineHead: "#334155" }
    : { gut: "#f1f3f7", gutText: "#94a3b8", head: "#e9f7ef", headText: "#15803d", cell: "#ffffff", cellAlt: "#fafbfd", text: "#0f172a", border: "#e2e8f0", paper: "#ffffff", line: "#e6e9f0", lineHead: "#cbd5e1" };

  // PDF — a clean document card with a title bar and text lines.
  if (format === "pdf") {
    return (
      <div className="rounded-md border p-3" style={{ borderColor: c.border, background: c.paper }}>
        <div className="h-1.5 w-1/2 rounded mb-2.5" style={{ background: c.lineHead }} />
        {[100, 92, 96, 70, 88, 58].map((w, i) => (
          <div key={i} className="h-1 rounded mb-1.5" style={{ width: `${w}%`, background: c.line }} />
        ))}
      </div>
    );
  }

  // xlsx / csv — a miniature spreadsheet with column letters and row numbers.
  const { cols, rows } =
    format === "csv"
      ? {
          cols: ["id", "nom", "segment", "ca"],
          rows: [
            ["1", "Acme", "PME", "128 k€"],
            ["2", "Globex", "ETI", "540 k€"],
            ["3", "Initech", "PME", "86 k€"],
            ["4", "Umbrella", "GE", "1,2 M€"],
          ],
        }
      : {
          cols: ["Poste", "2023", "2024"],
          rows: [
            ["Marge brute", "41 %", "47 %"],
            ["EBITDA", "2,1 M", "2,8 M"],
            ["Trésorerie", "0,9 M", "1,3 M"],
            ["Dette nette", "3,4 M", "2,9 M"],
          ],
        };

  const grid = "16px " + cols.map((_, i) => (i === 0 ? "1.3fr" : "1fr")).join(" ");
  const colHead = { background: c.gut, color: c.gutText, borderRight: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` };

  return (
    <div className="rounded-md border overflow-hidden text-[8px]" style={{ borderColor: c.border }}>
      <div className="grid" style={{ gridTemplateColumns: grid }}>
        {/* Column-letter header: empty corner + A, B, C… */}
        <div style={{ ...colHead }} />
        {cols.map((_, i) => (
          <div key={`L${i}`} className="text-center font-semibold py-0.5" style={{ ...colHead, borderRight: i < cols.length - 1 ? `1px solid ${c.border}` : "none" }}>
            {String.fromCharCode(65 + i)}
          </div>
        ))}

        {/* Row 1 = the spreadsheet's own header (green like Excel) */}
        <div className="flex items-center justify-center font-semibold" style={{ background: c.gut, color: c.gutText, borderRight: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>1</div>
        {cols.map((h, i) => (
          <div key={`H${i}`} className="px-1.5 py-1 font-semibold truncate" style={{ background: c.head, color: c.headText, borderRight: i < cols.length - 1 ? `1px solid ${c.border}` : "none", borderBottom: `1px solid ${c.border}` }}>{h}</div>
        ))}

        {/* Data rows with row numbers in the gutter */}
        {rows.map((row, r) => (
          <Fragment key={r}>
            <div className="flex items-center justify-center font-semibold" style={{ background: c.gut, color: c.gutText, borderRight: `1px solid ${c.border}`, borderBottom: r < rows.length - 1 ? `1px solid ${c.border}` : "none" }}>{r + 2}</div>
            {row.map((cell, ci) => (
              <div
                key={ci}
                className={`px-1.5 py-1 truncate ${ci === 0 ? "font-medium" : "text-right"}`}
                style={{ background: r % 2 ? c.cellAlt : c.cell, color: c.text, borderRight: ci < row.length - 1 ? `1px solid ${c.border}` : "none", borderBottom: r < rows.length - 1 ? `1px solid ${c.border}` : "none" }}
              >
                {cell}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function InteractiveGalaxy() {
  const [files, setFiles] = useState<GFile[]>(INITIAL_FILES);
  const [links, setLinks] = useState<GLink[]>(INITIAL_LINKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [name, setName] = useState("");
  const [format, setFormat] = useState<NodeFormat>("xlsx");
  const [linkDrag, setLinkDrag] = useState<{ from: string; x: number; y: number } | null>(null);
  const [openToast, setOpenToast] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "move" | "link" | null; id: string | null; offX: number; offY: number; startX: number; startY: number }>({ mode: null, id: null, offX: 0, offY: 0, startX: 0, startY: 0 });
  const idRef = useRef(1);
  const toastRef = useRef<number | null>(null);

  const panelFile = files.find((f) => f.id === panelId) ?? null;

  // Theme tokens for the galaxy content (the shell themes itself via `dark`).
  const T = dark
    ? {
        sub: "#94a3b8", pageText: "#f1f5f9",
        panelBg: "#111827", border: "#1f2937", section: "#1f2937",
        toolBg: "#1e293b", toolBorder: "#334155", toolText: "#cbd5e1",
        canvasColor: "#0b1120",
        glow: "radial-gradient(ellipse at 50% 38%, rgba(96,165,250,0.12) 0%, transparent 60%)",
        dot: "rgba(148,163,184,0.10)",
        labelBg: "rgba(15,23,42,0.88)", labelText: "#e2e8f0", labelBorder: "rgba(148,163,184,0.20)",
        nodeBg: "#1e293b",
        ctrlBg: "#1e293b", ctrlBorder: "#334155", ctrlText: "#cbd5e1",
        hintBg: "rgba(17,24,39,0.85)",
        accent: "#93c5fd",
      }
    : {
        sub: "#475569", pageText: "#0f172a",
        panelBg: "#ffffff", border: "#e6e9f0", section: "#eef0f5",
        toolBg: "#ffffff", toolBorder: "#e6e9f0", toolText: "#475569",
        canvasColor: "#fbfcfe",
        glow: "radial-gradient(ellipse at 50% 42%, rgba(67,97,238,0.05) 0%, transparent 55%)",
        dot: "rgba(148,163,184,0.11)",
        labelBg: "rgba(255,255,255,0.92)", labelText: "#0f172a", labelBorder: "rgba(15,23,42,0.06)",
        nodeBg: "#ffffff",
        ctrlBg: "#ffffff", ctrlBorder: "#e6e9f0", ctrlText: "#475569",
        hintBg: "rgba(255,255,255,0.85)",
        accent: "#4361ee",
      };
  const linkColor = (on: boolean) => (dark ? `rgba(96,165,250,${on ? 0.6 : 0.25})` : `rgba(67,97,238,${on ? 0.5 : 0.18})`);

  const radiusOf = (f: GFile) => (f.hub ? 30 : 24);
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const toLogical = (clientX: number, clientY: number) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((clientX - r.left) / r.width) * 1000, y: ((clientY - r.top) / r.height) * 600 };
  };

  // Hit-test in screen pixels so it stays accurate whatever the canvas ratio.
  const nodeAt = (clientX: number, clientY: number, excludeId: string) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return null;
    for (const f of files) {
      if (f.id === excludeId) continue;
      const px = r.left + (f.x / 1000) * r.width;
      const py = r.top + (f.y / 600) * r.height;
      if (Math.hypot(clientX - px, clientY - py) <= radiusOf(f) + 16) return f;
    }
    return null;
  };

  const reset = () => { drag.current = { mode: null, id: null, offX: 0, offY: 0, startX: 0, startY: 0 }; };

  // Drag a file around the canvas.
  const onNodeDown = (e: React.PointerEvent, f: GFile) => {
    e.stopPropagation();
    const p = toLogical(e.clientX, e.clientY);
    drag.current = { mode: "move", id: f.id, offX: p.x - f.x, offY: p.y - f.y, startX: e.clientX, startY: e.clientY };
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* no active pointer */ }
  };
  const onNodeMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.mode !== "move" || !d.id) return;
    const p = toLogical(e.clientX, e.clientY);
    const nx = clamp(p.x - d.offX, 60, 940);
    const ny = clamp(p.y - d.offY, 70, 540);
    setFiles((prev) => prev.map((ff) => (ff.id === d.id ? { ...ff, x: nx, y: ny } : ff)));
  };
  const onNodeUp = (e: React.PointerEvent, f: GFile) => {
    const d = drag.current;
    if (d.mode === "move" && d.id === f.id && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) <= 5) {
      setSelectedId(f.id);
    }
    reset();
  };

  // Drag from a file's blue handle onto another file to create a link.
  const onLinkDown = (e: React.PointerEvent, f: GFile) => {
    e.stopPropagation();
    drag.current = { mode: "link", id: f.id, offX: 0, offY: 0, startX: e.clientX, startY: e.clientY };
    setLinkDrag({ from: f.id, x: f.x, y: f.y });
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* no active pointer */ }
  };
  const onLinkMove = (e: React.PointerEvent) => {
    if (drag.current.mode !== "link") return;
    const p = toLogical(e.clientX, e.clientY);
    setLinkDrag((prev) => (prev ? { ...prev, x: p.x, y: p.y } : prev));
  };
  const onLinkUp = (e: React.PointerEvent, f: GFile) => {
    if (drag.current.mode === "link") {
      const target = nodeAt(e.clientX, e.clientY, f.id);
      if (target) {
        setLinks((prev) =>
          prev.some((l) => (l.a === f.id && l.b === target.id) || (l.a === target.id && l.b === f.id))
            ? prev
            : [...prev, { a: f.id, b: target.id }]
        );
      }
    }
    setLinkDrag(null);
    reset();
  };

  const addFile = () => {
    if (files.length >= 8) return;
    const label = (name.trim() || "nouveau_fichier").replace(/\s+/g, "_");
    const id = `u${idRef.current++}`;
    const angle = ((-90 + files.length * 137.5) * Math.PI) / 180;
    const nf: GFile = {
      id, label, format,
      x: clamp(500 + Math.cos(angle) * 300, 90, 910),
      y: clamp(300 + Math.sin(angle) * 180, 90, 520),
      size: "—", modified: "à l'instant",
      access: [PEOPLE.V],
      activity: [{ who: "Vous", action: "avez créé ce fichier", when: "à l'instant" }],
    };
    setFiles((p) => [...p, nf]);
    setLinks((p) => [...p, { a: "f0", b: id }]);
    setSelectedId(id);
    setName("");
  };

  const removeFile = (id: string) => {
    setFiles((p) => p.filter((f) => f.id !== id));
    setLinks((p) => p.filter((l) => l.a !== id && l.b !== id));
    if (selectedId === id) setSelectedId(null);
    if (panelId === id) setPanelId(null);
  };

  const openFile = () => {
    setOpenToast(true);
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => setOpenToast(false), 2200);
  };

  return (
    <WindowShell activeNav="atlas" pageTitle="Atlas" pageSubtitle="Acquisition NewCo" height={720} dark={dark}>
      <div className="px-6 py-5 flex flex-col" style={{ height: "100%" }}>
        {/* Project header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold leading-tight" style={{ color: T.pageText }}>Acquisition NewCo</h1>
            <div className="flex items-center gap-2 text-[12px] mt-1.5" style={{ color: T.sub }}>
              <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" style={{ borderColor: T.toolBorder, background: T.toolBg }}>Deal PE</span>
              <span>· {files.length} fichiers</span>
            </div>
          </div>
        </div>

        {/* Toolbar: tabs · night toggle · add control */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex gap-1.5 rounded-xl border p-1 w-fit" style={{ borderColor: T.toolBorder, background: T.toolBg }}>
            <div className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5" style={{ color: T.toolText }}><List className="w-3.5 h-3.5" strokeWidth={2.25} /> Liste</div>
            <div className="px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5" style={{ background: dark ? "rgba(96,165,250,0.15)" : "#eef2ff", color: dark ? "#93c5fd" : "#4361ee" }}><Globe className="w-3.5 h-3.5" strokeWidth={2.25} /> Galaxy</div>
            <div className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5" style={{ color: T.toolText }}><LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.25} /> Kanban</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Night-mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              title={dark ? "Vue claire" : "Vue nuit"}
              className="h-8 w-8 rounded-lg border flex items-center justify-center transition-colors"
              style={{ borderColor: T.toolBorder, background: T.toolBg, color: dark ? "#fbbf24" : "#475569" }}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5" style={{ borderColor: T.toolBorder, background: T.toolBg }}>
              <FolderPlus className="w-3.5 h-3.5" style={{ color: T.sub }} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addFile(); }}
                placeholder="Nom du fichier"
                className="bg-transparent outline-none text-[12.5px] w-[110px]"
                style={{ color: T.labelText }}
              />
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: T.toolBorder, background: T.toolBg }}>
              {GALAXY_TYPES.map((o) => {
                const active = format === o.format;
                return (
                  <button
                    key={o.format}
                    onClick={() => setFormat(o.format)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
                    style={active ? { background: FORMAT_STYLE[o.format].color, color: "#fff" } : { color: T.toolText }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={addFile}
              disabled={files.length >= 8}
              className="rounded-lg bg-[#4361ee] px-3 py-1.5 text-[12.5px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50 hover:bg-[#3451d1] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
        </div>

        {/* Canvas + detail panel */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Galaxy canvas — drag files, draw links, double-click for details */}
          <div
            ref={canvasRef}
            className="relative rounded-2xl border overflow-hidden flex-1 min-w-0"
            style={{
              borderColor: T.toolBorder,
              backgroundColor: T.canvasColor,
              backgroundImage: `${T.glow}, radial-gradient(circle, ${T.dot} 0.9px, transparent 0.9px)`,
              backgroundSize: "100% 100%, 30px 30px",
            }}
          >
            {/* Links between files (+ the live link being drawn) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
              {links.map((l, i) => {
                const a = files.find((f) => f.id === l.a);
                const b = files.find((f) => f.id === l.b);
                if (!a || !b) return null;
                const on = selectedId === l.a || selectedId === l.b;
                return <path key={i} d={bezierPath(a.x, a.y, b.x, b.y)} stroke={linkColor(on)} strokeWidth={on ? 2 : 1.5} fill="none" />;
              })}
              {linkDrag && (() => {
                const from = files.find((f) => f.id === linkDrag.from);
                return from ? <path d={bezierPath(from.x, from.y, linkDrag.x, linkDrag.y)} stroke={linkColor(true)} strokeWidth={2} strokeDasharray="5 4" fill="none" /> : null;
              })()}
            </svg>

            {/* Files */}
            {files.map((f) => {
              const r = radiusOf(f);
              const isSel = f.id === selectedId;
              const fmt = FORMAT_STYLE[f.format];
              const Icon = f.hub ? FileSpreadsheet : fmt.icon;
              return (
                <div
                  key={f.id}
                  className="absolute group"
                  style={{ left: `${(f.x / 1000) * 100}%`, top: `${(f.y / 600) * 100}%`, transform: "translate(-50%, -50%)", zIndex: isSel ? 7 : 5 }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      onPointerDown={(e) => onNodeDown(e, f)}
                      onPointerMove={onNodeMove}
                      onPointerUp={(e) => onNodeUp(e, f)}
                      onDoubleClick={() => { setSelectedId(f.id); setPanelId(f.id); }}
                      title="Double-cliquez pour les détails"
                      className="relative rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                      style={{
                        width: r * 2,
                        height: r * 2,
                        touchAction: "none",
                        background: f.hub ? "linear-gradient(135deg, #4f6cf0 0%, #3451d1 100%)" : T.nodeBg,
                        border: f.hub ? "none" : `1.5px solid ${fmt.color}`,
                        boxShadow: isSel
                          ? `0 0 0 4px ${dark ? "rgba(96,165,250,0.25)" : "rgba(67,97,238,0.18)"}, 0 10px 24px ${f.hub ? "rgba(67,97,238,0.35)" : fmt.color + "44"}`
                          : f.hub
                            ? "0 8px 22px rgba(67,97,238,0.30)"
                            : `0 2px 6px ${fmt.color}22`,
                      }}
                    >
                      <Icon style={{ width: r * 0.85, height: r * 0.85, color: f.hub ? "white" : fmt.color }} strokeWidth={2.25} />

                      {/* Link handle — drag onto another file to connect */}
                      <button
                        onPointerDown={(e) => onLinkDown(e, f)}
                        onPointerMove={onLinkMove}
                        onPointerUp={(e) => onLinkUp(e, f)}
                        title="Relier à un autre fichier"
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-crosshair"
                        style={{ touchAction: "none", background: T.nodeBg, border: "1px solid #4361ee", color: "#4361ee" }}
                      >
                        <Link2 className="w-2.5 h-2.5" strokeWidth={2.5} />
                      </button>

                      {/* Remove (satellites only) */}
                      {!f.hub && (
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => removeFile(f.id)}
                          aria-label="Retirer"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-[#ef4444]"
                          style={{ background: T.nodeBg, border: `1px solid ${T.toolBorder}`, color: T.sub }}
                        >
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                    <div
                      className="font-medium text-center mt-2 px-2 py-0.5 rounded-md inline-block truncate pointer-events-none"
                      style={{ fontSize: 10.5, maxWidth: 140, color: T.labelText, background: T.labelBg, border: `1px solid ${isSel ? (dark ? "rgba(96,165,250,0.55)" : "rgba(67,97,238,0.45)") : T.labelBorder}`, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
                    >
                      {f.label}{GALAXY_EXT[f.format]}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Interaction hint */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] backdrop-blur-sm" style={{ zIndex: 6, background: T.hintBg, borderColor: T.toolBorder, color: T.sub }}>
              <Sparkles className="w-3 h-3" style={{ color: T.accent }} />
              Glissez · reliez via le point bleu · double-cliquez pour les détails
            </div>

            {/* Open-file demo toast */}
            {openToast && (
              <motion.div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full text-white px-3.5 py-1.5 text-[11.5px] font-medium shadow-lg whitespace-nowrap"
                style={{ zIndex: 10, background: dark ? "#1e293b" : "#0f172a" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Ouverture du fichier · disponible dans l'app
              </motion.div>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex flex-col rounded-lg border overflow-hidden" style={{ zIndex: 6, background: T.ctrlBg, borderColor: T.ctrlBorder }}>
              {[Plus, Minus, Maximize].map((Icon, i) => (
                <button key={i} className="w-7 h-7 flex items-center justify-center border-b last:border-b-0" style={{ color: T.ctrlText, borderColor: T.ctrlBorder }}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel — opens on double-click, closeable */}
          {panelFile && (
              <motion.div
                key="panel"
                className="w-[250px] flex-shrink-0"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full rounded-2xl border flex flex-col overflow-hidden" style={{ background: T.panelBg, borderColor: T.border }}>
                  <div className="flex-1 overflow-y-auto">
                    {/* File header + close */}
                    <div className="p-4 border-b" style={{ borderColor: T.section }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${FORMAT_STYLE[panelFile.format].color}${dark ? "26" : "14"}` }}>
                          {(() => { const I = FORMAT_STYLE[panelFile.format].icon; return <I className="w-5 h-5" style={{ color: FORMAT_STYLE[panelFile.format].color }} strokeWidth={2.25} />; })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold truncate" style={{ color: T.labelText }}>{panelFile.label}{GALAXY_EXT[panelFile.format]}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: T.sub }}>{panelFile.format.toUpperCase()} · {panelFile.size}</div>
                        </div>
                        <button onClick={() => setPanelId(null)} aria-label="Fermer" title="Fermer" className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 hover:opacity-100 opacity-70 transition-opacity" style={{ color: T.sub }}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: T.sub }}>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {panelFile.modified}</span>
                        <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {links.filter((l) => l.a === panelFile.id || l.b === panelFile.id).length} liens</span>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 border-b" style={{ borderColor: T.section }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: T.sub }}>Aperçu</div>
                      <FilePreview format={panelFile.format} dark={dark} />
                    </div>

                    {/* Access */}
                    <div className="p-4 border-b" style={{ borderColor: T.section }}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: T.sub }}><Lock className="w-3 h-3" /> Qui a accès</div>
                        <button className="text-[10.5px] font-semibold hover:underline" style={{ color: T.accent }}>Gérer</button>
                      </div>
                      <div className="flex items-center">
                        {panelFile.access.map((p, i) => (
                          <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: p.color, marginLeft: i ? -8 : 0, boxShadow: `0 0 0 2px ${T.panelBg}` }}>
                            {p.initials.slice(0, 2)}
                          </div>
                        ))}
                        <span className="text-[11px] ml-2.5" style={{ color: T.sub }}>{panelFile.access.length} {panelFile.access.length > 1 ? "personnes" : "personne"}</span>
                      </div>
                    </div>

                    {/* Activity / tracking record */}
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: T.sub }}><Activity className="w-3 h-3" /> Historique</div>
                      <div className="flex flex-col gap-3">
                        {panelFile.activity.map((ev, i) => (
                          <div key={i} className="flex gap-2.5">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: T.accent }} />
                            <div className="min-w-0">
                              <div className="text-[11.5px] leading-snug" style={{ color: T.labelText }}><span className="font-semibold">{ev.who}</span> {ev.action}</div>
                              <div className="text-[10.5px] flex items-center gap-1 mt-0.5" style={{ color: T.sub }}><Clock className="w-2.5 h-2.5" /> {ev.when}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open file (demo affordance) */}
                  <div className="p-3 border-t" style={{ borderColor: T.section }}>
                    <button onClick={openFile} className="w-full rounded-lg bg-[#4361ee] hover:bg-[#3451d1] transition-colors text-white text-[12.5px] font-semibold py-2.5 flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Ouvrir le fichier
                    </button>
                  </div>
                </div>
              </motion.div>
          )}
        </div>
      </div>
    </WindowShell>
  );
}
