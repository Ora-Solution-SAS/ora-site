/**
 * ── `force-desktop` : LA MISE EN PAGE LARGE DANS UN CADRE ÉTROIT ────────────
 *
 * Les maquettes de produit (Prévisionnel, Structure, Évaluation…) sont des
 * fenêtres d'application dessinées pour ~990 px : barre latérale, métiers sur
 * deux colonnes, carte flottante en surimpression. Sous `sm` elles se
 * recomposent en une colonne — 1 268 px de haut pour 340 de large, et ce n'est
 * plus l'écran validé qu'on montre. DesktopThumb leur rend leur largeur de
 * dessin puis réduit le tout à l'échelle ; encore faut-il que les variantes
 * responsive s'allument à l'intérieur du cadre.
 *
 * Elles ne le peuvent pas d'elles-mêmes : `sm:`, `md:` et `lg:` interrogent le
 * viewport, qui reste étroit quelle que soit la largeur donnée au cadre. Une
 * variante Tailwind ne suffit pas non plus — `addVariant("md", …)` sur un nom de
 * point de rupture n'émet rien, ces trois-là ne sont pas des variantes mais des
 * `screens`.
 *
 * Ce greffon recopie donc, APRÈS que Tailwind a produit sa feuille, chaque règle
 * vivant dans un `@media (min-width: …)` de point de rupture, préfixée de
 * `.force-desktop `. La copie sort de la requête de média : elle s'applique donc
 * à toute largeur, mais seulement sous un ancêtre portant la classe. Sa
 * spécificité (0,2,0) passe devant celle des utilitaires de base (0,1,0), ce qui
 * est exactement ce qu'il faut pour que `sm:flex` batte le `hidden` d'un
 * `hidden sm:flex`.
 *
 * Les composants ne sont pas touchés — c'est tout l'intérêt : les maquettes
 * gardent une seule définition de leur mise en page, celle qui est validée.
 */

/** Les points de rupture de Tailwind, tels qu'ils sortent dans la feuille. */
const BREAKPOINTS = ["640px", "768px", "1024px"];
const MEDIA = new RegExp(`^\\s*\\(\\s*min-width\\s*:\\s*(${BREAKPOINTS.join("|")})\\s*\\)\\s*$`);

module.exports = () => ({
  postcssPlugin: "force-desktop",
  OnceExit(root, { Rule }) {
    const clones = [];
    root.walkAtRules("media", (atRule) => {
      if (!MEDIA.test(atRule.params)) return;
      atRule.walkRules((rule) => {
        // Les règles imbriquées plus profond (une seconde requête de média à
        // l'intérieur, un `@supports`) sortiraient de leur condition en étant
        // remontées : on les laisse où elles sont.
        if (rule.parent !== atRule) return;
        const clone = new Rule({
          selectors: rule.selectors.map((s) => `.force-desktop ${s}`),
          nodes: rule.nodes.map((n) => n.clone()),
        });
        clones.push(clone);
      });
    });
    // En queue de feuille : à spécificité égale, la dernière règle gagne, et
    // certaines copies doivent battre un utilitaire déclaré plus bas.
    for (const clone of clones) root.append(clone);
  },
});

module.exports.postcss = true;
