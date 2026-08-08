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
                // Brand palette
                "brand-blue": "#3b82f6",
                "brand-teal": "#0d9488",
                // Backgrounds — dark mode primary is pure black (client request)
                background: "#000000",
                "bg-light": "#fcfbf7",
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