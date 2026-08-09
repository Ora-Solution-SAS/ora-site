# Plan responsive mobile — proposition du 2026-08-09

Écrit pour être lu depuis un téléphone. Chaque chantier donne le fichier, le
symptôme, et le geste proposé. Ordre = priorité.

---

## État des lieux (ce qui est DÉJÀ géré)

Le site n'est pas « cassé » sur mobile : les choix lourds ont déjà leur repli.

| Zone | Comportement mobile actuel |
|---|---|
| Hero animé (réplique + mur + dézoom) | masqué sous `md`, remplacé par `OraHeroMobile` (recomposition statique à la largeur du téléphone) |
| Manifeste noir (ExcelReveal) | masqué sous `md` — la page saute du hero aux cas d'usage |
| Mur 3×3 du dézoom | `hidden md:grid`, n'existe pas sur mobile |
| Décors WebGL du bento (anneau, galaxie) | `hidden md:block`, les cartes retombent sur leurs voiles (`washMobileOnly`) |
| Panneaux-tableaux (AppTablePanel) | colonnes en `minmax(0,1fr)`, colonne « Source » masquée sous `md` — plus aucun débordement |
| Navigation | hamburger + tiroir plein écran |
| Vidéos | `preload="metadata"` + posters, lecture seulement à l'écran |

---

## P0 — Le bug connu : 15 px de défilement horizontal

**Symptôme** : sous 420 px de large, toute la page glisse latéralement de 15 px.
**Cause** (isolée, mesurée) : le cercle décoratif du hero mobile —
`src/components/OraHeroMobile.tsx:99` — fait 420 px fixes, centré par
`-translate-x-1/2`, donc il dépasse des deux côtés et élargit la page.
**Geste** : borner le cercle au viewport, `w-[420px] h-[420px]` →
`w-[min(420px,100vw)]` + hauteur assortie (ou `overflow-x-clip` sur la
section du hero mobile).
**Contrôle** : à 390×844, `document.documentElement.scrollWidth === window.innerWidth`.

## P1 — Le manifeste absent sur mobile

Le texte « Votre temps est votre actif le plus précieux… » est le cœur du
discours, et le mobile ne le voit **jamais** : la page passe du hero aux cas
d'usage sans transition ni message.
**Proposition** : une variante statique dans `ExcelReveal` (pas de révélation
lettre à lettre, trop coûteuse au scroll tactile) : fond noir conservé, 2 à
3 phrases clés en `clamp(1.6rem, 7vw, 2.2rem)`, entrée simple par
`useEnterOnScroll`. Le bloc desktop reste intact ; c'est un frère `md:hidden`,
pas une refonte.

## P2 — Le hero mobile : montrer une automatisation

`OraHeroMobile` montre l'écran d'accueil recomposé, mais aucune démo. La
version desktop vend le geste (dépôt → livrable) ; le mobile devrait en montrer
au moins la trace : les deux pastilles-fichiers (`balance_2025.xlsx` →
`Reporting généré`) posées sur la réplique, déjà dessinées dans
`OraHeroMobile`, pourraient s'enchaîner en fondu (CSS pur, 2 images-clés) pour
suggérer le flux sans moteur de scroll.

## P3 — Les cartes empilées (StackingCards) sur téléphone

Les panneaux-tableaux se rendent à pleine largeur : lisible, mais les
libellés de statut (`Conforme`, `À relire`) tombent à ~10 px réels.
**Proposition** : sous `md`, monter la taille de police du panneau d'un cran
(11,5 → 13 px sur les lignes, 10,5 → 12 px sur les statuts) et masquer le
groupe fantôme (3 lignes squelettes qui n'apportent rien à cette taille).

## P4 — Poids réseau mobile

- `public/` contient ~28 Mo de mp4 servis aussi au mobile ; les cartes qui les
  portent sont masquées sous `md` mais les `<video>` restent dans le DOM →
  vérifier qu'aucun `preload` ne tire d'octets quand la carte est `hidden`
  (auditer avec l'onglet Réseau en throttling 4G).
- Posters JPEG ≤ 100 Ko chacun : déjà le cas, à maintenir.

## P5 — Grille de recette (à dérouler après chaque chantier)

Largeurs : 360, 390, 414, 768 px. Pour chacune :
1. pas de défilement horizontal (`scrollWidth === innerWidth`) ;
2. nav : tiroir ouvrable, liens cliquables, CTA visibles ;
3. hero mobile : tout le texte lisible sans zoom, CTA au-dessus du pli ;
4. bento : chaque carte ≥ 44 px de zone tactile sur ses boutons ;
5. thème sombre : mêmes contrôles ;
6. Lighthouse mobile ≥ 85 en performance sur la page d'accueil.

---

*Note d'outillage : les contrôles automatisés de ce dépôt tournent sur
Chromium (Puppeteer). Le navigateur de référence du client est Safari — tout
chantier mobile doit être re-regardé sur un iPhone réel ou au minimum dans
Safari responsive mode, le zoom CSS ayant déjà produit un écart
Chromium/WebKit sur ce projet.*
