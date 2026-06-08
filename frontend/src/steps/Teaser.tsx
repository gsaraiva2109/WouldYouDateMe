import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import type { SiteConfig } from "../types";

export function Teaser({ config, onNext }: { config: SiteConfig; onNext: () => void }) {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [revealed, setRevealed] = useState(false);
  const c = config.copy.teaser;
  const name = config.girlName;

  // Cinematic intro: the name materializes from scattered, blurred shards of
  // light, settles with a gentle shimmer, then the rest of the screen fades up.
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.innerHTML = "";
    const spans = [...name].map((ch) => {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.display = "inline-block";
      s.style.willChange = "transform, opacity, filter";
      // The split letters can't inherit the parent's clipped gradient, so paint
      // them gold directly (otherwise they render transparent / invisible).
      s.style.color = "#ffe7ad";
      el.appendChild(s);
      return s;
    });

    if (reduce) {
      gsap.set(spans, { opacity: 1, x: 0, y: 0, rotateZ: 0, filter: "blur(0px)" });
      setRevealed(true);
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setRevealed(true) });
    tl.from(spans, {
      opacity: 0,
      scale: 2.4,
      x: () => gsap.utils.random(-160, 160),
      y: () => gsap.utils.random(-120, 120),
      rotateZ: () => gsap.utils.random(-40, 40),
      filter: "blur(14px)",
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
    })
      .to(
        spans,
        {
          // shimmer pulse once landed
          textShadow: "0 0 26px rgba(255,231,173,0.85)",
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          stagger: 0.05,
          ease: "sine.inOut",
        },
        "-=0.35",
      )
      .to(
        spans,
        {
          y: -8,
          duration: 0.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
          stagger: 0.04,
        },
        "-=0.4",
      );

    return () => {
      tl.kill();
    };
  }, [name]);

  return (
    <div className="inner">
      <motion.p
        className="eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {c.eyebrow}
      </motion.p>

      <h1 ref={nameRef} className="display" aria-label={name}>
        {name}
      </h1>

      <motion.p
        className="hand"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        {c.headline}
      </motion.p>

      <motion.p
        className="sub"
        initial={{ opacity: 0, y: 12 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {c.sub}
      </motion.p>

      <motion.button
        className="btn"
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={revealed ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
      >
        {c.cta}
      </motion.button>
    </div>
  );
}
