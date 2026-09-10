# Balwinder Singh — portfolio

A light, warm, fast portfolio. Hero → selected work → journey → toolbox → proof → contact.
One 3D moment in the hero; everything else is flat HTML, CSS, and inline SVG.

## Run locally

Requires Node.js 20 or newer.

```sh
cd portofolio
npm install
npm run dev
```

Open http://localhost:4173. No build step, no bundler, no API keys. Three.js and the
fonts are vendored in `assets/`.

## Build

```sh
npm run build     # static site in dist/
npm test          # screenshots + overflow/console check at 5 viewports
```

`npm test` needs the dev server running. If Playwright cannot find Chromium, run
`npx playwright install chromium`. Screenshots land in `shots/`.

## Source map

| File | Purpose |
| --- | --- |
| `data.js` | Every fact on the site: profile, projects, chapters, toolbox, achievements |
| `app.js` | Renders each section, wires the dialog, nav, scroll reveal, and hero mount |
| `diagrams.js` | Animated inline-SVG architecture diagrams, one per project |
| `hero3d.js` | The hero's rotating node network (Three.js) |
| `styles.css` | The whole design system: tokens, layout, components, responsive rules |
| `index.html` | Document shell and section landmarks |
| `resume.html` | Standalone printable résumé, works without JavaScript |

## Design notes

**Palette.** Warm paper (`--paper`) rather than white, near-black warm ink, and six
accent colours. Each project and tool card owns one accent, set through a `--tone`
custom property, so colour identifies content instead of decorating it.

**The 3D is optional.** `hero3d.js` is dynamically imported, only animates while the
hero is on screen (IntersectionObserver), and pauses on tab blur. If WebGL is missing
or the visitor prefers reduced motion, the module is never loaded and a static SVG
renders instead. Nothing else on the page depends on it.

**Diagrams over decoration.** Each project card shows the actual request path — the
travelling pulse follows the same `flow` array printed in the case study. Motion is
pure CSS, so `prefers-reduced-motion` disables it and no JavaScript runs per frame.

**Responsive.** Verified at 1440, 1280, 820, 390, and 320px with no horizontal
overflow and no console errors. Tags wrap, the header sheds its CTA then its surname
as width runs out, and the project grid collapses to a single column at 980px.

## Content

All career, project, and research claims come from the supplied brief. Repository
links, publication DOIs, and live project URLs were not supplied, so the site does not
invent them — add them to `data.js` when available. The contact button opens a
pre-filled `mailto:`, which needs no backend.

Font licences are in `assets/`. Three.js and its MIT licence are in `assets/vendor/`.
