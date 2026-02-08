import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useQuery } from "@tanstack/react-query";
import { storage } from "../js/storageManager";
import { Note } from "./Notes";
import { Globe, ArrowLeft, GraduationCap } from "lucide-react";

const SharedNoteView: React.FC = () => {
  const noteId = window.location.pathname.split('/share/')[1];

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      await storage.init();
      const notes = await storage.getAll<Note>("notes");
      const found = notes.find(n => n.id === noteId);
      if (found && found.isPublic) return found;
      return null;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-text/40">Decrypting Knowledge...</span>
    </div>
  );

  if (!note) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <div className="w-20 h-20 rounded-[2rem] bg-red-500/5 flex items-center justify-center">
        <Globe className="w-10 h-10 text-red-500/40" />
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-display italic mb-2">Private Frequency</h3>
        <p className="text-sm text-text/40 max-w-xs mx-auto">This note is either private or does not exist in the Aura network.</p>
      </div>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
      >
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/20 selection:text-primary">
      <header className="h-20 px-8 flex items-center justify-between border-b border-border/5 bg-surface/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="text-sm font-display uppercase tracking-[0.3em]">Aura Portal</span>
        </div>
        <div className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] flex items-center gap-2">
          <Globe className="w-3 h-3 text-primary" />
          Shared Read-Only
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-20">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4 text-center">
            <h1 className="text-6xl font-display italic tracking-tight">{note.title}</h1>
            <div className="flex items-center justify-center gap-4 text-[10px] text-text/40 font-bold uppercase tracking-[0.2em]">
              <span>Last Modified {new Date(note.lastModified).toLocaleDateString()}</span>
              <span>•</span>
              <span>{Math.ceil(note.content.split(' ').length / 200)} min read</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none 
            prose-headings:font-display prose-headings:italic prose-headings:font-normal
            prose-p:text-text/80 prose-p:leading-relaxed prose-p:font-medium
            prose-code:text-primary prose-pre:bg-surface/50 prose-pre:border prose-pre:border-border/10
          ">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || "")
                  return match ? (
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, "")}
                      style={oneLight as any}
                      language={match[1]}
                      PreTag="div"
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </motion.article>
      </main>

      <footer className="py-20 border-t border-border/5 text-center space-y-8">
        <div className="w-12 h-px bg-primary/20 mx-auto" />
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em]">Crafted in your personal Aura</p>
          <p className="text-xs text-text/20">The minimalist home for your knowledge and growth.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 font-medium text-sm italic"
        >
          <ArrowLeft className="w-4 h-4" />
          Join the Mindful Workspace
        </button>
      </footer>
    </div>
  );
};

export default SharedNoteView;
