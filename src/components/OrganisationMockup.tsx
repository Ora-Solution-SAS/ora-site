import { useEffect, useRef, type CSSProperties } from "react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * OrganisationMockup — visual for the "Organisation" use-case card.
 *
 * One idea, the clearest before/after of the series: a pile of badly named
 * files on the left, the same documents renamed and filed in a clean client
 * folder on the right. The composition:
 *   · left: five scattered, slightly rotated file chips with the messy names
 *     everyone recognises ("facture scan (3).pdf", "sans titre 12.csv"...),
 *   · middle: an arrow with the Ora spark, the transformation itself,
 *   · right: a Finder-like window on the client folder, sections numbered,
 *     files renamed to a dated convention, one check per file,
 *   · bottom: the tally pill with the big count.
 *
 * Same fixed-stage pattern as the other Ora mockups: 1040×640 scene scaled by
 * a ResizeObserver, `.og-` scoped classes, no external assets, one-shot
 * entrance via useEnterOnScroll, disabled under prefers-reduced-motion.
 *
 * MOBILE: the two message-carrying labels (folder title 40px, tally 40px)
 * stay ≥ 11px on a 375px-wide screen. The file names are texture.
 */

type FileKind = "pdf" | "xlsx" | "csv";

/** The mess: [label, kind, left, top, rotation°]. */
const MESSY: [string, FileKind, number, number, number][] = [
  ["facture scan (3).pdf", "pdf", 26, 138, -6],
  ["Copie de relevé mars.xlsx", "xlsx", 62, 216, 4],
  ["IMG_2041.pdf", "pdf", 30, 296, -3],
  ["doc final V7 (2).xlsx", "xlsx", 72, 372, 7],
  ["sans titre 12.csv", "csv", 40, 452, -8],
];

