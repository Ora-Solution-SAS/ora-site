import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * poster-bilan-illustration.mjs — le poster ILLUSTRÉ du bilan développé.
 *
 * Différence avec capture-poster-bilan.mjs, qui photographie l'écran réel :
 * ici on DESSINE, avec les éléments de design du logiciel et rien d'autre.
 * La forme centrale est la seule idée du module, celle qu'une capture noie
 * dans son interface : un bilan, ce sont deux colonnes qui font exactement la
 * même hauteur. Tout le reste est retiré.
 *
 * Ce qui vient du logiciel, à l'identique :
 *   • la typographie (Inter variable, celle de l'application) ;
 *   • les jetons de couleur (#111827 texte, #6b7280 texte secondaire,
 *     #9ca3af discret, #e5e7eb filets), la teinte violette du module et le
 *     dégradé de marque #3b82f6 → #0d9488 ;
 *   • le rythme typographique des libellés de section : 11 px, majuscules,
 *     interlettrage 0.13em, gris discret ;
 *   • les blocs empilés du schéma de bilan, à leur taille réelle.
 *
 * Sortie : public/posters/ora_bilan_illustration.jpg (1664×936, densité 2).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1664, H = 936;
const SORTIE = path.join(__dirname, 'public', 'posters',
                         'ora_bilan_illustration.jpg');

// La police de l'application, embarquée en base64 : le rendu ne doit dépendre
// ni du réseau ni des polices installées sur la machine qui exporte.
const INTER = path.join(
  '/Users/gaugainraphael/Desktop/All/ORA/Site & Software/Ora_V2/atlas',
  'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const INTER_B64 = fs.readFileSync(INTER).toString('base64');

// Les masses du dossier de démonstration (fictif), à l'euro. Les hauteurs des
// blocs en sont la proportion exacte : le dessin ne triche pas sur les
// tailles, c'est tout le propos d'un bilan « à sa taille réelle ».
const TOTAL = 662250;
// Deux rampes monochromes plutôt que quatre couleurs vives par colonne : la
// teinte violette est celle du module dans l'application, le bleu est
// l'accent de la marque. Aucun palier ne descend sous le niveau 500, pour que
// le libellé blanc reste lisible sur chacun.
const ACTIF = [
  { l: 'Immobilisations', v: 268000, c: '#5b21b6' },
  { l: 'Stocks', v: 96500, c: '#6d28d9' },
  { l: 'Créances clients', v: 214300, c: '#7c3aed' },
  { l: 'Trésorerie', v: 83450, c: '#8b5cf6' },
];
const PASSIF = [
  { l: 'Capitaux propres', v: 312540, c: '#1e40af' },
  { l: 'Dettes financières', v: 165000, c: '#1d4ed8' },
  { l: 'Fournisseurs', v: 121400, c: '#2563eb' },
  { l: 'Dettes fiscales', v: 63310, c: '#3b82f6' },
];
// Hauteur utile, écarts entre plaques déduits : les proportions restent
// exactes une fois les respirations retirées.
// La CASCADE, seconde lecture du module : les soldes dans l'ordre du plan
// comptable. Le dernier est le résultat, et c'est le seul mis en avant.
const SOLDES = [
  { l: 'Marge com.', v: 405000 },
  { l: 'Valeur ajoutée', v: 405740 },
  { l: 'EBE', v: 153740 },
  { l: 'Rés. exploit.', v: 101740 },
  { l: 'Rés. courant', v: 96540 },
  { l: 'Résultat', v: 84540, fort: true },
];
const CASCADE_H = 112;
const ECART = 5;
const COL_H = 470 - 3 * ECART;

const eur = (n) => `${n.toLocaleString('fr-FR')} €`;

const cascade = () => {
  const max = Math.max(...SOLDES.map((x) => x.v));
  return SOLDES.map((x) => {
    const h = Math.max(6, Math.round((x.v / max) * CASCADE_H));
    return `<div class="sol">
        <div class="barre" style="height:${h}px;background:${
          x.fort ? '#111827' : '#dbe0e8'}"></div>
        <div class="sl${x.fort ? ' fort' : ''}">${x.l}</div>
      </div>`;
  }).join('');
};

const colonne = (postes) => postes.map((p) => {
  const h = Math.round((p.v / TOTAL) * COL_H);
  return `<div class="bloc" style="height:${h}px;background:${p.c}">
            <span>${p.l}</span>
          </div>`;
}).join('');

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Inter';
    src: url(data:font/woff2;base64,${INTER_B64}) format('woff2-variations');
    font-weight: 100 900; font-display: block;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:${W}px; height:${H}px; background:#ffffff;
    font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing:antialiased;
    display:grid; grid-template-columns:1fr auto; gap:110px;
    align-items:center; padding:0 128px;
  }
  /* ── La colonne de gauche : ce que le module est, en trois lignes ────── */
  .tuile {
    width:60px; height:60px; border-radius:18px; background:#f5f3ff;
    display:grid; place-items:center; margin-bottom:30px;
  }
  h1 {
    font-size:52px; font-weight:640; line-height:1.06;
    letter-spacing:-0.025em; color:#111827;
  }
  .promesse {
    margin-top:18px; font-size:19px; line-height:1.5; color:#6b7280;
    max-width:430px;
  }
  .filet { width:64px; height:2px; background:#e5e7eb; margin:32px 0 24px; }
  .entrees { font-size:14.5px; line-height:1.6; color:#9ca3af; max-width:420px; }
  .entrees b { color:#6b7280; font-weight:600; }

  /* ── La figure : deux colonnes qui font la même hauteur ──────────────── */
  /* La figure a une largeur EXACTE : deux colonnes plus leur écart. Filets
     et pied s'alignent alors sur elle au pixel, au lieu de flotter dans la
     zone de grille. */
  .figure { position:relative; width:672px; margin:0 auto; }
  /* Colonnes ÉTROITES et bien séparées : larges, elles se lisent comme un
     graphique en barres ; étroites, elles redeviennent la silhouette d'un
     bilan. */
  .duo {
    display:grid; grid-template-columns:290px 290px; gap:92px;
    justify-content:center;
  }
  .tete { margin-bottom:14px; }
  .tete .total {
    display:block; font-size:19px; font-weight:640; color:#111827;
    letter-spacing:-0.02em;
  }
  .tete .nom {
    display:block; margin-top:2px; font-size:10.5px; font-weight:600;
    text-transform:uppercase; letter-spacing:0.13em; color:#9ca3af;
  }
  /* Des PLAQUES espacées, pas un empilement continu : c'est la langue des
     cartes de l'application, et le dessin respire. */
  .pile { display:flex; flex-direction:column; gap:5px; }
  .bloc {
    display:flex; align-items:center; padding:0 14px; color:#fff;
    border-radius:9px; font-size:12px; font-weight:500;
    letter-spacing:0.005em;
  }
  /* Les deux filets débordent des colonnes et traversent l'écart : le dessin
     dit « même hauteur » sans avoir à l'écrire. */
  .guide {
    position:absolute; left:-28px; right:-28px; height:1px;
    background:#e5e7eb;
  }
  .pied { margin-top:34px; }
  .pied .titre {
    font-size:10px; font-weight:600; text-transform:uppercase;
    letter-spacing:0.13em; color:#9ca3af; margin-bottom:14px;
  }
  .cascade {
    display:grid; grid-template-columns:repeat(6, 1fr); gap:10px;
    align-items:end;
  }
  .sol { display:flex; flex-direction:column; justify-content:flex-end; }
  /* Des barres ÉTROITES : à pleine largeur de cellule, la cascade se lisait
     comme une rangée de rectangles gris. */
  .barre { width:64px; border-radius:6px 6px 3px 3px; }
  .sl {
    margin-top:9px; font-size:10px; color:#9ca3af; letter-spacing:0.01em;
    white-space:nowrap;
  }
  .sl.fort { color:#111827; font-weight:600; }

</style></head><body>

  <div>
    <div class="tuile">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
           stroke="#7c3aed" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    </div>
    <h1>Bilan développé<br>et SIG</h1>
    <p class="promesse">
      Le bilan à sa taille réelle, et le chemin qu'a pris le résultat.
    </p>
    <div class="filet"></div>
    <p class="entrees">
      À partir d'un <b>FEC</b>, d'une <b>balance générale</b><br>
      ou d'une <b>plaquette comptable</b>.
    </p>
  </div>

  <div class="figure">
    <div class="duo">
      <div>
        <div class="tete">
          <span class="total">${eur(TOTAL)}</span>
          <span class="nom">Ce qu'elle possède</span>
        </div>
        <div class="pile" id="pile-a">${colonne(ACTIF)}</div>
      </div>
      <div>
        <div class="tete">
          <span class="total">${eur(TOTAL)}</span>
          <span class="nom">Comment c'est financé</span>
        </div>
        <div class="pile">${colonne(PASSIF)}</div>
      </div>
    </div>
    <div class="pied">
      <div class="titre">La formation du résultat</div>
      <div class="cascade">${cascade()}</div>
    </div>
  </div>

  <script>
    // Les filets d'égalité se posent sur les bords RÉELS de la pile : arrondir
    // les hauteurs bloc par bloc décale le bas de un ou deux pixels, et un
    // filet tracé à la valeur théorique flotterait juste à côté.
    const pile = document.getElementById('pile-a');
    const fig = document.querySelector('.figure');
    const r = pile.getBoundingClientRect(), f = fig.getBoundingClientRect();
    for (const y of [r.top - f.top, r.bottom - f.top]) {
      const g = document.createElement('div');
      g.className = 'guide';
      g.style.top = y + 'px';
      fig.appendChild(g);
    }
  </script>
</body></html>`;

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ type: 'jpeg', quality: 94, path: SORTIE });
  console.log(`✓ ${SORTIE}`);
} finally {
  await browser.close();
}
