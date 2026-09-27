import React from 'react';
import { Laptop } from 'lucide-react';

interface TechLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TechLogo: React.FC<TechLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeConfig = {
    sm: {
      box: 'h-8 w-8',
      icon: 'h-4 w-4',
      svgInset: '-inset-1',
      svgSize: 'w-[calc(100%+8px)] h-[calc(100%+8px)]',
    },
    md: {
      box: 'h-9 w-9',
      icon: 'h-5 w-5',
      svgInset: '-inset-1.5',
      svgSize: 'w-[calc(100%+12px)] h-[calc(100%+12px)]',
    },
    lg: {
      box: 'h-11 w-11',
      icon: 'h-6 w-6',
      svgInset: '-inset-2',
      svgSize: 'w-[calc(100%+16px)] h-[calc(100%+16px)]',
    },
  };

  const { box, icon, svgInset, svgSize } = sizeConfig[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 transition-all shadow-sm ${box} ${className}`}
      title="Tech Assistência Especializada"
    >
      {/* Central Laptop / Notebook */}
      <Laptop className={`${icon} text-cyan-400 relative z-10 transition-transform group-hover:scale-105`} />

      {/* Orbiting Circle Spinning Around the Laptop */}
      <div className={`absolute ${svgInset} ${svgSize} pointer-events-none flex items-center justify-center`}>
        <svg
          className="w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '3.5s' }}
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbit circular track with dynamic dashed segments */}
          <circle
            cx="26"
            cy="26"
            r="23"
            stroke="#22d3ee"
            strokeWidth="1.6"
            strokeDasharray="24 10 16 10"
            strokeLinecap="round"
            className="opacity-80"
          />
          {/* Orbiting glowing particle/satellite */}
          <circle cx="26" cy="3" r="3" fill="#38bdf8" />
          <circle cx="26" cy="3" r="1.5" fill="#ffffff" />
          {/* Secondary counter particle */}
          <circle cx="26" cy="49" r="1.8" fill="#06b6d4" className="opacity-70" />
        </svg>
      </div>
    </div>
  );
};
