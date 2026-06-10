import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

/**
 * Bubble.io-style scrollytelling block.
 *
 *  Desktop (md+): two-column layout.
 *    - Left  : three text blocks stacked vertically. Each defines a scroll
 *              segment via min-height so the user reads them one at a time.
 *    - Right : a single visual area that `position: sticky`s in the middle
 *              of the viewport. The visual swaps to match whichever left
 *              block is currently centered, driven by IntersectionObserver.
 *    - A pagination dot row at the bottom shows the active index.
 *
 *  Mobile (< md): no sticky pattern. Each text block has its visual
 *  rendered inline right below it (single column, natural scroll).
 */

export type ScrollyFeature = {
  tag: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  /** Optional video URL. If absent, the image/gradient placeholder is shown. */
  video?: string;
  /** Optional image URL. Used when no video is set. */
  image?: string;
  /** CSS gradient for the placeholder (when no video/image). */
  grad: string;
  /** Optional CSS aspect-ratio for this feature's visual box (e.g. "2 / 1").
   *  Lets a video with a non-standard ratio fill its frame with no black
   *  letterbox bars and no side-cropping. Defaults to "16 / 10". */
  ratio?: string;
  /** Optional CSS object-position for the media (e.g. "left", "center").
   *  Useful when the box is narrower than the source: anchors which side
   *  stays in view while object-cover trims the rest. Defaults to "center". */
  objectPosition?: string;
};

/** Default aspect ratio for a feature visual box when none is specified. */
const DEFAULT_RATIO = "16 / 10";

type Props = {
  features: ScrollyFeature[];
};

