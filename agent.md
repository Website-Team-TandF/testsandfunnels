# agent.md: operating manual for AI agents working in this repo

Read this first, then [brandkit.md](brandkit.md) (colors, type, layout, motion, copy rules).
Verified against the code on 2026-11-13, right after the migration from the old
static HTML site to Astro. If behaviour and this file disagree, the code wins — then fix this file.

> **Moved 2026-11-14:** the marketing site now lives in **`website/`**. Every `src/…`, `public/…`, `astro.config.mjs` and `global.css` path below is relative to `website/` (e.g. `website/src/layouts/Layout.astro`). The CRM is separate, in `backend/` + `frontend/`.

---

## 1. What this project is

**tests&funnels (t&f)** marketing website: a Delhi AI agency / production house / incubator partner (Incube8).

- **Frontend-only.** There is **no backend** in this repo anymore (the old Express/Mongo leads API and dashboard were removed in the Astro migration). Lead forms post to a configurable endpoint that is currently empty, so they fall back to a prefilled WhatsApp chat. A CRM endpoint gets wired in phase 2.
- **Astro static site.** Every route is pre-rendered to plain HTML at build time and deployed as static files to Hostinger. No server runs in production.
- **Current state = faithful port.** The 36 pages were migrated 1:1 from the old hand-built site: the exact markup, CSS and JS were reused, but the shared chrome (header, nav, footer, scripts, icon sprite) and the stylesheet are now defined **once**. Each page's `<main>` is still injected as a raw HTML string (`set:html`). The **next pass** is to refactor those into real components with Tailwind/shadcn and Framer Motion (see §9).

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro 7** (`output: static`) | SSG → static HTML; SEO preserved |
| Styling | **Tailwind v4** (CSS-first, Vite plugin) | `@import "tailwindcss"` in `global.css`; theme via `@theme`, no `tailwind.config.js` |
| Interactivity | **React 19** island support (`@astrojs/react`) | for shadcn/ui + Framer Motion in the next pass (not used yet) |
| Sitemap | **@astrojs/sitemap** | generates `sitemap-index.xml` + `sitemap-0.xml` at build |
| Language | **TypeScript** (strict) | |
| Fonts | Outfit via Google Fonts `<link>` | TODO: self-host via Fontsource |
| Hosting | Hostinger (Apache) static | `public/.htaccess` + GitHub Action FTP deploy |

URLs use `trailingSlash: 'always'` + `build.format: 'directory'`, so `/about/` builds to `about/index.html` — identical to the old site. `site` is `https://testsandfunnels.com` (used for canonical, OG and sitemap).

---

## 3. Repo map

```
astro.config.mjs        site URL, trailing-slash config, integrations (commented)
package.json            scripts: dev / build / preview
tsconfig.json           strict + React JSX

src/
  layouts/
    Layout.astro        THE shared shell: <head> meta/OG/JSON-LD + chrome + scripts (one copy)
  chrome/               shared chrome, ported verbatim from the old site (raw HTML/JS)
    pre.html            icon sprite (44-icon union) + progress bar + skip link + header + mobile-nav
    post.html           footer + mobile action bar + floating CTA + video modal
    app.js              all interactions: nav, forms, scroll reveal, counters, video modal
  html/                 per-page content, imported with ?raw and injected via set:html
    <slug>.html         the page's <main> ... </main>
    <slug>.jsonld.html  the page's <script type="application/ld+json"> block(s)
  pages/                routes (Astro file-based routing); each is a thin wrapper
    index.astro         home (/)
    404.astro           404 page
    <route>/index.astro one per URL, e.g. services/performance-marketing/index.astro
  styles/
    global.css          @import "tailwindcss" + the full legacy design system (every class the pages use)

public/                 copied to the site root as-is
  .htaccess             HTTPS, caching, security headers, ErrorDocument 404
  robots.txt            points at /sitemap-index.xml
  llms.txt
  favicon.ico / .svg

.github/workflows/
  deploy.yml            build + FTP-upload dist/ to Hostinger on push to main

legacy/                 the OLD static site, kept ONLY as a visual/content reference.
                        NOT built, NOT deployed (Astro ignores it). Delete once the
                        componentization pass is done.
dist/                   build output (gitignored); what gets deployed
```

**Slug naming** (`src/html/<slug>.*`): the route with `/` replaced by `__`; home is `index`, 404 is `404`. Examples: `/about/` → `about`, `/services/performance-marketing/` → `services__performance-marketing`.

---

## 4. How the architecture works

A request for `/services/brand-building/` resolves to `src/pages/services/brand-building/index.astro`, which is only this:

```astro
---
import Layout from '../../../layouts/Layout.astro';   // relative depth = route segments + 1
import main from '../../../html/services__brand-building.html?raw';
import jsonLd from '../../../html/services__brand-building.jsonld.html?raw';
---
<Layout title={"..."} description={"..."} canonical={"..."} ogTitle={"..."}
        ogDescription={"..."} pageType={"service"} jsonLd={jsonLd}>
  <Fragment set:html={main} />
</Layout>
```

