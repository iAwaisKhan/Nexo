import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAppStore } from "../store/useAppStore";
import { Globe, ArrowLeft, GraduationCap } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Note } from "../types/note";
import { LazySyntaxHighlighter } from "./ui/LazySyntaxHighlighter";

interface PublicNoteRow {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  is_pinned: boolean | null;
  last_modified: number;
  time_spent: number | null;
  is_public: boolean | null;
  published_at: number | null;
  slug: string | null;
  is_blog: boolean | null;
  version: number | null;
}

const SharedNoteView: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  const notes = useAppStore(state => state.notes);
  const activeWorkspaceId = useAppStore(state => state.activeWorkspaceId);
  const cloudEnabled = isSupabaseConfigured();
  // Local fallback is intentionally guest-only. An authenticated user's
  // unsynced private workspace must never become a public data source.
  const isGuestWorkspace = activeWorkspaceId === 'guest';
  const localNote = isGuestWorkspace ? notes.find(n => n.id === noteId && n.isPublic) : undefined;
  const shouldFetchCloud = cloudEnabled && !isGuestWorkspace;
  
  const [fetchedNote, setFetchedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(shouldFetchCloud && !!noteId);

  useEffect(() => {
    let cancelled = false;

    if (!shouldFetchCloud || !noteId) {
      setFetchedNote(null);
      setIsLoading(false);
      return () => { cancelled = true; };
    }

    const fetchNote = async () => {
      setIsLoading(true);
      setFetchedNote(null);
      try {
        const { data, error } = await supabase
          .rpc('get_public_note', { p_note_id: noteId })
          .maybeSingle();

        if (error) throw error;
        
        const row = data as PublicNoteRow | null;
        if (row && !cancelled) {
          setFetchedNote({
            id: row.id,
            title: row.title,
            content: row.content,
            tags: row.tags || [],
            isPinned: row.is_pinned || false,
            lastModified: row.last_modified,
            timeSpent: row.time_spent || 0,
            version: row.version ?? 0,
            isPublic: row.is_public || false,
            publishedAt: row.published_at || undefined,
            slug: row.slug || undefined,
            isBlog: row.is_blog || false,
          });
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch public note:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchNote();
    return () => { cancelled = true; };
  }, [noteId, shouldFetchCloud]);

  const note = localNote || fetchedNote;

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
        <p className="text-sm text-text/40 max-w-xs mx-auto">This note is either private or does not exist in the Nexo network.</p>
      </div>
      <button 
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
      >
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/20 selection:text-primary">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-border/5 bg-surface/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="text-sm font-display uppercase tracking-[0.3em]">Nexo Portal</span>
        </div>
        <div className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] flex items-center gap-2">
          <Globe className="w-3 h-3 text-primary" />
          Shared Read-Only
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-20">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4 text-center">
            <h1 className="text-3xl md:text-6xl font-display italic tracking-tight">{note.title}</h1>
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
                    <React.Suspense fallback={<code className="block overflow-x-auto rounded-xl bg-surface/60 p-4 text-xs">{String(children)}</code>}>
                      <LazySyntaxHighlighter
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </LazySyntaxHighlighter>
                    </React.Suspense>
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

      <footer className="py-10 md:py-20 border-t border-border/5 text-center space-y-8">
        <div className="w-12 h-px bg-primary/20 mx-auto" />
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em]">Crafted in your personal Nexo</p>
          <p className="text-xs text-text/20">The minimalist home for your knowledge and growth.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
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
