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

export default function Sidebar({ active, onNavigate }) {
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
          {PLAYLIST_SHORTCUTS.map(p => (
            <li key={p.id}>
              <button type="button" className={`nav-item playlist-link ${active === p.id ? "active" : ""}`} onClick={() => onNavigate && onNavigate(p.id)}>{p.label}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <small>Premium • PaneStify</small>
      </div>
    </div>
  );
}
