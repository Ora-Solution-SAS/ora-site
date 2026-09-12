import puppeteer from 'puppeteer';
const out = process.argv[2];
const browser = await puppeteer.launch({ protocolTimeout: 180000 });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await page.goto('http://localhost:5173/produit', { waitUntil: 'networkidle2' });
await page.evaluate(() => document.querySelectorAll('.prd-stagger,.prd-reveal').forEach((el) => el.style.setProperty('opacity','1','important')));
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('côte à côte avec Excel'));
  el.scrollIntoView({ block: 'center' });
});
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${out}/big-excel.png` });
const m = await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('côte à côte avec Excel'));
  const panels = [...document.querySelectorAll('div')].filter((d) => String(d.className).includes('aspect-[16/9]'));
  const r = panels[0] ? panels[0].getBoundingClientRect() : null;
  return r ? { w: Math.round(r.width), h: Math.round(r.height) } : 'none';
});
console.log(JSON.stringify(m));
await browser.close();
