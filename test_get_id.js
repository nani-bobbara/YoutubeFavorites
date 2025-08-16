// Quick Node test for getYoutubeId logic copied from app.jsx (runs in Node)
function getYoutubeId(url) {
  if (!url) return null;
  const s = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith('http') ? s : 'https://' + s);
    const host = u.hostname.toLowerCase();
    if (host.includes('youtu.be')) {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] && /^[A-Za-z0-9_-]{11}$/.test(parts[0])) return parts[0];
    }
    const parts = u.pathname.split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (['shorts', 'embed', 'v'].includes(parts[i])) {
        const candidate = parts[i + 1];
        if (candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate)) return candidate;
      }
    }
    const vid = u.searchParams.get('v');
    if (vid && /^[A-Za-z0-9_-]{11}$/.test(vid)) return vid;
    const fallback = s.match(/([A-Za-z0-9_-]{11})/);
    if (fallback) return fallback[1];
  } catch (e) {
    const m = s.match(/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

const tests = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube.com/shorts/dQw4w9WgXcQ?feature=share',
  'https://youtube.com/embed/dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'random text dQw4w9WgXcQ more text',
  'https://www.youtube.com/watch?v=SHORTID123',
  'https://youtube.com/shorts/SHORTID123',
];

tests.forEach(t => console.log(t, '=>', getYoutubeId(t)));
