import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * OraHeroDemo — scroll-driven product demo in the hero (Bending-Spoons style).
 * A tall wrapper pins a full-viewport scene; the scroll progress scrubs the
 * app's REAL journey, replicated from actual screenshots of Ora and of the
 * real Excel side-by-side layout (v2 flow, 2026-07-20 — the longer v1
 * login→accueil flow lives in git history and in memory):
 *
 *   1. Excel — the real FEC workbook alone, centred, with an « Ora » tab in
 *      the ribbon (replica of the real Excel add-in). The cursor clicks it.
 *   2. Dual view — the Ora panel docks on the right, Excel slides left:
 *      straight onto the automation page, no login/onboarding.
 *   3. « Lancer » on FEC Studio → the real config MODAL opens (MISSION seuil,
 *      CONTRÔLES, BALANCES toggles) — the cursor flips three toggles then
 *      clicks « Lancer maintenant »
 *   4. The JOURNAL logs the run; the loading card flips to a green-check
 *      success; the FEC workbook is replaced by the generated audit workbook,
 *      and the cursor browses its SHEET TABS.
 *
 * Brand marks use the real logo assets from /public/logos. Cursor click
 * targets are MEASURED at runtime (offsetLeft chains) so the tip lands
 * exactly on buttons/toggles/tabs. Imperative scrub: one
 * `scrollYProgress.on("change")` writes every style. Classes are prefixed
 * `.hd-`. prefers-reduced-motion → final state. Swap back to <OraGallery>
 * for the 6-video carousel when the real clips arrive.
 */

interface OraHeroDemoProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

const W = 1040, H = 640;

