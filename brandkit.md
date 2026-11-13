# tests&funnels (t&f) Brand Kit

Single source of truth for how every page of the website looks, moves and reads.
Derived from the shipped CSS/JS (identical inline block in all 36 pages). If this file and the code disagree, the code wins, then fix this file.

Companion file: [agent.md](agent.md) (how the repo works and how to change it safely).

---

## 1. Brand in one paragraph

**tests&funnels (t&f)** is a Delhi AI agency that automates marketing, sales and operations with AI agents, a production house for realistic media, UGC, influencer marketing and personal brands, and a partner in **Incube8** (incubator backed by VivoCorp and GeMTech PARAS). Niches: **e-commerce brands, hospitals and clinics, personal brands.**
Personality: calm, precise, measured. Purple-and-grey, light surfaces, one dark gradient for emphasis. Confident without hype.

Core idea to repeat: **tests** (smart experimentation) + **funnels** (the journey built around the ideal customer). Funnel stages we always name in this order: **Impressions, Clicks, Leads, Sales, Revenue.**
Audit stages: **Visibility, Lead capture, Nurturing, Management, Retention.**
Process: **brief, audit, strategy and action plan, prerequisites and roadmap** (four steps).

### Fixed facts (never invent variants)

| Item | Value |
|---|---|
| Legal/brand name | `tests&funnels` (lowercase). Short form `t&f`. In HTML always `tests&amp;funnels` / `t&amp;f` |
| Wordmark | `<span>tests</span>&amp;funnels` where `tests` is the gradient purple span, `&funnels` is ink. Weight 800, tracking -.03em, 1.45rem |
| Phone / WhatsApp | `+91 75079 94138` , `tel:+917507994138` , `https://wa.me/917507994138` |
| Email | `admin@testsandfunnels.com` |
| Location | Delhi, India (`en-IN`, `og:locale en_IN`) |
| Primary CTA | **Free Business Audit** (link `/free-business-audit/`) |
| Site URL | `https://testsandfunnels.com` |
| Leadership (per about page) | Shrey Talreja, Soyam Aggarwal, Pinky Dhingra (Business Head) |

---

## 2. Voice and copy rules

These are enforced by the existing pages. Match them.

1. **No em dashes, no en dashes** anywhere (0 in all 36 pages). Use a comma, colon, period or "to" (`₹50,000 to ₹2,00,000`).
2. Short, plain sentences. Active voice. Lead with what the reader gets.
3. Headline pattern: light-weight sentence with the key phrase in `<strong>`: `AI agency for <strong>marketing, sales and operations</strong>.`
4. Sentence case for headings and buttons (`Get your Free Business Audit`). Proper nouns keep caps (Incube8, Meta, Shopify, Higgsfield).
5. CTA labels name the outcome: `Get your Free Business Audit`, `See the agents`, `See Incube8`. Link labels that lead somewhere end with the arrow glyph via CSS (`.more`), never type an arrow in text.
6. **Numbers**: `en-IN` grouping with ₹ and lakh/crore style (`₹2,00,000`, `₹27L+`, `5.28x ROAS`, `32.8K`, `1.5M`). Fees quoted as `₹40,000 + GST`.
7. **No fabricated proof.** Every figure needs a real source and date ("Public figures as of 12 Nov 2026"). Only the three published case studies carry results: Sparc Lights, Suit Up by Kailash Talreja, Ayurvishwa Healthcare.
8. **No ranking or outcome promises** (SEO/AEO/GEO copy literally says "No ranking promises"). Healthcare copy stays "within advertising rules".
9. Client names listed on the homepage marquee are the only ones that may be called "brands that have worked with us".
10. Placeholder copy for unfilled media is allowed only inside slot markup (`Client name`, `Role, company`, `@creator`). Never ship invented testimonials.
11. Meta title pattern: `<Topic> | tests&funnels`, under about 60 characters. Description 1 sentence, under about 160 characters.

---

## 3. Color

### 3.1 Tokens (declared in `:root`, copy exactly)

Brand scale (purple):

