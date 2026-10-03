# crazygamer09.github.io

Personal profile site for **Durvesh Panchbhai** — Software Engineer, Mumbai.

Live: https://crazygamer09.github.io

## Stack

Hand-written HTML, CSS and vanilla JavaScript. No build step, no dependencies,
no framework. Push to `main` and GitHub Pages serves it directly.

## Design

Manga-ink aesthetic — ink-black ground, bone-white type, halftone screens, hard
panel borders with offset shadows, speed lines. Three switchable accent themes
(the 呪 / 死 / 螺 buttons in the header), persisted to `localStorage`:

| Theme | Accent |
|---|---|
| `cursed` | violet / indigo |
| `note`   | crimson / gold |
| `chakra` | orange / amber |

All artwork is original CSS and SVG. No third-party character art is used.

## Layout

```
index.html                      single page, all sections
assets/css/style.css            tokens → base → components → responsive
assets/js/main.js               theme, scroll spy, reveals, canvas, typewriter
assets/img/favicon.svg          enso + D mark
assets/img/og.png               1200×630 link-preview card
assets/Durvesh_Panchbhai_Resume.pdf
.nojekyll                       tell Pages to skip Jekyll processing
```

## Editing

- **Content** — all copy lives in `index.html`; sections are commented.
- **Colours** — the `:root` and `html[data-anime="…"]` blocks at the top of `style.css`.
- **Typewriter lines** — the `LINES` array in `main.js`.
- **Power bars** — each `.power` element's `data-level` (0–100) drives the meter;
  the visible number is the `.power-val` text.
- **Stat count-ups** — `data-count` / `data-prefix` / `data-suffix` on the `<b>` elements.

## Run locally

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

```sh
git add -A && git commit -m "update" && git push
```

GitHub Pages is configured to deploy from `main` / root. Changes are live in
about a minute.

## Accessibility & performance

Semantic landmarks, skip link, visible focus rings, `aria-pressed` on the theme
switcher, `prefers-reduced-motion` disables the canvas and all animation, and a
print stylesheet strips the chrome. Zero JS dependencies; the page is fully
readable with JavaScript disabled.

## Easter egg

Type `domain` anywhere on the page.
