import React from 'react';
import { cn } from '@/src/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32, showText = true }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Stylized N / Pulse Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path 
            d="M4 18V6L10 18V6L16 18V6" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-[#8e94f2]"
          />
          <path 
            d="M18 6L20 6" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            className="text-[#8e94f2] opacity-50"
          />
          {/* Glow effect */}
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" className="text-[#8e94f2] opacity-20" />
        </svg>
      </div>
      
      {showText && (
        <span className="text-white font-black text-xl tracking-tighter uppercase">
          Nocturne
        </span>
      )}
    </div>
  );
};