| Token | Hex | Use |
|---|---|---|
| `--p900` | `#2A2D3D` | deepest dark (footer, dark gradients start) |
| `--p800` | `#3A4050` | **default text / ink**, dark section base, `theme-color` |
| `--p700` | `#4B4580` | strong accents, gradient start, chip text |
| `--p600` | `#5A5391` | links, icons, hover text, `--purple-text` (AA on white) |
| `--p500` | `#6F68AE` | icon tint, hover fills |
| `--p400` | `#8781BD` | brand purple (`--purple`): dots, borders on hover, focus ring base |
| `--p300` | `#A9A4D2` | dashed borders, placeholder borders |
| `--p200` | `#CDCAE6` | selection, pills border, FAQ open border |
| `--p100` | `#E8E6F4` | card borders, chip borders |
| `--p50` | `#F4F3FA` | icon-chip bg, hover bg |

Neutral scale (cool grey):

| Token | Hex | Use |
|---|---|---|
| `--g50` | `#F7F7FA` | `.sec.tint` background, table hover |
| `--g100` | `#EFEFF4` | media placeholder base |
| `--g200` | `#E2E2EA` | card/table/FAQ borders |
| `--g300` | `#C4C4D2` | input borders |
| `--g500` | `#7A7D90` | fine print |
| `--g600` | `#5B5F73` | muted text (`--muted`) |
| `--g700` | `#454962` | secondary body text (`.intro`, `.lede`, card copy) |

Legacy aliases (still used by early components, same values): `--ink #3A4050`, `--ink-deep #2A2D3D`, `--purple #8781BD`, `--purple-text #5A5391`, `--lav #C4C4D8`, `--lav-soft #E6E6F0`, `--mist #F4F4F8`, `--muted #5B5F73`, `--signal #F28A1B`, `--wrap 1120px`.
**Prefer the `--p*` / `--g*` tokens in new code.**

Text on dark: `#fff` headings, `#d6d7e3` body, `#c9cad9` labels, `#b9bad0` fine print, `#cdcae6` chapter times.

Feedback colors (forms only):

| State | Background | Border | Text | Icon |
|---|---|---|---|---|
| Success `.form-msg.show` | `--p50` | `--p200` | `--p700` | gradient disc + white check |
| Error `.form-msg.err` | `#fde8e4` | `#f3b9ae` | `#7a2417` | `#c0392b` disc + `!` |
| Invalid field | bg `#fff7f6` | `#c0392b` | | |

**Signal orange `#F28A1B`**: reserved for the single "Revenue" dot in the funnel illustration. Do not use it for UI.

### 3.2 Gradients

```css
--grad:      linear-gradient(135deg,#4B4580 0%,#5A5391 45%,#7B74BB 100%);  /* buttons, icon discs, bars, step numbers */
--grad-soft: linear-gradient(135deg,#F4F3FA 0%,#E8E6F4 100%);               /* price card, training card, avatars */
Text gradient (h1/h2 strong, logo span, metric numbers, .big-word.t):
  linear-gradient(120deg,var(--p600),var(--p400)) with background-clip:text; color:transparent
```

Dark section recipes (reuse, do not invent new ones):

| Section | Background |
|---|---|
| `.process` | `radial-gradient(900px 480px at 100% 0,rgba(135,129,189,.32),transparent 60%), linear-gradient(160deg,#2A2D3D,#3A4050 60%,#3F3A6B)` |
| `.cta-band`, `.inc-card`, `.statband` | `radial-gradient(700px 320px at 90% 0,rgba(135,129,189,.42),transparent 60%), … linear-gradient(160deg,#2A2D3D,#3A3568)` |
| `.vsl` | two radial glows + `linear-gradient(160deg,#2A2D3D,#3A4050 55%,#3A3568)` |
| `footer` | `radial-gradient(900px 400px at 85% -10%,rgba(135,129,189,.28),transparent 60%), var(--p900)` plus 3px `--grad` top rule |
| Hero | `linear-gradient(180deg,#F6F5FB 0%,#fff 100%)` + blurred blobs + dot grid |

On dark gradient sections, `h2 strong` turns solid white (`-webkit-text-fill-color:#fff`), not gradient.

### 3.3 Elevation

```css
--shadow-sm: 0 1px 2px rgba(42,45,61,.05), 0 6px 18px rgba(42,45,61,.06);   /* resting cards, chips */
--shadow-md: 0 12px 32px rgba(42,45,61,.11);                                /* hover, open FAQ, floating */
--shadow-lg: 0 28px 70px rgba(42,45,61,.18);                                /* hero form, submenu, modal */
Primary button: 0 8px 22px rgba(90,83,145,.28) -> hover 0 14px 30px rgba(90,83,145,.36)
```

