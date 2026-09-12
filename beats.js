/**
 * The eight beats of the single continuous take.
 *
 * Every beat describes the same ~1800 points in a different arrangement. Nothing
 * is ever added or removed between beats — the take has no cuts, so the node that
 * opens the film as one curious question is the same node that ends up as a
 * Lambda function. Morphing is a linear interpolation between two of these
 * position sets, which is why the whole thing costs one pass over a Float32Array.
 *
 * Each beat also carries its camera. `pos` and `look` are world units, `fov` is
 * vertical degrees. `spin` is the drift rate of the world in radians per second —
 * MEASUREMENT sets it to zero, because that is the one shot where the camera locks
 * off and the film stops being pretty and starts being rigorous.
 *
 * `framing` shifts the subject right of centre on wide screens so the hero copy
 * has the left half of the frame to itself. On narrow screens it is ignored.
 */

/** The site's six accent hues, so the world is coloured by the same palette as the page. */
export const PALETTE = [0xf2604a, 0xf2a03d, 0x3fa87b, 0x3f8fd4, 0x7b62d9, 0xe0577f];

export const TIERS = {
  full: { nodes: 1800, dust: 900, dpr: 2, idleSpin: true },
  lite: { nodes: 620, dust: 260, dpr: 1.5, idleSpin: false },
};

/** Deterministic PRNG — the world should frame identically on every load. */
function makeRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Even points on a sphere. The even spread is what reads as a network, not a blob. */
function fibonacci(out, o, i, count, radius) {
  const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN * i;
  out[o] = Math.cos(theta) * r * radius;
  out[o + 1] = y * radius;
  out[o + 2] = Math.sin(theta) * r * radius;
}

/* ==========================================================================
   Shapes — one per beat
   ========================================================================== */

/** 00 · A single node on a desk. Tight enough that the cluster reads as one object. */
function room(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(1101);
  for (let i = 0; i < n; i++) {
    fibonacci(a, i * 3, i, n, 0.26 + rnd() * 0.1);
  }
  return a;
}

/** 01 · It comes apart. Taking things apart and putting them back, staged literally. */
function question(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(2202);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    fibonacci(a, o, i, n, 2.1 + rnd() * 1.2);
    // Fragments, not a smooth shell: push clusters of indices out together.
    const shard = 1 + Math.sin(i * 0.7) * 0.22;
    a[o] *= shard; a[o + 1] *= shard; a[o + 2] *= shard;
  }
  return a;
}

/** 02 · Guessing becomes reasoning. Fragments lock into an ordered lattice. */
function structure(n) {
  const a = new Float32Array(n * 3);
  const side = Math.max(2, Math.round(Math.cbrt(n)));
  const span = 3.1;
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const x = i % side;
    const y = Math.floor(i / side) % side;
    const z = Math.floor(i / (side * side)) % side;
    a[o] = (x / (side - 1) - 0.5) * span;
    a[o + 1] = (y / (side - 1) - 0.5) * span;
    a[o + 2] = (z / (side - 1) - 0.5) * span;
  }
  return a;
}

/** 03 · The lattice curves into a lens, and a waveform runs through it. */
function sight(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(3303);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const u = n === 1 ? 0 : i / (n - 1);
    if (i % 5 === 0) {
      // The voice: a wave crossing the frame, loudest in the middle.
      const t = u * 2 - 1;
      a[o] = t * 3.4;
      a[o + 1] = Math.sin(t * 8.5) * 0.62 * (1 - Math.abs(t) * 0.55);
      a[o + 2] = (rnd() - 0.5) * 0.12;
    } else {
      // The eye: concentric rings bowed toward the camera.
      const ring = 0.45 + (i % 4) * 0.34;
      const ang = u * Math.PI * 2 * 11 + ring;
      a[o] = Math.cos(ang) * ring;
      a[o + 1] = Math.sin(ang) * ring;
      a[o + 2] = 0.9 - ring * ring * 0.85;
    }
  }
  return a;
}

/** 04 · YOLOv8, Faster R-CNN, SSD — measured against each other. */
function measurement(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(4404);
  const heights = [2.15, 1.52, 1.0];
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const col = i % 3;
    const k = Math.floor(i / 3) / Math.max(1, Math.floor(n / 3));
    a[o] = (col - 1) * 1.45 + (rnd() - 0.5) * 0.5;
    a[o + 1] = k * heights[col] - 1.15;
    a[o + 2] = (rnd() - 0.5) * 0.5;
  }
  return a;
}

/** 05 · One machine becomes a region. The cluster replicates across a plane. */
function deploy(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(5505);
  const cells = 5;
  const per = Math.max(1, Math.floor(n / (cells * cells)));
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const cell = Math.min(cells * cells - 1, Math.floor(i / per));
    const cx = (cell % cells) - (cells - 1) / 2;
    const cz = Math.floor(cell / cells) - (cells - 1) / 2;
    a[o] = cx * 1.7 + (rnd() - 0.5) * 0.72;
    a[o + 1] = (rnd() - 0.5) * 0.5;
    a[o + 2] = cz * 1.7 + (rnd() - 0.5) * 0.72;
  }
  return a;
}

