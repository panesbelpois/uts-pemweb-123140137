import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SearchForm from "./components/SearchForm";
import DataTable from "./components/DataTable";
import DetailCard from "./components/DetailCard";
import { loadPlaylistsFromStorage, savePlaylistsToStorage, ensurePlaylist } from "./utils/storage";

export default function App() {
  const [queryParams, setQueryParams] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [playlists, setPlaylists] = useState(loadPlaylistsFromStorage());
  const [activePlaylist, setActivePlaylist] = useState(() => {
    const keys = Object.keys(loadPlaylistsFromStorage());
    return keys.length ? keys[0] : "My Playlist";
  });
  const [sortBy, setSortBy] = useState({ key: "releaseDate", dir: "desc" });
  const [page, setPage] = useState("home");

  useEffect(() => {
    savePlaylistsToStorage(playlists);
  }, [playlists]);

  useEffect(() => {
    // Apply sorting to results when sort changes
    if (results.length > 0) {
      const r = [...results].sort((a, b) => {
        if (sortBy.key === "price") {
          const pa = (a.trackPrice ?? a.collectionPrice ?? 0);
          const pb = (b.trackPrice ?? b.collectionPrice ?? 0);
          return sortBy.dir === "asc" ? pa - pb : pb - pa;
        } else {
          // releaseDate
          const da = new Date(a.releaseDate).getTime() || 0;
          const db = new Date(b.releaseDate).getTime() || 0;
          return sortBy.dir === "asc" ? da - db : db - da;
        }
      });
      setResults(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
    if (!queryParams) return;
    const controller = new AbortController();
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      setResults([]);
      setSelected(null);
      const { term, media, genre, limit, explicit } = queryParams;
      const params = new URLSearchParams();
      // required
      params.append("term", term);
      // optional / conditional
      if (media) params.append("media", media);
      if (genre) params.append("genre", genre);
      if (limit !== undefined && limit !== null) params.append("limit", String(limit));
      params.append("explicit", explicit ? "Yes" : "No");
      // iTunes Search API
      const url = `https://itunes.apple.com/search?${params.toString()}`;
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Network response not ok (${res.status} ${res.statusText}) for ${url}`);
        const data = await res.json();
        // Client-side genre filtering: iTunes Search doesn't accept free-text `genre` param reliably,
        // so filter results locally when the user selected a genre.
        let items = (data.results || []);
        if (genre) {
          const g = genre.toLowerCase();
          items = items.filter(it => (it.primaryGenreName || "").toLowerCase().includes(g));
        }
        const results = items.map(item => ({ ...item }));
        setResults(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          // Keep error message informative for debugging
          setError(err.message || String(err));
        }
      } finally {
        setLoading(false);
      }
    };
    performSearch();
    return () => controller.abort();
  }, [queryParams]);

  const handleAddToPlaylist = (track, playlistName = activePlaylist) => {
    // Avoid duplicate by trackId if available (trackId or collectionId)
    const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
    setPlaylists(prev => {
      const copy = { ...prev };
      if (!copy[playlistName]) copy[playlistName] = [];
      if (copy[playlistName].some(p => (p.trackId ?? p.collectionId) === id)) return prev;
      copy[playlistName] = [...copy[playlistName], track];
      return copy;
    });
  };

  const handleRemoveFromPlaylist = (track, playlistName = activePlaylist) => {
    const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
    setPlaylists(p => ({
      ...p,
      [playlistName]: p[playlistName].filter(item => (item.trackId ?? item.collectionId) !== id)
    }));
  };

  const clearPlaylist = (playlistName = activePlaylist) => {
    setPlaylists(p => ({ ...p, [playlistName]: [] }));
  };

  const createPlaylist = (name) => {
    const safe = name.trim() || "New Playlist";
    setPlaylists(p => {
      if (p[safe]) return p; // already exists
      return { ...p, [safe]: [] };
    });
    setActivePlaylist(safe);
  };

  const selectPlaylist = (name) => {
    setActivePlaylist(name);
    setPage(name);
  };

  const handleNavigate = (p) => {
    setPage(p);
  };

  return (
    <div className="app-container spotify-app">
      <Header />
      <main className="main-grid">
          <nav className="spotify-sidebar" aria-label="Main navigation">
          <Sidebar active={page} onNavigate={handleNavigate} playlists={playlists} onCreatePlaylist={createPlaylist} onSelectPlaylist={selectPlaylist} />
        </nav>
        <section className="left-panel content-area">
          {page === "search" ? (
            <>
              <SearchForm onSearch={setQueryParams} loading={loading} focus={true} />

              <div className="sort-row">
                <label>
                  Sort by:
                  <select value={sortBy.key} onChange={(e) => setSortBy(s => ({ ...s, key: e.target.value }))}>
                    <option value="releaseDate">Release Date</option>
                    <option value="price">Price</option>
                  </select>
                </label>
                <label>
                  Direction:
                  <select value={sortBy.dir} onChange={(e) => setSortBy(s => ({ ...s, dir: e.target.value }))}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </label>

                <div className="playlist-summary">
                  <strong>Playlist:</strong> { (playlists[activePlaylist] || []).length } tracks
                  <button className="btn small" aria-label="Export playlist as JSON" title="Export playlist" onClick={() => {
                    const blob = new Blob([JSON.stringify(playlists[activePlaylist] || [], null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${activePlaylist.replace(/\s+/g,'_') || 'playlist'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>Export</button>
                  <button className="btn small danger" aria-label="Clear playlist" title="Clear playlist" onClick={() => clearPlaylist(activePlaylist)} disabled={(playlists[activePlaylist] || []).length===0}>Clear</button>
                </div>
              </div>

              <div className="table-area">
                {loading && <div className="status">Loading...</div>}
                {error && <div className="status error">Error: {error}</div>}
                {!loading && !error && <DataTable
                  results={results}
                  onSelect={setSelected}
                  onAddToPlaylist={(t, target) => handleAddToPlaylist(t, target || activePlaylist)}
                  playlist={playlists[activePlaylist] || []}
                  likedSongs={playlists["Liked Songs"] || []}
                />}
              </div>
            </>
          ) : page === "home" ? (
            <div className="home-hero">
              <h2>Welcome to PaneStify</h2>
              <p className="muted">Explore music with the iTunes API. Click <button className="btn small" onClick={() => setPage("search")}>Search</button> to get started.</p>
            </div>
          ) : (
            <div className="playlist-shortcut-view">
              <h2>{page === "library" ? "Your Library" : page}</h2>
              <p className="muted">This view shows your current playlist. You can add tracks from Search.</p>
              <div className="playlist-card">
                <h3>Playlist: {activePlaylist}</h3>
                {(!playlists[activePlaylist] || playlists[activePlaylist].length === 0) && <p className="muted">No tracks yet. Add songs from Search.</p>}
                <ul className="playlist-list">
                  {(playlists[activePlaylist] || []).map((t) => (
                    <li key={t.trackId ?? t.collectionId ?? t.artistId + t.trackName} className="playlist-item">
                      <img src={t.artworkUrl60} alt={t.trackName} />
                      <div className="meta">
                        <div className="title">{t.trackName ?? t.collectionName}</div>
                        <div className="sub">{t.artistName}</div>
                      </div>
                      <div className="controls">
                        {t.previewUrl ? (
                          <audio controls src={t.previewUrl} preload="none" />
                        ) : null}
                        <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t, activePlaylist)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <aside className="right-panel">
          <DetailCard selected={selected} />
          <div className="playlist-card">
            <h3>Playlist</h3>
            {(!playlists[activePlaylist] || playlists[activePlaylist].length === 0) && <p className="muted">No tracks yet. Add songs from results.</p>}
            <ul className="playlist-list">
              {(playlists[activePlaylist] || []).map((t) => (
                <li key={t.trackId ?? t.collectionId ?? t.artistId + t.trackName} className="playlist-item">
                  <img src={t.artworkUrl60} alt={t.trackName} />
                  <div className="meta">
                    <div className="title">{t.trackName ?? t.collectionName}</div>
                    <div className="sub">{t.artistName}</div>
                  </div>
                  <div className="controls">
                    {t.previewUrl ? (
                      <audio controls src={t.previewUrl} preload="none" />
                    ) : null}
                    <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t, activePlaylist)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
      <footer className="footer">
        <div>Made by Anisah Octa Rohila • 123140137 • Pengembangan Aplikasi Web RA</div>
      </footer>
    </div>
  );
}
