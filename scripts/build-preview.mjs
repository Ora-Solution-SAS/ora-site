/**
 * Construit un aperçu autonome du site : UN seul fichier HTML, sans requête
 * réseau, ouvrable depuis n'importe quelle URL ou en `file://`.
 *
 *   node scripts/build-preview.mjs      →  dist-preview/ora-site-preview.html
 *
 * Pourquoi un seul fichier : les hébergeurs d'aperçu (page publiée, partage
 * direct) servent un document isolé et bloquent tout chargement voisin —
 * bundle, image, vidéo. Le site doit donc arriver entier ou pas du tout.
 *
 * Trois transformations, dans cet ordre :
 *  1. `vite build --config vite.config.preview.ts` avec `VITE_HASH_ROUTER=1` :
 *     un bundle unique dont la route vit dans le hash (le chemin appartient à
 *     l'hôte, il ne dira jamais `/`).
 *  2. Les assets de `public/` réellement cités par le bundle deviennent des
 *     data URI. Les vidéos sont d'abord ré-encodées : `public/` pèse 206 Mo de
 *     MP4, un aperçu vise ~10 Mo. Chrome les rejoue sur un canvas et
 *     MediaRecorder en sort du VP8 de 5 s — le ffmpeg fourni avec les
 *     navigateurs Playwright ne décode ni H.264 ni JPEG, il n'est d'aucune
 *     aide ici. Les images au-delà de IMAGE_INLINE_MAX repassent par le même
 *     canvas en WebP.
 *  3. CSS et JS sont recousus dans le HTML, les preloads retirés.
 *
 * Rien de tout cela ne touche la production : `npm run build` et le
 * déploiement Vercel gardent le bundle découpé et le routage par chemin.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'dist-preview');
const OUT_FILE = path.join(OUT_DIR, 'ora-site-preview.html');
const FRAGMENT_FILE = path.join(OUT_DIR, 'ora-site-fragment.html');
const CACHE = path.join(OUT_DIR, '.media-cache');

// Une vidéo de 5 s en 620 px suffit à montrer le mouvement ; au-delà le fichier
// unique dépasse les quelques mégaoctets qu'un aperçu peut porter.
const VIDEO_SECONDS = 5;
const VIDEO_WIDTH = 620;
const VIDEO_BPS = 300_000;
// En dessous, une image passe telle quelle ; au-dessus, elle repasse en WebP.
const IMAGE_INLINE_MAX = 150 * 1024;
const IMAGE_MAX_WIDTH = 1600;
const IMAGE_WEBP_QUALITY = 0.82;

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.json': 'application/json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const log = (...a) => console.log(...a);
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

/* ── 1. Bundle ──────────────────────────────────────────────────────────── */
log('▸ vite build (hash router, bundle unique)');
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--config', 'vite.config.preview.ts'], {
  cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, VITE_HASH_ROUTER: '1' },
});

let html = fs.readFileSync(path.join(OUT_DIR, 'index.html'), 'utf8');
const assetFiles = fs.readdirSync(path.join(OUT_DIR, 'assets'));
const jsName = assetFiles.find((f) => f.endsWith('.js'));
const cssName = assetFiles.find((f) => f.endsWith('.css'));
let js = fs.readFileSync(path.join(OUT_DIR, 'assets', jsName), 'utf8');
let css = fs.readFileSync(path.join(OUT_DIR, 'assets', cssName), 'utf8');
log(`  bundle ${kb(js.length)} js + ${kb(css.length)} css`);

