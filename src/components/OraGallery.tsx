import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * OraGallery — Bending-Spoons-style curved 3D video carousel.
 *
 *  The six demo videos ride an infinite horizontal strip bent like the inside
 *  of a cylinder: cards near the viewport edges tilt inward (rotateY) and
 *  recede (translateZ), the center card faces the viewer flat. The strip
 *  drifts continuously and loops seamlessly (the card set is rendered twice).
 *
 *  Interactions:
 *   - Auto-rotation, paused on hover (mouse) and while dragging.
 *   - Drag / swipe sideways → scrubs the carousel (all breakpoints).
 *   - Click a video → opens an enlarged lightbox.
 *   - prefers-reduced-motion → no auto-drift, curvature + drag still work.
 */

interface OraGalleryProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

type Card = { label: string; src: string };

type ActiveVideo = { src: string; label: string; rect?: DOMRect };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function OraGallery({ theme, openBooking }: OraGalleryProps) {
  const { t } = useLang();
  void theme;

  // The video currently opened in the enlarged lightbox (null = closed).
  const [active, setActive] = useState<ActiveVideo | null>(null);

  // The three hero clips (Reporting, FEC Studio, Tracking/Pointage) sit in the
  // centre of the set so they're the most prominent when the strip is at rest.
  const cards: Card[] = [
    { label: t({ fr: "Extraction", en: "Extraction" }),            src: "/feature-automate-v3.mp4" },
    { label: t({ fr: "Rapprochement", en: "Reconciliation" }),     src: "/ora_story3-v2.mp4" },
    { label: t({ fr: "Reporting mensuel", en: "Monthly report" }), src: "/ora_reporting.mp4" },
    { label: t({ fr: "FEC Studio", en: "FEC Studio" }),            src: "/ora_fec_demo.mp4" },
    { label: t({ fr: "Tracking", en: "Tracking" }),                src: "/ora_pointage.mp4" },
    { label: t({ fr: "Export PDF", en: "PDF export" }),            src: "/ora_story4-v2.mp4" },
    { label: t({ fr: "Multi-dossier", en: "Multi-folder" }),       src: "/feature-automate-v2.mp4" },
  ];

  return (
    <section data-nav-shy data-nav-dark className="relative overflow-hidden pt-28 md:pt-32 pb-10 md:pb-12 px-6 md:px-12 bg-black">
      {/* Header — Bending-Spoons-style: just an eyebrow + a big benefit line,
          then the carousel sits high so it's visible on arrival. */}
      <motion.div
        className="relative z-10 text-center max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
          {t({ fr: "Ora en action", en: "Ora in action" })}
        </span>
        <h2 className="font-poppins font-normal text-[2.1rem] md:text-[2.9rem] lg:text-[3.5rem] tracking-[-0.03em] leading-[1.06] text-white mt-4 text-center">
          <span className="block lg:whitespace-nowrap">{t({ fr: "On s'occupe de vos tâches répétitives,", en: "We handle the repetitive tasks," })}</span>
          <span className="block lg:whitespace-nowrap">
            <span className="inline-block text-brand-gradient">{t({ fr: "vous excellez dans votre métier.", en: "so you excel at what you do." })}</span>
          </span>
        </h2>
        <p className="font-inter mt-4 text-[13px] text-gray-500">
          {t({ fr: "Cliquez pour agrandir · glissez pour parcourir", en: "Click to enlarge · drag to browse" })}
        </p>
      </motion.div>

      {/* Curved auto-rotating strip. Negative margins cancel the section's
          horizontal padding so the strip bleeds full-width to the viewport
          edges — the section's overflow-hidden does the clipping. */}
      <motion.div
        className="relative z-10 mt-8 md:mt-10 -mx-6 md:-mx-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
      >
        <CurvedCarousel cards={cards} onOpen={setActive} />
      </motion.div>

      {/* CTA */}
      <motion.div
        className="relative z-10 mt-16 md:mt-24 flex justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
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

      {/* Enlarged video lightbox — zooms out of the clicked card, backdrop
          blurred. The portal lives OUTSIDE AnimatePresence (see Lightbox). */}
      <Lightbox active={active} onClose={() => setActive(null)} />
    </section>
  );
}

