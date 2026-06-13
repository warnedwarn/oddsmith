'use client';

import { useEffect, useRef } from 'react';

export function BlueprintCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // a smooth probability-like curve sampled across the width
    const points = 64;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // faint moving crosshairs
      const cx = (Math.sin(t * 0.0006) * 0.5 + 0.5) * w;
      const cy = (Math.cos(t * 0.0008) * 0.5 + 0.5) * h;
      ctx.strokeStyle = 'rgba(57,211,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(57,211,255,0.4)';
      ctx.strokeRect(cx - 7, cy - 7, 14, 14);

      // plotted probability curve
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * w;
        const phase = t * 0.0012;
        const y =
          h * 0.55 +
          Math.sin(i * 0.28 + phase) * h * 0.12 +
          Math.sin(i * 0.07 + phase * 1.7) * h * 0.06;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(57,211,255,0.55)';
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(57,211,255,0.6)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // measurement ticks along the bottom
      ctx.strokeStyle = 'rgba(57,211,255,0.25)';
      for (let x = 0; x < w; x += 56) {
        ctx.beginPath();
        ctx.moveTo(x, h - 6);
        ctx.lineTo(x, h - 14);
        ctx.stroke();
      }

      t += 16;
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };

    resize();
    if (!reduce) raf = requestAnimationFrame(draw);
    else draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
