/**
 * Content choreography — the layer between the world and the copy.
 *
 * The world (world.js) moves the camera. This moves everything the camera is
 * looking at: headings uncover a word at a time, project rows rise and hold,
 * toolbox cards fly apart from a single point, the timeline draws its own spine
 * as you descend it.
 *
 * How it works
 * - One rAF loop, one scroll read per frame, for the handful of elements
 *   currently on screen. Everything else is asleep behind an IntersectionObserver.
 * - JS only ever writes numbers into custom properties (`--enter`, `--p`,
 *   `--draw`, `--vel`). CSS owns every transform, so the motion stays in the
 *   stylesheet where it can be read and tuned.
 * - Entrances latch. Once an element finishes arriving it is unregistered and
 *   given `.is-in`, which is also what switches its transition back on so hover
 *   states animate smoothly without smearing the entrance.
 * - Every custom property falls back to its resting value (`var(--enter, 1)`),
 *   so if this module never runs the page is simply the static site.
 */

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* ==========================================================================
   Splitting text for masked reveals
   ========================================================================== */

/**
 * Wrap every word in a mask so it can be uncovered from below. Element structure
 * is preserved — a gradient span stays a gradient span — and whitespace is kept
 * as real text nodes so the heading still reads as one sentence to a screen
 * reader and to find-in-page.
 */
function splitWords(element) {
  if (element.dataset.split) return;
  element.dataset.split = 'words';

  let index = 0;

  const walk = (node) => {
    const out = [];
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        for (const chunk of child.textContent.split(/(\s+)/)) {
          if (!chunk) continue;
          if (/^\s+$/.test(chunk)) {
            out.push(document.createTextNode(chunk));
            continue;
          }
          const mask = document.createElement('span');
          mask.className = 'w';
          const inner = document.createElement('span');
          inner.className = 'wi';
          inner.style.setProperty('--wi', String(index++));
          inner.textContent = chunk;
          mask.append(inner);
          out.push(mask);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clone = child.cloneNode(false);
        clone.append(...walk(child));
        out.push(clone);
      }
    }
    return out;
  };

  element.replaceChildren(...walk(element));
}

/* ==========================================================================
   The spread: where each card flies in from
   ========================================================================== */

/**
 * Cards in a grid start gathered near the grid's centre and spread outward into
 * place. The offsets are measured rather than guessed, so a two-column layout
 * and a four-column layout each get a spread that suits their own shape.
 */
function measureSpread(cards) {
  if (!cards.length) return;

  const boxes = cards.map((card) => card.getBoundingClientRect());
  let cx = 0;
  let cy = 0;
  for (const box of boxes) {
    cx += box.left + box.width / 2;
    cy += box.top + box.height / 2;
  }
  cx /= boxes.length;
  cy /= boxes.length;

  cards.forEach((card, i) => {
    const box = boxes[i];
    const dx = box.left + box.width / 2 - cx;
    const dy = box.top + box.height / 2 - cy;
    // Negative: the card starts pulled toward the middle and travels outward.
    card.style.setProperty('--sx', (-dx * 0.46).toFixed(1));
    card.style.setProperty('--sy', (-dy * 0.34).toFixed(1));
    card.style.setProperty('--rot', ((dx >= 0 ? 1 : -1) * (2.5 + Math.abs(dy) / 90)).toFixed(2));
  });
}

/* ==========================================================================
   The loop
   ========================================================================== */

