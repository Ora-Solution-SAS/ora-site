/**
 * Atlas simulation — permanent app shell (brief §2).
 *
 * Sidebar 224px (logo, NAVIGATION, items, Ora Engineering card) + topbar 56px
 * (page title, Messages / Notifications / account). The shell wraps every
 * screen of the simulation inside the fixed 1020px window.
 */
import { Bell, FolderTree, Globe, Home, MessageSquare, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "./ui";

const NAV = [
  { id: "home", label: "Accueil", icon: Home },
  { id: "atlas", label: "Atlas", icon: Globe },
  { id: "manager", label: "Vue manager", icon: FolderTree },
  { id: "org", label: "Mon organisation", icon: Users },
] as const;

export default function Shell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <aside className="flex w-[224px] shrink-0 flex-col border-r border-[#eef0f5] bg-white">
        <div className="flex items-center gap-2 px-5 pt-5 pb-4">
          <img src="/logos/icon-color.png" alt="" className="h-6 w-6 object-contain" />
          <span className="font-poppins font-semibold text-[15px] tracking-[-0.02em] text-[#111827]">Ora</span>
        </div>

        <div className="px-5 pb-2 text-[10px] font-semibold font-inter uppercase tracking-[0.14em] text-[#9ca3af]">
          Navigation
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const active = item.id === "atlas";
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium font-inter ${
                  active ? "bg-[#eff6ff] text-[#3b82f6]" : "text-[#6b7280]"
                }`}
              >
                <Icon size={15} strokeWidth={2.2} />
                {item.label}
                {active && (
                  <span className="absolute right-1.5 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-[#3b82f6]" />
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto p-3">
          {/* Ora Engineering card */}
          <div className="rounded-2xl border border-[#eef0f5] bg-[#fcfbf7] p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white">
                <Sparkles size={13} strokeWidth={2.4} />
              </div>
              <span className="text-[12px] font-semibold font-inter text-[#111827]">Ora Engineering</span>
            </div>
            <p className="mt-2 text-[11px] font-inter leading-snug text-[#6b7280]">
              Besoin d'une automatisation ? Décrivez-la, on vous livre un script sur mesure sous 48 h.
            </p>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#fcfbf7]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#eef0f5] bg-white px-5">
          <div className="font-poppins font-semibold text-[15px] tracking-[-0.02em] text-[#111827]">{title}</div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
            >
              <MessageSquare size={15} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
            >
              <Bell size={15} strokeWidth={2.2} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
            </button>
            <div className="ml-1.5">
              <Avatar name="Vous" color="#3b82f6" size={28} />
            </div>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