### 3.4 Selection / focus

`::selection{background:var(--p200);color:var(--p900)}`. Global `:focus-visible{outline:3px solid var(--purple);outline-offset:3px;border-radius:6px}`. Inputs use a 4px `rgba(135,129,189,.28)` ring and `--p600` border.

---

## 4. Typography

**One family: Outfit** (Google Fonts), weights 300, 400, 500, 600, 700, 800, `display=swap`. Fallback `system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
```

| Role | Size | Weight | Notes |
|---|---|---|---|
| Body | `1.0625rem` / 1.6 | 400 | color `--p800`, antialiased |
| Home h1 | `clamp(2.25rem,5.6vw,4.1rem)` | **300** | tracking -.035em, line-height 1.1 |
| Inner h1 | `clamp(2.1rem,4.6vw,3.35rem)`, max-width `19ch` | 300 | `h1.long`: `clamp(2rem,4.2vw,3.2rem)`, `21ch`, lh 1.08 |
| h2 | `clamp(1.85rem,3.8vw,2.85rem)`, max-width `24ch` | 300 | `.sec>.wrap>h2` gets a 44x4px gradient bar above it |
| h3 | 1.2 to 1.6rem | 700 | card titles 1.3 to 1.4rem |
| `strong` in h1/h2 | inherits | **800** | gradient text |
| Lede | `1.2rem` | 400 | `--g700`, max-width 34 to 40rem |
| Intro | 1.0625rem | 400 | `--g700`, max-width 38rem, margin-top 1rem |
| Eyebrow | `.8rem`, uppercase, tracking `.07em` | 700 | pill with pulsing dot |
| Small caps label | `.74` to `.85rem`, uppercase, `.06 to .08em` | 700 | `.sub-h`, `.contact-list b`, `.related h3`, `.pillar-n` |
| Fine print | `.85` to `.95rem` | 400 | `--muted` / `--g500` |
| Big word (`tests`/`funnels`) | `clamp(3.4rem,10vw,6.8rem)` | 800 | tracking -.045em, `.t` variant is gradient |

Rules: heading tracking is always negative (`-.02` to `-.045em`); light (300) for the sentence, heavy (800) only for the emphasised phrase; max one `<strong>` phrase per heading.

---

## 5. Layout

### 5.1 Container and rhythm

- `.wrap { width:min(100% - 2.5rem, 1120px); margin-inline:auto }` (1.25rem side gutters on mobile).
- Section padding `.sec`: `clamp(3.25rem,7vw,5.5rem) 0`. Alternate backgrounds: plain white then `.sec.tint` (`--g50`). Never two identical neighbours without a reason.
- Inner hero: `clamp(1.75rem,4vw,3rem) 0 clamp(2.5rem,5vw,4rem)`. CTA band: `clamp(2.75rem,6vw,4.25rem) 0`.
- Spacing units used: `.5 .75 1 1.25 1.5 1.75 2 2.5 2.75 3 3.5 4 rem`; grid gaps 1 to 1.75rem (cards), 2.5 to 4.5rem (two-column splits).
- Radii: pill `999px`; buttons pill; cards `22 to 28px`; big cards (`.inc-card`, `.train-card`, `.statband`) `32px`; inputs `14px`; small tiles `12 to 16px`.
- Smooth scroll with `scroll-padding-top:80px`; sticky header is 68px tall.

### 5.2 Breakpoints (mobile first, `min-width` unless noted)

Canonical set to reuse: **700, 860, 980, 992**.
Also present: 520, 560, 640, 760, 800, 820, 900, 920, 960, 1000, 1120 and `max-width` 991 / 859 / 700 / 640.
- `<992px`: desktop nav hidden, hamburger + slide-down drawer, bottom mobile action bar (`.mbar`) shown, header CTA hidden.
- `>=992px`: floating CTA (`.fcta`) allowed, `.hero-side` sticky at `top:92px` (>=980).
- `<=640px`: video testimonial grid becomes a horizontal scroll-snap rail (72% width cards).
- `<=700px`: floating chips hidden, video play button shrinks.

### 5.3 Grid vocabulary

