import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Twitter, Linkedin, Heart, ChevronUp, ChevronDown } from "lucide-react";

const Footer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 flex flex-col items-center">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 p-2 rounded-full bg-transparent text-gray-300 hover:text-white transition-all group"
        aria-label="Toggle Footer"
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5 transition-transform group-hover:scale-110 drop-shadow-md" />
        ) : (
          <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 drop-shadow-md" />
        )}
      </button>

      {/* Expandable Footer Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.footer
            initial={{ height: 0, opacity: 0, y: 50 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full relative overflow-hidden bg-transparent"
          >
            <div className="w-full py-12 px-4 md:px-8">
              <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  {/* Logo & Brand */}
                  <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center mb-6">
                      <span className="text-xl font-light text-gray-100 tracking-[0.4em] uppercase font-sans drop-shadow-md">Nexo</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 drop-shadow-md">
                      Design for focus. Engineered for flow. Nexo is your personal dashboard for deep work and high productivity.
                    </p>
                    <div className="flex gap-4">
                      <a href="#" className="p-2 rounded-lg text-gray-300 hover:text-white hover:scale-110 transition-all drop-shadow-md">
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className="p-2 rounded-lg text-gray-300 hover:text-white hover:scale-110 transition-all drop-shadow-md">
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="#" className="p-2 rounded-lg text-gray-300 hover:text-white hover:scale-110 transition-all drop-shadow-md">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="col-span-1">
                    <h4 className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.3em] mb-6 drop-shadow-md">Product</h4>
                    <ul className="space-y-4">
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Features</a></li>
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Resources</a></li>
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Changelog</a></li>
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Roadmap</a></li>
                    </ul>
                  </div>

                  <div className="col-span-1">
                    <h4 className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.3em] mb-6 drop-shadow-md">Company</h4>
                    <ul className="space-y-4">
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">About Us</a></li>
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Privacy Policy</a></li>
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Terms of Service</a></li>
                      <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors drop-shadow-md">Contact</a></li>
                    </ul>
                  </div>

                  <div className="col-span-1">
                    <h4 className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.3em] mb-6 drop-shadow-md">Newsletter</h4>
                    <p className="text-sm text-gray-300 mb-4 drop-shadow-md">Join our community for tips on productivity and deep work.</p>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="Email address" 
                        className="flex-1 bg-transparent border-b border-white/30 px-2 py-2 text-xs text-gray-100 placeholder-white/50 focus:outline-none focus:border-gray-100 transition-colors drop-shadow-md"
                      />
                      <button className="text-gray-100 font-bold hover:text-gray-300 transition-colors drop-shadow-md text-xs px-2">
                        Join
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-gray-300 drop-shadow-md">
                    &copy; {new Date().getFullYear()} Nexo. All rights reserved.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-300 drop-shadow-md">
                    Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the deep thinkers.
                  </div>
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Footer;
