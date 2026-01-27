import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sun, Moon, LayoutDashboard, FileText, CheckCircle, Brain } from "lucide-react";
import { Avatar } from "./ui/Avatar";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setActiveView: (view: string) => void;
}

const components: { title: string; id: string; description: string; icon: any }[] = [
  {
    title: "Graph View",
    id: "dashboard",
    description: "Visualize the connections between your notes and ideas.",
    icon: LayoutDashboard
  },
  {
    title: "Deep Focus",
    id: "focus",
    description: "A distraction-free environment for intense study sessions.",
    icon: Brain
  },
  {
    title: "Note Sharing",
    id: "notes",
    description: "Collaborate with others by sharing your knowledge.",
    icon: FileText
  },
  {
    title: "Task Management",
    id: "tasks",
    description: "Stay organized with integrated task tracking.",
    icon: CheckCircle
  },
];

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, setActiveView }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-background/60 backdrop-blur-2xl border-b border-border/50">
      {/* Left: Logo */}
      <div className="flex-1 flex items-center">
        <div 
          className="flex items-center cursor-pointer group"
          onClick={() => setActiveView("dashboard")}
        >
          <span className="text-xl font-light text-text tracking-[0.4em] uppercase font-sans transition-all group-hover:tracking-[0.5em]">Aura</span>
        </div>
      </div>

      {/* Center: Navigation */}
      <nav className="hidden lg:flex items-center gap-2 bg-surface/50 p-1 rounded-2xl border border-border/50 shadow-inner">
        {/* Getting Started Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("started")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest ${openMenu === "started" ? "bg-background text-text shadow-sm" : "text-text-muted hover:text-text hover:bg-background/40"}`}
          >
            Explore
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openMenu === "started" ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openMenu === "started" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 p-4 bg-surface/90 backdrop-blur-2xl border border-border rounded-[2rem] shadow-2xl overflow-hidden"
              >
                <ul className="space-y-1">
                  <ListItem onClick={() => { setActiveView("dashboard"); setOpenMenu(null); }} title="Overview">
                    Your personal resonance dashboard.
                  </ListItem>
                  <ListItem onClick={() => { setActiveView("focus"); setOpenMenu(null); }} title="Focus Mode">
                    Enter the flow state session.
                  </ListItem>
                  <ListItem onClick={() => { setActiveView("settings"); setOpenMenu(null); }} title="Discovery">
                    Explore workspace features.
                  </ListItem>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("components")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest ${openMenu === "components" ? "bg-background text-text shadow-sm" : "text-text-muted hover:text-text hover:bg-background/40"}`}
          >
            Workspace
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openMenu === "components" ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openMenu === "components" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 p-4 bg-surface/90 backdrop-blur-2xl border border-border rounded-[2rem] shadow-2xl overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  {components.map((comp) => (
                    <ListItem
                      key={comp.id}
                      title={comp.title}
                      onClick={() => { setActiveView(comp.id); setOpenMenu(null); }}
                    >
                      {comp.description}
                    </ListItem>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("priority")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest ${openMenu === "priority" ? "bg-background text-text shadow-sm" : "text-text-muted hover:text-text hover:bg-background/40"}`}
          >
            Status
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openMenu === "priority" ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openMenu === "priority" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 p-3 bg-surface/90 backdrop-blur-2xl border border-border rounded-[2rem] shadow-2xl"
              >
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-primary/5 text-text-muted hover:text-text text-[10px] font-bold uppercase tracking-widest transition-all text-left">
                    Critical
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-primary/5 text-text-muted hover:text-text text-[10px] font-bold uppercase tracking-widest transition-all text-left">
                    Flowing
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-primary/5 text-text-muted hover:text-text text-[10px] font-bold uppercase tracking-widest transition-all text-left">
                    Synced
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setActiveView("settings")}
          className="px-4 py-1.5 rounded-xl text-text-muted hover:text-text hover:bg-background/40 transition-all text-[11px] font-bold uppercase tracking-widest"
        >
          Configs
        </button>
      </nav>

      {/* Right: Actions */}
      <div className="flex-1 flex items-center justify-end gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-muted hover:text-primary transition-all hover:bg-primary/5"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <div 
          className="group cursor-pointer bg-surface/50 rounded-full p-0.5 border border-border/50 hover:border-primary/50 transition-all flex items-center"
          onClick={() => setActiveView("profile")}
        >
          <Avatar size="sm" fallback="AU" status="online" />
        </div>
      </div>
    </header>
  );
};

function ListItem({
  title,
  children,
  onClick,
}: { title: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left p-3 rounded-2xl hover:bg-primary/5 group transition-all"
    >
      <div className="text-[10px] font-bold text-text uppercase tracking-widest group-hover:text-primary mb-1 transition-colors">{title}</div>
      <div className="text-[9px] font-bold text-text-muted/60 leading-snug line-clamp-2 uppercase tracking-tight">{children}</div>
    </button>
  );
}

export default Header;

