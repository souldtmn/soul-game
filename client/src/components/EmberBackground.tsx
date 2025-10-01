import React, { useEffect, useRef } from "react";

/** Subtle canvas embers drifting upward. Very light on perf. */
export default function EmberBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    type P = { x: number; y: number; s: number; vx: number; vy: number; life: number; max: number };
    const particles: P[] = Array.from({ length: 40 }, () => spawn());

    function spawn(): P {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 60,
        s: 0.5 + Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.05,
        vy: -0.2 - Math.random() * 0.25,
        life: 0,
        max: 2000 + Math.random() * 2000,
      };
    }

    function step(dt: number) {
      ctx.clearRect(0, 0, width, height);
      // faint vignette
      const g = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) / 4,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.2
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      for (let p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;
        if (p.y < -20 || p.life > p.max) Object.assign(p, spawn(), { y: height + Math.random() * 20 });

        const alpha = 0.12 + 0.08 * Math.sin(p.life * 0.01);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 160, 64, ${alpha})`;
        ctx.fill();
      }
    }

    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      step(Math.min(dt, 33));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}
