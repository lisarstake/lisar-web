import React from "react";

interface LisarLinesProps {
  position: "top-right" | "bottom-left";
  className?: string;
}

export const LisarLines: React.FC<LisarLinesProps> = ({ position, className = "" }) => {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-100 h-100 pointer-events-none ${className}`}>
      <img 
        src="/lisar-lines.svg" 
        alt="Lisar decorative lines" 
        className="w-full h-full object-contain"
        style={{
          transform: position === "bottom-left" ? "rotate(180deg)" : "none"
        }}
      />
    </div>
  );
};

export const LisarLinesOnboarding: React.FC<LisarLinesProps> = ({ position, className = "" }) => {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-100 h-100 pointer-events-none ${className}`}>
      <img 
        src="/lisar-lines2.svg" 
        alt="Lisar decorative lines" 
        className="w-full h-full object-contain"
        style={{
          transform: position === "bottom-left" ? "rotate(180deg)" : "none"
        }}
      />
    </div>
  );
};

