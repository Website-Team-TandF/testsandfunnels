# agent.md: operating manual for AI agents working in this repo

Read this first, then [brandkit.md](brandkit.md) (design, layout, motion, copy rules).
Everything below was verified against the code on 2026-11-13. If you change behavior, update this file in the same change.

---

## 1. What this project is

**tests&funnels (t&f)**: marketing website for a Delhi AI agency / production house / incubator partner (Incube8), plus a small lead-capture backend and an internal leads dashboard.

| Layer | Tech | Where |
|---|---|---|
| Website | Static multi-page HTML. **No build step, no framework, no CSS/JS files.** Each page inlines the same CSS (65 KB) and JS (21 KB) | `index.html`, `<section>/index.html` |
| API | Node + Express 4, Mongoose 8, JWT | `backend/server.js`, `routes/`, `controllers/`, `models/`, `middleware/`, `config/` |
| Database | MongoDB (optional). If unreachable, a JSON file is the store | `backend/data/leads.json` |
| Admin UI | React 18 from CDN + Babel in the browser, single file | `backend/public/dashboard/index.html` |
| Static hosting config | Apache `.htaccess` (HTTPS, clean URLs, caching, security headers, branded 404) | `.htaccess` |
| SEO / AI files | `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD in every page | repo root |

Important: the HTML looks **generated** (very long single lines, "rebuild" and "base.css + extra.css" mentioned in comments) but **the generator is not in this repo**. Treat the HTML files as the source of truth and edit them directly.

---

## 2. Repo map

```
/                         index.html (home), 404.html, .htaccess, sitemap.xml, robots.txt, llms.txt, README.md (stale, see §9)
about/ contact/ how-we-work/ free-business-audit/ partner-with-us/ training/ influencer-marketing/ personal-branding/
ai-automation/            index + social-media-agents, advertising-agents, sales-agents, operations-agents
production-house/         index + ai-visuals-and-video, ugc            (product-and-lifestyle-shoots/ is linked but MISSING)
services/                 index + performance-marketing, brand-building, social-media-management, cold-outreach,
                          visibility-optimization, website-development, sales-services
