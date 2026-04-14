import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Globe, 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  Zap, 
  PenTool,
  MessageSquare
} from "lucide-react";
import type { Note } from "../types";

interface NoteSharingProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
}

const NoteSharing: React.FC<NoteSharingProps> = ({ note, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/share/${note.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const publishToExternal = (platform: string) => {
    const text = `# ${note.title}\n\n${note.content}`;
    const url = platform === 'medium' 
      ? `https://medium.com/new-story` 
      : `https://dev.to/new`;
    
    // Copy content to clipboard first for convenience
    navigator.clipboard.writeText(text);
    alert(`Content copied to clipboard! Redirecting to ${platform} to publish...`);
    window.open(url, '_blank');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all ${note.isPublic ? "text-primary bg-primary/10 shadow-lg shadow-primary/10" : "text-text/50 hover:bg-primary/5"}`}
        title="Share & Publish"
      >
        <Share2 className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-surface/90 backdrop-blur-xl border border-border/20 rounded-3xl shadow-2xl z-50 p-6 space-y-6 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text/80">Share Workspace</h3>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${note.isPublic ? "bg-primary text-white" : "bg-text/5 text-text/30"}`}>
                {note.isPublic ? "Public" : "Private"}
              </div>
            </div>

            {/* Public Access Toggle */}
            <div className="space-y-3">
              <div 
                onClick={() => onUpdate({ isPublic: !note.isPublic })}
                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${note.isPublic ? "bg-primary/5 border-primary/20" : "bg-transparent border-border/5 hover:border-border/20"}`}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`w-5 h-5 ${note.isPublic ? "text-primary" : "text-text/30"}`} />
                  <div>
                    <div className="text-xs font-bold text-text">Web Visibility</div>
                    <div className="text-[10px] text-text/40 font-medium">Generate a read-only link</div>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${note.isPublic ? "bg-primary" : "bg-border/20"}`}>
                  <motion.div 
                    animate={{ x: note.isPublic ? 16 : 4 }}
                    className="absolute top-1 w-2 h-2 rounded-full bg-white shadow-sm"
                  />
                </div>
              </div>

              {note.isPublic && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-surface/50 border border-border/10 shrink-0"
                >
                  <input 
                    readOnly 
                    value={publicUrl}
                    className="flex-1 bg-transparent text-[10px] font-mono p-1 text-text/60 outline-none overflow-hidden text-ellipsis"
                  />
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Learning Blog Format */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] px-1">Publishing</div>
              
              <button 
                onClick={() => onUpdate({ isBlog: !note.isBlog })}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${note.isBlog ? "bg-primary/5 border-primary/20" : "bg-transparent border-border/5 hover:bg-primary/5"}`}
              >
                <BookOpen className={`w-5 h-5 ${note.isBlog ? "text-primary" : "text-text/30"}`} />
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-text">Format as Blog</div>
                  <div className="text-[10px] text-text/40 font-medium">Enable typography-first reading</div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => publishToExternal('medium')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border/5 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <PenTool className="w-3.5 h-3.5 text-text/30 group-hover:text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text/60 group-hover:text-text">Medium</span>
                </button>
                <button 
                  onClick={() => publishToExternal('devto')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border/5 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <Zap className="w-3.5 h-3.5 text-text/30 group-hover:text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text/60 group-hover:text-text">Dev.to</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-text/20">
              <ExternalLink className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Aura Open Source Publishing</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteSharing;
