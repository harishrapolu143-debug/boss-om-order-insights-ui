import React from 'react';

interface BrightspeedLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const BrightspeedLogo: React.FC<BrightspeedLogoProps> = ({ 
  className = '', 
  width = 32, 
  height = 32 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      version="1.2" 
      viewBox="0 0 1080 1080" 
      width={width} 
      height={height} 
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>Brightspeed logo</title>
      <defs>
        <style>{`
          .s0 { fill: #ffc800 } 
          .s1 { fill: none; stroke: #ffc800; stroke-miterlimit: 100; stroke-width: 200 } 
          .s2 { opacity: .5; fill: none; stroke: #ff0000; stroke-miterlimit: 100; stroke-width: 200 } 
        `}</style>
      </defs>
      <path 
        id="Shape 2 copy 4" 
        className="s0" 
        d="m1080 1350c-149.3 0-270-120.7-270-270 0-149.3 120.7-270 270-270 149.3 0 270 120.7 270 270 0 149.3-120.7 270-270 270zm-1080-1080c-149.3 0-270-120.7-270-270 0-149.3 120.7-270 270-270 149.3 0 270 120.7 270 270 0 149.3-120.7 270-270 270zm0 1080c-149.3 0-270-120.7-270-270 0-149.3 120.7-270 270-270 149.3 0 270 120.7 270 270 0 149.3-120.7 270-270 270zm1080-1080c-149.3 0-270-120.7-270-270 0-149.3 120.7-270 270-270 149.3 0 270 120.7 270 270 0 149.3-120.7 270-270 270z"
      />
      <path 
        id="yellow inner round" 
        className="s1" 
        d="m0.1 1620c-298.6 0-540-241.4-540-539.9 0-298.6 241.4-540 540-540 298.5 0 539.9 241.4 539.9 540 0 298.5-241.4 539.9-539.9 539.9zm1080-1080c-298.6 0-540-241.4-540-539.9 0-298.6 241.4-540 540-540 298.5 0 539.9 241.4 539.9 540 0 298.5-241.4 539.9-539.9 539.9z"
      />
      <path 
        id="orange" 
        fillRule="evenodd" 
        className="s2" 
        d="m1080.1 1620c-298.6 0-540-241.4-540-539.9 0-298.6 241.4-540 540-540 298.5 0 539.9 241.4 539.9 540 0 298.5-241.4 539.9-539.9 539.9zm-1080-1080c-298.6 0-540-241.4-540-539.9 0-298.6 241.4-540 540-540 298.5 0 539.9 241.4 539.9 540 0 298.5-241.4 539.9-539.9 539.9z"
      />
    </svg>
  );
};
