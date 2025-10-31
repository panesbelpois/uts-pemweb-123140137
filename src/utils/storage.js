const KEY = "music_explorer_playlist_v1";

export function loadPlaylistFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadPlaylistFromStorage error", e);
    return [];
  }
}

export function savePlaylistToStorage(playlist) {
  try {
    localStorage.setItem(KEY, JSON.stringify(playlist));
  } catch (e) {
    console.error("savePlaylistToStorage error", e);
  }
}
