// YouTube API helper and URL parsers

/**
 * Extracts playlist ID from various YouTube URL formats or returns the ID if already clean.
 */
export function extractPlaylistId(urlOrId) {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If user pasted just the ID (e.g., PL4cUxeGkcC9gUdyb8eA3Q2hUvN4iUv...)
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const searchParams = new URLSearchParams(url.search);
    if (searchParams.has('list')) {
      return searchParams.get('list');
    }
  } catch (e) {
    const match = trimmed.match(/[?&]list=([^#&?]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parses ISO 8601 duration (e.g. PT1H23M45S, PT15M33S, PT45S) into total seconds
 */
export function parseISO8601Duration(durationStr) {
  if (!durationStr) return 0;
  const match = durationStr.match(/PT(?:(\d+)D)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const days = parseInt(match[1] || 0, 10);
  const hours = parseInt(match[2] || 0, 10);
  const minutes = parseInt(match[3] || 0, 10);
  const seconds = parseInt(match[4] || 0, 10);

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

/**
 * Formats seconds into human-readable string (e.g., "12h 45m" or "23m 15s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim();
  }
  return `${secs}s`;
}

/**
 * Calculates duration at different playback speeds
 */
export function getSpeedCalculations(totalSeconds) {
  return [
    { speed: '1.0x', seconds: totalSeconds, formatted: formatDuration(totalSeconds), saved: '0m' },
    {
      speed: '1.25x',
      seconds: Math.round(totalSeconds / 1.25),
      formatted: formatDuration(Math.round(totalSeconds / 1.25)),
      saved: formatDuration(totalSeconds - Math.round(totalSeconds / 1.25))
    },
    {
      speed: '1.5x',
      seconds: Math.round(totalSeconds / 1.5),
      formatted: formatDuration(Math.round(totalSeconds / 1.5)),
      saved: formatDuration(totalSeconds - Math.round(totalSeconds / 1.5))
    },
    {
      speed: '1.75x',
      seconds: Math.round(totalSeconds / 1.75),
      formatted: formatDuration(Math.round(totalSeconds / 1.75)),
      saved: formatDuration(totalSeconds - Math.round(totalSeconds / 1.75))
    },
    {
      speed: '2.0x',
      seconds: Math.round(totalSeconds / 2.0),
      formatted: formatDuration(Math.round(totalSeconds / 2.0)),
      saved: formatDuration(totalSeconds - Math.round(totalSeconds / 2.0))
    },
  ];
}

/**
 * Fetches playlist details using YouTube Data API v3 (if key provided)
 */
export async function fetchPlaylistFromApi(playlistId, apiKey) {
  const effectiveKey = (apiKey || import.meta.env.VITE_YOUTUBE_API_KEY || '').trim();
  if (!effectiveKey) {
    throw new Error('API Key missing. Please configure VITE_YOUTUBE_API_KEY in .env');
  }

  // 1. Fetch playlist metadata
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${effectiveKey}`;
  const plRes = await fetch(playlistUrl);
  const plData = await plRes.json();

  if (plData.error) {
    throw new Error(plData.error.message || 'Error fetching playlist from YouTube API');
  }

  if (!plData.items || plData.items.length === 0) {
    throw new Error('Playlist not found. Make sure it is Public or Unlisted (not Private).');
  }

  const plSnippet = plData.items[0].snippet;
  const channelTitle = plSnippet.channelTitle || 'YouTube Creator';
  const playlistTitle = plSnippet.title || 'Untitled Playlist';
  const playlistThumbnail =
    plSnippet.thumbnails?.maxres?.url ||
    plSnippet.thumbnails?.high?.url ||
    plSnippet.thumbnails?.medium?.url ||
    '';

  // 2. Fetch all playlist items (up to 500 items)
  let allVideos = [];
  let nextPageToken = '';
  let pageCount = 0;

  do {
    pageCount++;
    const pageParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
    const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}${pageParam}&key=${effectiveKey}`;

    const itemsRes = await fetch(itemsUrl);
    const itemsData = await itemsRes.json();

    if (itemsData.error) {
      throw new Error(itemsData.error.message || 'Error fetching playlist items');
    }

    if (itemsData.items) {
      allVideos.push(...itemsData.items);
    }

    nextPageToken = itemsData.nextPageToken;
  } while (nextPageToken && pageCount < 10);

  // 3. Extract video IDs to fetch duration in batches of 50
  const videoIds = allVideos
    .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
    .filter((id) => Boolean(id) && id !== 'private');

  const durationMap = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50).join(',');
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${chunk}&key=${effectiveKey}`;
    try {
      const vidRes = await fetch(videoDetailsUrl);
      const vidData = await vidRes.json();
      if (vidData.items) {
        vidData.items.forEach((item) => {
          const durSeconds = parseISO8601Duration(item.contentDetails?.duration);
          durationMap[item.id] = {
            seconds: durSeconds,
            formatted: formatDuration(durSeconds),
          };
        });
      }
    } catch (e) {
      console.warn('Failed to fetch duration batch:', e);
    }
  }

  // 4. Map to clean internal structure
  let totalPlaylistSeconds = 0;
  const processedVideos = allVideos
    .map((item, index) => {
      const vid = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      if (!vid || title === 'Private video' || title === 'Deleted video') {
        return null;
      }

      const durObj = durationMap[vid] || { seconds: 600, formatted: '10m' };
      totalPlaylistSeconds += durObj.seconds;

      const thumb =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;

      return {
        id: vid,
        position: index + 1,
        title: title || `Video #${index + 1}`,
        description: item.snippet?.description || '',
        thumbnail: thumb,
        durationSeconds: durObj.seconds,
        durationFormatted: durObj.formatted,
        publishedAt: item.snippet?.publishedAt || '',
        watched: false,
        watchedAt: null,
        notes: '',
      };
    })
    .filter(Boolean);

  return {
    id: playlistId,
    title: playlistTitle,
    channel: channelTitle,
    thumbnail: playlistThumbnail || (processedVideos[0] ? processedVideos[0].thumbnail : ''),
    totalVideos: processedVideos.length,
    totalSeconds: totalPlaylistSeconds,
    totalDurationFormatted: formatDuration(totalPlaylistSeconds),
    videos: processedVideos,
  };
}

/**
 * Public Fallback: Tries public Invidious instances
 */
export async function fetchPlaylistPublicFallback(playlistId) {
  const publicInstances = [
    'https://invidious.nerdvpn.de',
    'https://inv.tux.pizza',
    'https://vid.priv.au',
  ];

  for (const instance of publicInstances) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `${instance}/api/v1/playlists/${playlistId}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos)) {
          let totalSeconds = 0;
          const videos = data.videos.map((v, i) => {
            const sec = v.lengthSeconds || 600;
            totalSeconds += sec;
            return {
              id: v.videoId,
              position: i + 1,
              title: v.title || `Video #${i + 1}`,
              description: v.description || '',
              thumbnail: v.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
              durationSeconds: sec,
              durationFormatted: formatDuration(sec),
              publishedAt: '',
              watched: false,
              watchedAt: null,
              notes: '',
            };
          });

          return {
            id: playlistId,
            title: data.title || 'YouTube Playlist',
            channel: data.author || 'YouTube Channel',
            thumbnail: videos[0]?.thumbnail || '',
            totalVideos: videos.length,
            totalSeconds: totalSeconds,
            totalDurationFormatted: formatDuration(totalSeconds),
            videos: videos,
          };
        }
      }
    } catch (e) {
      // Continue to next mirror
    }
  }

  throw new Error('RATE_LIMITED');
}

