import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Loader2,
  Play,
  Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { AppFocusSession } from "../store/useAppStore";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "To Do" | "Done";
  createdAt: number;
  timeSpent?: number; // Cumulative seconds
  deleted_at?: string | null;
}

const Tasks: React.FC = () => {
  const tasks = useAppStore(state => state.tasks).sort((a, b) => b.createdAt - a.createdAt);
  const addTaskStore = useAppStore(state => state.addTask);
  const updateTaskStore = useAppStore(state => state.updateTask);
  const deleteTaskStore = useAppStore(state => state.deleteTask);
  const addFocusSession = useAppStore(state => state.addFocusSession);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "To Do" | "Done">("All");
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "Medium" as "High" | "Medium" | "Low", dueDate: "" });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTaskStartRef = useRef<number | null>(null);

  const isLoading = false;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "All" || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, filterStatus]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: "To Do",
      createdAt: Date.now()
    };
    addTaskStore(task);
    setNewTask({ title: "", description: "", priority: "Medium", dueDate: "" });
    setIsAdding(false);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updatedTask = { ...task, status: task.status === "Done" ? "To Do" : "Done" as "To Do" | "Done" };
    updateTaskStore(updatedTask);
  };

  const deleteTask = (id: string) => {
    deleteTaskStore(id);
  };

  const toggleFocus = (id: string) => {
    if (activeTaskId === id) {
      // Stop current
      if (activeTaskStartRef.current) {
        const duration = Math.floor((Date.now() - activeTaskStartRef.current) / 1000);
        if (duration > 0) {
          const task = tasks.find(t => t.id === id);
          if (task) {
            const updatedTime = (task.timeSpent || 0) + duration;
            updateTaskStore({ ...task, timeSpent: updatedTime });
            
            const session: AppFocusSession = {
              id: Date.now().toString(),
              startTime: activeTaskStartRef.current,
              endTime: Date.now(),
              duration: duration,
              targetId: id,
              targetType: 'task',
              date: new Date().toISOString().split('T')[0],
              hour: new Date(activeTaskStartRef.current).getHours()
            };
            addFocusSession(session);
          }
        }
      }
      setActiveTaskId(null);
      activeTaskStartRef.current = null;
    } else {
      // If another task is active, stop it first? For simplicity, just switch.
      if (activeTaskId) toggleFocus(activeTaskId); 
      
      setActiveTaskId(id);
      activeTaskStartRef.current = Date.now();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (activeTaskId && activeTaskStartRef.current) {
        const duration = Math.floor((Date.now() - activeTaskStartRef.current) / 1000);
        const task = tasks.find(t => t.id === activeTaskId);
        if (task && duration > 0) {
          const updatedTime = (task.timeSpent || 0) + duration;
          updateTaskStore({ ...task, timeSpent: updatedTime });
          // Save session too but might be tricky with async delete during unmount?
          // Usually we want to save before unmount.
        }
      }
    };
  }, [activeTaskId, tasks]);

  const getPriorityColor = (p: string) => {
    switch(p) {
      case "High": return "text-red-500 bg-red-500/10";
      case "Medium": return "text-amber-500 bg-amber-500/10";
      default: return "text-blue-500 bg-blue-500/10";
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
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:w-80">
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 border border-border/15 rounded-2xl py-2.5 px-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
          </div>
          <select 
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            className="bg-surface/50 border border-border/15 rounded-2xl px-4 py-2.5 text-sm focus:outline-none text-text/80 font-medium"
          >
            <option value="All">All Status</option>
            <option value="To Do">To Do</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-2xl shadow-lg shadow-primary/20 font-bold uppercase tracking-wider text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="p-8 rounded-4xl bg-surface border-2 border-primary/20 shadow-xl space-y-4"
            >
              <input 
                autoFocus
                type="text"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full bg-transparent text-2xl font-display focus:outline-none text-text"
              />
              <textarea 
                placeholder="Add a description..."
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full bg-transparent text-sm resize-none focus:outline-none opacity-80 text-text font-medium leading-relaxed"
              />
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/10">
                <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-border/10">
                  {["Low", "Medium", "High"].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTask({...newTask, priority: p as any})}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        newTask.priority === p ? getPriorityColor(p) : "text-text/50 hover:text-text/80"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input 
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="bg-surface/50 border border-border/10 rounded-xl px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none text-text/80"
                />
                <div className="ml-auto flex gap-3">
                  <button onClick={() => setIsAdding(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-text/50 hover:text-text/80">Cancel</button>
                  <button onClick={addTask} className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Create Task</button>
                </div>
              </div>
            </motion.div>
          )}

          {filteredTasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`group p-6 rounded-4xl bg-surface border border-border/10 hover:border-primary/20 transition-all ${task.status === "Done" ? "opacity-70" : "shadow-sm shadow-primary/5"}`}
            >
              <div className="flex items-start gap-5">
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 transition-all duration-300 scale-110 ${task.status === "Done" ? "text-primary" : "text-text/30 hover:text-primary/50"}`}
                >
                  {task.status === "Done" ? <CheckCircle2 className="w-6 h-6 shadow-sm" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xl font-display transition-all ${task.status === "Done" ? "line-through text-text/50" : "text-text"}`}>
                      {task.title}
                    </h4>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFocus(task.id);
                      }}
                      className={`p-2 rounded-xl transition-all ${activeTaskId === task.id ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "text-text/30 hover:bg-primary/5 hover:text-primary"}`}
                    >
                      {activeTaskId === task.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                  {task.description && (
                    <p className={`mt-1.5 text-sm font-medium line-clamp-2 leading-relaxed ${task.status === "Done" ? "text-text/40" : "text-text/60"}`}>{task.description}</p>
                  )}
                  
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] border border-transparent ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-text/50 bg-surface/30 px-3 py-1 rounded-lg border border-border/10">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </div>
                    )}
                    {task.timeSpent && task.timeSpent > 0 && (
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-primary/60 bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                        <Clock className="w-3 h-3" />
                        {Math.floor(task.timeSpent / 60)}m {task.timeSpent % 60}s
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-text/30 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <CheckCircle2 className="w-20 h-20 mb-6 stroke-1" />
            <p className="text-2xl font-display uppercase tracking-widest">All caught up!</p>
            <p className="text-sm font-medium mt-2">Your focus is unmatched today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