/* ── 2. Assets publics cités par le bundle ──────────────────────────────── */
// On ne devine pas : on relève les chemins absolus présents dans le code livré
// et on ne garde que ceux qui existent réellement dans public/.
const refRe = /["'(](\/[A-Za-z0-9_\-./@]+\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|json|woff2?|ttf|mp4|webm))["')]/g;
const referenced = new Set();
for (const src of [html, js, css]) {
  for (const m of src.matchAll(refRe)) {
    if (fs.existsSync(path.join(ROOT, 'public', m[1]))) referenced.add(m[1]);
  }
}
const videos = [...referenced].filter((p) => p.endsWith('.mp4'));
const others = [...referenced].filter((p) => !p.endsWith('.mp4'));
log(`▸ ${referenced.size} assets cités (${videos.length} vidéos)`);

fs.mkdirSync(CACHE, { recursive: true });

/* Chrome sert de transcodeur : il décode le H.264, MediaRecorder ré-encode. */
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  // Un document réel, et pas la page d'erreur du 404 : sur celle-ci le canvas
  // n'est jamais peint, requestAnimationFrame ne tire pas, et MediaRecorder
  // rend un fichier vide.
  if (rel === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!doctype html><meta charset="utf-8"><title>preview builder</title><body></body>');
    return;
  }
  const file = path.join(ROOT, 'public', rel);
  if (!file.startsWith(path.join(ROOT, 'public')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end(); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const { default: puppeteer } = await import(path.join(ROOT, 'node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js'));
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required',
         '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.setDefaultTimeout(0);
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' }).catch(() => {});

const dataUri = (mime, buf) => `data:${mime};base64,${buf.toString('base64')}`;
const replacements = new Map();
let budget = 0;

for (const rel of videos) {
  const cached = path.join(CACHE, rel.replace(/[\/]/g, '_') + '.webm');
  let buf;
  if (fs.existsSync(cached)) {
    buf = fs.readFileSync(cached);
  } else {
    const b64 = await page.evaluate(async (url, seconds, maxW, bps) => {
      const v = document.createElement('video');
      v.src = url; v.muted = true; v.playsInline = true; v.loop = true;
      await new Promise((res, rej) => {
        v.onloadeddata = res;
        v.onerror = () => rej(new Error('decode failed'));
        setTimeout(() => rej(new Error('load timeout')), 60000);
      });
      const w = Math.min(maxW, v.videoWidth || maxW);
      const c = document.createElement('canvas');
      c.width = w - (w % 2);
      c.height = (Math.round((v.videoHeight / v.videoWidth) * w) || 360) & ~1;
      const ctx = c.getContext('2d');
      const rec = new MediaRecorder(c.captureStream(20), { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: bps });
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise((res) => { rec.onstop = res; });
      v.currentTime = 0;
      await v.play();
      rec.start();
      let raf;
      const draw = () => { ctx.drawImage(v, 0, 0, c.width, c.height); raf = requestAnimationFrame(draw); };
      draw();
      await new Promise((r) => setTimeout(r, seconds * 1000));
      cancelAnimationFrame(raf); rec.stop(); v.pause();
      await stopped;
      const bytes = new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer());
      let s = '';
      for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
      return btoa(s);
    }, ORIGIN + rel, VIDEO_SECONDS, VIDEO_WIDTH, VIDEO_BPS).catch((e) => {
      log(`  ✗ ${rel} — ${e.message}, laissée de côté`);
      return null;
    });
    if (!b64) continue;
    buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(cached, buf);
  }
  replacements.set(rel, dataUri('video/webm', buf));
  budget += buf.length;
  log(`  ✓ ${rel} → webm ${kb(buf.length)}`);
}

for (const rel of others) {
  const file = path.join(ROOT, 'public', rel);
  let buf = fs.readFileSync(file);
  let mime = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  if (buf.length > IMAGE_INLINE_MAX && mime.startsWith('image/') && mime !== 'image/svg+xml') {
    const b64 = await page.evaluate(async (url, maxW, q) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const w = Math.min(maxW, img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = w; c.height = Math.round((img.naturalHeight / img.naturalWidth) * w);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', q).split(',')[1];
    }, ORIGIN + rel, IMAGE_MAX_WIDTH, IMAGE_WEBP_QUALITY).catch(() => null);
    if (b64) {
      const webp = Buffer.from(b64, 'base64');
      if (webp.length < buf.length) {
        log(`  ✓ ${rel} → webp ${kb(buf.length)} → ${kb(webp.length)}`);
        buf = webp; mime = 'image/webp';
      }
    }
  }
  replacements.set(rel, dataUri(mime, buf));
  budget += buf.length;
}
await browser.close();
server.close();
log(`▸ médias inlinés : ${mb(budget)}`);

/* ── 3. Recoudre ────────────────────────────────────────────────────────── */
// Ce qui reste ici pointerait vers l'hôte de l'aperçu, qui ne sert rien. Relevé
// AVANT d'insérer la table, dont les clés sont ces mêmes chemins.
const leftovers = [...html.matchAll(refRe), ...js.matchAll(refRe), ...css.matchAll(refRe)]
  .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i && !replacements.has(v));
if (leftovers.length) log(`  ⓘ ${leftovers.length} chemin(s) absent(s) de public/ : ${leftovers.join(', ')}`);

// Dans le JS, une data URI par asset et des références ensuite : un chemin cité
// à cinq endroits recopierait sinon cinq fois la même vidéo dans le fichier.
// Le délimiteur ouvrant capturé est rendu tel quel — `("/x.png")` doit garder sa
// parenthèse.
js = js.replace(refRe, (m, rel) =>
  (replacements.has(rel) ? `${m[0]}__ORA_ASSETS[${JSON.stringify(rel)}]${m[m.length - 1]}`.replace(/^["']|["']$/g, '') : m));
js = `const __ORA_ASSETS = ${JSON.stringify(Object.fromEntries(replacements))};\n${js}`;

// HTML et CSS n'ont pas de table à interroger : remplacement littéral, les
// chemins les plus longs d'abord pour que /logos/icon-color.png ne soit pas
// entamé par une règle portant sur /logos/icon.png.
const ordered = [...replacements.keys()].sort((a, b) => b.length - a.length);
const swap = (src) => {
  for (const rel of ordered) src = src.split(rel).join(replacements.get(rel));
  return src;
};
[html, css] = [swap(html), swap(css)];

/* Les insertions passent par une fonction de remplacement : une chaîne de
   remplacement ferait interpréter les `$&` du bundle minifié comme le motif
   trouvé, ce qui injecte `</body>` en plein milieu du code. */
const insertBefore = (src, tag, payload) => {
  const i = src.lastIndexOf(tag);
  if (i === -1) throw new Error(`${tag} introuvable dans le HTML`);
  return src.slice(0, i) + payload + src.slice(i);
};

// Seuls les liens vers le dossier de build partent : le CSS est recousu plus
// bas et les preloads n'ont plus de cible. Les feuilles distantes restent —
// Google Fonts porte les trois familles d'affichage du site, les retirer
// remplacerait toute la typographie par la police système.
const before = html;
html = html.replace(/<script\b[^>]*\bsrc="(?:\.?\/)?assets\/[^"]*"[^>]*><\/script>/g, '')
           .replace(/<link\b[^>]*\bhref="(?:\.?\/)?assets\/[^"]*"[^>]*>/g, '');
if (html === before) throw new Error('ni script ni preload retirés — le HTML de Vite a changé de forme');

/* ── 4. Vérifier avant de livrer ────────────────────────────────────────── */
// Un aperçu qui charge encore un fichier voisin est cassé sans le dire : la page
// s'affiche, mais avec le bundle du dossier d'à côté plutôt qu'avec le sien.
// Contrôlé sur le document seul, avant d'y coudre le JS — celui-ci contient des
// `src="..."` dans ses chaînes, qui ne sont pas des requêtes.
const relative = [...html.matchAll(/(?:src|href)="(?!data:|#|https?:|mailto:)([^"]+)"/g)].map((m) => m[1]);
if (relative.length) throw new Error(`références non inlinées : ${relative.slice(0, 5).join(', ')}`);

html = insertBefore(html, '</head>', `<style>${css}</style>`);
html = insertBefore(html, '</body>', `<script type="module">${js}</script>`);

const inlineJs = html.slice(html.lastIndexOf('<script type="module">') + '<script type="module">'.length, html.lastIndexOf('</script>'));
try {
  new (async function () {}.constructor)(inlineJs.replace(/\bimport\.meta\b/g, '({})'));
} catch (e) {
  throw new Error(`le bundle inliné ne parse pas : ${e.message}`);
}

fs.writeFileSync(OUT_FILE, html);
log(`▸ ${path.relative(ROOT, OUT_FILE)} — ${mb(fs.statSync(OUT_FILE).size)}`);

/* ── 5. La même page, en fragment ───────────────────────────────────────── */
// Les hébergeurs de pages publiées enveloppent eux-mêmes le contenu dans leur
// propre `<html><head><body>` ; un document complet s'y retrouverait imbriqué.
// On livre donc aussi la version sans enveloppe, `<title>` en tête pour qu'il
// soit lu, et sans les balises que l'hôte fournit déjà.
const pick = (re) => (html.match(re) || [])[1] || '';
const fragment = [
  `<title>${pick(/<title>([^<]*)<\/title>/)}</title>`,
  ...(html.match(/<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>/g) || []),
  pick(/(<style>[\s\S]*<\/style>)/),
  pick(/<body[^>]*>([\s\S]*)<\/body>/),
].join('\n');
fs.writeFileSync(FRAGMENT_FILE, fragment);
log(`▸ ${path.relative(ROOT, FRAGMENT_FILE)} — ${mb(fs.statSync(FRAGMENT_FILE).size)} (sans <html>/<head>/<body>)`);
