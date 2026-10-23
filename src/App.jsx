import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PlaylistCard from './components/PlaylistCard';
import PlaylistDetailView from './components/PlaylistDetailView';
import AddPlaylistModal from './components/AddPlaylistModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import DailyTrackerModal from './components/DailyTrackerModal';
import SettingsModal from './components/SettingsModal';
import EditTargetModal from './components/EditTargetModal';

import { 
  getSavedPlaylists, 
  savePlaylists, 
  getActivePlaylistId, 
  setActivePlaylistId, 
  getApiKey, 
  saveApiKey, 
  getStudyLogs, 
  recordStudyActivity 
} from './utils/storage';
import { calculateStreak } from './utils/calculator';
import { Plus, Search, BookOpen } from 'lucide-react';

export default function App() {
  const [playlists, setPlaylists] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [apiKey, setApiKeyState] = useState('');
  const [studyLogs, setStudyLogs] = useState({});
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [playerState, setPlayerState] = useState({ isOpen: false, playlist: null, video: null });
  const [editingTargetPlaylist, setEditingTargetPlaylist] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedPlaylists = getSavedPlaylists();
    const loadedActiveId = getActivePlaylistId(loadedPlaylists);
    const loadedApiKey = getApiKey();
    const loadedLogs = getStudyLogs();

    setPlaylists(loadedPlaylists);
    setActiveId(loadedActiveId);
    setApiKeyState(loadedApiKey);
    setStudyLogs(loadedLogs);
  };

  const updatePlaylists = (newPlaylists) => {
    setPlaylists(newPlaylists);
    savePlaylists(newPlaylists);
  };

  const handleAddPlaylist = (newPlaylist) => {
    const existsIndex = playlists.findIndex((p) => p.id === newPlaylist.id);
    let updated;
    if (existsIndex >= 0) {
      updated = [...playlists];
      updated[existsIndex] = newPlaylist;
    } else {
      updated = [newPlaylist, ...playlists];
    }

    updatePlaylists(updated);
    setActiveId(newPlaylist.id);
    setActivePlaylistId(newPlaylist.id);
    setView('detail');
  };

  const handleDeletePlaylist = (id) => {
    if (window.confirm('Remove this playlist?')) {
      const remaining = playlists.filter((p) => p.id !== id);
      updatePlaylists(remaining);
      if (activeId === id) {
        const nextId = remaining[0]?.id || null;
        setActiveId(nextId);
        if (nextId) setActivePlaylistId(nextId);
        else setView('list');
      }
    }
  };

  const handleToggleVideo = (playlistId, videoId, durationSeconds, isWatched) => {
    const updated = playlists.map((pl) => {
      if (pl.id !== playlistId) return pl;

      const updatedVideos = pl.videos.map((vid) => {
        if (vid.id === videoId) {
          return {
            ...vid,
            watched: isWatched,
            watchedAt: isWatched ? new Date().toISOString() : null,
          };
        }
        return vid;
      });

      return {
        ...pl,
        videos: updatedVideos,
        updatedAt: new Date().toISOString(),
      };
    });

    updatePlaylists(updated);

    const newLogs = recordStudyActivity(durationSeconds, isWatched);
    setStudyLogs(newLogs);

    if (playerState.isOpen && playerState.video?.id === videoId) {
      setPlayerState((prev) => ({
        ...prev,
        video: { ...prev.video, watched: isWatched },
      }));
    }
  };

  const handleMarkAllWatched = (playlistId) => {
    const updated = playlists.map((pl) => {
      if (pl.id !== playlistId) return pl;
      return {
        ...pl,
        videos: pl.videos.map((v) => ({ ...v, watched: true, watchedAt: new Date().toISOString() })),
      };
    });
    updatePlaylists(updated);
  };

  const handleResetProgress = (playlistId) => {
    if (window.confirm('Reset progress for this playlist?')) {
      const updated = playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          videos: pl.videos.map((v) => ({ ...v, watched: false, watchedAt: null })),
        };
      });
      updatePlaylists(updated);
    }
  };

  const handleSaveNotes = (playlistId, videoId, notes) => {
    const updated = playlists.map((pl) => {
      if (pl.id !== playlistId) return pl;
      const updatedVideos = pl.videos.map((vid) => {
        if (vid.id === videoId) {
          return { ...vid, notes };
        }
        return vid;
      });
      return { ...pl, videos: updatedVideos };
    });
    updatePlaylists(updated);

    if (playerState.isOpen && playerState.video?.id === videoId) {
      setPlayerState((prev) => ({
        ...prev,
        video: { ...prev.video, notes },
      }));
    }
  };

  const handleSaveTargetDays = (playlistId, newTargetDays) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return { ...pl, targetDays: newTargetDays };
      }
      return pl;
    });
    updatePlaylists(updated);
  };

  const handleSaveApiKey = (newKey) => {
    saveApiKey(newKey);
    setApiKeyState(newKey);
  };

  const handleOpenPlayer = (playlist, video) => {
    setPlayerState({
      isOpen: true,
      playlist,
      video,
    });
  };

  const handleSelectVideoInPlayer = (video) => {
    setPlayerState((prev) => ({
      ...prev,
      video,
    }));
  };

  const streakData = calculateStreak(studyLogs);
  const activePlaylist = playlists.find((p) => p.id === activeId) || playlists[0];
  const categories = ['All', ...new Set(playlists.map((p) => p.category).filter(Boolean))];

  const filteredPlaylists = playlists.filter((pl) => {
    const matchCat = selectedCategory === 'All' || pl.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      pl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pl.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#101216] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        streak={streakData.currentStreak}
        todayMinutes={streakData.todayMinutes}
        currentView={view}
        setCurrentView={setView}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">
        {view === 'detail' && activePlaylist ? (
          <PlaylistDetailView
            playlist={activePlaylist}
            onBack={() => setView('list')}
            onToggleVideo={handleToggleVideo}
            onOpenPlayer={handleOpenPlayer}
            onEditTarget={(pl) => setEditingTargetPlaylist(pl)}
            onMarkAllWatched={handleMarkAllWatched}
            onResetProgress={handleResetProgress}
          />
        ) : (
          /* Multi-Playlist Dashboard */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
            
            {/* Top Bar: Title & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Courses</h1>
                <p className="text-xs text-slate-400">
                  {playlists.length} {playlists.length === 1 ? 'course' : 'courses'} in library
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#161821] border border-[#232733] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 2 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-[#161821] border border-[#232733] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Playlists Grid */}
            {filteredPlaylists.length === 0 ? (
              <div className="text-center py-12 bg-[#161821] border border-[#232733] rounded-xl p-6 space-y-3">
                <p className="text-xs text-slate-400">
                  {searchQuery ? 'No courses match your search.' : 'No courses added yet.'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Add Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaylists.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    onSelect={(id) => {
                      setActiveId(id);
                      setActivePlaylistId(id);
                      setView('detail');
                    }}
                    onEditTarget={(playlistToEdit) => setEditingTargetPlaylist(playlistToEdit)}
                    onDelete={handleDeletePlaylist}
                  />
                ))}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#1c1f28] py-4 mt-8 text-center text-xs text-slate-500">
        StudyPlay • LocalStorage mode
      </footer>

      {/* Modals */}
      <AddPlaylistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPlaylist={handleAddPlaylist}
        apiKey={apiKey}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <VideoPlayerModal
        isOpen={playerState.isOpen}
        onClose={() => setPlayerState((prev) => ({ ...prev, isOpen: false }))}
        playlist={playerState.playlist}
        currentVideo={playerState.video}
        onSelectVideo={handleSelectVideoInPlayer}
        onToggleWatched={handleToggleVideo}
        onSaveNotes={handleSaveNotes}
      />

      <DailyTrackerModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        studyLogs={studyLogs}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onDataReload={loadData}
      />

      <EditTargetModal
        isOpen={Boolean(editingTargetPlaylist)}
        onClose={() => setEditingTargetPlaylist(null)}
        playlist={editingTargetPlaylist}
        onSaveTarget={handleSaveTargetDays}
      />

    </div>
  );
}
