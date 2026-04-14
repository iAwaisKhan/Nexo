import React, { useState, useEffect, useRef, Suspense, lazy, memo } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ui/ErrorFallback";

// Eagerly loaded core routes for instant snappy navigation
import Dashboard from "./components/Dashboard";
import Notes from "./components/Notes";
import Tasks from "./components/Tasks";
import Focus from "./components/Focus";

// Lazy loaded secondary routes to keep initial bundle smaller
const Profile = lazy(() => import("./components/Profile"));
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

// Memoized Video Component to completely detach it from React Render Cycles
const BackgroundVideo = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((e) => {
        console.log("Auto-play was prevented by browser, waiting for user interaction.", e);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-[-2] pointer-events-none overflow-hidden bg-[#0a0a0f] transition-colors duration-1000">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`w-full h-full object-cover mix-blend-screen transition-opacity duration-[1500ms] ease-in-out ${isVideoLoaded ? 'opacity-80' : 'opacity-0'}`}
        style={{ transform: "translateZ(0)", willChange: "opacity, transform" }} // Hardware acceleration
        src="/bg-clouds.mp4"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
});

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

  // Reusable loading spinner
  const LoadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-4 relative z-10"
      >
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 drop-shadow-md">
          Loading...
        </span>
      </motion.div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col text-text transition-colors duration-500 relative`}>
      {/* Background Video ALWAYS mounted first completely detached from re-renders */}
      <BackgroundVideo />

      {/* Show loading spinner while auth initializes */}
      {authLoading && isSupabaseConfigured() ? (
        LoadingFallback
      ) : isSupabaseConfigured() && !isAuthenticated && !skippedAuth ? (
        /* Show auth screen if Supabase is configured but user is not signed in */
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
          <Suspense fallback={LoadingFallback}>
            <Auth />
          </Suspense>
        </ErrorBoundary>
      ) : (
        /* Main application routes */
        <React.Fragment>
          <Header />
          <main className="flex-1 relative">
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
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
                  <Suspense fallback={LoadingFallback}>
                    <Settings />
                  </Suspense>
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition className="pt-32 px-8 pb-10">
                <div className="max-w-[1600px] mx-auto">
                  <Suspense fallback={LoadingFallback}>
                    <Profile />
                  </Suspense>
                </div>
              </PageTransition>
            }
          />
          <Route path="/share/:noteId" element={<Suspense fallback={LoadingFallback}><SharedNoteView /></Suspense>} />
          {/* Catch-all: redirect unknown routes to dashboard */}
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
        </React.Fragment>
      )}
    </div>
  );
};

export default App;
