/**
 * The route: one request, eleven hops, travelled in a straight line.
 *
 * The previous world kept one cloud and morphed it from beat to beat. A request
 * does not morph — it travels, and it passes things. So the point budget is
 * divided between the hops, each group arranged into that hop's own formation
 * and parked at its own depth down the corridor. The camera flies through them.
 *
 * That has a useful consequence: positions never change after load, so the
 * instance buffer is written exactly once and a frame costs a camera update and
 * a draw. Nothing is rewritten while you scroll.
 *
 * Distances are world units. The corridor runs along -Z, so hop `i` sits at
 * `-i * SPACING` and the camera starts just in front of hop 00.
 */

export const SPACING = 11;
export const CAMERA_LEAD = 5.6;

/**
 * How far a formation sits to the side of the corridor's axis. A hop's copy is
 * pinned on one side, so its formation is pushed to the other — otherwise the
 * two land on top of each other in the middle of frame and neither reads.
 */
export const FORMATION_OFFSET = 2.8;

/** Deterministic, so the corridor is laid out identically on every load. */
function makeRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const TAU = Math.PI * 2;

/* ==========================================================================
   Formations — each one is a hop's shape, in its own local space
   ========================================================================== */

/** A single tight node. Nothing has happened yet. */
function seed(n, rnd) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * TAU;
    const b = Math.acos(2 * rnd() - 1);
    const r = 0.24 + rnd() * 0.16;
    out.push([Math.sin(b) * Math.cos(a) * r, Math.sin(b) * Math.sin(a) * r, Math.cos(b) * r]);
  }
  return out;
}

/** Broken apart and not yet put back. */
function shards(n, rnd) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * TAU;
    const b = Math.acos(2 * rnd() - 1);
    const r = 1.1 + rnd() * 1.5;
    const chunk = 1 + Math.sin(i * 0.9) * 0.3;
    out.push([
      Math.sin(b) * Math.cos(a) * r * chunk,
      Math.sin(b) * Math.sin(a) * r * chunk,
      Math.cos(b) * r * 0.5,
    ]);
  }
  return out;
}

/** Order arrives: an ordered lattice. */
function lattice(n, rnd) {
  const out = [];
  const side = Math.max(2, Math.round(Math.cbrt(n)));
  for (let i = 0; i < n; i++) {
    const x = i % side;
    const y = Math.floor(i / side) % side;
    const z = Math.floor(i / (side * side)) % side;
    out.push([
      (x / (side - 1) - 0.5) * 3.2 + (rnd() - 0.5) * 0.06,
      (y / (side - 1) - 0.5) * 3.2 + (rnd() - 0.5) * 0.06,
      (z / (side - 1) - 0.5) * 1.6,
    ]);
  }
  return out;
}

/** A door the request has to be let through. */
function gate(n, rnd) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const ring = i % 3;
    const r = 1.5 + ring * 0.42;
    const a = rnd() * TAU;
    out.push([
      Math.cos(a) * r,
      Math.sin(a) * r,
      (rnd() - 0.5) * 0.5 - ring * 0.2,
    ]);
  }
  return out;
}

/** Stages chained one into the next. `steps` comes from a project's real flow. */
function chain(n, rnd, steps = 4) {
  const out = [];
  const span = 4.4;
  for (let i = 0; i < n; i++) {
    const stage = i % steps;
    const x = (stage / (steps - 1) - 0.5) * span;
    const tight = rnd() < 0.72;
    const r = tight ? 0.36 : 0.9;
    const a = rnd() * TAU;
    out.push([
      x + (rnd() - 0.5) * 0.34,
      Math.cos(a) * r,
      Math.sin(a) * r,
    ]);
  }
  return out;
}

/** Three approaches measured against each other. */
function bars(n, rnd) {
  const out = [];
  const heights = [2.3, 1.62, 1.05];
  for (let i = 0; i < n; i++) {
    const col = i % 3;
    const k = rnd();
    out.push([
      (col - 1) * 1.5 + (rnd() - 0.5) * 0.46,
      k * heights[col] - 1.2,
      (rnd() - 0.5) * 0.46,
    ]);
  }
  return out;
}

/** One machine copied across a region. */
function fan(n, rnd) {
  const out = [];
  const cells = 4;
  for (let i = 0; i < n; i++) {
    const cell = i % (cells * cells);
    const cx = (cell % cells) - (cells - 1) / 2;
    const cy = Math.floor(cell / cells) - (cells - 1) / 2;
    out.push([
      cx * 1.45 + (rnd() - 0.5) * 0.6,
      cy * 1.15 + (rnd() - 0.5) * 0.5,
      (rnd() - 0.5) * 1.4,
    ]);
  }
  return out;
}

/** The live system: dense, even, and carrying traffic. */
function mesh(n, rnd) {
  const out = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    const rad = 2.5;
    out.push([
      Math.cos(th) * r * rad + (rnd() - 0.5) * 0.16,
      y * rad + (rnd() - 0.5) * 0.16,
      Math.sin(th) * r * rad + (rnd() - 0.5) * 0.16,
    ]);
  }
  return out;
}

/** What the route was built from: clustered groups, loosely linked. */
function graph(n, rnd) {
  const out = [];
  const groups = 6;
  for (let i = 0; i < n; i++) {
    const g = i % groups;
    const a = (g / groups) * TAU;
    const gx = Math.cos(a) * 2.1;
    const gy = Math.sin(a) * 1.6;
    out.push([
      gx + (rnd() - 0.5) * 0.95,
      gy + (rnd() - 0.5) * 0.95,
      (rnd() - 0.5) * 0.95,
    ]);
  }
  return out;
}

