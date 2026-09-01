import React from 'react';

/**
 * WebLoadingSpinner — a spider-web themed loading indicator.
 * A circular web pattern draws itself with a pulsing spider icon at center.
 */
export function WebLoadingSpinner({ size = 48, className }: { size?: number; className?: string }) {
  const r = size / 2 - 4;
  const rings = [r * 0.3, r * 0.55, r * 0.8];
  const spokes = 8;

  return (
    <div className={`webSpinner ${className || ''}`} style={{ width: size, height: size }} aria-label="Loading" role="status">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="webSpinner__svg">
        {/* Spokes */}
        {Array.from({ length: spokes }, (_, i) => {
          const angle = (i / spokes) * Math.PI * 2 - Math.PI / 2;
          const x2 = size / 2 + Math.cos(angle) * r;
          const y2 = size / 2 + Math.sin(angle) * r;
          return (
            <line
              key={`s${i}`}
              x1={size / 2}
              y1={size / 2}
              x2={x2}
              y2={y2}
              stroke="rgba(232,195,106,0.35)"
              strokeWidth="0.8"
              className="webSpinner__spoke"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          );
        })}
        {/* Concentric rings */}
        {rings.map((ringR, ri) => (
          <polygon
            key={`r${ri}`}
            points={Array.from({ length: spokes }, (_, i) => {
              const angle = (i / spokes) * Math.PI * 2 - Math.PI / 2;
              return `${size / 2 + Math.cos(angle) * ringR},${size / 2 + Math.sin(angle) * ringR}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(232,195,106,0.4)"
            strokeWidth="0.8"
            className="webSpinner__ring"
            style={{ animationDelay: `${ri * 0.15 + 0.3}s` }}
          />
        ))}
        {/* Center spider dot */}
        <circle cx={size / 2} cy={size / 2} r="2.5" fill="#e8c36a" className="webSpinner__center" />
      </svg>
    </div>
  );
}