const HD_CSS = `
/* ══ Hero scroll-demo — faithful Ora app + real Excel, scroll-driven ══ */
.hd-stagebox{position:relative;flex:1;min-height:0;width:100%}
.hd-stage{position:absolute;left:50%;top:50%;width:${W}px;height:${H}px;
  transform-origin:center center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.hd-blob{position:absolute;z-index:0;left:420px;top:70px;width:590px;height:590px;border-radius:50%;
  background:radial-gradient(circle at 38% 30%,#ffffff,#eef2fb 70%,#e0e7f6)}
.dark .hd-blob{background:radial-gradient(circle at 38% 30%,rgba(255,255,255,.10),rgba(255,255,255,.035) 60%,transparent 75%)}
/* ── macOS window chrome ── */
.hd-win{position:absolute;border-radius:12px;background:#fff;overflow:hidden;
  box-shadow:0 1px 2px rgba(15,23,42,.10),0 24px 60px -18px rgba(15,23,42,.28),0 60px 120px -40px rgba(15,23,42,.20)}
.dark .hd-win{box-shadow:0 1px 2px rgba(0,0,0,.45),0 30px 80px -20px rgba(0,0,0,.65),0 70px 150px -40px rgba(0,0,0,.55)}
.hd-titlebar{position:relative;display:flex;align-items:center;height:34px;flex-shrink:0;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e6e6e3}
.hd-lights{display:flex;gap:7px;padding:0 12px}
.hd-lights span{width:11px;height:11px;border-radius:50%}
.hd-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.hd-lights .y{background:#febc2e;border:.5px solid #d89c22}
.hd-lights .g{background:#28c840;border:.5px solid #1eaa33}
.hd-tbtitle{position:absolute;left:0;right:0;text-align:center;font-size:11.5px;font-weight:600;color:#4b5563}
/* ── Ora full window (login / welcome / accueil) ── */
.hd-app{display:flex;flex:1;min-height:0}
.hd-side{width:126px;flex-shrink:0;background:#fff;border-right:1px solid #eeedeb;
  display:flex;flex-direction:column;padding:12px 9px}
.hd-sidelogo{display:flex;align-items:center;padding:2px 4px 12px}
.hd-sidelogo img{height:22px;width:auto;display:block;margin-left:-2px}
.hd-sidelabel{font-size:8px;font-weight:700;letter-spacing:.09em;color:#9ca3af;text-transform:uppercase;padding:0 6px 7px}
.hd-sideitem{position:relative;display:flex;align-items:center;gap:8px;font-size:11px;font-weight:500;color:#4b5563;
  border-radius:8px;padding:7px 9px;margin-bottom:3px}
.hd-sideitem.on{background:#eaf1fe;color:#2563eb;font-weight:600}
.hd-sideitem.on::after{content:'';position:absolute;right:-9px;top:6px;bottom:6px;width:3px;border-radius:99px;background:#3b82f6}
.hd-sidecard{margin-top:auto;background:#fbfaf8;border:1px solid #eeedeb;border-radius:10px;padding:10px 9px;text-align:center}
.hd-sidecard .ic{width:20px;height:20px;margin:0 auto 6px;border-radius:6px;background:#eaf1fe;color:#3b82f6;display:grid;place-items:center}
.hd-sidecard .t{font-size:9px;font-weight:700;color:#111827}
.hd-sidecard .d{font-size:7.5px;line-height:1.4;color:#9ca3af;margin-top:3px}
.hd-content{position:relative;flex:1;min-width:0;background:#fcfbf7;display:flex;flex-direction:column}
.hd-topbar{display:flex;align-items:center;gap:6px;height:38px;flex-shrink:0;padding:0 14px;
  background:#fff;border-bottom:1px solid #f0efec}
.hd-pagetitle{font-size:12.5px;font-weight:700;color:#111827}
.hd-pills{margin-left:auto;display:flex;align-items:center;gap:6px}
.hd-pillbtn{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 9px;border:1px solid #e5e7eb;
  border-radius:99px;font-size:8.5px;font-weight:600;color:#374151;background:#fff}
.hd-pillbtn .n{display:inline-grid;place-items:center;min-width:12px;height:12px;border-radius:99px;
  background:#3b82f6;color:#fff;font-size:7px;font-weight:700;padding:0 3px}
.hd-avatar{width:20px;height:20px;border-radius:50%;background:#3b82f6;color:#fff;font-size:9px;font-weight:700;
  display:grid;place-items:center}
.hd-body{flex:1;min-height:0;padding:13px 16px;overflow:hidden}
.hd-h1{font-family:Poppins,'Inter',sans-serif;font-size:19px;font-weight:700;letter-spacing:-.02em;color:#111827}
.hd-date{font-size:9.5px;color:#6b7280;margin-top:2px}
.hd-banner{display:flex;align-items:center;gap:11px;background:#3b82f6;border-radius:13px;
  padding:12px 14px;margin-top:11px;box-shadow:0 8px 22px -10px rgba(59,130,246,.5)}
.hd-banner .ic{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.18);color:#fff;
  display:grid;place-items:center;flex-shrink:0}
.hd-banner .t{font-size:12px;font-weight:700;color:#fff}
.hd-banner .s{font-size:9px;color:rgba(255,255,255,.85);margin-top:2px}
.hd-banner .arrow{margin-left:auto;color:#fff}
.hd-seclabel{font-size:8px;font-weight:700;letter-spacing:.09em;color:#9ca3af;text-transform:uppercase;margin:12px 2px 7px}
.hd-quick{display:flex;gap:7px}
.hd-qcard{flex:1;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid #eeedeb;
  border-radius:11px;padding:9px 9px;min-width:0}
.hd-qcard .ic{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;flex-shrink:0}
.hd-qcard .ic.blue{background:#eaf1fe;color:#3b82f6}
.hd-qcard .ic.purple{background:#f3e8ff;color:#8b5cf6}
.hd-qcard .t{font-size:9px;font-weight:700;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-qcard .s{font-size:7.5px;color:#9ca3af;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-row{position:relative;display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #eeedeb;
  border-radius:11px;padding:9px 11px;margin-bottom:7px}
.hd-row .nm{font-size:10.5px;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-row .mt{font-size:8.5px;color:#9ca3af;margin-top:1px}
.hd-status{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:8px;font-weight:600;
  color:#4b5563;white-space:nowrap}
.hd-status .dot{width:5px;height:5px;border-radius:50%;background:#f59e0b}
.hd-fico{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;flex-shrink:0;font-size:7px;font-weight:800}
.hd-fico.x{background:#e7f6ef;color:#1d7044}
.hd-fico.t{background:#f3f4f6;color:#4b5563}
.hd-fico.p{background:#fdecec;color:#dc2626}
.hd-flash{position:absolute;inset:0;border-radius:11px;background:rgba(59,130,246,.12);
  box-shadow:inset 0 0 0 2px #3b82f6;pointer-events:none;opacity:0}
/* ── Docked Ora panel (right, dual view) ── */
.hd-panel{left:656px;top:16px;width:368px;height:608px;display:flex;flex-direction:column;opacity:0}
.hd-ptop{display:flex;align-items:center;height:30px;flex-shrink:0;padding:0 12px;background:#fff;border-bottom:1px solid #f0efec}
.hd-ptop .t{font-size:11px;font-weight:700}
.hd-pbody{flex:1;min-height:0;background:#fcfbf7;padding:10px 12px;overflow:hidden;position:relative}
.hd-tabsbar{display:flex;align-items:center;gap:5px;height:24px;flex-shrink:0;padding:0 12px;
  background:#fff;border-bottom:1px solid #f0efec}
.hd-tabslabel{font-size:6.5px;font-weight:700;letter-spacing:.09em;color:#9ca3af;text-transform:uppercase}
.hd-tab{display:inline-flex;align-items:center;gap:4px;height:16px;padding:0 6px;border-radius:6px;
  font-size:7.5px;font-weight:600;white-space:nowrap}
.hd-tab.on{background:#eaf1fe;border:1px solid #bfdbfe;color:#2563eb}
.hd-tab.off{color:#6b7280}
.hd-back{display:flex;align-items:center;gap:5px;font-size:9px;font-weight:600;color:#6b7280;margin-bottom:7px}
.hd-backicons{margin-left:auto;display:flex;gap:4px}
.hd-iconbtn{width:17px;height:17px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;color:#3b82f6;
  display:grid;place-items:center}
.hd-fileicons{margin-left:auto;display:flex;gap:4px}
.hd-rowactions{margin-left:auto;display:flex;align-items:center;gap:5px;flex-shrink:0}
.hd-rowactions .hd-lancer{margin-left:0}
.hd-star{color:#c6cbd3;display:grid;place-items:center}
.hd-filehead{display:flex;align-items:center;gap:8px}
.hd-filehead .nm{font-size:11px;font-weight:700;letter-spacing:-.01em;color:#111827}
.hd-filehead .mt{display:flex;align-items:center;gap:5px;font-size:8px;color:#9ca3af;margin-top:2px}
.hd-badge-todo{display:inline-flex;align-items:center;gap:3px;font-size:7.5px;font-weight:600;color:#4b5563;background:#f3f4f6;border-radius:99px;padding:1.5px 6px}
.hd-badge-todo .dot{width:4px;height:4px;border-radius:50%;background:#f59e0b}
.hd-badge-ok{display:inline-flex;align-items:center;gap:3px;font-size:7.5px;font-weight:700;color:#059669;
  background:#e7f6ef;border-radius:99px;padding:1.5px 6px}
.hd-sendrow{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #eeedeb;border-radius:10px;
  padding:6px 9px;margin-top:8px}
.hd-sendrow .lbl{font-size:8px;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-sendrow .lbl b{font-weight:700}
.hd-sendbtn{margin-left:auto;display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 9px;
  border-radius:7px;background:#3b82f6;color:#fff;font-size:8px;font-weight:700;flex-shrink:0;
  box-shadow:0 2px 8px rgba(59,130,246,.30)}
.hd-chips{display:flex;align-items:center;gap:3px;margin-top:8px;flex-wrap:nowrap}
.hd-chip{display:inline-flex;align-items:center;gap:3px;font-size:7px;font-weight:600;color:#4b5563;
  background:#fff;border:1px solid #e5e7eb;border-radius:99px;padding:3px 6px;white-space:nowrap}
.hd-chip .n{color:#9ca3af;font-weight:700}
.hd-search{display:flex;align-items:center;height:24px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;
  padding:0 8px;gap:6px;color:#9ca3af;font-size:8px;margin-top:7px}
.hd-sugglabel{display:flex;align-items:center;gap:4px;font-size:7px;font-weight:700;letter-spacing:.09em;
  color:#6b7280;text-transform:uppercase;margin:8px 2px 6px}
.hd-sugglabel svg{color:#3b82f6}
.hd-playic{width:19px;height:19px;border-radius:6px;border:1px solid;display:grid;place-items:center;flex-shrink:0}
.hd-playic.blue{border-color:#bfdbfe;color:#3b82f6;background:#fff}
.hd-playic.purple{border-color:#e9d5ff;color:#8b5cf6;background:#fff}
.hd-playic.green{border-color:#bbe7cf;color:#059669;background:#fff}
.hd-hero-sugg{position:relative;display:flex;align-items:center;gap:7px;background:#eff6ff;border:1px solid #bfdbfe;
  border-radius:10px;padding:6px 8px;margin-bottom:5px}
.hd-hero-sugg .t{font-size:8.5px;font-weight:700;color:#111827}
.hd-hero-sugg .r{font-size:7.5px;color:#6b7280;margin-top:1px}
.hd-sugg{position:relative;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid #eeedeb;
  border-radius:10px;padding:6px 8px;margin-bottom:5px}
.hd-sugg .t{font-size:8.5px;font-weight:700;color:#111827;display:flex;align-items:center;gap:4px}
.hd-sugg .d{font-size:7.5px;line-height:1.35;color:#6b7280;margin-top:1px}
.hd-tag{font-size:6px;font-weight:800;letter-spacing:.05em;border-radius:4px;padding:1px 4px}
.hd-tag.finance{background:#f3e8ff;color:#7c3aed}
.hd-tag.qualite{background:#e7f6ef;color:#059669}
.hd-tag.audit{background:#eaf1fe;color:#2563eb}
.hd-lancer{position:relative;display:inline-flex;align-items:center;gap:3px;font-size:7.5px;font-weight:700;
  border-radius:7px;padding:4px 8px;margin-left:auto;flex-shrink:0;white-space:nowrap;
  background:#3b82f6;color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.28)}
.hd-lancer .hd-flash{border-radius:7px}
.hd-journal{flex-shrink:0;border-top:1px solid #f0efec;background:#fff;padding:5px 12px 7px}
.hd-jhead{display:flex;align-items:center;gap:5px;font-size:7px;font-weight:700;letter-spacing:.09em;
  color:#6b7280;text-transform:uppercase}
.hd-jhead .st{font-weight:600;letter-spacing:0;text-transform:none;color:#9ca3af}
.hd-jhead .chev{margin-left:auto;color:#c6cbd3}
.hd-jlines{margin-top:3px}
.hd-jline{display:flex;align-items:center;gap:5px;font-size:7.5px;color:#374151;padding:1.5px 0;opacity:0}
.hd-jline svg{color:#059669;flex-shrink:0}
/* ── FEC Studio config modal (over the panel) ── */
.hd-modal{position:absolute;left:14px;right:14px;top:52px;z-index:7;background:#fff;border-radius:14px;
  box-shadow:0 24px 60px -18px rgba(15,23,42,.35);padding:12px 13px 11px;opacity:0;transform-origin:center 30%}
.hd-mhead{display:flex;align-items:flex-start;gap:8px}
.hd-mhead .ic{width:24px;height:24px;border-radius:8px;background:#eaf1fe;color:#3b82f6;display:grid;place-items:center;flex-shrink:0}
.hd-mhead .t{font-size:10px;font-weight:700;color:#111827}
.hd-mhead .s{font-size:7.5px;color:#6b7280;margin-top:1px}
.hd-mhead .x{margin-left:auto;color:#9ca3af;font-size:10px}
.hd-mprofiles{display:flex;gap:5px;margin-top:8px}
.hd-mprofile{display:inline-flex;align-items:center;gap:3px;font-size:7px;font-weight:600;color:#4b5563;
  border:1px solid #e5e7eb;border-radius:99px;padding:3px 7px}
.hd-mprofile.b{color:#3b82f6;border-color:#93c5fd;border-style:dashed}
.hd-msec{font-size:7px;font-weight:700;letter-spacing:.09em;color:#374151;text-transform:uppercase;
  margin:9px 0 5px;display:flex;align-items:center;gap:4px}
.hd-msec .link{margin-left:auto;color:#3b82f6;font-weight:600;letter-spacing:0;text-transform:none}
.hd-mfieldlabel{font-size:6.5px;font-weight:700;letter-spacing:.07em;color:#9ca3af;text-transform:uppercase;margin-bottom:3px}
.hd-minput{display:flex;align-items:center;height:22px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;
  padding:0 8px;font-size:7px;color:#9ca3af;white-space:nowrap;overflow:hidden}
.hd-minput .stp{margin-left:auto;color:#c6cbd3;flex-shrink:0;display:grid;place-items:center}
.hd-mrow{position:relative;display:flex;align-items:center;justify-content:space-between;padding:3.5px 0}
.hd-mrow .l{font-size:7.5px;font-weight:700;letter-spacing:.06em;color:#6b7280;text-transform:uppercase}
.hd-toggle{position:relative;width:26px;height:14px;border-radius:99px;background:#e5e7eb;flex-shrink:0}
.hd-toggle .track{position:absolute;inset:0;border-radius:99px;background:#3b82f6;opacity:0}
.hd-toggle .knob{position:absolute;left:2px;top:2px;width:10px;height:10px;border-radius:50%;background:#fff;
  box-shadow:0 1px 3px rgba(15,23,42,.25)}
.hd-mfoot{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:10px}
.hd-mcancel{font-size:8px;font-weight:600;color:#4b5563;border:1px solid #e5e7eb;border-radius:99px;padding:5px 10px}
.hd-mrun{position:relative;display:inline-flex;align-items:center;gap:4px;font-size:8px;font-weight:700;color:#fff;
  background:#3b82f6;border-radius:99px;padding:5px 11px;box-shadow:0 3px 10px rgba(59,130,246,.35)}
.hd-mrun .hd-flash{border-radius:99px}
/* ── Real Excel windows (left) ── */
.hd-xw{left:16px;top:30px;width:620px;height:580px;display:flex;flex-direction:column;opacity:0}
.hd-xtitle{display:flex;align-items:center;height:30px;flex-shrink:0;background:linear-gradient(#fbfbfa,#f4f4f3);
  border-bottom:1px solid #e6e6e3;padding:0 10px;gap:8px}
.hd-xtitle .hd-lights{padding:0}
.hd-xauto{display:flex;align-items:center;gap:4px;font-size:7px;color:#6b7280}
.hd-xauto .sw{width:16px;height:9px;border-radius:99px;background:#d1d5db;position:relative}
.hd-xauto .sw::after{content:'';position:absolute;left:1.5px;top:1.5px;width:6px;height:6px;border-radius:50%;background:#fff}
.hd-xname{position:absolute;left:0;right:0;text-align:center;font-size:10px;font-weight:600;color:#374151;pointer-events:none}
.hd-xribbontabs{display:flex;align-items:center;gap:11px;height:24px;flex-shrink:0;background:#fff;
  padding:0 12px;border-bottom:1px solid #ececec;font-size:8.5px;color:#4b5563}
.hd-xribbontabs .rt{padding:3px 0}
.hd-xribbontabs .rt.on{color:#217346;font-weight:700;box-shadow:inset 0 -2px 0 #217346}
.hd-xribbontabs .rt.ora{position:relative;display:inline-flex;align-items:center;gap:3px;color:#2563eb;font-weight:700}
.hd-xribbontabs .rt.ora .hd-flash{border-radius:5px;inset:-2px -4px}
.hd-xribbontabs .share{margin-left:auto;display:inline-flex;align-items:center;gap:3px;background:#217346;color:#fff;
  border-radius:6px;padding:2.5px 8px;font-size:7.5px;font-weight:700}
.hd-xribbontabs .comments{display:inline-flex;align-items:center;gap:3px;border:1px solid #e5e7eb;border-radius:6px;
  padding:2.5px 7px;font-size:7.5px;font-weight:600;color:#4b5563}
.hd-xribbon{display:flex;align-items:center;gap:10px;height:30px;flex-shrink:0;background:#fff;
  padding:0 12px;border-bottom:1px solid #e2e2e2;color:#6b7280}
.hd-xgroup{display:flex;align-items:center;gap:5px;font-size:6.5px;border-right:1px solid #efefef;padding-right:10px}
.hd-xgroup svg{color:#374151}
.hd-xfx{display:flex;align-items:center;height:22px;flex-shrink:0;border-bottom:1px solid #d7d7d7;
  font-size:9px;color:#3f3f3f;background:#fff}
.hd-xfx .nb{width:44px;text-align:center;border-right:1px solid #d7d7d7;font-weight:600;line-height:22px}
.hd-xfx .fx{width:22px;text-align:center;border-right:1px solid #d7d7d7;color:#9a9a9a;font-style:italic;
  font-family:Georgia,serif;line-height:22px}
.hd-xsheet{flex:1;min-height:0;overflow:hidden;background:#fff;position:relative}
.hd-xgrid{display:grid;font-size:8px;align-content:start}
.hd-xL{background:#f6f6f6;color:#7a7a7a;text-align:center;font-weight:600;padding:2.5px 0;
  border-right:1px solid #dedede;border-bottom:1px solid #d0d0d0;font-size:7.5px}
.hd-xN{background:#f6f6f6;color:#7a7a7a;text-align:center;font-weight:600;padding:4.5px 0;
  border-right:1px solid #dedede;border-bottom:1px solid #ededed;font-size:7.5px}
.hd-xH{background:#fff;color:#111;font-weight:700;padding:4.5px 5px;
  border-right:1px solid #ececec;border-bottom:1.5px solid #9a9a9a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xC{background:#fff;color:#333;padding:4.5px 5px;border-right:1px solid #ececec;border-bottom:1px solid #ececec;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xC.num{text-align:right;font-variant-numeric:tabular-nums}
.hd-xC.sel{box-shadow:inset 0 0 0 2px #217346}
.hd-xT{background:#f4f6f4;color:#111;font-weight:700;padding:4.5px 5px;border-right:1px solid #ececec;
  border-top:2px solid #217346;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xT.num{text-align:right;font-variant-numeric:tabular-nums}
.hd-xtabs{display:flex;align-items:center;height:22px;flex-shrink:0;background:#f7f7f7;border-top:1px solid #d7d7d7;
  padding:0 8px;gap:2px;font-size:8px;color:#4b5563}
.hd-xtab{position:relative;display:inline-flex;align-items:center;height:22px;padding:0 9px;white-space:nowrap}
.hd-xtab.on{background:#fff;font-weight:700;color:#217346;box-shadow:inset 0 2px 0 #217346}
.hd-xtabplus{margin-left:4px;color:#9ca3af}
.hd-xstatus{display:flex;align-items:center;height:18px;flex-shrink:0;background:#f7f7f7;border-top:1px solid #e2e2e2;
  padding:0 10px;font-size:7px;color:#6b7280}
.hd-xstatus .z{margin-left:auto}
.hd-xflash{position:absolute;inset:0;background:rgba(33,115,70,.12);box-shadow:inset 0 0 0 1.5px #217346;
  pointer-events:none;opacity:0}
/* ── Generated audit workbook (FEC Studio output): blue headers, title row,
     tighter rows, embedded chart sheet ── */
.hd-hidden{display:none!important}
.hd-xw2 .hd-xC,.hd-xw2 .hd-xN,.hd-xw2 .hd-xHb,.hd-xw2 .hd-xT{padding-top:3px;padding-bottom:3px;font-size:7.5px}
.hd-xw2 .hd-xtab{font-size:7px;padding:0 6px}
.hd-xTitle{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:4px 6px 4px 5px;
  font-weight:700;color:#111;font-size:9px;border-bottom:1px solid #ececec;white-space:nowrap;overflow:hidden}
.hd-xTitle .meta{font-weight:600;color:#8a8f98;font-size:7px;flex-shrink:0}
.hd-xHb{background:#4a86d6;color:#fff;font-weight:700;padding:4.5px 6px;
  border-right:1px solid #6ea0e0;border-bottom:1px solid #3a76c6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xHb.num{text-align:right}
/* Monthly sheet with an embedded bar chart */
.hd-xmonth{flex:1;min-height:0;padding:9px 11px;display:flex;flex-direction:column;background:#fff;overflow:hidden}
.hd-xmtitle{display:flex;align-items:baseline;justify-content:space-between;font-weight:700;font-size:9.5px;color:#111;margin-bottom:8px}
.hd-xmtitle .meta{font-weight:600;font-size:7px;color:#8a8f98}
.hd-xmbody{flex:1;min-height:0;display:flex;gap:12px}
.hd-xmtable{width:146px;flex-shrink:0;border:1px solid #e4e4e4;border-radius:2px;overflow:hidden;align-self:flex-start}
.hd-xmtable .r{display:grid;grid-template-columns:1fr 1fr 1fr;font-size:7px;border-bottom:1px solid #f1f1f1}
.hd-xmtable .r:last-child{border-bottom:none}
.hd-xmtable .r.h{background:#4a86d6;color:#fff;font-weight:700}
.hd-xmtable .r>span{padding:2.6px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xmtable .r>span.num{text-align:right;font-variant-numeric:tabular-nums}
.hd-xmchart{flex:1;min-width:0;border:1px solid #e4e4e4;border-radius:2px;padding:8px 12px 5px;display:flex;flex-direction:column}
.hd-xmchart .ct{font-size:8.5px;font-weight:700;color:#333;text-align:center;margin-bottom:5px}
.hd-xmchart svg{flex:1;width:100%;min-height:0}
.hd-xmleg{display:flex;justify-content:center;gap:14px;font-size:7px;color:#555;margin-top:4px}
.hd-xmleg i{display:inline-block;width:8px;height:8px;border-radius:1px;margin-right:4px;vertical-align:middle}
/* ── Loading popup (replica of the real app) + success recap ── */
.hd-loading{position:absolute;left:26px;right:26px;top:150px;z-index:8;background:#fff;border-radius:14px;
  box-shadow:0 24px 60px -18px rgba(15,23,42,.38);padding:16px 15px 12px;opacity:0;text-align:center;
  transform-origin:center center}
.hd-loading .icwrap{position:relative;width:34px;height:34px;margin:0 auto 9px}
.hd-loading .lg{position:absolute;inset:0}
.hd-loading .lg img{width:100%;height:100%;object-fit:contain;display:block}
.hd-loading .ok{position:absolute;inset:-1px;border-radius:50%;background:#22c55e;color:#fff;
  display:grid;place-items:center;opacity:0;box-shadow:0 4px 12px rgba(34,197,94,.45)}
.hd-loading .t{font-size:10.5px;font-weight:800;letter-spacing:-.01em;color:#111827}
.hd-loading .bar{margin-top:10px;height:6px;border-radius:99px;background:#e8f1fd;overflow:hidden}
.hd-loading .barfill{display:block;height:100%;border-radius:99px;background:#3b82f6;
  transform-origin:left center;transform:scaleX(0)}
.hd-loading .tip{font-size:7.5px;line-height:1.55;color:#9ca3af;margin-top:9px;padding:0 6px}
.hd-loading .cancel{display:inline-flex;align-items:center;gap:4px;font-size:8px;font-weight:600;color:#6b7280;margin-top:8px}
.hd-loading .done{display:none;margin:9px auto 0;width:fit-content;text-align:left}
.hd-loading .done .dl{display:flex;align-items:center;gap:5px;font-size:7.8px;font-weight:600;color:#374151;padding:2px 0}
.hd-loading .done .dl svg{color:#059669;flex-shrink:0}
/* ── Result arrival glow (makes the generated workbook POP) ── */
.hd-xwglow{position:absolute;inset:0;border-radius:12px;pointer-events:none;opacity:0;z-index:5;
  box-shadow:0 0 0 3px rgba(59,130,246,.55),0 0 46px 8px rgba(59,130,246,.35)}
/* ── generated-file pill / cursor / captions ── */
.hd-pill{position:absolute;left:460px;top:150px;z-index:8;display:flex;align-items:center;gap:8px;background:#fff;
  border-radius:11px;padding:8px 12px;box-shadow:0 12px 34px -10px rgba(15,23,42,.30);opacity:0}
.dark .hd-pill{box-shadow:0 12px 34px -10px rgba(0,0,0,.45)}
.hd-pill .fico{width:26px;height:26px;border-radius:7px;background:#e7f6ef;color:#1d7044;display:grid;place-items:center;
  font-size:8px;font-weight:800;flex-shrink:0}
.hd-pill .t1{font-size:10.5px;font-weight:700;color:#111827}
.hd-pill .t2{font-size:9px;color:#9ca3af;margin-top:1px}
.hd-cursor{position:absolute;z-index:12;left:0;top:0;width:52px;height:52px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.40))}
.hd-ripple{position:absolute;z-index:11;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:50%;
  border:2px solid #3b82f6;background:rgba(59,130,246,.18);opacity:0;pointer-events:none}
/* ── Immersive dark takeover at zoom moments ── */
.hd-sticky{transition:background-color .5s ease}
.hd-sticky.immersive{background-color:#070b14}
.hd-blob{transition:opacity .5s ease}
.hd-sticky.immersive .hd-blob{opacity:0}
.hd-sticky.immersive .hd-win{box-shadow:0 1px 2px rgba(0,0,0,.5),0 34px 90px -20px rgba(0,0,0,.75),0 80px 160px -40px rgba(0,0,0,.65)}
.hd-headline{transition:opacity .5s ease}
.hd-sticky.immersive .hd-headline{opacity:0!important}
.hd-cap>span{transition:color .5s ease,background-color .5s ease,box-shadow .5s ease}
.hd-sticky.immersive .hd-cap>span:first-child{background:rgba(255,255,255,.12);box-shadow:0 0 0 1px rgba(255,255,255,.22);color:#fff}
.hd-sticky.immersive .hd-cap>span:last-child{color:#d1d5db}
/* ── Persistent scroll cue: the demo is driven by scrolling, not clicks ── */
.hd-scrollcue{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;
  padding:7px 13px;border-radius:99px;background:rgba(17,24,39,.05);transition:background-color .5s ease}
.hd-scrollcue .chev{color:#6b7280;animation:hdCueBounce 1.4s ease-in-out infinite;transition:color .5s ease}
.hd-scrollcue .txt{font-size:11px;font-weight:600;color:#6b7280;transition:color .5s ease;white-space:nowrap}
.hd-scrollcue .track{display:block;width:110px;height:3px;border-radius:99px;background:rgba(17,24,39,.12);overflow:hidden;transition:background-color .5s ease}
.hd-scrollcue .fill{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#3b82f6,#0d9488);
  transform-origin:left center;transform:scaleX(0)}
@keyframes hdCueBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.hd-scrollcue .chev{animation:none}}
.hd-sticky.immersive .hd-scrollcue{background:rgba(255,255,255,.10)}
.hd-sticky.immersive .hd-scrollcue .chev,.hd-sticky.immersive .hd-scrollcue .txt{color:#cbd5e1}
.hd-sticky.immersive .hd-scrollcue .track{background:rgba(255,255,255,.15)}
.hd-cap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;opacity:0}
`;

