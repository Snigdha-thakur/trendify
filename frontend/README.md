# Trendify — Creator Monetisation Platform

Premium SaaS landing page for Trendify, built with vanilla HTML, CSS, and JavaScript.

## Project Structure

```
trendify-site/
├── index.html          # Main landing page
├── css/
│   └── styles.css      # All styles (design tokens, layout, animations)
├── js/
│   └── main.js         # GSAP animations, cursor, interactions, live ticker
├── assets/             # Place any custom images/icons here
└── README.md
```

## External Dependencies (CDN)

- **GSAP 3.12.5** + ScrollTrigger — scroll animations
- **Google Fonts** — Cormorant Garamond, Syne, DM Mono

Both are loaded via CDN in `index.html`. No npm install required.

## Running Locally

Just open `index.html` in a browser, or serve with any static server:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve .

# VS Code
Use the Live Server extension
```

## Customisation

| What               | Where                              |
|--------------------|------------------------------------|
| Brand colors       | `:root` variables in `styles.css`  |
| Hero headline      | `#hero` section in `index.html`    |
| Stats & metrics    | `.hs-item` elements in `index.html`|
| Pricing            | `#pricing` section in `index.html` |
| Live TX ticker     | `txData` array in `js/main.js`     |
| Testimonials       | `#voices` section in `index.html`  |
| Animation timing   | GSAP `tl` timeline in `js/main.js` |

## Key Design Decisions

- **Cormorant Garamond** — luxury editorial serif for headlines
- **Syne** — geometric sans for UI labels and nav
- **Dark luxury palette** — deep void black, layered violet/aqua/gold accents
- **GSAP ScrollTrigger** — all scroll animations, no IntersectionObserver
- **Editorial asymmetry** — alternating row layouts in ecosystem section
- **Custom cursor** — dual-layer with magnetic lag ring

Built to Awwwards standard. Fully responsive down to 375px.
