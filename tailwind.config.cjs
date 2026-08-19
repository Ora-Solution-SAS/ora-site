/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx,js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Marque ────────────────────────────────────────────────
                "brand-blue": "#3b82f6",
                // Le survol de TOUS les appels à l'action pleins. Une seule
                // valeur : trois survols différents cohabitaient pour la même
                // base (#2f75e6, #0752c9, #4E4EDB), audit du 2026-08-15.
                "brand-blue-hover": "#2563eb",
                "brand-teal": "#0d9488",

                // ── Fonds de section ──────────────────────────────────────
                // Ils vont PAR PAIRES et alternent d'une section à l'autre.
                // En clair : bg-light (#fcfbf7) puis blanc pur.
                // En sombre : background (noir) puis bg-dark-alt.
                background: "#000000",
                "bg-dark-alt": "#0f172a",
                "bg-light": "#fcfbf7",

                // ── Encres grises ─────────────────────────────────────────
                // Les trois valeurs de gris employées dans le texte, remontées
                // au-dessus de 4,5:1 sur fond clair le 2026-08-15 : le trio
                // précédent (#c4cad6, #9aa4b5, #9aa3b2) tombait entre 1,6 et
                // 2,5:1, y compris sur les libellés d'onglets et sur la moitié
                // d'un titre de section.
                "ink-strong": "#42506b",
                "ink-muted": "#5b6577",
                "ink-faint": "#6b7688",

                // Legacy (kept for backward compat)
                "gray-medium": "#9CA3AF",
                "gray-light": "#D1D5DB",
                "blue-primary": "#3b82f6",
                border: "#e5e7eb",
            },
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
                inter: ["Inter", "sans-serif"],
                instrument: ["Instrument Sans", "Inter", "sans-serif"],
                // Figtree = la fonte de marque de monday.com (client 2026-08-08).
                // Repli sur Poppins et non sur Inter : c'est la plus proche des
                // deux, géométrique et ronde comme elle, donc la carte garde son
                // caractère si le webfont manque.
                figtree: ["Figtree", "Poppins", "sans-serif"],
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
            },
            animation: {
                "spin-slow": "spin 3s linear infinite",
            },
        },
    },
    plugins: [],
};