function Visual({ feature, active = true }: { feature: ScrollyFeature; active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);

  // Play each video from frame 0 only once it is scrolled into view (and, in the
  // desktop sticky layout, only when it is the active block). Otherwise the
  // looping videos would already be mid-clip by the time the user reaches them,
  // so they'd never catch the clip begin.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !feature.video) return;
    const sync = () => {
      const shouldPlay = inViewRef.current && active;
      if (shouldPlay) {
        if (el.paused) {
          try { el.currentTime = 0; } catch { /* metadata not ready yet */ }
          void el.play().catch(() => {});
        }
      } else if (!el.paused) {
        el.pause();
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting; sync(); },
      { threshold: 0.4 },
    );
    io.observe(el);
    sync();
    return () => io.disconnect();
  }, [active, feature.video]);

  return (
    <div className="relative">
      {/* Colored "depth panel" behind the card — a soft blue→teal gradient
          glow, slightly larger than the card and pushed down/back, that the
          screen appears to rest on. Same idea as Bubble's mockups sitting on
          a light-blue gradient backing: it adds depth without a hard frame.
          NOTE: pure radial gradient, NO CSS blur filter — a blur() here is
          repainted every frame inside the sticky scroll section and caused
          scroll jank. The gradient's own transparent falloff gives the soft
          diffuse look without any filter cost. */}
      <div
        aria-hidden
        className="absolute -inset-x-3 sm:-inset-x-8 -bottom-10 -top-4 rounded-[40px] pointer-events-none -z-10 opacity-80 dark:opacity-55"
        style={{
          background:
            "radial-gradient(115% 100% at 50% 95%, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.12) 32%, rgba(13,148,136,0.08) 55%, transparent 78%)",
        }}
      />
      {/* Main video card — the blue glow shadow on the card itself layers on
          top of the panel above for a soft, diffuse atmospheric depth. */}
      <div
        className="relative w-full rounded-[24px] overflow-hidden border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]"
        style={{
          boxShadow:
            "0 20px 60px -10px rgba(96,165,250,0.20), 0 8px 24px -8px rgba(96,165,250,0.10), 0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        {feature.video ? (
          <video
            ref={videoRef}
            src={feature.video}
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full object-cover block"
            style={{
              aspectRatio: feature.ratio ?? DEFAULT_RATIO,
              objectPosition: feature.objectPosition ?? "center",
            }}
          />
        ) : feature.image ? (
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full object-cover block"
            style={{
              aspectRatio: feature.ratio ?? DEFAULT_RATIO,
              objectPosition: feature.objectPosition ?? "center",
            }}
          />
        ) : (
          // Empty placeholder — visual to be added later.
          <div
            className="relative w-full bg-gray-100 dark:bg-white/[0.03]"
            style={{ aspectRatio: feature.ratio ?? DEFAULT_RATIO }}
          >
            <div
              className="absolute inset-0 opacity-50 dark:opacity-30"
              style={{ background: feature.grad }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TextBlock({
  feature,
  isActive,
  children,
}: {
  feature: ScrollyFeature;
  isActive: boolean;
  children?: ReactNode;
}) {
  const Icon = feature.icon;
  return (
    <div
      className="transition-opacity duration-500 ease-out"
      // On desktop, dim inactive blocks slightly so the active one feels in focus.
      // On mobile, all blocks stay at full opacity.
      style={{ opacity: isActive ? 1 : undefined }}
    >
      <div className="md:transition-opacity md:duration-500" style={{ opacity: isActive ? 1 : 0.35 }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] flex items-center justify-center">
            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-500 dark:text-blue-400">
            {feature.tag}
          </span>
        </div>
        <h3 className="font-poppins font-semibold text-2xl md:text-4xl tracking-tight text-gray-900 dark:text-white leading-[1.15]">
          {feature.title}
        </h3>
        <p className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-lg">
          {feature.desc}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function FeaturesScrolly({ features }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Active-block detection via direct scroll math (not IntersectionObserver).
  //
  // Why not IntersectionObserver: it only fires at discrete threshold crossings,
  // and the browser may coalesce events during fast scrolls — which causes the
  // right-hand visual to lag behind the text the user has already scrolled past.
  //
  // Instead, on every scroll we compute which block's *center* is closest to a
  // trigger line at 40 % from the top of the viewport. RAF-throttled so we don't
  // do extra work, but we always recompute on the very next frame after a scroll
  // event — so the swap stays in sync even with fast wheel flicks.
  useEffect(() => {
    let raf = 0;

    const compute = () => {
      raf = 0;
      const viewportH = window.innerHeight;
      const triggerY = viewportH * 0.4;

      let bestIdx = 0;
      let bestDistance = Infinity;

      blockRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const distance = Math.abs(blockCenter - triggerY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIdx = i;
        }
      });

      setActiveIdx((prev) => (prev !== bestIdx ? bestIdx : prev));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute(); // initial sync

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [features.length]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Asymmetric columns: the visual (right) gets more width than the text
          (left) so the demo videos read larger. */}
      <div className="grid grid-cols-1 min-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-10 min-[560px]:gap-12 md:gap-16">
        {/* LEFT — stacked text blocks (with inline visual on mobile) */}
        <div className="flex flex-col">
          {features.map((feat, i) => (
            <div
              key={i}
              ref={(el) => { blockRefs.current[i] = el; }}
              data-idx={i}
              className="min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center py-10"
            >
              <TextBlock feature={feat} isActive={activeIdx === i}>
                {/* Mobile-only inline visual */}
                <div className="min-[560px]:hidden mt-8">
                  <Visual feature={feat} />
                </div>
              </TextBlock>
            </div>
          ))}

          {/* Pagination dots — desktop only */}
          <div className="hidden min-[560px]:flex items-center gap-2 mt-2 mb-8">
            {features.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeIdx
                    ? "w-6 bg-gradient-to-r from-[#3b82f6] to-[#0d9488]"
                    : "w-1.5 bg-gray-300 dark:bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — sticky visual that swaps based on active text block.
            Hidden on mobile (visuals appear inline in the left column instead).

            All visuals are always mounted and stacked absolutely; only opacity
            changes between them. This avoids the unmount/remount cost of
            <AnimatePresence> (the browser doesn't have to re-init the <video>
            element each swap) and keeps the crossfade fully overlapped — so a
            fast scroll never shows a blank moment between videos. */}
        <div className="hidden min-[560px]:block relative">
          <div className="sticky top-24 h-[calc(100vh-8rem)] max-h-[780px] flex items-center">
            <div
              className="relative w-full"
              style={{
                aspectRatio: features[activeIdx]?.ratio ?? DEFAULT_RATIO,
                transition: "aspect-ratio 450ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {features.map((feat, i) => {
                const isActive = i === activeIdx;
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.985 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      pointerEvents: isActive ? "auto" : "none",
                      zIndex: isActive ? 2 : 1,
                    }}
                  >
                    <Visual feature={feat} active={isActive} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
