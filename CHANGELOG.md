# Changelog

All notable changes to the Ora website are documented here.
Format: `[version] YYYY-MM-DD — description`

---

## [Unreleased]

### Changed
- **"Automatisez de bout en bout": two cards instead of three.** The "Local & sécurisé / Vos données restent chez vous" card is removed at the client's request. The promise is not lost: it is already carried by the Confidentialité section, by "Contrôle total" and its "Traitement en local" tile, and by the "Traitement 100 % local" check on every use-case sheet — this was its fourth restatement. `LocalSecurityMockup` stays in the repo and the `"local"` visual keeps its render branch, so restoring the card is one array entry.
- **Card visuals become monday-style table panels** (`AppTablePanel`). "Des chiffres exacts" first got a full 1:1 replica of the app's "Bilan développé et SIG" screen — window chrome, sidebar, top bar, coach rail — which the client rejected as "trop d'informations, ça fait pas beau", pointing at monday.com: they reuse *elements* of their software, never a whole screen. The panel is now one floating table: title, tabs, rows grouped under a coloured label with a matching left rule, full-bleed solid status cells as the only source of strong colour, a deliberately ghosted second group for depth, and the activity pill plus cursor laid over the edges. Figures and labels are taken from the app capture and from the card's own demo copy, none invented. The "Conçu pour votre métier" card runs the same panel in black (a trial); `SurMesureMockup` and `DownloadShowcase` both stay in the repo, the latter still the hero of the download page.
- **Card greys anchored on the client's swatch.** Three passes: the original `#fafafb → #eeeef1` read as barely-tinted white, then a correction overshot to `#f1f2f4 → #dfe1e5` ("trop foncé"). The swatch (~`#f1f2f4`) is now the *median* stop rather than an extreme, so the card averages on target. Putting a target colour at one end of a gradient shifts the whole surface off it — the eye reads the average, not the first stop.
- **Card type set in Figtree**, monday.com's actual brand face, loaded for these three cards only. Two earlier attempts (Poppins medium, then Instrument Sans) both picked an existing site font hoping to match; monday composes in neither, and no weight adjustment turns a narrow grotesque into a wide geometric one. Instrument Sans remains the site's display face everywhere else, so the section heading stays in unity with the hero.
- **"Évaluation financière" object de-intensified.** The travelling white line's peak drops `#cfe0fe` → `#b8d2fc` (74 % → 62 % white) and the blue glow under the object loses about a quarter of its density; crest width and geometry unchanged.
- **Particle ring left exactly as it was.** Three rounds of tuning its hover retraction and reseeding its field were fully reverted at the client's request. Recorded here only so the current values are understood as deliberate: widening a cursor radius does not intensify an effect, it makes it reach further, so more of the ring moves at once and it reads as a global deformation rather than a local sensitive spot.

### Fixed
- **Table panel no longer overflows narrow viewports.** A `1fr` grid column keeps `min-width: auto`, so it refuses to shrink below its text; the longest row label pushed the panel past the card and the card past the viewport, clipping the amount column and the card title on mobile. Now `minmax(0,1fr)` plus `min-w-0`, which is what lets `truncate` work at all.

### Known issues
- **15 px horizontal scroll on phones under 420 px wide**, pre-existing and unrelated to the above: the decorative circle in `OraHeroMobile.tsx` is a fixed 420 px centred with `-translate-x-1/2`, so it protrudes on both sides and enlarges the document scroll width. Bounding it to the viewport (or clipping the hero) fixes it.

### Changed (earlier)
- **Hero: opt-in demo.** The software replica now rises bottom-to-top on arrival. Once the intro has played, a small notification appears at the replica's own top-right corner offering to start the demo, and the passage turns heavy: the pin reserves 46vh of scroll after the intro ends, so the page keeps scrolling and the scrollbar keeps moving while the scene waits. Nothing is ever blocked, and Lenis is never stopped (a stopped Lenis reads as a broken page, and leaving it stopped is a known trap in this project). Without a click there is no demo animation and no simulated cursor. Below the "Réserver un appel" button the whole background switches white → black, nav ribbon included via `data-nav-dark`, and the "Votre temps…" reveal sits 36vh lower so its letter-by-letter arrival is not lost inside the colour change.
- **Use cases: four new cards** (Prévisionnel, Évaluation financière, Connectivité CRM, Organisation) with their own mockups and posters. They carry no demo clip: the "Voir la démo" pill is conditional on a video existing, rather than showing one that does not match the card. Their copy is a draft, published on the client's decision, still to be validated.
- **PDF extraction clip re-exported (v4).** v2 was rendered on a lavender `#ebe0f9` inherited from the card's former colour, so the junction showed once the card went pink. The background was changed at the source (the HTML page that generates the video) and the 547 frames re-rendered and re-encoded as tagged BT.709, so rounded corners and window drop-shadows genuinely melt into the pink. The poster is now the clip's exact first frame (its background had stayed pale blue, matching neither the card nor the old video). Card colour goes `#f7e3f0` → `#f6e3f0`: one unit of red, which is what the browser actually decodes from H.264's YUV 4:2:0.
- **Scroll performance**: `useEnterOnScroll` no longer forces a layout read per scroll event per instance (9 forced reads per wheel notch with ten instances mounted, now 0); animated `filter: blur()` transitions removed from the stacked cards and the security mockup; the dezoom engine splits geometry reads from style writes and skips cards outside the visible band.
- **Homepage redesign (Bending-Spoons direction)**: black hero with curved 3D video carousel at the very top (7 clips incl. new FEC Studio / Reporting / Pointage demos, continuous drift, white labels above the clips, click-to-zoom lightbox with blurred backdrop); old Hero removed. ExcelReveal ("Votre temps…") moved under the carousel on black with word-by-word scroll reveal, then the white demo-video panel rises as a curtain. Feature cards (Automatisation / Sur-mesure / Local & sécurisé) restyled to the FEC-Studio split-card look and stacked sticky (each rises over the previous), Atlas rises over the stack. Privacy section rebuilt as 3 hover-reveal tiles (Joko-style). "Avec/Sans Ora" comparison framed as blue/grey panels with hover lift.
- **Fixed**: real-mouse clicks on the 3D carousel were swallowed by flat wrapper boxes sitting in front of the receded cards (`pointer-events` pass-through + removed pointer capture); lightbox close now works (portal moved outside `AnimatePresence`).