industries/               index + e-commerce, healthcare
work/                     index + sparc-lights, suit-up-by-kailash-talreja, ayurvishwa-healthcare
incubation/               index + apply/
locations/delhi/
backend/                  Express API + leads dashboard (see §4)
```

36 website pages = every `*.html` outside `backend/` (35 routes + `404.html`).
Every page is `<folder>/index.html` so URLs are clean: `/services/performance-marketing/`.

---

## 3. Golden rules

1. **Shared code is duplicated, not imported.** The `<style>` block, the main `<script>`, the `<header>` and the `<footer>` are byte-identical in all 36 pages (header differs only by one `aria-current="page"`). A change made in one file is **wrong** until it exists in all 36. Use the propagation scripts in §7.
2. **Reuse existing classes.** Do not add page-specific CSS or inline `style=""`. If a new component is truly needed, add it to the shared stylesheet in `index.html`, then propagate to all pages. Check [brandkit.md §6](brandkit.md) first.
3. **Copy a sibling page** with the same `data-page-type` when making a page; never write one from scratch (§6).
4. **No em dashes or en dashes** in copy. **No invented clients, testimonials, stats or promises.** Details in [brandkit.md §2](brandkit.md).
5. **Contact constants appear everywhere** (78 `tel:`, 111 `wa.me`, 41 `mailto:` links plus `window.TF`). If a phone, email or WhatsApp number ever changes, replace it across all pages, `llms.txt`, JSON-LD and `backend/.env.example`.
6. **Do not touch** `backend/node_modules/`, `backend/package-lock.json` (unless adding a dependency), or `backend/.env` (gitignored, holds real secrets).
7. **Lead data is personal data.** Never paste real leads into commits, issues or logs. Tests that write leads must restore the file afterwards (§7.6).
8. **Motion must respect `prefers-reduced-motion`.** New animations go in the reduced-motion block.
9. Prefer the smallest change that fully solves the task; finish every file it must reach (all 36 pages, sitemap, llms.txt, JSON-LD) rather than leaving the site inconsistent.
10. Tooling notes: environment is Windows with Git Bash/PowerShell. HTML lines are very long, so line-oriented tools (`sed`, line-based diffs) are clumsy. Use **Node scripts with string/regex replace** for multi-file edits, and always replace with a *function* (`s.replace(re, () => x)`) so `$` in replacement text is not interpreted.

---

## 4. Runtime flows

### 4.1 Serving

```
Dev / Node:   browser -> Express (:5000)
                 /api/*                      -> routes (JSON)
                 /dashboard, /backend/dashboard, /backend, /backend/  -> leads dashboard SPA
                 everything else             -> express.static(project root)  (the website)
Production (Apache/Hostinger):  .htaccess serves the static pages only.
                 The Node API is NOT available there unless deployed separately and proxied at /api.
```

Without a reachable `/api/leads/submit`, forms show the error message (call/email fallback), they do **not** fall back to WhatsApp (see §5.3).

### 4.2 Lead capture flow (end to end)

```
Visitor lands (UTMs, gclid, fbclid, landing URL, referrer saved in sessionStorage as tf_*)
  -> fills a <form data-form="audit|contact|incubation|training|partner">
  -> JS (shared script) builds JSON from every named field + form_type = data-form value
       honeypot "company" filled? -> silently dropped
  -> dataLayer push (audit_form_submit | contact_form_submit | apply_submit)
  -> POST {TF.formEndpoint = /api/leads/submit}
  -> leadController.submitLead
       422 if name, phone and email are all empty
       maps fields (name|full_name, phone|mobile|whatsapp, website|company, message|notes ...)
       if MongoDB connected: Lead.create()   (failures are logged, not fatal)
       ALWAYS also unshift the record into backend/data/leads.json
       201 { success, message, id }
  -> JS: form.reset() + success message "Thank you, <name>. <data-thanks>"
         on any non-2xx / network error: error message with phone and email
  -> Admin opens /backend/ -> login -> JWT -> list / filter / search / update status+notes / delete / CSV export
```

Status pipeline: `New -> Contacted -> In Discussion -> Converted -> Closed` (Mongoose enum; dashboard dropdowns; the JSON fallback does not validate the value).

### 4.3 API reference

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/leads/submit` | public | what every form calls |
| POST | `/api/submit` | public | alias of the same handler |
| GET | `/api/leads?status=&type=&search=` | Bearer JWT | DB first, JSON file fallback |
| GET | `/api/leads/stats` | JWT | `{ total, newLeads, converted, todayCount }` |
| GET | `/api/leads/export` | JWT (header or `?token=`) | UTF-8 BOM CSV |
| PUT | `/api/leads/:id` | JWT | body `{ status?, admin_notes? }` |
| DELETE | `/api/leads/:id` | JWT | removes from DB and file |
| POST | `/api/auth/login` | public | `{ username, password }` -> `{ token }` (7d default) |
| GET | `/api/auth/verify` | JWT | returns decoded user |
| GET | `/api/health` | public | `{ status, database: "MongoDB Connected" or "Local Storage Buffer (Active)" }` |

Responses always include `success: boolean`; errors carry `error`.

### 4.4 Lead model (`backend/models/Lead.js`)

`name*` (required, defaults to "Anonymous"), `phone`, `email` (lowercased), `form_type`, `industry`, `monthly_ad_spend`, `website`, `message`, `source_page`, `ip_address`, `status` (enum), `admin_notes`, `raw_data` (Mixed: entire request body), plus `createdAt/updatedAt`.
Fields that exist on forms but **not** in the schema (`interest, topic, venture, stage, format, status, city, mode, goal, organisation`, all UTM/click ids, `landing_page`, `referrer`) live **only inside `raw_data`**. The dashboard and CSV do **not** show `raw_data`, so campaign attribution is stored but invisible. If someone asks for it, add schema fields + dashboard columns + CSV columns together.
`source_page` is read from `data.page_url` or the `Referer` header; the forms send `source_page` (a pathname), which is therefore ignored by the controller and ends up in `raw_data` only.

### 4.5 Environment (`backend/.env`, template in `.env.example`)

`PORT` (5000), `MONGODB_URI` (default `mongodb://127.0.0.1:27017/testsandfunnels`), `JWT_SECRET`, `JWT_EXPIRES_IN` (7d), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NOTIFICATION_EMAIL` (declared, unused).
Code falls back to hard-coded defaults for the JWT secret and admin credentials when env vars are missing (see §9).

### 4.6 Run it

```bash
cd backend && npm install            # first time
node backend/server.js               # from repo root; site http://localhost:5000/ , admin http://localhost:5000/backend/
npm run dev --prefix backend         # auto-reload (node --watch)
```

MongoDB is optional: with no `mongod`, startup waits about 4 s, logs a warning, and runs on `leads.json`.
Use `PORT=5055 node backend/server.js` when 5000 is taken.

---

## 5. Frontend behavior contract (shared JS)

### 5.1 Config object (before the main script, same on every page)

```js
window.TF = { formEndpoint:"/api/leads/submit", wa:"917507994138", phone:"+91 75079 94138",
              email:"admin@testsandfunnels.com", auditHref:"/free-business-audit/" };
```
`formEndpoint` set -> POST to API. Empty -> opens a prefilled WhatsApp chat instead.

### 5.2 Data attributes the JS reacts to

| Attribute | On | Effect |
|---|---|---|
| `data-page-type` | `<body>` | sent with every tracked click |
| `data-form` = `audit`, `contact`, `incubation`, `training` or `partner` | `<form>` | enables submit handling; selects event names and `form_type` |
| `data-wa-intro`, `data-thanks` | `<form>` | WhatsApp intro text / success sentence |
| `data-track="Label"` `data-pos="where"` `data-event` (`phone_click` or `whatsapp_click`, default `cta_click`) | any link/button | pushes `{event, cta_label, cta_position, page_type}` to `dataLayer` |
| `data-count` (+ `data-prefix`, `data-suffix`, `data-dec`) | number span | animated counter |
| `data-dup` | marquee `<ul>` | children cloned for a seamless loop |
| `data-slot`, `data-title`, `data-brief`, `data-src`, `data-poster`, `data-portrait`, `data-ph` | `.vid` button | video lightbox / placeholder text / real file |
| `data-open="slot-name"` | any element | opens that video (scrolls to VSL first) |
| `data-vsl`, `data-dur`, `.chapters button[data-t]` | training VSL | player with chapter jumps and CTA unlock at 30% |
| `data-rail` / `data-rail-list` | buttons / list | carousel scroll |
| `.chipbar button[data-filter]` + `[data-cat]` | filter chips and items | show/hide by category |
| `#yr` | footer span | filled with the current year |
| `#hero-form`, `#apply` | form wrapper | anchors that focus the first input after scroll |

### 5.3 Form fields and hidden attribution fields

Every form carries hidden inputs `utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, landing_page, referrer, source_page`, auto-filled from `sessionStorage` (`tf_*` keys) and the URL, plus the honeypot `company`.
Selects `industry` and `topic` can be pre-selected by query string: `?industry=E-commerce`, `?topic=Training`.

| `data-form` | Used on | Visible fields |
|---|---|---|
| `audit` (compact) | hero form (`#hero-form`) on 29 pages | `name, phone` + `industry` (19 pages) or `interest` (10 pages; options differ by pillar: the 5 `ai-automation/` pages ask Marketing/Sales/Operations; production-house, influencer-marketing and personal-branding pages ask shoots/AI visuals/UGC/influencer/personal brand) |
| `audit` (full) | `free-business-audit/`, `index.html` second form | `name, phone, email, website, industry, monthly_ad_spend` |
| `contact` | `contact/` | `name, phone, email, topic, message` |
| `incubation` | `incubation/`, `incubation/apply/` | compact: `name, phone, stage`; full: `name, phone, email, venture, website, industry, stage, message` |
| `training` | `training/` (two forms) | compact: `name, phone, format`; full: `name, phone, email, status, city, mode, goal` |
| `partner` | `partner-with-us/` | `name, organisation, phone, email, message` |

`form_type` stored on the lead = the `data-form` value (`audit`, `contact`, ...). Seed data uses a label like "Free Business Audit"; the dashboard prints whatever is stored.

### 5.4 Analytics events (`window.dataLayer`)

`cta_click`, `phone_click`, `whatsapp_click`, `audit_form_start`, `audit_form_submit`, `contact_form_start`, `contact_form_submit`, `apply_start`, `apply_submit`, `video_open`, `vsl_play`, `vsl_progress` (25/50/75/100), `media_filter`. No GTM snippet is installed; events are only queued until one is added.

---

## 6. Task playbook: what to touch for each request

| Request | Do this |
|---|---|
| **Edit copy on one page** | Edit that page only. Keep the `<title>`, meta description, `og:*`, JSON-LD (Service/FAQ) and visible text in sync. |
| **Add or change a FAQ** | Update the `<details>` in `.faq` **and** the page's `FAQPage` JSON-LD. |
| **Restyle anything / new component / fix a CSS bug** | Edit `<style>` in `index.html`, then propagate (§7.1). Never patch one page. |
| **Change nav, footer, mobile bar, floating CTA** | Edit `index.html`, then propagate header/footer (§7.2). Mobile nav is built by JS from the desktop nav, so only the desktop nav needs editing. |
| **Change shared JS** | Edit the main `<script>` in `index.html`, then propagate (§7.3). |
| **Add a new page** | See §6.1. |
| **Add a service/agent/industry card to a hub** | Add a `.card-d` in the hub page, add to nav submenu + footer (all pages), sitemap, llms.txt, and give it its own page. |
| **Add a case study** | Copy a `work/*/` page; add a `.metric` link on `work/index.html` and `index.html` proof block if it is a headline result; add to nav/footer/sitemap/llms.txt. Every figure needs a source and date. |
| **Add a form field** | HTML field (name must be unique, label `for`/`id`) -> if it must be searchable/visible, add to `Lead` schema, `submitLead` mapping, dashboard columns, CSV export. Otherwise it is kept in `raw_data` automatically. |
| **Replace a placeholder with real media** | §6.2. |
| **Change contact details** | Replace across all pages + `llms.txt` + JSON-LD + `window.TF` + dashboard WhatsApp link (dashboard builds it from the lead's own phone, so no change). |
| **Backend change** | Edit controller/route/model; keep DB path and JSON-fallback path behaving the same; update §4 here and `backend/README.md`. |
| **Fix a broken link** | See §9 (four known missing pages). Either create the page or remove every reference in 36 pages + sitemap + llms.txt. |

### 6.1 Adding a new page (checklist)

1. Pick the sibling with the same `data-page-type` (`service`, `pillar`, `niche`, `case`, `hub`, ...) and copy its `index.html` to `<new-folder>/index.html`.
2. Update: `<title>`, `meta description`, `canonical`, `og:title/description/url`, `data-page-type`, breadcrumbs (`.crumbs`), `h1`, `.eyebrow`, `.answer`, content, `.related` links, JSON-LD (`Service` or page type, `BreadcrumbList`, `FAQPage`), CTA band copy, hero-form `data-wa-intro`/`data-thanks`, `.hero-peek data-open` and every `data-slot` (rename to `<folder>-<page>-<kind>-<n>`).
3. Keep `<style>` and `<script>` untouched (must equal the shared block). Trim the icon sprite only if you want; add any missing `<symbol>`.
4. Link it: nav submenu + footer column on **all 36 pages** (§7.2), a card on its parent hub, `.related` on sibling pages.
5. `sitemap.xml`: add `<url><loc>https://testsandfunnels.com/<path>/</loc><lastmod>YYYY-MM-DD</lastmod><priority>…</priority></url>` (home 1.0, hubs/pillars 0.9, child pages 0.7).
6. `llms.txt`: add `- [Name](https://testsandfunnels.com/<path>/): one-sentence description`.
7. Run all checks in §8.

