import { motion } from "framer-motion";
import type { Activity as ActivityType, SiteConfig } from "../types";
import { rise, stagger } from "../animations/variants";

export function Activity({
  config,
  selected,
  onSelect,
}: {
  config: SiteConfig;
  selected: ActivityType | null;
  onSelect: (a: ActivityType) => void;
}) {
  const c = config.copy.activity;
  return (
    <motion.div className="inner" variants={stagger} initial="enter" animate="center">
      <motion.h2 className="headline" variants={rise}>
        {c.headline}
      </motion.h2>
      <motion.p className="sub" variants={rise}>
        {c.sub}
      </motion.p>
      <motion.div className="card-grid" variants={rise}>
        {config.activities.map((a) => (
          <motion.button
            key={a.id}
            className={`card${selected?.id === a.id ? " selected" : ""}`}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={() => onSelect(a)}
          >
            <span className="emoji">{a.emoji}</span>
            <span className="label">{a.label}</span>
            {a.blurb && <span className="blurb">{a.blurb}</span>}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
