/**
 * Atlas simulation — icon helpers shared by all screens.
 */
import {
  BarChart3,
  Briefcase,
  Building2,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Layers,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  colorOf,
  FORMAT_COLOR,
  type DocFormat,
  type ProjectColorId,
  type ProjectIconId,
} from "./data";

export const PROJECT_ICON: Record<ProjectIconId, LucideIcon> = {
  FileSearch,
  Building2,
  Layers,
  FolderOpen,
  Briefcase,
  BarChart3,
  Target,
  Sparkles,
  FileSpreadsheet,
};

/** Colored project tile (icon on soft tint, or solid when `solid`). */
export function ProjectTile({
  icon,
  color,
  size = 36,
  solid,
  className = "",
}: {
  icon: ProjectIconId;
  color: ProjectColorId;
  size?: number;
  solid?: boolean;
  className?: string;
}) {
  const Icon = PROJECT_ICON[icon];
  const c = colorOf(color);
  return (
    <div
      className={`flex items-center justify-center rounded-xl transition-colors duration-150 ${className}`}
      style={{
        width: size,
        height: size,
        background: solid ? c.solid : c.soft,
        color: solid ? "#ffffff" : c.text,
      }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2.2} />
    </div>
  );
}

/** File-format icon: Excel/CSV = FileSpreadsheet émeraude, PDF rouge, Word bleu. */
export function FileIcon({ format, size = 16 }: { format: DocFormat; size?: number }) {
  const Icon = format === "xlsx" || format === "csv" ? FileSpreadsheet : FileText;
  return <Icon size={size} strokeWidth={2.2} style={{ color: FORMAT_COLOR[format] }} />;
}

/** File icon on a soft tinted square (inspector header, automation panel). */
export function FileTile({ format, size = 36 }: { format: DocFormat; size?: number }) {
  const color = FORMAT_COLOR[format];
  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{ width: size, height: size, background: `${color}1a`, color }}
    >
      <FileIcon format={format} size={Math.round(size * 0.5)} />
    </div>
  );
}
