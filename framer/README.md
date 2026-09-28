# Portfolio → Framer Migration Kit

Rebuild of the Prachiti Kamle portfolio (currently a static HTML/CSS site on Netlify) in Framer.

## 1. Executive summary

| | |
|---|---|
| **Scope** | 6 pages: Home, About, 4 case studies (IBM, Adobe, Haven, WoPet) + resume PDF |
| **Source size** | ~1,800 lines of HTML/CSS/JS · 60 image assets · 1 PDF |
| **Complexity** | Low–moderate. ~90% maps to native Framer features; 2 interactions need small code components (included) |
| **Estimated effort** | 12–18 designer hours across 4 phases (see §6) |
| **Main risk** | Case studies are art-directed (grids, fan stacks, stat boxes). Forcing them into one CMS template causes layout loss, so this kit recommends a hybrid model (§3) |
| **Cutover** | Keep Netlify live until Framer passes QA, then move DNS. Rollback = revert DNS |

**Why Framer:** visual editing without code (the owner can update copy/projects directly), built-in CMS, hosting, SEO controls, and native scroll/hover animations that replace `main.js`.

## 2. What's in this kit

```
framer/
├── README.md                  ← this playbook
├── source/                    ← original site, unchanged (the reference build + all assets)
│   ├── images/…               ← upload to Framer Assets panel
│   └── resume.pdf
├── cms/projects.csv           ← import into a Framer CMS collection "Projects"
├── content/<slug>.md          ← copy deck per case study, with [Component: …] markers
├── code-components/
│   ├── IntroStamp.tsx         ← first-visit stamp intro animation
│   └── TapeLabel.tsx          ← yellow duct-tape section label
└── tools/extract.py           ← regenerates cms/ + content/ from source/
```

Regenerate content after edits to `source/`:

```bash
pip install beautifulsoup4
python3 framer/tools/extract.py --base-url https://<public-host>/framer/source
```

`--base-url` makes image columns absolute URLs so Framer's CSV importer can pull images automatically. If the repo is private, skip it and attach images by hand in the CMS (only 8 image cells).

## 3. Architecture decision: hybrid CMS

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. All static pages** | Full layout control | Project cards duplicated by hand; adding a project touches 3+ places | Acceptable, not scalable |
| **B. Everything in CMS** (one detail template) | Add a project by filling a form | Rich text can't hold stat rows, fan stacks, 2-col layouts, Figma embeds → visible design regression | ✗ |
| **C. Hybrid** (recommended) | CMS drives the Home grid, metadata, and next-project links; each case study body stays art-directed | 4 detail pages to design (one-time) | ✅ |

Implementation of C: create the `Projects` collection from `cms/projects.csv`. Build the Home grid as a Collection List. Build **one** detail page template for the shared header (hero, title, meta grid, next link). Lay out each body from `content/<slug>.md` using the reusable components in §5. Framer supports conditional visibility per slug, or you can make 4 static pages at `/work/<slug>` that bind header fields to CMS. The `Body` column holds a rich-text fallback if you want option B later.

## 4. Design system (set up first, in Framer **Assets → Styles**)

### Colors

| Token | Hex | Use |
|---|---|---|
| Background | `#F9F9F9` | Page bg (with dot grid, see below) |
| Card | `#FFFFFF` | Thumbnails, cards |
| Navy | `#182449` | Headings, body emphasis, icons |
| Navy Soft | `#33406B` | Secondary headings |
| Gray Text | `#6B7280` | Paragraphs |
| Line | `#E3E0D8` | Borders |
| Blue | `#3D6BF5` | Footer bar, filled stat box, links |
| Blue Dark | `#2C52D6` | Hover |
| Yellow | `#F0DD8C` | Active nav pill |
| Yellow Soft | `#F7ECC0` | Nav hover |
| Tape | `#F7ECAB` | TapeLabel |
| Orange | `#E8622C` | Highlight |
| Pink Text | `#D6247A` | Highlight, Haven logo |
| Light Blue | `#A9DBEA` | Alt heading marker |

**Dotted background:** page fill `#F9F9F9` + an overlay with CSS `radial-gradient(circle, rgba(24,36,73,.16) 1px, transparent 1.5px)` at `24px 24px`. In Framer: Page → Fill → Image using a 24×24 dot PNG tiled, or an Embed/Code override with that CSS.

### Typography (Google Fonts, all available in Framer)

| Style | Font | Weight | Size (desktop) |
|---|---|---|---|
| H1 case title | Poppins | 600 | 30 |
| H2 section | Poppins | 600 | 20 (with highlighter marker, see §5) |
| H3 card title | Poppins | 600 | 22 |
| Nav | Poppins | 600 | 13, tracking 6% |
| Body | Jost | 400 | 16, line-height 1.6 |
| Contact lead | Jost | 400 | 17, Navy |
| Label / tag line | Sometype Mono | 400 | 11, uppercase, tracking 8% |
| Tape label | Sometype Mono | 700 | 15 |
| Stat number | Poppins | 700 | 28 |

### Layout

- Content max width **1040px**, 24px side padding.
- Breakpoints: Desktop 1200 · Tablet 810 (source breaks at 720/640) · Phone 390 (source breaks at 480).
- Radii: card 12–14, thumbnail 12, image 10, footer top corners 28, nav pill 20.
- Shadows: card `0 4 20 rgba(24,36,73,.10)` → hover `0 18 36 rgba(24,36,73,.20)`.

## 5. Component inventory

