import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const isHero = size === 'hero';

  // Even larger, bolder dimensions for maximum visibility
  const width = isSmall ? 180 : isHero ? 440 : isLarge ? 360 : 270;
  const height = isSmall ? 52 : isHero ? 126 : isLarge ? 104 : 78;

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 350 96"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible filter drop-shadow-lg"
        aria-label="Dr sAIhib - Your Smart Health Partner"
        role="img"
      >
        <defs>
          {/* Deepest, high-contrast solid medical navy & teal gradient */}
          <linearGradient id="stethDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004D40" />
            <stop offset="30%" stopColor="#00695C" />
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Deep dark AI badge container gradient */}
          <linearGradient id="aiHighlightGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004D40" />
            <stop offset="50%" stopColor="#00695C" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>

          {/* Pulse gradient */}
          <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>

          {/* High-visibility drop shadow */}
          <filter id="crispShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Stethoscope Earpieces & Metal Tubes (Thicker, Deep Dark Navy/Teal) */}
        <g stroke="url(#stethDarkGrad)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left earpiece */}
          <path d="M 14 18 C 14 7, 28 7, 28 24 L 28 40 C 28 50, 44 50, 44 40 L 44 24 C 44 7, 58 7, 58 18" />
          {/* Ear tips in pitch dark navy with crisp highlight */}
          <circle cx="14" cy="18" r="5" fill="#020617" stroke="#004D40" strokeWidth="2" />
          <circle cx="58" cy="18" r="5" fill="#020617" stroke="#004D40" strokeWidth="2" />
          {/* Flexible stethoscope tubing looping into chestpiece bell */}
          <path d="M 36 45 C 36 62, 18 72, 28 82 C 38 92, 54 80, 64 68 C 68 60, 72 54, 80 54" />
        </g>

        {/* Stethoscope Chestpiece Bell with ECG Heartbeat Pulse Badge */}
        <g transform="translate(74, 50)">
          {/* Heavy outer metallic disc */}
          <circle cx="18" cy="18" r="18" fill="#020617" stroke="#004D40" strokeWidth="3" filter="url(#crispShadow)" />
          {/* Inner diaphragm */}
          <circle cx="18" cy="18" r="13.5" fill="#00382E" />
          {/* ECG Heartbeat pulse wave inside chestpiece - pure crisp white & thick */}
          <path
            d="M 7 18 L 11 18 L 13 11 L 18 25 L 21 13 L 24 21 L 29 18"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Main Brand Typography: "Dr sAIhib" - Maximum contrast, dark & visible */}
        <g transform="translate(114, 52)">
          {/* "Dr " - Deep pitch navy/black */}
          <text
            x="0"
            y="0"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="40"
            fontWeight="950"
            fill="#020617"
            letterSpacing="-0.9"
            className="dark:fill-white"
          >
            Dr
          </text>

          {/* lowercase "s" in deep teal */}
          <text
            x="54"
            y="0"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="39"
            fontWeight="950"
            fill="#004D40"
            className="dark:fill-teal-300"
          >
            s
          </text>

          {/* Bold AI Pill Container & Text */}
          <rect
            x="76"
            y="-33"
            width="54"
            height="42"
            rx="12"
            fill="url(#aiHighlightGlow)"
            stroke="#020617"
            strokeWidth="2"
            filter="url(#crispShadow)"
          />
          <text
            x="103"
            y="-2"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="32"
            fontWeight="950"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="0.8"
          >
            AI
          </text>

          {/* "hib" in deep pitch black/navy */}
          <text
            x="136"
            y="0"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="40"
            fontWeight="950"
            fill="#020617"
            letterSpacing="-0.9"
            className="dark:fill-white"
          >
            hib
          </text>

          {/* Subtitle Tagline: "YOUR SMART HEALTH PARTNER" - Deep, dark, ultra-readable */}
          <text
            x="2"
            y="26"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="13"
            fontWeight="950"
            fill="#00382E"
            letterSpacing="1.4"
            className="dark:fill-teal-200"
          >
            YOUR SMART HEALTH PARTNER
          </text>
        </g>
      </svg>
    </div>
  );
};
