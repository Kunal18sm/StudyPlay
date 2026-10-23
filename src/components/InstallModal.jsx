import React from 'react';
import { X, Download, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

export default function InstallModal({ isOpen, onClose, onInstall, isIOS }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#161821] border border-[#232733] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232733]">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Install StudyPlay App</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">StudyPlay Mobile App</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Install as a full standalone app on your phone's home screen.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#232733] text-slate-300">
            <div className="flex items-center space-x-2 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full-screen distraction-free interface</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Works directly offline with LocalStorage</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant 1-tap launch from your phone home screen</span>
            </div>
          </div>

          {/* iOS Safari Instructions */}
          {isIOS ? (
            <div className="p-3 rounded-lg bg-[#101217] border border-[#232733] space-y-2 text-[11px] text-slate-300">
              <p className="font-semibold text-white">iPhone / iPad Safari Instructions:</p>
              <div className="flex items-center space-x-2 text-slate-400">
                <Share className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>1. Tap the <strong>Share</strong> button at bottom of Safari.</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <PlusSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>2. Scroll down & select <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onInstall}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Install to Home Screen</span>
            </button>
          )}

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
