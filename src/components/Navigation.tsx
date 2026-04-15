import { useState, useEffect } from "react";
import { Sun, Moon, FileText, HelpCircle, Briefcase, PieChart, TrendingUp, Building2, FlaskConical } from "lucide-react";
import { createPortal } from "react-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { cn } from "@/lib/utils";

type Page = "home" | "for-business" | "ora-experience" | "not-found";

type NavigationProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onBookCall?: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

// ── Dropdown item types ─────────────────────────────────────────────────────

type LinkItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  page: Page;
};

const solutionsLinks: LinkItem[] = [
  {
    title: "Expertise-comptable",
    description: "Automatisez vos travaux comptables récurrents",
    icon: Briefcase,
    page: "not-found",
  },
  {
    title: "Audit",
    description: "Accélérez vos missions d'audit avec Ora",
    icon: PieChart,
    page: "not-found",
  },
  {
    title: "Fonds d'investissement",
    description: "Simplifiez le suivi de vos portefeuilles",
    icon: TrendingUp,
    page: "not-found",
  },
  {
    title: "Banque d'affaires",
    description: "Optimisez vos analyses financières",
    icon: Building2,
    page: "not-found",
  },
];

const solutionsDevLinks: LinkItem[] = [
  {
    title: "Pour les équipes",
    description: "Page en cours — accès développeur",
    icon: FlaskConical,
    page: "for-business",
  },
];

const ressourcesLinks: LinkItem[] = [
  {
    title: "Documentation",
    description: "Guides et références techniques",
    icon: FileText,
    page: "not-found",
  },
  {
    title: "FAQ",
    description: "Réponses aux questions fréquentes",
    icon: HelpCircle,
    page: "not-found",
  },
];

// ── DropdownItem ─────────────────────────────────────────────────────────────

function DropdownItem({
  item,
  onNavigate,
  onClose,
}: {
  item: LinkItem;
  onNavigate: (page: Page) => void;
  onClose: () => void;
}) {
  const { title, description, icon: Icon, page } = item;

  return (
    <button
      onClick={() => { onClose(); onNavigate(page); }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors w-full text-left"
    >
      <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100/80 dark:bg-white/[0.06] border border-gray-200/60 dark:border-white/[0.08]">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </div>
      <div>
        <div className="text-[13px] font-medium text-gray-900 dark:text-white">{title}</div>
        <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
      </div>
    </button>
  );
}

// ── Main Navigation ─────────────────────────────────────────────────────────

const Navigation: React.FC<NavigationProps> = ({
  theme,
  onToggleTheme,
  onBookCall,
  currentPage,
  onNavigate,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setScrolled(window.scrollY > 12);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (currentPage !== "home") {
      onNavigate("home");
      setTimeout(() => {
        const lenis = (window as any).__lenis;
        if (lenis) lenis.scrollTo(`#${id}`);
        else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    } else {
      const lenis = (window as any).__lenis;
      if (lenis) lenis.scrollTo(`#${id}`);
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#fcfbf7]/90 dark:bg-[#111827]/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-[68px]">

        {/* ── Left: Logo + NavigationMenu ─────────────────── */}
        <div className="flex items-center">
          {/* Logo */}
          <button
            onClick={() => {
              if (currentPage === "home") {
                const lenis = (window as any).__lenis;
                if (lenis) { lenis.start(); lenis.scrollTo(0, { immediate: true }); }
                window.scrollTo({ top: 0 });
              } else {
                onNavigate("home");
              }
            }}
            className="flex-shrink-0 mr-4"
            aria-label="Ora — Accueil"
          >
            <img
              src={theme === "dark" ? "/logos/logo-color-light.png" : "/logos/logo-color-dark.png"}
              alt="Ora"
              className="h-9 w-auto"
            />
          </button>

          {/* Desktop nav */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>

              {/* Solutions */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-72 p-2">
                    {solutionsLinks.map((item) => (
                      <DropdownItem
                        key={item.title}
                        item={item}
                        onNavigate={onNavigate}
                        onClose={() => {}}
                      />
                    ))}
                    {/* DEV A CONSERVER */}
                    <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-white/[0.08]">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pb-1">
                        Dev — à conserver
                      </p>
                      {solutionsDevLinks.map((item) => (
                        <DropdownItem
                          key={item.title}
                          item={item}
                          onNavigate={onNavigate}
                          onClose={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* L'expérience Ora — plain link, no dropdown */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <button
                    onClick={() => onNavigate("ora-experience")}
                    className="inline-flex h-9 items-center justify-center rounded-md px-3.5 py-2 text-[13.5px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    L'expérience Ora
                  </button>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Ressources — masqué V1, à réactiver pour V2
              <NavigationMenuItem>
                <NavigationMenuTrigger>Ressources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-64 p-2">
                    {ressourcesLinks.map((item) => (
                      <DropdownItem
                        key={item.title}
                        item={item}
                        onNavigate={onNavigate}
                        onClose={() => {}}
                      />
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              */}

              {/* Tarifs */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <button
                    onClick={() => onNavigate("not-found")}
                    className="inline-flex h-9 items-center justify-center rounded-md px-3.5 py-2 text-[13.5px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    Tarifs
                  </button>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Right: theme toggle + Log in + CTA + mobile hamburger ── */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
            aria-label="Basculer le thème"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Log in — desktop — masqué V1, à réactiver pour V2
          <button className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-[13.5px] font-medium font-inter text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors duration-150">
            Log in
          </button>
          */}

          {/* Réserver un appel — desktop */}
          <button
            onClick={onBookCall}
            className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-[13.5px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_10px_rgba(59,130,246,0.22)] hover:shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
          >
            Réserver un appel
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <MenuToggleIcon open={mobileOpen} className="w-5 h-5" duration={300} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────── */}
      {mobileOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed top-[68px] inset-x-0 bottom-0 z-40 bg-[#fcfbf7]/95 dark:bg-[#111827]/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/[0.08] md:hidden overflow-y-auto">
          <div className="px-6 py-4 flex flex-col gap-1">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1">Solutions</p>
            {solutionsLinks.map((item) => (
              <DropdownItem key={item.title} item={item} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />
            ))}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-3 pb-1 opacity-60">Dev — à conserver</p>
            {solutionsDevLinks.map((item) => (
              <DropdownItem key={item.title} item={item} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />
            ))}

            <div className="my-2 border-t border-gray-200/60 dark:border-white/[0.08]" />

            <button
              onClick={() => { setMobileOpen(false); onNavigate("ora-experience"); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors text-[13px] font-medium text-gray-900 dark:text-white text-left w-full"
            >
              L'expérience Ora
            </button>

            {/* Ressources mobile — masqué V1, à réactiver pour V2
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-3 pb-1">Ressources</p>
            {ressourcesLinks.map((item) => (
              <DropdownItem key={item.title} item={item} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />
            ))}
            */}

            <button
              onClick={() => { setMobileOpen(false); onNavigate("not-found"); }}
              className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors text-[13px] font-medium text-gray-900 dark:text-white text-left w-full mt-1"
            >
              Tarifs
            </button>

            <div className="mt-4 flex flex-col gap-2">
              {/* Log in mobile — masqué V1, à réactiver pour V2
              <button className="w-full py-3 rounded-xl text-[15px] font-medium font-inter text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors">
                Log in
              </button>
              */}
              <button
                onClick={() => { setMobileOpen(false); onBookCall?.(); }}
                className="w-full py-3 rounded-xl text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_14px_rgba(59,130,246,0.22)]"
              >
                Réserver un appel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Navigation;
