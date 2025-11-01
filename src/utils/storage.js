const KEY = "music_explorer_playlists_v1";

const DEFAULT_PLAYLISTS = {
  "Liked Songs": [],
  "My Playlist": []
};

// Helper: ensure required playlists exist
function ensureDefaultPlaylists(playlists) {
  return {
    "Liked Songs": playlists["Liked Songs"] || [],
    "My Playlist": playlists["My Playlist"] || [],
    ...playlists
  };
}

// Returns an object mapping playlistName -> array of tracks
export function loadPlaylistsFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PLAYLISTS;
    const parsed = JSON.parse(raw);
    // Backwards compatibility: if previously stored a single array, wrap it
    if (Array.isArray(parsed)) return { ...DEFAULT_PLAYLISTS, "My Playlist": parsed };
    return ensureDefaultPlaylists(parsed);
  } catch (e) {
    console.error("loadPlaylistsFromStorage error", e);
    return DEFAULT_PLAYLISTS;
  }
}

export function savePlaylistsToStorage(playlists) {
  try {
    localStorage.setItem(KEY, JSON.stringify(playlists));
  } catch (e) {
    console.error("savePlaylistsToStorage error", e);
  }
}

// Helper: ensure playlist exists
export function ensurePlaylist(playlists, name) {
  if (!playlists[name]) playlists[name] = [];
  return playlists;
}

// Check if playlist is a protected default
export function isDefaultPlaylist(name) {
  return name === "Liked Songs" || name === "My Playlist";
}
