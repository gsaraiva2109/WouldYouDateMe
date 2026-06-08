import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#ffe7ad", "#e7c27d", "#e2a0b8", "#8a6cff", "#f6f1e9"];

export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.8,
        rotate: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        drift: (Math.random() - 0.5) * 120,
      })),
    [count],
  );

  return (
    <>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="confetti"
          style={{ left: `${p.left}vw`, background: p.color }}
          initial={{ y: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            x: p.drift,
            opacity: [0, 1, 1, 0.9],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      ))}
    </>
  );
}
