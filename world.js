import * as THREE from './assets/vendor/three.module.js';
import { BEATS, PALETTE, TIERS, buildShapes, buildEdges } from './beats.js';

/**
 * The rig: one continuous shot through the whole page.
 *
 * A fixed, full-viewport canvas sits behind the document. The page scrolls
 * normally — nothing is intercepted, no wheel handler, no scroll-jacking — and
 * scroll position drives a camera that eases toward its target rather than
 * snapping to it. That lag is the whole difference between a scroll effect and
 * a camera move.
 *
 * Cost control
 * - Three draw calls for the entire world: nodes, edges, dust.
 * - Instance positions are only rewritten when the morph actually advances.
 * - The loop stops when nothing is left to settle (and on tab blur). The `full`
 *   tier keeps a slow idle drift so the world stays alive; `lite` freezes, which
 *   is what keeps a phone cool on a long scroll.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;

/** Which version of the world this visitor gets, decided once at load. */
export function pickTier(reducedMotion) {
  if (reducedMotion) return 'off';

  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return 'off';
  } catch {
    return 'off';
  }

  const small = matchMedia('(max-width: 900px)').matches;
  const touch = navigator.maxTouchPoints > 1;
  const cores = navigator.hardwareConcurrency || 4;
  return small || touch || cores <= 4 ? 'lite' : 'full';
}

export class World {
  constructor(canvas, { tier = 'full' } = {}) {
    this.canvas = canvas;
    this.tier = TIERS[tier] ?? TIERS.full;
    this.count = this.tier.nodes;

    this.progress = 0;
    this.target = 0;
    this.spin = 0;
    this.pointer = { x: 0, y: 0 };
    this.aim = { x: 0, y: 0 };
    this.morphKey = -1;
    this.running = false;
    this.visible = true;
    this.last = 0;

    // Throws when WebGL is unavailable; the caller falls back to the flat site.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    this.lookAt = new THREE.Vector3();

    // Lit for warm paper: bright ambient, warm key, cool fill, no deep shadows.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xf1e5d8, 2.1));
    this.key = new THREE.DirectionalLight(0xfff4e6, 2.4);
    this.key.position.set(4, 6, 8);
    this.scene.add(this.key);
    const fill = new THREE.DirectionalLight(0xdce9f7, 1.1);
    fill.position.set(-6, -2, 4);
    this.scene.add(fill);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.shapes = buildShapes(this.count);
    this.build();
    this.resize();
    this.bind();
    this.readScroll();
    this.progress = this.target;
    // Nothing has fired an event yet, so the opening frame has to be asked for.
    this.wake();
  }

  /* ----------------------------------------------------------------------
     Geometry
     ---------------------------------------------------------------------- */

