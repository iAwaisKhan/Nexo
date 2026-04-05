import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { 
  StickyNote, 
  CheckSquare, 
  Search, 
  ArrowRight,
  Clock,
  Tag as TagIcon
} from "lucide-react";

interface SearchResultsProps {
  query: string;
  onNavigate: (view: string, id?: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onNavigate }) => {
  const notes = useAppStore(state => state.notes);
  const tasks = useAppStore(state => state.tasks);

  const filteredNotes = useMemo(() => 
    notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()))
  , [notes, query]);

  const filteredTasks = useMemo(() => 
    tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
  , [tasks, query]);

  const isEmpty = filteredNotes.length === 0 && filteredTasks.length === 0;

  if (!query) return null;

  return (
    <div className="space-y-12 py-10">
      <div className="flex items-center justify-between border-b border-border/5 pb-6">
        <div>
          <h3 className="text-3xl font-display italic text-text">Search Results</h3>
          <p className="text-xs font-bold text-text/30 uppercase tracking-[0.2em] mt-1">
            Intercepting signals for "{query}"
          </p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{filteredNotes.length} Notes</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{filteredTasks.length} Tasks</span>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-text/20 space-y-4">
          <Search className="w-12 h-12 stroke-[1]" />
          <p className="text-sm font-medium italic">No matches found in the current frequency.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notes Section */}
          {filteredNotes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text/30 pl-1">
                <StickyNote className="w-3 h-3" />
                Notes
              </div>
              <div className="space-y-3">
                {filteredNotes.map(note => (
                  <motion.div
                    key={note.id}
                    whileHover={{ x: 5 }}
                    onClick={() => onNavigate("notes", note.id)}
                    className="group p-5 rounded-2xl bg-surface/40 border border-border/5 hover:border-primary/20 hover:bg-surface/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-text group-hover:text-primary transition-colors">{note.title || "Untitled"}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-text/40 font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(note.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text/30 pl-1">
                <CheckSquare className="w-3 h-3" />
                Tasks
              </div>
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <motion.div
                    key={task.id}
                    whileHover={{ x: 5 }}
                    onClick={() => onNavigate("tasks")}
                    className="group p-5 rounded-2xl bg-surface/40 border border-border/5 hover:border-primary/20 hover:bg-surface/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-text group-hover:text-primary transition-colors">{task.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-text/40 font-bold uppercase tracking-widest">
                        <TagIcon className="w-3 h-3" />
                        {task.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
