import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Command, 
  Terminal, 
  Brain, 
  StickyNote, 
  CheckSquare, 
  Settings, 
  User,
  Zap
} from "lucide-react";

interface Action {
  id: string;
  title: string;
  shortcut?: string;
  icon: any;
  category: string;
  perform: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredActions = actions.filter(
    (a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      if (e.key === "ArrowUp") setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      if (e.key === "Enter" && filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredActions, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-surface border border-border/10 rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-border/5 flex items-center gap-4">
              <Command className="w-5 h-5 text-primary" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search workspace..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg font-display outline-none text-text placeholder:text-text/20"
              />
              <div className="px-2 py-1 rounded-lg bg-surface/50 border border-border/10 text-[10px] font-bold text-text/30">
                ESC
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
              {filteredActions.length === 0 ? (
                <div className="py-10 text-center text-text/30 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No signals found in this frequency</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(new Set(filteredActions.map((a) => a.category))).map((category) => (
                    <div key={category} className="space-y-2">
                      <div className="px-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3 opacity-60">
                        {category}
                      </div>
                      {filteredActions
                        .filter((a) => a.category === category)
                        .map((action, index) => {
                          const globalIndex = filteredActions.indexOf(action);
                          const isSelected = globalIndex === selectedIndex;
                          return (
                            <button
                              key={action.id}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              onClick={() => { action.perform(); onClose(); }}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                                isSelected ? "bg-primary text-white scale-[1.02]" : "hover:bg-primary/5 text-text/70"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <action.icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-text/30 group-hover:text-primary"}`} />
                                <span className="font-semibold tracking-tight">{action.title}</span>
                              </div>
                              {action.shortcut && (
                                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                                  isSelected ? "bg-white/20 border-white/20" : "bg-surface border-border/10 text-text/20"
                                }`}>
                                  {action.shortcut}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/5 bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-bold text-text/20 uppercase tracking-widest">
                <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Nexo Command Engine</div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium text-text/40">
                <span>Select</span> <kbd className="bg-border/10 px-1.5 py-0.5 rounded-md">↵</kbd>
                <span className="ml-2">Navigate</span> <kbd className="bg-border/10 px-1.5 py-0.5 rounded-md">↑↓</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