### 6.2 Filling a media slot

1. Put the file in `media/` (folder does not exist yet; create it). Name it exactly like the slot: `home-reel.mp4` + `home-reel-poster.jpg`.
2. On the `.vid` button set `data-src="/media/<slot>.mp4"` and `data-poster="/media/<slot>-poster.jpg"`; remove `data-ph`.
3. Replace the `.media.ph` span inside with `<img src="/media/<slot>-poster.jpg" alt="…" loading="lazy">` keeping the aspect-ratio class.
4. Delete the `.slot-note` paragraph for that block once all its slots are filled; replace `Client name / Role, company / @creator` with real, consented details.
5. Compress video (H.264 mp4, captions burned in), and images (WebP/JPEG, `loading="lazy"`, set aspect ratio class so layout does not jump).

---

## 7. Safe multi-file edit recipes

Save scripts **outside the repo** (for example the scratch directory), run from the repo root with `node <script>.js`. All of them list pages with:

```js
const fs = require("fs"), cp = require("child_process");
const pages = cp.execSync('git ls-files "*.html"', { encoding: "utf8" })
  .split("\n").filter(f => f && !f.startsWith("backend/"));   // 36 files incl. 404.html
```

### 7.1 Propagate the stylesheet (after editing `index.html`)

```js
const re = /<style[^>]*>[\s\S]*?<\/style>/;
const src = fs.readFileSync("index.html", "utf8").match(re)[0];
for (const f of pages) fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(re, () => src));
```
Note: this also resets the two pages that currently deviate (§9), which is probably what you want, but say so in your report.

