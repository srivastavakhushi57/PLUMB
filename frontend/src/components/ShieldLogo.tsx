import React from 'react';

interface ShieldLogoProps {
  size?: number;
  glow?: boolean;
  className?: string;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({ size = 36, glow = true, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="PLUMB Shield Logo"
    >
      {/* Outer subtle glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 0, 0.45) 0%, rgba(188, 2, 2, 0.2) 50%, transparent 75%)',
            transform: 'scale(1.35)',
          }}
        />
      )}

      {/* SVG Shield Motif */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Shield Gradient: Dark crimson to deep red */}
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BC0202" />
            <stop offset="50%" stopColor="#830000" />
            <stop offset="100%" stopColor="#141414" />
          </linearGradient>

          {/* Core Bright Red Plumb Line / Accent */}
          <linearGradient id="plumbLineGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="70%" stopColor="#BC0202" />
            <stop offset="100%" stopColor="#830000" />
          </linearGradient>

          {/* Glass Specular Highlight */}
          <linearGradient id="specular" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shield Outer Outline with Crimson border */}
        <path
          d="M50 8 L85 24 C85 58 50 88 50 88 C50 88 15 58 15 24 L50 8 Z"
          fill="url(#shieldGrad)"
          stroke="#BC0202"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Glass Specular Surface Overlay */}
        <path
          d="M50 10 L82 25 C82 50 54 75 50 84 C48 76 30 60 22 45 L50 10 Z"
          fill="url(#specular)"
        />

        {/* Vertical Precision Plumb Bob / Diamond Center */}
        {/* The Plumb Line */}
        <line
          x1="50"
          y1="18"
          x2="50"
          y2="64"
          stroke="url(#plumbLineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Precision Plumb Weight (faceted inverted triangle/diamond) */}
        <polygon
          points="50,76 43,62 57,62"
          fill="#FF0000"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* Precision Horizon Ring */}
        <circle
          cx="50"
          cy="36"
          r="9"
          stroke="#F5F5F5"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          fill="rgba(0, 0, 0, 0.4)"
        />
        <circle cx="50" cy="36" r="3" fill="#FF0000" />
      </svg>
    </div>
  );
};