/** Readings, laid out flat like a panel at the end of a trace. */
function panel(n, rnd) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const col = i % 4;
    out.push([
      (col - 1.5) * 1.3 + (rnd() - 0.5) * 0.75,
      (rnd() - 0.5) * 1.9,
      (rnd() - 0.5) * 0.4,
    ]);
  }
  return out;
}

/** The response, opening outward. */
function bloom(n, rnd) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * TAU;
    const b = Math.acos(2 * rnd() - 1);
    const r = 0.4 + Math.pow(rnd(), 0.4) * 2.6;
    out.push([
      Math.sin(b) * Math.cos(a) * r,
      Math.sin(b) * Math.sin(a) * r,
      Math.cos(b) * r * 0.7,
    ]);
  }
  return out;
}

/* ==========================================================================
   The route
   ========================================================================== */

/**
 * `weight` is this hop's share of the point budget — the live system earns more
 * points than the hops on either side of it. `anchor` is where the hop's copy
 * pins in the hop's local space, so the text sits beside its formation rather
 * than on top of it.
 */
export const HOPS = [
  {
    id: 'dispatch', name: 'DISPATCH', label: 'GET /balwinder-singh', section: '.hero',
    tone: 0xf2604a, shape: seed, weight: 0.7, anchor: [-2.4, 0.2, 0],
  },
  {
    id: 'origin', name: 'origin', label: 'origin · a small room',
    tone: 0xf2604a, shape: shards, weight: 0.9, anchor: [2.8, 0.4, 0],
  },
  {
    id: 'resolve', name: 'resolve', label: 'resolve · B.E. CSE',
    tone: 0xf2a03d, shape: lattice, weight: 1, anchor: [-3.1, 0.3, 0],
  },
  {
    id: 'facemeet', name: 'auth.facemeet', label: 'auth.facemeet · 2023',
    tone: 0xf2604a, shape: gate, weight: 1, anchor: [3.1, 0.2, 0],
  },
  {
    id: 'doctorg', name: 'vision.doctorg', label: 'vision.doctorg · 2024',
    tone: 0x7b62d9, shape: chain, weight: 1, anchor: [-3.2, 0.9, 0],
  },
  {
    id: 'research', name: 'bench.ieee', label: 'bench.ieee · 2024 / 2025',
    tone: 0x3f8fd4, shape: bars, weight: 1, anchor: [3.0, 0.4, 0],
  },
  {
    id: 'agristore', name: 'commerce.agristore', label: 'commerce.agristore · 2025',
    tone: 0x3fa87b, shape: fan, weight: 1.05, anchor: [-3.3, 0.3, 0],
  },
  {
    id: 'arovita', name: 'hms.arovita', label: 'hms.arovita · LIVE',
    tone: 0xe0577f, shape: mesh, weight: 1.6, anchor: [3.4, 0.2, 0],
  },
  {
    id: 'deps', name: 'deps', label: 'deps · the toolbox', section: '#toolbox',
    tone: 0xf2a03d, shape: graph, weight: 1.1, anchor: [-3.2, 0.2, 0],
  },
  {
    id: 'metrics', name: 'metrics', label: 'metrics · evidence', section: '#proof',
    tone: 0x3f8fd4, shape: panel, weight: 0.9, anchor: [3.0, 0.3, 0],
  },
  {
    id: 'ok', name: '200 OK', label: '200 OK · response', section: '#contact',
    tone: 0x3fa87b, shape: bloom, weight: 1.1, anchor: [0, 0, 0],
  },
];

/** How far hop `i`'s formation sits from the corridor axis, and which way. */
export const formationShift = (i) =>
  -Math.sign(HOPS[i].anchor[0] || 1) * FORMATION_OFFSET;

/** Depth of hop `i` down the corridor. */
export const hopZ = (i) => -i * SPACING;

/** Total travel, from the camera's start to its position at the final hop. */
export const routeLength = () => (HOPS.length - 1) * SPACING;

/**
 * Lay the whole corridor out once: every point's final position and which hop
 * owns it. Positions are absolute, so the caller writes them to the GPU a
 * single time and never touches them again.
 */
export function buildCorridor(budget) {
  const total = HOPS.reduce((sum, hop) => sum + hop.weight, 0);
  const positions = new Float32Array(budget * 3);
  const owner = new Uint8Array(budget);

  let cursor = 0;
  HOPS.forEach((hop, index) => {
    const isLast = index === HOPS.length - 1;
    const share = isLast
      ? budget - cursor
      : Math.max(1, Math.round((hop.weight / total) * budget));
    const count = Math.min(share, budget - cursor);
    if (count <= 0) return;

    const rnd = makeRandom(1000 + index * 977);
    const points = hop.shape(count, rnd, hop.steps);
    const z = hopZ(index);
    // Opposite whichever side the copy is pinned to.
    const shift = formationShift(index);

    for (let i = 0; i < count; i++) {
      const p = points[i] || [0, 0, 0];
      const o = (cursor + i) * 3;
      positions[o] = p[0] + shift;
      positions[o + 1] = p[1];
      positions[o + 2] = p[2] + z;
      owner[cursor + i] = index;
    }
    cursor += count;
  });

  return { positions, owner };
}
