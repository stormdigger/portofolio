import {
  achievements, certifications, chapters, contactHref, heroMeta, links,
  marquee, profile, projects, research, toolbox,
} from './data.js';
import { renderDiagram, heroFallback } from './diagrams.js';
import { startMotion } from './motion.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const motion = matchMedia('(prefers-reduced-motion: reduce)');

/* ==========================================================================
   Icons — small, consistent, stroke-based
   ========================================================================== */

const ICONS = {
  cloud: '<path d="M6.5 18a4.5 4.5 0 0 1-.4-8.98 6 6 0 0 1 11.5 1.48A3.75 3.75 0 0 1 17.5 18z"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v13c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-13"/><path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3"/>',
  server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 20V9"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  code: '<path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>',
  github: '<path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 5v-3.2a2.8 2.8 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.5 2.7 5.5 3 5.5 3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.4c0 4.7 2.8 5.7 5.5 6a2.8 2.8 0 0 0-.8 2.1V21"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  code2: '<path d="m8 3 4 18M18.5 8.5 22 12l-3.5 3.5M5.5 8.5 2 12l3.5 3.5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  download: '<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  quote: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
};

const icon = (name, size = 17) => `
  <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor"
       stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    ${ICONS[name] ?? ''}
  </svg>
`;

/* ==========================================================================
   Hero
   ========================================================================== */

function renderHero() {
  // Two masked lines. The tagline's final clause keeps the animated gradient,
  // and because the gradient sits on the same element that moves, the
  // background-clip stays intact through the reveal.
  $('#hero-title').innerHTML = `
    <span class="line"><span class="line-i" style="--i:0">I build backend systems</span></span>
    <span class="line"><span class="line-i grad" style="--i:1">people depend on.</span></span>
  `;
  $('#hero-lead').textContent = profile.intro;
  $('#status-text').textContent = profile.available;
  $('#hero-contact').setAttribute('href', contactHref);

  $('#hero-meta').innerHTML = heroMeta.map((item) => `
    <div><dt>${item.label}</dt><dd>${item.href ? `<a href="${item.href}">${item.value}</a>` : item.value}</dd></div>
  `).join('');

  $('#hero-fallback').innerHTML = heroFallback();

  // Duplicated once so the marquee can loop seamlessly at -50%.
  const run = marquee.map((item) => `<span>${item}</span>`).join('');
  $('#marquee').innerHTML = run + run;
}

/* ==========================================================================
   Work
   ========================================================================== */

/** A browser window around a live screenshot — the URL bar is the real host. */
const browserShot = (project, src, { lazy = true } = {}) => `
  <div class="shot">
    <div class="shot-bar" aria-hidden="true">
      <span class="shot-dots"><i></i><i></i><i></i></span>
      <span class="shot-url">${icon('lock', 11)} ${project.live.host}</span>
      <span class="live-pill"><span class="live-dot"></span>Live</span>
    </div>
    <img src="${src}" alt="Screenshot of ${project.title} running at ${project.live.host}"
         width="1280" height="800" decoding="async"${lazy ? ' loading="lazy"' : ''}>
  </div>
`;

const liveButton = (project, cls = 'btn-primary') => `
  <a class="btn ${cls} btn-live" href="${project.live.url}" target="_blank" rel="noopener">
    Visit live site ${icon('external', 16)}
  </a>
`;

