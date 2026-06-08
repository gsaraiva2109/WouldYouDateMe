import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * A "Não" button that refuses to be pressed: every approach (hover/tap/focus)
 * teleports it somewhere else within its own playzone — so it never covers the
 * "Sim" button above it — and cycles through cheeky labels.
 */
export function DodgingNoButton({ labels }: { labels: string[] }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const label = labels[Math.min(dodges, labels.length - 1)];

  // Center it at the top of the playzone on mount / resize.
  useLayoutEffect(() => {
    const center = () => {
      const zone = zoneRef.current;
      const btn = btnRef.current;
      if (!zone || !btn) return;
      setPos({ left: (zone.clientWidth - btn.offsetWidth) / 2, top: 0 });
    };
    center();
    window.addEventListener("resize", center);
    return () => window.removeEventListener("resize", center);
  }, []);

  function dodge() {
    const zone = zoneRef.current;
    const btn = btnRef.current;
    if (!zone || !btn) return;
    const maxLeft = Math.max(0, zone.clientWidth - btn.offsetWidth);
    const maxTop = Math.max(0, zone.clientHeight - btn.offsetHeight);
    setPos({
      left: Math.random() * maxLeft,
      top: Math.random() * maxTop,
    });
    setDodges((d) => d + 1);
  }

  return (
    <div
      ref={zoneRef}
      style={{ position: "relative", width: "100%", height: 132 }}
      aria-hidden="false"
    >
      <motion.button
        ref={btnRef}
        type="button"
        className="btn btn-ghost"
        style={{ position: "absolute" }}
        animate={{ left: pos.left, top: pos.top }}
        transition={{ type: "spring", stiffness: 700, damping: 22 }}
        onHoverStart={dodge}
        onPointerDown={(e) => {
          e.preventDefault();
          dodge();
        }}
        onFocus={dodge}
        aria-label="Não (boa sorte clicando)"
      >
        {label}
      </motion.button>
    </div>
  );
}
