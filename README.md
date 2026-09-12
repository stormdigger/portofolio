# Balwinder Singh — portfolio

A light, warm, fast portfolio. Hero → selected work → journey → toolbox → proof → contact.

The page is one request. Scroll moves a camera down a corridor past eleven hops — from
`GET /balwinder-singh` at the top, through every service in the career in the order it
was built, to `200 OK` at the bottom. The route is not a metaphor borrowed from
somewhere else: the hops are the real `flow` arrays already in `data.js`
(`Patient → API Gateway → Lambda → PostgreSQL`).

Copy at a hop is anchored *into* the corridor rather than laid over it — ordinary HTML,
given one transform per frame computed from the same camera that draws the world. It is
still selectable, searchable and reachable by a screen reader; the scene only decides
where it goes. Remove the world and the site is the same flat, fast page it has always
been.

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
| `route.js` | The route: eleven hops, their formations, and where each one's copy pins |
| `anchor.js` | Projects a 3D point to screen coordinates and drives one HTML block |
| `motion.js` | Content choreography — entrances, parallax, spread, split headings |
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

**The content is choreographed too.** `motion.js` runs one rAF loop over only
the elements currently on screen and writes numbers into custom properties
(`--enter`, `--p`, `--draw`, `--vel`); every transform is composed in `styles.css`.
Headings uncover a word at a time, project rows rise and wipe open, toolbox and
stat cards start gathered at one measured point and spread into their grid, and
the journey draws its own spine. Entrances latch: once an element arrives it gets
`.is-in`, which is also what turns its transition back on so hover states animate
without smearing the entrance.

**Nothing moves but the camera.** A request travels, it does not morph, so the point
budget is split between the hops and each group is parked at its own depth. Positions are
written to the GPU once at load and never touched again: a frame is a camera update, an
anchor pass, and two draw calls. The loop stops once nothing is left to settle.

**Depth comes from fog.** On a light background there is no darkness to recede into and
no glow to fall off. Fog set to the page's own `--paper` does it — distance dissolves
into the background as if the paper were air — and it is tight on purpose, because it
has to close before the next hop comes into view or a formation two hops ahead reads as
clutter behind the copy you are reading.

**Hops are tied to the document, not to a scroll percentage.** Each hop with a section of
its own records the scroll offset where that section is centred, and hops in between are
spread evenly across the gap. Sections can grow or shrink and the camera stays with them.

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