| Class | Mobile | Desktop |
|---|---|---|
| `.cards.c2/c3/c4` | 1 col, then 2 col at 700 | 3 / 4 col at 980 |
| `.pillars.three` | 1, 2 at 760 | 3 at 1000 |
| `.split` / `.split.w` | stacked | 2 col `1fr 1fr` / `1.2fr 1fr`, gap 4rem at 860 |
| `.hero.inner .hero-grid` | stacked | `1.1fr .9fr`, gap 3.5rem at 980 (copy left, form right) |
| `.reel` / `.reel.flip` | stacked | `1.25fr .75fr` at 920 (flip swaps order) |
| `.steps-l` | stacked | 4 col at 860 (`.n3` for 3) with dashed connector |
| `.metrics` / `.proof` | 1 to 2 col | 3 col at 980 (`.m3`, `.p3`) |
| `.statband ul` | 2 col | 4 col at 860 |
| `.vsl-grid` | stacked | `1.5fr .9fr` at 1000 |
| `.infl` | 2 col | 4 col at 860 |
| `.bento` | 2 col | 4 col, `.b1` spans 2x2 at 860 (`data-n` = 3 to 6) |
| `.foot` | stacked | 3 col at 820, `1.5fr repeat(5,1fr)` at 1120 |

Always add `min-width:0` to grid children that contain media (already global for `.reel,.vec-band,.vsl-grid,.hero-grid`).

### 5.4 Z-index scale

`0 hero-bg` · `1 hero wrap` · `2 to 5 media overlays` · `50 header` · `55 fcta` · `60 mbar, submenu` · `61 mobile-nav` · `80 progress` · `100 skip link` · `120 modal`.

### 5.5 Page skeleton (every page)

```
<body data-page-type="…">
  svg sprite (hidden)           icons, see §7
  .progress#progress            3px scroll bar
  a.skip                        "Skip to content" -> #main
  header.site-header            logo, nav w/ submenus, .btn.sm "Free Business Audit", .menu-toggle
  nav#mobile-nav                filled by JS from the desktop nav
  main#main
    section.hero.inner          crumbs, .eyebrow, h1, .answer, .cta-row, chips | .hero-side (.hf form, .hero-peek)
    section.sec / .sec.tint …   content blocks (alternate)
    section.sec.relnav          .related links row (optional)
    section.cta-band            "Start with a Free Business Audit" (optional; the home, training, contact, audit, apply, partner and 404 pages omit it)
  footer                        brand block + 5 link columns + .legal
  .mbar                         Call / WhatsApp / Free Audit (mobile)
  .fcta#fcta                    WhatsApp + Free Business Audit (desktop, after scroll)
  .modal#modal                  video lightbox
  <script>window.TF=…</script> + shared JS
```

Page types (`data-page-type`): `home, hub, pillar, service, niche, case, work, about, process, audit, contact, apply, partner, training, location, error`. Use the closest sibling page as the template.

---

## 6. Components (class contracts)

Reuse these; do not write one-off CSS in a page.

**Buttons** `.btn` = gradient pill, 2px transparent border, min-height 50px in `.cta-row`, icon at right (`<svg class="ic ic-go">` slides 4px on hover). Variants: `.ghost` (outline ink, fills ink on hover), `.light` (white, for dark bands), `.sm` (header), `.wide` (full width). Sheen sweep via `::after` on hover. Disabled `opacity:.65; cursor:progress`. Text links: `.textlink`, `.more` (adds `→`).

**Header** sticky, `rgba(255,255,255,.86)` + `blur(14px) saturate(1.4)`; gains border + soft shadow after 8px scroll (`.scrolled`). Nav links 0.92rem/500 with a gradient underline that scales in on hover and for `aria-current="page"`. Submenus: 260px white card, radius 18, `--shadow-lg`, open on hover or `:focus-within`; group headings `.sub-h`.

**Hero** `.hero.inner` with `.hero-bg` (3 blurred circles `#CDCAE6 / #A9A4D2 / #E8E6F4` drifting + dot grid masked to fade). `.eyebrow` pill, `h1`, `.answer` (white card, 4px `--p400` left border) , `.cta-row`, `.chips` (icon pills), `.micro`.

**Hero lead form** `.hf` white card radius 28, `--shadow-lg`, 4px gradient tab on top edge, `.hf-ic` gradient square icon, `.hf-trust` dashed-top checklist.

