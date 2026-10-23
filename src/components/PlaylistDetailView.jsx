import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Search, 
  Edit3, 
  RotateCcw, 
  FileText,
  CheckCheck
} from 'lucide-react';
import { calculatePacing } from '../utils/calculator';
import { getSpeedCalculations, formatDuration } from '../utils/youtubeApi';
import { triggerConfetti } from '../utils/confetti';

export default function PlaylistDetailView({ 
  playlist, 
  onBack, 
  onToggleVideo, 
  onOpenPlayer, 
  onEditTarget, 
  onMarkAllWatched, 
  onResetProgress 
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'remaining' | 'watched'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpeed, setActiveSpeed] = useState('1.0x');

  if (!playlist) return null;

  const watchedVideosCount = playlist.videos?.filter((v) => v.watched).length || 0;
  const watchedSeconds = playlist.videos
    ?.filter((v) => v.watched)
    .reduce((acc, v) => acc + (v.durationSeconds || 0), 0) || 0;

  const pacing = calculatePacing({
    totalVideos: playlist.totalVideos || playlist.videos?.length || 0,
    watchedVideos: watchedVideosCount,
    totalSeconds: playlist.totalSeconds || 0,
    watchedSeconds,
    targetDays: playlist.targetDays || 30,
    createdAt: playlist.createdAt,
  });

  const speedOptions = getSpeedCalculations(playlist.totalSeconds || 0);
  const selectedSpeedObj = speedOptions.find((s) => s.speed === activeSpeed) || speedOptions[0];

  // Next video to continue
  const nextVideo = playlist.videos?.find((v) => !v.watched);

  // Filter and search videos
  const filteredVideos = (playlist.videos || []).filter((video) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'watched' ? video.watched : !video.watched;
    const matchesSearch =
      searchQuery.trim() === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(video.position).includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleToggle = (videoId, currentWatched, durationSeconds) => {
    const willBeWatched = !currentWatched;
    onToggleVideo(playlist.id, videoId, durationSeconds, willBeWatched);
    if (willBeWatched) {
      triggerConfetti();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#161821] border border-[#232733] hover:bg-[#202330] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEditTarget(playlist)}
            className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#161821] border border-[#232733] hover:bg-[#202330] transition"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Target: {pacing.totalTargetDays}d</span>
            <Edit3 className="w-3 h-3 text-slate-500 ml-1" />
          </button>

          <button
            onClick={() => onResetProgress(playlist.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg bg-[#161821] border border-[#232733] transition"
            title="Reset Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Course Info Card */}
      <div className="p-5 rounded-xl bg-[#161821] border border-[#232733] space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">{playlist.channel}</span>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {playlist.title}
            </h1>
          </div>

          {nextVideo && (
            <button
              onClick={() => onOpenPlayer(playlist, nextVideo)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{watchedVideosCount === 0 ? 'Start Course' : `Resume #${nextVideo.position}`}</span>
            </button>
          )}
        </div>

        {/* Compact Key Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#232733] text-xs">
          
          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px]">Progress</span>
            <div className="font-semibold text-slate-200">
              {watchedVideosCount} / {playlist.totalVideos} ({pacing.completionPercentage}%)
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px]">Remaining Time</span>
            <div className="font-semibold text-slate-200">
              {pacing.remainingDurationFormatted}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px]">Daily Target</span>
            <div className="font-semibold text-slate-200">
              ~{pacing.dailyVideosNeeded} vid ({pacing.dailyDurationFormatted}/d)
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px]">Pace Status</span>
            <div>
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
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#232733] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pacing.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${pacing.completionPercentage}%` }}
          />
        </div>

        {/* Simple Speed Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400">
          <span className="text-[11px]">Total duration: <strong className="text-slate-300">{selectedSpeedObj.formatted}</strong></span>
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-500 mr-1">Speed:</span>
            {speedOptions.map((opt) => (
              <button
                key={opt.speed}
                onClick={() => setActiveSpeed(opt.speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  activeSpeed === opt.speed
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1e212b] text-slate-400 hover:text-white'
                }`}
              >
                {opt.speed}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Videos List Section */}
      <div className="space-y-3">
        
        {/* Search & Filter Header */}
        <div className="flex items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center space-x-1 bg-[#161821] p-1 rounded-lg border border-[#232733]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                filter === 'all'
                  ? 'bg-[#232733] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({playlist.videos?.length || 0})
            </button>
            <button
              onClick={() => setFilter('remaining')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                filter === 'remaining'
                  ? 'bg-[#232733] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Remaining ({pacing.remainingVideos})
            </button>
            <button
              onClick={() => setFilter('watched')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                filter === 'watched'
                  ? 'bg-[#232733] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Watched ({watchedVideosCount})
            </button>
          </div>

          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#161821] border border-[#232733] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Video rows */}
        <div className="space-y-1.5">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-8 bg-[#161821] rounded-xl border border-[#232733] text-slate-500 text-xs">
              No videos found
            </div>
          ) : (
            filteredVideos.map((video) => {
              const isWatched = Boolean(video.watched);
              return (
                <div
                  key={video.id || video.position}
                  className={`p-2.5 sm:p-3 rounded-lg border transition flex items-center justify-between gap-3 ${
                    isWatched
                      ? 'bg-[#12141a]/60 border-[#1c1e28] opacity-75'
                      : 'bg-[#161821] hover:bg-[#1a1d27] border-[#232733]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(video.id, isWatched, video.durationSeconds || 600)}
                      className={`p-1 rounded transition shrink-0 ${
                        isWatched
                          ? 'text-emerald-500 hover:text-emerald-400'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {isWatched ? (
                        <CheckCircle2 className="w-4 h-4 fill-emerald-950" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <span className="font-mono text-xs text-slate-500 w-5 shrink-0">
                      {video.position}
                    </span>

                    {/* Thumbnail preview */}
                    <div 
                      onClick={() => onOpenPlayer(playlist, video)}
                      className="relative w-16 h-10 rounded overflow-hidden bg-black shrink-0 cursor-pointer"
                    >
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title & Duration */}
                    <div className="min-w-0 flex-1">
                      <h4 
                        onClick={() => onOpenPlayer(playlist, video)}
                        className={`text-xs sm:text-sm font-medium cursor-pointer truncate ${
                          isWatched ? 'text-slate-500 line-through' : 'text-slate-200 hover:text-blue-400'
                        }`}
                      >
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>{video.durationFormatted || formatDuration(video.durationSeconds)}</span>
                        {video.notes && (
                          <span className="text-blue-400 flex items-center space-x-0.5">
                            <FileText className="w-3 h-3" />
                            <span>Notes</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => onOpenPlayer(playlist, video)}
                    className="p-1.5 rounded-lg bg-[#202330] hover:bg-[#282d3d] text-slate-300 hover:text-white transition shrink-0"
                    title="Watch Video"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