/** 06 · The full distributed system. The scene the site used to open with, arriving as the destination. */
function production(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(6606);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    fibonacci(a, o, i, n, 3.4);
    const j = 0.22;
    a[o] += (rnd() - 0.5) * j;
    a[o + 1] += (rnd() - 0.5) * j;
    a[o + 2] += (rnd() - 0.5) * j;
  }
  return a;
}

/** 07 · Back to one warm light, with the whole journey behind it. */
function pullOut(n) {
  const a = new Float32Array(n * 3);
  const rnd = makeRandom(7707);
  for (let i = 0; i < n; i++) {
    fibonacci(a, i * 3, i, n, 0.22 + rnd() * 0.08);
  }
  return a;
}

/* ==========================================================================
   The shot list
   ========================================================================== */

export const BEATS = [
  {
    id: 'room', slug: 'INT. SMALL ROOM', tone: 0xf2604a, shape: room,
    camera: { pos: [0, 0.05, 4.6], look: [0, 0, 0], fov: 34 },
    nodeScale: 0.5, edges: 0, spin: 0.05, framing: 0.97,
  },
  {
    id: 'question', slug: 'THE QUESTION', tone: 0xf2604a, shape: question,
    camera: { pos: [0, 0.2, 11.5], look: [0, 0, 0], fov: 40 },
    nodeScale: 0.85, edges: 0.04, spin: 0.06, framing: 0.5,
  },
  {
    id: 'structure', slug: 'STRUCTURE', tone: 0xf2a03d, shape: structure,
    camera: { pos: [3.0, 2.2, 6.4], look: [0, 0, 0], fov: 38 },
    nodeScale: 0.8, edges: 0, spin: 0.05, framing: 0,
  },
  {
    id: 'sight', slug: 'SIGHT & SOUND', tone: 0x3fa87b, shape: sight,
    camera: { pos: [0, 0, 3.0], look: [0, 0, -0.2], fov: 52 },
    nodeScale: 0.4, edges: 0, spin: 0.03, framing: 0,
  },
  {
    id: 'measurement', slug: 'MEASUREMENT', tone: 0x3f8fd4, shape: measurement,
    camera: { pos: [0, 0.3, 7.6], look: [0, 0.1, 0], fov: 26 },
    nodeScale: 0.55, edges: 0, spin: 0, framing: 0,
  },
  {
    id: 'deploy', slug: 'DEPLOY', tone: 0x7b62d9, shape: deploy,
    camera: { pos: [0, 5.0, 8.4], look: [0, -0.5, 0], fov: 44 },
    nodeScale: 0.75, edges: 0.09, spin: 0.04, framing: 0,
  },
  {
    id: 'production', slug: 'PRODUCTION', tone: 0xe0577f, shape: production,
    camera: { pos: [0, 0.7, 11.0], look: [0, 0, 0], fov: 38 },
    nodeScale: 1.55, edges: 0.34, spin: 0.08, framing: 0,
  },
  {
    id: 'pullout', slug: 'PULL OUT', tone: 0xf2a03d, shape: pullOut,
    camera: { pos: [0, 0, 19.0], look: [0, 0, 0], fov: 30 },
    nodeScale: 1.2, edges: 0.16, spin: 0.05, framing: 0,
  },
];

/** Build every beat's position set once, up front. */
export function buildShapes(count) {
  return BEATS.map((beat) => beat.shape(count));
}

/**
 * Edge pairs, derived from PRODUCTION — the one arrangement where "nearest
 * neighbour" means something. Edges fade to nothing through the early beats
 * rather than being rebuilt, so the take never cuts; they only come up once the
 * world has become a system again.
 */
export function buildEdges(positions, perNode = 2) {
  const count = positions.length / 3;
  const seen = new Set();
  const pairs = [];
  // A coarse spatial hash keeps this linear enough to run at load without a hitch.
  const near = [];

  for (let i = 0; i < count; i++) {
    const ax = positions[i * 3];
    const ay = positions[i * 3 + 1];
    const az = positions[i * 3 + 2];
    near.length = 0;

    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const dx = positions[j * 3] - ax;
      const dy = positions[j * 3 + 1] - ay;
      const dz = positions[j * 3 + 2] - az;
      const d = dx * dx + dy * dy + dz * dz;
      if (near.length < perNode) {
        near.push({ j, d });
        near.sort((p, q) => p.d - q.d);
      } else if (d < near[near.length - 1].d) {
        near[near.length - 1] = { j, d };
        near.sort((p, q) => p.d - q.d);
      }
    }

    for (const { j } of near) {
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(i, j);
    }
  }

  return Uint32Array.from(pairs);
}
