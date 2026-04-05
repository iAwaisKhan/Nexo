import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Moon,
  Sun,
  Shield,
  Trash2,
  Download,
  Info,
  ChevronRight,
  Bell,
  Palette,
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import { syncEngine } from "../lib/syncEngine";
import { isSupabaseConfigured } from "../lib/supabase";

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] pl-1">
      {title}
    </h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

interface SettingItemProps {
  icon: any;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon: Icon, label, description, action, onClick, danger }) => (
  <motion.div
    whileHover={onClick ? { x: 4 } : {}}
    onClick={onClick}
    className={`group flex items-center justify-between p-4 rounded-2xl border border-border/5 bg-surface/30 backdrop-blur-sm transition-all ${onClick ? 'cursor-pointer hover:bg-surface/50 hover:border-border/20' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${danger ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className={`font-medium tracking-tight ${danger ? 'text-red-500' : 'text-text'}`}>{label}</div>
        {description && <div className="text-xs text-text/40 font-medium">{description}</div>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {action}
      {onClick && <ChevronRight className="w-4 h-4 text-text/20" />}
    </div>
  </motion.div>
);

interface SettingsProps {
}

const Settings: React.FC<SettingsProps> = () => {
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuthStore();
  const { syncStatus, lastSyncedAt } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const clearData = () => {
    if (confirm("Are you sure? This will permanently delete all your notes, tasks, and focus history.")) {
      indexedDB.deleteDatabase("AuraDB_Modern");
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const state = useAppStore.getState();
    const data = {
      notes: state.notes,
      tasks: state.tasks,
      focusSessions: state.focusSessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexo-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await syncEngine.forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
    setIsSyncing(false);
  };

  const handleSignOut = async () => {
    if (confirm("Sign out? Your local data will remain on this device.")) {
      await syncEngine.destroy();
      await signOut();
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const formatLastSynced = () => {
    if (!lastSyncedAt) return "Never";
    const diff = Date.now() - lastSyncedAt;
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex flex-col gap-12">

        {/* Cloud & Sync */}
        <SettingSection title="Cloud & Sync">
          {isAuthenticated && user ? (
            <>
              {/* Account Info */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border/5 bg-surface/30 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-text">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                    </div>
                    <div className="text-xs text-text/40 font-medium">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {syncStatus === 'idle' && (
                    <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Synced
                    </span>
                  )}
                  {syncStatus === 'syncing' && (
                    <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Syncing
                    </span>
                  )}
                  {syncStatus === 'error' && (
                    <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Error
                    </span>
                  )}
                </div>
              </div>

              {/* Sync Actions */}
              <SettingItem
                icon={RefreshCw}
                label="Sync Now"
                description={`Last synced: ${formatLastSynced()}`}
                onClick={handleForceSync}
                action={
                  isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : undefined
                }
              />
              <SettingItem
                icon={LogOut}
                label="Sign Out"
                description="Your local data will remain on this device"
                danger
                onClick={handleSignOut}
              />
            </>
          ) : (
            <>
              {isSupabaseConfigured() ? (
                <SettingItem
                  icon={Cloud}
                  label="Sign in to sync"
                  description="Enable cloud sync across all your devices"
                  onClick={handleSignIn}
                />
              ) : (
                <SettingItem
                  icon={CloudOff}
                  label="Cloud sync not configured"
                  description="Add Supabase credentials to enable cross-device sync"
                />
              )}
            </>
          )}
        </SettingSection>

        {/* Account */}
        <SettingSection title="Account">
          <SettingItem
            icon={User}
            label="Profile Identity"
            description="Manage your Nexo profile"
            onClick={() => {}}
          />
          <SettingItem
            icon={Bell}
            label="Notifications"
            description="Manage system alerts and break reminders"
            action={<div className="w-12 h-6 rounded-full bg-border/20 relative cursor-not-allowed"><div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-text/20" /></div>}
          />
        </SettingSection>

        {/* Storage */}
        <SettingSection title="System & Data">
          <SettingItem
            icon={Download}
            label="Export Workspace"
            description="Download all data as a JSON file"
            onClick={exportData}
          />
          <SettingItem
            icon={Trash2}
            label="Reset Workspace"
            description="Permanently delete all local data"
            danger
            onClick={clearData}
          />
        </SettingSection>

        {/* Information */}
        <div className="pt-8 border-t border-border/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-text/20">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          <p className="text-[10px] text-text/30 font-medium">Version 2.0.0 • Cloud Sync Enabled</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;