// ── Curved infinite carousel ────────────────────────────────────────────────
// The card set is rendered twice; `offset` lives in [0, setWidth) and the
// track is translated by -offset, so wrapping is invisible. Card curvature is
// pure math (no per-frame DOM reads): layout metrics are measured once per
// resize, then each frame writes rotateY/translateZ from the card's distance
// to the viewport center.

// Intro flourish: when the carousel first scrolls into view it accelerates
// to BURST_SPEED (peak at t = BURST_TAU), dies out, crosses zero and settles
// into the opposite-direction CRUISE_SPEED. v(t) = cruise + Δ·(t/τ)·e^(1−t/τ).
const CRUISE_SPEED = -48; // px per second, steady continuous drift (never stops)
const BURST_SPEED = 530; // px per second at the peak of the intro
const BURST_TAU = 0.55; // seconds to the peak; fully settled ~5τ later

function CurvedCarousel({
  cards,
  onOpen,
}: {
  cards: Card[];
  onOpen: (v: ActiveVideo) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const st = useRef({
    offset: 0,
    setWidth: 1,
    vpWidth: 1,
    metrics: [] as { center: number }[],
    lead: 0,
    paused: false,
    dragging: false,
    moved: false,
    lastX: 0,
    dragAccum: 0,
    visible: true,
    reduced: false,
    burstStart: -1,
    inited: false,
    raf: 0,
    lastT: 0,
  });

  const doubled = [...cards, ...cards];

  useEffect(() => {
    const s = st.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const vp = viewportRef.current;
      if (!vp) return;
      s.vpWidth = vp.clientWidth;
      // offsetLeft is relative to the track (its offsetParent, position:relative)
      // and unaffected by the transforms we write — stable layout values.
      s.metrics = outerRefs.current.map((el) =>
        el ? { center: el.offsetLeft + el.offsetWidth / 2 } : { center: 0 }
      );
      const first = outerRefs.current[0];
      const firstOfSecondSet = outerRefs.current[cards.length];
      s.setWidth =
        first && firstOfSecondSet ? firstOfSecondSet.offsetLeft - first.offsetLeft : 1;
      // The cylinder pulls edge cards inward by up to ~0.33 × half the
      // viewport; the scroll window must stay that far inside the doubled
      // track on both sides or the screen edges go bare near the wrap point.
      s.lead = 0.33 * (s.vpWidth / 2) + 30;
      // On first measure, park the strip so the middle of the three hero clips
      // (index 3 = FEC Studio, flanked by Reporting and Tracking) sits dead
      // centre — that's the group we want most visible at rest. After that we
      // just keep normalizing so the drift/resize don't jump.
      const CENTER_INDEX = 3;
      const half = s.vpWidth / 2;
      const raw = s.inited
        ? s.offset
        : (s.metrics[CENTER_INDEX]?.center ?? s.lead + half) - half;
      s.inited = true;
      s.offset = s.lead + ((((raw - s.lead) % s.setWidth) + s.setWidth) % s.setWidth);
    };

    const write = () => {
      const half = s.vpWidth / 2;
      const isMd = s.vpWidth >= 768;
      // True inside-of-a-cylinder wall (Bending Spoons hero): a card whose
      // layout center sits dx px from the viewport center lives at arc angle
      // φ = dx / R on a cylinder of radius R. It is pulled inward toward the
      // center (R·sinφ − dx), pushed away from the viewer (base recession D
      // minus R·(1−cosφ), so the center card is farthest), and turned to face
      // the cylinder axis (rotateY −φ, outer edge closest to the viewer).
      // Gentler curvature on mobile: cards are near-viewport-width there, so
      // a tight cylinder would turn neighbors edge-on and open holes.
      const PHI_MAX = isMd ? 1.15 : 0.7; // rad at the viewport edge
      const CLAMP = PHI_MAX * 1.17;
      const R = half / PHI_MAX;
      const D = R * (1 - Math.cos(PHI_MAX)) + (isMd ? 80 : 40);
      trackRef.current?.style.setProperty(
        "transform",
        `translate3d(${-s.offset}px, 0, 0)`
      );
      for (let i = 0; i < innerRefs.current.length; i++) {
        const inner = innerRefs.current[i];
        const m = s.metrics[i];
        if (!inner || !m) continue;
        const dx = m.center - s.offset - half;
        // Clamp beyond the viewport edges so off-screen cards park at the
        // extreme pose instead of wrapping around the cylinder.
        const phi = Math.max(-CLAMP, Math.min(CLAMP, dx / R));
        const shiftX = R * Math.sin(phi) - phi * R;
        const z = -D + R * (1 - Math.cos(phi));
        const angle = (-phi * 180) / Math.PI;
        inner.style.transform = `translate3d(${shiftX.toFixed(1)}px, 0, ${z.toFixed(
          1
        )}px) rotateY(${angle.toFixed(2)}deg)`;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(64, now - (s.lastT || now));
      s.lastT = now;
      if (s.visible) {
        if (!s.paused && !s.dragging && !s.reduced) {
          let speed = CRUISE_SPEED;
          if (s.burstStart >= 0) {
            const bt = (now - s.burstStart) / 1000;
            speed += (BURST_SPEED - CRUISE_SPEED) * (bt / BURST_TAU) * Math.exp(1 - bt / BURST_TAU);
          }
          const v = s.offset + (speed * dt) / 1000;
          s.offset = s.lead + ((((v - s.lead) % s.setWidth) + s.setWidth) % s.setWidth);
        }
        write();
      }
      s.raf = requestAnimationFrame(loop);
    };

    const measureAndWrite = () => {
      measure();
      write();
    };
    measureAndWrite();
    s.raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        // Arm the intro flourish the first time the carousel becomes visible.
        if (entry.isIntersecting && s.burstStart < 0) s.burstStart = performance.now();
      },
      { rootMargin: "100px" }
    );
    if (viewportRef.current) io.observe(viewportRef.current);

    window.addEventListener("resize", measureAndWrite);
    return () => {
      cancelAnimationFrame(s.raf);
      io.disconnect();
      window.removeEventListener("resize", measureAndWrite);
    };
  }, [cards.length]);

  // Keep the scroll window `lead` px inside the doubled track on both sides.
  const wrap = (v: number) => {
    const s = st.current;
    return s.lead + ((((v - s.lead) % s.setWidth) + s.setWidth) % s.setWidth);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const s = st.current;
    s.dragging = true;
    s.moved = false;
    s.dragAccum = 0;
    s.lastX = e.clientX;
    // NOTE: no setPointerCapture here. Capturing retargets the subsequent
    // `click` to this viewport div, so the cards' onClick never fired — the
    // lightbox looked dead to real mouse clicks. Without capture, a drag that
    // leaves the strip simply ends via onPointerLeave, which is fine.
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (s.dragging) {
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.dragAccum += dx;
      if (Math.abs(s.dragAccum) > 5) s.moved = true;
      s.offset = wrap(s.offset - dx);
    }
  };
  const endDrag = () => {
    const s = st.current;
    s.dragging = false;
    // Clear the moved flag on the next tick so the click handler (which fires
    // right after pointerup) can still read it.
    setTimeout(() => (s.moved = false), 0);
  };

  return (
    <div
      ref={viewportRef}
      className="relative cursor-grab active:cursor-grabbing select-none py-8 md:py-12"
      style={{ perspective: "1000px", touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") st.current.paused = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") st.current.paused = false;
        endDrag();
      }}
    >
      <div
        ref={trackRef}
        className="relative flex items-center gap-2 md:gap-3 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {doubled.map((c, i) => (
          <div
            key={`${c.src}-${i}`}
            ref={(el) => { outerRefs.current[i] = el; }}
            // pointer-events-none: these flat layout boxes sit at z=0, IN FRONT
            // of the 3D-receded cards, and were swallowing every click. Let
            // clicks pass through to the transformed card (re-enabled below).
            className="flex-none pointer-events-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div ref={(el) => { innerRefs.current[i] = el; }} className="will-change-transform">
              <VideoFrame
                card={c}
                onSelect={(rect) => {
                  if (!st.current.moved) onOpen({ src: c.src, label: c.label, rect });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── A large auto-playing video inside a colored passe-partout frame ─────────
function VideoFrame({ card, onSelect }: { card: Card; onSelect: (rect: DOMRect) => void }) {
  const { label, src } = card;
  const frameRef = useRef<HTMLDivElement>(null);

  return (
    <div
      onClick={() => {
        // Hand the frame's on-screen rect to the lightbox so the zoom-in
        // animation can start exactly from this card.
        const el = frameRef.current;
        if (el) onSelect(el.getBoundingClientRect());
      }}
      className="group w-[280px] md:w-[35vw] relative cursor-pointer pointer-events-auto"
    >
      {/* small white label — ABOVE the video, not inside it */}
      <div className="mb-2 flex">
        <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] md:text-[12px] font-inter font-semibold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
          {label}
        </span>
      </div>
      {/* Frameless clip — the video reads directly on the black wall, with a
          subtle ring + shadow so it still lifts off.
          4:3 panel: 16:9 sources crop at the sides (object-cover). */}
      <div
        ref={frameRef}
        className="relative aspect-[4/3] rounded-[18px] md:rounded-[22px] overflow-hidden bg-[#0a0f1c] ring-1 ring-white/12 shadow-[0_34px_84px_-40px_rgba(0,0,0,0.85)] transition-shadow duration-300 ease-out group-hover:shadow-[0_44px_100px_-38px_rgba(0,0,0,0.95)]"
      >
        <video
          src={src}
          // First-frame poster (see /public/posters). It shows INSTANTLY while
          // the clip buffers, so cards are never empty on arrival.
          poster={src.replace(/^\//, "/posters/").replace(/\.mp4$/, ".jpg")}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          // Drag is handled by the carousel; the video shouldn't capture the pointer.
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

// ── Enlarged video overlay (portal so `fixed` escapes any transformed row) ──
// The panel ZOOMS OUT of the clicked card: on mount we measure the final
// centered box, compute the translate/scale that maps it back onto the card's
// on-screen rect (FLIP), start there and animate to identity. Exit reverses.
// The page behind is heavily blurred so only the video reads.
//
// IMPORTANT structure: the portal must sit OUTSIDE AnimatePresence, with the
// presence-managed motion tree INSIDE the portal. The reverse (a conditional
// child that itself calls createPortal) breaks exit tracking — the overlay
// opened fine but could never close.

/** Transform mapping the final box back onto the origin card rect. */
type ZoomDelta = { x: number; y: number; sx: number; sy: number };

function Lightbox({
  active,
  onClose,
}: {
  active: ActiveVideo | null;
  onClose: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      {active && <LightboxContent key={active.src} item={active} onClose={onClose} />}
    </AnimatePresence>,
    document.body
  );
}

function LightboxContent({
  item,
  onClose,
}: {
  item: ActiveVideo;
  onClose: () => void;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [delta, setDelta] = useState<ZoomDelta | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Prevent the page behind from scrolling while the lightbox is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Measure the final box BEFORE first paint, derive the origin transform.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || !item.rect) {
      // No origin rect (e.g. keyboard open): gentle center zoom fallback.
      setDelta({ x: 0, y: 36, sx: 0.88, sy: 0.88 });
      return;
    }
    const final = el.getBoundingClientRect();
    setDelta({
      x: item.rect.left - final.left,
      y: item.rect.top - final.top,
      sx: item.rect.width / final.width,
      sy: item.rect.height / final.height,
    });
  }, [item.rect]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-2xl p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* Invisible measuring twin of the video box (same layout), swapped
            for the animated panel as soon as the origin transform is known —
            the swap happens pre-paint, so nothing flashes. */}
        {delta === null ? (
          <div ref={measureRef} className="w-full aspect-video invisible" />
        ) : (
          <motion.div
            className="rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10"
            style={{ transformOrigin: "top left" }}
            initial={{ x: delta.x, y: delta.y, scaleX: delta.sx, scaleY: delta.sy }}
            animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
            exit={{ x: delta.x, y: delta.y, scaleX: delta.sx, scaleY: delta.sy, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <video
              src={item.src}
              autoPlay
              loop
              controls
              playsInline
              className="w-full aspect-video object-contain bg-black"
            />
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute -top-11 right-0 md:-right-2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, delay: 0.3 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
        <motion.p
          className="mt-3 text-center font-inter text-sm text-white/80"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {item.label}
        </motion.p>
      </div>
    </motion.div>
  );
}
