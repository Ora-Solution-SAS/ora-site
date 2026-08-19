# CLAUDE.md

## Project Goals

**Current Milestones:** This project is a website to sell an Excel workflows automation app running on Python called `Ora`

**Website scope:**
- Homepage welcoming the client, presenting the service
- Solutions page presenting the product in more details
- Pricing page to know a bit more about the product
- The main objective of this website is to push the viewer to book a call to discover the product : it must contain a book a call window

---

## Running the App

**Tech stack:** React 19 + TypeScript, Vite 7, Tailwind CSS 3, Framer Motion 12, Three.js, Lenis (smooth scroll), Lucide React, @calcom/embed-react

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |

> `dev` lance Vite via `node --max-http-header-size=65536` au lieu du binaire
> `vite` nu. C'est un correctif, pas une préférence : le navigateur accumule les
> cookies de TOUS les projets servis sur `localhost`, et une fois l'en-tête
> au-delà des 16 Ko admis par défaut par Node, le serveur répond **431 Request
> Header Fields Too Large** sur chaque module. La page part alors en dizaines
> d'erreurs au lieu de se charger (constaté le 2026-08-12 sous Safari). Ne pas
> revenir à `"dev": "vite"`. Si le problème réapparaît malgré ce flag, vider les
> cookies `localhost` dans le navigateur.

---

## Design Style Guide

**Visual style:**
- Clean, minimal and modern interface
- Intuitive and clean UI following modern tech SaaS design standards

**Typography — THREE display faces, and each has a territory.** The style guide
long claimed Poppins everywhere; the code says otherwise, and this section was
rewritten on 2026-08-15 to match what is actually shipped.

| Face | Where it is used | Tailwind |
|---|---|---|
| **Instrument Sans** | Every large display heading: hero, section h2, panel leads, the booking window. Weight 400, tight tracking. | `font-instrument` |
| **Inter** | All body copy, UI labels, buttons, card titles in the bento grid. | `font-inter` |
| **Poppins** | Legacy headings not yet migrated (FAQ, some mockup titles) and the mockup chrome. **Do not add new ones.** | `font-poppins` |
| **Figtree** | The navigation bar only. | `font-figtree` |

- Always set the face explicitly on the element. The global CSS sets a default
  on heading tags, but Tailwind utility ordering makes that unreliable.
- **Never `font-light` (300) on a heading.** It is not in the brand spec.
- CTAs and buttons: `font-inter font-semibold`.
- Instrument Sans has **no weight below 400** — measured, `font-light` on it is
  dead code, the browser never synthesises a lighter face. To thin it, the only
  lever is `-webkit-font-smoothing: antialiased`, and it is WebKit-only.

**Writing style — em dashes (`—`) are forbidden in UI copy.**
- Never use `—` in visible text (labels, descriptions, subtitles, CTAs, body copy).
- Replace with: a period, a comma, a colon, or restructure the sentence.
- The only tolerated exception is inside code comments, never in rendered content.

**Color palette:**

| Name | Hex | Usage |
|---|---|---|
| Blue | `#3b82f6` | THE accent. Every primary CTA, every active state, every marker. |
| Blue hover | `#2563eb` | The hover of every filled CTA. One value, no exceptions. |
| Teal | `#0d9488` | Gradient end only. Never a flat fill. |
| Dark background | `#111827` | Dark mode, primary section bg |
| Dark background alt | `#0f172a` | Dark mode, alternate section bg |
| Light background | `#fcfbf7` | Light mode, primary section bg (warm off-white) |
| Light background alt | `#ffffff` | Light mode, alternate section bg |
| Ink strong | `#42506b` | Body copy on light |
| Ink muted | `#5b6577` | Secondary copy on light |
| Ink faint | `#6b7688` | Eyebrows, captions, de-emphasised halves of two-ink headings |

> **One blue, and one hover.** The site carried four blues for the same role
> (`#3b82f6`, `#0a66f5`, `#6161FF` in the persistent navigation, `#2563eb`) and
> three different hovers off the same base. They were unified on 2026-08-15.
> Adding a new blue is a regression, not a decision.

> **Nothing below `#6b7688` on a light background.** The greys that preceded it
> (`#c4cad6`, `#9aa4b5`, `#9aa3b2`) measured between 1.6:1 and 2.5:1 — the
> tabbed section's own navigation was effectively invisible. If a text needs to
> recede further than `#6b7688`, make it smaller or shorter, not paler.

Brand gradient: `linear-gradient(to right, #3b82f6, #0d9488)`

**Section background alternation rule — it is a rule, and it was not applied.**
Until 2026-08-15 `#fcfbf7` appeared nowhere: the homepage ran seven consecutive
light sections in pure white. Alternate strictly, section by section.

**Section background alternation rule:**
Pages alternate between two backgrounds to create visual rhythm. Use these exact values — never use other dark shades (e.g. `#020617`, `#0a0a0a`) for section backgrounds.

