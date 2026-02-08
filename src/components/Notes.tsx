import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Plus, 
  Search, 
  Trash2, 
  Pin, 
  Tag as TagIcon, 
  FileText,
  ChevronRight,
  Clock,
  Maximize2,
  Minimize2,
  Link as LinkIcon,
  Loader2,
  X,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage } from "../js/storageManager";
import GraphView from "./GraphView";
import NoteSharing from "./NoteSharing";
import { DebugJournal, FeynmanBlock, FocusAnalyticsBlock } from "./ThoughtBlocks";
import { FocusSession } from "../types/focus";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  lastModified: number;
  timeSpent?: number; // Cumulative seconds
  isPublic?: boolean;
  publishedAt?: number;
  slug?: string;
  isBlog?: boolean;
}

interface NotesProps {
}

const Notes: React.FC<NotesProps> = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ titles: string[], index: number } | null>(null);
  
  const sessionStartRef = useRef<number | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      await storage.init();
      return await storage.getAll<Note>("notes");
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newNote: Note) => {
      await storage.save("notes", newNote);
      return newNote;
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedId(newNote.id);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (note: Note) => {
      await storage.save("notes", note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await storage.delete("notes", id);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (selectedId === deletedId) setSelectedId(null);
    }
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["focusSessions"],
    queryFn: async () => {
      await storage.init();
      return await storage.getAll<FocusSession>("focusSessions");
    }
  });

  const selectedNote = useMemo(() => 
    notes.find(n => n.id === selectedId) || null
  , [notes, selectedId]);

  const insertThoughtBlock = (type: string) => {
    if (!selectedNote) return;
    const blockText = `\n<thought:${type} />\n`;
    handleUpdateNote(selectedNote.id, { content: selectedNote.content + blockText });
  };

  useEffect(() => {
    const startSession = () => {
      sessionStartRef.current = Date.now();
    };

    const endSession = (id: string) => {
      if (sessionStartRef.current) {
        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        if (duration > 5) {
          const note = notes.find(n => n.id === id);
          if (note) {
            const updatedTime = (note.timeSpent || 0) + duration;
            storage.save("notes", { ...note, timeSpent: updatedTime });
            
            const session: FocusSession = {
              id: Date.now().toString(),
              startTime: sessionStartRef.current,
              endTime: Date.now(),
              duration: duration,
              targetId: id,
              targetType: 'note',
              date: new Date().toISOString().split('T')[0],
              hour: new Date(sessionStartRef.current).getHours()
            };
            storage.save("focusSessions", session);
          }
        }
        sessionStartRef.current = null;
      }
    };

    if (selectedId) {
      startSession();
    }

    return () => {
      if (selectedId) {
        endSession(selectedId);
      }
    };
  }, [selectedId, notes]);

  const backlinks = useMemo(() => {
    if (!selectedNote) return [];
    return notes.filter(n => 
      n.id !== selectedNote.id && 
      n.content.includes(`[[${selectedNote.title}]]`)
    );
  }, [notes, selectedNote]);

  const filteredNotes = useMemo(() => {
    let result = notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastModified - a.lastModified;
    });
  }, [notes, searchQuery]);

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      content: "",
      tags: [],
      isPinned: false,
      lastModified: Date.now()
    };
    addMutation.mutate(newNote);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateMutation.mutate({ ...note, ...updates, lastModified: Date.now() });
      
      // Handle suggestions
      if (updates.content !== undefined) {
        const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || 0;
        const textBeforeCursor = updates.content.slice(0, cursorPosition);
        const match = textBeforeCursor.match(/\[\[([^\]]*)$/);
        
        if (match) {
          const query = match[1].toLowerCase();
          const filteredTitles = notes
            .filter(n => n.id !== id && n.title.toLowerCase().includes(query))
            .map(n => n.title || "Untitled")
            .slice(0, 5);
          
          if (filteredTitles.length > 0) {
            setSuggestions({ titles: filteredTitles, index: cursorPosition });
          } else {
            setSuggestions(null);
          }
        } else {
          setSuggestions(null);
        }
      }
    }
  };

  const insertSuggestion = (title: string) => {
    if (!selectedNote || !suggestions) return;
    
    const content = selectedNote.content;
    const textBefore = content.slice(0, suggestions.index).replace(/\[\[[^\]]*$/, "");
    const textAfter = content.slice(suggestions.index);
    const newContent = `${textBefore}[[${title}]]${textAfter}`;
    
    handleUpdateNote(selectedNote.id, { content: newContent });
    setSuggestions(null);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate(id);
    }
  };

  const togglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateMutation.mutate({ ...note, isPinned: !note.isPinned });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-surface/20 rounded-4xl border border-border/5 overflow-hidden transition-all duration-500 ${isFocusMode ? "fixed inset-4 z-50 bg-surface/95 backdrop-blur-3xl" : ""}`}>
      <AnimatePresence>
        {isSidebarOpen && !isFocusMode && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border/10 flex flex-col"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display text-text px-2">My Notes</h3>
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsGraphOpen(true)}
                    className="w-10 h-10 rounded-xl bg-surface border border-border/15 text-text/70 flex items-center justify-center hover:text-primary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNote}
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="relative group px-1">
                <input 
                  type="text" 
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface/80 border border-border/20 rounded-xl py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-text"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <FileText className="w-8 h-8 mx-auto mb-2 font-medium text-text" />
                  <p className="text-sm text-text">No notes found</p>
                </div>
              ) : (
                filteredNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedId(note.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group relative ${
                      selectedId === note.id 
                        ? "bg-primary/10 border-l-4 border-primary shadow-sm shadow-primary/5" 
                        : "hover:bg-primary/5 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate pr-6 text-text">
                        {note.title || "Untitled Note"}
                      </h4>
                      {note.isPinned && (
                        <Pin className="w-3 h-3 text-primary absolute right-4 top-4" />
                      )}
                    </div>
                    <p className="text-xs text-text/60 line-clamp-2 leading-relaxed">
                      {note.content || "No content yet..."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-text/50 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {new Date(note.lastModified).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col bg-surface/10">
        {selectedNote ? (
          <>
            <div className="h-20 px-8 border-b border-border/10 flex items-center justify-between bg-surface/30 backdrop-blur-sm group/header">
              <div className="flex items-center gap-4 flex-1">
                {!isFocusMode && (
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg hover:bg-primary/5 text-text/40 transition-colors"
                  >
                    <ChevronRight className={`w-5 h-5 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
                <input 
                  type="text"
                  value={selectedNote.title}
                  placeholder="Note Title"
                  onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })}
                  className="bg-transparent text-2xl font-display focus:outline-none w-full border-none text-text"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-surface/50 border border-border/10 rounded-xl px-1 mr-2 opacity-0 group-hover/header:opacity-100 transition-all">
                  <button 
                    onClick={() => insertThoughtBlock('debug')}
                    className="p-1.5 text-[8px] font-black uppercase tracking-tighter text-text/30 hover:text-red-500 transition-colors"
                  >
                    + Debug
                  </button>
                  <button 
                    onClick={() => insertThoughtBlock('feynman')}
                    className="p-1.5 text-[8px] font-black uppercase tracking-tighter text-text/30 hover:text-primary transition-colors"
                  >
                    + Feynman
                  </button>
                  <button 
                    onClick={() => insertThoughtBlock('analytics')}
                    className="p-1.5 text-[8px] font-black uppercase tracking-tighter text-text/30 hover:text-primary transition-colors"
                  >
                    + Analytics
                  </button>
                </div>
                <NoteSharing 
                  note={selectedNote} 
                  onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)} 
                />
                <button 
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                  className={`p-2.5 rounded-xl transition-colors ${isFocusMode ? "text-primary bg-primary/10" : "text-text/50 hover:bg-primary/5"}`}
                >
                  {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => togglePin(selectedNote.id)}
                  className={`p-2.5 rounded-xl transition-colors ${selectedNote.isPinned ? "text-primary bg-primary/10" : "text-text/50 hover:bg-primary/5"}`}
                >
                  <Pin className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-2.5 rounded-xl text-text/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className={`flex-1 flex overflow-hidden ${isFocusMode ? "max-w-4xl mx-auto w-full" : ""}`}>
              <div className="flex-1 p-8 overflow-y-auto relative">
                <textarea 
                  value={selectedNote.content}
                  onChange={(e) => handleUpdateNote(selectedNote.id, { content: e.target.value })}
                  placeholder="Start writing in markdown... Use [[Title]] for backlinks."
                  className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed text-text scrollbar-hide"
                />

                <AnimatePresence>
                  {suggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-8 bottom-8 bg-surface border border-border/20 rounded-2xl shadow-2xl p-2 min-w-50 z-20"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text/50 px-3 py-2 border-b border-border/10 mb-1 flex items-center justify-between">
                        Link Note <X className="w-3 h-3 cursor-pointer" onClick={() => setSuggestions(null)} />
                      </div>
                      {suggestions.titles.map(title => (
                        <button
                          key={title}
                          onClick={() => insertSuggestion(title)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium truncate"
                        >
                          [[{title}]]
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={`${isFocusMode ? "hidden md:block" : "hidden lg:block"} ${selectedNote.isBlog ? "w-full px-[10%] bg-surface/20" : "w-1/2 bg-surface/5 border-l border-border/10"} p-8 overflow-y-auto transition-all duration-700`}>
                {selectedNote.isBlog && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center space-y-4"
                  >
                    <div className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Learning Blog</div>
                    <h1 className="text-5xl font-display italic text-text">{selectedNote.title}</h1>
                    <div className="flex items-center justify-center gap-6 text-[10px] text-text/40 font-bold uppercase tracking-widest">
                      <span>{Math.ceil(selectedNote.content.split(' ').length / 200)} min read</span>
                      <span>•</span>
                      <span>{new Date(selectedNote.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="w-12 h-px bg-primary/20 mx-auto" />
                  </motion.div>
                )}
                <div className={`prose ${selectedNote.isBlog ? "prose-base mx-auto max-w-2xl" : "prose-sm max-w-none"} transition-all`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a({node, href, children, ...props}) {
                        if (href?.startsWith('note://')) {
                          const title = decodeURIComponent(href.replace('note://', ''));
                          return (
                            <button 
                              onClick={() => {
                                const note = notes.find(n => n.title === title);
                                if (note) setSelectedId(note.id);
                              }}
                              className="text-primary hover:underline font-bold decoration-primary/30"
                            >
                              {children}
                            </button>
                          );
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                      },
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
                      },
                      p({children}) {
                        const content = React.Children.toArray(children).join("");
                        if (content === "<thought:debug />") return <DebugJournal />;
                        if (content === "<thought:feynman />") return <FeynmanBlock />;
                        if (content === "<thought:analytics />") return <FocusAnalyticsBlock sessions={sessions} />;
                        return <p>{children}</p>;
                      }
                    }}
                  >
                    {selectedNote.content.replace(/\[\[(.*?)\]\]/g, (_, title) => `[[${title}]](note://${encodeURIComponent(title)})`)}
                  </ReactMarkdown>
                </div>
                
                {backlinks.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border/15">
                    <div className="flex items-center gap-2 text-text/50 mb-4 uppercase tracking-[0.2em] text-[10px] font-bold">
                      <LinkIcon className="w-3 h-3" />
                      Backlinks
                    </div>
                    <div className="grid gap-2">
                      {backlinks.map(linkNote => (
                        <button
                          key={linkNote.id}
                          onClick={() => setSelectedId(linkNote.id)}
                          className="text-left p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group border border-border/10"
                        >
                          <div className="text-xs font-semibold group-hover:text-primary transition-colors text-text">{linkNote.title || "Untitled"}</div>
                          <div className="text-[10px] text-text/60 truncate mt-1">{linkNote.content.substring(0, 60)}...</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 px-8 border-t border-border/10 flex items-center gap-4 bg-surface/30">
              <TagIcon className="w-4 h-4 text-primary shrink-0 opacity-60" />
              <div className="flex flex-wrap gap-2">
                {selectedNote.tags.map((tag, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 group border border-primary/20">
                    {tag}
                    <button 
                      onClick={() => handleUpdateNote(selectedNote.id, { tags: selectedNote.tags.filter((_, i) => i !== idx) })}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder="Add tag..."
                  className="bg-transparent text-[10px] uppercase font-bold focus:outline-none w-24 placeholder:text-text/30 text-text"
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      handleUpdateNote(selectedNote.id, { tags: [...selectedNote.tags, e.target.value.trim()] });
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              <div className="ml-auto text-[10px] flex items-center gap-2 text-text/50 font-bold uppercase tracking-widest italic">
                <Clock className="w-3 h-3" />
                Auto-saved
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText className="w-24 h-24 mb-6 stroke-1" />
            </motion.div>
            <h3 className="text-2xl font-display uppercase tracking-widest">Aura Notes</h3>
            <p className="text-sm font-medium mt-2">Every great thought deserves a beautiful place.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isGraphOpen && (
          <GraphView 
            notes={notes} 
            onClose={() => setIsGraphOpen(false)} 
            onNoteClick={(id) => {
              setSelectedId(id);
              setIsGraphOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;
