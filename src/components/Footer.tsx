import React from "react";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-4 md:px-8 mt-20 border-t border-border/50 bg-surface/30 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-6">
              <span className="text-xl font-light text-text tracking-[0.4em] uppercase font-sans">Nexo</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Design for focus. Engineered for flow. Nexo is your personal dashboard for deep work and high productivity.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-text-muted hover:text-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-text-muted hover:text-primary transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-text-muted hover:text-primary transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Resources</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Changelog</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6">Newsletter</h4>
            <p className="text-sm text-text-muted mb-4">Join our community for tips on productivity and deep work.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-surface border border-border/50 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Nexo. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the deep thinkers.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