  build() {
    const count = this.count;

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    // r185's fragment shader only applies vColor under USE_COLOR, so instance
    // colours alone are dropped. An all-white vertex colour attribute turns
    // USE_COLOR on and leaves instanceColor as the only thing tinting a node.
    const white = new Float32Array(geometry.attributes.position.count * 3).fill(1);
    geometry.setAttribute('color', new THREE.BufferAttribute(white, 3));

    this.nodes = new THREE.InstancedMesh(
      geometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.36,
        metalness: 0.08,
      }),
      count,
    );
    this.nodes.frustumCulled = false;
    this.nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.nodes.setColorAt(0, new THREE.Color(0xffffff)); // allocates instanceColor
    this.nodes.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.root.add(this.nodes);

    // Per-node size variation, so the network reads with a hierarchy.
    this.sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) this.sizes[i] = 0.055 * (0.62 + ((i * 37) % 11) / 9);

    // Each node keeps one accent from the site palette; the beat's tone is mixed
    // over the top, so colour stays varied but the shot still has a cast.
    this.accents = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.setHex(PALETTE[i % PALETTE.length], THREE.SRGBColorSpace);
      this.accents[i * 3] = c.r;
      this.accents[i * 3 + 1] = c.g;
      this.accents[i * 3 + 2] = c.b;
    }

    this.tones = BEATS.map((beat) => new THREE.Color().setHex(beat.tone, THREE.SRGBColorSpace));

    // Edges come from PRODUCTION, the one arrangement where "nearest neighbour"
    // means something. They stay at zero opacity until the world is a system again.
    this.pairs = buildEdges(this.shapes[6], 2);
    const edgePositions = new Float32Array(this.pairs.length * 3);
    const edgeGeometry = new THREE.BufferGeometry();
    this.edgeAttribute = new THREE.BufferAttribute(edgePositions, 3);
    this.edgeAttribute.setUsage(THREE.DynamicDrawUsage);
    edgeGeometry.setAttribute('position', this.edgeAttribute);
    this.edges = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: 0xc9ae95, transparent: true, opacity: 0 }),
    );
    this.edges.frustumCulled = false;
    this.root.add(this.edges);

    this.buildDust();
  }

  /** Ambient motes, so the camera has something to move through. */
  buildDust() {
    const n = this.tier.dust;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({
      color: 0xc2a488,
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }));
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  /* ----------------------------------------------------------------------
     Input
     ---------------------------------------------------------------------- */

  bind() {
    this.onScroll = () => { this.readScroll(); this.wake(); };
    addEventListener('scroll', this.onScroll, { passive: true });

    this.onResize = () => { this.resize(); this.wake(); };
    addEventListener('resize', this.onResize, { passive: true });

    this.onPointer = (event) => {
      this.aim.x = (event.clientX / innerWidth - 0.5) * 2;
      this.aim.y = (event.clientY / innerHeight - 0.5) * 2;
      this.wake();
    };
    addEventListener('pointermove', this.onPointer, { passive: true });

    this.onVisibility = () => {
      if (document.hidden) this.stop();
      else this.wake();
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  readScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.target = max > 4 ? clamp(scrollY / max, 0, 1) : 0;
  }

  resize() {
    const width = innerWidth;
    const height = innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.tier.dpr));
    this.renderer.setSize(width, height, false);

    // Where a beat's subject sits relative to the copy. On a wide screen the
    // layout is two columns, so the subject moves right and the hero copy owns
    // the left. Once the grid stacks, moving it sideways would put it straight
    // behind the headline — so it moves up into the stage area instead.
    const wide = width >= 1000;
    this.frameX = wide ? 1 : 0;
    this.frameY = wide ? 0 : 0.5;
  }

  /* ----------------------------------------------------------------------
     Loop
     ---------------------------------------------------------------------- */

  wake() {
    if (this.running || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    this.tick = (now) => {
      if (!this.running) return;
      const keepGoing = this.frame(now);
      if (keepGoing) this.raf = requestAnimationFrame(this.tick);
      else { this.running = false; this.raf = 0; }
    };
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Returns whether there is still something to animate. */
  frame(now) {
    const dt = clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;

    // The dolly: scroll sets a target, the camera eases toward it.
    const damp = 1 - Math.pow(0.0022, dt);
    this.progress += (this.target - this.progress) * damp;
    const settling = Math.abs(this.target - this.progress) > 0.00008;
    if (!settling) this.progress = this.target;

    this.pointer.x += (this.aim.x - this.pointer.x) * (1 - Math.pow(0.02, dt));
    this.pointer.y += (this.aim.y - this.pointer.y) * (1 - Math.pow(0.02, dt));

    const last = BEATS.length - 1;
    const p = this.progress * last;
    const index = clamp(Math.floor(p), 0, last - 1);
    const t = smooth(clamp(p - index, 0, 1));
    const a = BEATS[index];
    const b = BEATS[index + 1];

    // Set edge opacity first: writeEdges skips the buffer entirely when the
    // edges are invisible, and it should be reading this frame's value.
    this.edges.material.opacity = mix(a.edges, b.edges, t);

    // Only rewrite buffers when the morph has actually moved.
    const key = index + t;
    if (key !== this.morphKey) {
      this.morphKey = key;
      this.writeNodes(index, t, a, b);
      this.writeEdges();
    }

    const spinRate = mix(a.spin, b.spin, t);
    this.spin += spinRate * dt;
    this.root.rotation.y = this.spin + this.pointer.x * 0.16;
    this.root.rotation.x = Math.sin(this.spin * 0.6) * 0.05 - this.pointer.y * 0.08;
    const framing = mix(a.framing, b.framing, t);
    this.root.position.x = framing * this.frameX;
    this.root.position.y = framing * this.frameY;

    this.camera.fov = mix(a.camera.fov, b.camera.fov, t);
    this.camera.updateProjectionMatrix();
    this.camera.position.set(
      mix(a.camera.pos[0], b.camera.pos[0], t) + this.pointer.x * 0.22,
      mix(a.camera.pos[1], b.camera.pos[1], t) - this.pointer.y * 0.16,
      mix(a.camera.pos[2], b.camera.pos[2], t),
    );
    this.lookAt.set(
      mix(a.camera.look[0], b.camera.look[0], t),
      mix(a.camera.look[1], b.camera.look[1], t),
      mix(a.camera.look[2], b.camera.look[2], t),
    );
    this.camera.lookAt(this.lookAt);

    this.dust.rotation.y = -this.spin * 0.25;

    this.renderer.render(this.scene, this.camera);

    // MEASUREMENT locks off completely, so a parked camera there costs nothing.
    const drifting = this.tier.idleSpin
      && (spinRate > 0.001 || Math.abs(this.aim.x - this.pointer.x) > 0.002);
    return settling || drifting;
  }

  /** Lerp every node between the two beats that bracket the current scroll. */
  writeNodes(index, t, a, b) {
    const from = this.shapes[index];
    const to = this.shapes[index + 1];
    const matrix = this.nodes.instanceMatrix.array;
    const colors = this.nodes.instanceColor.array;
    const scale = mix(a.nodeScale, b.nodeScale, t);

    const ta = this.tones[index];
    const tb = this.tones[index + 1];
    const tr = mix(ta.r, tb.r, t);
    const tg = mix(ta.g, tb.g, t);
    const tbl = mix(ta.b, tb.b, t);

    for (let i = 0; i < this.count; i++) {
      const p = i * 3;
      const m = i * 16;
      const s = this.sizes[i] * scale;

      // Only the diagonal and the translation are ever non-zero, so the rest of
      // the matrix keeps the zeroes it was allocated with.
      matrix[m] = s;
      matrix[m + 5] = s;
      matrix[m + 10] = s;
      matrix[m + 12] = mix(from[p], to[p], t);
      matrix[m + 13] = mix(from[p + 1], to[p + 1], t);
      matrix[m + 14] = mix(from[p + 2], to[p + 2], t);
      matrix[m + 15] = 1;

      colors[p] = mix(this.accents[p], tr, 0.58);
      colors[p + 1] = mix(this.accents[p + 1], tg, 0.58);
      colors[p + 2] = mix(this.accents[p + 2], tbl, 0.58);
    }

    this.nodes.instanceMatrix.needsUpdate = true;
    this.nodes.instanceColor.needsUpdate = true;
  }

  /** Edges follow wherever the nodes currently are, so they stretch through a morph. */
  writeEdges() {
    if (this.edges.material.opacity < 0.005) return;
    const matrix = this.nodes.instanceMatrix.array;
    const out = this.edgeAttribute.array;
    for (let e = 0; e < this.pairs.length; e++) {
      const m = this.pairs[e] * 16;
      const o = e * 3;
      out[o] = matrix[m + 12];
      out[o + 1] = matrix[m + 13];
      out[o + 2] = matrix[m + 14];
    }
    this.edgeAttribute.needsUpdate = true;
  }

  dispose() {
    this.stop();
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onResize);
    removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.scene.traverse((object) => {
      object.geometry?.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    this.renderer.dispose();
  }
}
