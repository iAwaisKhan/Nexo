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
  ChevronLeft,
  Clock,
  Maximize2,
  Minimize2,
  Link as LinkIcon,
  X,
  Share2,
  Edit3,
  Columns,
  BookOpen,
  Sparkles,
  Terminal,
  Brain,
  LineChart,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, AppFocusSession } from "../store/useAppStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ui/ErrorFallback";
import GraphView from "./GraphView";
import NoteSharing from "./NoteSharing";
import { DebugJournal, FeynmanBlock, FocusAnalyticsBlock } from "./ThoughtBlocks";
import BlockEditor from "./BlockEditor";

import type { Note } from '../types/note';
export type { Note };

interface NotesProps {
}

const Notes: React.FC<NotesProps> = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ titles: string[], index: number } | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isInsightMenuOpen, setIsInsightMenuOpen] = useState(false);
  const insightMenuRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && !selectedId) {
      setIsSidebarOpen(true);
    }
  }, [selectedId, isMobile]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (insightMenuRef.current && !insightMenuRef.current.contains(event.target as Node)) {
        setIsInsightMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const sessionStartRef = useRef<number | null>(null);

  const notes = useAppStore(state => state.notes);
  const sessions = useAppStore(state => state.focusSessions);
  const addNoteStore = useAppStore(state => state.addNote);
  const updateNoteStore = useAppStore(state => state.updateNote);
  const deleteNoteStore = useAppStore(state => state.deleteNote);
  const addFocusSession = useAppStore(state => state.addFocusSession);


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
            updateNoteStore({ ...note, timeSpent: updatedTime });
            
            const session: AppFocusSession = {
              id: crypto.randomUUID(),
              startTime: sessionStartRef.current,
              endTime: Date.now(),
              duration: duration,
              targetId: id,
              targetType: 'note',
              date: new Date().toISOString().split('T')[0],
              hour: new Date(sessionStartRef.current).getHours()
            };
            addFocusSession(session);
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
      id: crypto.randomUUID(),
      title: "",
      content: "",
      tags: [],
      isPinned: false,
      lastModified: Date.now()
    };
    addNoteStore(newNote);
    setSelectedId(newNote.id);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNoteStore({ ...note, ...updates, lastModified: Date.now() });
      
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
      deleteNoteStore(id);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const togglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNoteStore({ ...note, isPinned: !note.isPinned });
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setSelectedId(null)}>
    <div className={`flex h-full bg-surface/20 rounded-4xl border border-border/5 overflow-hidden transition-all duration-500 ${isFocusMode ? "fixed inset-4 z-50 bg-surface/95 backdrop-blur-3xl" : ""}`}>
      <AnimatePresence>
        {isSidebarOpen && !isFocusMode && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? "100%" : 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`border-r border-border/10 flex flex-col shrink-0 h-full ${isMobile ? "w-full" : "w-[320px]"}`}
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
                    onClick={() => {
                      setSelectedId(note.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
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

      <div className={`flex-1 flex flex-col bg-surface/10 min-w-0 ${isMobile && isSidebarOpen ? "hidden" : ""}`}>
        {selectedNote ? (
          <>
            <div className="h-20 px-4 md:px-8 border-b border-border/10 flex items-center justify-between bg-surface/80 backdrop-blur-md group/header">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {isMobile ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setSelectedId(null);
                    }}
                    className="p-2 rounded-full bg-surface/50 border border-border/10 text-text/50 hover:text-text hover:border-border/20 hover:bg-surface transition-all flex items-center justify-center shadow-sm shrink-0"
                    title="Back to notes list"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                ) : (
                  !isFocusMode && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="p-2 rounded-full bg-surface/50 border border-border/10 text-text/50 hover:text-text hover:border-border/20 hover:bg-surface transition-all flex items-center justify-center shadow-sm shrink-0"
                      title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
                    </motion.button>
                  )
                )}
                <div className="relative flex-1 min-w-0">
                  <input 
                    type="text"
                    value={selectedNote.title}
                    placeholder="Untitled Note"
                    onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })}
                    className="bg-transparent text-xl md:text-2xl font-display font-semibold tracking-tight focus:outline-none w-full border-none text-text placeholder:text-text/25 py-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                {/* Insight Blocks Dropdown */}
                <div className="relative" ref={insightMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsInsightMenuOpen(!isInsightMenuOpen)}
                    className="px-3 py-2 rounded-xl bg-surface/50 border border-border/10 text-xs font-semibold text-text/60 hover:text-text hover:border-border/20 transition-all flex items-center gap-1.5 shadow-sm"
                    title="Insert specialized thought blocks"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="hidden sm:inline">Insight Blocks</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isInsightMenuOpen ? "rotate-180" : ""}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isInsightMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-surface/95 backdrop-blur-xl border border-border/15 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-0.5"
                      >
                        <div className="text-[9px] font-bold text-text/40 uppercase tracking-wider px-3 py-1.5 border-b border-border/10 mb-1">
                          Insert Thought Block
                        </div>
                        <button
                          onClick={() => {
                            insertThoughtBlock('debug');
                            setIsInsightMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-text/70 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all flex items-center gap-2"
                        >
                          <Terminal className="w-3.5 h-3.5 text-red-500/80" />
                          <span>Debug Journal</span>
                        </button>
                        <button
                          onClick={() => {
                            insertThoughtBlock('feynman');
                            setIsInsightMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-text/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2"
                        >
                          <Brain className="w-3.5 h-3.5 text-primary/80" />
                          <span>Feynman Block</span>
                        </button>
                        <button
                          onClick={() => {
                            insertThoughtBlock('analytics');
                            setIsInsightMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-text/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2"
                        >
                          <LineChart className="w-3.5 h-3.5 text-primary/80" />
                          <span>Focus Analytics</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Mode Segmented Control */}
                <div className="flex bg-surface/60 border border-border/10 rounded-xl p-1 gap-0.5 shadow-sm">
                  {([
                    { id: 'edit' as const, label: 'Write', icon: Edit3, tooltip: 'Editor Only' },
                    { id: 'split' as const, label: 'Split', icon: Columns, tooltip: 'Split View' },
                    { id: 'preview' as const, label: 'Read', icon: BookOpen, tooltip: 'Preview Mode' }
                  ]).map((mode) => {
                    const Icon = mode.icon;
                    const isActive = viewMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        title={mode.tooltip}
                        className={`relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-all z-10 duration-200 select-none ${
                          isActive 
                            ? "text-primary shadow-sm" 
                            : "text-text/50 hover:text-text/80 hover:bg-surface/30"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeViewMode"
                            className="absolute inset-0 bg-primary/10 rounded-lg -z-10 border border-primary/25"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                <NoteSharing 
                  note={selectedNote} 
                  onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)} 
                />

                <div className="h-5 w-px bg-border/10 mx-1 hidden sm:block" />

                <div className="flex items-center gap-1.5">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-sm ${
                      isFocusMode 
                        ? "text-primary bg-primary/10 border-primary/20 shadow-primary/5" 
                        : "text-text/50 bg-surface/50 border-border/10 hover:text-text hover:border-border/20 hover:bg-surface"
                    }`}
                  >
                    {isFocusMode ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePin(selectedNote.id)}
                    title={selectedNote.isPinned ? "Unpin Note" : "Pin Note"}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-sm ${
                      selectedNote.isPinned 
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5" 
                        : "text-text/50 bg-surface/50 border-border/10 hover:text-text hover:border-border/20 hover:bg-surface"
                    }`}
                  >
                    <Pin className="w-4.5 h-4.5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    title="Delete Note"
                    className="p-2.5 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-sm text-text/50 bg-surface/50 border-border/10 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </motion.button>
                </div>
              </div>
            </div>

            <div className={`flex-1 flex overflow-hidden ${isFocusMode ? "max-w-4xl mx-auto w-full" : ""}`}>
              <div className={`p-4 md:p-8 overflow-y-auto relative transition-all duration-300 ${
                viewMode === 'edit' ? "flex-1 w-full" : 
                viewMode === 'split' ? "w-1/2 border-r border-border/10" : 
                "hidden"
              }`}>
                <BlockEditor
                  noteId={selectedNote.id}
                  initialContent={selectedNote.content}
                  onChange={(content) => handleUpdateNote(selectedNote.id, { content })}
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

              <div className={`p-4 md:p-8 overflow-y-auto transition-all duration-300 ${
                viewMode === 'edit' ? "hidden" : 
                viewMode === 'split' ? "w-1/2 bg-surface/5" : 
                `w-full bg-surface/20 ${selectedNote.isBlog ? "px-[10%]" : "px-8"}`
              }`}>
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

            <div className="p-4 px-4 md:px-8 border-t border-border/10 flex items-center gap-4 bg-surface/30">
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
            <h3 className="text-2xl font-display uppercase tracking-widest">Nexo Notes</h3>
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

    </ErrorBoundary>
  );
};

export default Notes;
