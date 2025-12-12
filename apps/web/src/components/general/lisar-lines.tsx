import React from "react";

interface LisarLinesProps {
  position: "top-right" | "bottom-left";
  className?: string;
  width?: string;
  height?: string;
}

export const LisarLines: React.FC<LisarLinesProps> = ({ 
  position, 
  className = "",
  width,
  height
}) => {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  const containerStyle: React.CSSProperties = {
    width: width || "100px",
    height: height || "100px",
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} pointer-events-none ${className}`}
      style={containerStyle}
    >
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