/**
 * Instant Custom Course Creator: No API Key needed!
 */
export function createManualPlaylist({ title, totalVideos, avgMinutesPerVideo, targetDays, category, playlistUrl }) {
  const vidCount = Math.max(1, parseInt(totalVideos) || 10);
  const avgSec = Math.max(60, (parseInt(avgMinutesPerVideo) || 20) * 60);
  const totalSec = vidCount * avgSec;
  const plId = extractPlaylistId(playlistUrl) || `custom_${Date.now()}`;

  const videos = Array.from({ length: vidCount }, (_, i) => ({
    id: `lecture_${plId}_${i + 1}`,
    youtubeId: '',
    position: i + 1,
    title: `${title} - Lecture ${i + 1}`,
    durationSeconds: avgSec,
    durationFormatted: formatDuration(avgSec),
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    watched: false,
    watchedAt: null,
    notes: '',
  }));

  return {
    id: plId,
    title: title || 'My Course',
    channel: 'Self Study / YouTube',
    category: category || 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    totalVideos: vidCount,
    totalSeconds: totalSec,
    totalDurationFormatted: formatDuration(totalSec),
    targetDays: Number(targetDays) || 30,
    videos,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Built-in Curated Demo Playlists
 */
export const DEMO_PLAYLISTS = [
  {
    id: 'PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w',
    title: 'Sigma Web Development Course (HTML, CSS, JS, React)',
    channel: 'CodeWithHarry',
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&auto=format&fit=crop&q=60',
    totalVideos: 30,
    totalSeconds: 30 * 18 * 60,
    totalDurationFormatted: '9h 0m',
    targetDays: 30,
    videos: Array.from({ length: 30 }, (_, i) => ({
      id: `demo_webdev_${i + 1}`,
      youtubeId: i === 0 ? 'tVzUXW6siu0' : 'kJEsTjH5mVg',
      position: i + 1,
      title: i === 0 ? 'Introduction to Web Dev, HTML & Tools' : i === 1 ? 'HTML Basics, Tags, Elements & Boilerplate' : i === 2 ? 'CSS Selectors, Box Model & Flexbox' : `Lecture ${i + 1}: Frontend & React Fundamentals Part ${i + 1}`,
      durationSeconds: (15 + (i % 12)) * 60,
      durationFormatted: `${15 + (i % 12)}m`,
      thumbnail: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60`,
      watched: i < 5,
      watchedAt: i < 5 ? new Date(Date.now() - (5 - i) * 86400000).toISOString() : null,
      notes: i === 0 ? 'HTML forms, meta tags, and Chrome DevTools setup.' : '',
    })),
  },
  {
    id: 'PLfqMhTWNBTe0b2nM6JHVCnFa64j46Uu03',
    title: 'Complete C++ & DSA Course for Placements',
    channel: 'Apna College',
    category: 'DSA & Coding',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    totalVideos: 40,
    totalSeconds: 40 * 25 * 60,
    totalDurationFormatted: '16h 40m',
    targetDays: 45,
    videos: Array.from({ length: 40 }, (_, i) => ({
      id: `demo_dsa_${i + 1}`,
      youtubeId: 'z9bZufPHFLU',
      position: i + 1,
      title: i === 0 ? 'C++ Setup, Variables & Data Types' : i === 1 ? 'Loops, Conditionals & Patterns' : i === 2 ? 'Functions & Bit Manipulation' : `Lecture ${i + 1}: Data Structures & Algorithms Topic ${i + 1}`,
      durationSeconds: (20 + (i % 15)) * 60,
      durationFormatted: `${20 + (i % 15)}m`,
      thumbnail: `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60`,
      watched: i < 8,
      watchedAt: i < 8 ? new Date(Date.now() - (8 - i) * 86400000).toISOString() : null,
      notes: '',
    })),
  },
  {
    id: 'PL-osiE80TeTt2d9bfVy4422744PEFLgkZ',
    title: 'Python Complete Masterclass & Projects',
    channel: 'Corey Schafer',
    category: 'Python & AI',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60',
    totalVideos: 25,
    totalSeconds: 25 * 22 * 60,
    totalDurationFormatted: '9h 10m',
    targetDays: 25,
    videos: Array.from({ length: 25 }, (_, i) => ({
      id: `demo_py_${i + 1}`,
      youtubeId: 'YYXdXT2l-Gg',
      position: i + 1,
      title: `Python Tutorial ${i + 1}: Core Concepts, OOP & Automation`,
      durationSeconds: (18 + (i % 10)) * 60,
      durationFormatted: `${18 + (i % 10)}m`,
      thumbnail: `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&auto=format&fit=crop&q=60`,
      watched: false,
      watchedAt: null,
      notes: '',
    })),
  }
];