| Mode | Section A (primary) | Section B (contrast) |
|---|---|---|
| Light | `#fcfbf7` | `#ffffff` |
| Dark | `#111827` | `#0f172a` |

In JSX: `bg = dk ? "#111827" : "#fcfbf7"` and `bgContrast = dk ? "#0f172a" : "#ffffff"`

> `tailwind.config.cjs` carries all of the above as tokens (`brand-blue`,
> `brand-blue-hover`, `bg-light`, `bg-dark-alt`, `ink-strong`, `ink-muted`,
> `ink-faint`). Prefer the token over the raw hex in new code.

**Logo assets** — all files in `public/logos/`:

| File | Description | Use when |
|---|---|---|
| `logo-dark.png` | Full logo — dark navy, transparent/white bg | Light mode |
| `logo-white.png` | Full logo — white/cream | Dark mode |
| `logo-color-light.png` | Full logo — blue-teal gradient icon + dark text | Light mode, colored sections |
| `logo-color-dark.png` | Full logo — blue-teal gradient icon + ghosted text | Dark mode hero sections |
| `icon-dark.png` | Icon only — dark navy, no text | Favicon, compact nav, mobile |
| `icon-light.png` | Icon only — white/cream, no text | Favicon, compact nav, mobile |
| `icon-color.png` | Icon only — blue-teal gradient icon, no text | Favicon, compact nav, mobile |

**Theming — LE SITE EST VERROUILLÉ EN CLAIR (2026-08-18).**

Le site ne bascule plus jour/nuit. Demande du client : « enlève la possibilité
de passer le site en nuit jour ». Trois choses ont disparu ensemble, et il faut
les rétablir ensemble si la bascule revient un jour :

| Où | Ce qui a été retiré |
|---|---|
| `index.html` | Le script d'amorçage lisait `localStorage` puis `prefers-color-scheme`. Il pose maintenant `.light`, point. |
| `App.tsx` | `theme` n'est plus un `useState` mais la constante `"light" as "light" \| "dark"`. Les deux `useEffect` de thème (pose de classe, écoute du système) sont partis. |
| `Navigation.tsx`, `DownloadPage.tsx` | Le bouton soleil/lune et la prop `onToggleTheme`. |

- Tailwind reste en `darkMode: "class"`, et `<html>` porte toujours `.light`.
- **Les classes `dark:` restent partout dans le JSX, à dessein.** Elles ne
  coûtent rien tant que `.dark` n'est jamais posée, et les retirer toucherait
  des centaines de lignes pour zéro effet visible. Ne pas lancer ce nettoyage.
- **Ne pas annoter `const theme: "light" | "dark" = "light"`.** Sur un `const`
  initialisé par un littéral, TypeScript rétrécit quand même au littéral et
  chaque `theme === "dark"` du fichier devient une erreur « comparaison
  impossible ». L'assertion `as` est ce qui garde l'union.
- La clé localStorage `"ora-theme-v2"` n'est plus ni lue ni écrite. La clé
  `"theme"` (ancienne) ne doit toujours jamais être relue.
- Logo : `logo-color-dark.png` (le variant clair ne sert plus que sur les
  sections sombres, via la détection `overDark` de la barre).

**Languages:**
- UI-facing strings: **French** (labels, buttons, dialogs, log messages) with an **English** version
- Code, comments, variable names, function names: **English**

**Log message format:**
- `✓ Success message` — success
- `✗ Error message` — error
- `⚠ Warning message` — warning

---

## Platform Compatibility

**Target:** macOS and Windows (both required)

**Rule:** Any new system-level integration must include a Windows fallback. Never add macOS-only code without a platform check.

---

## Pages

**Page routing:**
- The app uses a simple state-based router in `App.tsx` — no React Router. Pages are managed via `const [page, setPage] = useState<Page>("home")`.
- The `Page` type lives in `App.tsx`: `type Page = "home" | "for-business" | "not-found" | ...`
- **Default rule: any new page that has no design or implementation yet MUST redirect to the `"not-found"` page (404).** In `Navigation.tsx`, link it via `onNavigate("not-found")`. Only replace this once the real page is built.
- The 404 page lives at `src/pages/NotFoundPage.tsx`. It features an animated Ora logo (bars wind into a spinning ring, then return) and a "Retour à l'accueil" button.
- To add a real page: (1) add its key to the `Page` type in `App.tsx`, (2) create `src/pages/YourPage.tsx`, (3) add a render branch in the page conditional in `App.tsx`, (4) update the nav link from `"not-found"` to the new page key.

**Footer:**
- The footer (`src/components/Footer.tsx` → `src/components/ui/footer.tsx`) is rendered **outside** the page conditional in `App.tsx` — it appears on **all pages** by default.
- It receives `onNavigate`, `onBookCall`, and `theme` props from `App.tsx`.

---

## Products and UX Guidelines

**Core UX principles:**
- Intuitive design
- Make it easy to use and push the viewer to book a call

