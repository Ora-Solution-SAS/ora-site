import { useEffect, useRef, Fragment } from "react";

/**
 * ReportingMockup — Bending-Spoons-style static visual for the "Reporting
 * mensuel" use-case card. A fixed 1040×640 scene, scaled to the media zone via
 * a ResizeObserver so it stays identical to the pixel at every size. All classes
 * are scoped `.rm-`; no external assets. The composition tells the product
 * story in one image:
 *   • an Ora window showing a REAL Excel sheet (green header, A/B/C columns,
 *     row numbers, per-filiale financials) with an Ora automation bar on top
 *     (monthly-reporting template + PDF extraction + email send),
 *   • a small "Extraction PDF" card (a bank statement turned into rows),
 *   • the generated monthly-report PDF + a pressed "Envoyer" button and cursor.
 */

// ── Excel sheet data (per-filiale monthly figures) ──────────────────────────
const XL_COLS = ["Filiale", "CA HT", "Marge", "EBE", "Rés. net"];
const XL_ROWS: string[][] = [
  ["Île-de-France", "4 280 000", "38,4 %", "1 120 000", "624 000"],
  ["Auvergne-Rhône-Alpes", "3 150 000", "35,1 %", "780 000", "402 000"],
  ["PACA", "2 640 000", "33,8 %", "610 000", "318 000"],
  ["Grand Est", "1 980 000", "31,2 %", "420 000", "205 000"],
  ["Hauts-de-France", "1 540 000", "29,7 %", "305 000", "148 000"],
  ["Occitanie", "1 320 000", "30,5 %", "268 000", "131 000"],
  ["Nouvelle-Aquitaine", "1 180 000", "31,8 %", "244 000", "119 000"],
  ["Bretagne", "960 000", "29,1 %", "182 000", "88 000"],
  ["Normandie", "845 000", "28,4 %", "156 000", "74 000"],
  ["Pays de la Loire", "790 000", "30,2 %", "149 000", "72 000"],
];
const XL_TOTAL = ["Total groupe", "19 685 000", "34,1 %", "4 314 000", "2 253 000"];
// Column index (within a data row) that gets the Excel selection outline.
const SEL_ROW = 0, SEL_COL = 1;

