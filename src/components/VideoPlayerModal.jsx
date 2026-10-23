import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  FileText, 
  ExternalLink, 
  ListVideo
} from 'lucide-react';
import { formatDuration } from '../utils/youtubeApi';
import { triggerConfetti } from '../utils/confetti';

export default function VideoPlayerModal({ 
  isOpen, 
  onClose, 
  playlist, 
  currentVideo, 
  onSelectVideo, 
  onToggleWatched,
  onSaveNotes 
}) {
  const [notes, setNotes] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (currentVideo) {
      setNotes(currentVideo.notes || '');
    }
  }, [currentVideo]);

  if (!isOpen || !playlist || !currentVideo) return null;

  const videoIndex = playlist.videos.findIndex((v) => v.id === currentVideo.id);
  const prevVideo = videoIndex > 0 ? playlist.videos[videoIndex - 1] : null;
  const nextVideo = videoIndex < playlist.videos.length - 1 ? playlist.videos[videoIndex + 1] : null;

  const handleSaveNotes = () => {
    onSaveNotes(playlist.id, currentVideo.id, notes);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleToggleCurrent = () => {
    const willBeWatched = !currentVideo.watched;
    onToggleWatched(playlist.id, currentVideo.id, currentVideo.durationSeconds || 600, willBeWatched);
    if (willBeWatched) {
      triggerConfetti();
    }
  };

  const embedId = currentVideo.youtubeId || currentVideo.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#12141a] border border-[#232733] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="px-4 py-2.5 border-b border-[#232733] bg-[#161821] flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="font-mono text-xs text-slate-400 bg-[#101217] px-2 py-0.5 rounded border border-[#232733] shrink-0">
              #{currentVideo.position} / {playlist.videos.length}
            </span>
            <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
              {currentVideo.title}
            </h3>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Mark as watched */}
            <button
              onClick={handleToggleCurrent}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                currentVideo.watched
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  : 'bg-[#202330] hover:bg-[#282d3d] text-slate-300'
              }`}
            >
              {currentVideo.watched ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Watched</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mark Watched</span>
                </>
              )}
            </button>

            {/* Toggle Playlist sidebar */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-1.5 rounded-lg border transition ${
                showSidebar
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                  : 'bg-[#161821] border-[#232733] text-slate-400 hover:text-white'
              }`}
              title="Lecture Queue"
            >
              <ListVideo className="w-4 h-4" />
            </button>

            {/* Open on YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${embedId}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202330] transition"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202330] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Video & Notes */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            
            <div className="relative w-full aspect-video bg-black shrink-0">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1&enablejsapi=1&rel=0`}
                title={currentVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Prev/Next Bar */}
            <div className="p-3 bg-[#161821] border-b border-[#232733] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => prevVideo && onSelectVideo(prevVideo)}
                  disabled={!prevVideo}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#202330] disabled:opacity-30 text-slate-300 hover:text-white transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => nextVideo && onSelectVideo(nextVideo)}
                  disabled={!nextVideo}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-blue-600 disabled:opacity-30 text-white font-medium hover:bg-blue-500 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                {currentVideo.durationFormatted || formatDuration(currentVideo.durationSeconds)}
              </span>
            </div>

            {/* Notes Section */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notes</span>
                </span>
                <button
                  onClick={handleSaveNotes}
                  className="px-2.5 py-1 rounded bg-[#202330] hover:bg-[#282d3d] text-slate-300 text-xs transition"
                >
                  {isSavedNotice ? 'Saved!' : 'Save'}
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take lecture notes, timestamps, or formula points here..."
                rows={3}
                className="w-full p-2.5 bg-[#161821] border border-[#232733] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

          </div>

          {/* Right Playlist Sidebar */}
          {showSidebar && (
            <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#232733] bg-[#161821] flex flex-col h-56 lg:h-auto overflow-hidden">
              <div className="p-2.5 border-b border-[#232733] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Lectures</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {playlist.videos.filter((v) => v.watched).length}/{playlist.videos.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#202330] p-1.5 space-y-0.5">
                {playlist.videos.map((vid) => {
                  const isCurrent = vid.id === currentVideo.id;
                  return (
                    <div
                      key={vid.id || vid.position}
                      onClick={() => onSelectVideo(vid)}
                      className={`p-2 rounded cursor-pointer flex items-center space-x-2 text-xs transition ${
                        isCurrent
                          ? 'bg-[#202433] text-blue-400 font-medium'
                          : 'hover:bg-[#1a1d27] text-slate-300'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatched(playlist.id, vid.id, vid.durationSeconds || 600, !vid.watched);
                        }}
                        className="shrink-0 text-slate-500 hover:text-emerald-400"
                      >
                        {vid.watched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-xs ${vid.watched ? 'line-through text-slate-500' : ''}`}>
                          #{vid.position} {vid.title}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {vid.durationFormatted || formatDuration(vid.durationSeconds)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