### 7.2 Propagate header / footer (keeps each page's current-section marker)

```js
const reH = /<header[\s\S]*?<\/header>/, reF = /<footer[\s\S]*?<\/footer>/;
const home = fs.readFileSync("index.html", "utf8");
const srcH = home.match(reH)[0], srcF = home.match(reF)[0];
const esc = s => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
for (const f of pages) {
  const h = fs.readFileSync(f, "utf8");
  const cur = (h.match(reH)[0].match(/<a class="link" href="([^"]+)"[^>]*aria-current="page"/) || [])[1];
  const hd = cur ? srcH.replace(new RegExp('(<a class="link" href="' + esc(cur) + '"[^>]*)>'), '$1 aria-current="page">') : srcH;
  fs.writeFileSync(f, h.replace(reH, () => hd).replace(reF, () => srcF));
}
```
If you add a **new top-level nav item**, also set its `aria-current` on the new section's pages by hand.

### 7.3 Propagate the main script

Each page has three plain `<script>` tags (the `.js` class toggle, the `window.TF` config, and one large script holding both IIFEs) plus two `ld+json` tags. Only the large one contains `"use strict"`:

```js
const reS = /<script>[\s\S]*?<\/script>/g, isMain = s => s.includes('"use strict"');
const mainSrc = fs.readFileSync("index.html", "utf8").match(reS).find(isMain);
for (const f of pages) fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(reS, m => isMain(m) ? mainSrc : m));
```
`<script>` with no attributes never matches the `ld+json` tags. To change the config (`window.TF`), edit that one-line script the same way using `m.includes("window.TF")`.

