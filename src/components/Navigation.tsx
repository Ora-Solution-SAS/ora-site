import { useState, useEffect } from "react";
import { ArrowRight, Briefcase, PieChart, TrendingUp, Building2 } from "lucide-react";
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

type Page = "home" | "for-business" | "ora-experience" | "solution-template" | "solution-expertise-comptable" | "solution-audit" | "solution-fonds-investissement" | "solution-banque-affaires" | "confidentialite" | "pricing" | "mentions-legales" | "politique-confidentialite" | "cgu" | "espace-client" | "demo" | "not-found";

type NavigationProps = {
  theme: "light" | "dark";
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

  // Ordered by buyer value: PE & M&A (target market) first, audit/accounting
  // (beachhead) after.
  const solutionsLinks: LinkItem[] = [
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
    {
      title: t({ fr: "Audit", en: "Audit" }),
      description: t({ fr: "Accélérez vos missions d'audit avec Ora", en: "Speed up your audit engagements with Ora" }),
      icon: PieChart,
      page: "solution-audit",
    },
    {
      title: t({ fr: "Expertise-comptable", en: "Accounting firms" }),
      description: t({ fr: "Automatisez vos travaux comptables récurrents", en: "Automate your recurring accounting work" }),
      icon: Briefcase,
      page: "solution-expertise-comptable",
    },
  ];

  // Ribbon links that scroll to a homepage section with the shared accelerating
  // animation (handled by App via the `ora:goto-section` event).
  const sectionLinks: { label: string; id: string }[] = [
    { label: t({ fr: "Fonctionnalités", en: "Features" }), id: "features" },
    { label: t({ fr: "Atlas", en: "Atlas" }), id: "atlas" },
    /* ⚠ « controle » ET NON « securite ». L'ancre #securite vivait dans
       PrivacyShowcase, section démontée le 2026-08-15 : le lien ne faisait donc
       plus RIEN, et en silence — animatedScrollToId sort sans bruit quand
       l'élément est absent, donc rien dans la console ne le signalait. La
       section sécurité encore montée est ControlShowcase, id="controle". */
    { label: t({ fr: "Sécurité", en: "Security" }), id: "controle" },
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
          // Ni ombre ni liseré au scroll (client 2026-07-28, référence
          // monday.com) : le bandeau se fond dans la page au lieu de créer une
          // démarcation. Seul le fond translucide + flou le détache.
          ? "bg-[#ffffff]/95 dark:bg-black/95 md:dark:bg-black/95 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      {/* Bandeau plus large et logo calé à gauche (monday.com) : plus de
          max-w-7xl centré qui décollait le logo du bord. */}
      {/* FIGTREE SUR TOUTE LA NAV (client 2026-08-08 : « réplique exactement la
          même police, même couleur et même design que ce screen », capture de
          la barre monday.com — deuxième passe sur cette même référence).
          La première passe (2026-08-06) avait mesuré « Poppins, Arial » sur
          leur body et posé Poppins ici ; c'était la pile de REPLI. La vraie
          fonte de marque monday est FIGTREE, chargée chez nous depuis le
          2026-08-08 pour les cartes « Automatisez de bout en bout » — la nav la
          rejoint, liens en 400, comme l'original.
          Exception assumée à la règle « corps et UI en Inter » de CLAUDE.md, au
          même titre qu'Instrument Sans sur les phrases du manifeste : elle est
          limitée à la barre de navigation, qui est de la typographie
          d'enseigne, pas du texte courant. */}
      <nav className="font-figtree max-w-[1600px] mx-auto flex items-center justify-between px-6 lg:px-8 h-[68px]">

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
            {/* AGRANDI le 2026-08-08 au soir (client : « le logo doit prendre
                plus de place en largeur, tout en étant aligné avec ce qui est
                sur le bandeau ») : h-9 → h-11, soit ~22 % de largeur en plus,
                le ratio étant fixe. L'alignement ne bouge pas : le flex
                items-center du bandeau le centre verticalement dans les 68 px,
                et son bord gauche reste sur le padding du conteneur, comme les
                boutons du bord droit. */}
            <img
              src={(theme === "dark" || overDark) ? "/logos/logo-color-light.png" : "/logos/logo-color-dark.png"}
              alt="Ora"
              className="h-11 w-auto"
            />
          </button>

          {/* Desktop nav */}
          <NavigationMenu className="hidden md:flex" value={menuValue} onValueChange={setMenuValue}>
            <NavigationMenuList>

              {/* Solutions */}
              {/* Liens en Figtree 400, 15,5 px, encre quasi noire #323338 — les
                  valeurs de la barre monday (client 2026-08-08 : « même police,
                  même couleur, même design »). Le style partagé de
                  navigationMenuTriggerStyle (13,5 px, medium, gris) est
                  surchargé ici plutôt que modifié : il sert de base neutre. */}
              <NavigationMenuItem value="solutions">
                <NavigationMenuTrigger
                  className={cn(
                    "text-[15.5px] font-normal text-[#323338] hover:text-[#323338] dark:text-gray-300",
                    overDark && "text-white/85 hover:text-white hover:bg-white/10",
                  )}
                >{t({ fr: "Solutions", en: "Solutions" })}</NavigationMenuTrigger>
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
                      "text-[15.5px] font-normal text-[#323338] hover:text-[#323338] dark:text-gray-300",
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

          {/* LA BASCULE JOUR/NUIT EST PARTIE (client 2026-08-18 : « enlève la
              possibilité de passer le site en nuit jour »). Le site est
              verrouillé en clair par le script d'index.html ; un bouton qui ne
              changerait plus rien n'a pas sa place dans une barre persistante.
              `theme` reste en prop : le logo s'en sert encore. */}
          {/* Espace client — secondary, desktop. Client login: routes to the
              404 placeholder until the real login page / app URL exists. */}
          {/* ── Les deux boutons de la barre monday, pris au mot (client
              2026-08-08 : « même police, même couleur, même design ») ──
              ⚠ L'INDIGO EST PARTI (audit du 2026-08-15). Ces deux boutons
                étaient en #6161FF, un indigo qui n'existe nulle part ailleurs
                sur le site, et la barre de navigation est PERSISTANTE : cet
                indigo était donc à l'écran en même temps que le bleu #3b82f6
                du hero, en permanence, à quinze centimètres de lui. Deux bleus
                voisins mais différents pour le même rôle, c'est le pire des
                deux mondes — on ne lit pas une intention, on lit une erreur.
                Ils prennent le bleu de marque et son survol.
              · contour fin + encre bleue #3b82f6, reprise de
                monday, sur le bouton secondaire — c'est bien LEUR couleur, pas
                le bleu de marque Ora ; « même couleur » a été pris
                littéralement, revenir à #3b82f6 tient en deux constantes ;
              · plein #3b82f6 + flèche sur le principal, sans ombre ni
                soulèvement — la barre monday n'en a pas ;
              · Figtree 500 à 15 px, gabarit px-6/py-2,5, coins pleins.
              Exception assumée à la règle « CTA en font-inter font-semibold »
              de CLAUDE.md, dans le périmètre de la barre seulement. */}
          <button
            onClick={() => onNavigate("espace-client")}
            className={cn(
              "hidden md:inline-flex items-center px-6 py-2.5 rounded-full border text-[15px] font-medium transition-colors duration-150",
              overDark
                ? "border-white/45 text-white hover:bg-white/10"
                : "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/[0.06] dark:border-[#7db9fb] dark:text-[#7db9fb] dark:hover:bg-[#7db9fb]/10"
            )}
          >
            {t({ fr: "Mon espace Ora", en: "My Ora space" })}
          </button>

          {/* Réserver un appel — desktop */}
          <button
            onClick={onBookCall}
            className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[15px] font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-150"
          >
            {t({ fr: "Réserver un appel", en: "Book a call" })}
            <ArrowRight className="w-4 h-4" />
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
        <div className="fixed top-[68px] inset-x-0 bottom-0 z-40 bg-[#ffffff]/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/[0.08] md:hidden overflow-y-auto">
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

            {/* Mêmes couleurs monday que la barre (2026-08-08) : le tiroir
                mobile ne doit pas raconter une autre marque que le bandeau. */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => { setMobileOpen(false); onNavigate("espace-client"); }}
                className="w-full py-3 rounded-full text-[15px] font-medium text-[#3b82f6] border border-[#3b82f6] hover:bg-[#3b82f6]/[0.06] dark:text-[#7db9fb] dark:border-[#7db9fb] dark:hover:bg-[#7db9fb]/10 transition-colors duration-150"
              >
                {t({ fr: "Mon espace Ora", en: "My Ora space" })}
              </button>
              <button
                onClick={() => { setMobileOpen(false); onBookCall?.(); }}
                className="w-full py-3 rounded-full text-[15px] font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-150"
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
