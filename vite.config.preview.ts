import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Build de l'aperçu autonome : tout le site dans un seul fichier HTML, servi
 * depuis n'importe quelle URL (aperçu publié, `file://`, partage direct).
 *
 * Ce que cette config change par rapport à `vite.config.ts`, et pourquoi :
 *  • `publicDir: false` — `public/` pèse 206 Mo de vidéos sources. Le script
 *    `scripts/build-preview.mjs` inline lui-même les assets réellement
 *    référencés, recompressés ; les copier ici ne servirait qu'à remplir le
 *    disque.
 *  • `inlineDynamicImports` + `cssCodeSplit: false` — les quinze pages sont
 *    chargées en `React.lazy`. Un fichier unique ne peut pas aller chercher un
 *    chunk voisin, donc tout part dans le même bundle.
 *  • `assetsInlineLimit` très haut — les assets importés par le code deviennent
 *    des data URI plutôt que des fichiers émis à côté.
 *
 * La config de production n'est pas touchée : `npm run build` et le déploiement
 * Vercel continuent d'émettre le site découpé, avec routage par chemin.
 */
export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-preview',
    cssCodeSplit: false,
    assetsInlineLimit: 100 * 1024 * 1024,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
