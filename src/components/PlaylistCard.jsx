import React from 'react';
import { Clock, Video, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { calculatePacing } from '../utils/calculator';

export default function PlaylistCard({ 
  playlist, 
  onSelect, 
  onEditTarget, 
  onDelete 
}) {
  const watchedVideos = playlist.videos?.filter((v) => v.watched).length || 0;
  const watchedSeconds = playlist.videos
    ?.filter((v) => v.watched)
    .reduce((acc, v) => acc + (v.durationSeconds || 0), 0) || 0;

  const pacing = calculatePacing({
    totalVideos: playlist.totalVideos || playlist.videos?.length || 0,
    watchedVideos,
    totalSeconds: playlist.totalSeconds || 0,
    watchedSeconds,
    targetDays: playlist.targetDays || 30,
    createdAt: playlist.createdAt,
  });

  return (
    <div 
      onClick={() => onSelect(playlist.id)}
      className="group relative bg-[#161821] hover:bg-[#1a1d28] border border-[#232733] hover:border-[#323748] rounded-xl overflow-hidden transition cursor-pointer flex flex-col justify-between"
    >
      
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-[#101217] overflow-hidden">
        <img
          src={playlist.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
          alt={playlist.title}
          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
        />

        {/* Video count & duration badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
          <span className="px-2 py-0.5 rounded bg-black/80 font-mono">
            {playlist.totalVideos} videos • {playlist.totalDurationFormatted}
          </span>
          <span className="px-2 py-0.5 rounded bg-black/80 font-mono font-medium">
            {pacing.completionPercentage}%
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] text-slate-400 truncate">
              {playlist.channel}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
              pacing.paceStatus === 'completed'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                : pacing.paceStatus === 'ahead'
                ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                : pacing.paceStatus === 'behind'
                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {pacing.paceStatusText}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-blue-400 transition">
            {playlist.title}
          </h3>
        </div>

        {/* Simple Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{watchedVideos} / {playlist.totalVideos} watched</span>
            <span>{pacing.remainingDurationFormatted} left</span>
          </div>
          <div className="w-full h-1.5 bg-[#232733] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pacing.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${pacing.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Target Daily Pacing summary & Actions */}
        <div className="pt-2 border-t border-[#232733] flex items-center justify-between text-xs text-slate-400">
          <div className="font-mono text-[11px]">
            Goal: <strong className="text-slate-200">~{pacing.dailyVideosNeeded} vid/day</strong> ({pacing.remainingDays}d left)
          </div>

          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEditTarget(playlist)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#232733] transition"
              title="Edit Target Days"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(playlist.id)}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Delete Playlist"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