**Cards**
- `.card-d` feature card: 1px `--p100` border, radius 26, `--shadow-sm`, `.ic-chip` icon square, optional `.pillar-n` numeral, `p.body`, bullet list with purple markers, `.more` link pinned to bottom. Hover: lift 6px, `--shadow-md`, border `--p300`, corner glow, dot appears, icon chip turns gradient and tilts -6deg. `.hi` = dark gradient `#3A4050 -> #4B4580` variant (one per group max).
- `.card-s` simple card: 1px `--g200`, radius 22, hover lift 4px.
- `.niche`, `.metric`, `.quote`, `.price`, `.steps-l li`, `.infl-card`: same border/radius/shadow family.

**Proof** `.proof.p3 a.metric`: `.name` (purple, small), `<b>` big gradient figure (uses `data-count` spans), supporting `<span>`. Always links to the case study.

**Lists** `.ticks` (check marks), `.ticks.dots`, `.pills`, `.chips`, `.chain` (arrow-separated funnel stages), `.stages` (tapering bars 100/94/88/82/76% on dark), `.next` (gradient dots).

**FAQ** `details` cards, radius 18, 32px round `+` that rotates 45deg when open; open state gets `--shadow-md` + `--p200` border. Page also ships matching `FAQPage` JSON-LD.

**Tables** `.tbl-wrap > table.tbl` (scrolls horizontally under 560px), header on `--p50`, row hover `--g50`.

**Dark bands** `.process` (numbered steps `.num` gradient discs joined by a 2px line), `.cta-band` (rotating dashed ring `::after`), `.statband` (4 stats with left rule), `.inc-card`, `.vsl`.

**Media**: see §9.

**Footer** `--p900`, 3px gradient top rule, brand block (`.logo`, `.foot-note`, contact list with icons, `.foot-social`), columns: AI agency, Production house, Services, Incubator and work, Company, then `.legal` © line with year filled by `#yr`.

**Mobile action bar** `.mbar` fixed bottom, frosted white, three equal buttons Call / WhatsApp / Free Audit, respects `env(safe-area-inset-bottom)`. Footer reserves `6rem` bottom padding on mobile for it.

**Floating CTA** `.fcta` (desktop only): round WhatsApp button + `Free Business Audit` button; appears after 560px scroll and hides while any `form[data-form]` is >=20% in view.

**Progress bar** `.progress`: fixed 3px gradient, `scaleX` driven by scroll.

---

## 7. Iconography

- Inline SVG sprite at the top of `<body>` (`<svg width="0" height="0" …>` with `<symbol id="i-…" viewBox="0 0 24 24">`).
- Use: `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-name"/></svg>`.
- Style: 24px grid, **stroke only**, `stroke-width:1.75`, round caps/joins, `currentColor`, no fills (exception: `i-play`, `i-reel` inner triangle use `fill="currentColor"`).
- `.ic` = `1.25em` square, `vertical-align:-.2em`. Chip icon 24px, form-header icon 22px, play icon 28px.
- Available on the homepage sprite: `arrow-right, bar-chart, bot, check-circle, film, globe, heart, layers, mail, map-pin, message, palette, phone, play, reel, rocket, send, shield, shopping-bag, sparkles, user, users, x`. If a page needs another, add a `<symbol>` in the same style to that page's sprite.
- No icon fonts, no emoji in UI (the admin dashboard is the only place emoji appear).

---

## 8. Motion

Easing token: `--ease: cubic-bezier(.2,.7,.2,1)` for anything that moves in. Simple fades use `ease`/`ease-out`.

