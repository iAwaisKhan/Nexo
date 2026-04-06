import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ui/ErrorFallback";

const Notes = lazy(() => import("./components/Notes"));
const Tasks = lazy(() => import("./components/Tasks"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Profile = lazy(() => import("./components/Profile"));
const Focus = lazy(() => import("./components/Focus"));
const Settings = lazy(() => import("./components/Settings"));
const SharedNoteView = lazy(() => import("./components/SharedNoteView"));
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

// Animated page wrapper
const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [skippedAuth, setSkippedAuth] = useState(() => {
    return localStorage.getItem('nexo_skipped_auth') === 'true';
  });

  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, initialize } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize sync engine when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      syncEngine.initialize(user.id);
      // If user was in skipped mode, clear it
      localStorage.removeItem('nexo_skipped_auth');
      setSkippedAuth(false);
    }

    return () => {
      if (!isAuthenticated) {
        syncEngine.destroy();
      }
    };
  }, [isAuthenticated, user]);

  // Listen for skip-auth event from Auth component
  useEffect(() => {
    const handler = () => {
      localStorage.setItem('nexo_skipped_auth', 'true');
      setSkippedAuth(true);
    };
    window.addEventListener('nexo:skip-auth', handler);
    return () => window.removeEventListener('nexo:skip-auth', handler);
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
    { id: "nv-dash", title: "Dashboard", icon: Home, category: "Navigation", perform: () => navigate("/") },
    { id: "nv-notes", title: "Notes", icon: StickyNote, category: "Navigation", perform: () => navigate("/notes") },
    { id: "nv-tasks", title: "Tasks", icon: CheckSquare, category: "Navigation", perform: () => navigate("/tasks") },
    { id: "nv-focus", title: "Focus Mode", icon: Brain, category: "Navigation", perform: () => navigate("/focus") },
    { id: "nv-settings", title: "Settings", icon: SettingsIcon, category: "Navigation", perform: () => navigate("/settings") },
  ];

  // Show loading spinner while auth initializes
  if (authLoading && isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-text/40">
            Initializing...
          </span>
        </motion.div>
      </div>
    );
  }

  // Reusable loading spinner
  const LoadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-text/40">
          Loading...
        </span>
      </motion.div>
    </div>
  );

  // Show auth screen if Supabase is configured but user is not signed in (and hasn't skipped)
  if (isSupabaseConfigured() && !isAuthenticated && !skippedAuth) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Suspense fallback={LoadingFallback}>
          <Auth />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background text-text transition-colors duration-500`}>
      <Header />

      <main className="flex-1 relative">
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
          <Suspense fallback={LoadingFallback}>
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
              <PageTransition className="pt-32 px-8 pb-10">
                <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
                  <Notes />
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/tasks"
            element={
              <PageTransition className="pt-32 px-8 pb-10">
                <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
                  <Tasks />
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/focus"
            element={
              <PageTransition className="pt-32 px-8 pb-10">
                <div className="max-w-[1600px] mx-auto">
                  <Focus />
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition className="pt-32 px-8 pb-10">
                <div className="max-w-[1600px] mx-auto">
                  <Settings />
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition className="pt-32 px-8 pb-10">
                <div className="max-w-[1600px] mx-auto">
                  <Profile />
                </div>
              </PageTransition>
            }
          />
          <Route path="/share/:noteId" element={<SharedNoteView />} />
          {/* Catch-all: redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
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
