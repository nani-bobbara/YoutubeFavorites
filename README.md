# YouTube Favorites

Small single-page React app (no build step) that lets you add, store, and view YouTube videos on the same page.

Files added:
- `index.html` — main entry (uses React & Babel from CDN)
- `app.jsx` — application code (JSX)
- `styles.css` — styling

How to run

Option 1 — Open in browser

Open `index.html` directly in your browser. Some browsers restrict local file iframe playback; if the embed doesn't work, use option 2.

Option 2 — Serve locally (recommended)

From the project root run a simple static server. For example using Python 3:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying (recommended)

If you want a public, permanent URL (instead of sharing a Codespace port), deploy the app as a static site. Two easy options:

1) GitHub Pages

- Build the site (if you convert to a bundler). For this simple CDN-based app you can directly publish the repo root.
- In the repository settings -> Pages, set the source to the `main` branch and `/ (root)` and save.
- GitHub Pages will provide a public URL.

2) Netlify

- Connect your GitHub repo to Netlify and set the publish directory to the repo root.
- For single-file CDN apps, Netlify will deploy immediately and give a public URL.

Notes about monetization

- Deploying publicly doesn't change YouTube's monetization rules. The important parts are using the official iframe and user-initiated playback as implemented in this app.

Notes
- Videos are persisted using `localStorage` under the key `yt_favorites`.
- This is a minimal demo. For a production app, bundle with a build tool and add validation and tests.

## Embedding & Monetization - Best practices

To maximize the chance that embedded plays count and are eligible for ad impressions (monetization), follow these guidelines:

- Use the official YouTube iframe embed (no custom players and avoid youtube-nocookie unless you intentionally want reduced cookie/ad behavior).
- Ensure playback is user-initiated: this app shows a thumbnail with a play button and inserts the iframe only after a user click. Autoplay without user interaction is unreliable for ad impressions.
- Keep player UI and controls intact. Don't programmatically skip ads or overlay controls that hide the YouTube player.
- Provide an "Open on YouTube" link for users to jump to the native watch experience (helps when Shorts monetization/path differs).
- Confirm the channel is part of the YouTube Partner Program if you expect ad revenue.

Testing & verification

- After you or testers play videos inside the app, check YouTube Studio -> Analytics -> Real-time and Traffic sources. Embedded plays typically show up as an external/embedded source.
- Ad impressions and revenue are reported in YouTube Studio / AdSense; allow some time for reporting.

Security & privacy

- Publicly sharing the app exposes the embed experience to anyone. Avoid storing or showing any private tokens or credentials in the app.