| Interaction | Spec |
|---|---|
| Hover lift (cards) | `translateY(-6px)` + `--shadow-md`, `.3s var(--ease)`. `.card-s`, `.steps-l li`: -4px. Buttons: -2px, press returns to 0 |
| Button sheen | gradient highlight sweeps `-120% -> 120%` in `.6s var(--ease)` |
| Link underline (nav) | `scaleX(0 -> 1)` from left, `.3s var(--ease)` |
| Icon chip on card hover | gradient fill, `rotate(-6deg) scale(1.06)` |
| Card 3D tilt | pointer-fine devices only: `rotateX(-y*5deg) rotateY(x*6deg)` with `perspective(900px)`, resets on leave |
| Hero parallax | mouse position sets `--mx/--my` (-1..1); second blob translates `-26px * value` |
| Scroll reveal | below-the-fold elements get `.rv` (opacity 0, `translateY(26px)`), become `.in` at 12% visibility (`rootMargin` -6% bottom), `.8s var(--ease)`, stagger `--i * 80ms` (index capped at 5), `.rv` removed after 1.5s. Above-the-fold elements are never hidden (no flash). Targets: cards, metrics, steps, quotes, FAQ items, section h2/intro, bento tiles, reels, statband, etc. |
| Counters | `[data-count]` runs 0 -> value over **1500ms**, exponential ease-out, when 60% visible. Optional `data-prefix`, `data-suffix`, `data-dec`. Formats with `en-IN`. The final text is restored from the original markup |
| Funnel illustration | `.clean` path draws (`stroke-dashoffset 100 -> 0`, 1.5s, .5s delay); `.stage` dots pop (scale .5 -> 1, .4s) at .9/1.2/1.5/1.8s; labels fade in with the same delays |
| Logo marquee | `.mq-track` translates `-50%` linear **42s** infinite; JS duplicates children for a seamless loop; pauses on hover; edges masked with a gradient |
| Ambient loops | `drift` 18/22/26s (hero blobs), `ping` 2.4s (eyebrow dot), `float` 5 to 6.5s (placeholders, floating chips, vector art), `pulse` 2.6s (play rings), `spin` 40s (CTA ring), `dashmove` 14s (dashed vectors), `eq` 1s (audio bars) |
| Overlays | modal `fadein .25s` + box `rise .35s`; form message `rise .4s`; mobile drawer `.18s` fade/slide 8px |
| Mobile menu icon | 3 bars morph to X (`translateY(±7px) rotate(±45deg)`, middle fades) in `.2s` |
| Carousels | rails scroll 80% of container width per click, `scroll-snap`, smooth unless reduced motion |
| VSL player | progress bar `width` transition `.25s linear`; CTA unlocks at 30% progress (`opacity .45 -> 1`, glow ring) |

### Reduced motion (mandatory)

`@media (prefers-reduced-motion: reduce)` already: disables smooth scroll, all ambient animations, reveal transitions, counters (JS skips), tilt, parallax, marquee duplication, button sheen, and hover lifts. **Any new animation must be listed in that block or be gated behind the same JS check.**

Performance rules: animate only `transform` and `opacity` (plus `box-shadow` on hover); `will-change` only on blobs and tilt cards; no layout-thrashing scroll handlers (use `requestAnimationFrame` + `passive` listeners as the shared JS does).

---

## 9. Media and imagery

No stock photos. The site currently ships **zero real media files**: all 145 media spots are branded placeholders (`data-ph="1"`) with a written brief, ready to be swapped.

- Aspect ratio utilities: `.r-16x9 .r-9x16 .r-4x5 .r-1x1 .r-3x2 .r-4x3 .r-21x9`.
- `.media` (radius 22, `--g100` base) holds `<img>`/`<video>` with `object-fit:cover`.
- `.ph` placeholder = lavender radial blobs + diagonal hatch + dashed `--p300` border; `.ph.dark` = ink-to-purple gradient. Contains `.ph-art` (floating icon), `.ph-cap` with `.ph-chip` (slot label) and `.ph-brief` (what to shoot).
- Video: `<button class="vid r-16x9|r-9x16 [sm]" data-slot="…" data-title="…" data-brief="…" [data-portrait] [data-src="/media/x.mp4" data-poster="/media/x.jpg"]>` with `.vid-play` (white disc, double pulse ring) and `.vid-meta` (title + `.vid-dur`). Clicking opens the lightbox (`.modal-box.portrait` for 9:16).
- **Slot naming**: `{page-path-joined-with-dashes}-{kind}-{n}`, e.g. `services-performance-marketing-reel`, `production-house-ugc-vt-2`, `home-ugc-3`. Kinds in use: `reel, vt` (video testimonial), `ugc, creator, gallery`.
- Real assets go in `media/` (e.g. `home-reel.mp4` + `home-reel-poster.jpg`; the `media/` folder does not exist yet). Setting `data-src`/`data-poster` on the `.vid` makes the lightbox (or VSL player) play the real file. The thumbnail is still the `.media.ph` span, so swap that span for an `<img>` poster and delete the matching `.slot-note` paragraph when a slot is filled.
- Always include meaningful `aria-label="Play video: …"`, burned-in captions for video, and consent on file for testimonials.
- Logos: not yet supplied; the marquee uses a letter tile (`.mq-dot`) plus the client name.

---

## 10. Forms

