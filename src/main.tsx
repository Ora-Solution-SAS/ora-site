import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './lib/i18n'

/* ⚠ `reducedMotion="user"` (audit du 2026-08-15). Framer Motion NE respecte PAS
   `prefers-reduced-motion` de lui-même : il faut le lui demander, une fois, ici.
   Les scènes écrites à la main (le hero, les scènes WebGL, le carrousel d'Atlas,
   les maquettes) lisaient déjà la préférence chacune de leur côté ; toutes les
   entrées en fondu-montée pilotées par Framer, elles, jouaient quel que soit le
   réglage — c'est-à-dire la grande majorité des mouvements de la page.
   Ce réglage neutralise les transformations (déplacements, échelles, rotations)
   et laisse passer les opacités, ce qui est exactement la bonne granularité :
   le contenu apparaît toujours, il ne voyage plus. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <App />
      </LangProvider>
    </MotionConfig>
  </StrictMode>,
)
