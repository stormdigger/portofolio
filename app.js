import {
  achievements, certifications, chapters, contactHref, heroMeta, links,
  marquee, profile, projects, toolbox,
} from './data.js';
import { renderDiagram, heroFallback } from './diagrams.js';

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
  // The tagline's final clause gets the animated gradient.
  $('#hero-title').innerHTML = `
    I build backend systems<br><span class="grad">people depend on.</span>
  `;
  $('#hero-lead').textContent = profile.intro;
  $('#status-text').textContent = profile.available;
  $('#hero-contact').setAttribute('href', contactHref);

  $('#hero-meta').innerHTML = heroMeta.map((item) => `
    <div><dt>${item.label}</dt><dd>${item.value}</dd></div>
  `).join('');

  $('#hero-fallback').innerHTML = heroFallback();

  // Duplicated once so the marquee can loop seamlessly at -50%.
  const run = marquee.map((item) => `<span>${item}</span>`).join('');
  $('#marquee').innerHTML = run + run;
}

/* ==========================================================================
   Work
   ========================================================================== */

function renderWork() {
  $('#work-list').innerHTML = projects.map((project, i) => `
    <article class="project tone-${project.tone} reveal" style="--delay:${i * 60}ms">
      <div class="project-body">
        <div class="project-top">
          <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
          <span class="project-year">${project.year}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-role">${project.role}</p>
        <p class="project-question">${project.question}</p>
        <p class="project-desc">${project.summary}</p>
        <div class="project-tags">
          ${project.tools.slice(0, 5).map((tool) => `<span class="tag">${tool}</span>`).join('')}
          ${project.tools.length > 5
            ? `<span class="tag">+${project.tools.length - 5}</span>`
            : ''}
        </div>
        <div class="project-actions">
          <button class="btn btn-ghost" type="button" data-project="${project.id}">
            Read the case study ${icon('arrow', 16)}
          </button>
        </div>
      </div>
      <div class="project-visual">${renderDiagram(project.diagram)}</div>
    </article>
  `).join('');
}

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
          ${chapter.facts.map((fact) => `<span class="tag">${fact}</span>`).join('')}
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
        ${tool.tools.map((name) => `<span class="tag">${name}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderProof() {
  $('#stat-grid').innerHTML = achievements.map((item, i) => `
    <div class="stat reveal" style="--tone:${item.tone}; --delay:${i * 50}ms">
      <p class="stat-value">${item.value}</p>
      <h3>${item.title}</h3>
      <p>${item.detail}</p>
    </div>
  `).join('');

  $('#certs').innerHTML = certifications
    .map((cert) => `<span class="tag">${cert}</span>`)
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

      <div class="sheet-flow" aria-label="Request flow">
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
   Scroll reveal
   ========================================================================== */

const revealables = $$('.reveal');

if (motion.matches) {
  revealables.forEach((element) => element.classList.add('in'));
} else {
  const revealer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      revealer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealables.forEach((element) => revealer.observe(element));
}

/* ==========================================================================
   Hero 3D — progressively enhanced, never required
   ========================================================================== */

const canvas = $('#hero-canvas');
let hero = null;

async function mountHero() {
  // Reduced motion gets the static SVG; no reason to ship a renderer for it.
  if (motion.matches) {
    document.body.classList.add('no-webgl');
    return;
  }

  try {
    const { HeroScene } = await import('./hero3d.js');
    hero = new HeroScene(canvas, { reducedMotion: motion.matches });
  } catch (error) {
    console.warn('Hero 3D unavailable; using the static diagram.', error);
    document.body.classList.add('no-webgl');
  }
}

mountHero();

let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => hero?.resize(), 140);
});

motion.addEventListener('change', () => {
  if (!motion.matches) return;
  hero?.dispose();
  hero = null;
  document.body.classList.add('no-webgl');
});