// ── Real FEC data (from the actual demo workbook) ───────────────────────────
const FEC_COLS = ["JournalCode", "JournalLib", "EcritureNum", "EcritureDate", "CompteNum", "CompteLib", "PieceRef", "Debit", "Credit"];
const FEC_GRID = "22px .85fr .75fr .8fr .85fr .8fr 1.25fr .75fr .8fr .8fr";
const FEC_ROWS: string[][] = [
  ["VE", "Ventes", "00001", "20241104", "411000", "Clients", "FA0001", "3621,47", "0,00"],
  ["VE", "Ventes", "00001", "20241104", "707000", "Ventes de marchandises", "FA0001", "0,00", "3017,89"],
  ["VE", "Ventes", "00001", "20241104", "44571000", "TVA collectée", "FA0001", "0,00", "603,58"],
  ["BQ", "Banque", "00002", "20241215", "512000", "Banque", "FA0001", "3621,47", "0,00"],
  ["BQ", "Banque", "00002", "20241215", "411000", "Clients", "FA0001", "0,00", "3621,47"],
  ["VE", "Ventes", "00003", "20240324", "411000", "Clients", "FA0002", "3325,75", "0,00"],
  ["VE", "Ventes", "00003", "20240324", "707000", "Ventes de marchandises", "FA0002", "0,00", "2771,46"],
  ["VE", "Ventes", "00003", "20240324", "44571000", "TVA collectée", "FA0002", "0,00", "554,29"],
  ["VE", "Ventes", "00004", "20240219", "411000", "Clients", "FA0003", "384,92", "0,00"],
  ["VE", "Ventes", "00004", "20240219", "707000", "Ventes de marchandises", "FA0003", "0,00", "320,77"],
  ["VE", "Ventes", "00004", "20240219", "44571000", "TVA collectée", "FA0003", "0,00", "64,15"],
  ["BQ", "Banque", "00005", "20240315", "512000", "Banque", "FA0003", "384,92", "0,00"],
  ["BQ", "Banque", "00005", "20240315", "411000", "Clients", "FA0003", "0,00", "384,92"],
  ["VE", "Ventes", "00006", "20240417", "411000", "Clients", "FA0004", "361,01", "0,00"],
  ["VE", "Ventes", "00006", "20240417", "707000", "Ventes de marchandises", "FA0004", "0,00", "300,84"],
  ["VE", "Ventes", "00006", "20240417", "44571000", "TVA collectée", "FA0004", "0,00", "60,17"],
];

