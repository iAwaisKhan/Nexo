import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  status?: "online" | "offline" | "away" | "busy";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, status, size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-16 h-16",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    offline: "bg-slate-500",
  };

  const indicatorSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
  };

  return (
    <div className={`relative ${sizeClasses[size]} shrink-0`}>
      <div className="w-full h-full rounded-full overflow-hidden border border-border/50">
        {src ? (
          <img 
            src={src} 
            alt={alt || "avatar"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-primary/10 flex items-center justify-center w-full h-full">
            <span className="font-display font-medium text-primary uppercase tracking-tighter text-xs">
              {fallback}
            </span>
          </div>
        )}
      </div>
      
      {status && (
        <span className={`absolute bottom-0 right-0 ${indicatorSizes[size]} ${statusColors[status]} rounded-full border-2 border-background ring-1 ring-black/5 animate-in fade-in zoom-in duration-300`} />
      )}
    </div>
  );
};
