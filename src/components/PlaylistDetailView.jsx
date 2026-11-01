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
  ExternalLink,
  RefreshCw,
  Check,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { calculatePacing } from '../utils/calculator';
import { getSpeedCalculations, formatDuration } from '../utils/youtubeApi';
import { triggerConfetti } from '../utils/confetti';

export default function PlaylistDetailView({ 
  playlist, 
  onBack, 
  onToggleVideo, 
  onEditTarget, 
  onResetProgress,
  onSyncPlaylist
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'remaining' | 'watched'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpeed, setActiveSpeed] = useState('1.0x');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest' (First uploaded at top) | 'newest'

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

  // Sort videos according to selected order (Default: Oldest / First uploaded at top)
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortOrder === 'newest') {
      if (a.publishedAt && b.publishedAt) {
        const timeA = new Date(a.publishedAt).getTime();
        const timeB = new Date(b.publishedAt).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) return timeB - timeA;
      }
      return (Number(b.position) || 0) - (Number(a.position) || 0);
    }

    // Default 'oldest': Earliest uploaded video at the top
    if (a.publishedAt && b.publishedAt) {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      if (!isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
    }
    return (Number(a.position) || 0) - (Number(b.position) || 0);
  });

  // Next video to continue (chronologically next uncompleted lecture)
  const nextVideo = sortedVideos.find((v) => !v.watched);

  const handleToggle = (videoId, currentWatched, durationSeconds) => {
    const willBeWatched = !currentWatched;
    onToggleVideo(playlist.id, videoId, durationSeconds, willBeWatched);
    if (willBeWatched) {
      triggerConfetti();
    }
  };

  // Open video directly on YouTube
  const handleOpenYouTube = (video) => {
    const vidId = video.youtubeId || video.id;
    if (vidId) {
      window.open(`https://www.youtube.com/watch?v=${vidId}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle Sync with YouTube
  const handleSync = async () => {
    if (isSyncing || !onSyncPlaylist) return;
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const res = await onSyncPlaylist(playlist.id);
      if (res && res.success) {
        if (res.diffCount > 0) {
          setSyncStatus({
            type: 'success',
            message: `Synced with YouTube! Added ${res.diffCount} new video(s).`,
          });
          triggerConfetti();
        } else if (res.diffCount < 0) {
          setSyncStatus({
            type: 'info',
            message: `Synced! Playlist now has ${res.totalVideos} videos (${Math.abs(res.diffCount)} removed on YouTube).`,
          });
        } else {
          setSyncStatus({
            type: 'success',
            message: `Playlist is already up to date with YouTube (${res.totalVideos} videos).`,
          });
        }
      } else {
        setSyncStatus({
          type: 'error',
          message: res?.error || 'Sync failed. Could not fetch YouTube updates.',
        });
      }
    } catch (e) {
      setSyncStatus({
        type: 'error',
        message: e.message || 'Sync failed.',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncStatus(null);
      }, 5000);
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
          {/* Refresh / Sync with YouTube button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#161821] border border-[#232733] hover:bg-[#202330] hover:border-emerald-500/40 transition disabled:opacity-50"
            title="Fetch latest videos from YouTube playlist"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Checking...' : 'Sync Playlist'}</span>
          </button>

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

      {/* Sync Status Feedback Toast / Banner */}
      {syncStatus && (
        <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between border transition-all animate-fade-in ${
          syncStatus.type === 'error'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {syncStatus.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{syncStatus.message}</span>
          </div>
          <button 
            onClick={() => setSyncStatus(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

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
              onClick={() => handleOpenYouTube(nextVideo)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shrink-0"
              title="Open next video on YouTube"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{watchedVideosCount === 0 ? 'Start on YouTube' : `Play #${nextVideo.position} on YouTube`}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
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

            {/* Sort Toggle Button */}
            <button
              onClick={() => setSortOrder(sortOrder === 'oldest' ? 'newest' : 'oldest')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161821] border border-[#232733] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition font-medium"
              title="Toggle upload order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>{sortOrder === 'oldest' ? 'Oldest First (1 → N)' : 'Newest First (N → 1)'}</span>
            </button>
          </div>

          <div className="relative w-full sm:w-56">
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
          {sortedVideos.length === 0 ? (
            <div className="text-center py-8 bg-[#161821] rounded-xl border border-[#232733] text-slate-500 text-xs">
              No videos found
            </div>
          ) : (
            sortedVideos.map((video, idx) => {
              const isWatched = Boolean(video.watched);
              const displayPosition = sortOrder === 'oldest' ? (idx + 1) : (sortedVideos.length - idx);
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
                      title={isWatched ? 'Mark unwatched' : 'Mark watched'}
                    >
                      {isWatched ? (
                        <CheckCircle2 className="w-4 h-4 fill-emerald-950" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <span className="font-mono text-xs text-slate-500 w-6 shrink-0">
                      #{displayPosition}
                    </span>

                    {/* Thumbnail: Opens directly in YouTube */}
                    <div 
                      onClick={() => handleOpenYouTube(video)}
                      className="relative w-16 h-10 rounded overflow-hidden bg-black shrink-0 cursor-pointer group"
                      title="Play on YouTube"
                    >
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:opacity-75 transition"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>

                    {/* Title & Duration: Opens directly in YouTube */}
                    <div className="min-w-0 flex-1">
                      <h4 
                        onClick={() => handleOpenYouTube(video)}
                        className={`text-xs sm:text-sm font-medium cursor-pointer truncate ${
                          isWatched ? 'text-slate-500 line-through' : 'text-slate-200 hover:text-blue-400'
                        }`}
                        title="Click to watch on YouTube"
                      >
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>{video.durationFormatted || formatDuration(video.durationSeconds)}</span>
                        {video.publishedAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">
                              {new Date(video.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </>
                        )}
                        {video.notes && (
                          <span className="text-blue-400 flex items-center space-x-0.5">
                            <FileText className="w-3 h-3" />
                            <span>Notes</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Play on YouTube Button */}
                  <button
                    onClick={() => handleOpenYouTube(video)}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#202330] hover:bg-red-950/40 hover:text-red-400 border border-transparent hover:border-red-900/50 text-slate-300 text-xs font-medium transition shrink-0"
                    title="Watch on YouTube"
                  >
                    <Play className="w-3 h-3 fill-current text-red-500" />
                    <span className="hidden sm:inline">YouTube</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
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
