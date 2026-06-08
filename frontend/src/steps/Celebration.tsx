import { motion } from "framer-motion";
import type { Activity, SelectedSlot, SiteConfig, Venue } from "../types";
import { rise, stagger } from "../animations/variants";
import { Confetti } from "../components/Confetti";
import { Fireworks } from "../components/Fireworks";

export function Celebration({
  config,
  activity,
  slot,
  place,
  suggestion,
  message,
}: {
  config: SiteConfig;
  activity: Activity | null;
  slot: SelectedSlot | null;
  place: Venue | null;
  suggestion: string | null;
  message: string | null;
}) {
  const placeText = place ? `${place.name} · ${place.area}` : suggestion;
  const c = config.copy.celebration;
  return (
    <>
      <Fireworks />
      <Confetti count={70} />
      <motion.div className="inner" variants={stagger} initial="enter" animate="center">
        <motion.div
          variants={rise}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
        >
          <h2 className="display" style={{ fontSize: "clamp(40px,13vw,76px)" }}>
            {c.headline}
          </h2>
        </motion.div>

        <motion.p className="sub" variants={rise}>
          {c.sub}
        </motion.p>

        <motion.div
          className="recap"
          variants={rise}
          animate={{
            boxShadow: [
              "0 0 0px rgba(231,194,125,0.0)",
              "0 0 36px rgba(231,194,125,0.35)",
              "0 0 0px rgba(231,194,125,0.0)",
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="hand">{c.recapTitle}</div>
          {activity && (
            <div className="row">
              <span className="k">Programa</span>
              <span className="v">
                {activity.emoji} {activity.label}
              </span>
            </div>
          )}
          {slot && (
            <div className="row">
              <span className="k">Quando</span>
              <span className="v">
                {slot.day} · {slot.time}
              </span>
            </div>
          )}
          {placeText && (
            <div className="row">
              <span className="k">Onde</span>
              <span className="v">{placeText}</span>
            </div>
          )}
          {message && (
            <div className="row">
              <span className="k">Recado</span>
              <span className="v" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                "{message}"
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
