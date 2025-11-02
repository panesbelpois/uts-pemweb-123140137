const KEY = "music_explorer_playlists_v1";

const DEFAULT_PLAYLISTS = {
  "Liked Songs": []
};

function ensureDefaultPlaylists(playlists) {
  const cleaned = { ...playlists };
  if (cleaned["My Playlist"]) delete cleaned["My Playlist"];
  return {
    "Liked Songs": playlists["Liked Songs"] || [],
    ...cleaned
  };
}

export function loadPlaylistsFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PLAYLISTS;
    const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { ...DEFAULT_PLAYLISTS, "Liked Songs": parsed };
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



export function ensurePlaylist(playlists, name) {
  if (!playlists[name]) playlists[name] = [];
  return playlists;
}

export function isDefaultPlaylist(name) {
  return name === "Liked Songs";
}
