import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SearchForm from "./components/SearchForm";
import DataTable from "./components/DataTable";
import DetailCard from "./components/DetailCard";
import { loadPlaylistFromStorage, savePlaylistToStorage } from "./utils/storage";

export default function App() {
  const [queryParams, setQueryParams] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [playlist, setPlaylist] = useState(loadPlaylistFromStorage());
  const [sortBy, setSortBy] = useState({ key: "releaseDate", dir: "desc" });
  const [page, setPage] = useState("home");

  useEffect(() => {
    savePlaylistToStorage(playlist);
  }, [playlist]);

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

  const handleAddToPlaylist = (track) => {
    // Avoid duplicate by trackId if available (trackId or collectionId)
    const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
    if (playlist.some(p => (p.trackId ?? p.collectionId) === id)) return;
    const newPlaylist = [...playlist, track];
    setPlaylist(newPlaylist);
  };

  const handleRemoveFromPlaylist = (track) => {
    const id = track.trackId ?? track.collectionId ?? track.artistId + "-" + track.trackName;
    setPlaylist(p => p.filter(item => (item.trackId ?? item.collectionId) !== id));
  };

  const clearPlaylist = () => setPlaylist([]);

  const handleNavigate = (p) => {
    setPage(p);
  };

  return (
    <div className="app-container spotify-app">
      <Header />
      <main className="main-grid">
        <nav className="spotify-sidebar" aria-label="Main navigation">
          <Sidebar active={page} onNavigate={handleNavigate} />
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
                  <strong>Playlist:</strong> {playlist.length} tracks
                  <button className="btn small" aria-label="Export playlist as JSON" title="Export playlist" onClick={() => {
                    const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `playlist.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>Export</button>
                  <button className="btn small danger" aria-label="Clear playlist" title="Clear playlist" onClick={clearPlaylist} disabled={playlist.length===0}>Clear</button>
                </div>
              </div>

              <div className="table-area">
                {loading && <div className="status">Loading...</div>}
                {error && <div className="status error">Error: {error}</div>}
                {!loading && !error && <DataTable
                  results={results}
                  onSelect={setSelected}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlist={playlist}
                />}
              </div>
            </>
          ) : page === "home" ? (
            <div className="home-hero">
              <h2>Welcome to PaneStify</h2>
              <p className="muted">Explore music with the iTunes API. Click <button className="btn small" onClick={() => setPage("search")}>Search</button> to get started.</p>
            </div>
          ) : page === "library" ? (
            <div className="library-view">
              <h2>Your Library</h2>
              <div className="playlist-card">
                <h3>Current Playlist</h3>
                {playlist.length === 0 && <p className="muted">No tracks yet. Add songs from Search.</p>}
                <ul className="playlist-list">
                  {playlist.map((t) => (
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
                        <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Playlist shortcuts (liked/chill/top/mix) */
            <div className="playlist-shortcut-view">
              <h2>{page === "liked" ? "Liked Songs" : page === "chill" ? "Chill Vibes" : page === "top" ? "Top Hits" : "My Mix"}</h2>
              <p className="muted">This view shows your current playlist. You can add tracks from Search.</p>
              <div className="playlist-card">
                <h3>Playlist</h3>
                {playlist.length === 0 && <p className="muted">No tracks yet. Add songs from results.</p>}
                <ul className="playlist-list">
                  {playlist.map((t) => (
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
                        <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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
              <strong>Playlist:</strong> {playlist.length} tracks
              <button className="btn small" aria-label="Export playlist as JSON" title="Export playlist" onClick={() => {
                // export playlist JSON
                const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `playlist.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>Export</button>
              <button className="btn small danger" aria-label="Clear playlist" title="Clear playlist" onClick={clearPlaylist} disabled={playlist.length===0}>Clear</button>
            </div>
          </div>

          <div className="table-area">
            {loading && <div className="status">Loading...</div>}
            {error && <div className="status error">Error: {error}</div>}
            {!loading && !error && <DataTable
              results={results}
              onSelect={setSelected}
              onAddToPlaylist={handleAddToPlaylist}
              playlist={playlist}
            />}
          </div>
        </section>

        <aside className="right-panel">
          <DetailCard selected={selected} />
          <div className="playlist-card">
            <h3>Playlist</h3>
            {playlist.length === 0 && <p className="muted">No tracks yet. Add songs from results.</p>}
            <ul className="playlist-list">
              {playlist.map((t) => (
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
                    <button className="btn small danger" onClick={() => handleRemoveFromPlaylist(t)}>Remove</button>
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
