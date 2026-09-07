import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * apiDev — sert `api/*.ts` pendant `npm run dev`.
 *
 * En production ces fichiers sont des fonctions Vercel : la plateforme les
 * compile et les route toute seule sur `/api/<nom>`. En local, Vite ne connaît
 * que `src/`, et sans ce pont `/api/availability` renverrait la page d'accueil
 * (le SPA attrape tout), c'est-à-dire du HTML là où le front attend du JSON.
 *
 * Le pont recharge le module à chaque requête via `ssrLoadModule` : on garde
 * le rechargement à chaud sur le back-end comme sur le front.
 */
function apiDev(mode: string): Plugin {
  const apiDir = path.resolve(__dirname, 'api')

  /* Les secrets du service de réservation vivent en production dans les
     variables d'environnement Vercel, et en local dans `.env.local` (ignoré par
     git). Vite ne les expose que sous `import.meta.env`, et seulement s'ils
     commencent par `VITE_` : les gestionnaires d'`api/` lisent `process.env`,
     comme sur Vercel. On fait donc le pont ici, en DÉVELOPPEMENT SEULEMENT
     (`apply: 'serve'`), et sans jamais écraser une variable déjà posée dans le
     shell. Aucune de ces valeurs n'atteint le navigateur : ce plugin ne touche
     pas au bundle client. */
  const fileEnv = loadEnv(mode, __dirname, '')
  for (const [k, v] of Object.entries(fileEnv)) {
    if (!k.startsWith('VITE_') && process.env[k] === undefined) process.env[k] = v
  }

  return {
    name: 'ora-api-dev',
    apply: 'serve',

    /* Les fichiers d'`api/` s'importent entre eux en `./x.js`, comme l'exige
       Node en ESM ; sur le disque il n'y a que `./x.ts`. Vercel passe par
       esbuild et s'en accommode, le résolveur de Vite non : on fait la
       correspondance ici plutôt que de dégrader les imports du vrai runtime. */
    resolveId(source, importer) {
      if (!importer || !importer.startsWith(apiDir)) return null
      if (!source.startsWith('.') || !source.endsWith('.js')) return null
      const candidate = path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'))
      return fs.existsSync(candidate) ? candidate : null
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? ''
        if (!raw.startsWith('/api/')) return next()

        const url = new URL(raw, 'http://localhost')
        // Un point ou un séparateur dans le nom de route sortirait d'`api/` :
        // on n'accepte que des identifiants simples.
        const route = url.pathname.slice(5).replace(/\/+$/, '')
        if (!/^[a-z0-9-]+$/i.test(route)) return next()

        const file = path.join(apiDir, `${route}.ts`)
        if (!fs.existsSync(file)) return next()

        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', async () => {
          const rawBody = Buffer.concat(chunks).toString('utf8')

          /* Les deux objets que la signature Vercel attend, réduits à ce que
             nos gestionnaires utilisent réellement. Volontairement minimal :
             une imitation plus large donnerait l'illusion de tester la
             plateforme, alors qu'elle ne teste que notre code. */
          const query: Record<string, string> = {}
          url.searchParams.forEach((v, k) => { query[k] = v })

          let body: unknown = undefined
          if (rawBody) {
            try { body = JSON.parse(rawBody) } catch { body = rawBody }
          }

          const shimRes = {
            statusCode: 200,
            setHeader: (k: string, v: string) => { res.setHeader(k, v); return shimRes },
            status(code: number) { shimRes.statusCode = code; return shimRes },
            json(payload: unknown) {
              res.statusCode = shimRes.statusCode
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(payload))
              return shimRes
            },
            send(payload: string) {
              res.statusCode = shimRes.statusCode
              res.end(payload)
              return shimRes
            },
          }

          try {
            const mod = await server.ssrLoadModule(file)
            await mod.default({ method: req.method, query, body, headers: req.headers }, shimRes)
          } catch (err) {
            server.config.logger.error(`[api] ${route}: ${err instanceof Error ? err.stack : String(err)}`)
            if (!res.writableEnded) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ error: 'dev_handler_failed', message: String(err) }))
            }
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
// Vite serves index.html for unknown routes by default (appType: 'spa'),
// so browser refresh on any path works without extra config.
export default defineConfig(({ mode }) => ({
  plugins: [react(), apiDev(mode)],
  // Bind on all interfaces (IPv4 + IPv6) so the dev server is reachable via
  // both localhost and 127.0.0.1 from any local browser.
  server: {
    host: true,
    // Honor the PORT env var when set (e.g. by the preview harness); fall
    // back to 5173 for a normal `npm run dev`.
    port: Number(process.env.PORT) || 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
