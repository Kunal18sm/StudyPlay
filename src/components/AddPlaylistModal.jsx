import React, { useState } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  Clock, 
  Video, 
  Calendar, 
  Tag, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  extractPlaylistId, 
  fetchPlaylistFromApi, 
  DEMO_PLAYLISTS 
} from '../utils/youtubeApi';

const CATEGORIES = [
  'Web Development',
  'DSA & Coding',
  'Python & AI',
  'Academics',
  'Exams',
  'Other',
];

export default function AddPlaylistModal({ 
  isOpen, 
  onClose, 
  onAddPlaylist, 
  apiKey 
}) {
  const [tab, setTab] = useState('url'); // 'url' | 'curated'
  const [urlInput, setUrlInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Web Development');
  const [targetDays, setTargetDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState(null);

  if (!isOpen) return null;

  const handleFetchPreview = async () => {
    setErrorMessage('');
    const playlistId = extractPlaylistId(urlInput);

    if (!playlistId) {
      setErrorMessage('Please enter a valid YouTube Playlist URL or Playlist ID.');
      return;
    }

    setIsLoading(true);

    try {
      // Direct call using secure API key from .env / state
      const data = await fetchPlaylistFromApi(playlistId, apiKey);
      setPreviewData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Error fetching playlist from YouTube API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!previewData) return;

    const newPlaylist = {
      ...previewData,
      category: selectedCategory,
      targetDays: Number(targetDays) || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddPlaylist(newPlaylist);
    handleClose();
  };

  const handleAddCurated = (demo) => {
    const newPlaylist = {
      ...demo,
      targetDays: Number(targetDays) || demo.targetDays || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddPlaylist(newPlaylist);
    handleClose();
  };

  const handleClose = () => {
    setUrlInput('');
    setPreviewData(null);
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };

  const previewDailyVideos = previewData 
    ? Math.ceil(previewData.totalVideos / Math.max(1, targetDays)) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#161821] border border-[#232733] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232733]">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-white">Add Playlist</h2>
            <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Official YouTube API Active</span>
            </span>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#232733] px-5 pt-2 text-xs">
          <button
            onClick={() => { setTab('url'); setErrorMessage(''); }}
            className={`pb-2 px-3 font-medium border-b-2 transition ${
              tab === 'url'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            YouTube Playlist Link
          </button>
          <button
            onClick={() => { setTab('curated'); setErrorMessage(''); }}
            className={`pb-2 px-3 font-medium border-b-2 transition ${
              tab === 'curated'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Courses
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {tab === 'url' && (
            <>
              {/* URL Input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">YouTube Playlist URL or ID</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setPreviewData(null);
                      setErrorMessage('');
                    }}
                    placeholder="https://www.youtube.com/playlist?list=PL..."
                    className="flex-1 px-3 py-2 bg-[#101217] border border-[#232733] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                  <button
                    onClick={handleFetchPreview}
                    disabled={isLoading || !urlInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium rounded-lg transition shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Target Days & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Target Days to Complete</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-[#101217] border border-[#232733] rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#101217] border border-[#232733] rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fetched Preview */}
              {previewData && (
                <div className="p-3.5 rounded-lg bg-[#101217] border border-blue-900/40 flex items-center space-x-3.5">
                  <img
                    src={previewData.thumbnail}
                    alt="Preview"
                    className="w-24 h-16 object-cover rounded shrink-0 bg-black"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">{previewData.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{previewData.channel}</p>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span className="text-slate-200">{previewData.totalVideos} videos</span>
                      <span>•</span>
                      <span className="text-slate-200">{previewData.totalDurationFormatted}</span>
                      <span>•</span>
                      <span className="text-blue-400">~{previewDailyVideos} vid/day</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'curated' && (
            <div className="space-y-2">
              {DEMO_PLAYLISTS.map((demo) => (
                <div
                  key={demo.id}
                  className="p-3 rounded-lg bg-[#101217] border border-[#232733] hover:border-[#323746] transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={demo.thumbnail}
                      alt={demo.title}
                      className="w-14 h-10 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium text-white truncate">{demo.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {demo.totalVideos} videos • {demo.totalDurationFormatted}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCurated(demo)}
                    className="px-2.5 py-1 rounded bg-[#202330] hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-medium transition shrink-0"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        {tab === 'url' && (
          <div className="px-5 py-3 border-t border-[#232733] flex items-center justify-end space-x-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAdd}
              disabled={!previewData}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-medium transition"
            >
              Add Course
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
