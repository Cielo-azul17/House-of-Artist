# House of Artist — Astro build brief

Everything in this folder is the finished design for **House of Artist Entertainment LLP**,
exported from the Claude Design canvas where it was built over the past four days.

Your job is to turn it into an Astro site. The design is settled — don't redesign it.
Match what's here, pixel for pixel.

Live design canvas (for reference, if the client shares it):
https://claude.ai/artifact/MLSbVs3VRy7ox6KqPU2SGU

---

## 1. What's in this folder

```
handoff/
├── BRIEF.md              ← this file
├── pages/                ← the 8 pages as resolved static HTML (source of truth)
│   ├── index.html        Home
│   ├── services.html     Our services
│   ├── work.html         Our work
│   ├── associated.html   Associated work
│   ├── about.html        About us
│   ├── contact.html      Contact us
│   ├── privacy.html      Privacy policy
│   └── terms.html        Terms & conditions
├── overlays/
│   ├── loader.html       Intro animation (home page only)
│   └── player.html       Video lightbox (shared by 4 pages)
├── css/style.css         All shared styling, deduped (≈14 KB)
├── data/*.json           Content arrays behind the repeated sections
├── reference-js/*.js     The original page logic — port from it, don't ship it
└── img/                  Logo, loader art, banner photo
```

**`pages/*.html` are body fragments**, not whole documents — no `<html>`, `<head>` or `<body>`.
Drop one into a layout and it renders. Styling is almost entirely **inline `style=""`
attributes**; `css/style.css` carries only what inline styles can't express (hover,
media queries, keyframes, pseudo-elements). Keep it that way — don't refactor inline
styles into classes, you'll spend a day and change the design by accident.

---

## 2. Brand

**Fonts** — Montserrat for body, Playfair Display for headings. Load both:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
```

Headings use `font-family: 'Playfair Display', serif; font-weight: 500`, often with one
italic phrase in cyan or teal as an accent — that italic accent is a signature of the
design, keep it.

**Palette** (taken from the logo):

| Hex | Name | Used for |
|---|---|---|
| `#3FD0E6` | Logo Cyan | Accents on dark, primary button on dark, cursor |
| `#0B6E80` | Deep Teal | Accents on light, eyebrow text, active states |
| `#13232A` | Ink | Body text on light, primary button on light |
| `#0F1A1F` | Night | Dark section backgrounds |
| `#0B1418` | Darkest | Footer |
| `#F4FBFD` / `#EEF9FB` | Mist | Tinted light sections |
| `#4A5D64` / `#3E5259` | Slate | Secondary text on light |
| `#B5C7CC` / `#C4D4D9` | — | Secondary text on dark |

**Watercolour glows.** Dark sections carry 1–2 absolutely-positioned blurred radial
gradients. They drift slowly via `.hoa-glow` / `.hoa-glow-b` (28s and 37s loops, ±3%
translate, 0.93–1.09 scale). Both honour `prefers-reduced-motion`. Any section
containing one needs `position: relative` — and `overflow: hidden` **on a wrapper, not
the section itself** where a sticky child is involved (see §5, contact).

---

## 3. Buttons — only three

Do not invent a fourth.

| Class | Looks like | Where |
|---|---|---|
| `.btn-f` | Filled Ink `#13232A`, white text, pill | Primary on light backgrounds |
| `.btn-f.btn-f-cy` | Filled Cyan `#3FD0E6`, Night text, pill | Primary on dark backgrounds |
| `.btn-o` | Outline, 1px border, transparent | Hero only, as the secondary next to a filled button |
| `.tlink` | Text link, underline on hover | Inline "read more" style links |

Filled buttons lift 2px with a soft shadow on hover. Heights: 42px in the nav, 44–46px
in content. Don't add outline buttons outside the hero — that was a deliberate call.

---

## 4. Responsive rules

Three breakpoints, and the laptop layout is **final** — the client reviewed it at 1440px
and signed it off. Don't touch anything above 900px.

- **≤900px** — nav collapses to a hamburger (`.nav-toggle` shows, `.nav-links` becomes a
  drawer toggled by a class). Multi-column grids drop to one or two columns.
- **≤640px** — the phone layout. Type is clamped to a **strict 7-size scale** via
  `.m-pNN` utility classes: **30, 26, 20, 18, 16, 14, 12**. Nothing else. The client
  asked for exactly these seven and I audited every page to zero off-scale sizes —
  please keep that invariant, and if you add markup, tag it with an existing `.m-pNN`.
- Section vertical padding is forced to **40px** top and bottom on phone by
  `.hoa .m-sec` with `!important`. That's intentional — it overrides the fluid `clamp()`
  values used on larger screens.

