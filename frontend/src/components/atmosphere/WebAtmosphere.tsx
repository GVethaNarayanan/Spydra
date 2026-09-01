import React, { useEffect, useRef, useState } from 'react';
import { SpiderMark } from './SilkGate';

type WebAtmosphereProps = {
  onSpiderClick?: () => void;
};

/**
 * Corner web drawn via canvas for buttery-smooth animation.
 * Falls back to the SVG approach if canvas isn't available.
 */
function CornerWebCanvas({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 280;
    canvas.width = SIZE * devicePixelRatio;
    canvas.height = SIZE * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    let t = 0;
    const spokes = 6;
    const rings = 5;

    function draw() {
      t += 0.003;
      ctx!.clearRect(0, 0, SIZE, SIZE);
      ctx!.strokeStyle = 'rgba(232,195,106,0.22)';
      ctx!.lineWidth = 0.6;

      // Spokes from corner
      for (let i = 0; i < spokes; i++) {
        const a = (i / (spokes - 1)) * (Math.PI / 2);
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(Math.cos(a) * SIZE, Math.sin(a) * SIZE);
        ctx!.stroke();
      }

      // Curved rings
      for (let r = 1; r <= rings; r++) {
        const radius = (r / rings) * SIZE * 0.9;
        ctx!.beginPath();
        for (let i = 0; i <= spokes * 4; i++) {
          const a = (i / (spokes * 4)) * (Math.PI / 2);
          const wobble = Math.sin(a * 5 + t * 2 + r) * radius * 0.015;
          const px = Math.cos(a) * (radius + wobble);
          const py = Math.sin(a) * (radius + wobble);
          if (i === 0) ctx!.moveTo(px, py);
          else ctx!.lineTo(px, py);
        }
        const shimmer = 0.16 + 0.06 * Math.sin(t + r * 0.7);
        ctx!.strokeStyle = `rgba(232,195,106,${shimmer})`;
        ctx!.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const transforms: Record<string, string> = {
    tl: 'none',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1)',
  };
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        width: 'min(280px, 28vw)',
        height: 'min(280px, 28vw)',
        opacity: 0.85,
        transform: transforms[position],
        pointerEvents: 'none',
        ...positions[position],
      }}
      aria-hidden
    />
  );
}

export function WebAtmosphere({ onSpiderClick }: WebAtmosphereProps) {
  const [spiderHovered, setSpiderHovered] = useState(false);

  return (
    <div className="webAtmos" aria-hidden>
      <CornerWebCanvas position="tl" />
      <CornerWebCanvas position="tr" />
      <CornerWebCanvas position="bl" />
      <CornerWebCanvas position="br" />
      <button
        type="button"
        className={`webAtmos__hanger ${spiderHovered ? 'is-hovered' : ''}`}
        title="Spin a demo trace"
        onClick={onSpiderClick}
        onMouseEnter={() => setSpiderHovered(true)}
        onMouseLeave={() => setSpiderHovered(false)}
      >
        <span className="webAtmos__silk" />
        <SpiderMark className="webAtmos__spider" />
        <span className="webAtmos__tooltip">Click to spin demo</span>
      </button>
    </div>
  );
}