### Added
- **Coming-soon dialog on the demo page.** Choosing an automation opens an announcement instead of continuing: the web app that mirrors the software opens Friday 7 August at 10:00, with a live countdown. The target date carries its UTC offset, otherwise the hour shown would drift from country to country.
- **Demo: preview-first flow.** The run now starts anonymously right after the drop (per-IP rate limit server-side); when it completes, the result opens in an in-page "Excel window" (window chrome, bottom sheet tabs, styled grid with row/column headers, merged cells, virtualized rendering for large sheets, diagonal watermark, copy/context-menu disabled) with the workbook's charts redrawn as SVG and live pivot sheets substituted by their static equivalent. The lead form moved into a popup triggered by "Télécharger le fichier complet": submitting consumes a credit (5 per email), sends the magic link and syncs the CRM. Requires ora-demo-service >= the preview-first contract (POST /demo/jobs anonymous + /claim + /preview).
- **Online demo funnel** (hidden, FR/EN): lead-gen page at `/demo` (not linked in nav yet). Hero, automation picker as a large-card carousel (arrows, dots, keyboard, swipe, side peek of neighbouring cards, illustration panel per automation with drawn placeholder until real screenshots land in `data.ts`) that collapses into a compact summary card on selection to free space for the drag & drop zone, animated drag & drop with extension validation, progressive lead form (first/last name → email → time normally spent, optional phone + sector incl. student/personal), then the run starts while the magic-link email is "sent"; the download space lives at `/demo?ml=<job_id>` (doubles as email verification) with a live "still running" state, delivered-file card, remaining credits (5 offered) and booking CTA. Entirely driven by a mocked API layer (`src/components/demo/demoApi.ts`) that mirrors the future `ora-demo-service` backend (FastAPI on Infomaniak Jelastic) 1:1; swapping to the real service only touches that module. Automation list is placeholder content pending the final selection.
- Legal pages (FR/EN): **Mentions légales** (`/mentions-legales`), **Politique de confidentialité** (`/politique-confidentialite`) and **CGU** (`/cgu`), rendered through a shared `LegalDocLayout` component. Content ported from `Ora_V2/docs/legal/*.md`; footer legal links wired to these routes.
- **Download page** (hidden, FR/EN): private client install page at `/telechargement/ora-app`, deliberately not linked in nav/footer and **not** added to `HIDDEN_PAGES` (so the direct link stays reachable). Standalone chrome (global nav/footer hidden), automatic OS detection, macOS (Apple Silicon only) + Windows download cards, 3-step install guide, support/booking section, and a page-scoped dark/light toggle alongside the system preference.
- **Release redirects** in `vercel.json`: `/updates/:path*` → Infomaniak release bucket (307), covering both the updater (`/updates/latest.json`) and the installers. Processed before `rewrites`, so no conflict with the in-app router. Download buttons wired to `/updates/Ora-latest-macos.dmg` and `/updates/Ora-latest-windows.exe`.

### Planned
- Light / Dark mode toggle with `localStorage` persistence
- Update Tailwind color tokens to official brand palette (`#3b82f6`, `#0d9488`, `#111827`, `#fcfbf7`)
- Logo swap based on active theme

---

## [0.2.0] 2026-04-08

### Changed
- Hero animation: galaxy collapse effect, Ora logo reveal, smooth transitions

---

## [0.1.0] — Initial commit

### Added
- Project scaffold: React 19 + Vite + TypeScript + Tailwind CSS
- Framer Motion, Three.js, Lenis, Lucide React, @calcom/embed-react
- Hero section with orbit animation
- Navigation component
- Stats section
- ForBusiness page
- Cursor spotlight effect (light + dark variants)
- Timeline animation styles
- Cal.com scheduling embed