function renderWork() {
  $('#work-list').innerHTML = projects.map((project, i) => `
    <article class="project tone-${project.tone}${project.live ? ' is-live' : ''} reveal"
             style="--delay:${i * 60}ms">
      <div class="project-body">
        <div class="project-top">
          <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
          ${project.live ? '<span class="project-live"><span class="live-dot"></span>Live in production</span>' : ''}
          <span class="project-year">${project.year}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-role">${project.role}</p>
        <p class="project-question">${project.question}</p>
        <p class="project-desc">${project.summary}</p>
        ${project.stats ? `
          <dl class="project-stats">
            ${project.stats.map((stat) => `<div><dt>${stat.label}</dt><dd>${stat.value}</dd></div>`).join('')}
          </dl>` : ''}
        <div class="project-tags">
          ${project.tools.slice(0, 5).map((tool, t) => `<span class="tag" style="--i:${t}">${tool}</span>`).join('')}
          ${project.tools.length > 5
            ? `<span class="tag" style="--i:5">+${project.tools.length - 5}</span>`
            : ''}
        </div>
        <div class="project-actions">
          ${project.live ? liveButton(project) : ''}
          <button class="btn btn-ghost" type="button" data-project="${project.id}">
            ${project.live ? 'How it works' : 'Read the case study'} ${icon('arrow', 16)}
          </button>
        </div>
      </div>
      ${project.live ? `
        <a class="project-visual project-visual--shot" href="${project.live.url}" target="_blank"
           rel="noopener" tabindex="-1" aria-hidden="true">
          ${browserShot(project, project.shots[0])}
          ${project.shots[1] ? `<div class="shot shot-back"><img src="${project.shots[1]}" alt="" width="1280" height="800" loading="lazy" decoding="async"></div>` : ''}
        </a>`
        : `<div class="project-visual">${renderDiagram(project.diagram)}</div>`}
    </article>
  `).join('');
}

/* ==========================================================================
   Research
   ========================================================================== */

