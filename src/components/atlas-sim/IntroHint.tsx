/**
 * Atlas simulation — "interactive zone" intro cue.
 *
 * When the simulation scrolls into view, a short (~1.8s) animation plays over
 * the whole sim: a tapping cursor + expanding ripples + a label. Its only job
 * is to signal « this is not a static image, it's interactive » before the
 * guided tour begins. It replays every time the user returns to the section.
 *
 * Flow: enter view → intro cue (1.8s) → guided tour starts (first time only;
 * on later returns the cue replays but the tour is left to the restart pill).
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import { useSim } from "./store";

const HINT_MS = 1900;

export default function IntroHint() {
  const { state, actions } = useSim();
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  // Refs mirror state so the IntersectionObserver callback never reads stale
  // closures.
  const wasOutRef = useRef(true);
  const tourStartedRef = useRef(false);
  const tourActiveRef = useRef(false);
  tourActiveRef.current = state.tourStep != null;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    // Start the guided tour after the very first cue only, so returning to the
    // section replays the "interactive" hint without re-forcing the full tour.
    if (!tourStartedRef.current) {
      tourStartedRef.current = true;
      actions.startTour();
    }
  };

  const play = () => {
    if (tourActiveRef.current) return; // don't cover an active tour
    setPlaying(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(finish, HINT_MS);
  };

  useEffect(() => {
    const el = ref.current?.closest("[data-sim-root]");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio < 0.12) {
            wasOutRef.current = true;
          } else if (e.intersectionRatio > 0.5 && wasOutRef.current) {
            wasOutRef.current = false;
            play();
          }
        }
      },
      { threshold: [0, 0.12, 0.5, 1] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-[56]">
      <AnimatePresence>
        {playing && (
          <motion.div
            className="pointer-events-auto absolute inset-0 flex cursor-pointer flex-col items-center justify-center"
            style={{
              background: "rgba(11,16,32,0.5)",
              backdropFilter: "blur(1.5px)",
              WebkitBackdropFilter: "blur(1.5px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={finish}
            title="Cliquez pour commencer"
          >
            {/* Tapping cursor with expanding ripple rings */}
            <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full border-2 border-white/70"
                  style={{ width: 44, height: 44 }}
                  initial={{ scale: 0.5, opacity: 0.7 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeOut", repeat: Infinity, delay: i * 0.7 }}
                />
              ))}
              <motion.div
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#3b82f6] shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                animate={{ scale: [1, 0.82, 1] }}
                transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity, times: [0, 0.3, 0.6] }}
              >
                <MousePointerClick size={24} strokeWidth={2.4} />
              </motion.div>
            </div>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="font-poppins text-[18px] font-semibold tracking-[-0.01em] text-white">
                Démo interactive
              </div>
              <div className="mt-1 font-inter text-[13px] text-white/75">
                Cliquez et explorez le logiciel, comme dans l'app.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
