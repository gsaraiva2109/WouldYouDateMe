import { motion } from "framer-motion";

export function BackLink({ onClick, label = "← voltar" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      whileHover={{ opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: "none",
        border: "none",
        color: "var(--ink-dim)",
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 17,
        cursor: "pointer",
        padding: "6px 12px",
        marginTop: 2,
      }}
    >
      {label}
    </motion.button>
  );
}
