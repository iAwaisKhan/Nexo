import React from "react";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 px-4 md:px-8 mt-auto border-t border-border/10">
      <div className="max-w-[95%] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Brand & Copy */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <span className="text-sm font-bold text-text tracking-[0.3em] uppercase">Nexo</span>
          <span className="hidden md:inline-block w-1 h-1 rounded-full bg-border"></span>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>

        {/* Center: Socials */}
        <div className="flex items-center gap-6">
          <a href="#" className="text-text-muted hover:text-primary transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="text-text-muted hover:text-primary transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href="#" className="text-text-muted hover:text-primary transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        {/* Right: Message */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted/80">
          Crafted with <Heart className="w-3 h-3 text-red-500/80 fill-red-500/80" /> for flow.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
