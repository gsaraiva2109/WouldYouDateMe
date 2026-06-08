import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}

const COLORS = ["#ffe7ad", "#e7c27d", "#e2a0b8", "#8a6cff", "#f6f1e9"];

/** Celebratory fireworks bursts over the night sky. */
export function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    let particles: Particle[] = [];
    let raf = 0;
    let last = performance.now();
    let nextBurst = 250;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x: number, y: number) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const n = 46 + Math.floor(Math.random() * 26);
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        const speed = 90 + Math.random() * 150;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 1 + Math.random() * 0.8,
          color,
          size: 1.5 + Math.random() * 1.8,
        });
      }
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // trailing fade for light streaks
      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = "rgba(7,6,15,0.22)";
      ctx!.fillRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      nextBurst -= dt * 1000;
      if (nextBurst <= 0) {
        burst(w * (0.2 + Math.random() * 0.6), h * (0.2 + Math.random() * 0.35));
        nextBurst = 600 + Math.random() * 900;
      }

      particles = particles.filter((p) => p.life < p.max);
      for (const p of particles) {
        p.life += dt;
        p.vy += 60 * dt; // gravity
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const alpha = Math.max(0, 1 - p.life / p.max);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}
