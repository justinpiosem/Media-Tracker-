import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const CoabLogo: React.FC<LogoProps> = ({ className = '', size = 40 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-sm border border-[#064420]/20 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* High-fidelity Vector Recreation of College of Accountancy & Business Western Leyte College Seal */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="coabGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5B027" />
            <stop offset="60%" stopColor="#E1910F" />
            <stop offset="100%" stopColor="#B36B00" />
          </linearGradient>
          <linearGradient id="coabFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D82613" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="coabBookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#092638" />
            <stop offset="100%" stopColor="#05141E" />
          </linearGradient>
          <path
            id="textPathTop"
            d="M 28,100 A 72,72 0 1,1 172,100"
            fill="none"
          />
          <path
            id="textPathBottom"
            d="M 172,100 A 72,72 0 1,1 28,100"
            fill="none"
          />
        </defs>

        {/* Outer Ring Border */}
        <circle cx="100" cy="100" r="97" fill="#064420" stroke="#092638" strokeWidth="2" />
        <circle cx="100" cy="100" r="93" fill="none" stroke="#E1910F" strokeWidth="1.5" />

        {/* Text Ring */}
        <text fill="#FFFFFF" fontSize="9" fontWeight="800" letterSpacing="0.8" textAnchor="middle">
          <textPath href="#textPathTop" startOffset="50%">
            COLLEGE OF ACCOUNTANCY AND BUSINESS
          </textPath>
        </text>
        <text fill="#FFFFFF" fontSize="7" fontWeight="700" letterSpacing="0.6" textAnchor="middle">
          <textPath href="#textPathBottom" startOffset="50%">
            WESTERN LEYTE COLLEGE • WISDOM • LEADERSHIP
          </textPath>
        </text>

        {/* Inner Circle with Gold Sunburst Gradient */}
        <circle cx="100" cy="100" r="74" fill="url(#coabGoldGrad)" stroke="#064420" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="69" fill="#FAFAFA" opacity="0.15" />

        {/* Backdrop City / Horizon geometric silhouettes */}
        <path d="M40,115 L60,105 L70,112 L90,95 L110,105 L130,98 L160,115 L160,140 L40,140 Z" fill="#D97706" opacity="0.3" />

        {/* Scales of Justice (Right Side) */}
        <g transform="translate(130, 68) scale(0.42)">
          <path d="M25,5 L25,45 M10,12 L40,12" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" />
          <path d="M10,12 L5,28 L15,28 Z" fill="none" stroke="#7F1D1D" strokeWidth="2" />
          <path d="M40,12 L35,28 L45,28 Z" fill="none" stroke="#7F1D1D" strokeWidth="2" />
          <circle cx="25" cy="5" r="3" fill="#7F1D1D" />
        </g>

        {/* Medal with Blue Ribbon (Left Side) */}
        <g transform="translate(42, 66) scale(0.48)">
          <path d="M12,0 L20,24 L28,0 L20,10 Z" fill="#1D4ED8" />
          <circle cx="20" cy="28" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="20" cy="28" r="8" fill="#FBBF24" />
        </g>

        {/* Flaming Torch (Center Rising from Book) */}
        <g transform="translate(100, 68)">
          {/* Torch Bowl */}
          <path d="M -16,14 L 16,14 L 11,21 L -11,21 Z" fill="#7F1D1D" />
          {/* Flame Shapes */}
          <path
            d="M 0,-34 C 10,-24 16,-12 11,2 C 8,7 3,9 0,11 C -3,9 -8,7 -11,2 C -16,-12 -10,-24 0,-34 Z"
            fill="url(#coabFlameGrad)"
          />
          <path
            d="M 2,-26 C 8,-18 10,-8 6,2 C 4,5 1,7 0,8 C -1,7 -4,5 -6,2 C -10,-8 -8,-18 2,-26 Z"
            fill="#FEF08A"
            opacity="0.85"
          />
        </g>

        {/* Open Book of Wisdom at Bottom */}
        <g transform="translate(100, 114)">
          {/* Book Spine & Pages (Dark Navy & Clean Slate) */}
          <path
            d="M 0,0 C 18,-6 38,-4 54,6 L 46,38 C 30,30 14,28 0,33 C -14,28 -30,30 -46,38 L -54,6 C -38,-4 -18,-6 0,0 Z"
            fill="url(#coabBookGrad)"
            stroke="#245439"
            strokeWidth="2"
          />
          {/* Center Spine Line */}
          <line x1="0" y1="0" x2="0" y2="33" stroke="#E1910F" strokeWidth="2.5" />
          {/* Left Page Highlight */}
          <path d="M -5,4 C -18,-1 -34,-1 -48,8" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
          {/* Right Page Highlight */}
          <path d="M 5,4 C 18,-1 34,-1 48,8" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};
