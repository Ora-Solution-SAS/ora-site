import { useState, useEffect } from "react";
import { Sun, Moon, Briefcase, PieChart, TrendingUp, Building2 } from "lucide-react";
import { createPortal } from "react-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

type Page = "home" | "for-business" | "ora-experience" | "solution-template" | "solution-expertise-comptable" | "solution-audit" | "solution-fonds-investissement" | "solution-banque-affaires" | "confidentialite" | "pricing" | "mentions-legales" | "not-found";

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

// ── DropdownItem ─────────────────────────────────────────────────────────────

// Maps each Solutions page to its branch in the homepage "Built for your
// industry" selector. Clicking a Solutions item scrolls to that selector and
// activates the matching branch instead of routing to a separate page.
const PAGE_TO_INDUSTRY: Partial<Record<Page, string>> = {
  "solution-expertise-comptable": "comptable",
  "solution-audit": "audit",
  "solution-fonds-investissement": "fonds",
  "solution-banque-affaires": "banque",
};

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
  const industryId = PAGE_TO_INDUSTRY[page];

  const handleClick = () => {
    onClose();
    if (industryId) {
      // Scroll to the "Built for your industry" section + select this branch.
      window.dispatchEvent(
        new CustomEvent("ora:goto-industry", { detail: { id: industryId } }),
      );
    } else {
      // Fallback: any future non-industry item still routes normally.
      onNavigate(page);
    }
  };

  return (
    <button
      onClick={handleClick}
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
  // True when the banner overlaps a dark section (Atlas / Ora experience) —
  // drives the immersive "black nav" appearance.
  const [overDark, setOverDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuValue, setMenuValue] = useState("");
  const { t, lang, setLang } = useLang();

  useEffect(() => {
    const handler = () => setMenuValue("solutions");
    window.addEventListener("ora:open-solutions", handler);
    return () => window.removeEventListener("ora:open-solutions", handler);
  }, []);

  const solutionsLinks: LinkItem[] = [
    {
      title: t({ fr: "Expertise-comptable", en: "Accounting firms" }),
      description: t({ fr: "Automatisez vos travaux comptables récurrents", en: "Automate your recurring accounting work" }),
      icon: Briefcase,
      page: "solution-expertise-comptable",
    },
    {
      title: t({ fr: "Audit", en: "Audit" }),
      description: t({ fr: "Accélérez vos missions d'audit avec Ora", en: "Speed up your audit engagements with Ora" }),
      icon: PieChart,
      page: "solution-audit",
    },
    {
      title: t({ fr: "Fonds d'investissement", en: "Investment funds" }),
      description: t({ fr: "Simplifiez le suivi de vos portefeuilles", en: "Simplify portfolio monitoring" }),
      icon: TrendingUp,
      page: "solution-fonds-investissement",
    },
    {
      title: t({ fr: "Banque d'affaires", en: "Investment banking" }),
      description: t({ fr: "Optimisez vos analyses financières", en: "Optimize your financial analyses" }),
      icon: Building2,
      page: "solution-banque-affaires",
    },
  ];

  // Ribbon links that scroll to a homepage section with the shared accelerating
  // animation (handled by App via the `ora:goto-section` event).
  const sectionLinks: { label: string; id: string }[] = [
    { label: t({ fr: "Fonctionnalités", en: "Features" }), id: "features" },
    { label: t({ fr: "Atlas", en: "Atlas" }), id: "atlas" },
    { label: t({ fr: "Sécurité", en: "Security" }), id: "securite" },
  ];

  const goToSection = (id: string) => {
    setMenuValue("");
    setMobileOpen(false);
    window.dispatchEvent(new CustomEvent("ora:goto-section", { detail: { id } }));
  };

  useEffect(() => {
    let rafId = 0;
    // Mid-nav line (the bar is 68px tall) used to test which section sits
    // under the banner.
    const NAV_LINE = 34;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setScrolled(window.scrollY > 12);
        // Immersion: when a section flagged [data-nav-dark] (the dark Atlas /
        // Ora-experience areas) sits under the banner, switch the nav to a
        // dark "on-black" look so it blends into the atmosphere.
        let dark = false;
        document.querySelectorAll<HTMLElement>("[data-nav-dark]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= NAV_LINE && r.bottom >= NAV_LINE) dark = true;
        });
        setOverDark(dark);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        overDark
          ? "bg-black/70 backdrop-blur-md border-b border-white/10"
          : scrolled
          ? "bg-[#ffffff]/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-gray-200/60 dark:border-white/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
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
            aria-label={t({ fr: "Ora, Accueil", en: "Ora, Home" })}
          >
            <img
              src={(theme === "dark" || overDark) ? "/logos/logo-color-light.png" : "/logos/logo-color-dark.png"}
              alt="Ora"
              className="h-9 w-auto"
            />
          </button>

          {/* Desktop nav */}
          <NavigationMenu className="hidden md:flex" value={menuValue} onValueChange={setMenuValue}>
            <NavigationMenuList>

              {/* Solutions */}
              <NavigationMenuItem value="solutions">
                <NavigationMenuTrigger className={overDark ? "text-white/85 hover:text-white hover:bg-white/10" : undefined}>{t({ fr: "Solutions", en: "Solutions" })}</NavigationMenuTrigger>
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
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Section links — animated scroll to a homepage section. */}
              {sectionLinks.map((s) => (
                <NavigationMenuItem key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(s.id)}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      overDark && "text-white/85 hover:text-white hover:bg-white/10",
                    )}
                  >
                    {s.label}
                  </button>
                </NavigationMenuItem>
              ))}

              {/* NOTE: "L'expérience Ora", "Tarifs" and "Confidentialité"
                  links are temporarily hidden until those pages go live.
                  Re-add the NavigationMenuItem blocks here to restore them. */}

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Right: language + theme + CTA + mobile hamburger ── */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className={cn(
              "h-9 px-3 rounded-full flex items-center justify-center text-[12px] font-semibold tracking-wide transition-colors",
              overDark
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08]"
            )}
            aria-label={t({ fr: "Changer de langue", en: "Change language" })}
            title={lang === "fr" ? "Switch to English" : "Passer en français"}
          >
            <span className={cn("transition-opacity", lang === "fr" ? (overDark ? "text-white" : "text-gray-900 dark:text-white") : "opacity-60")}>FR</span>
            <span className="mx-1 opacity-40">/</span>
            <span className={cn("transition-opacity", lang === "en" ? (overDark ? "text-white" : "text-gray-900 dark:text-white") : "opacity-60")}>EN</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              overDark
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08]"
            )}
            aria-label={t({ fr: "Basculer le thème", en: "Toggle theme" })}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Réserver un appel — desktop */}
          <button
            onClick={onBookCall}
            className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-[13.5px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_2px_10px_rgba(59,130,246,0.22)] hover:shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
          >
            {t({ fr: "Réserver un appel", en: "Book a call" })}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              overDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08]"
            )}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <MenuToggleIcon open={mobileOpen} className="w-5 h-5" duration={300} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────── */}
      {mobileOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed top-[68px] inset-x-0 bottom-0 z-40 bg-[#ffffff]/95 dark:bg-[#111827]/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/[0.08] md:hidden overflow-y-auto">
          <div className="px-6 py-4 flex flex-col gap-1">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1">{t({ fr: "Solutions", en: "Solutions" })}</p>
            {solutionsLinks.map((item) => (
              <DropdownItem key={item.title} item={item} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />
            ))}

            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-4 pb-1">{t({ fr: "Explorer", en: "Explore" })}</p>
            {sectionLinks.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSection(s.id)}
                className="flex items-center px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors text-left"
              >
                {s.label}
              </button>
            ))}

            {/* NOTE: "L'expérience Ora", "Tarifs" and "Confidentialité"
                links are temporarily hidden until those pages go live. */}

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => { setMobileOpen(false); onBookCall?.(); }}
                className="w-full py-3 rounded-xl text-[15px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_4px_14px_rgba(59,130,246,0.22)] transition-colors duration-150"
              >
                {t({ fr: "Réserver un appel", en: "Book a call" })}
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
