# Changelog

All notable changes to the Ora website are documented here.
Format: `[version] YYYY-MM-DD — description`

---

## [Unreleased]

### Added
- Legal pages (FR/EN): **Mentions légales** (`/mentions-legales`), **Politique de confidentialité** (`/politique-confidentialite`) and **CGU** (`/cgu`), rendered through a shared `LegalDocLayout` component. Content ported from `Ora_V2/docs/legal/*.md`; footer legal links wired to these routes.

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
