import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  label?: {
    name: string;
    email: string;
  };
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, size = "md", label }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-base",
    xl: "text-xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses[size]} shrink-0 p-[2px] rounded-full ring-2 ring-white/5 bg-gradient-to-tr from-white/5 to-transparent`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-[#050505] border border-white/10 flex items-center justify-center relative group">
          {src ? (
            <img 
              src={src} 
              alt={alt || "avatar"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className={`font-sans font-black text-primary uppercase tracking-wider ${textSizes[size]} drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]`}>
                {fallback}
              </span>
            </div>
          )}
        </div>
      </div>

      {label && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-text tracking-tight group-hover:text-primary transition-colors">{label.name}</span>
          <span className="text-[10px] font-medium text-text-muted/60 lowercase">{label.email}</span>
        </div>
      )}
    </div>
  );
};