const OG_CSS = `
/* ══ Visuel « Organisation » — le vrac → le dossier client rangé ══ */
/* Transparent : la composition flotte sur le teal de la carte. Pas
   d'overflow:hidden ici : il trancherait les ombres au bord de la zone média.
   C'est l'overflow-hidden + coins arrondis de la CARTE qui rognent en bas. */
.og-media{position:relative;aspect-ratio:1040/640;isolation:isolate;background:transparent}
.og-fit{position:absolute;inset:0;z-index:1}
.og-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.og-blob{position:absolute;z-index:0;left:260px;top:60px;width:560px;height:560px;
  border-radius:50%;
  background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.26),rgba(255,255,255,.10) 55%,transparent 75%)}
/* ── Le vrac : chips de fichiers éparpillées ── */
.og-chip{position:absolute;z-index:2;display:flex;align-items:center;gap:10px;
  background:#fff;border-radius:12px;padding:11px 15px;
  box-shadow:0 2px 5px rgba(15,23,42,.18),0 16px 38px -14px rgba(15,23,42,.5)}
.og-chip .name{font-size:13px;font-weight:600;color:#374151;white-space:nowrap}
.og-fico{width:26px;height:32px;position:relative;flex-shrink:0;border-radius:4px;overflow:hidden}
.og-fico.pdf{background:#fff;border:1px solid #f1d4d4}
.og-fico.pdf::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#fdeaea,#fff 60%)}
.og-fico.pdf::after{content:'PDF';position:absolute;left:0;right:0;bottom:3px;text-align:center;
  font-size:7px;font-weight:800;color:#dc2626}
.og-fico.xlsx{background:#217346;color:#fff;display:grid;place-items:center;
  font-size:11px;font-weight:800}
.og-fico.csv{background:#475569;color:#fff;display:grid;place-items:center;
  font-size:7.5px;font-weight:800;letter-spacing:.02em}
/* ── La flèche et l'étincelle Ora ── */
.og-arrow{position:absolute;z-index:3;left:344px;top:250px;width:130px;height:130px;
  color:rgba(255,255,255,.92);filter:drop-shadow(0 8px 20px rgba(15,23,42,.3))}
/* posée à l'AMORCE du tracé de la flèche (la queue sort de derrière la
   pastille) : étincelle → flèche → dossier, un seul geste graphique. */
.og-spark{position:absolute;z-index:4;left:306px;top:306px;width:52px;height:52px;border-radius:50%;
  background:#fff;color:#0d9488;display:grid;place-items:center;
  box-shadow:0 12px 32px -8px rgba(15,23,42,.45)}
/* ── Fenêtre « dossier client » (droite) ── */
.og-win{position:absolute;z-index:2;left:478px;top:88px;width:514px;height:592px;
  background:#fff;border-radius:12px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.3),0 26px 70px -18px rgba(0,0,0,.45),0 60px 130px -40px rgba(0,0,0,.4)}
.og-titlebar{position:relative;display:flex;align-items:center;height:40px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.og-lights{display:flex;gap:8px;padding:0 14px}
.og-lights span{width:12px;height:12px;border-radius:50%}
.og-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.og-lights .y{background:#febc2e;border:.5px solid #d89c22}
.og-lights .g{background:#28c840;border:.5px solid #1eaa33}
.og-tbtitle{position:absolute;left:0;right:0;text-align:center;
  font-size:12.5px;font-weight:600;color:#4b5563}
.og-body{padding:22px 26px 0}
/* Libellé porteur n°1 : 40px dans le repère 1040, donc ≥ 11px à 375px. */
.og-client{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.og-client .t{font-size:40px;font-weight:700;letter-spacing:-.02em;color:#111827;white-space:nowrap}
.og-client svg{flex-shrink:0}
.og-sec{display:flex;align-items:center;gap:9px;height:36px;
  font-size:15px;font-weight:700;color:#1f2937;white-space:nowrap}
.og-sec svg{flex-shrink:0;color:#3b82f6}
.og-file{display:flex;align-items:center;gap:9px;height:31px;padding-left:30px;
  font-size:13.5px;font-weight:500;color:#374151;white-space:nowrap}
.og-file svg{flex-shrink:0;color:#9ca3af}
.og-file .ck{margin-left:auto;width:18px;height:18px;border-radius:50%;flex-shrink:0;
  background:#ecfdf5;color:#059669;display:grid;place-items:center}
/* ── Pastille de résultat ── */
/* Libellé porteur n°2 : 40px dans le repère 1040. */
.og-tally{position:absolute;z-index:5;left:56px;top:548px;display:flex;align-items:center;gap:14px;
  background:#fff;border-radius:18px;padding:16px 26px;
  box-shadow:0 16px 44px -12px rgba(15,23,42,.5)}
.og-tally .ck{width:40px;height:40px;border-radius:12px;flex-shrink:0;
  background:#ecfdf5;color:#059669;display:grid;place-items:center}
.og-tally .t1{font-size:40px;font-weight:700;letter-spacing:-.02em;color:#111827;white-space:nowrap}
.og-tally .t2{font-size:13px;color:#6b7280;margin-top:2px;white-space:nowrap}

/* ══ Arrivée au scroll (même signature que les autres visuels) ══ */
.og-armed .og-chip,.og-armed .og-win,.og-armed .og-spark,
.og-armed .og-tally,.og-armed .og-sec,.og-armed .og-file{opacity:0}
.og-armed .og-arrowline{stroke-dashoffset:150}

@keyframes ogChip{from{opacity:0;transform:translate3d(-26px,10px,0) rotate(var(--rot))}
  to{opacity:1;transform:rotate(var(--rot))}}
@keyframes ogWin{from{opacity:0;transform:translate3d(30px,16px,0)}to{opacity:1;transform:none}}
@keyframes ogUp{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}
@keyframes ogPop{0%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.18)}
  100%{opacity:1;transform:scale(1)}}
@keyframes ogDraw{to{stroke-dashoffset:0}}
@keyframes ogRow{from{opacity:0;transform:translate3d(0,7px,0)}to{opacity:1;transform:none}}

.og-in .og-chip{animation:ogChip 620ms cubic-bezier(.22,1,.36,1) both}
.og-in .og-c1{animation-delay:80ms}.og-in .og-c2{animation-delay:160ms}
.og-in .og-c3{animation-delay:240ms}.og-in .og-c4{animation-delay:320ms}
.og-in .og-c5{animation-delay:400ms}
.og-in .og-win{animation:ogWin 720ms cubic-bezier(.22,1,.36,1) 220ms both}
.og-in .og-arrowline{animation:ogDraw 480ms cubic-bezier(.4,0,.2,1) 560ms both}
.og-in .og-spark{animation:ogPop 460ms cubic-bezier(.2,1.5,.4,1) 780ms both}
.og-in .og-sec,.og-in .og-file{animation:ogRow 460ms cubic-bezier(.22,1,.36,1) both}
.og-in .og-r1{animation-delay:640ms}.og-in .og-r2{animation-delay:700ms}
.og-in .og-r3{animation-delay:760ms}.og-in .og-r4{animation-delay:820ms}
.og-in .og-r5{animation-delay:880ms}.og-in .og-r6{animation-delay:940ms}
.og-in .og-r7{animation-delay:1000ms}.og-in .og-r8{animation-delay:1060ms}
.og-in .og-r9{animation-delay:1120ms}
.og-in .og-tally{animation:ogUp 600ms cubic-bezier(.2,1.4,.4,1) 1120ms both}

@media (prefers-reduced-motion:reduce){
  .og-armed .og-chip,.og-armed .og-win,.og-armed .og-spark,
  .og-armed .og-tally,.og-armed .og-sec,.og-armed .og-file{opacity:1}
  .og-armed .og-arrowline{stroke-dashoffset:0}
}
`;

const FolderIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M4 4h5l2 2.5h9a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6" />
  </svg>
);

const Check = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function OrganisationMockup() {
  const { t } = useLang();
  const stageRef = useRef<HTMLDivElement>(null);
  const { ref: mediaRef, entered: playing, armed } = useEnterOnScroll<HTMLDivElement>();

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
  }, [mediaRef]);

  // The tidy side: numbered sections and their renamed files, row by row so
  // the cascade delays stay explicit.
  let row = 0;
  const nextRow = () => `og-r${++row}`;

  return (
    <>
      <style>{OG_CSS}</style>
      <div
        className={`og-media${armed ? " og-armed" : ""}${playing ? " og-in" : ""}`}
        ref={mediaRef}
      >
        <div className="og-fit">
          <div className="og-stage" ref={stageRef}>
            <div className="og-blob" />

            {/* A · Le vrac : les fichiers tels qu'ils arrivent */}
            {MESSY.map(([label, kind, left, top, rot], i) => (
              <div
                key={label}
                className={`og-chip og-c${i + 1}`}
                style={{ left, top, transform: `rotate(${rot}deg)`, "--rot": `${rot}deg` } as CSSProperties}
              >
                <span className={`og-fico ${kind}`}>{kind === "xlsx" ? "X" : kind === "csv" ? "CSV" : ""}</span>
                <span className="name">{label}</span>
              </div>
            ))}

            {/* B · La transformation : flèche + étincelle Ora */}
            <svg className="og-arrow" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path className="og-arrowline" d="M8 86 C 40 96, 78 84, 104 62" fill="none" stroke="currentColor"
                strokeWidth="7" strokeLinecap="round" strokeDasharray="150" />
              <path d="M104 62 l-20 -1 m20 1 l-9 18" fill="none" stroke="currentColor"
                strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="og-spark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
              </svg>
            </span>

            {/* C · Le dossier client rangé */}
            <div className="og-win">
              <div className="og-titlebar">
                <div className="og-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="og-tbtitle">{t({ fr: "Dossiers clients · Ora", en: "Client folders · Ora" })}</div>
              </div>
              <div className="og-body">
                <div className="og-client">
                  <span style={{ color: "#3b82f6" }}><FolderIcon size={40} /></span>
                  <span className="t">Financière Arceau</span>
                </div>

                <div className={`og-sec ${nextRow()}`}>
                  <FolderIcon />{t({ fr: "01 · Factures fournisseurs", en: "01 · Supplier invoices" })}
                </div>
                <div className={`og-file ${nextRow()}`}>
                  <FileIcon />2026-01_Facture_Sogedis.pdf<span className="ck"><Check /></span>
                </div>
                <div className={`og-file ${nextRow()}`}>
                  <FileIcon />2026-02_Facture_Provence_Mat.pdf<span className="ck"><Check /></span>
                </div>

                <div className={`og-sec ${nextRow()}`}>
                  <FolderIcon />{t({ fr: "02 · Relevés bancaires", en: "02 · Bank statements" })}
                </div>
                <div className={`og-file ${nextRow()}`}>
                  <FileIcon />{t({ fr: "2026-03_Releve_mars.xlsx", en: "2026-03_Statement_march.xlsx" })}<span className="ck"><Check /></span>
                </div>

                <div className={`og-sec ${nextRow()}`}>
                  <FolderIcon />{t({ fr: "03 · Pièces diverses", en: "03 · Other documents" })}
                </div>
                <div className={`og-file ${nextRow()}`}>
                  <FileIcon />{t({ fr: "2026-02_PV_assemblée.pdf", en: "2026-02_Board_minutes.pdf" })}<span className="ck"><Check /></span>
                </div>

                <div className={`og-sec ${nextRow()}`}>
                  <FolderIcon />{t({ fr: "04 · Contrats", en: "04 · Contracts" })}
                </div>
                <div className={`og-file ${nextRow()}`}>
                  <FileIcon />{t({ fr: "2026-01_Contrat_de_prêt.pdf", en: "2026-01_Loan_agreement.pdf" })}<span className="ck"><Check /></span>
                </div>
              </div>
            </div>

            {/* D · Pastille de résultat */}
            <div className="og-tally">
              <span className="ck">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <div>
                <div className="t1">{t({ fr: "27 fichiers classés", en: "27 files organized" })}</div>
                <div className="t2">{t({ fr: "Renommés, datés, rangés au bon endroit", en: "Renamed, dated, filed where they belong" })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