class Choreographer {
  constructor() {
    this.entering = new Map();   // element -> latching entrance
    this.tracking = new Map();   // element -> continuous progress
    this.live = new Set();
    this.running = false;
    this.lastY = scrollY;
    this.vel = 0;

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) this.live.add(entry.target);
        else this.live.delete(entry.target);
      }
      this.wake();
    }, { rootMargin: '12% 0px 12% 0px' });
  }

  /** Latching entrance: travels 0 → 1, then stops being watched. */
  enter(element, { lead = 0 } = {}) {
    element.style.setProperty('--enter', '0');
    this.entering.set(element, { lead });
    this.observer.observe(element);
  }

  /** Continuous: `prop` tracks the element across the whole viewport. */
  track(element, prop, shape) {
    this.tracking.set(element, { prop, shape });
    this.observer.observe(element);
  }

  wake() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.frame);
  }

  frame = () => {
    const vh = innerHeight;

    // Scroll velocity, smoothed and clamped, for the stretch and skew effects.
    const dy = scrollY - this.lastY;
    this.lastY = scrollY;
    this.vel += (clamp01(Math.abs(dy) / 90) * Math.sign(dy) - this.vel) * 0.18;
    if (Math.abs(this.vel) < 0.0015) this.vel = 0;
    const root = document.documentElement;
    root.style.setProperty('--vel', this.vel.toFixed(4));
    root.style.setProperty('--velabs', Math.abs(this.vel).toFixed(4));

    for (const element of this.live) {
      const box = element.getBoundingClientRect();

      const entrance = this.entering.get(element);
      if (entrance) {
        // 0 as the top crosses the fold, 1 once it has risen 44% of the viewport.
        const travel = vh * 0.44;
        const p = clamp01((vh - box.top - entrance.lead) / travel);
        element.style.setProperty('--enter', p.toFixed(4));
        if (p >= 1) {
          element.classList.add('is-in');
          this.entering.delete(element);
          if (!this.tracking.has(element)) this.observer.unobserve(element);
        }
      }

      const tracked = this.tracking.get(element);
      if (tracked) {
        const p = tracked.shape === 'draw'
          // The spine fills to wherever the reader's eye is, not the whole box.
          ? clamp01((vh * 0.66 - box.top) / Math.max(1, box.height))
          : clamp01((vh - box.top) / (vh + box.height));
        element.style.setProperty(tracked.prop, p.toFixed(4));
      }
    }

    // Keep going while anything is on screen or the page is still moving.
    this.running = this.live.size > 0 || this.vel !== 0;
    if (this.running) requestAnimationFrame(this.frame);
  };
}

/* ==========================================================================
   Hover: a card that leans toward the cursor
   ========================================================================== */

/**
 * Only for a real pointer, and only on the card's visual — the copy stays flat
 * and readable while the diagram beside it leans. The tilt is deliberately
 * small; past a couple of degrees it stops reading as depth and starts reading
 * as a gimmick.
 */
function bindTilt(card, stage) {
  if (!stage) return;

  const onMove = (event) => {
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    stage.style.setProperty('--tx', (-y * 7).toFixed(2));
    stage.style.setProperty('--ty', (x * 9).toFixed(2));
  };

  const reset = () => {
    stage.style.setProperty('--tx', '0');
    stage.style.setProperty('--ty', '0');
  };

  card.addEventListener('pointermove', onMove, { passive: true });
  card.addEventListener('pointerleave', reset, { passive: true });
}

/* ==========================================================================
   Wiring
   ========================================================================== */

export function startMotion() {
  // Reduced motion keeps every resting value and never starts a loop.
  if (reduced.matches) {
    document.body.classList.add('motion-off');
    return null;
  }

  document.body.classList.add('motion-on');

  for (const heading of $$('[data-split]')) splitWords(heading);

  const chore = new Choreographer();

  // Section heads and standalone blocks.
  for (const element of $$('.reveal')) chore.enter(element);

  // The toolbox and the proof stats spread out of a single point.
  const spreads = [$$('#toolbox-grid .tool-card'), $$('#stat-grid .stat')];
  for (const group of spreads) measureSpread(group);

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const group of spreads) measureSpread(group);
    }, 160);
  }, { passive: true });

  // The timeline draws its own spine as you descend it.
  const timeline = document.querySelector('#timeline');
  if (timeline) chore.track(timeline, '--draw', 'draw');

  // Project rows get a slow counter-drift on the diagram beside the copy.
  for (const project of $$('.project')) {
    chore.track(project, '--p');
    if (fine.matches) bindTilt(project, project.querySelector('.project-visual'));
  }

  addEventListener('scroll', () => chore.wake(), { passive: true });
  chore.wake();

  // The opening sequence runs on a timer rather than on scroll: at scroll zero
  // there is nothing to drive it, and the hero should arrive on its own.
  requestAnimationFrame(() => document.body.classList.add('intro-ready'));

  return chore;
}
