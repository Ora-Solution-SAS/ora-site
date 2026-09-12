import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * capture-poster-bilan.mjs — le poster du module « Bilan développé et SIG ».
 *
 * Même contrat que capture-posters.mjs : un JPEG 16:9 exact de 1664×936,
 * recomposé sur le blanc des cartes, prêt pour le mur des cas d'usage. La
 * différence est la SOURCE : ici ce n'est pas une maquette du site, c'est
 * l'écran réel du logiciel, pris sur son banc de développement
 * (Ora_V2, `?preview-bilan`, étape « Ce qui a été lu »).
 *
 * Pourquoi l'écran réel plutôt qu'une maquette : cet écran-là EST l'argument.
 * Le bilan en colonnes proportionnelles, les trois équilibres nommés en
 * français et la cascade des soldes avec leurs formules sont ce que le module
 * produit, et aucune maquette ne le raconterait mieux que lui-même. Les
 * chiffres sont ceux du dossier de démonstration, tous fictifs.
 *
 * Usage, avec le banc Ora_V2 lancé sur le port 1430 :
 *     node capture-poster-bilan.mjs [http://localhost:1430]
 *
 * Sortie : public/posters/ora_bilan_developpe.jpg
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:1430';
const POSTER_W = 1664, POSTER_H = 936;
const SORTIE = path.join(__dirname, 'public', 'posters',
                         'ora_bilan_developpe.jpg');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  // deviceScaleFactor 2 : le poster est lu sur des écrans Retina, et le texte
  // de 11 px de l'interface doit rester net une fois la carte réduite.
  await page.setViewport({ width: 1500, height: 1100, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/?preview-bilan`, { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Étape 2 du banc : « Ce qui a été lu ».
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => /2\. Ce qui a été lu/.test(x.textContent));
    b?.click();
  });
  await sleep(1400);

  // La scène : le contenu de l'étape, RECOMPOSÉ pour le format 16:9. Empilé
  // tel quel, le bloc de lecture est deux fois plus haut que large et se
  // retrouve minuscule au centre d'un cadre panoramique. On met donc le bilan
  // et la cascade côte à côte : mêmes nœuds, mêmes chiffres, autre mise en
  // page — exactement ce que fait capture-posters.mjs pour les maquettes.
  await page.evaluate((W, H) => {
    const racine = document.querySelector('.max-w-4xl');
    const rail = racine.querySelector('nav, [class*="ora-pose-etape"]')
      || racine.children[0];
    const titre = [...racine.querySelectorAll('h2')]
      .find((x) => /Ce qui a été lu/.test(x.textContent));
    const sous = titre?.nextElementSibling;
    const bloc = racine.querySelector('.space-y-5');
    const [entete, carteBilan, carteSig] = bloc ? [...bloc.children] : [];

    const scene = document.createElement('div');
    scene.id = 'scene';
    scene.style.cssText = 'width:1460px;background:#fff;padding:30px 34px 34px;'
      + 'border-radius:20px;box-shadow:0 26px 64px -26px rgba(15,23,42,.28),'
      + '0 2px 8px rgba(15,23,42,.06);border:1px solid rgba(229,231,235,.9)';

    if (rail) { rail.style.marginBottom = '18px'; scene.appendChild(rail); }
    if (titre) scene.appendChild(titre);
    if (sous) { sous.style.margin = '6px 0 16px'; sous.style.maxWidth = '760px';
                scene.appendChild(sous); }
    if (entete) { entete.style.marginBottom = '16px'; scene.appendChild(entete); }

    const duo = document.createElement('div');
    duo.style.cssText = 'display:grid;grid-template-columns:1.15fr 1fr;gap:20px;'
      + 'align-items:start';
    if (carteBilan) duo.appendChild(carteBilan);
    if (carteSig) duo.appendChild(carteSig);
    scene.appendChild(duo);

    document.body.innerHTML = '';
    const canvas = document.createElement('div');
    canvas.id = 'poster-canvas';
    canvas.style.cssText = `position:fixed;left:0;top:0;width:${W}px;`
      + `height:${H}px;background:#ffffff;overflow:hidden;z-index:99999;`
      + 'display:flex;justify-content:center;align-items:center';
    canvas.appendChild(scene);
    document.body.appendChild(canvas);
  }, POSTER_W, POSTER_H);
  await sleep(500);

  // La scène tient ENTIÈREMENT dans le cadre, marges comprises : une scène
  // coupée en bas ferait croire à un écran tronqué.
  await page.evaluate((W, H) => {
    const scene = document.getElementById('scene');
    const r = scene.getBoundingClientRect();
    const k = Math.min((W - 96) / r.width, (H - 64) / r.height);
    scene.style.transform = `scale(${k})`;
    scene.style.transformOrigin = 'center center';
  }, POSTER_W, POSTER_H);
  await sleep(400);

  const el = await page.$('#poster-canvas');
  await el.screenshot({ type: 'jpeg', quality: 92, path: SORTIE });
  console.log(`✓ ${SORTIE}`);

  // ── Second poster : LES TROIS ENTRÉES ────────────────────────────────────
  // L'argument commercial du module, et celui que le site ne dit nulle part :
  // le bilan imagé d'Ora ne réclame pas un FEC. Une balance générale suffit
  // (l'export le plus rapide d'un cabinet), et une plaquette comptable aussi,
  // ce qui permet de travailler un PROSPECT qui n'est pas encore client.
  const page2 = await browser.newPage();
  await page2.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  await page2.setViewport({ width: 1500, height: 1100, deviceScaleFactor: 2 });
  await page2.goto(`${BASE}/?preview-bilan`, { waitUntil: 'networkidle2' });
  await sleep(1600);
  await page2.evaluate((W, H) => {
    const racine = document.querySelector('.max-w-4xl');
    const scene = document.createElement('div');
    scene.id = 'scene';
    scene.style.cssText = 'width:1380px;background:#fff;padding:44px 40px 40px;'
      + 'border-radius:20px;box-shadow:0 26px 64px -26px rgba(15,23,42,.28),'
      + '0 2px 8px rgba(15,23,42,.06);border:1px solid rgba(229,231,235,.9)';
    // Tout sauf la barre d'action collée en pied (« Choisissez une pièce »),
    // qui n'a pas de sens sur une image fixe.
    for (const el of [...racine.children]) {
      if (/Étape \d+ sur/.test(el.textContent || '')) continue;
      scene.appendChild(el);
    }
    // La grille des portes est bornée à `max-w-4xl` dans l'application, où
    // elle vit dans une colonne. Sur un poster panoramique, cette borne la
    // réduit à trois colonnes étroites au milieu du vide : on l'élargit pour
    // que les cartes respirent et que leur texte reste lisible en vignette.
    // `pb-16` réserve dans l'application la place de la barre d'action collée
    // en pied. Le poster n'a pas cette barre : la réserve devient un bandeau
    // vide au bas de la carte.
    const reserve = [...scene.querySelectorAll('div')]
      .find((d) => (d.className || '').includes('pb-16'));
    if (reserve) reserve.style.paddingBottom = '0';

    const grille = [...scene.querySelectorAll('div')]
      .find((d) => (d.className || '').includes('grid-cols-3'));
    if (grille) {
      // La borne vient de la grille ET de ses parents (l'écran de dépôt vit
      // dans une colonne étroite) : on la lève sur toute la chaîne.
      let n = grille;
      while (n && n !== scene) {
        n.style.maxWidth = '1240px';
        n.style.width = '100%';
        n = n.parentElement;
      }
    }
    document.body.innerHTML = '';
    const canvas = document.createElement('div');
    canvas.id = 'poster-canvas';
    canvas.style.cssText = `position:fixed;left:0;top:0;width:${W}px;`
      + `height:${H}px;background:#ffffff;overflow:hidden;z-index:99999;`
      + 'display:flex;justify-content:center;align-items:center';
    canvas.appendChild(scene);
    document.body.appendChild(canvas);
  }, POSTER_W, POSTER_H);
  await sleep(500);
  await page2.evaluate((W, H) => {
    const scene = document.getElementById('scene');
    const r = scene.getBoundingClientRect();
    const k = Math.min((W - 96) / r.width, (H - 64) / r.height);
    scene.style.transform = `scale(${k})`;
    scene.style.transformOrigin = 'center center';
  }, POSTER_W, POSTER_H);
  await sleep(400);
  const sortie2 = path.join(__dirname, 'public', 'posters',
                            'ora_bilan_entrees.jpg');
  const el2 = await page2.$('#poster-canvas');
  await el2.screenshot({ type: 'jpeg', quality: 92, path: sortie2 });
  console.log(`✓ ${sortie2}`);
} finally {
  await browser.close();
}
