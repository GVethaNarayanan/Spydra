import React, { useEffect, useRef } from 'react';

type SilkGateProps = {
  entering: boolean;
  onEnter: () => void;
};

/**
 * SilkGate — the cinematic entry screen for Spydra.
 * Features: canvas-drawn procedural web, hanging spider with cursor-tracking eyes,
 * particle effects, and a dramatic web-explosion exit transition.
 */
export function SilkGate({ entering, onEnter }: SilkGateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
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
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h };
    };
    window.addEventListener('mousemove', onMove);

    // Particle pool
    type P = { x: number; y: number; vx: number; vy: number; r: number; o: number; phase: number };
    const particles: P[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.2 - 0.05,
      r: Math.random() * 1.6 + 0.3,
      o: Math.random() * 0.3 + 0.06,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const SPOKES = 20;
    const RINGS = [0.08, 0.15, 0.24, 0.35, 0.48, 0.64];
    const cx = w / 2;
    const cy = h * 0.42;
    const maxR = Math.min(w, h) * 0.44;

    function drawWeb(progress: number) {
      const lim = Math.min(progress, 1);
      ctx!.save();
      ctx!.globalAlpha = 0.45;
      // Spokes
      for (let i = 0; i < SPOKES; i++) {
        const spokeProg = Math.min(lim / 0.4, 1);
        if (spokeProg <= 0) continue;
        const a = (i / SPOKES) * Math.PI * 2;
        const len = maxR * spokeProg;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        ctx!.strokeStyle = `rgba(232,195,106,${0.25 * spokeProg})`;
        ctx!.lineWidth = 0.7;
        ctx!.stroke();
      }
      // Rings
      RINGS.forEach((ringPct, ri) => {
        const ringStart = 0.25 + ri * 0.1;
        const ringProg = Math.max(0, Math.min((lim - ringStart) / 0.15, 1));
        if (ringProg <= 0) return;
        const r = maxR * ringPct;
        ctx!.beginPath();
        for (let i = 0; i <= SPOKES; i++) {
          const a = (i / SPOKES) * Math.PI * 2;
          const wobble = Math.sin(a * 3 + t) * r * 0.02;
          const px = cx + Math.cos(a) * (r + wobble);
          const py = cy + Math.sin(a) * (r + wobble);
          if (i === 0) ctx!.moveTo(px, py);
          else ctx!.lineTo(px, py);
        }
        ctx!.closePath();
        ctx!.strokeStyle = `rgba(232,195,106,${0.2 * ringProg})`;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();
      });
      ctx!.restore();
    }

    function drawParticles() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.01;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        const shimmer = 0.5 + 0.5 * Math.sin(p.phase + t * 2);
        const alpha = p.o * (0.5 + 0.5 * shimmer);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(232,195,106,${alpha})`;
        ctx!.fill();
      }
    }

    const startTime = performance.now();
    function animate() {
      t += 0.006;
      const elapsed = (performance.now() - startTime) / 1000;
      const webProgress = Math.min(elapsed / 2.5, 1);

      ctx!.clearRect(0, 0, w, h);
      drawWeb(webProgress);
      drawParticles();

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  const mx = mouseRef.current;

  return (
    <div className={['silkGate', entering && 'is-entering'].filter(Boolean).join(' ')} role="dialog" aria-label="Enter Spydra">
      <div className="silkGate__vignette" aria-hidden />
      <canvas ref={canvasRef} className="silkGate__canvas" aria-hidden />

      {/* Decorative SVG web (fallback + extra detail) */}
      <svg className="silkGate__web" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g className="silkGate__strands">
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i / 20) * Math.PI * 2;
            return (
              <line
                key={`r${i}`}
                x1="50"
                y1="50"
                x2={50 + Math.cos(a) * 72}
                y2={50 + Math.sin(a) * 72}
              />
            );
          })}
          {[10, 18, 28, 40, 54].map((r) => (
            <polygon
              key={r}
              className="silkGate__ring"
              points={Array.from({ length: 20 })
                .map((_, i) => {
                  const a = (i / 20) * Math.PI * 2 + 0.06;
                  return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
                })
                .join(' ')}
            />
          ))}
        </g>
      </svg>

      <div className="silkGate__spiderWrap" aria-hidden>
        <div className="silkGate__thread" />
        <SpiderMark className="silkGate__spider" />
      </div>

      <div className="silkGate__copy">
        <p className="silkGate__kicker">HackVerse · Runtime Governance</p>
        <h1 className="silkGate__title">Spydra</h1>
        <p className="silkGate__tag">The web that watches your AI agents.</p>
        <p className="silkGate__lede">
          Every tool call, HTTP request, and shell command is a strand in the web.
          Spydra sits at the center — observing, scoring, and severing the strands
          that should never reach production.
        </p>
        <button type="button" className="silkGate__enter" onClick={onEnter} disabled={entering}>
          <span className="silkGate__enterIcon">🕸️</span>
          <span>{entering ? 'Spinning the web…' : 'Enter the Web'}</span>
        </button>
        <p className="silkGate__hint">Press Enter ↵</p>
      </div>

      <div className="silkGate__burst" aria-hidden />

      {/* Decorative silk strands at edges */}
      <div className="silkGate__edgeStrands" aria-hidden>
        <svg className="silkGate__edgeSvg silkGate__edgeSvg--tl" viewBox="0 0 200 200">
          <g stroke="rgba(232,195,106,0.18)" strokeWidth="0.6" fill="none">
            <path d="M0 0 L180 30 M0 0 L140 80 M0 0 L80 140 M0 0 L30 180" />
            <path d="M25 0 Q32 32 0 25" />
            <path d="M60 0 Q65 58 0 60" />
            <path d="M100 0 Q98 90 0 100" />
            <path d="M150 0 Q142 130 0 150" />
          </g>
        </svg>
        <svg className="silkGate__edgeSvg silkGate__edgeSvg--br" viewBox="0 0 200 200">
          <g stroke="rgba(232,195,106,0.15)" strokeWidth="0.6" fill="none">
            <path d="M200 200 L20 170 M200 200 L60 120 M200 200 L120 60 M200 200 L170 20" />
            <path d="M175 200 Q168 168 200 175" />
            <path d="M140 200 Q135 142 200 140" />
            <path d="M100 200 Q102 110 200 100" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function SpiderMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* Body */}
      <ellipse cx="40" cy="32" rx="10" ry="8" fill="#1a1510" stroke="#e8c36a" strokeWidth="1.2" />
      <ellipse cx="40" cy="48" rx="13" ry="15" fill="#120f0c" stroke="#e8c36a" strokeWidth="1.2" />
      {/* Abdomen pattern */}
      <path d="M34 42 Q40 38 46 42" stroke="rgba(232,195,106,0.3)" strokeWidth="0.6" fill="none" />
      <path d="M33 47 Q40 42 47 47" stroke="rgba(232,195,106,0.25)" strokeWidth="0.6" fill="none" />
      <path d="M34 52 Q40 47 46 52" stroke="rgba(232,195,106,0.2)" strokeWidth="0.6" fill="none" />
      {/* Eyes — glowing */}
      <circle cx="36" cy="30" r="2" fill="#f4e3b0" className="spiderEye" />
      <circle cx="44" cy="30" r="2" fill="#f4e3b0" className="spiderEye" />
      <circle cx="36" cy="30" r="3.5" fill="none" stroke="rgba(232,195,106,0.3)" strokeWidth="0.4" className="spiderEyeGlow" />
      <circle cx="44" cy="30" r="3.5" fill="none" stroke="rgba(232,195,106,0.3)" strokeWidth="0.4" className="spiderEyeGlow" />
      {/* Small inner eyes */}
      <circle cx="34" cy="28" r="0.9" fill="rgba(244,227,176,0.5)" />
      <circle cx="46" cy="28" r="0.9" fill="rgba(244,227,176,0.5)" />
      {/* Legs — 4 pairs with articulation */}
      <path d="M30 29 C16 20 10 10 6 4" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M50 29 C64 20 70 10 74 4" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M29 34 C12 30 6 24 2 18" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M51 34 C68 30 74 24 78 18" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M29 44 C10 46 6 54 4 64" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M51 44 C70 46 74 54 76 64" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M31 52 C18 60 14 68 10 76" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      <path d="M49 52 C62 60 66 68 70 76" stroke="#d7c28a" strokeWidth="1.1" fill="none" className="spiderLeg" />
      {/* Fangs */}
      <path d="M37 37 L35 41" stroke="#e8c36a" strokeWidth="0.8" fill="none" />
      <path d="M43 37 L45 41" stroke="#e8c36a" strokeWidth="0.8" fill="none" />
    </svg>
  );
}
