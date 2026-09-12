import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Columns2,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Gauge,
  Globe,
  HelpCircle,
  History,
  Home,
  Info,
  Landmark,
  LayoutGrid,
  Link2,
  MessageCircle,
  Moon,
  Palette,
  Paperclip,
  Percent,
  PieChart,
  Play,
  Plus,
  Repeat,
  Scale,
  Search,
  ShieldAlert,
  Store,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import OraStar from "./ui/OraStar";
import { useLang } from "@/lib/i18n";
import { BOOKING_CTA } from "@/lib/bookingCta";

/**
 * OraHeroScenes — le hero « façon attio », monté à l'essai le 2026-09-11 à la
 * place d'OraHeroDemo, qui reste dans le dépôt : l'échange est une ligne dans
 * App.tsx.
 *
 * ── CE QUE FAIT VRAIMENT ATTIO, mesuré en direct sur attio.com ──────────────
 * Le hero n'est PAS piloté par le défilement chez eux : entre scroll 0 et 700
 * les fenêtres gardent la même transformation, c'est un carrousel temporisé
 * (le contenu de la fenêtre principale change au bout de 3,5 s), cinq fenêtres
 * présentes en permanence. Les deux captures du client sont deux scènes de ce
 * carrousel.
 * ⚠ ICI C'EST LE DÉFILEMENT QUI COMMANDE, et c'est une demande explicite du
 * client (2026-09-11, deuxième passe : « il y a une petite animation
 * d'apparition avec le scroll qui fait passer de l'accueil à en action »). Le
 * carrousel automatique a donc été retiré : deux mécaniques concurrentes sur
 * le même objet se battraient pour la même position.
 *
 * ── LES ÉCRANS SONT CEUX DU VRAI LOGICIEL ──────────────────────────────────
 * Client 2026-09-11, quatre captures à l'appui : « base-toi sur les screens de
 * mon logiciel ». Les maquettes ci-dessous reprennent, écran par écran :
 *   · l'ACCUEIL (salutation, trois gestes, barre de l'assistant, « Vos
 *     modules » en six vignettes, « Reprendre ») ;
 *   · la page AGENT (étoile centrée, barre de saisie, conversations récentes) ;
 *   · la page MODULES (« 16 automatisations », recherche, grille à pastilles
 *     « sur l'accueil ») ;
 *   · la conversation FAIS LA BALANCE (carte de run FEC Studio terminée,
 *     journal du moteur replié, les quatre chiffres, les trois gestes) ;
 *   · le menu du « + » et ses huit suggestions.
 * Les libellés, sous-titres et chiffres viennent des captures, pas d'une
 * invention : 230 écritures, 24 comptes, 16,9 % d'opérations diverses,
 * 2 568 604 € de total débit, 16 automatisations dont six épinglées.
 *
 * ⚠ LA SALUTATION DIT « CLAIRE », PAS « TEST ». Les captures montrent le
 * compte de développement du client ; « Claire » est la persona du site, et
 * c'est la règle sur toutes les répliques (voir OraHomeMockup, AppMockups).
 *
 * ── MÉCANIQUE ───────────────────────────────────────────────────────────────
 * Les fenêtres se dessinent dans un repère fixe de 1440 x 780 puis le repère
 * entier est réduit au conteneur par transform (le patron des maquettes Atlas
 * et produit). Une seule valeur, `p`, va de 0 (l'accueil) à 1 (en action) ;
 * chaque fenêtre y branche ses x / y / échelle / opacité. Rien ne repasse par
 * la mise en page, tout se joue au compositeur.
 *
 * ⚠ LA SECTION N'A PAS `overflow-hidden`, ET C'EST NÉCESSAIRE. Un ancêtre en
 * overflow:hidden fait de lui un conteneur de défilement : le `sticky` de la
 * scène s'y accroche, ne bouge plus par rapport au viewport, et l'animation ne
 * démarre jamais. Le rognage vit sur la boîte de la scène, pas sur la section.
 *
 * Sous prefers-reduced-motion, la scène est figée sur « en action », la plus
 * complète, et la piste de défilement se réduit à sa hauteur naturelle.
 */

interface OraHeroScenesProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

const STAGE_W = 1440;
const STAGE_H = 780;

/** La course de défilement pendant laquelle la scène s'épingle et se déplie.
 *
 *  ⚠ CE NOMBRE N'EST PAS LA DISTANCE DU GESTE, et c'est le piège. Avec
 *  `offset: ["start start", "end end"]`, la progression ne court que sur
 *  `hauteur de piste - hauteur d'écran`. À 130 vh sur un écran de 950 px, cela
 *  laissait 285 px, dont 46 % pour le morphing : la scène se dépliait en
 *  131 px de molette, soit un clignement. À 175 vh il reste 712 px, et le
 *  geste s'étale sur ~400 px, ce qui se lit. Si la piste est raccourcie un
 *  jour, refaire ce calcul plutôt que de rogner les fractions ci-dessous. */
const TRACK_VH = 175;
/** Fractions de cette course : avant, on tient l'accueil ; après, on tient la
 *  scène dépliée le temps que l'épinglage se libère. */
const MORPH_IN = 0;
const MORPH_OUT = 0.56;

type WinId = "app" | "agent" | "journal" | "menu";

