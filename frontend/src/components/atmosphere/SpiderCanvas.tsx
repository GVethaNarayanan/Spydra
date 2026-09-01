import React, { useEffect, useRef } from 'react';

/*
 * SpiderCanvas — a full-screen canvas layer that renders:
 *  1. Floating silk particles drifting slowly
 *  2. Mouse-reactive glow near the cursor
 *
 * Sits behind all UI content (z-index: 0, pointer-events: none).
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
}

export function SpiderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * devicePixelRatio;
      canvas!.height = h * devicePixelRatio;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function initParticles() {
      const count = Math.min(60, Math.floor((w * h) / 28000));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.15 - 0.08,
        radius: Math.random() * 1.5 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    initParticles();

    const onResize = () => { resize(); initParticles(); };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);

    let t = 0;
    function animate() {
      t += 0.008;
      ctx!.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw floating silk particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.012;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const shimmer = 0.5 + 0.5 * Math.sin(p.phase + t * 2);
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glow = dist < 200 ? (1 - dist / 200) * 0.6 : 0;
        const alpha = p.opacity * (0.6 + 0.4 * shimmer) + glow;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius * (1 + glow * 0.8), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(232, 195, 106, ${Math.min(alpha, 0.7)})`;
        ctx!.fill();

        // Draw tiny glow halo for brighter particles
        if (alpha > 0.25) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(232, 195, 106, ${alpha * 0.12})`;
          ctx!.fill();
        }
      }

      // Draw subtle mouse-follow glow
      if (mx > 0 && my > 0) {
        const gradient = ctx!.createRadialGradient(mx, my, 0, mx, my, 120);
        gradient.addColorStop(0, 'rgba(232, 195, 106, 0.04)');
        gradient.addColorStop(1, 'rgba(232, 195, 106, 0)');
        ctx!.fillStyle = gradient;
        ctx!.fillRect(mx - 120, my - 120, 240, 240);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="spiderCanvas"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