const RM_CSS = `
/* ══ Visuel « Reporting mensuel » — Excel + automatisations Ora + PDF ══ */
/* Transparent : la composition flotte directement sur le fond indigo de la
   carte (pas de panneau navy). overflow:hidden rogne la fenêtre en bas. */
.rm-media{position:relative;aspect-ratio:1040/640;
  overflow:hidden;isolation:isolate;background:transparent}
.rm-fit{position:absolute;inset:0;z-index:1}
.rm-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.rm-blob{position:absolute;z-index:0;left:360px;top:110px;width:660px;height:660px;
  border-radius:50%;
  background:radial-gradient(circle at 38% 30%,#ffffff,#eef2fb 70%,#e0e7f6)}
/* ── macOS window chrome ── */
.rm-win{position:absolute;border-radius:12px;background:#fff;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.40),0 24px 70px -18px rgba(0,0,0,.55),0 60px 130px -40px rgba(0,0,0,.50)}
.rm-ora{left:48px;top:66px;width:612px;height:600px}
.rm-titlebar{position:relative;display:flex;align-items:center;height:40px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.rm-lights{display:flex;gap:8px;padding:0 14px}
.rm-lights span{width:12px;height:12px;border-radius:50%}
.rm-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.rm-lights .y{background:#febc2e;border:.5px solid #d89c22}
.rm-lights .g{background:#28c840;border:.5px solid #1eaa33}
.rm-tbtitle{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:7px;
  font-size:12.5px;font-weight:600;color:#4b5563}
.rm-xicon{width:15px;height:15px;border-radius:3px;background:#217346;color:#fff;
  display:grid;place-items:center;font-size:9px;font-weight:800}
.rm-orabody{height:calc(100% - 40px);background:#fff;padding:14px 14px 0;display:flex;flex-direction:column;gap:12px}
/* ── Ora automation bar ── */
.rm-autobar{display:flex;align-items:center;gap:8px}
.rm-tmpl{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:#fff;
  background:#3b82f6;border-radius:8px;padding:6px 11px;box-shadow:0 2px 10px rgba(59,130,246,.28);white-space:nowrap}
.rm-achip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#3b4a63;
  background:#eef2f7;border:1px solid #e2e8f0;border-radius:7px;padding:5px 9px;white-space:nowrap}
.rm-achip.pdf{color:#b42318;background:#fef3f2;border-color:#fee4e2}
.rm-arun{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#059669;white-space:nowrap}
.rm-arun .dot{width:8px;height:8px;border-radius:50%;background:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.16)}
/* ── Excel formula bar ── */
.rm-xlbar{display:flex;align-items:center;height:26px;border:1px solid #d7d7d7;border-radius:5px;
  overflow:hidden;font-size:11px;color:#3f3f3f;flex-shrink:0}
.rm-xlname{width:50px;text-align:center;line-height:26px;border-right:1px solid #d7d7d7;background:#f7f7f7;font-weight:600}
.rm-xlfx{width:26px;text-align:center;line-height:26px;border-right:1px solid #d7d7d7;color:#9a9a9a;font-style:italic;font-family:Georgia,serif}
.rm-xlformula{padding-left:10px;color:#555}
/* ── Excel grid ── */
.rm-xl{border:1px solid #cfcfcf;border-radius:5px;overflow:hidden;flex:1}
.rm-xlgrid{display:grid;grid-template-columns:22px 1.55fr 1fr .82fr 1fr 1fr;font-size:11px}
.rm-xlL{background:#f5f5f5;color:#7a7a7a;text-align:center;font-weight:600;padding:3px 0;
  border-right:1px solid #dcdcdc;border-bottom:1px solid #dcdcdc}
.rm-xlN{background:#f5f5f5;color:#7a7a7a;text-align:center;font-weight:600;padding:6px 0;
  border-right:1px solid #dcdcdc;border-bottom:1px solid #ededed}
.rm-xlH{background:#e2efda;color:#3f6b2b;font-weight:700;padding:6px 8px;
  border-right:1px solid #cfe0c4;border-bottom:1px solid #cfe0c4;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-xlH.num{text-align:right}
.rm-xlC{background:#fff;color:#353535;padding:6px 8px;
  border-right:1px solid #ececec;border-bottom:1px solid #ececec;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-xlC.num{text-align:right;font-variant-numeric:tabular-nums}
.rm-xlC.name{font-weight:600;color:#1f1f1f}
.rm-xlsel{box-shadow:inset 0 0 0 2px #217346}
.rm-xlT{background:#f2f8f1;color:#245a2e;font-weight:700;padding:7px 8px;
  border-right:1px solid #e2eede;border-top:1px solid #b7d3ab}
.rm-xlT.num{text-align:right;font-variant-numeric:tabular-nums}
/* ── Extraction PDF card (floating) ── */
.rm-extract{position:absolute;left:22px;top:470px;z-index:6;width:290px;display:flex;align-items:center;gap:11px;
  background:#fff;border-radius:13px;padding:12px 14px;box-shadow:0 18px 44px -12px rgba(0,0,0,.5)}
.rm-extract .pdfico{width:30px;height:36px;position:relative;background:#fff;border:1px solid #f1d4d4;
  border-radius:5px;overflow:hidden;flex-shrink:0}
.rm-extract .pdfico::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#fdeaea,#fff 60%)}
.rm-extract .pdfico::after{content:'PDF';position:absolute;left:0;right:0;bottom:4px;text-align:center;
  font-size:8px;font-weight:800;color:#dc2626}
.rm-extract .arrow{color:#3b82f6;flex-shrink:0}
.rm-extract .txt{flex:1;min-width:0}
.rm-extract .t1{font-size:12.5px;font-weight:700;color:#111827}
.rm-extract .t2{font-size:10.5px;color:#6b7280;margin-top:2px}
.rm-extract .done{display:inline-flex;align-items:center;gap:5px;margin-top:6px;
  font-size:10px;font-weight:700;color:#059669}
/* ── PDF report (modèle Émeraude) ── */
.rm-pdf{position:absolute;left:614px;top:120px;width:322px;height:404px;z-index:3;
  background:#fff;border-radius:12px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.35),0 30px 80px -20px rgba(0,0,0,.60)}
.rm-pdfhead{background:#047857;color:#fff;padding:18px 20px 15px}
.rm-pdfhead .h1{font-size:16.5px;font-weight:700;letter-spacing:-.01em}
.rm-pdfhead .h2{font-size:10.5px;opacity:.85;margin-top:3px}
.rm-pdfsub{font-size:9px;color:#9ca3af;padding:9px 20px;border-bottom:1px solid #f3f4f6;
  text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.rm-pdfrows{padding:4px 0}
.rm-prow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8.5px 20px;font-size:11.5px}
.rm-prow:nth-child(odd){background:#ecfdf5}
.rm-prow .k{color:#374151}
.rm-prow .v{font-weight:700;color:#065f46;white-space:nowrap}
.rm-pdffoot{position:absolute;left:20px;right:20px;bottom:12px;display:flex;justify-content:space-between;
  font-size:8.5px;color:#c0c4cc;border-top:1px solid #f3f4f6;padding-top:8px}
/* pastille fichier PDF sur le coin haut-droit */
.rm-pdftag{position:absolute;left:840px;top:92px;z-index:4;display:flex;align-items:center;gap:7px;
  background:#fff;border-radius:11px;padding:8px 12px;box-shadow:0 12px 34px -10px rgba(0,0,0,.45)}
.rm-pdftag .ico{width:26px;height:32px;position:relative;background:#fff;border:1px solid #f1d4d4;
  border-radius:4px;overflow:hidden;flex-shrink:0}
.rm-pdftag .ico::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#fdeaea,#fff 60%)}
.rm-pdftag .ico::after{content:'PDF';position:absolute;left:0;right:0;bottom:3px;text-align:center;
  font-size:7.5px;font-weight:800;color:#dc2626}
.rm-pdftag .t1{font-size:11px;font-weight:700;color:#111827}
.rm-pdftag .t2{font-size:9.5px;color:#9ca3af;margin-top:1px}
/* ── Bouton « Envoyer » pressé + curseur ── */
.rm-send{position:absolute;left:690px;top:498px;z-index:5;display:inline-flex;align-items:center;gap:13px;
  height:64px;padding:0 32px;border-radius:999px;background:#2563eb;color:#fff;
  font-size:20px;font-weight:700;letter-spacing:-.01em;
  box-shadow:0 0 0 7px rgba(96,165,250,.32),0 22px 55px -12px rgba(0,0,0,.55),0 6px 20px rgba(37,99,235,.45);
  transform:scale(.97)}
.rm-cursor{position:absolute;left:846px;top:540px;z-index:7;width:62px;height:62px;
  filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}
`;

