import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Clock } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const FocusAnalytics: React.FC = () => {
  const focusSessions = useAppStore(state => state.focusSessions);

  const { totalHours, currentStreak, days } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysArray = [];
    const sessionsByDate: Record<string, number> = {};
    let totalSeconds = 0;

    focusSessions.forEach(session => {
      let dateStr = session.date;
      if (!dateStr) {
        const d = new Date(session.startTime);
        dateStr = d.toISOString().split("T")[0];
      }
      sessionsByDate[dateStr] = (sessionsByDate[dateStr] || 0) + session.duration;
      totalSeconds += session.duration;
    });

    const totalHours = Math.floor(totalSeconds / 3600);

    for (let i = 167; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const durationSeconds = sessionsByDate[dateStr] || 0;

      let intensity = 0;
      if (durationSeconds > 0) {
        if (durationSeconds < 1500) intensity = 1;
        else if (durationSeconds < 3600) intensity = 2;
        else if (durationSeconds < 7200) intensity = 3;
        else intensity = 4;
      }

      daysArray.push({ date: dateStr, duration: durationSeconds, intensity });
    }

    let streak = 0;
    for (let i = 0; i < 168; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (sessionsByDate[dateStr] && sessionsByDate[dateStr] > 0) {
        streak++;
      } else {
        if (i > 0) break;
      }
    }

    return { totalHours, currentStreak: streak, days: daysArray };
  }, [focusSessions]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
  };

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-border/20 dark:bg-white/5";
      case 1: return "bg-primary/30";
      case 2: return "bg-primary/50";
      case 3: return "bg-primary/75";
      case 4: return "bg-primary";
      default: return "bg-border/20 dark:bg-white/5";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-surface/30 backdrop-blur-3xl border border-border/20 rounded-3xl p-6 md:p-8"
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-base font-semibold text-text mb-1">Focus Activity</p>
          <p className="text-xs text-text-muted">A timeline of your 24 latest weeks</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Total hours */}
          <div className="flex items-center gap-2 text-text-muted">
            <Clock className="w-4 h-4" />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-display font-medium text-text tabular-nums">{totalHours}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">h</span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 text-text-muted">
            <Flame className="w-4 h-4" />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-display font-medium text-text tabular-nums">{currentStreak}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-max">
          <div
            className="grid grid-flow-col gap-1.5 justify-start"
            style={{ gridTemplateRows: "repeat(7, 10px)" }}
          >
            {days.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.001, duration: 0.3 }}
                title={`${day.date}: ${formatDuration(day.duration)}`}
                className={`w-2.5 h-2.5 rounded-[2px] transition-transform duration-200 ${getIntensityClass(day.intensity)} ${day.duration > 0 ? "cursor-pointer" : "cursor-default"}`}
                whileHover={day.duration > 0 ? { scale: 1.5 } : {}}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">24w ago</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-2.5 h-2.5 rounded-[2px] ${getIntensityClass(intensity)}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Today</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FocusAnalytics;
