# Ora — Motion / Animations de texte

Animations de texte **9:16 (1080×1920)** pour la **Vidéo 1 — Automatisation**.
Tu fournis les screen recordings (Excel + ton soft) ; ces fichiers fournissent uniquement le **texte animé + design Ora**, à superposer.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Launcher : accès FR / EN + aperçu par phase |
| `automatisation-fr.html` | Version 🇫🇷 (séquence complète ~35s) |
| `automatisation-en.html` | Version 🇬🇧 (séquence complète ~35s) |
| `assets/style.css` | Charte Ora (Poppins/Inter, dégradé, chroma) |
| `assets/engine.js` | Moteur de timeline (zéro dépendance) |

## Lancer l'aperçu

Depuis la racine du projet :

```bash
python3 -m http.server 4600 --directory motion
# puis ouvre http://localhost:4600/
```

**Raccourcis :** `Espace` = play/pause · `R` = rejouer · `H` = masquer l'interface.

**Options URL :**
- `?clean` — masque l'interface (pour enregistrer)
- `?loop` — joue en boucle
- `?phase=N` — joue **une seule phase** en boucle (N = 1 à 5), pour caler une séquence
- `?bg=transparent` — fond transparent au lieu du chroma (capture **alpha** via OBS)
- `?raw` — pas de mise à l'échelle (rendu 1:1, exige une fenêtre ≥ 1080×1920)

## Structure de la séquence (timing)

Cale tes rushes Excel sur ces repères :

| Phase | Temps | Fond | Texte |
|---|---|---|---|
| 1 — Le pain | 0–7s | chroma (à incruster) | « Lundi matin. » → « Encore le reporting mensuel. » |
| 2 — On agite | 7–13s | chroma | « Copier. Coller. Vérifier. » → « Recommencer. » → la longue ligne |
| 3 — Pattern interrupt | 13–16s | **fond Ora** (coupure nette + ~0,8s de vide) | « Et si tout ça… se faisait en un clic ? » |
| 4 — La solution | 16–27s | chroma | lower third discret « …exécutées en un clic. » |
| 5 — Dream + CTA | 27–35s | **fond Ora** | « Concentrez-vous sur l'analyse… » → logo Ora → CTA |

> Les phases **1, 2, 4** sont sur fond **chroma** (à superposer sur tes captures).
> Les phases **3 et 5** sont sur **fond Ora plein écran** (elles couvrent l'image).

## Enregistrement → montage

### Méthode A — Chroma key (recommandée pour CapCut)

1. Ouvre la version voulue avec `?clean` dans un navigateur, fenêtre la plus grande possible (idéalement 1080×1920, ou un écran vertical / DevTools en mode device 1080×1920).
2. Enregistre l'écran (QuickTime, OBS, ou l'enregistreur d'écran).
3. Dans **CapCut** : pose la vidéo de texte **au-dessus** de tes rushes Excel → effet **Incrustation / Chroma key** → pioche la couleur **magenta** (`#FF00FF`).
   - Les phases 3 et 5 (fond Ora) ne sont pas magenta : elles restent visibles en plein écran, ce qui est voulu (pattern interrupt + CTA).
4. Ajuste « intensité » / « ombre » du chroma si un liseré subsiste.

> Le fond est en **magenta** (et non vert) exprès : le vert serait trop proche du teal `#0d9488` du dégradé Ora et risquerait de « manger » le texte à l'incrustation. Pour repasser au vert classique : change `--chroma` dans `assets/style.css`.

### Méthode B — Alpha (qualité maximale, via OBS)

1. Source **Navigateur** dans OBS, dimension **1080×1920**, URL `…?clean&bg=transparent`.
2. Enregistre en format avec **canal alpha** (ex. `.mov` ProRes 4444).
3. Importe dans ton montage : aucune incrustation à faire, le texte (ombres et dégradés compris) se superpose parfaitement.

## Adapter le texte

Les textes sont dans chaque HTML, dans `window.ORA_COPY`. Modifie-les directement, recharge la page.

## Notes

- Police : **Poppins** (titres) chargée via Google Fonts → garde une connexion internet à l'enregistrement.
- Le timing est défini dans `assets/engine.js` (tableau `TL`, en secondes) : ajuste si tu veux étirer/raccourcir une phase.