// ── Generated audit workbook sheets (real FEC Studio output) ────────────────
const BG_META = "FEC 2025 · 48 512 écritures";
const BG_COLS = ["Compte", "Intitulé", "Mouvements débit", "Mouvements crédit", "Solde débiteur", "Solde créditeur"];
const BG_ROWS: string[][] = [
  ["101000", "Capital social", "", "800 000,00", "", "800 000,00"],
  ["106100", "Réserve légale", "", "64 000,00", "", "64 000,00"],
  ["164000", "Emprunts auprès des établissements de crédit", "96 000,00", "380 000,00", "", "284 000,00"],
  ["211000", "Terrains", "120 000,00", "", "120 000,00", ""],
  ["213000", "Constructions", "486 000,00", "", "486 000,00", ""],
  ["281300", "Amortissements des constructions", "", "142 400,00", "", "142 400,00"],
  ["401000", "Fournisseurs", "842 310,45", "897 465,20", "", "55 154,75"],
  ["411000", "Clients", "1 264 890,30", "1 121 545,10", "143 345,20", ""],
  ["421000", "Personnel - rémunérations dues", "359 400,00", "389 350,00", "", "29 950,00"],
  ["431000", "Sécurité sociale", "268 015,00", "292 380,00", "", "24 365,00"],
  ["445660", "TVA déductible sur ABS", "98 764,10", "96 214,10", "2 550,00", ""],
  ["445710", "TVA collectée", "188 940,00", "204 148,00", "", "15 208,00"],
  ["512000", "Banque BNP Paribas", "1 087 620,15", "998 435,60", "89 184,55", ""],
  ["530000", "Caisse", "12 480,00", "11 940,00", "540,00", ""],
  ["601100", "Achats de marchandises", "486 220,00", "", "486 220,00", ""],
  ["613200", "Locations immobilières", "50 400,00", "", "50 400,00", ""],
  ["641100", "Salaires bruts", "459 000,00", "", "459 000,00", ""],
  ["645000", "Charges sociales", "192 780,00", "", "192 780,00", ""],
  ["661100", "Intérêts des emprunts", "14 820,00", "", "14 820,00", ""],
  ["706000", "Prestations de services", "", "598 400,00", "", "598 400,00"],
  ["707000", "Ventes de marchandises", "", "892 610,00", "", "892 610,00"],
];
const BG_TOTAL = ["", "TOTAUX", "6 027 439,00", "6 888 888,00", "2 044 839,75", "2 906 087,75"];

const BA_META = "au 31/12/2025";
const BA_COLS = ["Compte", "Client", "Total", "Non échu", "0-30 j", "31-60 j", "61-90 j", "> 90 j"];
const BA_ROWS: string[][] = [
  ["411DURA", "DURAND SAS", "28 800,00", "19 200,00", "9 600,00", "", "", ""],
  ["411MART", "MARTIN & CIE", "21 360,00", "21 360,00", "", "", "", ""],
  ["411PETI", "PETIT SARL", "14 880,00", "7 440,00", "", "7 440,00", "", ""],
  ["411LEGR", "LEGRAND SA", "9 120,00", "", "", "", "4 560,00", "4 560,00"],
  ["411BOIS", "BOISSEAU SARL", "6 200,00", "", "3 100,00", "3 100,00", "", ""],
  ["411HAVR", "TRANSPORTS DU HAVRE", "4 980,00", "4 980,00", "", "", "", ""],
];
const BA_TOTAL = ["", "TOTAUX", "85 340,00", "52 980,00", "12 700,00", "10 540,00", "4 560,00", "4 560,00"];

// Balance mensuelle — data behind the embedded bar chart (k€).
const BM_MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const BM_DEBIT = [512, 468, 534, 498, 546, 588, 452, 398, 610, 642, 574, 690];
const BM_CREDIT = [486, 502, 548, 472, 560, 572, 468, 412, 588, 620, 560, 672];
const BM_MAX = 720;

// JOURNAL lines during the FEC Studio run.
const J_LINES = [
  "Lecture du FEC : 398 412 lignes",
  "Contrôles de structure : 18/18 conformes",
  "Balance générale construite",
  "Balance âgée créances & dettes",
  "Classeur d'audit généré",
];

// 0→1 ramp of v across [a, b] (clamped).
const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// ── Heavy-scroll zones ──────────────────────────────────────────────────────
// [demo-space end, weight]: higher weight = more physical scroll is needed to
// cross that part of the demo, so key moments feel "heavy" (the user slows
// down on them) while transitions stay light.
const ZONES: { to: number; w: number }[] = [
  { to: 0.15, w: 0.8 },  // Excel alone, cursor heads to the Ora ribbon tab
  { to: 0.28, w: 2.2 },  // zoom on the cursor + Ora click + camera pull-back
  { to: 0.36, w: 1.2 },  // the panel docks, Excel slides left (« bam »)
  { to: 0.545, w: 0.6 }, // dual view settles (light)
  { to: 0.60, w: 2.2 },  // « Lancer » + the modal opens (zoom)
  { to: 0.71, w: 3.2 },  // the three toggles + « Lancer maintenant » (heaviest)
  { to: 0.84, w: 1.6 },  // journal run + loading card + green-check success
  { to: 0.90, w: 1.3 },  // workbook swap
  { to: 1.0, w: 1.8 },   // sheet browsing
];
const ZONE_TABLE = (() => {
  let from = 0, cum = 0;
  const rows = ZONES.map((z) => {
    const cost = (z.to - from) * z.w;
    const row = { from, to: z.to, cum0: cum, cost };
    cum += cost;
    from = z.to;
    return row;
  });
  return { rows, total: cum };
})();
// Maps RAW scroll progress (linear) to DEMO time (weighted).
const remap = (r: number) => {
  const target = Math.min(1, Math.max(0, r)) * ZONE_TABLE.total;
  for (const row of ZONE_TABLE.rows) {
    if (target <= row.cum0 + row.cost || row.to === 1) {
      const t = row.cost > 0 ? (target - row.cum0) / row.cost : 1;
      return row.from + (row.to - row.from) * Math.min(1, Math.max(0, t));
    }
  }
  return 1;
};
// Piecewise-linear keyframe interpolation.
const kf = (v: number, times: number[], vals: number[]) => {
  if (v <= times[0]) return vals[0];
  for (let i = 1; i < times.length; i++) {
    if (v <= times[i]) {
      const t = (v - times[i - 1]) / (times[i] - times[i - 1]);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * t;
    }
  }
  return vals[vals.length - 1];
};

// Simplified Excel ribbon groups (silhouette only, like the real ribbon).
function XRibbon() {
  return (
    <div className="hd-xribbon">
      {["Presse-papiers", "Police", "Alignement", "Numérique", "Cellules", "Édition"].map((g) => (
        <span key={g} className="hd-xgroup">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
          {g}
        </span>
      ))}
    </div>
  );
}

