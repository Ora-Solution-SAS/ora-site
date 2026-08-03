# Changelog

All notable changes to the Ora website are documented here.
Format: `[version] YYYY-MM-DD — description`

---

## [Unreleased]

### Changed
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
