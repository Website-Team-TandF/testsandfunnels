# tests&funnels

Two apps in one repo:

- **Marketing site** — Astro static site (the public website). Deploys to Hostinger.
- **CRM** — a MERN app for leads and appointments, used internally.

```
/            Astro marketing site (src/, public/, astro.config.mjs)
backend/     Express + MongoDB API for the CRM (leads + appointments, JWT auth)
frontend/    React (Vite) dashboard for the CRM
legacy/      the old static site — reference only, not built or deployed
```

Design + internals: [brandkit.md](brandkit.md) (look & feel), [agent.md](agent.md) (marketing-site internals).

## Run the marketing site

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/  (what gets deployed)
```

## Run the CRM

Needs **MongoDB running locally** (`mongod`). Two terminals:

```bash
cd backend && npm install && npm run dev      # API on http://localhost:5000
```
```bash
cd frontend && npm install && npm run dev     # dashboard on http://localhost:5173
```

The dashboard proxies `/api` to the backend. Log in with the credentials in `backend/.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`). Copy `backend/.env.example` to `backend/.env` first and set a real `JWT_SECRET` and password.

**Dashboard:** the **Leads** tab shows website form submissions and lets you add leads and assign a lead to an appointment; the **Appointments** tab shows those with a status (Interested, Not interested, Call later, Scheduled, Converted, Closed).

## Deploy

- **Marketing site →** push to `main`. The GitHub Action (`.github/workflows/deploy.yml`) builds and FTP-uploads `dist/` to Hostinger. Add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` as repo secrets first.
- **CRM →** needs a Node host **and** MongoDB (e.g. Render, Railway, a VPS, or a Hostinger VPS/Node plan). It cannot run on Hostinger *static* hosting.

## Sending website leads into the CRM

Once the backend is hosted, set `formEndpoint` in `src/layouts/Layout.astro` to its public `…/api/leads` URL. Until then the site's forms fall back to a prefilled WhatsApp message.