// Excel window chrome shared by both workbooks. `oraTarget` marks THIS
// window's « Ora » ribbon tab as the cursor's click target (excel1 only).
function XChrome({ name, cell, formula, oraTarget }: { name: string; cell: string; formula: string; oraTarget?: boolean }) {
  return (
    <>
      <div className="hd-xtitle">
        <div className="hd-lights"><span className="r" /><span className="y" /><span className="g" /></div>
        <span className="hd-xauto"><span className="sw" />Enregistrement automatique</span>
        <span className="hd-xname">{name}</span>
      </div>
      <div className="hd-xribbontabs">
        {["Accueil", "Insertion", "Mise en page", "Formules", "Données", "Révision", "Affichage"].map((rt, i) => (
          <span key={rt} className={`rt${i === 0 ? " on" : ""}`}>{rt}</span>
        ))}
        <span className="rt ora" {...(oraTarget ? { "data-cur": "oratab" } : {})}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
          Ora
          {oraTarget && <span className="hd-flash" data-hd="oratab-flash" />}
        </span>
        <span className="comments">Commentaires</span>
        <span className="share">Partager</span>
      </div>
      <XRibbon />
      <div className="hd-xfx">
        <span className="nb">{cell}</span>
        <span className="fx">fx</span>
        <span style={{ paddingLeft: 8, color: "#555", fontSize: 8.5 }}>{formula}</span>
      </div>
    </>
  );
}

// One sheet of the generated audit workbook: title row (bold + right meta),
// a blue header row (FEC Studio style), the data, then a TOTAUX row.
function TableSheet({
  sheet, hidden, title, meta, cols, rows, total, gridCols, firstNum,
}: {
  sheet: number; hidden?: boolean; title: string; meta: string;
  cols: string[]; rows: string[][]; total?: string[]; gridCols: string; firstNum: number;
}) {
  return (
    <div className={`hd-xgrid${hidden ? " hd-hidden" : ""}`} data-sheet={sheet} style={{ gridTemplateColumns: gridCols }}>
      <div className="hd-xL" />
      {cols.map((_, i) => <div key={`l${i}`} className="hd-xL">{String.fromCharCode(65 + i)}</div>)}
      <div className="hd-xN">1</div>
      <div className="hd-xTitle" style={{ gridColumn: `span ${cols.length}` }}>
        <span>{title}</span><span className="meta">{meta}</span>
      </div>
      <div className="hd-xN">2</div>
      {cols.map((h, i) => <div key={`h${i}`} className={`hd-xHb${i >= firstNum ? " num" : ""}`}>{h}</div>)}
      {rows.map((row, r) => (
        <div key={r} style={{ display: "contents" }}>
          <div className="hd-xN">{r + 3}</div>
          {row.map((cell, ci) => <div key={ci} className={`hd-xC${ci >= firstNum ? " num" : ""}`}>{cell}</div>)}
        </div>
      ))}
      {total && (
        <div style={{ display: "contents" }}>
          <div className="hd-xN">{rows.length + 3}</div>
          {total.map((cell, ci) => <div key={ci} className={`hd-xT${ci >= firstNum ? " num" : ""}`}>{cell}</div>)}
        </div>
      )}
    </div>
  );
}

