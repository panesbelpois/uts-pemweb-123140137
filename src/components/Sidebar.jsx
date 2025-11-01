import React from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "search", label: "Search" },
  { id: "library", label: "Your Library" },
];

const PLAYLIST_SHORTCUTS = [
  { id: "liked", label: "Liked Songs" },
  { id: "chill", label: "Chill Vibes" },
  { id: "top", label: "Top Hits" },
  { id: "mix", label: "My Mix" },
];

export default function Sidebar({ active, onNavigate, playlists = {}, onSelectPlaylist, onCreatePlaylist }) {
  const [newName, setNewName] = React.useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    const name = (newName || "New Playlist").trim();
    if (name) {
      onCreatePlaylist && onCreatePlaylist(name);
      setNewName("");
    }
  };

  return (
    <div className="sidebar-inner">
      <div className="logo">PaneStify</div>
      <ul className="nav" role="menubar" aria-label="Main">
        {NAV_ITEMS.map((it) => (
          <li key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`}>
            <button type="button" className="nav-link" aria-current={active === it.id ? "page" : undefined} onClick={() => onNavigate && onNavigate(it.id)}>{it.label}</button>
          </li>
        ))}
      </ul>

      <div className="playlists">
        <h4>Playlists</h4>
        <ul>
          {Object.keys(playlists).map((name) => (
            <li key={name}>
              <button type="button" className={`nav-item playlist-link ${active === name ? "active" : ""}`} onClick={() => onSelectPlaylist && onSelectPlaylist(name)}>{name}</button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreate} style={{ marginTop: 12 }}>
          <input aria-label="New playlist name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Create playlist..." />
          <button type="submit" className="btn small" style={{ marginLeft: 8 }}>Add</button>
        </form>
      </div>

      <div className="sidebar-footer">
        <small>Premium • PaneStify</small>
      </div>
    </div>
  );
}
