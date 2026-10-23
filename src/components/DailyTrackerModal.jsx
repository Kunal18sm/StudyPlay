import React from 'react';
import { X, Flame, Clock } from 'lucide-react';
import { calculateStreak } from '../utils/calculator';

export default function DailyTrackerModal({ isOpen, onClose, studyLogs }) {
  if (!isOpen) return null;

  const streakInfo = calculateStreak(studyLogs);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = (studyLogs && studyLogs[dateStr]) || { videos: 0, minutes: 0 };
    last7Days.push({
      dateStr,
      dayName: daysOfWeek[d.getDay()],
      dayNumber: d.getDate(),
      videos: log.videos,
      minutes: log.minutes,
      isToday: i === 0,
    });
  }

  const maxMinutes = Math.max(60, ...last7Days.map((d) => d.minutes));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#161821] border border-[#232733] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232733]">
          <h2 className="text-sm font-semibold text-white">Study Activity</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#101217] border border-[#232733]">
              <span className="text-slate-400 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak</span>
              </span>
              <div className="text-xl font-bold text-white mt-1">
                {streakInfo.currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#101217] border border-[#232733]">
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Today</span>
              </span>
              <div className="text-xl font-bold text-white mt-1">
                {streakInfo.todayMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
              </div>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="p-3.5 rounded-lg bg-[#101217] border border-[#232733] space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Last 7 Days</span>
              <span>Minutes studied</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-2">
              {last7Days.map((d) => {
                const heightPercent = maxMinutes > 0 ? Math.max(10, Math.round((d.minutes / maxMinutes) * 100)) : 10;
                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[9px] font-mono text-slate-400">
                      {d.minutes > 0 ? `${d.minutes}m` : ''}
                    </span>

                    <div className="w-full bg-[#1e222d] rounded-t overflow-hidden flex flex-col justify-end h-16">
                      <div
                        className={`w-full rounded-t transition-all ${
                          d.isToday ? 'bg-blue-500' : d.minutes > 0 ? 'bg-slate-500' : 'bg-transparent'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className={`text-[10px] ${d.isToday ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#232733] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#202330] hover:bg-[#282d3d] text-slate-300 text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
