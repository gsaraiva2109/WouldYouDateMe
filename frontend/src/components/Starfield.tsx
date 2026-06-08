import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number; // base brightness
  tw: number; // twinkle speed
  ph: number; // phase
  drift: number;
}

interface Shooting {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

/**
 * Lightweight night-sky: twinkling, slowly drifting stars + the occasional
 * shooting star. Caps DPR, pauses when the tab is hidden, and respects
 * prefers-reduced-motion (renders a still field).
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let shooting: Shooting | null = null;
    let raf = 0;
    let last = performance.now();
    let nextShoot = 2500 + Math.random() * 4000;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.round((w * h) / 9000));
      stars = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        base: Math.random() * 0.5 + 0.35,
        tw: Math.random() * 1.6 + 0.4,
        ph: Math.random() * Math.PI * 2,
        drift: Math.random() * 6 + 2,
      }));
    }

    function drawStar(s: Star, alpha: number) {
      ctx!.globalAlpha = alpha;
      const warm = s.r > 1.1;
      ctx!.fillStyle = warm ? "#ffe7ad" : "#f6f1e9";
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx!.fill();
      if (s.r > 1) {
        // soft glow for the brighter ones
        ctx!.globalAlpha = alpha * 0.25;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx!.clearRect(0, 0, w, h);

      for (const s of stars) {
        const tw = reduce ? s.base : s.base + Math.sin(now * 0.001 * s.tw + s.ph) * 0.35;
        drawStar(s, Math.max(0, Math.min(1, tw)));
        if (!reduce) {
          s.y += s.drift * dt * 0.15;
          if (s.y > h + 4) {
            s.y = -4;
            s.x = Math.random() * w;
          }
        }
      }

      if (!reduce) {
        nextShoot -= dt * 1000;
        if (!shooting && nextShoot <= 0) {
          const startX = Math.random() * w * 0.6;
          shooting = {
            x: startX,
            y: Math.random() * h * 0.4,
            vx: 380 + Math.random() * 220,
            vy: 160 + Math.random() * 120,
            life: 0,
            max: 0.9,
          };
          nextShoot = 6000 + Math.random() * 7000;
        }
        if (shooting) {
          shooting.life += dt;
          const t = shooting.life / shooting.max;
          shooting.x += shooting.vx * dt;
          shooting.y += shooting.vy * dt;
          const tailX = shooting.x - shooting.vx * 0.06;
          const tailY = shooting.y - shooting.vy * 0.06;
          const grad = ctx!.createLinearGradient(tailX, tailY, shooting.x, shooting.y);
          grad.addColorStop(0, "rgba(255,231,173,0)");
          grad.addColorStop(1, "rgba(255,231,173,0.9)");
          ctx!.globalAlpha = Math.max(0, 1 - t);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.moveTo(tailX, tailY);
          ctx!.lineTo(shooting.x, shooting.y);
          ctx!.stroke();
          if (t >= 1) shooting = null;
        }
      }

      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
