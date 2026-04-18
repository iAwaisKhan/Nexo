import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  StickyNote,
  CheckCircle,
  Brain,
  Settings as SettingsIcon,
  Cloud,
  CloudOff,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { ZenMode } from "./ZenMode";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore, SyncStatus } from "../store/useAppStore";

const SyncBadge: React.FC = () => {
  const syncStatus = useAppStore((s) => s.syncStatus);
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return null;

  const statusConfig: Record<SyncStatus, { icon: React.ReactNode; color: string; label: string }> = {
    idle: {
      icon: <Cloud className="w-3.5 h-3.5" />,
      color: "text-green-500",
      label: lastSyncedAt
        ? `Synced ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : "Synced",
    },
    syncing: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      color: "text-amber-500",
      label: "Syncing...",
    },
    error: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      color: "text-red-500",
      label: "Sync error",
    },
    offline: {
      icon: <CloudOff className="w-3.5 h-3.5" />,
      color: "text-text/30",
      label: "Offline",
    },
  };

  const config = statusConfig[syncStatus];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 ${config.color} cursor-default`}
      title={config.label}
    >
      {config.icon}
      <span className="text-[9px] font-bold uppercase tracking-widest hidden lg:inline">
        {config.label}
      </span>
    </motion.div>
  );
};

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/notes", label: "Notes", icon: StickyNote },
  { path: "/tasks", label: "Tasks", icon: CheckCircle },
  { path: "/focus", label: "Focus", icon: Brain },
  { path: "/settings", label: "Config", icon: SettingsIcon },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Build avatar props from auth state
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'U';
  const fallback = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 bg-transparent border-b border-white/10">
      {/* Left: Logo */}
      <div className="flex-1 flex items-center">
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <span className="text-lg md:text-xl font-light text-text tracking-[0.3em] md:tracking-[0.4em] uppercase font-sans transition-all group-hover:tracking-[0.5em]">Nexo</span>
        </div>
      </div>

      {/* Center: Uiverse Nav */}
      <nav className="uiverse-menu shadow-2xl shadow-primary/5 flex max-md:overflow-x-auto max-md:max-w-[50vw] scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`uiverse-link ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="uiverse-link-icon flex-shrink-0">
              <item.icon className="w-5 h-5" />
            </span>
            <span className="uiverse-link-title font-redhat hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Right: ZenMode + Sync Badge + Avatar */}
      <div className="flex-1 flex items-center justify-end gap-2 md:gap-3">
        <ZenMode />
        <SyncBadge />
        <div
          className="group cursor-pointer transition-all flex items-center"
          onClick={() => navigate(isAuthenticated ? "/settings" : "/profile")}
        >
          {isAuthenticated && avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border-2 border-primary/20 hover:border-primary/40 transition-all"
            />
          ) : (
            <Avatar size="sm" fallback={fallback} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
