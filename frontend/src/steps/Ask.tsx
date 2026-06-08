import { motion } from "framer-motion";
import type { SiteConfig } from "../types";
import { rise, stagger } from "../animations/variants";
import { DodgingNoButton } from "../components/DodgingNoButton";

export function Ask({ config, onYes }: { config: SiteConfig; onYes: () => void }) {
  const c = config.copy.ask;
  return (
    <motion.div className="inner" variants={stagger} initial="enter" animate="center">
      <motion.h2 className="headline" variants={rise}>
        {c.headline}
      </motion.h2>
      <motion.p className="sub" variants={rise}>
        {c.sub}
      </motion.p>
      <motion.div
        variants={rise}
        className="center-stack"
        style={{ marginTop: 12, width: "100%" }}
      >
        <motion.button
          className="btn"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.04 }}
          onClick={onYes}
        >
          {c.yes}
        </motion.button>
        <DodgingNoButton labels={c.noLabels} />
      </motion.div>
    </motion.div>
  );
}
