import { useEffect, useRef } from "react";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * FormatageMockup — visual for the "Formatage pour logiciel métier" use-case
 * card (client brief, 2026-07-27): a BEFORE / AFTER of the same file.
 *
 *   · left  : the raw export as it comes out — mixed date formats, amounts
 *     with currency symbols and comma decimals, columns in the wrong order,
 *     a stray empty column. The offending cells are flagged in amber.
 *   · right : the same data rewritten to the import template — one date
 *     format, plain numbers, the expected column order. All green.
 *   · between: the Ora badge doing the rewrite.
 *   · below : the payoff pill, "Prêt à importer · 0 ligne rejetée".
 *
 * Deliberately GENERIC about the destination software (client decision): no
 * brand name and no third-party logo appears, only "votre logiciel métier".
 *
 * Same fixed-stage pattern as the other Ora mockups (1040×580 scaled by a
 * ResizeObserver, `.fm-` scoped classes) and the same staged entrance.
 */

/** Raw rows: [libellé, date, montant] — the shapes a real export comes in. */
const RAW = [
  ["Vente Arvex", "12/03/25", "1 234,50 €"],
  ["Achat Delcourt", "2025-03-14", "876,00 EUR"],
  ["Banque BNP", "14 mars 2025", "-2 410,80 €"],
  ["Vente Méridian", "03/15/2025", "5 900,00 €"],
];

/** Formatted rows: [journal, date, compte, montant] — the import template. */
const FMT = [
  ["VE", "20250312", "411000", "1234.50"],
  ["AC", "20250314", "401000", "876.00"],
  ["BQ", "20250314", "512000", "-2410.80"],
  ["VE", "20250315", "411000", "5900.00"],
];

const FM_CSS = `
/* ══ Visuel « Formatage pour logiciel métier » — avant / après ══ */
/* v2 (client 2026-07-28) : composition DIAGONALE pour se démarquer du visuel
   Pointage (qui est symétrique côte à côte). Les deux panneaux sont plus
   grands, légèrement inclinés et décalés en escalier ; derrière eux, une
   large BANDE diagonale (le « convoyeur » du formatage) remplace le rond.
   Transparent : la composition flotte sur l'indigo de la carte. Pas
   d'overflow:hidden : il trancherait les ombres au bord de la zone média.
   C'est la CARTE qui rogne proprement en bas. */
.fm-media{position:relative;aspect-ratio:1040/580;isolation:isolate;background:transparent}
.fm-fit{position:absolute;inset:0;z-index:1}
.fm-stage{position:absolute;left:50%;top:0;width:1040px;height:580px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}

/* ── Bande diagonale : le fichier « glisse » du brut vers le conforme ── */
.fm-band{position:absolute;z-index:0;left:-90px;top:168px;width:1240px;height:244px;
  border-radius:999px;transform:rotate(-7deg);transform-origin:left center;
  background:linear-gradient(90deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.20) 52%,rgba(255,255,255,.07) 100%)}
.fm-band.echo{top:118px;height:344px;background:none;
  border:1.5px solid rgba(255,255,255,.16)}

/* ── Panneaux (plus grands qu'en v1 : 448px, lignes de 46px) ── */
.fm-panel{position:absolute;z-index:2;width:448px;
  background:#fff;border-radius:16px;overflow:hidden;
  box-shadow:0 2px 6px rgba(15,23,42,.16),0 30px 66px -22px rgba(15,23,42,.52)}
.fm-panel.before{left:18px;top:58px;transform:rotate(-1.8deg)}
.fm-panel.after{left:574px;top:178px;transform:rotate(1.4deg)}
.fm-head{display:flex;align-items:center;gap:10px;padding:14px 17px;border-bottom:1px solid #f1f3f7}
.fm-head .ic{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;flex-shrink:0}
.fm-head .ic.amber{background:#fef3c7;color:#b45309}
.fm-head .ic.green{background:#ecfdf5;color:#059669}
.fm-head .t1{font-size:13.5px;font-weight:700;line-height:1.2}
.fm-head .t2{font-size:10.5px;color:#9ca3af;margin-top:2px}
.fm-tag{margin-left:auto;flex-shrink:0;font-size:9.5px;font-weight:800;letter-spacing:.05em;
  border-radius:6px;padding:3px 8px}
.fm-tag.amber{background:#fef3c7;color:#b45309}
.fm-tag.green{background:#d1fae5;color:#047857}

.fm-cols{display:grid;font-size:9.5px;font-weight:800;letter-spacing:.06em;
  text-transform:uppercase;color:#9ca3af;padding:10px 17px 7px}
.fm-row{display:grid;align-items:center;height:46px;padding:0 17px;
  border-top:1px solid #f4f5f8;font-size:12.5px}
.fm-b .fm-cols,.fm-b .fm-row{grid-template-columns:1.35fr 1fr .95fr}
.fm-a .fm-cols,.fm-a .fm-row{grid-template-columns:.5fr 1fr .85fr .9fr}
.fm-row span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fm-row .num{text-align:right;font-variant-numeric:tabular-nums}
/* cellules non conformes */
.fm-bad{display:inline-block;background:#fffbeb;color:#b45309;font-weight:700;
  border-radius:4px;padding:2px 6px;margin:-2px -6px}
.fm-ok{color:#111827;font-weight:600;font-variant-numeric:tabular-nums}

/* ── Badge de transformation, posé sur la bande entre les panneaux ── */
.fm-mid{position:absolute;z-index:4;left:498px;top:312px;transform:translate(-50%,-50%)}
.fm-chip{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;
  border-radius:13px;background:#fff;font-size:13.5px;font-weight:700;color:#12336b;
  white-space:nowrap;box-shadow:0 12px 30px -10px rgba(15,23,42,.55)}
/* Encre du badge alignée sur le bleu du mur (palette à deux couleurs du
   2026-08-05), après un aller-retour par le navy puis le teal. */
.fm-chip .sw{color:#2969df}

/* ── Pastille de résultat ── */
.fm-pill{position:absolute;z-index:5;left:28px;bottom:22px;
  display:flex;align-items:center;gap:11px;background:#fff;border-radius:14px;
  padding:12px 16px;box-shadow:0 16px 40px -14px rgba(15,23,42,.5)}
.fm-pill .ic{width:32px;height:32px;border-radius:10px;flex-shrink:0;
  background:#ecfdf5;color:#059669;display:grid;place-items:center}
.fm-pill .t1{font-size:13px;font-weight:700;color:#111827;white-space:nowrap}
.fm-pill .t2{font-size:10.5px;color:#6b7280;margin-top:2px;white-space:nowrap}

/* ══ Arrivée au scroll ══ */
.fm-armed .fm-band,.fm-armed .fm-panel,.fm-armed .fm-mid,.fm-armed .fm-pill{opacity:0}

@keyframes fmBand{from{opacity:0;transform:rotate(-7deg) scaleX(.72)}
  to{opacity:1;transform:rotate(-7deg) scaleX(1)}}
@keyframes fmLeft{from{opacity:0;transform:translate3d(-38px,14px,0) rotate(-1.8deg)}
  to{opacity:1;transform:translate3d(0,0,0) rotate(-1.8deg)}}
@keyframes fmRight{from{opacity:0;transform:translate3d(38px,14px,0) rotate(1.4deg)}
  to{opacity:1;transform:translate3d(0,0,0) rotate(1.4deg)}}
@keyframes fmMid{from{opacity:0;transform:translate(-50%,-50%) scale(.82)}
  to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes fmUp{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}

.fm-in .fm-band{animation:fmBand 700ms cubic-bezier(.22,1,.36,1) 0ms both}
.fm-in .fm-panel.before{animation:fmLeft 740ms cubic-bezier(.22,1,.36,1) 140ms both}
.fm-in .fm-mid{animation:fmMid 620ms cubic-bezier(.2,1.5,.4,1) 420ms both}
.fm-in .fm-panel.after{animation:fmRight 740ms cubic-bezier(.22,1,.36,1) 640ms both}
.fm-in .fm-pill{animation:fmUp 600ms cubic-bezier(.2,1.4,.4,1) 1040ms both}

@media (prefers-reduced-motion:reduce){
  .fm-armed .fm-band,.fm-armed .fm-panel,.fm-armed .fm-mid,.fm-armed .fm-pill{opacity:1}
}
`;

