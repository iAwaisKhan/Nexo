import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ui/ErrorFallback";
import { useThemeStore } from "./store/useThemeStore";

// ─── Eager imports → zero loading spinner on navigation ─────────────────────
import Notes from "./components/Notes";
import Tasks from "./components/Tasks";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Focus from "./components/Focus";
import Settings from "./components/Settings";
import SharedNoteView from "./components/SharedNoteView";

// Auth is still lazy — only shown once, before the app loads
const Auth = lazy(() => import("./components/Auth"));

import Header from "./components/Header";
import { CommandPalette } from "./components/ui/CommandPalette";
import { PWAPrompt } from "./components/ui/PWAPrompt";
import { useAuthStore } from "./store/useAuthStore";
import { isSupabaseConfigured } from "./lib/supabase";
import { syncEngine } from "./lib/syncEngine";
import {
  Home,
  StickyNote,
  CheckSquare,
  Brain,
  Settings as SettingsIcon,
} from "lucide-react";

// ─── Page wrapper: instant cross-fade, no "wait" blocking ───────────────────
const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const App: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [skippedAuth, setSkippedAuth] = useState(() => {
    return localStorage.getItem("nexo_skipped_auth") === "true";
  });

  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    const { theme } = useThemeStore.getState();
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncEngine.initialize(user.id);
      localStorage.removeItem("nexo_skipped_auth");
      setSkippedAuth(false);
    }
    return () => { if (!isAuthenticated) syncEngine.destroy(); };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handler = () => {
      localStorage.setItem("nexo_skipped_auth", "true");
      setSkippedAuth(true);
    };
    window.addEventListener("nexo:skip-auth", handler);
    return () => window.removeEventListener("nexo:skip-auth", handler);
  }, []);

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
    { id: "nv-dash",     title: "Dashboard",  icon: Home,         category: "Navigation", perform: () => navigate("/") },
    { id: "nv-notes",    title: "Notes",       icon: StickyNote,   category: "Navigation", perform: () => navigate("/notes") },
    { id: "nv-tasks",    title: "Tasks",       icon: CheckSquare,  category: "Navigation", perform: () => navigate("/tasks") },
    { id: "nv-focus",    title: "Focus Mode",  icon: Brain,        category: "Navigation", perform: () => navigate("/focus") },
    { id: "nv-settings", title: "Settings",    icon: SettingsIcon, category: "Navigation", perform: () => navigate("/settings") },
  ];

  // Auth initialisation loader (only shown once on app start when Supabase is configured)
  if (authLoading && isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-text/30">
            Starting…
          </span>
        </motion.div>
      </div>
    );
  }

  // Auth screen — lazy-loaded (shown only once before the app)
  if (isSupabaseConfigured() && !isAuthenticated && !skippedAuth) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Suspense fallback={null}>
          <Auth />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-text transition-colors duration-500 relative">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        className="fixed inset-0 w-full h-full object-cover -z-20 pointer-events-none select-none will-change-transform"
      >
        <source src="/Backgrounnd.mp4" type="video/mp4" />
      </video>

      {/* Dynamic Overlay for readability in Light/Dark mode */}
      <div className="fixed inset-0 w-full h-full bg-background/60 dark:bg-background/90 transition-colors duration-500 -z-10 pointer-events-none" />

      <Header />

      <main className="flex-1 relative z-0">
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
          {/* No Suspense needed — all route components are eagerly imported */}
          <Routes>
            <Route
              path="/"
              element={
                <PageTransition className="pt-24 md:pt-32 px-4 md:px-8 pb-6 md:pb-10">
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/notes"
              element={
                <PageTransition className="pt-20 md:pt-32 px-4 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-[95%] w-full mx-auto h-[calc(100vh-11rem)] md:h-[calc(100vh-8rem)]">
                    <Notes />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/tasks"
              element={
                <PageTransition className="pt-20 md:pt-32 px-4 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-[95%] w-full mx-auto h-[calc(100vh-11rem)] md:h-[calc(100vh-8rem)]">
                    <Tasks />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/focus"
              element={
                <PageTransition className="pt-20 md:pt-32 px-4 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-[95%] w-full mx-auto">
                    <Focus />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/settings"
              element={
                <PageTransition className="pt-20 md:pt-32 px-4 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-[95%] w-full mx-auto">
                    <Settings />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition className="pt-20 md:pt-32 px-4 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-[95%] w-full mx-auto">
                    <Profile />
                  </div>
                </PageTransition>
              }
            />
            <Route path="/share/:noteId" element={<SharedNoteView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        actions={actions}
      />

      <PWAPrompt />
    </div>
  );
};

export default App;