export default function ReportingMockup() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    const stage = stageRef.current;
    if (!media || !stage) return;
    const W = 1040, H = 640;
    const fit = () => {
      const s = Math.min(media.clientWidth / W, media.clientHeight / H);
      stage.style.transform = `translateX(-50%) scale(${s})`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(media);
    fit();
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <style>{RM_CSS}</style>
      <div className="rm-media" ref={mediaRef}>
        <div className="rm-fit">
          <div className="rm-stage" ref={stageRef}>
            <div className="rm-blob" />

            {/* A · Fenêtre Ora — tableau Excel + barre d'automatisations */}
            <div className="rm-win rm-ora">
              <div className="rm-titlebar">
                <div className="rm-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="rm-tbtitle">
                  <span className="rm-xicon">X</span>
                  Reporting_Méridian_janvier.xlsx — Ora
                </div>
              </div>
              <div className="rm-orabody">
                {/* Ora automation bar */}
                <div className="rm-autobar">
                  <span className="rm-tmpl">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                    Template · Reporting mensuel
                  </span>
                  <span className="rm-achip pdf">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
                    Extraction PDF
                  </span>
                  <span className="rm-achip">Consolidation</span>
                  <span className="rm-arun"><span className="dot" />Automatisé</span>
                </div>

                {/* Excel formula bar */}
                <div className="rm-xlbar">
                  <span className="rm-xlname">C2</span>
                  <span className="rm-xlfx">fx</span>
                  <span className="rm-xlformula">=SOMME(Filiales!C3:C8)</span>
                </div>

                {/* Excel grid */}
                <div className="rm-xl">
                  <div className="rm-xlgrid">
                    {/* Column-letter header: empty corner + A…E */}
                    <div className="rm-xlL" />
                    {XL_COLS.map((_, i) => (
                      <div key={`L${i}`} className="rm-xlL">{String.fromCharCode(65 + i)}</div>
                    ))}

                    {/* Row 1 = the sheet's own header (green, Excel-style) */}
                    <div className="rm-xlN">1</div>
                    {XL_COLS.map((h, i) => (
                      <div key={`H${i}`} className={`rm-xlH${i === 0 ? "" : " num"}`}>{h}</div>
                    ))}

                    {/* Data rows */}
                    {XL_ROWS.map((row, r) => (
                      <Fragment key={r}>
                        <div className="rm-xlN">{r + 2}</div>
                        {row.map((cell, ci) => {
                          const sel = r === SEL_ROW && ci === SEL_COL;
                          const kind = ci === 0 ? "name" : "num";
                          return (
                            <div key={ci} className={`rm-xlC ${kind}${sel ? " rm-xlsel" : ""}`}>{cell}</div>
                          );
                        })}
                      </Fragment>
                    ))}

                    {/* Total row */}
                    <div className="rm-xlN">{XL_ROWS.length + 2}</div>
                    {XL_TOTAL.map((cell, ci) => (
                      <div key={`T${ci}`} className={`rm-xlT${ci === 0 ? "" : " num"}`}>{cell}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* B · Carte « Extraction PDF » (relevé → lignes) */}
            <div className="rm-extract">
              <div className="pdfico" />
              <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              <div className="txt">
                <div className="t1">Extraction PDF</div>
                <div className="t2">Relevé bancaire → 214 lignes Excel</div>
                <div className="done">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  Importé sans ressaisie
                </div>
              </div>
            </div>

            {/* C · Rapport PDF généré (modèle Émeraude) */}
            <div className="rm-pdf">
              <div className="rm-pdfhead">
                <div className="h1">Synthèse — Île-de-France</div>
                <div className="h2">Groupe Méridian · Janvier 2026</div>
              </div>
              <div className="rm-pdfsub">Établi par Valmy &amp; Associés</div>
              <div className="rm-pdfrows">
                <div className="rm-prow"><span className="k">Chiffre d'affaires</span><span className="v">4 280 000 €</span></div>
                <div className="rm-prow"><span className="k">Marge brute</span><span className="v">38,4 %</span></div>
                <div className="rm-prow"><span className="k">Excédent brut d'exploitation</span><span className="v">1 120 000 €</span></div>
                <div className="rm-prow"><span className="k">Résultat net</span><span className="v">624 000 €</span></div>
                <div className="rm-prow"><span className="k">Trésorerie nette</span><span className="v">1 085 000 €</span></div>
                <div className="rm-prow"><span className="k">Délai de règlement (DSO)</span><span className="v">51 jours</span></div>
                <div className="rm-prow"><span className="k">Effectif</span><span className="v">42 personnes</span></div>
                <div className="rm-prow"><span className="k">Poids dans le groupe</span><span className="v">23,4 %</span></div>
              </div>
              <div className="rm-pdffoot"><span>Synthese_IDF_012026.pdf</span><span>1 / 1</span></div>
            </div>
            <div className="rm-pdftag">
              <div className="ico" />
              <div>
                <div className="t1">Synthese_IDF_012026.pdf</div>
                <div className="t2">Généré par Ora · 86 Ko</div>
              </div>
            </div>

            {/* D · Bouton « Envoyer » pressé + curseur */}
            <div className="rm-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>
              Envoyer
            </div>
            <svg className="rm-cursor" viewBox="0 0 32 32">
              <path d="M9 4 L9 27 L14.6 21.6 L18 29.4 L22.4 27.4 L19 19.8 L26.6 19.8 Z"
                fill="#0b0b0f" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
