import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

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
      <div className={`relative ${sizeClasses[size]} shrink-0 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-white/20`}>
        {src ? (
          <img 
            src={src} 
            alt={alt || "avatar"} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <User 
            className={`text-white/40 ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} 
            strokeWidth={1.5}
          />
        )}
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