### 7.4 Consistency check (run after any shared edit)

```js
const c = require("crypto"), md5 = s => c.createHash("md5").update(s).digest("hex").slice(0, 8);
const seen = {};
for (const f of pages) {
  const t = fs.readFileSync(f, "utf8");
  const css = (t.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
  (seen[md5(css)] ||= []).push(f);
}
console.log(Object.entries(seen).map(([k, v]) => `${k} x${v.length}${v.length < 5 ? " " + v.join(", ") : ""}`).join("\n"));
// Expect exactly ONE hash (36 pages). Repeat for the main script and the header/footer.
```

### 7.5 Internal link checker

```js
const path = require("path");
const ok = p => { p = p.split("#")[0].split("?")[0]; if (!p || p === "/") return true; const fp = p.replace(/^\//, "");
  return (fs.existsSync(fp) && fs.statSync(fp).isFile()) || fs.existsSync(path.join(fp, "index.html")); };
for (const f of pages) for (const m of fs.readFileSync(f, "utf8").matchAll(/(?:href|src)="(\/[^"]*)"/g))
  if (!ok(m[1])) console.log(f, "->", m[1]);
```

### 7.6 Testing the lead pipeline without polluting data

```bash
PORT=5055 node backend/server.js &            # note the pid
curl -s -X POST localhost:5055/api/leads/submit -H "Content-Type: application/json" \
     -d '{"name":"Test","phone":"+91 90000 00000","form_type":"audit","industry":"E-commerce"}'
curl -s localhost:5055/api/health
kill %1
git checkout backend/data/leads.json          # REQUIRED: submit writes a record into this tracked file
```

---

## 8. Definition of done (run before you report)