export default function FormatageMockup() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { ref: mediaRef, entered: playing, armed } = useEnterOnScroll<HTMLDivElement>();

  useEffect(() => {
    const media = mediaRef.current;
    const stage = stageRef.current;
    if (!media || !stage) return;
    const W = 1040, H = 580;
    const fit = () => {
      const s = Math.min(media.clientWidth / W, media.clientHeight / H);
      stage.style.transform = `translateX(-50%) scale(${s})`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(media);
    fit();
    return () => ro.disconnect();
  }, [mediaRef]);

  return (
    <>
      <style>{FM_CSS}</style>
      <div
        className={`fm-media${armed ? " fm-armed" : ""}${playing ? " fm-in" : ""}`}
        ref={mediaRef}
      >
        <div className="fm-fit">
          <div className="fm-stage" ref={stageRef}>
            {/* La bande diagonale + son écho en filigrane */}
            <div className="fm-band" />
            <div className="fm-band echo" />

            {/* ── AVANT : l'export brut ── */}
            <div className="fm-panel before fm-b">
              <div className="fm-head">
                <span className="ic amber">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                </span>
                <div>
                  <div className="t1">Votre export brut</div>
                  <div className="t2">export_mars.xlsx</div>
                </div>
                <span className="fm-tag amber">Non conforme</span>
              </div>
              <div className="fm-cols"><span>Libellé</span><span>Date</span><span className="num">Montant</span></div>
              {RAW.map(([lib, date, mnt]) => (
                <div className="fm-row" key={lib}>
                  <span>{lib}</span>
                  <span><i className="fm-bad">{date}</i></span>
                  <span className="num"><i className="fm-bad">{mnt}</i></span>
                </div>
              ))}
            </div>

            {/* ── Le moteur de formatage : la pastille posée sur la bande,
                entre les deux panneaux, porte seule le sens du passage ── */}
            <div className="fm-mid">
              <span className="fm-chip">
                <svg className="sw" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                Mise au format
              </span>
            </div>

            {/* ── APRÈS : au format attendu ── */}
            <div className="fm-panel after fm-a">
              <div className="fm-head">
                <span className="ic green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <div>
                  <div className="t1">Prêt pour l'import</div>
                  <div className="t2">export_mars_formate.txt</div>
                </div>
                <span className="fm-tag green">Conforme</span>
              </div>
              <div className="fm-cols"><span>Jal</span><span>Date</span><span>Compte</span><span className="num">Montant</span></div>
              {FMT.map(([jal, date, cpt, mnt]) => (
                <div className="fm-row" key={date + cpt}>
                  <span className="fm-ok">{jal}</span>
                  <span className="fm-ok">{date}</span>
                  <span className="fm-ok">{cpt}</span>
                  <span className="num fm-ok">{mnt}</span>
                </div>
              ))}
            </div>

            {/* ── Résultat ── */}
            <div className="fm-pill">
              <span className="ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <div>
                <div className="t1">Prêt à importer</div>
                <div className="t2">Colonnes, dates et séparateurs alignés · 0 ligne rejetée</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
