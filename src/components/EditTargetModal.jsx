import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { calculatePacing } from '../utils/calculator';

export default function EditTargetModal({ isOpen, onClose, playlist, onSaveTarget }) {
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (playlist) {
      setDays(playlist.targetDays || 30);
    }
  }, [playlist]);

  if (!isOpen || !playlist) return null;

  const watchedVideos = playlist.videos?.filter((v) => v.watched).length || 0;
  const watchedSeconds = playlist.videos
    ?.filter((v) => v.watched)
    .reduce((acc, v) => acc + (v.durationSeconds || 0), 0) || 0;

  const previewPacing = calculatePacing({
    totalVideos: playlist.totalVideos || playlist.videos?.length || 0,
    watchedVideos,
    totalSeconds: playlist.totalSeconds || 0,
    watchedSeconds,
    targetDays: Number(days) || 1,
    createdAt: playlist.createdAt,
  });

  const handleSave = () => {
    onSaveTarget(playlist.id, Math.max(1, Number(days) || 1));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#161821] border border-[#232733] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232733]">
          <h2 className="text-sm font-semibold text-white">Target Days</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300 font-medium truncate">{playlist.title}</p>

          <div className="space-y-1.5">
            <label className="text-slate-400">Total days to complete course:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 bg-[#101217] border border-[#232733] rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center space-x-1">
                {[15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                      days === d
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#101217] border border-[#232733] text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick recalculated rate */}
          <div className="p-3 rounded-lg bg-[#101217] border border-[#232733] space-y-1 text-slate-400">
            <div>Daily pace: <strong className="text-slate-200">~{previewPacing.dailyVideosNeeded} videos/day</strong></div>
            <div>Daily time: <strong className="text-slate-200">~{previewPacing.dailyDurationFormatted}/day</strong></div>
            <div className="text-[11px] text-slate-500 pt-1">Finish by: {previewPacing.formattedDeadline}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#232733] flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
          >
            Save Target
          </button>
        </div>

      </div>
    </div>
  );
}
