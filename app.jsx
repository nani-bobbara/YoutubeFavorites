const { useState, useEffect } = React;

function getYoutubeId(url) {
  if (!url) return null;
  const s = url.trim();
  // Accept raw IDs (11 chars)
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;

  // Try to parse as a URL, but fall back to regex if it's not a valid URL
  try {
    const u = new URL(s.startsWith('http') ? s : 'https://' + s);
    const host = u.hostname.toLowerCase();

    // youtu.be short link -> pathname like /VIDEOID
    if (host.includes('youtu.be')) {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] && /^[A-Za-z0-9_-]{11}$/.test(parts[0])) return parts[0];
    }

    // /shorts/VIDEOID or /embed/VIDEOID or /v/VIDEOID
    const parts = u.pathname.split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (['shorts', 'embed', 'v'].includes(parts[i])) {
        const candidate = parts[i + 1];
        if (candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate)) return candidate;
      }
    }

    // watch?v=VIDEOID
    const vid = u.searchParams.get('v');
    if (vid && /^[A-Za-z0-9_-]{11}$/.test(vid)) return vid;

    // fallback: look for 11-char id anywhere in the string
    const fallback = s.match(/([A-Za-z0-9_-]{11})/);
    if (fallback) return fallback[1];
  } catch (e) {
    // not a valid URL, try to extract an 11-char id
    const m = s.match(/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }

  return null;
}

function saveToLocal(videos) {
  try {
    localStorage.setItem('yt_favorites', JSON.stringify(videos));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem('yt_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Could not load from localStorage', e);
    return [];
  }
}

function App() {
  const [input, setInput] = useState('');
  const [videos, setVideos] = useState(() => loadFromLocal());
  const [error, setError] = useState(null);

  useEffect(() => {
    saveToLocal(videos);
  }, [videos]);

  function isShortFromInput(s) {
    try {
      const u = new URL(s.startsWith('http') ? s : 'https://' + s);
      return u.pathname.toLowerCase().includes('/shorts/');
    } catch (e) {
      return /(^|\/)shorts($|\/)/i.test(s);
    }
  }

  function addVideo(e) {
    e && e.preventDefault();
    setError(null);
    const id = getYoutubeId(input.trim());
    if (!id) {
      setError('Invalid YouTube URL or ID');
      return;
    }
    if (videos.find(v => v.id === id)) {
      setError('Video already added');
      return;
    }
    const shortFlag = isShortFromInput(input.trim());
    const newItem = { id, url: `https://www.youtube.com/watch?v=${id}`, addedAt: Date.now(), isShort: shortFlag };
    setVideos(prev => [newItem, ...prev]);
    setInput('');
  }

  function removeVideo(id) {
    setVideos(prev => prev.filter(v => v.id !== id));
  }

  function clearAll() {
    if (confirm('Remove all saved videos?')) setVideos([]);
  }

  const [playing, setPlaying] = useState(() => ({}));

  function handlePlay(id) {
    // mark as playing so iframe is inserted (user-initiated)
    setPlaying(p => ({ ...p, [id]: true }));
  }

  return (
    <div className="container">
      <header>
        <h1>YouTube Favorites</h1>
        <p className="muted">Add YouTube URLs and view them on the same page. Items persist in localStorage.</p>
      </header>

      <form className="add-form" onSubmit={addVideo}>
        <input
          type="text"
          placeholder="Paste YouTube video or Shorts URL (or paste a video ID)"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="form-actions">
          <button type="submit">Add</button>
          <button type="button" className="danger" onClick={clearAll}>Clear All</button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      <main>
        {videos.length === 0 ? (
          <p className="empty">No videos yet — add one above.</p>
        ) : (
          <div className="grid">
            {videos.map(v => (
              <article key={v.id} className="card">
                <div className="preview">
                  {!playing[v.id] ? (
                    // show thumbnail and play button to ensure user-initiated playback
                    <div className="thumb" onClick={() => handlePlay(v.id)} role="button" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter') handlePlay(v.id); }}>
                      <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt="YouTube thumbnail" />
                      <div className="play-overlay">▶</div>
                    </div>
                  ) : (
                    // user initiated: insert official iframe embed. autoplay=1 is allowed after a user gesture.
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}?rel=0&playsinline=1&autoplay=1`}
                      title={v.url}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <div className="meta">
                  <div className="left-meta">
                    <a href={v.url} target="_blank" rel="noreferrer">Open on YouTube</a>
                    {v.isShort && <span className="badge">Shorts</span>}
                  </div>
                  <div className="actions">
                    <button className="copy" onClick={() => { navigator.clipboard?.writeText(v.url); }}>Copy link</button>
                    {navigator.share ? (
                      <button className="share" onClick={() => navigator.share({ title: 'Watch on YouTube', url: v.url }).catch(()=>{})}>Share</button>
                    ) : null}
                    <button className="remove" onClick={() => removeVideo(v.id)}>Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer>
        <small>Saved: {videos.length} video{videos.length !== 1 ? 's' : ''}</small>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
