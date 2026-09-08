# A universe of questions

Balwinder Singh's portfolio is a continuous 3D journey through twelve memories and engineering systems. Scroll moves the camera. A field of 11,000 particles changes shape between worlds, and a single illuminated path runs through the story.

## Run locally

Requires Node.js 20 or newer.

```sh
cd portofolio
npm install
npm run dev
```

Open http://localhost:4173. The runtime assets, including Three.js and fonts, are bundled locally. The site does not need an API key or external service.

## Explore

- Scroll to travel. Use the bottom timeline or chapter menu to jump between memories.
- Hold Space to pull the scene apart. Release it to rebuild. The on-screen button toggles the same effect with a mouse or touch.
- Enter a project through its 3D doorway or its labeled button. Project notes appear beside the project world. Closing them restores the story position.
- In Arovita, select **Send a request** to follow an illustrative patient request through API Gateway, Lambda, and PostgreSQL.
- Select tools in the workshop to highlight their nodes. Arrow keys move between tool tabs.
- Open **Quick view** for professional details and a printable résumé.
- Sound starts off. The sound control enables locally synthesized ambient audio.

## Build and verify

```sh
npm run build
npm test
```

The build writes a static site to `dist/`. Serve or deploy that directory with any static host. Run the local server before running tests. If Playwright cannot find Chromium, run `npx playwright install chromium` or set `CHROMIUM_PATH` to a Chromium executable. Set `TEST_URL` to test a different running address.

Browser tests exercise the WebGL renderer, exploded view, project navigation, exact scroll restoration, nested quick view, keyboard navigation, sound, mobile overflow, reduced motion, and the résumé. Screenshots are saved in `test-results/`.

## Source map

| File | Purpose |
| --- | --- |
| `data.js` | Profile facts, project details, toolbox, and story copy |
| `universe.js` | Three.js scene graph, camera route, shader particles, world geometry, and picking |
| `app.js` | Story position, navigation, overlays, interactions, and audio |
| `experience.css` | Spatial composition and mobile layout |
| `styles.css` | Shared typography, dialogs, and illustrated fallback |
| `world.js` | Canvas fallback when WebGL is unavailable |
| `resume.html` | Printable professional profile, also accessible without JavaScript |
| `concepts.html` | Three motion studies used to compare approaches |

The camera responds directly to scroll position. Ambient movement respects reduced-motion preferences, rendering pauses when the page is hidden, and only nearby worlds render. Mobile uses fewer particles and a lower pixel ratio. If WebGL is unavailable, the illustrated story and professional information remain available.

All career and project claims come from the supplied brief. Project diagrams are explanatory illustrations, not live production connections. Repository links, publication DOIs, and live project URLs were not supplied, so the site does not invent them. `resume.html` is a printable profile assembled from the supplied facts.

The original room artwork is generated and retained as a fallback asset. Font licenses are in `assets/`. Three.js and its MIT license are in `assets/vendor/`.
