const KEY = "music_explorer_playlists_v1";

// Returns an object mapping playlistName -> array of tracks
export function loadPlaylistsFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { "My Playlist": [] };
    const parsed = JSON.parse(raw);
    // Backwards compatibility: if previously stored a single array, wrap it
    if (Array.isArray(parsed)) return { "My Playlist": parsed };
    return parsed;
  } catch (e) {
    console.error("loadPlaylistsFromStorage error", e);
    return { "My Playlist": [] };
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