**Key conventions:**
- Animations use Framer Motion; Three.js is reserved for the galaxy/hero background
- Smooth scroll is handled globally by Lenis — don't add competing scroll logic
- Components are `.tsx`, co-located global styles go in `src/index.css` as Tailwind utilities

**Animated multi-line headings (Framer Motion + AnimatePresence):**

To animate a rotating word/phrase on a second line, centered relative to the first line, use two stacked `block` spans inside a `text-center` h1. Do NOT use `inline-grid` with invisible spacers — it creates a box sized to the widest phrase that breaks alignment with sibling lines.

```tsx
<h1 className="... text-center">
  <span className="block">Ligne fixe</span>
  <span className="block relative pb-3" style={{ clipPath: "inset(0 -9999px)" }}>
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        className="inline-block text-brand-gradient whitespace-nowrap"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {phrases[index]}
      </motion.span>
    </AnimatePresence>
  </span>
</h1>
```

- `inline-block` (pas `block`) sur la `motion.span` — **critique** : avec `block`, l'élément prend la largeur du conteneur, pas la largeur du texte. Combiné à `background-clip: text` (utilisé par `.text-brand-gradient`), les caractères qui débordent à droite sont **transparents** (text-fill-color: transparent, sans fond derrière eux) et semblent coupés. `inline-block` dimensionne l'élément au texte exact → dégradé appliqué sur toute la phrase.
- `clipPath: "inset(0 -9999px)"` sur le conteneur (à la place de `overflow-hidden`) — clippe uniquement en vertical (masque le `y: ±40` de l'animation) sans clipper horizontalement, ce qui permettrait à un texte long de déborder dans le conteneur parent `overflow-hidden`.
- `whitespace-nowrap` empêche le retour à la ligne sur les phrases longues.
- `mode="wait"` garantit que l'exit se termine avant l'enter (pas de chevauchement).

---

## Repository Etiquette

**Branching:**
- Always create a feature branch before starting major changes
- NEVER commit directly to main
- Branch naming: `feature/description` or `fix/description`

**Git workflow and major changes:**
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Develop and commit on the feature branch
3. Test locally before pushing
4. Push the branch: `git push -u origin feature/your-feature-name`
5. Create a PR to merge into `main`
6. Use the `/update-docs-and-commit` slash command for commits — this ensures docs are updated alongside code changes

**Commits:**
- Write clear commit messages describing the changes
- Keep commits focused on a single change

**Pull requests:**
- Create PRs for all changes to `main`
- NEVER force push to `main`
- Include description of what changed and why

---

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

---

## Documentation

- [Changelog](CHANGELOG.md) — Version history
- [Inspirations](public/inspirations/) — Website design references / screenshots
- Update docs after major milestones and feature additions

---

## Known gaps (audit of 2026-08-15)

Recorded so they are not rediscovered from scratch. Everything else in that
audit was fixed the same day.

**Blocking, needs the client:**
- **No proof.** Not one customer name, logo, testimonial or case study on the
  whole site. Every name on screen (Nexio, Almadis, Ravel) and every figure is
  demo data. The site asks a finance director for 30 minutes with nothing a
  third party can verify. This is the single biggest conversion gap.
- **No price anchor.** The only mention is "abonnement annuel et
  accompagnement" in the FAQ: no range, no unit, no floor. `/pricing` is in
  `HIDDEN_PAGES` and 404s, while the FAQ points at a quote.
- **`public/demo-automatisation.mp4` is untracked** (9.5 MB, referenced by
  `AutomationTabs.tsx:97`). The "Bilan développé" panel is **empty in
  production** until it is committed.
- **`public/ora_pdf_extract_v3.mp4` is 889 MB**, untracked and referenced
  nowhere; it is what makes `public/` weigh 1 GB. ~40 MB of *tracked* mp4s are
  also unreferenced.

**Known and deliberate, for now:**
- **The ICP split is not honoured in the copy.** The site addresses accounting
  firms structurally, not just lexically: "le FEC légal **de vos clients**",
  "le bilan **de votre client**", "la synthèse **de mission**". A controlling
  team has none of those. `AutomationTabs.tsx:311` already documents the fix
  for the headline; it was never applied anywhere else.
- **Two CTAs compete.** The hero's first button ("Commencer") leaves for an
  external self-serve demo, while the stated objective is booking a call.
  Five booking triggers, two self-serve paths, no hierarchy between them.
- **~300 hard-coded French strings** in the mockups (`AtlasMockups.tsx`,
  the hero wall, `OraHomeMockup`). An English visitor watches a French demo
  for two screens.
- **Per-page social previews need pre-rendering.** `PAGE_META` in `App.tsx`
  sets title/description/canonical per route, and Google runs the JS. LinkedIn,
  Slack and iMessage do not: they all read `index.html`. Fixing it means SSG.
- **The Cal.com iframe has no `title`** and its loading overlay has no
  `role="status"`.