Several sections become **swipe carousels on phone only** (CSS scroll-snap, showing 1.5
cards): Our services, How we work, Our expertise, and the work filter row. On laptop
they're grids. The carousel CSS is already in `style.css`.

---

## 5. Pages and their sections

### Home (`index.html`) — 8 sections
Hero → Showreel → What we do (4 across) → About us (dark, with the "First brief to final
bow" process bar) → Our services (4 cards) → Our work (filterable, 6 tiles) → Associated
work (6 reels + "View more") → Contact (two columns).

The contact section's **left column is sticky** (`.ct-sticky`, `top: 109px`) while the
form scrolls past it. Below 900px it reverts to static. Important: `position: sticky`
dies inside any clipping ancestor, so that section's glow is wrapped in its own
`overflow: hidden` div rather than the section being clipped. Preserve that structure.

### Our services (`services.html`)
Light hero → four alternating photo/text rows (Artist management, Event production,
Content creation, Brand collaborations) → three-step process → CTA.

**The four services and their order are identical on the home page, this page and the
About page.** The client specifically asked for that. If you change one, change all three.

### Our work (`work.html`)
Light hero → Selected projects (3×3 grid, filter pills) → dark full-width "artists'
independent work" banner over `banner-stage.jpg` → light CTA.

The light/dark/light rhythm is deliberate — this is the only page whose CTA is light.

### Associated work (`associated.html`)
Light hero → what "associated" means → reel grid → credits note.

**"Associated" has a specific meaning here**, in the client's words: *people who are
associated with HOA but are not the face of HOA — whatever they work on personally is
also kind of associated with HOA, but it is not an HOA project.* Credits, rights and
revenue belong to the artists. Don't blur that line in any copy you touch.

The credits box has exactly 36px above and 36px below. It was asked for twice.

### About us (`about.html`)
Hero → Our story → Our expertise (4 across) → Our approach (scroll timeline) → Meet the
team + Our founders → Selected highlights → CTA.

**Our story**: the two columns are height-matched — the photo stretches to fill the left
and the vision card sits at the foot of the right. Placeholder copy currently makes them
equal at 418px; with real copy the photo grows automatically. Keep `align-items: stretch`
and the photo's `flex: 1 1 auto; min-height: 230px`.

**Our approach** is a connected timeline: a vertical line fills as you scroll and each
step lights up as it's reached. This is the one piece I could never verify in a static
render — test it properly.

**Founders** are **Pranav Kare** and **Pushkar Kulkarni**. Portraits cap at 300px with a
40px stagger so both fit on one screen.

### Contact (`contact.html`)
Hero → How we can help → enquiry form → contact details. Same sticky-left-column
treatment as the home page's contact section.

The form has a **role switch**: "I'm a performer" / "I'm an organizer", and the fields
change per role. There used to be a third "I'm a brand" option — the client removed it,
don't bring it back.

### Privacy (`privacy.html`) and Terms (`terms.html`)
13 and 18 sections respectively, written against the Indian framework: **DPDP Act 2023 +
DPDP Rules 2025, IT Act 2000, IT (Intermediary Guidelines) Rules 2021, Consumer
Protection Act 2019**. Terms also has an 8-question FAQ accordion.

Both have a sticky table of contents on laptop and a two-column list on phone. Both carry
a visible note that a lawyer must review them before launch — **leave that note in place
until a lawyer actually has.** I am not a lawyer and neither are you.

---

## 6. Interactions — what needs to be a client island

Everything else is static HTML and should ship with zero JavaScript. Port these from
`reference-js/` — the logic is sound, the plumbing is canvas-specific.

Interactive elements in `pages/*.html` are already tagged with **`data-act="..."`**
attributes, and list items carry **`data-i="<index>"`**. Hook your islands to those
rather than re-deriving selectors.

| Island | `data-act` hooks | Behaviour | Hydrate |
|---|---|---|---|
| **Nav** | `menu-toggle`, `menu-close` | Toggles a class on `.nav-links`; icon swaps hamburger↔close; `aria-expanded` tracks state | `client:idle` |
| **Video player** | `play-work`, `play-assoc`, `play-highlight`, `play-showreel`, `player-close`, `player-prev`, `player-next`, `player-mute` | Light-theme lightbox. Playlist is contextual — opening a work tile steps through the *currently filtered* set. Single-item playlists hide arrows, counter and dots. Esc closes, ←/→ step, M mutes, swipe works on touch. Sound on by default. | `client:idle` |
| **Work filters** | `filter` (carries `data-filter`) | Show/hide cards by `data-cat`; active pill restyles; must also narrow the player's playlist | `client:visible` |
| **Carousels** | `svc-prev/next`, `proc-prev/next`, `exp-prev/next` | Phone only. Scroll-snap track, arrows scroll by one card, dots track position via a scroll listener | `client:visible` |
| **Contact form** | `role-performer`, `role-organizer`, `form-send` | Swaps field sets, validates, submits | `client:visible` |
| **FAQ accordion** | `faq-toggle` (Terms) | One panel open at a time | `client:visible` |
| **Scroll timeline** | — (uses `data-ref="tlRef"`, `tlFillRef`) | Line fills with scroll progress; steps activate as reached | `client:visible` |
| **Custom cursor** | — (`data-ref="dotRef"`, `ringRef`, `trailRef0..9`) | Cyan dot + ring that grows over links, with a 10-circle trailing comet. **Pointer-fine only** — never on touch. | `client:idle` |
| **Loader** | `skip-intro` | Watercolour logo bloom, ~3–3.5s, dissolves to white and fades into the page. **Home page only.** Give it a skip button and don't replay it on repeat visits. | `client:load` |
| **Back to top** | — | Floating button, appears after scrolling | `client:idle` |

The cursor and loader are the two things most likely to annoy on a real device. Gate the
cursor behind `(hover: hover) and (pointer: fine)` — the CSS already does, make sure your
JS does too.

---

## 7. Suggested structure

```
src/
├── layouts/Base.astro          head, fonts, style.css, Header, Footer, Player, Cursor
├── components/
│   ├── Header.astro            + Nav island
│   ├── Footer.astro
│   ├── Hero.astro              takes eyebrow, title, accent, lead, cta
│   ├── CtaBand.astro           light + dark variants
│   ├── WorkGrid.astro          + Filters island
│   ├── ReelGrid.astro
│   ├── ServiceRow.astro
│   └── islands/                Player.tsx, Cursor, Loader, Carousel, Timeline, Form
├── data/                       the JSON from data/
└── pages/                      index, services, work, associated, about, contact, privacy, terms
```

The header and footer are byte-identical across all 8 pages — extract them first, from
`index.html`. The hero on services/work/associated is one shared component with three
sets of copy. The CTA band is shared across six pages.

**Images.** Put `img/` into `public/img/`, then move the logo and banner to Astro's
`<Image>` for WebP and sizing. The logo PNGs are ~700 KB each and badly need it. Logo is
60px tall in the nav; `logo-light.png` is the white-text version for the dark footer.

---

## 8. Before it goes live

**Content.** 223 `[square-bracket placeholders]` across the 8 pages — photos, videos,
artist names, project titles, team roles, contact details, office address, LLPIN,
grievance officer, dates, payment terms. Every one needs a real value. Counts: home 61,
work 45, about 32, associated 31, terms 22, privacy 18, contact 10, services 4.

**Video.** Every thumbnail opens the player, but no real video is wired yet. The plan the
client settled on: **YouTube for most videos** (free, unlimited), **Vimeo for the
showreel**. Each item needs a video ID added to its data entry — the player frame
currently reads "YouTube video plays here" / "Vimeo video plays here" depending on the
item's `source` field. Use the privacy-enhanced domains (`youtube-nocookie.com`) and
facade-load the iframes so a page with nine thumbnails doesn't pull nine players.

**Form.** Submissions go to the HOA team. Nothing is wired — Formspree was the suggestion,
any endpoint works. Add honeypot + rate limiting.

**Legal.** A lawyer reviews Privacy and Terms before launch. Not optional.

**Domain.** houseofartist.in or .com, whichever is available.

**Also missing:** favicon, per-page `<title>` and meta description, Open Graph tags,
`sitemap.xml`, `robots.txt`, structured data (`Organization` + `LocalBusiness`).

---

## 9. Things the client has already decided

Pushing back on these will waste his time — he arrived at them over several rounds:

- Montserrat body, Playfair headings, logo-derived palette.
- Seven phone font sizes: 30 / 26 / 20 / 18 / 16 / 14 / 12.
- Three button styles, outline only in the hero.
- Four services, same four everywhere.
- Laptop layout is final — phone and tablet were tuned around it.
- Section padding was trimmed ~37% in two passes. It is as tight as he wants it.
- The loader runs 3–5 seconds total and must blend into the white page.
- The video player is **light theme only**. There was a dark version; it's gone.
- The cursor trail is 10 circles. Not 8, not 20.

He updates content himself, so **no CMS**. Keep content in `src/data/*.json` or
frontmatter — somewhere a non-developer can edit without touching markup.