Visual: label above field (600, .95rem), inputs `border:1.5px solid --g300`, radius 14, padding `.8rem 1rem`, hover border `--p400`, focus ring 4px purple glow, `:user-invalid` red. Custom select chevron (purple SVG). Submit is a full-width `.btn`. Fine print line under it links the Privacy Policy. Inline `.form-msg` (role=status, aria-live=polite) shows success or error.

Behavior contract lives in [agent.md §5](agent.md). Visual rules:
- Max 3 visible fields in the compact hero form (name, phone, one select); long forms (`audit`, `contact`, `incubation`, `training`, `partner`) use `.two` for 2-column rows at >=560px.
- Phone input: `type=tel`, `pattern="[0-9 +\-]{8,18}"`, placeholder `+91`.
- Honeypot `.hp` field (off-screen) named `company` on every form.

---

## 11. Accessibility baseline

- Skip link, `lang="en-IN"`, one `h1` per page, headings in order, `aria-labelledby` on sections.
- Landmarks: `header`, `nav` (labelled), `main#main`, `footer`.
- Decorative SVG/blobs: `aria-hidden="true"`; icons `focusable="false"`.
- Keyboard: submenus open on `:focus-within`; mobile menu closes on Escape; modal traps focus on the close button and restores focus on close; `aria-pressed` on filter chips; `aria-current="page"` on nav and breadcrumb.
- Touch targets >=44px (rail buttons 44, buttons 50, toggle 38 plus padding).
- Color contrast: use `--p600`/`--p800` for text on white, never `--p400` for body text. Do not put `--p300`/`--p400` text on `--g50`.
- Everything works without JS (JS adds the `.js` class first; reveal only hides when JS and IntersectionObserver exist).

---

## 12. Admin dashboard (`/backend/`, `/dashboard`)

Internal tool, **not on-brand by design today**: dark indigo theme, system font stack.

```
--bg #090d16  --card #121829  --card-hover #172138  --border #232d4b
--text #f0f4fc  --muted #8b99b5  --primary #4f46e5  --accent #06b6d4
--green #10b981  --amber #f59e0b  --red #ef4444
```

Status badges: New (cyan), Contacted (amber), In Discussion (violet), Converted (green), Closed (slate), each as 20% tinted bg + 30% border + light text. If this gets re-skinned, map to the `--p*`/`--g*` tokens and Outfit; keep status hues distinguishable.

---

## 13. Known deviations (fix or confirm before treating as brand)

1. `industries/index.html`: `.submenu{background:#d41c1c}` (bright red dropdown). Every other page uses `#fff`. Looks like a leftover test edit.
2. `locations/delhi/index.html`: `.agent-list span{color:#d50202}`. Every other page uses `#454962`. Same suspicion.
3. `--signal` token is declared but unused in CSS (the orange appears only inline in the funnel SVG).
4. Duplicate token systems (legacy + `--p*`/`--g*`) and several overrides of the same rules in one stylesheet (v2 block restyles the earlier block). Visual result is correct; just do not "clean up" by deleting the early block without a visual diff.
5. Footer and nav link to four pages that do not exist yet (see [agent.md §9](agent.md)).

---

## 14. Quick-start snippets

New section on a content page:

```html
<section class="sec tint" aria-labelledby="x-h">
  <div class="wrap">
    <h2 id="x-h">Short headline with <strong>the key phrase</strong></h2>
    <p class="intro">One or two sentences, max about 38rem wide.</p>
    <div class="cards c3">
      <article class="card-d">
        <span class="ic-chip" aria-hidden="true"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bot"/></svg></span>
        <h3>Card title</h3>
        <p class="body">One plain sentence.</p>
        <a class="more" href="/path/">Label</a>
      </article>
    </div>
  </div>
</section>
```

CTA band (end of page):

```html
<section class="cta-band" aria-labelledby="cta-h">
  <div class="wrap">
    <h2 id="cta-h">Start with a Free Business Audit</h2>
    <p>We collect your brief, audit your funnel and show where this service would move the numbers.</p>
    <div class="cta-row">
      <a class="btn light" href="/free-business-audit/" data-track="Get your Free Business Audit" data-pos="cta-band">Get your Free Business Audit<svg class="ic ic-go" aria-hidden="true" focusable="false"><use href="#i-arrow-right"/></svg></a>
    </div>
  </div>
</section>
```
