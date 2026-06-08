import { useState } from "react";
import { motion } from "framer-motion";
import type { SiteConfig } from "../types";
import { rise, stagger } from "../animations/variants";
import { BackLink } from "../components/BackLink";

export function Message({
  config,
  submitting,
  error,
  onSubmit,
  onBack,
}: {
  config: SiteConfig;
  submitting: boolean;
  error: string | null;
  onSubmit: (message: string) => void;
  onBack: () => void;
}) {
  const c = config.copy.message;
  const [text, setText] = useState("");

  return (
    <motion.div className="inner" variants={stagger} initial="enter" animate="center">
      <motion.h2 className="headline" variants={rise}>
        {c.headline}
      </motion.h2>
      <motion.p className="sub" variants={rise}>
        {c.sub}
      </motion.p>
      <motion.textarea
        className="note"
        variants={rise}
        placeholder={c.placeholder}
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && (
        <motion.p className="sub" variants={rise} style={{ color: "var(--hot)" }}>
          {error}
        </motion.p>
      )}
      <motion.button
        className="btn"
        variants={rise}
        disabled={submitting}
        style={{ opacity: submitting ? 0.6 : 1 }}
        whileTap={{ scale: submitting ? 1 : 0.96 }}
        onClick={() => onSubmit(text.trim())}
      >
        {submitting ? "Enviando…" : c.submit}
      </motion.button>
      <BackLink onClick={onBack} />
    </motion.div>
  );
}