- [ ] Shared block identical across all 36 pages (§7.4) unless the task was page-specific.
- [ ] No em/en dashes introduced: `node -e` scan for `—`, `–`, `&mdash;`, `&ndash;` in changed files.
- [ ] No new colors, fonts, radii or shadows outside the tokens in [brandkit.md §3-5](brandkit.md).
- [ ] New/changed interactive element: keyboard works, has visible focus, `aria-*` correct, reduced motion respected.
- [ ] Page works at 375px, 768px and 1280px with no horizontal scroll (use the Browser pane: `resize_window` mobile/tablet/desktop).
- [ ] Links resolve (§7.5 shows only the known four from §9).
- [ ] New page is in nav, footer, sitemap, llms.txt, parent hub, and has canonical + JSON-LD.
- [ ] Backend change: `node backend/server.js` boots with and without MongoDB; `/api/health` OK; submit + list + update + delete + export tested; `leads.json` restored.
- [ ] Final report states what was **not** verified (for example no real MongoDB, no real device test).

---

## 9. Known issues (verified, not yet fixed; do not silently "fix" as a side effect)

**Security / privacy (highest priority)**
1. **Public lead leak.** `server.js` does `app.use(express.static(ROOT_DIR))` for the whole project root. A probe of the running server returned HTTP 200 for `/backend/data/leads.json` (all captured leads, names, phones, emails), `/backend/server.js` and `/backend/package.json`; `/.git/config` also returned 200. `/backend/.env` returned 404 only because Express ignores dotfiles. Fix idea: serve an allowlist (the page folders + `media/`) or deny `/backend` and dot paths before the static middleware; move `leads.json` outside the web root.
2. **Dashboard login is pre-filled** with `admin` / `admin@tandf2026` (`useState` defaults in `backend/public/dashboard/index.html`), and the same defaults plus the JWT secret are hard-coded as fallbacks in `authController.js`, `middleware/auth.js` and printed in `backend/README.md`. In production set strong `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` in `.env` and remove the fallbacks and the prefill. `bcryptjs` is installed but unused (password compared in plain text).
3. `backend/data/leads.json` is **tracked in git** and contains a test lead. Real leads would be committed. Add it to `.gitignore` and untrack it.
4. Public submit endpoint has no rate limit / CAPTCHA (honeypot is client-side only), accepts 10 MB JSON, stores the whole body in `raw_data`, and CORS reflects any origin with credentials.
5. CSV export does not neutralise spreadsheet formulas (cells starting `= + - @`), so a malicious lead can run formulas when opened in Excel. Search uses an unescaped `new RegExp(search)`.
6. JWT for CSV export is passed in the query string (`?token=`), which ends up in logs and history.

**Broken links on every page** (36 pages each)
7. `/production-house/product-and-lifestyle-shoots/` is in the nav, footer, `sitemap.xml` and `llms.txt` but the page does not exist.
8. `/privacy-policy/`, `/terms/`, `/refund-policy/` are linked from the footer, and every lead form says "Read our Privacy Policy". Pages missing, and the site collects personal data, so create them before launch.

**Content / design**
9. Two pages carry stray red overrides: `industries/index.html` (`.submenu{background:#d41c1c}`) and `locations/delhi/index.html` (`.agent-list span{color:#d50202}`). Probably leftover tests; confirm with the owner before resetting (§7.1 resets them).
10. All 145 media spots are placeholders; there is no `media/` folder, no logos, no real testimonials.
11. No analytics tag is installed even though events are pushed to `dataLayer`.

**Docs / ops**
12. Root `README.md` is stale (claims "zero runtime dependencies", Apache only, no backend). `backend/README.md` calls the dashboard "MERN" but React/Babel come from a CDN at runtime.
13. The Apache `.htaccess` hosting path cannot run the Node API. Decide the deployment target (Node host, or Apache + proxied `/api`) before relying on forms in production.
14. The dashboard shows only core fields; UTMs and form-specific answers (`raw_data`) are not visible or exportable (§4.4).

---

## 10. Quick reference

- Primary CTA everywhere: **Free Business Audit** -> `/free-business-audit/`
- Fonts: Outfit only. Colors: `--p800` ink, `--p600` links, `--grad` for primary actions.
- Section rhythm: white / `.tint` alternate; one `.cta-band` at the end of content pages.
- Add icon -> add `<symbol>` to that page's sprite.
- Page types and which sibling to copy: see `data-page-type` list in [brandkit.md §5.5](brandkit.md).
- Domain: `https://testsandfunnels.com` · Phone/WhatsApp: `+91 75079 94138` · Email: `admin@testsandfunnels.com`.
