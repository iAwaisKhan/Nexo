import React from "react";
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
  Database
} from "lucide-react";

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
  const clearData = () => {
    if (confirm("Are you sure? This will permanently delete all your notes, tasks, and focus history.")) {
      indexedDB.deleteDatabase("AuraDB_Modern");
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    alert("Export feature coming soon - currently your data is stored locally in this browser.");
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex flex-col gap-12">
        
        {/* Profile / Identity */}
        <SettingSection title="Account">
          <SettingItem 
            icon={User} 
            label="Profile Identity" 
            description="Manage your AURA cryptographic identity"
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
            description="Download all data as a .aura JSON file"
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
            <span className="text-[10px] font-bold uppercase tracking-widest">Aura Encryption Enabled</span>
          </div>
          <p className="text-[10px] text-text/30 font-medium">Version 1.2.0 • Human Crafted</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;