- **`Layout.astro`** builds the `<head>` from the props, renders the shared chrome (`pre.html` before the page, `post.html` after), drops the page's `<main>` in the `<slot />`, then emits the site scripts. Constant head bits (viewport, theme-color `#3A4050`, OG type/site_name/locale, Twitter card, fonts, the `js`-class flag) live in the Layout; per-page bits (title, description, canonical, OG title/description, `data-page-type`, JSON-LD) are props.
- **`set:html`** is used for the page `<main>` and the chrome because 35 of 36 pages contain `{`/`}` in their markup (inline SVG styles etc.), which Astro would otherwise parse as expressions. `?raw` + `set:html` injects them verbatim with zero escaping surprises.
- **Scripts** (`window.TF` config + `app.js`) are emitted with `is:inline` so Astro leaves them exactly as-is. `app.js` builds the mobile nav from the desktop nav, wires forms, runs scroll reveals/counters, and drives the video modal.

### Forms
`app.js` reads `window.TF.formEndpoint` (set in `Layout.astro`). It is **empty**, so on submit the script opens a prefilled WhatsApp chat. Every `<form>` carries `data-form="audit|contact|incubation|training|partner"`, hidden UTM/attribution fields, and a `company` honeypot. **Phase 2:** set `formEndpoint` in `Layout.astro` to the CRM URL — one line, all forms switch over.

---

## 5. Golden rules

1. **Edit shared things once.** Nav/footer/mobile bar/modal → `src/chrome/pre.html` or `post.html`. Interactions → `src/chrome/app.js`. Styles → `src/styles/global.css`. Head/meta/OG defaults → `src/layouts/Layout.astro`. Never reintroduce per-page copies.
2. **Keep content and meta separate.** A page's visible content is `src/html/<slug>.html`; its title/description/OG/JSON-LD are props in `src/pages/<route>/index.astro`. Keep them in sync (e.g. a new FAQ goes in both the `.html` and the `.jsonld.html`).
3. **`legacy/` is read-only reference.** Don't edit or import it; it isn't built. Use it to see how the old page looked.
4. **No em/en dashes. No invented clients, stats or promises.** See [brandkit.md §2](brandkit.md).
5. **Contact details are everywhere** (`tel:+917507994138`, `wa.me/917507994138`, `admin@testsandfunnels.com`, and `window.TF` in `Layout.astro`). Change them in all of those plus `public/llms.txt` and the JSON-LD.
6. **Verify with the real build.** `npm run build` type-checks and renders all pages; a dev-only check can hide SSR issues. Then spot-check in the browser (`npm run dev`).
7. **Prefer the smallest change that fully works**, and finish every file it must reach.
8. **Tooling:** Windows + Git Bash/PowerShell. HTML lines are long; for multi-file edits use Node scripts with string/regex replace (replace with a function so `$` in content is literal), not line tools. Quoted bash heredocs mangle `\\` — avoid it or use the Write tool for scripts.

---

## 6. Task playbook

| Request | Do this |
|---|---|
| **Change text/content on a page** | Edit `src/html/<slug>.html`. |
| **Change a page's title / meta / OG** | Edit the props in `src/pages/<route>/index.astro`. |
| **Add/change a FAQ** | Edit the `<details>` in `src/html/<slug>.html` **and** the `FAQPage` block in `src/html/<slug>.jsonld.html`. |
| **Edit nav or footer** | `src/chrome/pre.html` (nav) / `post.html` (footer). The mobile nav is built by `app.js` from the desktop nav, so edit only the desktop nav. |
| **Restyle / fix CSS / add a component style** | `src/styles/global.css` (one file now). For new work prefer Tailwind utilities / `@theme` tokens over adding to the legacy block. |
| **Change shared behaviour** | `src/chrome/app.js`. |
| **Add a new page** | See §7. |
| **Add an icon** | Add a `<symbol id="i-name" viewBox="0 0 24 24">` (stroke style, see [brandkit.md §7](brandkit.md)) to the sprite in `src/chrome/pre.html`; use it with `<svg class="ic"><use href="#i-name"/></svg>`. |
| **Point forms at the CRM** | Set `formEndpoint` in `src/layouts/Layout.astro`. |
| **Add real media** | Put files in `public/media/`, reference as `/media/...`; set `data-src`/`data-poster` on the `.vid` and replace the `.ph` placeholder (see [brandkit.md §9](brandkit.md)). |
| **Deploy to Hostinger** | See §8. |

