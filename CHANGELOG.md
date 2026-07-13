# Changelog

All notable changes to the Ora website are documented here.
Format: `[version] YYYY-MM-DD — description`

---

## [Unreleased]

### Changed
- **Homepage redesign (Bending-Spoons direction)**: black hero with curved 3D video carousel at the very top (7 clips incl. new FEC Studio / Reporting / Pointage demos, continuous drift, white labels above the clips, click-to-zoom lightbox with blurred backdrop); old Hero removed. ExcelReveal ("Votre temps…") moved under the carousel on black with word-by-word scroll reveal, then the white demo-video panel rises as a curtain. Feature cards (Automatisation / Sur-mesure / Local & sécurisé) restyled to the FEC-Studio split-card look and stacked sticky (each rises over the previous), Atlas rises over the stack. Privacy section rebuilt as 3 hover-reveal tiles (Joko-style). "Avec/Sans Ora" comparison framed as blue/grey panels with hover lift.
- **Fixed**: real-mouse clicks on the 3D carousel were swallowed by flat wrapper boxes sitting in front of the receded cards (`pointer-events` pass-through + removed pointer capture); lightbox close now works (portal moved outside `AnimatePresence`).

### Added
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
