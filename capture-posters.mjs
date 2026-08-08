import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * capture-posters.mjs — regenerates the JPG posters of the mockup-based
 * use-case cards (the dezoom wall shows these posters instead of the live
 * mockups), and audits the mobile legibility of their message-carrying
 * labels.
 *
 * Usage: node capture-posters.mjs [http://localhost:5180]
 *
 * Two passes per card:
 *   1. desktop, prefers-reduced-motion emulated (all mockup layers visible,
 *      dezoom engine off): screenshot of the media zone, then re-composed on
 *      the card colour into an exact 16:9 poster (1664×936) so the wall's
 *      object-cover crops nothing;
 *   2. 375px viewport: computes the on-screen pixel size of each carrying
 *      label (stage scale × font-size) and fails if any is below 11px.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:5180';
const SHOTS = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

// `bg` doit rester la copie EXACTE du `bg` de la carte dans UseCases.tsx : le
// poster est recomposé dessus. Valeurs alignées sur la palette du 2026-08-05
// (voir le pavé « PALETTE DU MUR » dans UseCases.tsx).
//
// ÉTENDU AUX SEPT cartes à maquette (2026-08-05). Il n'y en avait que quatre :
// « Reporting mensuel », « Pointage de comptes » et « Formatage » se rabattaient
// sur un still de leur VIDÉO DE DÉMO, qui ne montre pas du tout la même chose
// que la maquette affichée sur la carte, et dont le fond est celui du clip et
// non celui de la carte. Le mur affichait donc, pendant le dézoom, un visuel
// pour un autre. C'est réglé : chaque poster est maintenant une image de SA
// PROPRE maquette, recomposée sur SA couleur de carte.
// Essai « bento Stripe » du 2026-08-06 (itération 2) : toutes les cartes sont
// BLANCHES, les posters se recomposent donc sur blanc. (Le canvas accepte
// n'importe quelle valeur CSS de `background`, dégradés compris, si une
// itération future remet de la couleur.)
const CARD_BG = '#ffffff';
const CARDS = [
  // `labels` VIDE pour ces trois-là : l'audit de la passe 2 ne vaut que pour les
  // « libellés porteurs », ces mots de 40 px et plus dessinés exprès pour rester
  // lisibles une fois la scène réduite sur mobile. Ces trois maquettes-ci n'en
  // ont pas : elles racontent par la composition, tout leur texte est de la
  // texture. Y pointer un texte d'interface produit un échec qui ne veut rien
  // dire, puisqu'il n'a jamais été prévu pour être lu à cette échelle.
  { key: 'reporting', media: '.rm-media', bg: CARD_BG, labels: [] },
  { key: 'pointage', media: '.pm-media', bg: CARD_BG, labels: [] },
  { key: 'formatage', media: '.fm-media', bg: CARD_BG, labels: [] },
  // Listes RECALÉES le 2026-08-05 sur ce qui existe encore. Plusieurs libellés
  // porteurs ont disparu des maquettes lors des épurations successives (les
  // pastilles « Connecté au CRM » et « 4 affaires importées » de CrmMockup ont
  // été retirées le 2026-08-04, par exemple), et leurs sélecteurs pointaient
  // depuis dans le vide. Le script les signalait comme illisibles — en réalité
  // ils n'existaient plus. Une liste vide veut dire : cette maquette n'a pas de
  // libellé porteur, elle raconte par la composition.
  { key: 'previsionnel', media: '.pv-media', bg: CARD_BG, labels: ['.pv-val'] },
  { key: 'evaluation', media: '.ev-media', bg: CARD_BG, labels: ['.ev-val'] },
  { key: 'crm', media: '.cm-media', bg: CARD_BG, labels: [] },
  { key: 'organisation', media: '.og-media', bg: CARD_BG, labels: ['.og-client .t'] },
];

const POSTER_W = 1664, POSTER_H = 936;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrollTo(page, selector) {
  await page.evaluate((sel) => {
    document.querySelector(sel).scrollIntoView({ block: 'center', behavior: 'instant' });
  }, selector);
  // Let the framer-motion entrance finish (0.65s) with margin.
  await sleep(1600);
}

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  // ── Pass 1 · desktop: review shots + posters ─────────────────────────────
  // The poster is NOT an element screenshot of the media zone: clipping at the
  // media box guillotines the window drop-shadows mid-fade (client 2026-08-02:
  // « une partie ombragée qui se stoppe nette »). Instead the live media node
  // is moved for a moment into a fixed 16:9 canvas painted in the card colour,
  // sized so the scene fills the height: its ResizeObserver refits the stage,
  // shadows die out naturally into the flat colour, then the node goes back.
  await page.setViewport({ width: 1700, height: 1000, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(1200);

  for (const card of CARDS) {
    await scrollTo(page, card.media);

    // Full-card shot for visual review (element in place).
    const cardEl = await page.evaluateHandle(
      (sel) => document.querySelector(sel).closest('.group'), card.media);
    await cardEl.asElement().screenshot({
      type: 'png', path: path.join(SHOTS, `usecase-${card.key}-desktop.png`) });

    // Poster: move the media node into the 16:9 canvas, shoot, restore.
    await page.evaluate((sel, bg, W, H) => {
      const media = document.querySelector(sel);
      const canvas = document.createElement('div');
      canvas.id = 'poster-canvas';
      canvas.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px;` +
        `background:${bg};overflow:hidden;z-index:99999;display:flex;justify-content:center;align-items:flex-start`;
      const placeholder = document.createComment('poster-placeholder');
      media.parentNode.insertBefore(placeholder, media);
      window.__posterRestore = { media, placeholder };
      media.style.width = `${Math.round(H * (1040 / 640))}px`;
      canvas.appendChild(media);
      document.body.appendChild(canvas);
    }, card.media, card.bg, POSTER_W, POSTER_H);
    await sleep(600);
    const out = path.join(__dirname, 'public', 'posters', `ora_${card.key}.jpg`);
    // Element screenshot, NOT page.screenshot({clip}): clip coordinates are
    // document-relative and the page is scrolled several thousand px down.
    const canvasEl = await page.$('#poster-canvas');
    await canvasEl.screenshot({ type: 'jpeg', quality: 88, path: out });
    await page.evaluate(() => {
      const { media, placeholder } = window.__posterRestore;
      placeholder.parentNode.insertBefore(media, placeholder);
      placeholder.remove();
      media.style.width = '';
      document.getElementById('poster-canvas').remove();
      delete window.__posterRestore;
    });
    await sleep(300);
    console.log(`✓ Poster written: public/posters/ora_${card.key}.jpg (${POSTER_W}×${POSTER_H})`);
  }

  // ── Pass 2 · 375px: legibility audit of the carrying labels ──────────────
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(1200);

  let failed = false;
  for (const card of CARDS) {
    await scrollTo(page, card.media);
    const report = await page.evaluate((sel, labels) => {
      const stage = document.querySelector(sel).querySelector('[class$="-stage"], [class*="-stage"]');
      const scale = new DOMMatrixReadOnly(getComputedStyle(stage).transform).a;
      // Un sélecteur qui ne matche rien est une ERREUR DE CONFIG, pas un échec
      // de lisibilité : il est signalé comme tel au lieu de faire planter le
      // script sur un `getComputedStyle(null)`.
      return labels.map((l) => {
        const el = document.querySelector(l);
        if (!el) return { label: l, missing: true };
        const fs = parseFloat(getComputedStyle(el).fontSize);
        return { label: l, stagePx: fs, screenPx: +(fs * scale).toFixed(1), scale: +scale.toFixed(3) };
      });
    }, card.media, card.labels);
    for (const r of report) {
      if (r.missing) {
        failed = true;
        console.log(`✗ ${card.key} ${r.label}: sélecteur introuvable`);
        continue;
      }
      const ok = r.screenPx >= 11;
      if (!ok) failed = true;
      console.log(`${ok ? '✓' : '✗'} ${card.key} ${r.label}: ${r.stagePx}px × ${r.scale} = ${r.screenPx}px on screen`);
    }
    const cardEl = await page.evaluateHandle(
      (sel) => document.querySelector(sel).closest('.group'), card.media);
    await cardEl.asElement().screenshot({
      type: 'png', path: path.join(SHOTS, `usecase-${card.key}-mobile.png`) });
  }

  if (failed) {
    console.error('✗ Some carrying labels fall below 11px at 375px wide');
    process.exitCode = 1;
  } else {
    console.log('✓ All carrying labels stay at or above 11px at 375px wide');
  }
} finally {
  await browser.close();
}