function renderResearch() {
  const author = (a) => (typeof a === 'string'
    ? `<span>${a}</span>`
    : `<span class="me" title="That's me">${a.name}</span>`);

  $('#paper-list').innerHTML = research.map((paper, i) => `
    <article class="paper tone-${paper.tone} reveal" style="--delay:${i * 80}ms">
      <div class="paper-cover">
        <div class="paper-badges">
          <span class="paper-ieee">IEEE</span>
          <span class="paper-kind">${paper.kind}</span>
        </div>
        <div class="paper-diagram" aria-hidden="true">${renderDiagram(paper.diagram)}</div>
        <p class="paper-venue-big">${paper.venue}</p>
        <p class="paper-venue-full">${paper.venueFull} · ${paper.place}</p>
      </div>

      <div class="paper-body">
        <p class="paper-q">${paper.question}</p>
        <h3 class="paper-title">
          <a href="${paper.links.ieee}" target="_blank" rel="noopener">${paper.title}</a>
        </h3>
        <p class="paper-authors" aria-label="Authors">${paper.authors.map(author).join('')}</p>
        <p class="paper-abstract">${paper.abstract}</p>
        <ul class="paper-points">
          ${paper.points.map((point) => `<li>${icon('check', 15)}<span>${point}</span></li>`).join('')}
        </ul>
        <div class="project-tags">
          ${paper.keywords.map((k, t) => `<span class="tag" style="--i:${t}">${k}</span>`).join('')}
        </div>
        <dl class="paper-meta">
          <div><dt>Presented</dt><dd>${paper.presented}</dd></div>
          <div><dt>Published</dt><dd>${paper.published}</dd></div>
          <div><dt>Pages</dt><dd>${paper.pages}</dd></div>
          <div class="paper-doi"><dt>DOI</dt><dd><a href="https://doi.org/${paper.doi}" target="_blank" rel="noopener">${paper.doi}</a></dd></div>
        </dl>
        <div class="paper-actions">
          <a class="btn btn-primary" href="${paper.links.ieee}" target="_blank" rel="noopener">
            ${icon('doc', 16)} Read on IEEE Xplore
          </a>
          ${paper.links.researchgate ? `
            <a class="btn btn-ghost" href="${paper.links.researchgate}" target="_blank" rel="noopener">
              ResearchGate ${icon('external', 15)}
            </a>` : ''}
          <a class="btn btn-ghost" href="${paper.links.scholar}" target="_blank" rel="noopener">
            Semantic Scholar ${icon('external', 15)}
          </a>
          <button class="btn btn-ghost btn-cite" type="button" data-cite="${paper.id}" aria-label="Copy citation for ${paper.title}">
            ${icon('quote', 15)} <span aria-live="polite">Cite</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// Copies an IEEE-style reference. Clipboard needs a secure context; when it is
// unavailable the button says so rather than failing silently.
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-cite]');
  if (!button) return;
  const paper = research.find((p) => p.id === button.dataset.cite);
  const label = button.querySelector('span');
  try {
    await navigator.clipboard.writeText(paper.cite);
    label.textContent = 'Citation copied';
    button.classList.add('is-done');
  } catch {
    label.textContent = 'Copy failed';
  }
  setTimeout(() => {
    label.textContent = 'Cite';
    button.classList.remove('is-done');
  }, 2200);
});

/* ==========================================================================
   Journey, toolbox, proof
   ========================================================================== */

function renderJourney() {
  $('#timeline').innerHTML = chapters.map((chapter, i) => `
    <div class="chapter reveal" style="--tone:${chapter.tone}; --delay:${i * 50}ms">
      <span class="chapter-dot">${String(i + 1).padStart(2, '0')}</span>
      <div class="chapter-card">
        <p class="chapter-era">${chapter.era}</p>
        <h3>${chapter.title}</h3>
        <p>${chapter.text}</p>
        <div class="chapter-facts">
          ${chapter.facts.map((fact, f) => `<span class="tag" style="--i:${f}">${fact}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function renderToolbox() {
  $('#toolbox-grid').innerHTML = toolbox.map((tool, i) => `
    <article class="tool-card reveal" style="--tone:${tool.tone}; --delay:${i * 45}ms">
      <span class="tool-icon">${icon(tool.icon, 22)}</span>
      <h3>${tool.title}</h3>
      <p class="tool-line">${tool.line}</p>
      <p>${tool.text}</p>
      <div class="tool-tags">
        ${tool.tools.map((name, t) => `<span class="tag" style="--i:${t}">${name}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderProof() {
  $('#stat-grid').innerHTML = achievements.map((item, i) => `
    <div class="stat reveal" style="--tone:${item.tone}; --delay:${i * 50}ms">
      <p class="stat-value"><span>${item.value}</span></p>
      <h3>${item.title}</h3>
      <p>${item.detail}</p>
    </div>
  `).join('');

  $('#certs').innerHTML = certifications
    .map((cert, i) => `<span class="tag" style="--i:${i}">${cert}</span>`)
    .join('');
}

function renderContact() {
  $('#contact-lead').textContent =
    `${profile.available}. The fastest way to reach me is email — I read everything.`;

  $('#contact-actions').innerHTML = `
    <a class="btn btn-primary" href="${contactHref}">${icon('mail', 17)} Email me</a>
    <a class="btn btn-ghost" href="resume.html" target="_blank" rel="noopener">
      ${icon('download', 17)} Résumé
    </a>
  `;

  $('#contact-links').innerHTML = `
    <a href="${links.github}" target="_blank" rel="noreferrer noopener">${icon('github', 16)} github.com/stormdigger</a>
    <a href="${links.linkedin}" target="_blank" rel="noreferrer noopener">${icon('linkedin', 16)} LinkedIn</a>
    <a href="${links.leetcode}" target="_blank" rel="noreferrer noopener">${icon('code2', 16)} LeetCode</a>
    <a href="${links.email}">${icon('mail', 16)} ${profile.email}</a>
  `;
}

renderHero();
renderWork();
renderResearch();
renderJourney();
renderToolbox();
renderProof();
renderContact();
$('#year').textContent = String(new Date().getFullYear());

/* ==========================================================================
   Project case-study dialog
   ========================================================================== */

const dialog = $('#project-dialog');
let lastTrigger = null;

function openProject(id, trigger) {
  const project = projects.find((p) => p.id === id);
  if (!project) return;

  lastTrigger = trigger ?? null;
  $('#sheet-kicker').textContent = `${project.title} · ${project.year}`;

  $('#sheet-body').innerHTML = `
    <div style="--tint: var(--${project.tone})">
      <h2 id="sheet-title">${project.title}</h2>
      <p class="project-role">${project.role}</p>
      <p class="sheet-q">${project.question}</p>

      ${project.live ? `
        <div class="sheet-live">
          ${liveButton(project)}
          <span class="sheet-host">${project.live.host}</span>
        </div>
        <div class="sheet-gallery${project.shots.length > 1 ? ' two' : ''}">
          ${project.shots.map((src) => browserShot(project, src, { lazy: false })).join('')}
        </div>` : ''}

      ${project.stats ? `
        <dl class="project-stats sheet-stats">
          ${project.stats.map((stat) => `<div><dt>${stat.label}</dt><dd>${stat.value}</dd></div>`).join('')}
        </dl>` : ''}

      <div class="sheet-flow" aria-label="How it flows">
        ${project.flow.map((step, i) => `
          ${i ? '<i aria-hidden="true">→</i>' : ''}<span>${step}</span>
        `).join('')}
      </div>

      <div class="sheet-section">
        <h3>The system</h3>
        <p>${project.system}</p>
      </div>

      <div class="sheet-section">
        <h3>The engineering</h3>
        <p>${project.engineering}</p>
      </div>

      <div class="sheet-section">
        <h3>Tools</h3>
        <div class="project-tags">
          ${project.tools.map((tool) => `<span class="tag">${tool}</span>`).join('')}
        </div>
      </div>

      <p class="sheet-note">${project.note}</p>
    </div>
  `;

  dialog.showModal();
  dialog.querySelector('.sheet').scrollTop = 0;
  document.body.classList.add('modal-open');
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-project]');
  if (trigger) openProject(trigger.dataset.project, trigger);
});

$('#sheet-close').addEventListener('click', () => dialog.close());

// Clicking the backdrop (outside the sheet) dismisses.
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lastTrigger?.focus({ preventScroll: true });
  lastTrigger = null;
});

/* ==========================================================================
   Header: shadow on scroll, mobile menu, active section
   ========================================================================== */

const header = $('#site-header');
const nav = $('#nav');
const navToggle = $('#nav-toggle');

const onScroll = () => header.classList.toggle('stuck', window.scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

function closeNav() {
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
}

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeNav();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (nav.classList.contains('open')) {
    closeNav();
    navToggle.focus();
  }
});

// Highlight the section currently in view. Only in-page section links take
// part; the menu-only Contact and Résumé links are excluded.
const navLinks = $$('.nav a:not(.nav-only)');
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sections.length) {
  const spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = `#${entry.target.id}`;
      for (const link of navLinks) {
        link.setAttribute('aria-current', String(link.getAttribute('href') === id));
      }
    }
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => spy.observe(section));
}

/* ==========================================================================
   Content choreography
   ========================================================================== */

// Imported eagerly rather than dynamically: unlike the world, this decides how
// the copy arrives, so it has to be in place before the first paint.
startMotion();

/* ==========================================================================
   The world — progressively enhanced, never required
   ========================================================================== */

let world = null;

/**
 * Every beat of the take is a background layer. Remove the canvas — no WebGL,
 * reduced motion, an old phone — and the page is exactly the flat, fast site it
 * was before: same content, same order, same fallback diagram in the hero card.
 */
async function mountWorld() {
  try {
    const { World, pickTier } = await import('./world.js');
    const tier = pickTier(motion.matches);

    if (tier === 'off') {
      document.body.classList.add('no-webgl');
      return;
    }

    world = new World($('#world'), { tier });
    document.body.classList.add('world-on');
  } catch (error) {
    console.warn('The world could not start; falling back to the flat site.', error);
    document.body.classList.add('no-webgl');
  }
}

mountWorld();

// Reduced motion can be switched on mid-visit; tear the world down when it is.
motion.addEventListener('change', () => {
  if (!motion.matches || !world) return;
  world.dispose();
  world = null;
  document.body.classList.remove('world-on');
  document.body.classList.add('no-webgl');
});
