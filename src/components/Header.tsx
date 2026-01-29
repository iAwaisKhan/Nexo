import React from "react";
import {
  Sun,
  Moon,
  Home,
  StickyNote,
  CheckCircle,
  Brain,
  Settings as SettingsIcon
} from "lucide-react";
import { Avatar } from "./ui/Avatar";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, activeView, setActiveView }) => {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "tasks", label: "Tasks", icon: CheckCircle },
    { id: "focus", label: "Focus", icon: Brain },
    { id: "settings", label: "Config", icon: SettingsIcon },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 bg-background/60 backdrop-blur-2xl border-b border-border/50">
      {/* Left: Logo */}
      <div className="flex-1 flex items-center">
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => setActiveView("dashboard")}
        >
          <span className="text-lg md:text-xl font-light text-text tracking-[0.3em] md:tracking-[0.4em] uppercase font-sans transition-all group-hover:tracking-[0.5em]">Aura</span>
        </div>
      </div>

      {/* Center: Uiverse Nav */}
      <nav className="uiverse-menu shadow-2xl shadow-primary/5 flex max-md:overflow-x-auto max-md:max-w-[50vw] scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`uiverse-link ${activeView === item.id ? "active" : ""}`}
          >
            <span className="uiverse-link-icon flex-shrink-0">
              <item.icon className="w-5 h-5" />
            </span>
            <span className="uiverse-link-title font-redhat hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex-1 flex items-center justify-end gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-muted hover:text-primary transition-all hover:bg-primary/5"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div
          className="group cursor-pointer transition-all flex items-center"
          onClick={() => setActiveView("profile")}
        >
          <Avatar size="sm" fallback="AU" />
        </div>
      </div>
    </header>
  );
};

export default Header;

