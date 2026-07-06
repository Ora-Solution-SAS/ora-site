/**
 * Atlas simulation — « Votre Atlas » projects page.
 *
 * Search + grid/list toggle + access/type filter chips, then collapsible
 * sections (pinned, private, team, company). Cards tint to the project color
 * on hover; pin and open behaviors go through the store.
 */
import { useState } from "react";
import {
  Building2,
  ChevronDown,
  LayoutGrid,
  List,
  Lock,
  Pin,
  Plus,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  colorOf,
  memberOf,
  TYPE_CHIP,
  TYPE_LABEL,
  VISIBILITY_CHIP,
  type Project,
  type ProjectType,
  type Visibility,
} from "./data";
import { ProjectTile } from "./icons";
import { Avatar, BtnPrimary, Card, Chip, EASE } from "./ui";
import { useSim } from "./store";

const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: "Privé",
  team: "Équipe",
  company: "Entreprise",
};

const ACCESS_FILTERS: Visibility[] = ["private", "team", "company"];
const TYPE_FILTERS: ProjectType[] = ["audit", "deal_pe", "ma_target", "custom"];

export default function Home() {
  const { state, actions } = useSim();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [accessSel, setAccessSel] = useState<Visibility[]>([]);
  const [typeSel, setTypeSel] = useState<ProjectType[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggle = <T,>(list: T[], v: T): T[] =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const hasFilters = query.trim() !== "" || accessSel.length > 0 || typeSel.length > 0;

  const q = query.trim().toLowerCase();
  const filtered = state.projects.filter(
    (p) =>
      (q === "" || p.name.toLowerCase().includes(q)) &&
      (accessSel.length === 0 || accessSel.includes(p.visibility)) &&
      (typeSel.length === 0 || typeSel.includes(p.type))
  );

  const sections: { id: string; label: string; icon: LucideIcon; projects: Project[] }[] = [
    { id: "pinned", label: "Épinglés", icon: Pin, projects: filtered.filter((p) => p.pinned) },
    {
      id: "private",
      label: "Mes projets privés",
      icon: Lock,
      projects: filtered.filter((p) => !p.pinned && p.visibility === "private"),
    },
    {
      id: "team",
      label: "Projets de mes équipes",
      icon: Users,
      projects: filtered.filter((p) => !p.pinned && p.visibility === "team"),
    },
    {
      id: "company",
      label: "Projets de l'entreprise",
      icon: Building2,
      projects: filtered.filter((p) => !p.pinned && p.visibility === "company"),
    },
  ].filter((s) => s.projects.length > 0);

  const chipCls = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11.5px] font-medium font-inter transition-colors duration-150 ${
      active
        ? "border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]"
        : "border-[#e5e7eb] text-[#6b7280] hover:bg-[#f5f8ff]"
    }`;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6" data-lenis-prevent>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-poppins text-[28px] font-semibold tracking-[-0.03em] text-[#111827]">
              Votre Atlas
            </h1>
            <p className="mt-1 text-[13px] font-inter text-[#6b7280]">
              Tous vos projets réunis au même endroit. Ouvrez-en un pour explorer ses fichiers
              et lancer vos automatisations.
            </p>
          </div>
          <BtnPrimary onClick={actions.openWizard} className="shrink-0">
            <Plus size={15} strokeWidth={2.4} />
            Nouveau projet
          </BtnPrimary>
        </div>

        {/* Controls */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative w-[220px]">
            <Search
              size={13}
              strokeWidth={2.4}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet…"
              className="h-9 w-full rounded-full border border-[#e5e7eb] bg-white pl-8 pr-3.5 text-[12.5px] font-inter text-[#111827] placeholder:text-[#9ca3af] outline-none transition-shadow focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
            />
          </div>

          {/* Grid / list toggle */}
          <div className="flex items-center gap-0.5 rounded-full border border-[#e5e7eb] bg-white p-0.5">
            {(
              [
                { id: "grid", icon: LayoutGrid, label: "Vue grille" },
                { id: "list", icon: List, label: "Vue liste" },
              ] as const
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => setMode(id)}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 ${
                  mode === id ? "bg-[#eff6ff] text-[#3b82f6]" : "text-[#9ca3af] hover:text-[#6b7280]"
                }`}
              >
                <Icon size={14} strokeWidth={2.2} />
              </button>
            ))}
          </div>

          <span className="ml-1 text-[10.5px] font-semibold font-inter uppercase tracking-[0.14em] text-[#9ca3af]">
            Accès
          </span>
          {ACCESS_FILTERS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAccessSel((s) => toggle(s, v))}
              className={chipCls(accessSel.includes(v))}
            >
              {VISIBILITY_LABEL[v]}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-[#e5e7eb]" />

          <span className="text-[10.5px] font-semibold font-inter uppercase tracking-[0.14em] text-[#9ca3af]">
            Type
          </span>
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeSel((s) => toggle(s, t))}
              className={chipCls(typeSel.includes(t))}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setAccessSel([]);
                setTypeSel([]);
              }}
              className="ml-1 text-[11.5px] font-medium font-inter text-[#3b82f6] transition-colors hover:text-[#2563eb]"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Sections */}
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-[13px] font-semibold font-inter text-[#111827]">Aucun projet</div>
            <div className="mt-1 text-[12px] font-inter text-[#6b7280]">
              Ajustez vos filtres ou créez un nouveau projet.
            </div>
          </div>
        ) : (
          sections.map((section) => {
            const isCollapsed = collapsed.includes(section.id);
            const Icon = section.icon;
            return (
              <div key={section.id} className="mt-6">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => toggle(c, section.id))}
                  className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-[#f5f8ff]"
                >
                  <Icon size={13} strokeWidth={2.2} className="text-[#6b7280]" />
                  <span className="text-[12px] font-semibold font-inter text-[#374151]">
                    {section.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10.5px] font-medium font-inter text-slate-600">
                    {section.projects.length}
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2.4}
                    className={`text-[#9ca3af] transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="mt-3" style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}>
                    {mode === "grid" ? (
                      <div className="grid grid-cols-3 gap-4">
                        {section.projects.map((p) => (
                          <ProjectCard key={p.id} project={p} />
                        ))}
                      </div>
                    ) : (
                      <Card className="overflow-hidden">
                        <div className="divide-y divide-[#eef0f5]">
                          {section.projects.map((p) => (
                            <ProjectRow key={p.id} project={p} />
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- card/row */

function useDocCount(projectId: string) {
  const { state } = useSim();
  return state.docs.filter((d) => d.projectId === projectId).length;
}

function ProjectMeta({ project }: { project: Project }) {
  const n = useDocCount(project.id);
  return (
    <span className="text-[10.5px] font-inter text-[#9ca3af] whitespace-nowrap">
      {n} fichier{n > 1 ? "s" : ""} · {project.updatedLabel}
    </span>
  );
}

function ManagerAvatars({ ids, size = 20 }: { ids: string[]; size?: number }) {
  if (ids.length === 0) return <span />;
  return (
    <div className="flex -space-x-1.5" title="Manager(s)">
      {ids.map((id) => {
        const m = memberOf(id);
        return <Avatar key={id} name={m.name} color={m.color} size={size} ring />;
      })}
    </div>
  );
}

function ProjectChips({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-1.5">
      <Chip className={VISIBILITY_CHIP[project.visibility]}>
        {VISIBILITY_LABEL[project.visibility]}
      </Chip>
      <Chip className={TYPE_CHIP[project.type]}>{TYPE_LABEL[project.type]}</Chip>
    </div>
  );
}

function PinButton({ project, className = "" }: { project: Project; className?: string }) {
  const { actions } = useSim();
  return (
    <button
      type="button"
      title={project.pinned ? "Désépingler" : "Épingler"}
      onClick={(e) => {
        e.stopPropagation();
        actions.togglePin(project.id);
      }}
      className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150 ${
        project.pinned
          ? "bg-[#3b82f6] text-white opacity-100"
          : "bg-white/80 text-[#9ca3af] opacity-0 group-hover:opacity-100 hover:bg-[#eff6ff] hover:text-[#3b82f6]"
      } ${className}`}
    >
      <Pin size={12} strokeWidth={2.4} />
    </button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { actions } = useSim();
  const [hovered, setHovered] = useState(false);
  const c = colorOf(project.color);
  return (
    <div
      // Anchor the guided tour to the demo project card.
      data-tour={project.id === "p-alpha" ? "project-alpha" : undefined}
      className="group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1"
      style={{
        borderColor: hovered ? `${c.solid}66` : "#e5e7eb",
        background: hovered ? `${c.solid}0d` : "#ffffff",
        boxShadow: hovered
          ? `0 12px 28px -12px ${c.solid}40, 0 2px 8px rgba(15,23,42,.06)`
          : "0 1px 3px rgba(15,23,42,.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => actions.openProject(project.id)}
    >
      <PinButton project={project} className="absolute right-3 top-3" />
      <ProjectTile icon={project.icon} color={project.color} size={40} solid={hovered} />
      <div
        className="mt-3 text-[15px] font-semibold font-inter transition-colors duration-150"
        style={{ color: hovered ? c.text : "#111827" }}
      >
        {project.name}
      </div>
      <div className="mt-2">
        <ProjectChips project={project} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <ManagerAvatars ids={project.managerIds} />
        <ProjectMeta project={project} />
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const { actions } = useSim();
  return (
    <div
      data-tour={project.id === "p-alpha" ? "project-alpha" : undefined}
      className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[#f5f8ff]"
      onClick={() => actions.openProject(project.id)}
    >
      <ProjectTile icon={project.icon} color={project.color} size={32} />
      <span className="min-w-0 truncate text-[13px] font-semibold font-inter text-[#111827]">
        {project.name}
      </span>
      <ProjectChips project={project} />
      <div className="ml-auto flex items-center gap-3">
        <ManagerAvatars ids={project.managerIds} size={20} />
        <ProjectMeta project={project} />
        <PinButton project={project} />
      </div>
    </div>
  );
}