### Adding a new page (manual, until componentized)
1. `src/html/<slug>.html` — the `<main id="main"> ... </main>`.
2. `src/html/<slug>.jsonld.html` — the JSON-LD (`Service`/`BreadcrumbList`/`FAQPage` as appropriate).
3. `src/pages/<route>/index.astro` — copy a sibling of the same `data-page-type`, fix the **relative import depth** (`../` × (number of route segments + 1)), the `?raw` import names, and the Layout props.
4. Link it: add to the nav + footer in `src/chrome/pre.html`/`post.html`, to its parent hub page, and to `.related` on siblings.
5. `public/llms.txt` — add a line. Sitemap updates itself at build.
6. `npm run build`, then check in the browser (§7, §8 checklist).

---

## 7. Commands

```bash
npm install            # first time
npm run dev            # dev server at http://localhost:4321 (hot reload)
npm run build          # type-check + build static site into dist/
npm run preview        # serve the built dist/ locally
```

In this app, the dev server is wired in `.claude/launch.json`, so it also runs via the Browser pane (`preview_start`). If the dev server was started before a new file existed and shows a stale 500, restart it.

---

## 8. Deploy to Hostinger

Pushing to GitHub does **not** update Hostinger on its own. `.github/workflows/deploy.yml` bridges them: on every push to `main` it builds and FTP-uploads `dist/` to `public_html`. So **`git push` is the deploy.**

**One-time setup** — add these in GitHub → repo → Settings → Secrets and variables → Actions:
- `FTP_SERVER` (e.g. `ftp.testsandfunnels.com`), `FTP_USERNAME`, `FTP_PASSWORD` — from hPanel → Files → FTP Accounts.

Notes:
- Until the secrets exist, the workflow's **build** step passes but the **FTP** step fails (red ✗) — expected.
- First deploy: `public_html` still has the old hand-built site. New files overwrite matching paths; old-only files linger. Clear `public_html` once via hPanel File Manager for a clean cutover.
- Manual fallback (no secrets): `npm run build`, then upload the contents of `dist/` through hPanel File Manager. If `server-dir: ./public_html/` is wrong for your FTP account (some land inside `public_html` already), set it to `./`.

Never schedule/poll CI yourself; after a push, check the Actions tab.

---

## 9. The componentization roadmap (next pass)

The current port is faithful but the chrome and page bodies are raw HTML blobs. The planned refactor, in order:

1. **Tokens:** move the brandkit colors/fonts from the legacy CSS block into Tailwind `@theme` tokens in `global.css`.
2. **Components:** split `pre.html`/`post.html` into real Astro components — `Header`, `Nav` (with shadcn dropdown), `Footer`, `MobileBar`, `FloatingCta`, `Icon`. Restore the inner-page active-nav underline (dropped in the port) by computing it from `Astro.url.pathname`.
3. **Sections:** turn the repeated page sections (`Hero`, `CardGrid`, `ProofMetrics`, `CtaBand`, `Faq`, `Process`, `Marquee`, `VideoModal`, …) into components fed by typed content, so `src/html/*` shrinks to data.
4. **Animation:** replace the hand-rolled scroll reveal/counters/marquee in `app.js` with Framer Motion islands; keep reduced-motion support.
5. **Fonts:** self-host Outfit via Fontsource.

Each file/component should carry a `/* ... */` header saying what it is and why; JSX uses `{/* ... */}`.

---

## 10. Known issues / carried-over debt

1. **Broken links** (from the old site, still present): `/privacy-policy/`, `/terms/`, `/refund-policy/` and `/production-house/product-and-lifestyle-shoots/` are linked (footer + every form's "Privacy Policy") but don't exist. The site collects personal data, so create the policy pages before a real launch.
2. **No media.** All 145 media spots are placeholders; there's no `public/media/` folder, no logos, no real testimonials.
3. **Inner-page active nav underline** was dropped in the port (home has none; the shared header no longer sets `aria-current` per page). Restore it in the componentization pass.
4. **Fonts** load from Google's CDN (third-party request). Self-host later.
5. **No analytics tag** is installed, though events are pushed to `dataLayer` by `app.js`.
6. **404** isn't `noindex` (faithful to the old site); consider adding it.
7. The **migration script** (`port.js`) was a one-off run from a scratch dir and is **not** in the repo; `legacy/` is the reference if a re-port is ever needed.

(The old backend security issues — public `leads.json`, default admin creds — are **gone**: the backend was removed entirely.)

---

## 11. Quick reference

- Primary CTA everywhere: **Free Business Audit** → `/free-business-audit/`.
- One shell: `src/layouts/Layout.astro`. One stylesheet: `src/styles/global.css`. One nav/footer: `src/chrome/`.
- Page content: `src/html/<slug>.html`. Page meta: `src/pages/<route>/index.astro`.
- Build: `npm run build`. Deploy: `git push` (once FTP secrets are set).
- Colors/type/components/motion: [brandkit.md](brandkit.md). Ink `#3A4050`, links `--p600`, primary `--grad`.
- Domain: `https://testsandfunnels.com` · Phone/WhatsApp `+91 75079 94138` · Email `admin@testsandfunnels.com`.
