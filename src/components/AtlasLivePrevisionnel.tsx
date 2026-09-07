import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileSpreadsheet, Landmark, Receipt, Sparkles, Wallet } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * AtlasLivePrevisionnel — l'animation de la capacité « Relie chaque fichier à
 * ses sources ».
 *
 * Client 2026-09-05 : « plutôt que l'on montre la feature de la toolbar, on
 * demande crée un prévisionnel d'activité pour tel client. Ça ouvre le module
 * prévisionnel, ça demande d'entrer des chiffres, les chiffres se remplissent
 * tout seuls, et voilà, on a un prévisionnel qui se crée. »
 *
 * LE SCÉNARIO (5,4 s) : on tape la demande dans la barre d'Atlas, le module
 * Prévisionnel s'ouvre avec ses quatre champs VIDES et son « à renseigner »,
 * puis chaque champ se remplit seul — et c'est là que tout se joue : à côté de
 * chaque montant apparaît LA PIÈCE D'OÙ IL VIENT (FEC 2025, balance générale,
 * grand livre, relevés bancaires). Le prévisionnel se déclare prêt.
 *
 * ⚠ POURQUOI CETTE SCÈNE ILLUSTRE BIEN « RELIE CHAQUE FICHIER À SES SOURCES »,
 * alors qu'on y voit un prévisionnel se monter : le sujet n'est pas le
 * prévisionnel, c'est la PROVENANCE. Un champ qui se remplit tout seul, c'est
 * de la magie et ça inquiète ; un champ qui se remplit tout seul EN MONTRANT
 * la pièce dont il sort, c'est une chaîne vérifiable. La pastille de source est
 * donc le sujet de l'animation, pas sa décoration. Si un jour on la retire,
 * cette scène ne parle plus de la capacité qu'elle illustre.
 *
 * ⚠ LES MONTANTS SONT DE LA DONNÉE DE MAQUETTE, comme « Nexio SAS ». La règle
 * maison interdit les chiffres INVENTÉS EN ARGUMENTAIRE (un gain de temps, un
 * pourcentage d'économie, un résultat client) ; elle n'interdit pas qu'une
 * capture d'écran de logiciel contienne des nombres, et toutes les autres
 * maquettes du site en portent (AppTablePanel, ValuationCard, ReportingMockup).
 * Ne jamais glisser ici un chiffre qui se lirait comme une PROMESSE.
 *
 * Garde-fous repris d'AtlasLiveNotify : IntersectionObserver + `active` pour ne
 * pas mouliner hors écran, `prefers-reduced-motion` qui pose l'état final sans
 * boucle, et `aria-hidden` puisque tout est décor.
 */

/** Les quatre postes du module, dans l'ordre où le prévisionnel les demande.
 *  `piece` est la source : c'est elle le propos de la scène. */
const POSTES: {
  icon: typeof Wallet;
  label: { fr: string; en: string };
  valeur: string;
  piece: { fr: string; en: string };
}[] = [
  {
    icon: Wallet,
    label: { fr: "Chiffre d'affaires N-1", en: "Revenue, last year" },
    valeur: "412 000 €",
    piece: { fr: "FEC 2025", en: "2025 FEC file" },
  },
  {
    icon: Receipt,
    label: { fr: "Achats consommés", en: "Cost of goods sold" },
    valeur: "186 400 €",
    piece: { fr: "Balance générale", en: "General balance" },
  },
  {
    icon: Landmark,
    label: { fr: "Masse salariale", en: "Payroll" },
    valeur: "94 250 €",
    piece: { fr: "Grand livre", en: "General ledger" },
  },
  {
    icon: FileSpreadsheet,
    label: { fr: "Charges externes", en: "External charges" },
    valeur: "38 900 €",
    piece: { fr: "Relevés bancaires", en: "Bank statements" },
  },
];

/** Les onglets du module, repris de PrevisionnelStudio pour que la maquette
 *  parle la même langue que le vrai logiciel. « Le réel » est l'étape que la
 *  scène joue : c'est celle qui réclame les chiffres. */
const ONGLETS: { fr: string; en: string }[] = [
  { fr: "Le métier", en: "The trade" },
  { fr: "Le réel", en: "The actuals" },
  { fr: "Le cadre", en: "The frame" },
  { fr: "Dossier", en: "File" },
];
const ONGLET_ACTIF = 1;

/* Le tempo. La frappe est volontairement rapide (28 ms le signe) : ce n'est pas
   elle qu'on vient voir, elle doit juste dire « on a demandé ». */
const T_FRAPPE = 28;
const T_OUVRE = 1180;
const T_PREMIER = 1760;
const T_PAS = 360;
const T_FIN = T_PREMIER + POSTES.length * T_PAS;
const T_BOUCLE = T_FIN + 2100;

type Phase = "saisie" | "module";

export default function AtlasLivePrevisionnel({ active = true }: { active?: boolean }) {
  const { t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  const [reduced, setReduced] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [phase, setPhase] = useState<Phase>("saisie");
  const [signes, setSignes] = useState(0);
  const [remplies, setRemplies] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const demande = t({
    fr: "Crée un prévisionnel d'activité pour Nexio SAS",
    en: "Create an activity forecast for Nexio SAS",
  });

  const running = onScreen && active && !reduced;

  /* ⚠ MOUVEMENT RÉDUIT : on POSE l'état final, on ne le joue pas. Le module
     ouvert, les quatre postes remplis, leurs sources visibles. La scène perd
     son récit, pas son information. */
  useEffect(() => {
    if (reduced) {
      setPhase("module");
      setSignes(demande.length);
      setRemplies(POSTES.length);
    }
  }, [reduced, demande.length]);

  /* La boucle, en minuteurs chaînés plutôt qu'en une machine à états : le
     scénario est strictement linéaire, un tableau de rendez-vous se relit plus
     vite qu'un réducteur. Tout est nettoyé au démontage et à chaque tour. */
  useEffect(() => {
    if (!running) return;
    let minuteurs: number[] = [];

    const tour = () => {
      setPhase("saisie");
      setSignes(0);
      setRemplies(0);

      for (let i = 1; i <= demande.length; i++) {
        minuteurs.push(window.setTimeout(() => setSignes(i), i * T_FRAPPE));
      }
      minuteurs.push(window.setTimeout(() => setPhase("module"), T_OUVRE));
      for (let i = 1; i <= POSTES.length; i++) {
        minuteurs.push(
          window.setTimeout(() => setRemplies(i), T_PREMIER + (i - 1) * T_PAS),
        );
      }
      minuteurs.push(
        window.setTimeout(() => {
          minuteurs.forEach(window.clearTimeout);
          minuteurs = [];
          tour();
        }, T_BOUCLE),
      );
    };

    tour();
    return () => minuteurs.forEach(window.clearTimeout);
  }, [running, demande.length]);

  const fini = remplies >= POSTES.length;

  return (
    <div ref={rootRef} aria-hidden className="w-full max-w-[500px]">
      {/* ── LA BARRE D'ATLAS ────────────────────────────────────────────────
          La demande, tapée. Le curseur ne clignote qu'AVANT l'ouverture du
          module : une fois le module ouvert, un curseur qui continue de battre
          dirait que l'on tape encore. */}
      <div className="flex items-center gap-2.5 rounded-[12px] bg-white px-3.5 py-2 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.55)]">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] text-white ring-1 ring-inset ring-white/25"
          style={{
            background: "linear-gradient(140deg, #4f8ef7 0%, #3b82f6 45%, #0d9488 100%)",
            boxShadow: "0 6px 14px -7px rgba(13,148,136,0.7)",
          }}
        >
          <Sparkles className="h-[15px] w-[15px]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 truncate font-inter text-[13px] text-[#111827]">
          {demande.slice(0, signes)}
          {phase === "saisie" && (
            <span className="ml-[1px] inline-block h-[13px] w-[2px] translate-y-[2px] animate-pulse bg-[#3b82f6]" />
          )}
        </span>
      </div>

      {/* ── LE MODULE ───────────────────────────────────────────────────────
          ⚠ HAUTEUR FIXE (`min-h`), et ce n'est pas un détail : la plaque qui
          contient cette scène ne doit jamais changer de taille (voir le pavé de
          SCENE_VARIANTS dans AtlasShowcase). Un module qui grandit au fil du
          remplissage ferait respirer la plaque, exactement le mouvement qu'on a
          retiré. Les quatre lignes sont donc là dès l'ouverture, vides. */}
      <AnimatePresence>
        {phase === "module" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
            className="mt-3 overflow-hidden rounded-[14px] bg-white shadow-[0_18px_44px_-18px_rgba(0,0,0,0.6)]"
          >
            {/* L'en-tête : ce qu'on monte, et pour qui. */}
            <div className="flex items-center gap-2.5 border-b border-[#0a2540]/[0.08] px-4 py-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-[#ebf2fe] text-[#2563eb] ring-1 ring-inset ring-[rgba(37,99,235,0.16)]">
                <FileSpreadsheet className="h-[15px] w-[15px]" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-inter text-[13px] font-semibold text-[#111827]">
                  {t({ fr: "Prévisionnel d'activité", en: "Activity forecast" })}
                </span>
                <span className="block truncate font-inter text-[11px] text-[#6b7688]">
                  Nexio SAS
                  {" · "}
                  {t({ fr: "Transport et logistique", en: "Transport and logistics" })}
                </span>
              </span>
            </div>

            {/* Les onglets du module. Muets, sauf celui qu'on joue. */}
            <div className="flex items-center gap-4 border-b border-[#0a2540]/[0.08] px-4">
              {ONGLETS.map((o, i) => (
                <span
                  key={o.en}
                  className={`relative py-2 font-inter text-[11.5px] ${
                    i === ONGLET_ACTIF
                      ? "font-semibold text-[#111827]"
                      : "font-normal text-[#98a2b3]"
                  }`}
                >
                  {t(o)}
                  {i === ONGLET_ACTIF && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#3b82f6]" />
                  )}
                </span>
              ))}
            </div>

            {/* ── LES QUATRE POSTES ───────────────────────────────────────
                Vides à l'ouverture, avec leur « à renseigner » : c'est le
                « ça demande d'entrer des chiffres » de la demande client. Puis
                chacun se remplit, montant ET pièce d'origine ensemble. */}
            <div className="px-4 py-1">
              {POSTES.map((p, i) => {
                const Icon = p.icon;
                const rempli = i < remplies;
                return (
                  <div
                    key={p.label.en}
                    className="flex items-center gap-3 border-b border-[#0a2540]/[0.06] py-2 last:border-b-0"
                  >
                    <span
                      className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] transition-colors duration-300 ${
                        rempli
                          ? "bg-[#e6f7ef] text-[#0a7d5e] ring-1 ring-inset ring-[rgba(10,125,94,0.18)]"
                          : "bg-[#f1f4f9] text-[#98a2b3] ring-1 ring-inset ring-[rgba(10,37,64,0.07)]"
                      }`}
                    >
                      <Icon className="h-[13px] w-[13px]" strokeWidth={2} />
                    </span>

                    <span className="min-w-0 flex-1 truncate font-inter text-[12.5px] text-[#42506b]">
                      {t(p.label)}
                    </span>

                    {/* LA VALEUR ET SA SOURCE. Les deux arrivent ENSEMBLE, dans
                        le même mouvement : un montant qui apparaîtrait avant sa
                        provenance raconterait l'inverse de la capacité. */}
                    <span className="flex shrink-0 items-center gap-2">
                      <AnimatePresence mode="wait" initial={false}>
                        {rempli ? (
                          <motion.span
                            key="valeur"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-2"
                          >
                            <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#f7f9fd] px-1.5 py-[2px] font-inter text-[10.5px] text-[#6b7688] ring-1 ring-inset ring-[rgba(10,37,64,0.10)]">
                              <FileSpreadsheet
                                className="h-[10px] w-[10px] shrink-0 text-[#3b82f6]"
                                strokeWidth={2.2}
                              />
                              {t(p.piece)}
                            </span>
                            <span className="font-inter text-[12.5px] font-semibold tabular-nums text-[#111827]">
                              {p.valeur}
                            </span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="vide"
                            initial={false}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.14 }}
                            className="font-inter text-[11px] italic text-[#98a2b3]"
                          >
                            {t({ fr: "à renseigner", en: "to fill in" })}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── LE PIED : LE PRÉVISIONNEL EST MONTÉ ─────────────────────
                ⚠ IL OCCUPE SA PLACE MÊME VIDE (`min-h`) : sans ça, la carte
                grandirait d'un cran au dernier poste rempli. */}
            <div className="flex min-h-[40px] items-center border-t border-[#0a2540]/[0.08] px-4">
              <AnimatePresence>
                {fini && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-2"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#0a7d5e] px-2.5 py-1 font-inter text-[11.5px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(10,125,94,0.75)]">
                      <Check className="h-3 w-3" strokeWidth={3.2} />
                      {t({ fr: "Prévisionnel prêt", en: "Forecast ready" })}
                    </span>
                    <span className="font-inter text-[11px] text-[#6b7688]">
                      {t({
                        fr: "Plan de trésorerie et comptes prévisionnels compris",
                        en: "Cash-flow plan and forecast accounts included",
                      })}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
