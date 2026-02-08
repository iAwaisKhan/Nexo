import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Notes from "./components/Notes";
import Tasks from "./components/Tasks";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Focus from "./components/Focus";
import Settings from "./components/Settings";
import SharedNoteView from "./components/SharedNoteView";
import SearchResults from "./components/SearchResults";
import LandingHero from "./components/LandingHero";
import Header from "./components/Header";
import { CommandPalette } from "./components/ui/CommandPalette";
import { 
  Home, 
  StickyNote, 
  CheckSquare, 
  Clock, 
  Brain, 
  Settings as SettingsIcon, 
  Search, 
  User, 
  Sun, 
  Moon,
  GraduationCap
} from "lucide-react";

const App: React.FC = () => {
  const [activeView, setActiveView] = useState(() => {
    if (window.location.pathname.startsWith('/share/')) return "shared-note";
    return "dashboard";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("aura-theme");
    return saved === "dark"; // Defaults to false (light) if not set
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const actions = [
    { id: "nv-dash", title: "Dashboard", icon: Home, category: "Navigation", perform: () => setActiveView("dashboard") },
    { id: "nv-notes", title: "Notes", icon: StickyNote, category: "Navigation", perform: () => setActiveView("notes") },
    { id: "nv-tasks", title: "Tasks", icon: CheckSquare, category: "Navigation", perform: () => setActiveView("tasks") },
    { id: "nv-focus", title: "Focus Mode", icon: Brain, category: "Navigation", perform: () => setActiveView("focus") },
    { id: "nv-settings", title: "Settings", icon: SettingsIcon, category: "Navigation", perform: () => setActiveView("settings") },
  ];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("aura-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (activeView === "shared-note") {
    return <SharedNoteView />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background text-text transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      <Header 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeView === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-24 md:pt-32 px-4 md:px-8 pb-6 md:pb-10"
            >
              <Dashboard />
            </motion.div>
          ) : (
            <motion.section
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="pt-32 px-8 pb-10"
            >
              <div className="max-w-[1600px] mx-auto">
                {activeView === "notes" ? (
                  <div className="h-[calc(100vh-8rem)]">
                    <Notes />
                  </div>
                ) : activeView === "tasks" ? (
                  <div className="h-[calc(100vh-8rem)]">
                    <Tasks />
                  </div>
                ) : activeView === "profile" ? (
                  <Profile />
                ) : activeView === "focus" || activeView === "workspace" ? (
                  <Focus />
                ) : activeView === "settings" ? (
                  <Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                ) : (
                  <Dashboard />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        actions={actions}
      />
    </div>
  );
};

export default App;

