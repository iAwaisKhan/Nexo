import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ui/ErrorFallback";
import { useThemeStore } from "./store/useThemeStore";

// Keep the app shell and lightweight primary routes eager. In development this
// also prevents a stale Vite session from failing when Board is opened after an
// HMR/dependency refresh; larger feature screens remain split below.
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
const Notes = lazy(() => import("./components/Notes"));
const Tasks = lazy(() => import("./components/Tasks"));
const Profile = lazy(() => import("./components/Profile"));
const Focus = lazy(() => import("./components/Focus"));
const Settings = lazy(() => import("./components/Settings"));
const SharedNoteView = lazy(() => import("./components/SharedNoteView"));
const CalendarView = lazy(() => import("./components/CalendarView"));
const Spaces = lazy(() => import("./components/Spaces"));
const InsightsDashboard = lazy(() => import("./components/InsightsDashboard"));
const DailyCommandCenter = lazy(() => import("./components/DailyCommandCenter"));

// Auth is still lazy — only shown once, before the app loads
const Auth = lazy(() => import("./components/Auth"));

import Header from "./components/Header";
import { CommandPalette } from "./components/ui/CommandPalette";
import { PWAPrompt } from "./components/ui/PWAPrompt";
import { useAuthStore } from "./store/useAuthStore";
import { useAppStore } from "./store/useAppStore";
import { isSupabaseConfigured } from "./lib/supabase";
import {
  Home,
  StickyNote,
  CheckSquare,
  Brain,
  CalendarDays,
  FolderKanban,
  Layers3,
  BarChart3,
  Sparkles,
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

const RouteLoading: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-label="Loading">
    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [skippedAuth, setSkippedAuth] = useState(() => {
    return localStorage.getItem("nexo_skipped_auth") === "true";
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isPublicShareRoute = location.pathname.startsWith("/share/");
  const notes = useAppStore((state) => state.notes);
  const tasks = useAppStore((state) => state.tasks);
  const theme = useThemeStore((state) => state.theme);
  const { user, isLoading: authLoading, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    const { theme } = useThemeStore.getState();
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const configureWorkspace = async () => {
      const { syncEngine } = await import("./lib/syncEngine");
      await syncEngine.destroy();
      if (cancelled) return;

      if (isAuthenticated && user) {
        useAppStore.getState()._switchWorkspace(`user:${user.id}`);
        localStorage.removeItem("nexo_skipped_auth");
        setSkippedAuth(false);
        await syncEngine.initialize(user.id);
        return;
      }

      if (!isSupabaseConfigured() || skippedAuth) {
        useAppStore.getState()._switchWorkspace("guest");
      }
    };

    if (!authLoading) void configureWorkspace();

    return () => {
      cancelled = true;
      void import("./lib/syncEngine").then(({ syncEngine }) => syncEngine.destroy());
    };
  }, [authLoading, isAuthenticated, skippedAuth, user?.id]);

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
    { id: "nv-kanban",   title: "Kanban Board", icon: FolderKanban, category: "Navigation", perform: () => navigate("/kanban") },
    { id: "nv-calendar", title: "Calendar",    icon: CalendarDays, category: "Navigation", perform: () => navigate("/calendar") },
    { id: "nv-spaces",   title: "Spaces",      icon: Layers3,      category: "Navigation", perform: () => navigate("/spaces") },
    { id: "nv-insights", title: "Insights",    icon: BarChart3,    category: "Navigation", perform: () => navigate("/insights") },
    { id: "nv-today", title: "Daily Command Center", icon: Sparkles, category: "Navigation", perform: () => navigate("/today") },
    { id: "nv-focus",    title: "Focus Mode",  icon: Brain,        category: "Navigation", perform: () => navigate("/focus") },
    { id: "nv-settings", title: "Settings",    icon: SettingsIcon, category: "Navigation", perform: () => navigate("/settings") },
    ...notes.map((note) => ({
      id: `note-${note.id}`,
      title: note.title || "Untitled Note",
      icon: StickyNote,
      category: "Notes",
      perform: () => navigate(`/notes?note=${encodeURIComponent(note.id)}`),
    })),
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      icon: CheckSquare,
      category: "Tasks",
      perform: () => navigate("/tasks"),
    })),
  ];

  // Public note links must work for signed-out visitors and must not inherit
  // the private workspace header or authentication gate.
  if (isPublicShareRoute) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/share/:noteId" element={<SharedNoteView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

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
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        className="nexo-bg-video fixed inset-0 w-full h-full object-cover -z-20 pointer-events-none select-none will-change-transform"
      >
        <source src="/Backgrounnd.mp4" type="video/mp4" />
      </video>

      {/* Dynamic Overlay for readability in Light/Dark mode */}
      <div className={`fixed inset-0 w-full h-full transition-colors duration-500 -z-10 pointer-events-none ${theme === "dark" ? "bg-background/90" : "bg-white/65"}`} />

      <Header />

      <main className="flex-1 relative z-0">
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
          {/* No Suspense needed — all route components are eagerly imported */}
          <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                <PageTransition className="pt-20 md:pt-32 px-4 md:px-8 pb-6 md:pb-10">
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/notes"
              element={
                <PageTransition className="pt-20 md:pt-32 px-2 md:px-8 pb-20 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto h-[calc(100vh-9rem)] md:h-[calc(100vh-8rem)]">
                    <Notes />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/tasks"
              element={
                <PageTransition className="pt-20 md:pt-32 px-2 md:px-8 pb-20 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto h-[calc(100vh-9rem)] md:h-[calc(100vh-8rem)]">
                    <Tasks />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/kanban"
              element={
                <PageTransition className="pt-[4.5rem] md:pt-28 px-3 md:px-8 pb-20 md:pb-6">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <KanbanBoard />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/calendar"
              element={
                <PageTransition className="pt-[4.5rem] md:pt-28 px-3 md:px-8 pb-20 md:pb-6">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <CalendarView />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/spaces"
              element={
                <PageTransition className="pt-20 md:pt-32 px-3 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <Spaces />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/insights"
              element={
                <PageTransition className="pt-20 md:pt-32 px-3 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <InsightsDashboard />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/today"
              element={
                <PageTransition className="pt-20 md:pt-32 px-3 md:px-8 pb-24 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <DailyCommandCenter />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/focus"
              element={
                <PageTransition className="pt-20 md:pt-32 px-2 md:px-8 pb-20 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <Focus />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/settings"
              element={
                <PageTransition className="pt-20 md:pt-32 px-2 md:px-8 pb-20 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <Settings />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition className="pt-20 md:pt-32 px-2 md:px-8 pb-20 md:pb-10">
                  <div className="max-w-full md:max-w-[95%] w-full mx-auto">
                    <Profile />
                  </div>
                </PageTransition>
              }
            />
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
