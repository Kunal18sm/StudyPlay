import React from 'react';
import { PlaySquare, Flame, Clock, Plus, Settings, Download } from 'lucide-react';

export default function Navbar({ 
  streak, 
  todayMinutes, 
  currentView, 
  setCurrentView, 
  onOpenAddModal, 
  onOpenSettings, 
  onOpenAnalytics,
  onOpenInstall,
  isInstalled 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232733] bg-[#14161d]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer" 
            onClick={() => setCurrentView('list')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <PlaySquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              StudyPlay
            </span>
          </div>

          {/* Center/Right Stats & Actions */}
          <div className="flex items-center space-x-2">
            
            {/* Streak & Today's Study button */}
            <button 
              onClick={onOpenAnalytics}
              className="flex items-center space-x-2 sm:space-x-3 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1a1d26] border border-[#272b38] hover:border-[#373d4e] text-xs font-medium text-slate-300 transition"
              title="View Study Stats"
            >
              <span className="flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{streak}d</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{todayMinutes}m today</span>
              </span>
            </button>

            {/* Back button if inside playlist detail */}
            {currentView === 'detail' && (
              <button
                onClick={() => setCurrentView('list')}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1a1d26] border border-[#272b38] hover:bg-[#222634] text-slate-300 transition"
              >
                All Courses
              </button>
            )}

            {/* PWA Install Button (Shown if not yet installed) */}
            {!isInstalled && (
              <button
                onClick={onOpenInstall}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 hover:text-emerald-200 text-xs font-medium transition"
                title="Install app to your phone or desktop"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            {/* Add Playlist Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-[#1a1d26] border border-[#272b38] text-slate-400 hover:text-white transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
