# Table Talks Australia — Direction Artistique (Design System)

Scraped and measured directly from the live Framer site (tabletalksaustralia.com.au) via computed styles and pixel sampling. This is the source of truth for rebuilding the site outside Framer — nothing here is invented.

## 1. Brand feel

Quiet, editorial, hospitality-led. White space does the talking: warm cream and white fields, documentary-style food/event photography, one restrained wine-red accent used sparingly for calls to action. Typography carries two registers — a serif display face for storytelling/editorial headlines, and a plain grotesque sans for everything structural (nav, UI, body copy). No dark mode, no gradients, no drop shadows, no decorative iconography beyond one sub-brand mark.

## 2. Color palette

| Token | Value | Usage |
|---|---|---|
| `--bg-white` | `#FFFFFF` | Primary page background |
| `--bg-cream` | `#F1F2E9` | Secondary/section background (hero surrounds, forms, footer) |
| `--bg-offwhite` | `#FEFEFA` | Tertiary background variant |
| `--bg-blush` | `#E8DBD8` | Placeholder/panel fill (avatar cards, image-less tiles) |
| `--text-primary` | `#000000` | Headlines, primary copy |
| `--text-secondary` | `rgba(0,0,0,0.8)` | Nav links, secondary copy |
| `--text-tertiary` | `rgba(0,0,0,0.6)` | Supporting copy |
| `--text-muted` | `rgba(0,0,0,0.4)` | Captions, de-emphasized paragraphs |
| `--text-faint` | `#999999` | Placeholder input text |
| `--accent` | `#7A2436` | CTA buttons, "Made by Many" sub-brand, links on dark |
| `--accent-hover` | `rgba(122,36,54,0.8)` | Hover/pressed state |
| `--black-section` | `#000000` | Dark sections (Missions "Public Ledger" module) |
| `--link-blue` | `#0099FF` | Rare inline hyperlink (legacy, minimal use) |

No dark-mode variant is meaningfully used — the site is light-only.

## 3. Typography

Two type families, used deliberately for different jobs. No Google Fonts CDN needed for the sans (Arimo is metric-compatible with Arial and is a free Google Font); the serif can ship as a system stack.

```css
--font-display: "Times New Roman", Georgia, "PT Serif", serif;   /* editorial headlines only */
--font-sans: "Arimo", Arial, Helvetica, sans-serif;               /* everything else */
--font-ui-accent: "Roboto", sans-serif;                            /* overlay card titles on photos only */
```

**Display serif** — used ONLY for the big magazine-style headline on Journal/article pages (e.g. "Service Rewritten: Redefining the way we dine.", "The Greatest Lie We Were Ever Sold Was That We Were Meant to Stand Alone"):
- Weight 400, size ~45–60px (responsive), line-height ~1:1 (tight/leading-none), letter-spacing ~ -1.8px at 60px
- Italic used inline for emphasis inside these headlines/pull-quotes

**Sans (Arimo)** — used for section headers, body copy, nav, footer, forms, buttons:
| Role | Size | Weight | Line-height | Notes |
|---|---|---|---|---|
| Section H1 (e.g. "News", "Our Philosophy") | 35px | 400 | 42px | |
| Lead paragraph / subhead | 20px | 400 | 24px | |
| Secondary paragraph | 16px | 400 | 22.4px | often at `--text-muted` |
| Card/section label (e.g. "Featured Experiences") | 20px | 400 | 24px | |
| Nav link | 12px | 400 | 16.8px | `--text-secondary` |
| Caption / byline | 12px | 400 | 14.4px | |
| Body base (root) | 12px | 400 | normal | Framer default root size |

**Roboto** — reserved for white overlay titles on the dark "Featured Experiences" photo cards (14px/19.6px, weight 400, white).

## 4. Shape & spacing

- Border-radius: **10px** standard (buttons, image containers, inputs); occasional **50px** full-pill radius for small circular elements
- Buttons: solid fill, no border, 10px radius, ~240×40px for primary CTA
- No box-shadows anywhere on the live site
- Generous vertical whitespace between sections (roughly 80–160px on desktop)
- Content is centered in a single column with a comfortable max-width; card grids run 3-up (Featured Experiences, About pillars) or 4–5-up (Philosophy pillars)

## 5. Imagery

- Full-bleed, high-quality documentary/editorial photography (food close-ups, long dinner tables, garden/venue settings) — warm, natural light, earthy tones that harmonize with the cream background
- Dark, low-key photos are used specifically for the "Featured Experiences" teaser cards and the Journal/archive case-study template, with a subtle dark gradient/overlay so white text sits on top
- No illustration, no iconography beyond the "Made by Many" mark and a hamburger/search glyph in nav

## 6. Brand marks

- **Primary wordmark**: "TABLE TALKS" — plain grotesque caps, letter-spaced, dark gray/black, no icon
- **Sub-brand mark ("Made by Many")**: two overlapping rounded squares (near-black `#1B1D1F` behind, `#7A2436` maroon in front), paired with "MADE BY MANY" wordmark set in the accent maroon

## 7. Buttons & inputs

- Primary CTA: `background: #7A2436`, white text, 10px radius, no border (e.g. "Join mission 001")
- Secondary/form submit: solid black fill, white text, 10px radius (e.g. "Submit" on Subscribe)
- Text inputs: light gray fill (~`#E5E5E5`–`#EFEFEF`), no visible border, 10px radius, `#999` placeholder text

## 8. Layout chrome (present on every page)

**Header**: logo left ("TABLE TALKS" wordmark, links home) · nav right (`About` / `Journals` or `Studio` / `Up Next`) · search icon · hamburger on mobile. White background, sits flush at the top, no shadow.

**Footer** (identical across all pages): 
- "TABLE TALKS" wordmark centered
- 3 nav columns: **EXPERIENCES** (Upcoming, Exclusive events, Australia events, IAO events) · **PLATFORM** (How it works, Participate, Become a partner) · **MADE BY MADE (by TABLE TALKS)** (What is Made by Many?, Siargao Cookbook — IAO Edition, Join the waitlist)
- Right column: Made by Many mark + "Some of the world's most extraordinary recipes have never been written down." blurb + email capture + maroon "Join mission 001" button
- Bottom bar: social icons (Instagram + one other) · © copyright · Contact / Join / Feedback / Careers links · search icon
- Background: cream/white, black text — not a dark footer

## 9. What NOT to carry over

- Framer's atomic CSS classes, `--token-*` CSS variables, and per-breakpoint duplicated DOM (Framer renders the same content 2–3× for responsive variants) — none of this is needed in a hand-built site
- The "Missions" / Made by Many sub-pages contain visible placeholder content (`[ insert ]` text, blank avatar images) — this is unfinished draft content on the live site, not a design pattern to replicate; flagged in the context doc.
