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

const CARDS = [
  { key: 'previsionnel', media: '.pv-media', bg: '#1e3a8a', labels: ['.pv-head', '.pv-kpi .val'] },
  { key: 'evaluation', media: '.ev-media', bg: '#d7efe9', labels: ['.ev-head .h', '.ev-val'] },
  { key: 'crm', media: '.cm-media', bg: '#e3e9fc', labels: ['.cm-conn .t', '.cm-tally .t1'] },
  { key: 'organisation', media: '.og-media', bg: '#0d9488', labels: ['.og-client .t', '.og-tally .t1'] },
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
      return labels.map((l) => {
        const el = document.querySelector(l);
        const fs = parseFloat(getComputedStyle(el).fontSize);
        return { label: l, stagePx: fs, screenPx: +(fs * scale).toFixed(1), scale: +scale.toFixed(3) };
      });
    }, card.media, card.labels);
    for (const r of report) {
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
