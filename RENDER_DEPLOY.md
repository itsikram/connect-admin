# Deploying the admin panel to Render (Static Site)

`npm run build` produces a plain static site in `out/` (Next.js `output: 'export'`).

## Option A — Blueprint (recommended)
1. Push this repo (with `render.yaml`) to GitHub.
2. Render → **New → Blueprint** → pick the repo. It creates the `connect-admin` static site with all rewrite rules.
3. When prompted, set `NEXT_PUBLIC_API_URL` (e.g. `https://your-api.onrender.com/api`).

## Option B — Manual Static Site
Render → **New → Static Site** → pick the repo, then:

| Setting           | Value                     |
|-------------------|---------------------------|
| Build Command     | `npm ci && npm run build` |
| Publish Directory | `out`                     |
| Env vars          | `NEXT_PUBLIC_API_URL`, `NODE_VERSION=20` (+ any other `NEXT_PUBLIC_*`) |

Then **Redirects/Rewrites** → add every rule listed under `routes:` in `render.yaml` (Action: Rewrite).

## Notes
- `NEXT_PUBLIC_*` values are baked in at build time — after changing one, trigger **Manual Deploy → Clear build cache & deploy**.
- Dynamic pages (`/dashboard/posts/<id>`, etc.) are exported once as `/…/_/`; the rewrites serve that page and
  `src/lib/useRouteParams.js` reads the real id from the URL.
- Add the admin's `https://<name>.onrender.com` origin to the API server's CORS allow-list.
