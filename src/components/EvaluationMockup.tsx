import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * EvaluationMockup — visuel de la carte « Évaluation financière », v2 (client
 * 2026-08-04 : même traitement que « Prévisionnel », à savoir le langage de
 * l'écran d'accueil de l'app plutôt qu'une scène composée).
 *
 * La v1 empilait un panneau de comparables, une chip « EBE retraité », une
 * fenêtre de valorisation et un tag PDF : trop d'éléments flottants, jugé
 * « AI generated ». La v2 ne montre qu'UNE fenêtre de l'app :
 *   · bandeau « Accès rapide » et deux tuiles au format exact du logiciel
 *     (Évaluation d'entreprise, sélectionnée, et Comparables secteur) ;
 *   · dessous, le livrable : la valorisation, sa fourchette sur une jauge fine,
 *     et les deux méthodes retenues, cochées.
 * Aucun élément hors de la fenêtre.
 *
 * Même patron que les autres visuels : scène 1040×640 mise à l'échelle par un
 * ResizeObserver, classes `.ev-` scopées, aucune ressource externe, entrée
 * one-shot via useEnterOnScroll, désactivée en mouvement réduit.
 */

const EV_CSS = `
/* ══ Visuel « Évaluation financière » — écran d'accueil, module lancé ══ */
.ev-media{position:relative;aspect-ratio:1040/640;isolation:isolate;background:transparent}
.ev-fit{position:absolute;inset:0;z-index:1}
.ev-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}

/* ── Fenêtre de l'app ── */
/* Débord volontaire sous la ligne de coupe (640), voir PrevisionnelMockup. */
.ev-win{position:absolute;left:80px;top:64px;width:880px;height:600px;
  background:#fafbfd;border-radius:16px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.16),0 26px 70px -20px rgba(15,23,42,.34)}
.ev-titlebar{position:relative;display:flex;align-items:center;height:44px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e8e8e5}
.ev-lights{display:flex;gap:8px;padding-left:16px}
.ev-lights span{width:12px;height:12px;border-radius:50%}
.ev-lights .r{background:#ff5f57}.ev-lights .y{background:#febc2e}.ev-lights .g{background:#28c840}
.ev-tbtitle{position:absolute;left:0;right:0;text-align:center;font-size:14px;font-weight:600;color:#6b7280}
.ev-body{padding:26px 28px}

.ev-kicker{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#9ca3af}

/* ── Tuiles « Accès rapide », format du logiciel ── */
.ev-tiles{display:flex;gap:16px;margin-top:12px}
.ev-tile{flex:1;display:flex;align-items:center;gap:14px;background:#fff;
  border:1px solid #eceef2;border-radius:16px;padding:18px;
  box-shadow:0 1px 2px rgba(15,23,42,.04)}
.ev-tile.on{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.35),0 10px 26px -12px rgba(37,99,235,.5)}
.ev-tico{width:46px;height:46px;border-radius:13px;flex-shrink:0;display:grid;place-items:center}
.ev-tico.violet{background:#f5f3ff;color:#7c3aed}
.ev-tico.sky{background:#eff6ff;color:#2563eb}
/* Libellé porteur n°1 : 21px dans le repère 1040 → ≥ 11px sur mobile. */
.ev-tile .t1{font-size:21px;font-weight:700;letter-spacing:-.01em;color:#111827;white-space:nowrap}
.ev-tile .t2{font-size:14.5px;color:#9ca3af;margin-top:3px;white-space:nowrap}
.ev-tarrow{margin-left:auto;color:#d1d5db;flex-shrink:0}

/* ── Le livrable : la valorisation et sa fourchette ── */
.ev-out{margin-top:22px;background:#fff;border:1px solid #eceef2;border-radius:16px;
  padding:18px 20px 20px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.ev-outhead{display:flex;align-items:center;gap:11px}
.ev-pico{width:26px;height:30px;border-radius:5px;background:#dc2626;color:#fff;flex-shrink:0;
  display:grid;place-items:center;font-size:10px;font-weight:800;letter-spacing:.02em}
.ev-fname{font-size:15.5px;font-weight:700;color:#111827;white-space:nowrap}
.ev-fmeta{font-size:12.5px;color:#9ca3af;margin-top:1px;white-space:nowrap}
.ev-auto{margin-left:auto;display:inline-flex;align-items:center;gap:7px;
  font-size:12.5px;font-weight:700;color:#059669;background:#ecfdf5;
  border-radius:999px;padding:5px 11px;white-space:nowrap}
.ev-auto .dot{width:6px;height:6px;border-radius:50%;background:#10b981}
/* Libellé porteur n°2 : 44px → ≥ 12px sur mobile. */
.ev-val{font-size:44px;font-weight:700;letter-spacing:-.03em;margin-top:16px;white-space:nowrap;
  background:linear-gradient(to right,#3b82f6,#0d9488);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.ev-vlbl{font-size:13.5px;color:#6b7280;margin-top:-2px;white-space:nowrap}

/* Jauge de fourchette, trait fin */
.ev-gauge{position:relative;height:7px;border-radius:999px;background:#eef2f7;margin-top:20px}
.ev-fill{position:absolute;left:22%;right:22%;top:0;bottom:0;border-radius:999px;
  background:linear-gradient(to right,#3b82f6,#0d9488);transform-origin:left center}
.ev-marker{position:absolute;left:50%;top:50%;width:15px;height:15px;margin:-7.5px 0 0 -7.5px;
  border-radius:50%;background:#fff;border:3px solid #0d9488;
  box-shadow:0 3px 8px rgba(15,23,42,.22)}
.ev-bounds{display:flex;justify-content:space-between;margin-top:9px}
.ev-bounds span{font-size:12.5px;font-weight:600;color:#9aa7b8}

/* Méthodes retenues, EMPILÉES : deux lignes cochées se lisent comme une
   check-list, et la composition remplit la fenêtre jusqu'à la ligne de coupe
   au lieu de laisser une bande blanche vide en bas. */
.ev-methods{display:flex;flex-direction:column;gap:8px;margin-top:20px}
.ev-mrow{display:flex;align-items:center;gap:8px;background:#f8fafc;
  border-radius:11px;padding:9px 12px;font-size:13.5px;font-weight:600;color:#334155;white-space:nowrap}
.ev-mrow .ck{width:18px;height:18px;border-radius:50%;background:#d1fae5;color:#059669;
  display:grid;place-items:center;flex-shrink:0}

/* ══ Arrivée au scroll ══ */
.ev-armed .ev-win{opacity:0}
.ev-armed .ev-tile,.ev-armed .ev-out{opacity:0}
.ev-armed .ev-fill{transform:scaleX(0)}
.ev-armed .ev-marker,.ev-armed .ev-mrow{opacity:0}

@keyframes evUp{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:none}}
@keyframes evPop{0%{opacity:0;transform:scale(.5)}60%{opacity:1;transform:scale(1.1)}
  100%{opacity:1;transform:scale(1)}}
@keyframes evGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes evFade{to{opacity:1}}

.ev-in .ev-win{animation:evUp 680ms cubic-bezier(.22,1,.36,1) 60ms both}
.ev-in .ev-tile{animation:evUp 520ms cubic-bezier(.22,1,.36,1) both}
.ev-in .ev-tile.t-a{animation-delay:320ms}
.ev-in .ev-tile.t-b{animation-delay:410ms}
.ev-in .ev-out{animation:evUp 560ms cubic-bezier(.22,1,.36,1) 560ms both}
.ev-in .ev-fill{animation:evGrow 700ms cubic-bezier(.22,1,.36,1) 860ms both}
.ev-in .ev-marker{animation:evPop 420ms cubic-bezier(.2,1.5,.4,1) 1320ms both}
.ev-in .ev-mrow{animation:evFade 420ms ease both}
.ev-in .ev-mrow.m1{animation-delay:1180ms}
.ev-in .ev-mrow.m2{animation-delay:1260ms}

@media (prefers-reduced-motion:reduce){
  .ev-armed .ev-win,.ev-armed .ev-tile,.ev-armed .ev-out,
  .ev-armed .ev-marker,.ev-armed .ev-mrow{opacity:1}
  .ev-armed .ev-fill{transform:none}
}
`;

function TileArrow() {
  return (
    <svg className="ev-tarrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function EvaluationMockup() {
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

  return (
    <>
      <style>{EV_CSS}</style>
      <div className={`ev-media${armed ? " ev-armed" : ""}${playing ? " ev-in" : ""}`} ref={mediaRef}>
        <div className="ev-fit">
          <div className="ev-stage" ref={stageRef}>
            <div className="ev-win">
              <div className="ev-titlebar">
                <div className="ev-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="ev-tbtitle">Ora</div>
              </div>
              <div className="ev-body">
                <div className="ev-kicker">{t({ fr: "Accès rapide", en: "Quick access" })}</div>

                <div className="ev-tiles">
                  <div className="ev-tile t-a on">
                    <span className="ev-tico violet">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v18M6 7h12M4.5 7 2 14h5zM19.5 7 17 14h5z" />
                        <path d="M2 14a3.5 3.5 0 0 0 5 0M17 14a3.5 3.5 0 0 0 5 0M8 21h8" />
                      </svg>
                    </span>
                    <div>
                      <div className="t1">{t({ fr: "Évaluation d'entreprise", en: "Business valuation" })}</div>
                      <div className="t2">{t({ fr: "Fourchette argumentée", en: "Reasoned range" })}</div>
                    </div>
                    <TileArrow />
                  </div>
                  <div className="ev-tile t-b">
                    <span className="ev-tico sky">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 3v18h18" /><rect x="7" y="11" width="3.2" height="6" rx="1" />
                        <rect x="13" y="7" width="3.2" height="10" rx="1" />
                      </svg>
                    </span>
                    <div>
                      <div className="t1">{t({ fr: "Comparables secteur", en: "Sector comparables" })}</div>
                      <div className="t2">{t({ fr: "Multiples de transactions", en: "Transaction multiples" })}</div>
                    </div>
                    <TileArrow />
                  </div>
                </div>

                <div className="ev-out">
                  <div className="ev-outhead">
                    <span className="ev-pico">PDF</span>
                    <div>
                      <div className="ev-fname">Note_valorisation.pdf</div>
                      <div className="ev-fmeta">{t({ fr: "Multiple d'EBE × comparables", en: "EBITDA multiple × comparables" })}</div>
                    </div>
                    <span className="ev-auto"><span className="dot" />{t({ fr: "Automatisé", en: "Automated" })}</span>
                  </div>

                  <div className="ev-val">{t({ fr: "4,6 M€", en: "4.6 M€" })}</div>
                  <div className="ev-vlbl">{t({ fr: "Valorisation retenue", en: "Retained valuation" })}</div>

                  <div className="ev-gauge">
                    <div className="ev-fill" />
                    <div className="ev-marker" />
                  </div>
                  <div className="ev-bounds">
                    <span>{t({ fr: "4,3 M€", en: "4.3 M€" })}</span>
                    <span>{t({ fr: "4,9 M€", en: "4.9 M€" })}</span>
                  </div>

                  <div className="ev-methods">
                    <div className="ev-mrow m1">
                      <span className="ck"><Check /></span>
                      {t({ fr: "Multiple d'EBE · ×5,1", en: "EBITDA multiple · ×5.1" })}
                    </div>
                    <div className="ev-mrow m2">
                      <span className="ck"><Check /></span>
                      {t({ fr: "3 comparables du secteur", en: "3 sector comparables" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
