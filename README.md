# Balwinder Singh — portfolio

A light, warm, fast portfolio. Hero → selected work → journey → toolbox → proof → contact.

The page is one continuous 3D shot. Scroll position drives a camera through eight beats,
from a single node on a desk in a small room to a serverless system a hospital runs on.
There are no cuts: the same ~1800 points are rearranged from beat to beat, so the node
that opens the film is the node that ends it. Everything else is flat HTML, CSS, and
inline SVG, and the whole world is a background layer — remove it and the site is the
same flat, fast page it has always been.

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
| `beats.js` | The shot list: eight point arrangements, each with its camera |
| `world.js` | The rig — fixed canvas, scroll driver, damped camera, render loop |
| `styles.css` | The whole design system: tokens, layout, components, responsive rules |
| `index.html` | Document shell and section landmarks |
| `resume.html` | Standalone printable résumé, works without JavaScript |

## Design notes

**Palette.** Warm paper (`--paper`) rather than white, near-black warm ink, and six
accent colours. Each project and tool card owns one accent, set through a `--tone`
custom property, so colour identifies content instead of decorating it.

**The world is optional.** `world.js` is dynamically imported and never required. It
picks one of three tiers at load: the full world on desktop, reduced geometry with no
idle drift on phones, and nothing at all when WebGL is missing or the visitor prefers
reduced motion — in which case the hero falls back to the same static SVG it always
used. The page scrolls normally either way; nothing intercepts the wheel, and the
canvas takes no pointer events.

**It costs three draw calls.** Nodes are one `InstancedMesh`, edges one `LineSegments`,
dust one `Points`. Instance buffers are only rewritten when the morph actually advances,
and the render loop stops once nothing is left to settle. `MEASUREMENT` sets its drift
rate to zero, so a camera parked on that beat renders nothing at all.

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