| Component | Source class | Build in Framer | Variants / interactions |
|---|---|---|---|
| **Header** | `.site-header` | Native: stamp logo + 3 nav links | Link state *Active* (yellow pill), hover (soft yellow, y −1). Phone: hamburger → dropdown card |
| **Footer** | `.site-footer` | Native: blue bar, 28px top radius | Links underline on hover |
| **StickyBoard (hero)** | `.sticky-board` | Native: absolute-positioned images, rotations: nametag −6°, pink note 7°, blue card −4°, coffee stain (multiply, 85%) | Hover each note: y −4, rotate 0. Two variants: *Home* and *About* (with headshot). Exact px positions in `source/css/style.css` lines 205–302 |
| **TapeLabel** | `.featured-tag` | Code component `TapeLabel.tsx` | Text + rotation props |
| **ProjectCard** | `.project-card` | Native, bound to CMS | Hover: image blur 3px + brightness 82% + scale 1.04; "See case study →" pill fades in; shadow deepens. Appear: fade + y 24 |
| **SectionHeading** | `.case-section h2` | Native text + absolutely positioned rect behind lower 40% | Alternate yellow `rgba(240,221,140,.55)` / blue `rgba(169,219,234,.55)`, ±0.6° |
| **MetaGrid** | `.meta-grid` | Native 4-col stack (2-col on phone) | Role / Timeline / Tools / Category |
| **StatRow** | `.stat-row` | Native | *Filled* (blue bg, white) / *Outline* (white, blue number) |
| **ImageGrid** | `.img-grid` | Native grid 2-col (3-col variant) | 1-col on phone |
| **ImageStack**, **TwoColumn**, **Reflection** | same | Native stacks | Reflection image 160px fixed |
| **FanStack** | `.fan-stack` | Native: 3 absolute images | Hover: outer two spread ±6px, center lifts 8px |
| **QuoteRow** | `.quote-row` | Native 3 cards | Stars `#D8A300` |
| **Figma Embed** | `.figma-embed` | Framer **Embed** component, URL from `content/<slug>.md` | 16:9-ish container |
| **IntroStamp** | `#intro-overlay` | Code component `IntroStamp.tsx`, Home only | Once per session; skipped under reduced motion |
| **Scroll reveal** | `main.js` IntersectionObserver | Native **Appear** effect: opacity 0→1, y 20→0, 0.6s, trigger once | Replaces all JS; no code needed |

Adding a code component: Framer → Assets → Code → **+ New component**, paste the `.tsx` file contents, then drag it onto the canvas.

## 6. Phased execution plan

| Phase | Deliverable | Est. hours | Exit criteria |
|---|---|---|---|
| **1. Foundation** | Color + text styles, breakpoints, assets uploaded, Header/Footer, 2 code components | 3–4 | Styles match §4; header/footer on all pages |
| **2. Home + About** | StickyBoard (2 variants), CMS import, Project card grid, About collage + contact | 4–5 | Pixel comparison to live site at 1200/810/390 |
| **3. Case studies** | Detail header bound to CMS; 4 bodies built from `content/*.md` | 4–6 | All copy + images present; embeds load |
| **4. QA & launch** | SEO, redirects, performance, DNS cutover | 1–3 | Checklist below 100% |

## 7. URL map & SEO (preserve existing links)

| Current (Netlify) | Framer path | Title tag |
|---|---|---|
| `/index.html`, `/` | `/` | Prachiti Kamle — UI/UX Designer |
| `/about.html` | `/about` | About — Prachiti Kamle |
| `/work/ibm.html` | `/work/ibm` | Experience Design @ IBM — Prachiti Kamle |
| `/work/adobe.html` | `/work/adobe` | Performance/Product Marketing @ Adobe — Prachiti Kamle |
| `/work/haven.html` | `/work/haven` | Haven — Prachiti Kamle |
| `/work/wopet.html` | `/work/wopet` | Redesigning Wopet — Prachiti Kamle |
| `/work` | `/` (301) | — |
| `/resume.pdf` | Upload PDF as asset; link nav "RESUME" to it (new tab) | — |

Add each `.html` → clean path as a 301 in **Site Settings → Redirects** so shared links and search rankings survive. Copy meta descriptions from the `<head>` of each `source/*.html`. Favicon: `source/images/logo-stamp.svg` (fallback `favicon.png`).

## 8. QA & launch checklist

- [ ] All 60 images present, alt text copied (alt text lives in `content/*.md` and the CSV)
- [ ] Visual parity at Desktop / Tablet / Phone vs. live Netlify site
- [ ] Hover states: nav, project cards, notes, fan stack, icon links
- [ ] IntroStamp plays once per session; off with *Reduce motion* enabled
- [ ] Keyboard nav works, focus visible; mobile menu opens/closes
- [ ] Both Figma prototype embeds load
- [ ] `mailto:kprachiti@gmail.com` and LinkedIn links work
- [ ] Resume opens in new tab
- [ ] All 7 redirects in §7 return 301
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 (baseline the Netlify site first for comparison)
- [ ] Security headers: Netlify set `X-Frame-Options: DENY`, `nosniff`, `strict-origin-when-cross-origin`. Framer manages headers itself, so this is an accepted change to note
- [ ] Custom domain connected in Framer → DNS updated → SSL active
- [ ] Netlify site kept (paused, not deleted) for 30 days as rollback

## 9. Known gaps vs. source (decisions to make)

1. **Page zoom-in during intro.** The source also fades/scales the whole page in behind the stamp. Framer: add an Appear effect (opacity 0, scale 1.06, delay 1.05s) on the Home page's top-level stack, or accept the simpler version.
2. **Highlighted inline words** (orange/pink/blue bold) need manual color styling in Framer text. They're marked `**word**{color}` in `content/*.md`.
3. **Security headers** are fixed by Framer hosting (see checklist).
