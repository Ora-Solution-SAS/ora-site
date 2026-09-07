module.exports = {
    plugins: {
        tailwindcss: {},
        // Recopie les règles responsive sous `.force-desktop` pour que les
        // maquettes gardent leur mise en page large dans la vignette réduite du
        // téléphone. Doit tourner APRÈS Tailwind, qui produit ces règles.
        "./postcss/force-desktop.cjs": {},
        autoprefixer: {},
    },
};
