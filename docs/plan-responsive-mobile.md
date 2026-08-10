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

---

## Exécution — 2026-08-10

| Chantier | Geste livré |
|---|---|
| **P0** | Cercle borné : `h/w-[min(420px,100vw)]` (`OraHeroMobile.tsx`), plus `overflow-x-clip` sur l'enveloppe mobile du hero (`OraHeroDemo.tsx`) en ceinture de sécurité. |
| **P1** | Frère `md:hidden` dans `ExcelReveal` : trois phrases du tableau `phrases` (constat 0, promesse 3, différenciation 4) + signature « Découvrez Ora. », corps `clamp(1.6rem, 7vw, 2.2rem)`, entrée simple par `useEnterOnScroll` (`MobilePhrase`). Le coussin `pt-[50vh]` d'App.tsx devient `md:` seulement : il appartient à la chorégraphie desktop. |
| **P2** | Pastille de flux posée sur la réplique : `balance_2025.xlsx` ⇢ `Reporting généré` en fondu CSS pur (deux images-clés en opposition de phase, cycle 7 s, `index.css`). `aria-hidden`, repli `prefers-reduced-motion` sur l'état A. |
| **P3** | `AppTablePanel` sous `md` : lignes 11,5 → 13 px, statuts 10,5 → 12 px, groupe fantôme masqué. Colonne Montant élargie 88 → 104 px + `whitespace-nowrap` (mesuré au rendu : à 13 px, « 662 250,20 € » se repliait sur deux lignes en dessous). |
| **P4** | Audit fait : la page d'accueil ne monte qu'UN `<video>` (`ora-1.mp4`, ClosingDemo → InViewVideo, `preload="metadata"`, lecture par IntersectionObserver, visible aussi sur mobile). Aucune carte masquée sous `md` ne porte de vidéo montée : les clips du bento actuel sont remplacés par des maquettes. Poster > 100 Ko unique (`ora_reporting.jpg`, 168 Ko) : porté par `UseCases.tsx`, qui n'est plus monté. Rien à changer. |

### Recette (Chromium headless, build de prod)

- 360 / 390 / 414 / 768 px : `scrollWidth === innerWidth` en haut de page ET
  après traversée complète — **P0 vérifié, aucun débordement**.
- Tiroir de navigation : s'ouvre, liens et CTA visibles, cibles ≥ 41 px
  (CTA 47–52 px).
- Hero mobile : titre + CTA au-dessus du pli à 390×844, CTA h-52/54 px.
- Thème sombre : bascule OK, aucun débordement en haut ni après traversée.
- Fondu P2 et manifeste P1 constatés à l'écran (captures).

### Reste à faire à la main (hors de portée du headless)

- Safari / iPhone réel (note d'outillage ci-dessus) — en particulier le fondu
  P2 et le manifeste P1.
- Lighthouse mobile ≥ 85 sur la page d'accueil (le Chromium des contrôles n'a
  pas les codecs H.264, la mesure y serait faussée).
- Throttling 4G réel sur l'onglet Réseau pour confirmer le coût
  `preload="metadata"` d'`ora-1.mp4`.
