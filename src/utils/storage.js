import { DEMO_PLAYLISTS } from './youtubeApi';

const STORAGE_KEYS = {
  PLAYLISTS: 'myplaylist_playlists_v1',
  ACTIVE_PLAYLIST_ID: 'myplaylist_active_id_v1',
  API_KEY: 'myplaylist_yt_api_key_v1',
  STUDY_LOGS: 'myplaylist_study_logs_v1',
  SETTINGS: 'myplaylist_settings_v1',
};

/**
 * Gets all saved playlists or returns default demo playlists on first launch
 */
export function getSavedPlaylists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    if (!raw) {
      // First time user: initialize with demo playlists
      savePlaylists(DEMO_PLAYLISTS);
      return DEMO_PLAYLISTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading playlists from localStorage:', e);
    return DEMO_PLAYLISTS;
  }
}

/**
 * Saves playlists array to localStorage
 */
export function savePlaylists(playlists) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch (e) {
    console.error('Failed to save playlists to localStorage:', e);
  }
}

/**
 * Gets the active playlist ID
 */
export function getActivePlaylistId(playlists) {
  const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID);
  if (savedId && playlists.some((p) => p.id === savedId)) {
    return savedId;
  }
  return playlists[0]?.id || null;
}

/**
 * Sets active playlist ID
 */
export function setActivePlaylistId(id) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID, id);
}

/**
 * Gets API Key (prioritizes secure .env, falls back to localStorage)
 */
export function getApiKey() {
  const envKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
  const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  return envKey.trim() || storedKey.trim();
}

/**
 * Sets API Key
 */
export function saveApiKey(key) {
  localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
}

/**
 * Gets daily study logs: { '2026-10-23': { videos: 3, minutes: 45 } }
 */
export function getStudyLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
    if (!raw) {
      // Seed initial 3 days of light activity for visual appeal
      const today = new Date();
      const logs = {};
      for (let i = 2; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        logs[dStr] = {
          videos: i === 0 ? 2 : 3,
          minutes: i === 0 ? 38 : 55,
        };
      }
      localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(logs));
      return logs;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

/**
 * Logs a video watched activity to the daily study log
 */
export function recordStudyActivity(durationSeconds, isWatched) {
  const todayStr = new Date().toISOString().split('T')[0];
  const logs = getStudyLogs();
  const current = logs[todayStr] || { videos: 0, minutes: 0 };

  const minutesDelta = Math.round(durationSeconds / 60);

  if (isWatched) {
    current.videos = Math.max(0, current.videos + 1);
    current.minutes = Math.max(0, current.minutes + minutesDelta);
  } else {
    current.videos = Math.max(0, current.videos - 1);
    current.minutes = Math.max(0, current.minutes - minutesDelta);
  }

  logs[todayStr] = current;
  localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(logs));
  return logs;
}

/**
 * Calculate approximate localStorage usage in KB and percentage of 5MB
 */
export function getStorageUsage() {
  let totalBytes = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalBytes += (localStorage[key].length + key.length) * 2; // UTF-16
    }
  }
  const kb = (totalBytes / 1024).toFixed(1);
  const percentage = Math.min(100, ((totalBytes / (5 * 1024 * 1024)) * 100).toFixed(2));
  return { kb, percentage, totalBytes };
}

/**
 * Exports all app data into a downloadable JSON backup
 */
export function exportAppData() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    playlists: getSavedPlaylists(),
    activeId: localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID),
    studyLogs: getStudyLogs(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `myplaylist_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports app data from a JSON file
 */
export function importAppData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.playlists || !Array.isArray(data.playlists)) {
      throw new Error('Invalid backup file: playlists array missing');
    }
    savePlaylists(data.playlists);
    if (data.studyLogs) {
      localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(data.studyLogs));
    }
    if (data.activeId) {
      setActivePlaylistId(data.activeId);
    }
    return { success: true, count: data.playlists.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Clears either all local storage data or resets to initial state
 */
export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID);
  localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
  // Keep API key so user doesn't lose it unless they explicitly delete it
}
