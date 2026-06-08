import type { Variants } from "framer-motion";

// Screen-to-screen transition for the journey (AnimatePresence).
export const screenVariants: Variants = {
  enter: { opacity: 0, y: 30, scale: 0.97, filter: "blur(10px)" },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -28,
    scale: 0.97,
    filter: "blur(10px)",
    transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
  },
};

// Staggered children for content within a screen.
export const stagger: Variants = {
  center: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const rise: Variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