export default function OraHeroDemo({ theme, openBooking }: OraHeroDemoProps) {
  const { t } = useLang();
  void theme;

  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const capsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const lastClickRef = useRef(-1);

  const fitScaleRef = useRef(1);
  const lastVRef = useRef(0);
  const applyRef = useRef<(v: number) => void>(() => {});
  // Cursor click targets, measured at runtime in STAGE coordinates.
  const targetsRef = useRef<Record<string, { x: number; y: number }>>({
    oratab: { x: 600, y: 96 }, lancerfec: { x: 940, y: 300 }, loadc: { x: 856, y: 330 },
    tg1: { x: 850, y: 330 }, tg2: { x: 850, y: 360 }, tg3: { x: 850, y: 390 },
    run: { x: 940, y: 470 }, tab2: { x: 180, y: 590 }, tab3: { x: 300, y: 590 },
    modalc: { x: 840, y: 320 }, result: { x: 326, y: 320 },
  });

  // Scroll scrub: 0 → 1 across the tall wrapper.
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const [reduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Fit the 1040×640 stage inside the box + measure the cursor's click targets.
  useEffect(() => {
    const box = boxRef.current, stage = stageRef.current;
    if (!box || !stage) return;
    const stagePos = (el: HTMLElement) => {
      let x = 0, y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== stage) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    const fit = () => {
      const s = Math.min(box.clientWidth / W, box.clientHeight / H);
      fitScaleRef.current = s;
      const next: Record<string, { x: number; y: number }> = { ...targetsRef.current };
      for (const key of Object.keys(next)) {
        const el = stage.querySelector<HTMLElement>(`[data-cur="${key}"]`);
        if (el) {
          const p = stagePos(el);
          next[key] = { x: p.x + el.offsetWidth / 2, y: p.y + el.offsetHeight / 2 };
        }
      }
      targetsRef.current = next;
      applyRef.current(lastVRef.current);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    fit();
    (document as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready?.then(() => fit());
    return () => ro.disconnect();
  }, []);

  // ── Imperative scrub: one subscription writes every element's style. ──
  useEffect(() => {
    const stage = stageRef.current, caps = capsRef.current, hint = hintRef.current, box = boxRef.current;
    if (!stage || !caps || !hint || !box) return;
    const q = (sel: string) => stage.querySelector<HTMLElement>(sel);
    const el = {
      oratabFlash: q('[data-hd="oratab-flash"]'), panel: q('[data-hd="panel"]'),
      fecFlash: q('[data-hd="fec-flash"]'),
      modal: q('[data-hd="modal"]'),
      runFlash: q('[data-hd="run-flash"]'),
      toggles: [1, 2, 3].map((i) => ({
        track: q(`[data-hd="tg${i}-track"]`), knob: q(`[data-hd="tg${i}-knob"]`),
      })),
      jstatus: q('[data-hd="jstatus"]'), jcount: q('[data-hd="jcount"]'),
      jlines: [...stage.querySelectorAll<HTMLElement>("[data-jline]")],
      excel1: q('[data-hd="excel1"]'), excel2: q('[data-hd="excel2"]'),
      loading: q('[data-hd="loading"]'), loadfill: q('[data-hd="loadfill"]'),
      loadlogo: q('[data-hd="loadlogo"]'), loadok: q('[data-hd="loadok"]'),
      loadtitle: q('[data-hd="loadtitle"]'), loadtip: q('[data-hd="loadtip"]'),
      loadcancel: q('[data-hd="loadcancel"]'), loaddone: q('[data-hd="loaddone"]'),
      xwglow: q('[data-hd="xwglow"]'),
      sheets: [...stage.querySelectorAll<HTMLElement>("[data-sheet]")],
      xtabs: [...stage.querySelectorAll<HTMLElement>("[data-xtab]")],
      pill: q('[data-hd="pill"]'),
      cursor: q('[data-hd="cursor"]'), ripple: q('[data-hd="ripple"]'),
      caps: [...caps.querySelectorAll<HTMLElement>(".hd-cap")],
      cuefill: hint.querySelector<HTMLElement>('[data-hd="cuefill"]'),
    };
    // Every click moment (progress time + target key) — drives the cursor
    // dip, the ripple pulse and the vibration feedback.
    const CLICKS: { t: number; k: string }[] = [
      { t: 0.20, k: "oratab" }, { t: 0.578, k: "lancerfec" },
      { t: 0.641, k: "tg1" }, { t: 0.658, k: "tg2" }, { t: 0.675, k: "tg3" },
      { t: 0.70, k: "run" }, { t: 0.935, k: "tab2" }, { t: 0.962, k: "tab3" },
    ];

    const apply = (vRaw: number) => {
      lastVRef.current = vRaw;
      // Heavy-scroll remap: raw scroll (linear) → demo time (weighted zones).
      const v = remap(vRaw);
      const T = targetsRef.current;
      // The stage slightly grows and the title-to-demo gap opens with scroll.
      const grow = 1 + 0.04 * seg(v, 0, 0.20);
      // Zoom 0 (×2.5): camera dives HARD on the cursor clicking the « Ora »
      // ribbon tab, then pulls back while the panel docks (the « bam » moment).
      const Z0 = 2.5;
      const zt0 = seg(v, 0.155, 0.19) * (1 - seg(v, 0.215, 0.27));
      // Camera zooms. Zoom 1 (×2.0): the FEC Studio moment — « Lancer » click
      // then the toggle run, focus FIXED on the modal centre (no side swing).
      // Zoom 2 (×1.32): the RESULT — engages as the audit workbook lands and
      // stays on for the sheet browsing, framed on the sheet + its tabs (the
      // ribbon may crop, the content is the star). Windows are disjoint.
      const Z1 = 2.0, Z2 = 1.2;
      const zt1 = seg(v, 0.545, 0.575) * (1 - seg(v, 0.70, 0.74));
      // Success-recap zoom: dive on the popup as the green check lands and the
      // list of what was built appears; release before the result close-up.
      const ztS = seg(v, 0.803, 0.825) * (1 - seg(v, 0.838, 0.858));
      const zt2 = seg(v, 0.86, 0.895);
      const rc = T.result ?? { x: 326, y: 320 };
      const cams = [
        { t: zt0, z: Z0, f: T.oratab ?? { x: 577, y: 71 } },
        { t: zt1, z: Z1, f: T.modalc ?? { x: 520, y: 320 } },
        { t: ztS, z: 1.6, f: T.loadc ?? { x: 856, y: 330 } },
        { t: zt2, z: Z2, f: rc },
      ];
      const cam = cams.reduce((a, b) => (b.t > a.t ? b : a));
      const zt = cam.t, Z = cam.z;
      // Result close-up: centred EXACTLY on the workbook (dead centre of the
      // viewport), zoom sized so the whole window incl. sheet tabs stays in
      // frame.
      const focus = cam.f;
      // The dark ambiance persists through the LOADING beat and releases
      // exactly when the generated workbook lands (lights back on = punch).
      const dark = Math.max(zt0, zt1, seg(v, 0.72, 0.75) * (1 - seg(v, 0.845, 0.885)));
      const zoom = 1 + (Z - 1) * zt;
      const S = fitScaleRef.current * grow * zoom;
      // Centre the focus in the VIEWPORT (not just the stage box): compensate
      // the vertical offset between the stage box centre and the screen centre.
      let centerDelta = 0;
      if (window.innerHeight > 0) {
        const boxR = box.getBoundingClientRect();
        centerDelta = boxR.top + boxR.height / 2 - window.innerHeight / 2;
      }
      const dx = (520 - focus.x) * zt;
      const dy = ((320 - focus.y) - centerDelta / S) * zt;
      stage.style.transform = `translate(-50%, -50%) scale(${S}) translate(${dx}px, ${dy}px)`;
      box.style.marginTop = `${14 + 26 * seg(v, 0, 0.20)}px`;
      // Immersive takeover: at zoom moments the whole hero switches to a dark
      // ambiance (background, captions, scroll cue, nav) and the app takes the
      // spotlight, so the enlarged stage never fights the headline. The
      // headline itself fades out completely.
      const immersive = dark > 0.12;
      const sticky = stickyRef.current;
      if (sticky) sticky.classList.toggle("immersive", immersive);
      const section = sticky ? sticky.closest("section") : null;
      if (section) {
        if (immersive) section.setAttribute("data-nav-dark", "");
        else section.removeAttribute("data-nav-dark");
      }
      const headline = headlineRef.current;
      if (headline) {
        // Fades for BOTH the dark takeover and the result close-up.
        const hf = Math.max(dark, zt2);
        headline.style.opacity = String(Math.max(0, 1 - 1.2 * hf));
        headline.style.transform = `translateY(${-18 * hf}px)`;
      }

      // 1 · Excel alone (centred), the cursor clicks the « Ora » ribbon tab
      if (el.oratabFlash) el.oratabFlash.style.opacity = String(seg(v, 0.192, 0.206) * (1 - seg(v, 0.21, 0.28)));
      // 2 · Right after the click, while the camera pulls back: the Ora panel
      //     docks on the right and Excel slides to its dual slot (« bam »)
      const dual = seg(v, 0.26, 0.34);
      if (el.panel) {
        el.panel.style.opacity = String(dual);
        el.panel.style.transform = `translateX(${390 * (1 - dual)}px)`;
      }
      if (el.excel1) {
        el.excel1.style.opacity = String(1 - seg(v, 0.78, 0.83));
        el.excel1.style.transform = `translateX(${-194 * seg(v, 0.26, 0.36) - 80 * seg(v, 0.78, 0.83)}px)`;
      }
      // 3 · FEC Studio modal (snappy open, rapid-fire toggles, quick close)
      if (el.fecFlash) el.fecFlash.style.opacity = String(seg(v, 0.568, 0.583) * (1 - seg(v, 0.583, 0.63)));
      const modalIn = seg(v, 0.585, 0.61) * (1 - seg(v, 0.705, 0.73));
      if (el.modal) {
        el.modal.style.opacity = String(modalIn);
        el.modal.style.transform = `scale(${0.96 + 0.04 * seg(v, 0.585, 0.61)})`;
      }
      // toggles flip in rapid succession under the cursor — exactly ON the
      // click beat (same instant as the cursor dip + ripple, no lag)
      const tgAt = [0.641, 0.658, 0.675];
      el.toggles.forEach((tg, i) => {
        const on = seg(v, tgAt[i], tgAt[i] + 0.008);
        if (tg.track) tg.track.style.opacity = String(on);
        if (tg.knob) tg.knob.style.transform = `translateX(${12 * on}px)`;
      });
      if (el.runFlash) el.runFlash.style.opacity = String(seg(v, 0.695, 0.71) * (1 - seg(v, 0.71, 0.755)));
      // 4 · JOURNAL run
      if (el.jstatus) {
        const next = v < 0.71 ? "Prêt." : v < 0.82 ? "En cours…" : "Terminé";
        if (el.jstatus.textContent !== next) el.jstatus.textContent = next;
      }
      if (el.jcount) {
        const n = String(Math.round(5 * seg(v, 0.715, 0.81)));
        if (el.jcount.textContent !== n) el.jcount.textContent = n;
      }
      el.jlines.forEach((l) => {
        const i = Number(l.dataset.jline);
        const o = seg(v, 0.715 + i * 0.018, 0.733 + i * 0.018);
        l.style.opacity = String(o);
        l.style.transform = `translateY(${4 * (1 - o)}px)`;
      });
      // 5 · loading beat: the bar fills, the spinner flips to a green check
      //     (« Automatisation réussie »), then the audit workbook lands
      const loadIn = seg(v, 0.73, 0.755) * (1 - seg(v, 0.85, 0.88));
      if (el.loading) {
        el.loading.style.opacity = String(loadIn);
        el.loading.style.transform = `scale(${0.95 + 0.05 * seg(v, 0.73, 0.755)})`;
      }
      const lp = seg(v, 0.755, 0.805);
      if (el.loadfill) el.loadfill.style.transform = `scaleX(${lp})`;
      const okIn = seg(v, 0.805, 0.822);
      const success = v >= 0.805;
      if (el.loadlogo) el.loadlogo.style.opacity = String(1 - okIn);
      if (el.loadok) {
        el.loadok.style.opacity = String(okIn);
        el.loadok.style.transform = `scale(${0.5 + 0.5 * okIn})`;
      }
      if (el.loadtitle) {
        const tt = success ? "Automatisation réussie" : "Chasse aux écritures fantômes…";
        if (el.loadtitle.textContent !== tt) el.loadtitle.textContent = tt;
      }
      // Success recap: the FEC tip + Annuler give way to the list of what was
      // actually built (balances + generated workbook).
      if (el.loadtip) el.loadtip.style.display = success ? "none" : "";
      if (el.loadcancel) el.loadcancel.style.display = success ? "none" : "";
      if (el.loaddone) {
        el.loaddone.style.display = success ? "block" : "none";
        el.loaddone.style.opacity = String(okIn);
      }
      // Punchy arrival: quick fade + ease-out rise-and-scale + a glow pulse.
      const wp = seg(v, 0.85, 0.90);
      const we = 1 - (1 - wp) * (1 - wp);
      if (el.excel2) {
        el.excel2.style.opacity = String(Math.min(1, wp * 1.8));
        el.excel2.style.transform = `translateY(${34 * (1 - we)}px) scale(${0.94 + 0.06 * we})`;
      }
      if (el.xwglow) el.xwglow.style.opacity = String(seg(v, 0.895, 0.915) * (1 - seg(v, 0.915, 0.96)));
      const sheetIdx = v < 0.94 ? 0 : v < 0.972 ? 1 : 2;
      el.sheets.forEach((s) => { s.classList.toggle("hd-hidden", Number(s.dataset.sheet) !== sheetIdx); });
      el.xtabs.forEach((tab) => { tab.classList.toggle("on", Number(tab.dataset.xtab) === sheetIdx); });
      if (el.pill) {
        const pp = seg(v, 0.89, 0.93);
        const pe = 1 - (1 - pp) * (1 - pp);
        el.pill.style.opacity = String(pp);
        el.pill.style.transform = `scale(${0.85 + 0.15 * pe})`;
      }
      // Cursor: measured targets; tip lands on them.
      if (el.cursor) {
        const TIP_X = 14.6, TIP_Y = 6.5;
        const tx = (k: string) => T[k].x - TIP_X;
        const ty = (k: string) => T[k].y - TIP_Y;
        const times = [0, 0.15, 0.38, 0.565, 0.60, 0.638, 0.655, 0.672, 0.695, 0.735, 0.91, 0.935, 0.962, 1];
        const keys = ["oratab", "oratab", "lancerfec", "lancerfec", "tg1", "tg2", "tg3", "run", "run", "tab2", "tab2", "tab3", "tab3"];
        const x = kf(v, times, [940, ...keys.map(tx)].slice(0, times.length));
        const y = kf(v, times, [600, ...keys.map(ty)].slice(0, times.length));
        const cs = kf(
          v,
          [0, 0.192, 0.20, 0.208, 0.570, 0.578, 0.586, 0.633, 0.641, 0.649, 0.650, 0.658, 0.666, 0.667, 0.675, 0.683, 0.692, 0.70, 0.708, 0.927, 0.935, 0.943, 0.954, 0.962, 0.970, 1],
          [1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1]
        );
        el.cursor.style.transform = `translate(${x}px, ${y}px) scale(${cs})`;
      }
      // Click feedback: a ripple pulse at the click point + a short vibration
      // where the platform supports it (mobile; desktops ignore silently).
      if (el.ripple) {
        // Short + eased-out pulse: expands fast then dies, so it reads as a
        // snappy tap instead of a slow drifting ring.
        const active = CLICKS.find((c) => v >= c.t && v <= c.t + 0.014);
        if (active && T[active.k]) {
          const p = (v - active.t) / 0.014;
          const pe = 1 - (1 - p) * (1 - p);
          el.ripple.style.left = `${T[active.k].x}px`;
          el.ripple.style.top = `${T[active.k].y}px`;
          el.ripple.style.transform = `scale(${0.35 + 0.95 * pe})`;
          el.ripple.style.opacity = String((1 - pe) * 0.75);
        } else {
          el.ripple.style.opacity = "0";
        }
      }
      let clickIdx = -1;
      for (let i = 0; i < CLICKS.length; i++) if (v >= CLICKS[i].t) clickIdx = i;
      if (clickIdx > lastClickRef.current && clickIdx >= 0 && v - CLICKS[clickIdx].t < 0.06) {
        try { (navigator as { vibrate?: (ms: number) => void }).vibrate?.(10); } catch { /* unsupported */ }
      }
      lastClickRef.current = clickIdx;
      // Captions
      const capOp = [
        1 - seg(v, 0.50, 0.55),
        seg(v, 0.55, 0.60) * (1 - seg(v, 0.71, 0.75)),
        seg(v, 0.73, 0.78) * (1 - seg(v, 0.86, 0.90)),
        seg(v, 0.89, 0.94),
      ];
      el.caps.forEach((c, i) => { c.style.opacity = String(capOp[i] ?? 0); });
      // Scroll cue: the fill tracks the PHYSICAL scroll (linear), so the bar
      // moves steadily under the finger even inside heavy zones.
      if (el.cuefill) el.cuefill.style.transform = `scaleX(${Math.min(1, Math.max(0, vRaw))})`;
      hint.style.opacity = String(1 - seg(vRaw, 0.955, 0.995));
    };

    applyRef.current = apply;
    apply(reduced ? 1 : scrollYProgress.get());
    if (reduced) return;
    const unsub = scrollYProgress.on("change", apply);
    return () => unsub();
  }, [scrollYProgress, reduced]);

  return (
    <section data-nav-shy className="relative bg-white dark:bg-black">
      <style>{HD_CSS}</style>

      {/* Tall scrub wrapper: ~7 viewport heights of scroll drive the demo
          (v2: shortened — the flow starts directly in Excel). Heavy-scroll
          zones still stretch the key moments. */}
      <div ref={wrapRef} className="relative h-[440vh] md:h-[700vh]">
        <div ref={stickyRef} className="hd-sticky sticky top-0 flex h-screen flex-col overflow-hidden px-6 md:px-12 pt-24 md:pt-28 pb-14 md:pb-16">
          {/* Soft overhead light — dark mode only */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{ background: "radial-gradient(56% 44% at 50% -8%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.055) 40%, transparent 70%)" }}
          />

          {/* Headline (fades out while the camera zoom is engaged) */}
          <motion.div
            ref={headlineRef}
            className="hd-headline relative z-10 text-center max-w-[90rem] mx-auto"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              {t({ fr: "Ora en action", en: "Ora in action" })}
            </span>
            <h2 className="font-inter font-normal text-[clamp(1.9rem,4.2vw,3.9rem)] tracking-[-0.035em] leading-[1.06] text-[#111827] dark:text-white mt-4 text-center">
              <span className="block lg:whitespace-nowrap">
                {t({ fr: "Moins d'Excel, ", en: "We give you " })}
                <span className="text-brand-gradient">{t({ fr: "plus d'analyse et de conseil", en: "analysis and advisory" })}</span>
                {t({ fr: ".", en: " time back" })}
              </span>
            </h2>
            <p className="mt-3 font-inter text-[clamp(0.95rem,1.5vw,1.3rem)] leading-snug text-gray-400 dark:text-gray-500 text-center">
              {t({
                fr: "On s'occupe de vos tâches répétitives, vous excellez dans votre métier.",
                en: "We handle the repetitive tasks, so you excel at what you do.",
              })}
            </p>
          </motion.div>

          {/* Stage (auto-fitted 1040×640 scene) */}
          <div ref={boxRef} className="hd-stagebox relative z-10">
            <div ref={stageRef} className="hd-stage">
              <div className="hd-blob" />

              {/* ══ Real Excel — the FEC workbook. Starts CENTRED (layout
                  left:210 so the measured Ora-tab click target matches the
                  untransformed position), then slides -194px to its dual-view
                  slot (left:16) when the panel docks. ══ */}
              <div className="hd-win hd-xw" data-hd="excel1" style={{ left: 210 }}>
                <XChrome name="FEC_demo_2024_398k_lignes" cell="N8" formula="" oraTarget />
                <div className="hd-xsheet">
                  <div className="hd-xgrid" style={{ gridTemplateColumns: FEC_GRID }}>
                    <div className="hd-xL" />
                    {FEC_COLS.map((_, i) => (
                      <div key={`L${i}`} className="hd-xL">{String.fromCharCode(65 + i)}</div>
                    ))}
                    <div className="hd-xN">1</div>
                    {FEC_COLS.map((h) => (
                      <div key={h} className="hd-xH">{h}</div>
                    ))}
                    {FEC_ROWS.map((row, r) => (
                      <div key={r} style={{ display: "contents" }}>
                        <div className="hd-xN">{r + 2}</div>
                        {row.map((cell, ci) => (
                          <div key={ci} className={`hd-xC${ci >= 7 ? " num" : ""}${r === 1 && ci === 8 ? " sel" : ""}`}>{cell}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hd-xtabs">
                  <span className="hd-xtab on">Sheet1</span>
                  <span className="hd-xtabplus">+</span>
                </div>
                <div className="hd-xstatus">Prêt · Accessibilité : vérification terminée<span className="z">100 %</span></div>
              </div>

              {/* ══ Real Excel — the generated AUDIT workbook (same slot) ══ */}
              <div className="hd-win hd-xw hd-xw2" data-hd="excel2" data-cur="result">
                <div className="hd-xwglow" data-hd="xwglow" />
                <XChrome name="FEC 2025 - studio.xlsx" cell="A1" formula="Balance générale · Exercice 2025" />
                <div className="hd-xsheet">
                  {/* Sheet 0 · Balance générale (real data) */}
                  <TableSheet
                    sheet={0} title="Balance générale · Exercice 2025" meta={BG_META}
                    cols={BG_COLS} rows={BG_ROWS} total={BG_TOTAL} firstNum={2}
                    gridCols="20px .62fr 2.1fr 1fr 1fr 1fr 1fr"
                  />
                  {/* Sheet 1 · Balance mensuelle — embedded bar chart */}
                  <div className="hd-xmonth hd-hidden" data-sheet={1}>
                    <div className="hd-xmtitle">
                      <span>Balance mensuelle · Exercice 2025</span>
                      <span className="meta">Mouvements par mois (k€)</span>
                    </div>
                    <div className="hd-xmbody">
                      <div className="hd-xmtable">
                        <div className="r h"><span>Mois</span><span className="num">Débit</span><span className="num">Crédit</span></div>
                        {BM_MONTHS.map((m, i) => (
                          <div className="r" key={m}><span>{m}</span><span className="num">{BM_DEBIT[i]}</span><span className="num">{BM_CREDIT[i]}</span></div>
                        ))}
                      </div>
                      <div className="hd-xmchart">
                        <div className="ct">Débit / Crédit par mois</div>
                        <svg viewBox="0 0 244 108" preserveAspectRatio="none">
                          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                            <line key={g} x1="0" x2="244" y1={98 - g * 90} y2={98 - g * 90} stroke="#eef0f2" strokeWidth="0.7" />
                          ))}
                          {BM_MONTHS.map((m, i) => {
                            const gx = i * 20 + 4;
                            const dh = (BM_DEBIT[i] / BM_MAX) * 90;
                            const ch = (BM_CREDIT[i] / BM_MAX) * 90;
                            return (
                              <g key={m}>
                                <rect x={gx} y={98 - dh} width="6.4" height={dh} fill="#4a86d6" />
                                <rect x={gx + 7.2} y={98 - ch} width="6.4" height={ch} fill="#2bb3a3" />
                                <text x={gx + 6.8} y="106" fontSize="3.6" textAnchor="middle" fill="#9098a2">{m}</text>
                              </g>
                            );
                          })}
                          <line x1="0" y1="98" x2="244" y2="98" stroke="#c9c9c9" strokeWidth="0.8" />
                        </svg>
                        <div className="hd-xmleg">
                          <span><i style={{ background: "#4a86d6" }} />Débit</span>
                          <span><i style={{ background: "#2bb3a3" }} />Crédit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Sheet 2 · Balance âgée (real data) */}
                  <TableSheet
                    sheet={2} hidden title="Balance âgée · créances clients (411)" meta={BA_META}
                    cols={BA_COLS} rows={BA_ROWS} total={BA_TOTAL} firstNum={2}
                    gridCols="20px .7fr 1.5fr 1fr 1fr .9fr .9fr .9fr .9fr"
                  />
                </div>
                <div className="hd-xtabs">
                  <span className="hd-xtabplus">+</span>
                  <span className="hd-xtab">FEC 2025</span>
                  <span className="hd-xtab">Paramètres</span>
                  <span className="hd-xtab">Contrôles</span>
                  <span className="hd-xtab on" data-xtab={0}>Balance générale</span>
                  <span className="hd-xtab" data-xtab={1} data-cur="tab2">Balance mensuelle</span>
                  <span className="hd-xtab">Balance journaux</span>
                  <span className="hd-xtab">Auxiliaires</span>
                  <span className="hd-xtab" data-xtab={2} data-cur="tab3">Balance âgée</span>
                </div>
                <div className="hd-xstatus">Prêt<span className="z">100 %</span></div>
              </div>

              {/* ══ Docked Ora panel (right, dual view) ══ */}
              <div className="hd-win hd-panel" data-hd="panel">
                <div className="hd-titlebar">
                  <div className="hd-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                  <div className="hd-tbtitle">Ora</div>
                </div>
                <div className="hd-ptop">
                  <span className="t">Atlas</span>
                  <div className="hd-pills"><span className="hd-avatar">R</span></div>
                </div>
                <div className="hd-tabsbar">
                  <span className="hd-tabslabel">Classeurs ouverts</span>
                  <span className="hd-tab on">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
                    FEC_demo_2024_398k_li…
                  </span>
                  <span className="hd-tab off">Ora_Prospects_…</span>
                </div>
                <div className="hd-pbody">
                  <div className="hd-back">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Dossier Client ABCD
                    <span className="hd-backicons">
                      <span className="hd-iconbtn">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16" /></svg>
                      </span>
                      <span className="hd-iconbtn">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                      </span>
                    </span>
                  </div>
                  <div className="hd-filehead">
                    <span className="hd-fico x" style={{ width: 26, height: 26, fontSize: 7.5 }}>XLSX</span>
                    <div>
                      <div className="nm">FEC_demo_2024_398k_lignes (2)</div>
                      <div className="mt">
                        XLSX
                        <span className="hd-badge-todo"><span className="dot" />À faire</span>
                        <span className="hd-badge-ok">
                          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          Approuvé
                        </span>
                      </div>
                    </div>
                    <span className="hd-fileicons">
                      <span className="hd-iconbtn" style={{ width: 20, height: 20, color: "#6b7280" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 3" /></svg>
                      </span>
                      <span className="hd-iconbtn" style={{ width: 20, height: 20, color: "#6b7280" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></svg>
                      </span>
                    </span>
                  </div>
                  <div className="hd-sendrow">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
                    <span className="lbl">Ce classeur : <b>FEC_demo_2024_398k_lignes (2)</b></span>
                    <span className="hd-sendbtn">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>
                      Envoyer
                    </span>
                  </div>
                  <div className="hd-chips">
                    <span className="hd-chip">☆ Favoris <span className="n">0</span></span>
                    <span className="hd-chip">Qualité <span className="n">11</span></span>
                    <span className="hd-chip">Audit <span className="n">12</span></span>
                    <span className="hd-chip">Finance <span className="n">7</span></span>
                    <span className="hd-chip">Export <span className="n">3</span></span>
                  </div>
                  <div className="hd-search">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                    Rechercher une automatisation…
                  </div>
                  <div className="hd-sugglabel">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                    Suggestions pour ce fichier
                  </div>
                  <div className="hd-hero-sugg">
                    <span className="hd-playic blue">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">FEC Studio — le dossier d'audit à la carte</div>
                      <div className="r">Déjà utilisée sur ce fichier</div>
                    </div>
                    <span className="hd-lancer" data-cur="lancerfec">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                      Lancer
                      <span className="hd-flash" data-hd="fec-flash" />
                    </span>
                  </div>
                  <div className="hd-hero-sugg">
                    <span className="hd-playic purple">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">Balance âgée 30/60/90</div>
                      <div className="r">Correspond aux colonnes détectées</div>
                    </div>
                    <span className="hd-lancer">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                      Lancer
                    </span>
                  </div>
                  <div className="hd-hero-sugg">
                    <span className="hd-playic green">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">Agréger des fichiers identiques</div>
                      <div className="r">Correspond aux colonnes détectées</div>
                    </div>
                    <span className="hd-lancer">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                      Lancer
                    </span>
                  </div>
                  <div className="hd-sugg">
                    <span className="hd-playic purple">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">Balance âgée 30/60/90 <span className="hd-tag finance">Finance</span></div>
                      <div className="d">Ventile les encours par ancienneté et par tiers à partir des échéances.</div>
                    </div>
                    <span className="hd-rowactions">
                      <span className="hd-star">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" /></svg>
                      </span>
                      <span className="hd-lancer">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                        Lancer
                      </span>
                    </span>
                  </div>
                  <div className="hd-sugg">
                    <span className="hd-playic green">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">Agréger des fichiers identiques <span className="hd-tag qualite">Qualité</span></div>
                      <div className="d">Empile des fichiers de même structure en un seul tableau, avec la trace du fichier…</div>
                    </div>
                    <span className="hd-rowactions">
                      <span className="hd-star">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" /></svg>
                      </span>
                      <span className="hd-lancer">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                        Lancer
                      </span>
                    </span>
                  </div>
                  <div className="hd-sugg">
                    <span className="hd-playic green">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">Anonymiser des colonnes <span className="hd-tag qualite">Qualité</span></div>
                      <div className="d">Remplace les données nominatives par des pseudonymes stables avant de partager un…</div>
                    </div>
                    <span className="hd-rowactions">
                      <span className="hd-star">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" /></svg>
                      </span>
                      <span className="hd-lancer">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                        Lancer
                      </span>
                    </span>
                  </div>
                  <div className="hd-sugg">
                    <span className="hd-playic blue">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t">Tests sur le journal <span className="hd-tag audit">Audit</span></div>
                      <div className="d">Batterie de revue d'écritures : week-end, montants ronds, fin de période.</div>
                    </div>
                    <span className="hd-rowactions">
                      <span className="hd-star">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" /></svg>
                      </span>
                      <span className="hd-lancer">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                        Lancer
                      </span>
                    </span>
                  </div>

                  {/* FEC Studio config modal — replica of the real app dialog */}
                  <div className="hd-modal" data-hd="modal" data-cur="modalc" style={{ top: 12 }}>
                    <div className="hd-mhead">
                      <span className="ic">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                      </span>
                      <div>
                        <div className="t">FEC Studio — le dossier d'audit à la carte</div>
                        <div className="s">Renseignez les paramètres avant de lancer.</div>
                      </div>
                      <span className="x">✕</span>
                    </div>
                    <div className="hd-mprofiles">
                      <span className="hd-mprofile">🕘 Dernière config</span>
                      <span className="hd-mprofile b">💾 Enregistrer ce profil</span>
                    </div>
                    <div className="hd-msec"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg> Mission</div>
                    <div className="hd-mfieldlabel">Seuil de signification de la mission (€)</div>
                    <div className="hd-minput">
                      vide = suggestion NEP-320 (0,5 % du CA) — propagé à la revue…
                      <span className="stp">
                        <svg width="7" height="11" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4-4 4 4M2 13l4 4 4-4" /></svg>
                      </span>
                    </div>
                    <div className="hd-msec">Contrôles</div>
                    <div className="hd-mrow">
                      <span className="l">Contrôles du FEC</span>
                      <span className="hd-toggle"><span className="track" /><span className="knob" /></span>
                    </div>
                    <div className="hd-msec"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg> Balances <span className="link">Tout cocher</span></div>
                    <div className="hd-mrow">
                      <span className="l">Balance générale</span>
                      <span className="hd-toggle" data-cur="tg1"><span className="track" data-hd="tg1-track" /><span className="knob" data-hd="tg1-knob" /></span>
                    </div>
                    <div className="hd-mrow">
                      <span className="l">Balance mensuelle</span>
                      <span className="hd-toggle" data-cur="tg2"><span className="track" data-hd="tg2-track" /><span className="knob" data-hd="tg2-knob" /></span>
                    </div>
                    <div className="hd-mrow">
                      <span className="l">Balance par journal</span>
                      <span className="hd-toggle"><span className="track" /><span className="knob" /></span>
                    </div>
                    <div className="hd-mrow">
                      <span className="l">Auxiliaires clients &amp; fournisseurs</span>
                      <span className="hd-toggle"><span className="track" /><span className="knob" /></span>
                    </div>
                    <div className="hd-mrow">
                      <span className="l">Balance âgée (créances &amp; dettes)</span>
                      <span className="hd-toggle" data-cur="tg3"><span className="track" data-hd="tg3-track" /><span className="knob" data-hd="tg3-knob" /></span>
                    </div>
                    <div className="hd-mrow">
                      <span className="l">À-nouveaux</span>
                      <span className="hd-toggle"><span className="track" /><span className="knob" /></span>
                    </div>
                    <div className="hd-mrow">
                      <span className="l">Comparatif N / N-1</span>
                      <span className="hd-toggle"><span className="track" /><span className="knob" /></span>
                    </div>
                    <div className="hd-mfoot">
                      <span className="hd-mcancel">Annuler</span>
                      <span className="hd-mrun" data-cur="run">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
                        Lancer maintenant
                        <span className="hd-flash" data-hd="run-flash" />
                      </span>
                    </div>
                  </div>

                  {/* Loading popup — replica of the real app (Ora mark, witty
                      status, progress bar, FEC tip, Annuler); flips to the
                      green-check success recap of the work that was done */}
                  <div className="hd-loading" data-hd="loading" data-cur="loadc">
                    <div className="icwrap">
                      <div className="lg" data-hd="loadlogo"><img src="/logos/icon-color.png" alt="" /></div>
                      <div className="ok" data-hd="loadok">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </div>
                    </div>
                    <div className="t" data-hd="loadtitle">Chasse aux écritures fantômes…</div>
                    <div className="bar"><span className="barfill" data-hd="loadfill" /></div>
                    <div className="tip" data-hd="loadtip">💡 Le FEC est un format légal normé depuis 2014 (art. A47 A-1 du LPF).</div>
                    <div className="done" data-hd="loaddone">
                      <div className="dl"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Balance générale construite</div>
                      <div className="dl"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Balance mensuelle construite</div>
                      <div className="dl"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Balance âgée (créances &amp; dettes)</div>
                      <div className="dl"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Classeur Excel créé : FEC 2025 - studio.xlsx</div>
                    </div>
                    <div className="cancel" data-hd="loadcancel">✕ Annuler</div>
                  </div>
                </div>
                {/* JOURNAL */}
                <div className="hd-journal">
                  <div className="hd-jhead">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 17l6-6-6-6M12 19h8" /></svg>
                    Journal
                    <span className="st">· <span data-hd="jcount">0</span></span>
                    <span className="st" data-hd="jstatus">Prêt.</span>
                    <span className="chev">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                    </span>
                  </div>
                  <div className="hd-jlines">
                    {J_LINES.map((line, i) => (
                      <div key={i} className="hd-jline" data-jline={i}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated-file pill */}
              <div className="hd-pill" data-hd="pill">
                <span className="fico">XLSX</span>
                <div>
                  <div className="t1">FEC 2025 - studio.xlsx</div>
                  <div className="t2">Généré par Ora · 7 feuilles</div>
                </div>
              </div>

              {/* Click ripple (feedback pulse at each click point) */}
              <div className="hd-ripple" data-hd="ripple" />

              {/* Cursor */}
              <svg className="hd-cursor" data-hd="cursor" viewBox="0 0 32 32">
                <path d="M9 4 L9 27 L14.6 21.6 L18 29.4 L22.4 27.4 L19 19.8 L26.6 19.8 Z" fill="#0b0b0f" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Step captions */}
          <div ref={capsRef} className="relative z-10 h-10 md:h-12 flex-shrink-0">
            {[
              t({ fr: "Depuis Excel, cliquez sur l'onglet Ora", en: "From Excel, click the Ora tab" }),
              t({ fr: "Configurez FEC Studio en deux clics", en: "Configure FEC Studio in two clicks" }),
              t({ fr: "Ora construit le dossier d'audit", en: "Ora builds the audit workbook" }),
              t({ fr: "Explorez votre classeur, feuille par feuille", en: "Browse your workbook, sheet by sheet" }),
            ].map((label, i) => (
              <div key={i} className="hd-cap" style={{ opacity: i === 0 ? 1 : 0 }}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/[0.06] ring-1 ring-gray-900/10 text-[13px] font-inter font-semibold text-gray-800 dark:bg-white/10 dark:ring-white/20 dark:text-white">{i + 1}</span>
                <span className="font-inter text-[15px] md:text-lg text-gray-600 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Scroll cue — PERSISTENT: chevron + demo progress bar, so the user
              understands the whole animation is driven by scrolling. */}
          <div ref={hintRef} className="hd-scrollcue pointer-events-none font-inter">
            <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            <span className="txt">{t({ fr: "Faites défiler", en: "Scroll" })}</span>
            <span className="track"><span className="fill" data-hd="cuefill" /></span>
          </div>
        </div>
      </div>

      {/* CTA — after the demo releases */}
      <motion.div
        className="relative z-10 pb-16 md:pb-24 px-6 md:px-12 flex justify-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.button
          onClick={openBooking}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 24, mass: 0.6 }}
          className="group inline-flex items-center gap-3 px-12 py-6 rounded-full text-lg md:text-xl font-inter font-semibold text-white bg-[#3b82f6] hover:bg-[#2f75e6] shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_18px_55px_rgba(59,130,246,0.6)] transition-[background-color,box-shadow] duration-300 ease-out"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </section>
  );
}