interface Pose {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

/* Des tailles FRANCHEMENT différentes (client 2026-09-11 : « de différentes
   tailles »), calquées sur la seconde scène d'attio : une petite fiche de chat
   large et basse, un terminal sombre plus haut qui chevauche la principale, la
   principale énorme, un panneau étroit et haut tranché par le bord droit. */
const SIZE: Record<WinId, { w: number; h: number }> = {
  app: { w: 1180, h: 820 },
  agent: { w: 340, h: 318 },
  journal: { w: 390, h: 330 },
  menu: { w: 270, h: 430 },
};

/** Ordre de peinture, du fond vers l'avant.
 *  ⚠ LE MENU EST DEVANT LA FENÊTRE PRINCIPALE, pas derrière. Posé derrière,
 *  la fenêtre lui mangeait sa colonne d'icônes : il ne restait que huit
 *  libellés flottant sur du blanc, ce qui se lisait comme un défaut de rendu
 *  et non comme un panneau. Devant, il sort par la droite et le bord de la
 *  scène le tranche, exactement comme le panneau d'appel vidéo d'attio. */
const Z: Record<WinId, number> = { app: 1, menu: 2, agent: 3, journal: 4 };

const HOME: Record<WinId, Pose> = {
  app: { x: 130, y: 44, scale: 1, opacity: 1 },
  agent: { x: 150, y: 150, scale: 0.9, opacity: 0 },
  journal: { x: 190, y: 430, scale: 0.9, opacity: 0 },
  menu: { x: 1020, y: 220, scale: 0.9, opacity: 0 },
};

const ACTION: Record<WinId, Pose> = {
  app: { x: 330, y: 92, scale: 0.78, opacity: 1 },
  agent: { x: 26, y: 46, scale: 1, opacity: 1 },
  journal: { x: 84, y: 386, scale: 1, opacity: 1 },
  menu: { x: 1200, y: 140, scale: 1, opacity: 1 },
};

/** Fenêtre de révélation de chaque satellite, en fraction de `p`.
 *  ⚠ ILS ARRIVENT TARD ET L'UN APRÈS L'AUTRE, à dessein. Une première version
 *  les ouvrait dès 0,18 et sur de longues plages : à mi-course, trois fenêtres
 *  à demi transparentes se superposaient à la principale, et l'ensemble se
 *  lisait comme un défaut d'affichage, pas comme une composition. Ils sortent
 *  maintenant une fois la fenêtre principale rétrécie et son écran changé, ce
 *  qui raconte quelque chose dans l'ordre : le logiciel recule, le traitement
 *  s'affiche, puis les autres surfaces se déploient autour. */
const REVEAL: Record<WinId, [number, number]> = {
  app: [0, 0],
  agent: [0.38, 0.56],
  journal: [0.50, 0.68],
  menu: [0.62, 0.82],
};

/** Le point où la fenêtre principale change d'écran. */
const SWAP_AT = 0.42;

/* Le fond d'attio, relevé couche par couche dans leur CSS le 2026-09-11
   (client : « un background bien plus ressemblant à ce qu'ils ont fait »).
   Trois calques, dans cet ordre :
   1. la CUVETTE : un dégradé radial ancré en bas au centre.
      ⚠ SON RAYON VERTICAL EST 60 %, PAS LES 80 % D'ATTIO (client 2026-09-12 :
      « que le bleu soit legerement plus en bas, pour donner plus de place la
      ou il y a les elements »). A 80 % la nappe remontait jusqu'au niveau des
      fenetres et les posait sur du bleu ; a 60 % elle reste dans le tiers
      bas. Le voile accompagne : il se retracte moins (0,86 au lieu de 0,75),
      donc la calotte blanche descend moins bas. Deux reglages pour un seul
      effet, les bouger ensemble.
      ⚠ SON OPACITÉ EST DE 0,4 ET MONTE À 0,7 AU DÉFILEMENT. C'est la chose
      que j'avais ratée aux deux premières lectures, et c'est elle qui fait
      tout : leurs couleurs sont soutenues (#86a0ee au plus dense) mais
      posées à 40 %, ce qui donne du #ced9f8 à l'écran. J'avais copié les
      couleurs sans l'opacité, d'où un fond deux fois trop appuyé, puis je
      l'avais compensé en délavant les couleurs, ce qui ne donnait pas le
      même rendu non plus.
      À noter, cela retombe presque exactement sur la nappe des panneaux
      d'AutomationTabs que le client voulait ce matin (#d8e5fc) : les deux
      demandes ne se contredisent pas ;
   2. le RAYAGE : des filets blancs verticaux de 1 px tous les 16 px, à 40 %.
      Le pas d'attio est 8 px ; doublé le 2026-09-12 a la demande du client
      (« des cases un peu plus grandes »). C'est le SEUL ecart assume avec
      leur fond, et il ne change que l'espacement, pas l'encre ni l'opacite.
      ⚠ IL N'Y A AUCUN QUADRILLAGE CHEZ ATTIO. J'avais ajouté un damier de
      48 px qu'ils n'ont pas : c'est lui qui rendait notre fond bavard là où
      le leur est calme. Leur motif est UNIQUEMENT ce rayage vertical fin ;
   3. le VOILE : un radial blanc quatre fois plus large que l'écran, ancré en
      haut, qui fond la cuvette dans la page sans couture.
   (Pas d'accent grave dans ce bloc : template literal.) */
const CSS = `
.ohs-bowl{background:radial-gradient(90% 60% at 50% 100%,#e6ecff 0%,#bccbff 45%,#86a0ee 100%)}
.ohs-ribs{opacity:.4;background:repeating-linear-gradient(90deg,rgba(255,255,255,.78) 0 1px,transparent 1px 16px)}
/* Le voile. Meme dessin qu'attio, deux fois moins de texture : chez eux le
   calque fait 400 % de large avec un radial de 70 % ; ici 200 % et 140 %, ce
   qui donne exactement la meme image. La retraction horizontale descend a
   0,571, donc 200 % couvrent encore 114 % de l'ecran, jamais de bord visible.
   A 400 % c'etait 5760 x 1300 px de couche composee re-mise a l'echelle a
   chaque image, ~30 Mo : sur un GPU integre, c'est de la bande passante prise
   au defilement. (Pas d'accent grave dans ce bloc : template literal.) */
.ohs-veil{position:absolute;top:0;left:-50%;width:200%;height:150%;transform-origin:top;will-change:transform;background:radial-gradient(140% 106.667% at 50% 0%,#fff 32%,transparent 64%)}
.ohs-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
/* Le flottement des fenetres, en KEYFRAMES CSS et non plus en boucle framer
   (passe de fluidite du 2026-09-12). Une animation CSS de transform tourne sur
   le fil du compositeur de WebKit, hors du fil principal : quatre boucles
   JavaScript qui reecrivaient un transform a chaque image, pendant que le
   meme fil devait aussi suivre la molette, c'etait du travail en concurrence
   directe avec le defilement. Amplitude et periode par fenetre via variables. */
@keyframes ohsDrift{
  0%{transform:translate3d(0,0,0)}
  25%{transform:translate3d(var(--dx),var(--dy),0)}
  50%{transform:translate3d(0,0,0)}
  75%{transform:translate3d(calc(var(--dx) * -1),calc(var(--dy) * -1),0)}
  100%{transform:translate3d(0,0,0)}}
.ohs-drift{height:100%;width:100%;animation:ohsDrift var(--dur) ease-in-out infinite;will-change:transform}
.ohs-drift.is-still{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.ohs-drift{animation:none}}
/* La piste et son bloc épinglé n'existent QUE sur grand écran : sur téléphone
   le texte se lit en flux normal, suivi d'une seule fenêtre. En CSS plutôt
   qu'en media query JavaScript, pour qu'il n'y ait rien à recalculer au
   redimensionnement. Même raison sous prefers-reduced-motion, où tout
   redevient du flux. */
.ohs-track{height:auto}
.ohs-pin{position:static}
@media (min-width:1024px){
  .ohs-track{height:${TRACK_VH}vh}
  .ohs-pin{position:sticky;top:68px;height:calc(100vh - 68px)}
}
@media (prefers-reduced-motion:reduce){
  .ohs-track{height:auto}
  .ohs-pin{position:static;height:auto}
}
`;

function useFit(designW: number) {
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

/* ══ Chrome de fenêtre ═════════════════════════════════════════════════════ */
/* `dark` : le chrome du terminal d'attio, #232529 relevé dans leur CSS. */
function TitleBar({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div
      className={`relative flex h-[34px] shrink-0 items-center border-b px-3 ${
        dark ? "border-white/[0.08] bg-[#2a2d32]" : "border-[#e6e6e3] bg-gradient-to-b from-[#fbfbfa] to-[#f4f4f3]"
      }`}
    >
      <div className="flex gap-[7px]">
        <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
      </div>
      <span className={`absolute inset-x-0 text-center font-inter text-[12px] font-semibold ${dark ? "text-white/60" : "text-[#4b5563]"}`}>
        {title}
      </span>
    </div>
  );
}

function Win({ title, dark = false, children }: { title: string; dark?: boolean; children: ReactNode }) {
  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-[14px] font-inter ring-1 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_30px_80px_-24px_rgba(15,23,42,0.35)] ${
        dark ? "bg-[#232529] ring-white/[0.08]" : "bg-white ring-black/[0.08]"
      }`}
    >
      <TitleBar title={title} dark={dark} />
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/* ══ La barre latérale et la barre du haut, communes aux écrans ════════════ */
/* ⚠ LES NOMS DE CONVERSATION SONT FICTIFS ET PARLANTS (client 2026-09-11).
   Les captures de l'application montrent son compte de développement : huit
   entrées dont cinq « Fais la balance » à l'identique et deux phrases
   tronquées en cours de frappe. Recopié tel quel, l'historique donnait l'image
   d'un outil qu'on relance faute de savoir ce qu'on y a déjà fait.
   Chaque titre porte donc un GESTE et un DOSSIER, et se lit seul.
   Les dossiers sont ceux de la démonstration du site (Negoce du Port,
   Comptoir des Flandres, Atelier Mécanique) complétés de raisons sociales
   inventées. Ce ne sont PAS des clients : rien ici ne doit être présenté
   comme une référence, voir les manques connus de CLAUDE.md. */
const CONVERSATIONS = [
  { fr: "Balance 2025 · Negoce du Port", en: "2025 balance · Negoce du Port" },
  { fr: "Bilan développé · Comptoir des Flandres", en: "Detailed balance · Comptoir des Flandres" },
  { fr: "Prévisionnel · Boulangerie Sainte-Anne", en: "Forecast · Boulangerie Sainte-Anne" },
  { fr: "TVA T4 · Garage Petitjean", en: "Q4 VAT · Garage Petitjean" },
  { fr: "Contrôles FEC · Atelier Mécanique", en: "Ledger checks · Atelier Mécanique" },
  { fr: "Évaluation · Transports Vidal", en: "Valuation · Transports Vidal" },
  { fr: "Suivi budgétaire · Clinique des Tilleuls", en: "Budget tracking · Clinique des Tilleuls" },
  { fr: "Relance · Menuiserie Lambert", en: "Follow-up · Menuiserie Lambert" },
];

function Sidebar({ active }: { active: "accueil" | "agent" | "modules" }) {
  const { t } = useLang();
  const item = (on: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] ${
      on ? "bg-[#eff4fe] font-semibold text-[#0f172a]" : "font-medium text-[#475569]"
    }`;
  return (
    <div className="flex w-[248px] shrink-0 flex-col border-r border-[#f1f5f9] bg-white px-3.5 py-4">
      <div className="flex items-center gap-2 px-2 pb-5">
        <img src="/logos/icon-color.png" alt="" className="h-6 w-auto" />
        <span className="font-poppins text-[19px] font-semibold tracking-[-0.02em] text-[#0f172a]">Ora</span>
      </div>

      <div className={item(active === "accueil")}>
        <Home className="h-[17px] w-[17px]" />
        {t({ fr: "Accueil", en: "Home" })}
      </div>
      <div className={`mt-1 ${item(active === "agent")}`}>
        <OraStar className="h-[17px] w-[17px] text-[#3b82f6]" />
        Agent
      </div>

      {/* Le repli « Conversations » de la barre latérale réelle. */}
      <div className="mt-1.5 flex items-center gap-1.5 px-3 text-[13px] font-medium text-[#64748b]">
        <ChevronDown className="h-3.5 w-3.5" />
        Conversations
      </div>
      <div className="mt-0.5">
        {CONVERSATIONS.map((c, k) => (
          <p key={k} className="truncate px-3 py-[7px] text-[13.5px] text-[#64748b]">
            {t(c)}
          </p>
        ))}
      </div>

      <div className={`mt-1.5 ${item(active === "modules")}`}>
        <LayoutGrid className="h-[17px] w-[17px]" />
        Modules
      </div>
      <div className={`mt-1 ${item(false)}`}>
        <Globe className="h-[17px] w-[17px]" />
        Atlas
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-3 py-2.5 text-[14.5px] font-medium text-[#475569]">
          <Wrench className="h-[17px] w-[17px]" />
          Ora Engineering
        </div>
        <div className="mt-1.5 flex items-center gap-3 rounded-2xl px-3.5 py-3 ring-1 ring-[#e8edf3]">
          <OraStar className="h-[18px] w-[18px] shrink-0 text-[#3b82f6]" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#0f172a]">{t({ fr: "Outils", en: "Tools" })}</p>
            <p className="truncate text-[12.5px] text-[#94a3b8]">
              {t({ fr: "Votre journée, vos relances", en: "Your day, your follow-ups" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center border-b border-[#f1f5f9] px-8 py-3.5">
      <p className="text-[15px] font-semibold text-[#0f172a]">{title}</p>
      <div className="ml-auto flex items-center gap-3">
        <Moon className="h-[17px] w-[17px] text-[#94a3b8]" />
        <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[#475569] ring-1 ring-[#e8edf3]">
          <MessageCircle className="h-[15px] w-[15px]" /> Messages
        </span>
        <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[#475569] ring-1 ring-[#e8edf3]">
          <Bell className="h-[15px] w-[15px]" /> Notifications
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-semibold text-white">
            1
          </span>
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6] text-[13px] font-semibold text-white">C</span>
      </div>
    </div>
  );
}

function PromptBar({ placeholder, hint }: { placeholder: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-3.5 rounded-[22px] bg-white px-5 py-3.5 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] ring-1 ring-[#eef1f5]">
        <Plus className="h-[18px] w-[18px] shrink-0 text-[#64748b]" />
        <OraStar className="h-[18px] w-[18px] shrink-0 text-[#3b82f6]" />
        <span className="flex-1 truncate text-[15px] text-[#94a3b8]">{placeholder}</span>
        <Paperclip className="h-[18px] w-[18px] shrink-0 text-[#94a3b8]" />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#bfd7fb]">
          <ArrowUp className="h-[18px] w-[18px] text-white" />
        </span>
      </div>
      {hint && <p className="mt-2 px-2 text-[12px] text-[#cbd5e1]">{hint}</p>}
    </div>
  );
}

/* ══ 1. L'ACCUEIL ══════════════════════════════════════════════════════════ */
const MODULES_ACCUEIL = [
  { icon: Repeat, tint: "#d97706", bg: "#fef6e7", fr: "Changement de structure", en: "Structure change", sfr: "Comparatif avant / après", sen: "Before / after comparison" },
  { icon: PieChart, tint: "#7c3aed", bg: "#f4efff", fr: "Bilan développé et SIG", en: "Detailed balance sheet", sfr: "Le bilan et la formation du résultat", sen: "The balance sheet and how the result forms" },
  { icon: Store, tint: "#2563eb", bg: "#eef4fe", fr: "Prévisionnel d'activité", en: "Activity forecast", sfr: "Dix métiers et neuf filières agricoles : le plan banque", sen: "Ten trades and nine farming sectors: the bank plan" },
  { icon: Landmark, tint: "#16a34a", bg: "#effaf1", fr: "Prévisionnel immobilier", en: "Property forecast", sfr: "Dossier banque en 5 min", sen: "Bank file in 5 min" },
  { icon: Scale, tint: "#e11d48", bg: "#fdeff2", fr: "Évaluation d'entreprise", en: "Business valuation", sfr: "Cinq approches combinées", sen: "Five combined approaches" },
  { icon: Gauge, tint: "#0284c7", bg: "#eef7fe", fr: "Suivi budgétaire", en: "Budget tracking", sfr: "Réalisé contre budget", sen: "Actual versus budget" },
];

function ScreenAccueil() {
  const { t } = useLang();
  return (
    <div className="flex h-full bg-white">
      <Sidebar active="accueil" />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={t({ fr: "Accueil", en: "Home" })} />
        <div className="min-h-0 flex-1 overflow-hidden px-9 pt-6">
          <p className="text-[15px] font-semibold text-[#0f172a]">{t({ fr: "Accueil", en: "Home" })}</p>
          <h3 className="mt-3 font-inter text-[40px] font-normal leading-[1.1] tracking-[-0.025em] text-[#0f172a]">
            {t({ fr: "Heureux de vous revoir, Claire", en: "Good to see you again, Claire" })}
          </h3>
          <p className="mt-1.5 text-[15px] text-[#64748b]">{t({ fr: "Vendredi 11 septembre", en: "Friday 11 September" })}</p>

          <div className="mt-6 flex items-center gap-3.5">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-[#3b82f6] px-6 py-3 text-[15px] font-semibold text-white">
              <FileText className="h-[17px] w-[17px]" />
              {t({ fr: "Ouvrir un fichier avec Ora", en: "Open a file with Ora" })}
            </span>
            <span className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[15px] font-medium text-[#0f172a] ring-1 ring-[#e2e8f0]">
              <Plus className="h-[17px] w-[17px]" />
              {t({ fr: "Nouveau projet", en: "New project" })}
            </span>
            <span className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[15px] font-medium text-[#0f172a] ring-1 ring-[#e2e8f0]">
              <History className="h-[17px] w-[17px]" />
              {t({ fr: "Reprendre", en: "Resume" })}
              <ChevronRight className="h-[15px] w-[15px] text-[#94a3b8]" />
            </span>
          </div>

          <div className="mt-5">
            <PromptBar placeholder={t({ fr: "Demandez : « analyse cette plaquette »", en: "Ask: “analyse this financial statement”" })} />
          </div>

          <div className="mt-8 flex items-center gap-2">
            <p className="text-[21px] font-semibold tracking-[-0.02em] text-[#0f172a]">{t({ fr: "Vos modules", en: "Your modules" })}</p>
            <ChevronRight className="h-[18px] w-[18px] text-[#94a3b8]" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3.5">
            {MODULES_ACCUEIL.map((m) => (
              <div key={m.fr} className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 ring-1 ring-[#eef1f5]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: m.bg }}>
                  <m.icon style={{ width: 19, height: 19, color: m.tint }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold text-[#0f172a]">{t({ fr: m.fr, en: m.en })}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-[1.35] text-[#94a3b8]">{t({ fr: m.sfr, en: m.sen })}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#cbd5e1]" />
              </div>
            ))}
          </div>

          <p className="mt-7 text-[21px] font-semibold tracking-[-0.02em] text-[#0f172a]">{t({ fr: "Reprendre", en: "Resume" })}</p>
          <div className="mt-3 flex items-center gap-3.5 rounded-2xl px-4 py-3.5 ring-1 ring-[#eef1f5]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f5f9]">
              <FileText className="h-[17px] w-[17px] text-[#64748b]" />
            </span>
            <p className="text-[14.5px] font-semibold text-[#0f172a]">FEC_demo_petit_5k_2024_N</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ 2. LA PAGE AGENT ══════════════════════════════════════════════════════ */
function ScreenAgent() {
  const { t } = useLang();
  const convs = [
    { icon: OraStar, tint: "#3b82f6", fr: "Prévisionnel 2026 · Boulangerie Sainte-Anne", en: "2026 forecast · Boulangerie Sainte-Anne", sub: t({ fr: "Sans document · conversation", en: "No document · conversation" }), when: t({ fr: "à l'instant", en: "just now" }) },
    { icon: FileSpreadsheet, tint: "#16a34a", fr: "Balance 2025 · Negoce du Port", en: "2025 balance · Negoce du Port", sub: "FEC 2025 Negoce du Port (xlsx).xlsx · FEC", when: "10 sept." },
    { icon: OraStar, tint: "#3b82f6", fr: "Contrôles FEC · Atelier Mécanique", en: "Ledger checks · Atelier Mécanique", sub: t({ fr: "Sans document · conversation", en: "No document · conversation" }), when: "10 sept." },
  ];
  return (
    <Win title="Ora">
      <div className="flex h-full flex-col bg-white px-6 pb-4 pt-5 font-inter">
        <div className="text-center">
          <OraStar className="mx-auto h-5 w-5 text-[#3b82f6]" />
          <p className="mt-2 text-[20px] font-normal tracking-[-0.022em] text-[#0f172a]">
            {t({ fr: "Heureux de vous revoir, Claire", en: "Good to see you again, Claire" })}
          </p>
          <p className="mt-0.5 text-[11.5px] text-[#64748b]">{t({ fr: "Vendredi 11 septembre", en: "Friday 11 September" })}</p>
        </div>
        <div className="mt-3.5 flex items-center gap-2.5 rounded-full bg-white px-3.5 py-2.5 ring-1 ring-[#eef1f5]">
          <Plus className="h-3.5 w-3.5 shrink-0 text-[#64748b]" />
          <span className="flex-1 truncate text-[11.5px] text-[#94a3b8]">
            {t({ fr: "Demandez : « explique la formation du résultat »", en: "Ask: “explain how the result formed”" })}
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#bfd7fb]">
            <ArrowUp className="h-3 w-3 text-white" />
          </span>
        </div>
        <p className="mt-4 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-[#94a3b8]">
          {t({ fr: "Conversations récentes", en: "Recent conversations" })}
        </p>
        <div className="mt-1.5">
          {convs.slice(0, 2).map((c, k) => (
            <div key={k} className="flex items-center gap-2.5 py-2">
              <c.icon style={{ width: 14, height: 14, color: c.tint }} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-[#0f172a]">{t({ fr: c.fr, en: c.en })}</p>
                <p className="truncate text-[10.5px] text-[#94a3b8]">{c.sub}</p>
              </div>
              <span className="shrink-0 text-[10.5px] text-[#94a3b8]">{c.when}</span>
              <X className="h-3 w-3 shrink-0 text-[#cbd5e1]" />
            </div>
          ))}
        </div>
      </div>
    </Win>
  );
}

/* ══ 3. LA PAGE MODULES ════════════════════════════════════════════════════ */
const MODULES_GRID = [
  { icon: Landmark, tint: "#16a34a", bg: "#effaf1", fr: "Prévisionnel immobilier", en: "Property forecast", pin: true },
  { icon: Repeat, tint: "#d97706", bg: "#fef6e7", fr: "Changement de structure", en: "Structure change", pin: true },
  { icon: Scale, tint: "#e11d48", bg: "#fdeff2", fr: "Évaluation d'entreprise", en: "Business valuation", pin: true },
  { icon: Link2, tint: "#7c3aed", bg: "#f4efff", fr: "Comparaison de valorisations", en: "Valuation comparison", pin: false },
  { icon: PieChart, tint: "#7c3aed", bg: "#f4efff", fr: "Bilan développé et SIG", en: "Detailed balance sheet", pin: true },
  { icon: Gauge, tint: "#0284c7", bg: "#eef7fe", fr: "Suivi budgétaire", en: "Budget tracking", pin: true },
  { icon: FileSignature, tint: "#0284c7", bg: "#eef7fe", fr: "Courriers et attestations", en: "Letters and certificates", pin: false },
  { icon: Store, tint: "#2563eb", bg: "#eef4fe", fr: "Prévisionnel d'activité", en: "Activity forecast", pin: true },
  { icon: TrendingUp, tint: "#7c3aed", bg: "#f4efff", fr: "Arbitrages de fin d'année", en: "Year-end trade-offs", pin: false },
];

/* ⚠ NON MONTÉE DEPUIS LE 2026-09-11 (même jour, troisième passe) : la scène
   reprend les QUATRE fenêtres d'attio, et la quatrième est devenue le journal
   du moteur, sombre, parce que le client voulait « une interface black ». La
   grille des modules reste ici, exportée, prête à reprendre la place du menu
   ou du journal en une ligne dans la scène. */
export function ScreenModules() {
  const { t } = useLang();
  return (
    <Win title="Ora">
      <div className="flex h-full flex-col bg-white px-5 pb-4 pt-4 font-inter">
        <p className="text-[19px] font-semibold tracking-[-0.02em] text-[#0f172a]">Modules</p>
        <p className="mt-1 text-[11px] text-[#64748b]">
          {t({
            fr: "16 automatisations. Les six du quotidien sont épinglées sur votre accueil.",
            en: "16 automations. The six daily ones are pinned to your home screen.",
          })}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-[#eef1f5]">
          <Search className="h-3.5 w-3.5 text-[#94a3b8]" />
          <span className="truncate text-[11px] text-[#94a3b8]">
            {t({ fr: "Chercher un module : bilan, prévisionnel, TVA…", en: "Search a module: balance sheet, forecast, VAT…" })}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {MODULES_GRID.map((m) => (
            <div key={m.fr} className="relative rounded-xl px-2.5 py-2.5 ring-1 ring-[#eef1f5]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: m.bg }}>
                <m.icon style={{ width: 14, height: 14, color: m.tint }} />
              </span>
              {m.pin && (
                <span className="absolute right-2 top-2 rounded bg-[#f6f8fb] px-1.5 py-0.5 text-[7.5px] font-medium text-[#94a3b8]">
                  {t({ fr: "sur l'accueil", en: "on home" })}
                </span>
              )}
              <p className="mt-2.5 line-clamp-2 text-[11px] font-semibold leading-[1.3] text-[#0f172a]">{t({ fr: m.fr, en: m.en })}</p>
            </div>
          ))}
        </div>
      </div>
    </Win>
  );
}

/* ══ 4. LA CONVERSATION « FAIS LA BALANCE » ════════════════════════════════ */
const HISTORIQUE = [
  { icon: FileSpreadsheet, tint: "#16a34a", fr: "Balance 2025 · Negoce du Port", en: "2025 balance · Negoce du Port", sub: "FEC 2025 Negoce du Port…", on: true },
  { icon: FileText, tint: "#64748b", fr: "Bilan développé · Comptoir des Flandres", en: "Detailed balance · Comptoir des Flandres", sub: "FEC-2024-comptoir-des-fl…", on: false },
  { icon: OraStar, tint: "#3b82f6", fr: "Prévisionnel · Boulangerie Sainte-Anne", en: "Forecast · Boulangerie Sainte-Anne", sub: "Sans document", on: false },
  { icon: OraStar, tint: "#3b82f6", fr: "TVA T4 · Garage Petitjean", en: "Q4 VAT · Garage Petitjean", sub: "Sans document", on: false },
  { icon: FileSpreadsheet, tint: "#16a34a", fr: "Contrôles FEC · Atelier Mécanique", en: "Ledger checks · Atelier Mécanique", sub: "FEC 2025 Atelier Mécanique…", on: false },
  { icon: OraStar, tint: "#3b82f6", fr: "Évaluation · Transports Vidal", en: "Valuation · Transports Vidal", sub: "Sans document", on: false },
  { icon: FileSpreadsheet, tint: "#16a34a", fr: "Suivi budgétaire · Clinique des Tilleuls", en: "Budget tracking · Clinique des Tilleuls", sub: "Budget 2025.xlsx…", on: false },
  { icon: OraStar, tint: "#3b82f6", fr: "Relance · Menuiserie Lambert", en: "Follow-up · Menuiserie Lambert", sub: "Sans document", on: false },
];

function ScreenBalance() {
  const { t } = useLang();
  const stats: [string, string][] = [
    [t({ fr: "Écritures", en: "Entries" }), "230"],
    [t({ fr: "Comptes", en: "Accounts" }), "24"],
    [t({ fr: "Part des opérations diverses", en: "Share of misc. entries" }), "16,9 %"],
    [t({ fr: "Total débit", en: "Total debit" }), "2 568 604 €"],
  ];
  return (
    <div className="flex h-full flex-col bg-white">
      {/* L'en-tête de conversation : retour, titre, pièce, les trois gestes. */}
      <div className="flex items-center gap-4 border-b border-[#f1f5f9] px-7 py-3.5">
        <ArrowLeft className="h-[18px] w-[18px] shrink-0 text-[#94a3b8]" />
        <OraStar className="h-[18px] w-[18px] shrink-0 text-[#3b82f6]" />
        <div className="min-w-0">
          {/* Le titre reprend la PREMIÈRE entrée de l'historique, celle qui
              porte l'état actif : c'est la même conversation. */}
          <p className="text-[19px] font-semibold tracking-[-0.02em] text-[#0f172a]">
            {t({ fr: "Balance 2025 · Negoce du Port", en: "2025 balance · Negoce du Port" })}
          </p>
          <p className="truncate text-[12.5px] text-[#94a3b8]">
            {t({ fr: "Chaque chiffre vient du moteur et se refait à la main", en: "Every figure comes from the engine and can be redone by hand" })}
          </p>
        </div>
        <span className="ml-5 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f0f6ff] px-3.5 py-1.5 text-[12.5px] font-medium text-[#2563eb]">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          FEC 2025 Negoce du Port (xlsx).xlsx
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          {[
            { icon: FileText, fr: "Le document", en: "The document" },
            { icon: Plus, fr: "Nouvelle", en: "New" },
            { icon: Columns2, fr: "Côte à côte", en: "Side by side" },
          ].map((b) => (
            <span key={b.fr} className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium text-[#0f172a] ring-1 ring-[#e8edf3]">
              <b.icon className="h-[15px] w-[15px] text-[#64748b]" />
              {t({ fr: b.fr, en: b.en })}
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* L'historique de gauche */}
        <div className="w-[258px] shrink-0 border-r border-[#f1f5f9] px-3.5 py-3.5">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-[#0f172a] ring-1 ring-[#e8edf3]">
            <Plus className="h-4 w-4 text-[#64748b]" />
            {t({ fr: "Nouvelle conversation", en: "New conversation" })}
          </div>
          <p className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#94a3b8]">
            {t({ fr: "Historique", en: "History" })}
          </p>
          <div className="mt-1.5">
            {HISTORIQUE.map((h, k) => (
              <div key={k} className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${h.on ? "bg-[#f6f8fb]" : ""}`}>
                <h.icon style={{ width: 14, height: 14, color: h.tint }} className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-[#0f172a]">{t(h)}</p>
                  <p className="truncate text-[11px] text-[#94a3b8]">{h.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Le fil */}
        <div className="flex min-w-0 flex-1 flex-col px-7 py-4">
          <div className="rounded-2xl ring-1 ring-[#eef1f5]">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 text-[13px] text-[#94a3b8]">
                {t({ fr: "Cochez une ou plusieurs balances", en: "Tick one or more balances" })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bfd7fb] px-4 py-1.5 text-[13px] font-semibold text-white">
                <Play className="h-3.5 w-3.5" />
                {t({ fr: "Lancer", en: "Run" })}
              </span>
            </div>
            <div className="flex items-start gap-2.5 border-t border-[#f1f5f9] px-4 py-2.5">
              <Play className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
              <div>
                <p className="text-[13px] font-semibold text-[#0f172a]">{t({ fr: "Comparatif N contre N-1", en: "Year-on-year comparison" })}</p>
                <p className="text-[11.5px] text-[#94a3b8]">
                  {t({ fr: "demande le FEC de l'exercice précédent, et emporte les balances cochées", en: "asks for last year's ledger, and carries the ticked balances" })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t border-[#f1f5f9] px-4 py-2.5">
              <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
              <div>
                <p className="text-[13px] font-semibold text-[#0f172a]">{t({ fr: "Composer tout le classeur", en: "Compose the whole workbook" })}</p>
                <p className="text-[11.5px] text-[#94a3b8]">
                  {t({ fr: "contrôles, sélections d'audit, analyses : le module s'ouvre avec ses cases", en: "checks, audit selections, analyses: the module opens with its boxes" })}
                </p>
              </div>
            </div>
          </div>

          {/* La carte de run, terminée */}
          <div className="mt-5 flex gap-3">
            <OraStar className="mt-3 h-4 w-4 shrink-0 text-[#3b82f6]" />
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl ring-1 ring-[#eef1f5]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#effaf1]">
                    <Scale className="h-[17px] w-[17px] text-[#16a34a]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0f172a]">FEC Studio · {t({ fr: "Balance générale", en: "General balance" })}</p>
                    <p className="text-[12px] text-[#94a3b8]">{t({ fr: "Terminé", en: "Done" })}</p>
                  </div>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10b981]">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 border-t border-[#f1f5f9] px-4 py-2.5 text-[12px] text-[#64748b]">
                  <ChevronDown className="h-3.5 w-3.5" />
                  {t({ fr: "Le journal du moteur (6 lignes)", en: "The engine log (6 lines)" })}
                </div>
              </div>

              <p className="mt-4 text-[15px] leading-[1.5] text-[#0f172a]">
                {t({
                  fr: "Voici le résultat. FEC Studio : 230 écritures (01/01/2025 → 31/12/2025), 1 feuille générée. Débit et crédit équilibrés.",
                  en: "Here is the result. FEC Studio: 230 entries (01/01/2025 → 31/12/2025), 1 sheet generated. Debit and credit balanced.",
                })}
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {stats.map(([l, v]) => (
                  <span key={l} className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] text-[#475569] ring-1 ring-[#eef1f5]">
                    {l} <b className="font-semibold text-[#0f172a]">{v}</b>
                    <Info className="h-3 w-3 text-[#cbd5e1]" />
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-[#0f172a] ring-1 ring-[#e8edf3]">
                  <FileSpreadsheet className="h-4 w-4 text-[#16a34a]" />
                  {t({ fr: "Ouvrir le classeur", en: "Open the workbook" })}
                </span>
                <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#64748b]">
                  <Columns2 className="h-4 w-4" />
                  {t({ fr: "Éditer côte à côte", en: "Edit side by side" })}
                </span>
                <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#64748b]">
                  <Plus className="h-4 w-4" />
                  {t({ fr: "Composer d'autres balances", en: "Compose other balances" })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <PromptBar
              placeholder={t({
                fr: "Demandez : « qu'est-ce qui mérite d'être surveillé l'an prochain ? »",
                en: "Ask: “what is worth watching next year?”",
              })}
            />
            <p className="mt-2 text-center text-[11.5px] text-[#94a3b8]">
              {t({
                fr: "Chiffres du moteur, anonymisés avant l'envoi ; à relire par le cabinet.",
                en: "Engine figures, anonymized before sending; to be reviewed by the firm.",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ 4 bis. LE JOURNAL DU MOTEUR, en terminal sombre ═══════════════════════
   Le terminal noir d'attio (« Find yesterday's demo call… », « Ran 3
   commands »), transposé : chez nous c'est le journal que la carte de run
   replie sous « Le journal du moteur (6 lignes) ». Les six lignes sont
   reconstituées à partir des chiffres de la capture réelle, rien d'autre :
   230 écritures, 24 comptes, 01/01 → 31/12/2025, débit = crédit, 16,9 %
   d'opérations diverses, 2 568 604 € de total débit, une feuille générée. */
function JournalWindow() {
  const { t } = useLang();
  const lines: [string, string][] = [
    [t({ fr: "fichier lu", en: "file read" }), "FEC 2025 Negoce du Port (xlsx).xlsx"],
    [t({ fr: "écritures", en: "entries" }), t({ fr: "230 · 24 comptes · 01/01 → 31/12/2025", en: "230 · 24 accounts · 01/01 → 31/12/2025" })],
    [t({ fr: "équilibre", en: "balance" }), t({ fr: "débit = crédit · 2 568 604 €", en: "debit = credit · 2 568 604 €" })],
    [t({ fr: "opérations diverses", en: "misc. entries" }), "16,9 %"],
    [t({ fr: "balance générale", en: "general balance" }), t({ fr: "composée · 1 feuille", en: "composed · 1 sheet" })],
    [t({ fr: "classeur écrit", en: "workbook written" }), "Negoce du Port_studio.xlsx"],
  ];
  return (
    <Win title={t({ fr: "Journal du moteur", en: "Engine log" })} dark>
      <div className="ohs-mono flex h-full flex-col px-4 pb-3.5 pt-3 text-[11.5px] leading-[1.75] text-[#c9cdd3]">
        <p className="text-white">
          <span className="text-[#8ab4ff]">&gt;</span> fec-studio · {t({ fr: "balance générale", en: "general balance" })}
        </p>
        <p className="mt-1.5 text-[#8b919a]">
          {t({ fr: "6 étapes", en: "6 steps" })}
        </p>
        {lines.map(([k, v]) => (
          <p key={k} className="flex gap-2">
            <span className="shrink-0 text-[#5fd39a]">✓</span>
            <span className="min-w-0">
              <span className="text-[#8b919a]">{k} </span>
              <span className="text-white">{v}</span>
            </span>
          </p>
        ))}
        <p className="mt-auto flex items-center gap-2 border-t border-white/[0.08] pt-2.5 text-[#8b919a]">
          <span className="text-[#8ab4ff]">&gt;</span>
          <span className="h-[13px] w-[7px] bg-[#c9cdd3]/70" />
        </p>
        <p className="mt-1 text-[10.5px] text-[#6b7280]">
          {t({ fr: "terminé · moteur déterministe · sur votre poste", en: "done · deterministic engine · on your machine" })}
        </p>
      </div>
    </Win>
  );
}

/* ══ 5. LE MENU DU « + » ═══════════════════════════════════════════════════ */
const SUGGESTIONS = [
  { icon: Percent, tint: "#0284c7", bg: "#eef7fe", fr: "Calcule la TVA", en: "Work out the VAT" },
  { icon: Landmark, tint: "#d97706", bg: "#fef6e7", fr: "Quel impôt sur les sociétés ?", en: "What corporate tax?" },
  { icon: Scale, tint: "#16a34a", bg: "#effaf1", fr: "Fais la balance", en: "Build the balance" },
  { icon: ShieldAlert, tint: "#ea580c", bg: "#fef2e8", fr: "Y a-t-il des anomalies ?", en: "Any anomalies?" },
  { icon: Palette, tint: "#7c3aed", bg: "#f4efff", fr: "Éditer le document", en: "Edit the document" },
  { icon: TrendingUp, tint: "#7c3aed", bg: "#f4efff", fr: "Explique la formation du résultat", en: "Explain how the result formed" },
  { icon: HelpCircle, tint: "#e11d48", bg: "#fdeff2", fr: "Quelles questions poser au client ?", en: "What to ask the client?" },
  { icon: Search, tint: "#0284c7", bg: "#eef7fe", fr: "Que surveiller l'an prochain ?", en: "What to watch next year?" },
];

/** Le menu n'est pas une fenêtre : c'est le panneau flottant du bouton « + »,
 *  donc ni barre de titre ni pastilles. */
function MenuCard() {
  const { t } = useLang();
  return (
    <div className="flex h-full w-full flex-col justify-center overflow-hidden rounded-[18px] bg-white px-3 py-3 font-inter ring-1 ring-black/[0.06] shadow-[0_30px_80px_-24px_rgba(15,23,42,0.35)]">
      {SUGGESTIONS.map((s) => (
        <div key={s.fr} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: s.bg }}>
            <s.icon style={{ width: 15, height: 15, color: s.tint }} />
          </span>
          <p className="truncate text-[13px] font-medium text-[#0f172a]">{t({ fr: s.fr, en: s.en })}</p>
        </div>
      ))}
    </div>
  );
}

/* ══ Une fenêtre sur la scène, branchée sur la progression ═════════════════ */
/* Flottement au repos de chaque fenêtre : amplitude en px et période en s,
   toutes différentes pour qu'elles ne respirent pas à l'unisson. */
/* ⚠ PERIODES LONGUES, AMPLITUDES FAIBLES (client 2026-09-12 : « que les
   animations soient bien plus smooth »). Les valeurs precedentes bouclaient
   en 8 a 11 s avec jusqu'a 7 px d'amplitude : a cette cadence l'oeil suit le
   mouvement au lieu de le sentir, et un aller-retour visible se lit comme un
   tremblement, pas comme une respiration. Les periodes sont presque doublees
   et les amplitudes reduites d'un tiers : le deplacement devient trop lent
   pour etre suivi, ce qui est exactement le but. Les quatre restent premieres
   entre elles pour que les fenetres ne repassent jamais ensemble au meme
   point. */
const DRIFT: Record<WinId, { dx: number; dy: number; dur: number }> = {
  app: { dx: 0, dy: 4, dur: 19 },
  agent: { dx: 3, dy: -5, dur: 15 },
  journal: { dx: -2.5, dy: 4, dur: 17 },
  menu: { dx: 2.5, dy: -3.5, dur: 21 },
};

/* Trois couches, parce que trois mécaniques écrivent chacune un transform et
   ne peuvent pas partager le même élément :
   · l'EXTÉRIEURE porte le défilement (x, y, échelle, opacité liés à p) ;
   · la MÉDIANE porte le flottement, une boucle lente qui reprend attio
     (client 2026-09-11 : « que les encadrés soient mouvants ») ;
   · l'INTÉRIEURE porte le glisser-déposer (client, même demande : « qu'on
     puisse par notre curseur les faire bouger »). Son décalage lui reste
     propre, donc une fenêtre déplacée à la main garde son écart quand le
     défilement continue de piloter la couche extérieure.
   Chez attio les fenêtres portent touch-none select-none : elles se traînent
   aussi. Pas d'inertie au lâcher : un panneau qui glisse tout seul après le
   geste se lit comme une erreur, pas comme un objet. */
function StageWindow({ id, p, still, children }: { id: WinId; p: MotionValue<number>; still: boolean; children: ReactNode }) {
  const a = HOME[id];
  const b = ACTION[id];
  const size = SIZE[id];
  const d = DRIFT[id];
  const x = useTransform(p, [0, 1], [a.x, b.x]);
  const y = useTransform(p, [0, 1], [a.y, b.y]);
  const scale = useTransform(p, [0, 1], [a.scale, b.scale]);
  const opacity = useTransform(p, REVEAL[id][0] === 0 ? [0, 1] : REVEAL[id], [a.opacity, b.opacity]);
  return (
    <motion.div
      className="absolute left-0 top-0"
      /* ⚠ `willChange: transform` EST CE QUI REND LE GESTE FLUIDE, et ce n'est
         pas une précaution de style : la fenêtre principale fait 1180 x 820 de
         DOM dense (barre latérale, grille de modules, fil de conversation) et
         son échelle change à chaque image. Sans couche composée, le navigateur
         re-peint tout cet arbre image par image, ce qui est exactement le
         « ça accroche » que le client a signalé. Promue, la texture est
         étirée pendant le geste et re-rastérisée au repos : la netteté à
         l'arrêt est inchangée. Même correctif que sur l'ancien hero, voir le
         pavé de .hd-stage dans OraHeroDemo. */
      style={{ width: size.w, height: size.h, x, y, scale, opacity, zIndex: Z[id], transformOrigin: "top left", willChange: "transform" }}
    >
      <div
        className={`ohs-drift${still ? " is-still" : ""}`}
        /* `still` (hors champ, mouvement reduit) met la boucle en pause au lieu
           de la detruire : la reprise repart d'ou elle etait, sans saut. */
        style={{ "--dx": `${d.dx}px`, "--dy": `${d.dy}px`, "--dur": `${d.dur}s` } as CSSProperties}
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.06}
          whileDrag={{ scale: 1.015 }}
          className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}

/** La fenêtre du logiciel : l'accueil se change en conversation.
 *
 *  ⚠ LE CHANGEMENT EST UNE COUPE FRANCHE, PAS UN FONDU CROISÉ, et c'est le
 *  correctif le plus important de ce fichier. Les deux écrans sont denses ;
 *  montés ensemble à mi-opacité, leurs deux salutations, leurs deux grilles et
 *  leurs deux barres de saisie se superposaient en une bouillie parfaitement
 *  illisible au milieu du geste. Un fondu séquentiel aurait laissé un éclair
 *  blanc à la place. La coupe, elle, se fait pendant que la fenêtre rétrécit
 *  et se déplace : le mouvement la masque, et on lit « le logiciel a changé
 *  de page », ce qui est exactement le propos. */
/*  ⚠ LES DEUX ÉCRANS RESTENT MONTÉS, on bascule leur VISIBILITÉ. Les monter
 *  l'un à la place de l'autre démontait puis remontait plusieurs centaines de
 *  noeuds au beau milieu du défilement : le hoquet tombait pile au moment de
 *  la bascule et se lisait comme un bug de scroll. `visibility` ne coûte ni
 *  disposition ni peinture, la coupe reste franche, et l'opacité à 0 garantit
 *  qu'aucune des deux ne transparaît à travers l'autre. */
/* ⚠ LA BASCULE D'ECRAN EST ISOLEE ICI, ET C'EST LE CORRECTIF PRINCIPAL DE LA
   PASSE DU 2026-09-12 (« ca beug legerement quand on scrolle vers le bas »).
   La mesure a la molette, a travers Lenis, montrait des images plates a
   16,7 ms MAIS des taches longues de 57 a 208 ms pendant la descente. Cause :
   `setPhase` vivait dans le composant racine, donc au franchissement de
   SWAP_AT React re-rendait TOUT le hero, les quatre maquettes denses et leurs
   centaines de `t()`, en une seule tache, pile au milieu du geste. L'etat vit
   maintenant dans ce seul composant : au franchissement, seules deux
   propriétés de style changent. Les maquettes sont en plus memoisees. */
function useAction(p: MotionValue<number>, reduced: boolean) {
  const [on, setOn] = useState(reduced);
  useMotionValueEvent(p, "change", (v) => setOn(reduced || v >= SWAP_AT));
  return reduced || on;
}

const MemoAccueil = memo(ScreenAccueil);
const MemoBalance = memo(ScreenBalance);
const MemoAgent = memo(ScreenAgent);
const MemoJournal = memo(JournalWindow);
const MemoMenu = memo(MenuCard);

function PhaseIndicator({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const { t } = useLang();
  const action = useAction(p, reduced);
  const labels = [
    { fr: "L'accueil", en: "Home" },
    { fr: "En action", en: "In action" },
  ];
  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      {labels.map((l, k) => (
        <span
          key={l.fr}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-inter text-[13px] font-medium transition-colors duration-300 ${
            k === (action ? 1 : 0) ? "bg-white text-[#111827] ring-1 ring-black/[0.08]" : "text-[#6b7688]"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${k === (action ? 1 : 0) ? "bg-[#3b82f6]" : "bg-[#c9d1de]"}`} />
          {t(l)}
        </span>
      ))}
    </div>
  );
}

function AppWindow({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const action = useAction(p, reduced);
  return (
    <Win title="Ora">
      <div className="absolute inset-0" style={{ visibility: action ? "hidden" : "visible", opacity: action ? 0 : 1 }}>
        <MemoAccueil />
      </div>
      <div className="absolute inset-0" style={{ visibility: action ? "visible" : "hidden", opacity: action ? 1 : 0 }}>
        <MemoBalance />
      </div>
    </Win>
  );
}

/* ══ Le composant ══════════════════════════════════════════════════════════ */
export default function OraHeroScenes({ openBooking }: OraHeroScenesProps) {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { ref: fitRef, scale } = useFit(STAGE_W);
  const [inView, setInView] = useState(true);

  /* Le flottement s'arrête dès que le hero quitte l'écran : sans cela quatre
     boucles infinies tournent encore pendant qu'on lit la FAQ. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  /* `p` est LA valeur du bloc : 0 l'accueil, 1 la scène dépliée. Sous
     prefers-reduced-motion on la fige à 1, la scène la plus complète. */
  /* ⚠ LIAISON DIRECTE, SANS RESSORT (client 2026-09-12 : « pas smooth comme
     sur attio quand on scrolle au debut »). J'avais mis un useSpring entre la
     molette et la scene le 2026-09-11. Erreur de diagnostic : Lenis lisse
     DEJA la position de defilement (lerp 0,18 dans App.tsx). Un ressort
     par-dessus ne lissait pas davantage, il ajoutait une traine : au premier
     coup de molette la scene demarrait avec du retard puis rattrapait, et
     c'est exactement la sensation de « pas smooth au debut ». Attio n'a rien
     entre la page et ses fenetres. Nous non plus, desormais.
     Trois reglages vont ensemble pour retrouver leur toucher :
       MORPH_IN   0     plus de zone morte : la scene bouge des le 1er pixel,
                        alors qu'a 0,05 les 36 premiers px ne faisaient rien
                        sur un bloc entierement epingle, d'ou le « ca colle » ;
       MORPH_OUT  0,56  le morphing tient sur ~400 px de molette ;
       montee     42 vh soit ~400 px : la scene MONTE D'AUTANT QUE LA PAGE
                        DEFILE, 1 pour 1, comme si elle etait en flux normal.
                        C'est ce ratio, pas la vitesse, qui fait « naturel ». */
  const p = useTransform(scrollYProgress, [MORPH_IN, MORPH_OUT], [0, 1], { clamp: true });
  const frozen = useTransform(scrollYProgress, () => 1);
  const progress = reduced ? frozen : p;
  /* ══ LE FOND, AUX VALEURS EXACTES D'ATTIO ═══════════════════════════════
     Client 2026-09-11 : « copie exactement le background d'attio, bien moins
     agressif et bien plus minimaliste ». Relevé sur leur page à 1440 de
     large, à deux hauteurs de défilement :
       cuvette   opacité 0,40 à l'arrêt, 0,70 à 700 px
       rayage    opacité 0,40, constante
       voile     matrix(1, 1) à l'arrêt, matrix(0.571429, 0.75) à 700 px
     DEUX AXES pour le voile, pas seulement la hauteur : la calotte blanche se
     resserre aussi horizontalement, ce qui découvre le bleu par les côtés
     avant de le découvrir par le bas. C'est ce qui donne leur impression
     d'ouverture.
     Le peu de bleu en haut de page n'est donc pas réglé par une opacité de
     motif comme je l'avais fait, mais par le voile à pleine taille : il
     couvre la calotte, le rayage disparaît avec elle, et tout se lève
     ensemble. Une correction de moins à porter. */
  const bowlOpacity = useTransform(progress, [0, 1], [0.4, 0.7]);
  const veilX = useTransform(progress, [0, 1], [1, 0.571]);
  const veilY = useTransform(progress, [0, 1], [1, 0.86]);

  /* ══ LE GESTE D'ATTIO, RELEVÉ SUR LEUR PAGE ════════════════════════════
     Client 2026-09-11 : « ce sont les éléments de design qui montent et les
     éléments de texte au-dessus qui s'effacent ». Vérifié en balayant leur
     défilement : à 300 px leur titre a DISPARU sur place, laissant une bande
     blanche, et les fenêtres occupent tout. Leur bloc de texte est en
     `position: sticky` sous la barre, et c'est son OPACITÉ qui tombe ; il ne
     défile pas, sinon on le verrait passer sous la barre.
     Ma version faisait l'inverse : le texte s'en allait en flux pendant que
     la scène restait épinglée. Texte et scène vivent maintenant dans le même
     bloc épinglé, le premier s'efface, la seconde monte prendre sa place.
     La montée est en `vh` et non en pixels : elle doit valoir la hauteur du
     bloc de texte, qui suit la taille de l'écran. Une valeur mesurée au
     ResizeObserver aurait marché aussi, mais `useTransform` fige ses bornes
     à la création : il aurait fallu la recréer à chaque mesure. */
  const textOpacityRaw = useTransform(progress, [0, 0.7], [1, 0]);
  const stageRiseRaw = useTransform(progress, [0, 1], ["0vh", "-42vh"]);
  const textOpacity = reduced ? 1 : textOpacityRaw;
  const stageRise = reduced ? "0vh" : stageRiseRaw;

  const ease = [0.22, 1, 0.36, 1] as const;

  /* ⚠ PAS DE `pt` SUR GRAND ECRAN, ET C'EST LA CORRECTION DU « CA COLLE AU
     DEBUT » (client 2026-09-12). useScroll ne compte qu'a partir du moment ou
     le HAUT DE LA PISTE atteint le haut de l'ecran. Avec pt-[68px] sur la
     section, la piste commencait 68 px plus bas : les 68 premiers pixels de
     molette ne faisaient strictement rien, sur un bloc entierement epingle.
     Mesure : montee 0 a 10 px et a 40 px de defilement, ratio 0,43 a 120 px.
     Sans pt, la piste part de 0, le bloc epingle (top 68) se cale de lui-meme
     sous la barre, et la scene bouge des le premier pixel a 1 pour 1.
     Le pt reste sur petit ecran, ou le bloc n'est pas epingle et passerait
     sous la barre fixe sans lui.
     Le `pb` de la section : de l'air entre la fin de la scene et le bloc
     suivant (client 2026-09-12). Le repere de phase tombait a 18 px du bord de
     section, les deux blocs se touchaient presque. Cette marge tombe DANS le
     degrade de raccord de 460 px, elle est donc blanche : c'est du vide, pas
     de la nappe en plus. A garder en phase avec le `pt` d'AutomationTabs, les
     deux forment un seul intervalle. */
  return (
    <section ref={sectionRef} className="relative bg-white pt-[68px] lg:pt-0 pb-20 md:pb-28">
      <style>{CSS}</style>

      {/* ══ LE FOND, COLLÉ AU VIEWPORT DÈS L'ARRIVÉE ═══════════════════════
          Client 2026-09-11 : « le background bleu doit être visible dès
          l'arrivée sur la landing page, même s'il doit être vers le bas de
          l'écran ». Il vivait dans le bloc épinglé de la scène, lequel
          commence 480 px sous le haut de page : sa cuvette, ancrée EN BAS de
          ce bloc, tombait donc vers 1350 px, très en dessous du pli. On
          n'arrivait que sur du blanc.
          Il est maintenant sur la section, dans un calque épinglé haut de
          l'écran : à l'arrivée comme pendant toute la scène, sa cuvette se
          termine exactement au bas du viewport, donc le bleu est là tout de
          suite, en bas, et il y reste.
          ⚠ DEUX PIÈGES DE POSITIONNEMENT, tous deux déjà payés :
          · l'enveloppe `absolute inset-0` NE DOIT PAS porter overflow-hidden,
            sinon elle devient le conteneur de défilement de l'épinglé et
            celui-ci ne bouge plus jamais ;
          · le rognage va donc sur l'ÉPINGLÉ lui-même, qui peut clipper ses
            propres enfants (le voile fait 400 % de large) sans rien changer à
            sa propre adhérence. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-[68px] h-[calc(100vh-68px)] overflow-hidden">
          <motion.div className="ohs-bowl absolute inset-0" style={{ opacity: bowlOpacity, willChange: "opacity" }} />
          <div className="ohs-ribs absolute inset-0" />
          <motion.div className="ohs-veil" style={{ scaleX: veilX, scaleY: veilY }} />
        </div>
        {/* Le raccord du bas, HARMONIEUX et non plus franc.
            J'avais pose un filet de 1 px pour trancher net entre le hero et la
            section suivante ; le client a tranche dans l'autre sens le
            2026-09-12 (« je veux un changement harmonieux entre ces deux
            parties »). Le filet est parti.
            Le degrade passe de 280 a 460 px et prend un point median a 70 %
            de blanc : sur une seule interpolation, la nappe tenait trop
            longtemps puis lachait d'un coup sur le dernier quart, ce qui
            redessinait la frontiere qu'on cherchait a effacer.
            Il est pose sur le BAS DE LA SECTION, pas sur le calque epingle -
            sur l'epingle il aurait suivi le bas de l'ecran et voile les
            fenetres pendant toute la scene. */}
        <div className="absolute inset-x-0 bottom-0 h-[460px] bg-gradient-to-b from-transparent via-white/70 to-white" />
      </div>

      {/* ⚠ MÊME GABARIT QUE LA SECTION SUIVANTE (client 2026-09-11 : « les
          zooms de la fin ne matchent pas avec la partie d'après, ça crée une
          délimitation qui n'a pas lieu d'être »). AutomationTabs compose dans
          `px-6 md:px-12` avec un cadre `max-w-[86rem]` à filets verticaux,
          soit 1344 px à 1440 d'écran. Ma scène tenait dans 1240 px : les
          fenêtres s'arrêtaient 52 px en deçà des filets du bloc suivant, et
          c'est ce décalage qu'on lisait comme une rupture. Les deux largeurs
          coïncident maintenant, les filets d'AutomationTabs prolongent le
          bord des fenêtres. Si l'un des deux gabarits change, changer
          l'autre. */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12">
        {/* La piste porte MAINTENANT le texte ET la scène : les deux vivent
            dans le même bloc épinglé, comme chez attio. */}
        <div ref={trackRef} className="ohs-track relative">
          <div className="ohs-pin">

            {/* willChange opacity : le h1 porte un degrade en background-clip:text ;
                sans couche propre, WebKit re-peint ce texte-masque a chaque
                variation d'opacite pendant les 280 px du fondu. */}
            <motion.div style={{ opacity: textOpacity, willChange: "opacity" }} className="mx-auto max-w-[56rem] pt-14 text-center md:pt-20">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 font-inter text-[13px] font-medium text-[#42506b] ring-1 ring-black/[0.08]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
              {t({ fr: "Sur votre poste, chiffré, hébergé en Europe", en: "On your machine, encrypted, hosted in Europe" })}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="mt-7 font-instrument text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[0.97] tracking-[-0.025em] text-[#111827] antialiased"
          >
            <span className="block">{t({ fr: "Plus de productivité,", en: "More productivity," })}</span>
            <span className="block text-brand-gradient">{t({ fr: "plus d'analyse, plus de conseil.", en: "more analysis, more advisory." })}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
            className="mx-auto mt-6 max-w-[34rem] font-inter text-[18px] font-medium leading-[1.3] text-[#5b6577]"
          >
            {t({
              fr: "Le logiciel qui reprend le répétitif comptable, pour rediriger votre temps vers le conseil.",
              en: "The software that takes over repetitive accounting work, so your time goes to advisory.",
            })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-inter text-[15px] font-semibold text-[#111827] ring-1 ring-black/10 transition-colors hover:bg-black/[0.03]"
            >
              {t({ fr: "Voir ce qu'Ora automatise", en: "See what Ora automates" })}
            </a>
            <button
              onClick={openBooking}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-6 py-3 font-inter text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-[#2563eb] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] active:translate-y-0"
            >
              {t(BOOKING_CTA)}
              <ArrowRight className="h-4 w-4 opacity-80 transition-transform duration-150 group-hover:translate-x-[3px]" />
            </button>
              </motion.div>
            </motion.div>

            {/* La scène monte de 38 vh pendant que le texte s'efface : elle
                part sous lui, en simple aperçu coupé par le bas de l'écran,
                et vient occuper la place qu'il libère. */}
            <motion.div style={{ y: stageRise }} className="relative z-10 mt-8 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease }}
              >
              {/* La scène est plus étroite que le conteneur (1240 sur 1376 à
                  1440) : c'est ce qui laisse de l'air entre les fenêtres et le
                  bas de la nappe bleue (client 2026-09-11 : « rajoute de la
                  marge en bas pour que les encadrés ne soient pas trop collés
                  avec la délimitation »). Le bloc épinglé fait la hauteur de
                  l'écran ; plus la scène est courte, plus il reste de nappe
                  sous elle. */}
              {/* ⚠ LE ROGNAGE VA JUSQU'AUX BORDS DE L'ÉCRAN, PAS AU BORD DE LA
                  SCÈNE (client 2026-09-11 : « quand je mets un élément sur le
                  côté, il y a des bandes verticales qui bloquent »). Le
                  rognage vivait sur la boîte de 1240 px : dès qu'on traînait
                  une fenêtre de quelques dizaines de pixels sur le côté, elle
                  se faisait trancher par une frontière invisible, à 68 px du
                  bord visible. Une limite qu'on ne voit pas et qui coupe, ça
                  se lit comme un défaut, pas comme un cadre.
                  Le rognage est donc remonté sur une enveloppe pleine largeur :
                  la seule limite est maintenant le bord de l'écran, qui est
                  une limite naturelle. La boîte intérieure garde ses 1240 px,
                  qui commandent l'échelle et l'air sous les fenêtres. */}
              {/* ⚠ PLUS DE mask-image ICI (2026-09-12). Le masque en degrade
                  posait la dissolution de l'ombre, mais sous WebKit un masque
                  sur un conteneur dont les enfants BOUGENT force le groupe
                  entier a etre re-rasterise a chaque image, et ici tout bouge
                  tout le temps (flottement, montee, morphing). On obtient la
                  meme chose sans cout : le rognage garde les cotes, et 64 px
                  de marge basse laissent a l'ombre portee toute sa place au
                  lieu de la sectionner. A l'arrivee, c'est le bas de l'ecran
                  qui coupe la fenetre, pas cette boite. */}
              <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden pb-16">
              <div ref={fitRef} className="relative mx-auto w-full max-w-[86rem]" style={{ height: STAGE_H * scale }}>
                <div
                  className="absolute left-0 top-0"
                  style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
                >
                  <StageWindow id="menu" p={progress} still={!!reduced || !inView}>
                    <MemoMenu />
                  </StageWindow>
                  <StageWindow id="app" p={progress} still={!!reduced || !inView}>
                    <AppWindow p={progress} reduced={!!reduced} />
                  </StageWindow>
                  <StageWindow id="agent" p={progress} still={!!reduced || !inView}>
                    <MemoAgent />
                  </StageWindow>
                  <StageWindow id="journal" p={progress} still={!!reduced || !inView}>
                    <MemoJournal />
                  </StageWindow>
                </div>
              </div>
              </div>

              {/* Le repère de phase. Il n'est pas cliquable : c'est le
                  défilement qui commande, deux commandes pour une même
                  position se battraient. */}
              <PhaseIndicator p={progress} reduced={!!reduced} />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Petit écran : l'accueil seul, sans la mécanique de défilement ── */}
        <div className="mt-10 pb-12 lg:hidden">
          <div className="overflow-hidden rounded-[14px] bg-white ring-1 ring-black/[0.08] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
            <TitleBar title="Ora" />
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="absolute left-0 top-0 origin-top-left" style={{ width: 1180, transform: "scale(0.34)" }}>
                <div style={{ height: 820 }}>
                  <ScreenAccueil />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
