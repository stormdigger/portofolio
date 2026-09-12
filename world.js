import * as THREE from './assets/vendor/three.module.js';
import { HOPS, SPACING, CAMERA_LEAD, buildCorridor, formationShift, hopZ, routeLength } from './route.js';
import { Anchors } from './anchor.js';

/**
 * The rig: one request travelling a corridor.
 *
 * Scroll moves the camera down -Z past eleven formations. Nothing morphs, so
 * every point's position is written to the GPU once at load and never touched
 * again; a frame is a camera update, an anchor pass, and a draw.
 *
 * Depth on a light background is the hard part — there is no darkness to fade
 * into and no glow to fall off. Fog set to the page's own paper colour does it:
 * distant hops dissolve into the background exactly as if the paper were air.
 *
 * The page still scrolls normally. Nothing intercepts the wheel, the canvas
 * takes no pointer events, and with this module absent the site is the flat,
 * fast page it has always been.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mix = (a, b, t) => a + (b - a) * t;

const PALETTE = [0xf2604a, 0xf2a03d, 0x3fa87b, 0x3f8fd4, 0x7b62d9, 0xe0577f];
const PAPER = 0xfdf8f3;

export const TIERS = {
  full: { points: 4200, dust: 700, dpr: 2 },
  lite: { points: 1500, dust: 240, dpr: 1.5 },
};

/** Which version of the corridor this visitor gets, decided once at load. */
export function pickTier(reducedMotion) {
  if (reducedMotion) return 'off';
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return 'off';
  } catch {
    return 'off';
  }
  // Touch and viewport are the signals that actually mean "phone". Core count
  // is a poor proxy — plenty of capable laptops report four.
  const small = matchMedia('(max-width: 900px)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  return small || navigator.maxTouchPoints > 1 || cores <= 2 ? 'lite' : 'full';
}

export class World {
  constructor(canvas, { tier = 'full' } = {}) {
    this.canvas = canvas;
    this.tier = TIERS[tier] ?? TIERS.full;

    this.z = CAMERA_LEAD;
    this.targetZ = CAMERA_LEAD;
    this.stations = [];
    this.pointer = { x: 0, y: 0 };
    this.aim = { x: 0, y: 0 };
    this.running = false;
    this.last = 0;
    this.time = 0;

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
    // The corridor's depth cue: distance dissolves into the page's own paper.
    // Tight, deliberately — it has to close before the next hop comes into view,
    // or a formation two hops ahead reads as clutter behind the copy you are
    // currently reading.
    this.scene.fog = new THREE.Fog(PAPER, 6, 18);

    this.camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60);
    this.look = new THREE.Vector3();

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xf1e5d8, 2.2));
    const key = new THREE.DirectionalLight(0xfff4e6, 2.3);
    key.position.set(4, 6, 8);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdce9f7, 1.1);
    fill.position.set(-6, -2, 4);
    this.scene.add(fill);

    this.anchors = new Anchors(this.camera);

    this.build();
    this.resize();
    this.bind();
    this.measureStations();
    this.readRoute();
    this.z = this.targetZ;
    this.wake();
  }

  /* ----------------------------------------------------------------------
     The corridor, written once
     ---------------------------------------------------------------------- */

  build() {
    const count = this.tier.points;
    const { positions, owner } = buildCorridor(count);
    this.count = count;

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    // r185 only applies vColor under USE_COLOR, so instance colours alone are
    // dropped. An all-white vertex colour turns it on and leaves instanceColor
    // as the only thing tinting a node.
    const white = new Float32Array(geometry.attributes.position.count * 3).fill(1);
    geometry.setAttribute('color', new THREE.BufferAttribute(white, 3));

    this.nodes = new THREE.InstancedMesh(
      geometry,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.06, fog: true }),
      count,
    );
    this.nodes.frustumCulled = false;
    this.nodes.setColorAt(0, new THREE.Color(0xffffff));

    const matrix = this.nodes.instanceMatrix.array;
    const colors = this.nodes.instanceColor.array;
    const tone = new THREE.Color();
    const accent = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const p = i * 3;
      const m = i * 16;
      // Size varies a little so a formation has some hierarchy in it.
      const s = 0.036 * (0.7 + ((i * 37) % 13) / 9);

      matrix[m] = s;
      matrix[m + 5] = s;
      matrix[m + 10] = s;
      matrix[m + 12] = positions[p];
      matrix[m + 13] = positions[p + 1];
      matrix[m + 14] = positions[p + 2];
      matrix[m + 15] = 1;

      tone.setHex(HOPS[owner[i]].tone, THREE.SRGBColorSpace);
      accent.setHex(PALETTE[i % PALETTE.length], THREE.SRGBColorSpace);
      colors[p] = mix(accent.r, tone.r, 0.72);
      colors[p + 1] = mix(accent.g, tone.g, 0.72);
      colors[p + 2] = mix(accent.b, tone.b, 0.72);
    }

    this.nodes.instanceMatrix.needsUpdate = true;
    this.nodes.instanceColor.needsUpdate = true;
    this.scene.add(this.nodes);

    this.buildDust();
  }

  /** Motes along the length of the corridor, so the travel has texture. */
  buildDust() {
    const n = this.tier.dust;
    const length = routeLength();
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // Hollow: motes keep clear of the corridor's axis, so none of them ever
      // drift across the copy the camera is currently beside.
      const angle = Math.random() * Math.PI * 2;
      const radius = 4.2 + Math.random() * 7;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
      positions[i * 3 + 2] = CAMERA_LEAD - Math.random() * (length + SPACING * 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({
      color: 0xc2a488,
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      fog: true,
    }));
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  /* ----------------------------------------------------------------------
     Anchored copy
     ---------------------------------------------------------------------- */

  /**
   * @param map  hop id -> element. A hop with no element simply has no copy.
   */
  bindAnchors(map) {
    this.anchorMap = map;
    this.anchors.items.length = 0;

    HOPS.forEach((hop, index) => {
      const element = map[hop.id];
      if (!element) return;
      this.anchors.add(element, [0, hop.anchor[1], hopZ(index)]);
      // The x is decided by the viewport, not the route — see placeAnchors.
      this.anchors.items[this.anchors.items.length - 1].side = Math.sign(hop.anchor[0]) || 1;
    });

    this.placeAnchors();
    this.anchors.enabled = this.wide;
    // Anchoring pulls blocks out of flow, which changes every section's offset.
    requestAnimationFrame(() => { this.measureStations(); this.readRoute(); this.wake(); });
    if (!this.anchors.enabled) this.anchors.release();
    document.body.classList.toggle('anchors-on', this.anchors.enabled);
  }

  /**
   * Copy sits a fixed fraction of the way out from the centre of frame, so it
   * stays comfortably inside the viewport at any aspect ratio instead of
   * drifting off the edge on a wide monitor.
   */
  placeAnchors() {
    const halfH = Math.tan((this.camera.fov / 2) * (Math.PI / 180)) * CAMERA_LEAD;
    const halfW = halfH * this.camera.aspect;
    for (const item of this.anchors.items) {
      item.position.x = (item.side ?? 1) * halfW * 0.44;
    }
  }

  /* ----------------------------------------------------------------------
     Input
     ---------------------------------------------------------------------- */

  bind() {
    this.onScroll = () => { this.readRoute(); this.wake(); };
    addEventListener('scroll', this.onScroll, { passive: true });

    this.onResize = () => { this.resize(); this.wake(); };
    addEventListener('resize', this.onResize, { passive: true });

    this.onPointer = (event) => {
      this.aim.x = (event.clientX / innerWidth - 0.5) * 2;
      this.aim.y = (event.clientY / innerHeight - 0.5) * 2;
      this.wake();
    };
    addEventListener('pointermove', this.onPointer, { passive: true });

    this.onVisibility = () => { if (document.hidden) this.stop(); else this.wake(); };
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  /**
   * Tie each hop to the scroll offset where its section is centred, so the
   * camera and the copy cannot drift apart no matter how tall a section grows.
   * Hops without a section of their own are spread evenly between the ones
   * that have one.
   */
  measureStations() {
    const n = HOPS.length;
    const at = new Array(n).fill(null);

    HOPS.forEach((hop, i) => {
      if (!hop.section) return;
      const element = document.querySelector(hop.section);
      if (!element) return;
      const box = element.getBoundingClientRect();
      at[i] = box.top + scrollY + box.height / 2 - innerHeight / 2;
    });

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (at[0] === null) at[0] = 0;
    if (at[n - 1] === null) at[n - 1] = maxScroll;

    let known = 0;
    for (let i = 1; i < n; i++) {
      if (at[i] === null) continue;
      const span = i - known;
      for (let k = 1; k < span; k++) {
        at[known + k] = at[known] + ((at[i] - at[known]) * k) / span;
      }
      known = i;
    }

    // Monotonic, so a short section can never send the camera backwards.
    for (let i = 1; i < n; i++) at[i] = Math.max(at[i], at[i - 1] + 1);
    this.stations = at;
  }

  /** Where the camera wants to be for the current scroll position. */
  readRoute() {
    const at = this.stations;
    if (!at.length) return;
    const y = scrollY;
    const last = at.length - 1;

    if (y <= at[0]) { this.targetZ = hopZ(0) + CAMERA_LEAD; return; }
    if (y >= at[last]) { this.targetZ = hopZ(last) + CAMERA_LEAD; return; }

    let i = 0;
    while (i < last - 1 && y > at[i + 1]) i++;
    const t = clamp((y - at[i]) / Math.max(1, at[i + 1] - at[i]), 0, 1);
    this.targetZ = mix(hopZ(i), hopZ(i + 1), t) + CAMERA_LEAD;
  }

  resize() {
    const width = innerWidth;
    const height = innerHeight;
    this.wide = width >= 1000;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.tier.dpr));
    this.renderer.setSize(width, height, false);
    this.measureStations();
    this.readRoute();

    if (this.anchors.items.length) {
      this.placeAnchors();
      const on = this.wide;
      if (on !== this.anchors.enabled) {
        this.anchors.enabled = on;
        if (!on) this.anchors.release();
        document.body.classList.toggle('anchors-on', on);
      }
    }
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
      if (this.frame(now)) this.raf = requestAnimationFrame(this.tick);
      else { this.running = false; this.raf = 0; }
    };
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  frame(now) {
    const dt = clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    this.time += dt;

    // The dolly: scroll sets a target, the camera eases toward it. That lag is
    // the difference between a scroll effect and a camera move.
    const damp = 1 - Math.pow(0.0025, dt);
    this.z += (this.targetZ - this.z) * damp;
    const settling = Math.abs(this.targetZ - this.z) > 0.0008;
    if (!settling) this.z = this.targetZ;

    const ease = 1 - Math.pow(0.02, dt);
    this.pointer.x += (this.aim.x - this.pointer.x) * ease;
    this.pointer.y += (this.aim.y - this.pointer.y) * ease;

    const z = this.z;

    // A slow lateral drift so the corridor is travelled rather than stared down.
    // Tied to depth, so it swings once per hop however long that hop's section is.
    const sway = Math.sin((CAMERA_LEAD - z) / SPACING * Math.PI * 0.5) * 0.55;

    // Formations sit to one side so they do not land on top of the copy pinned
    // to the other. Once the copy un-anchors and stacks in normal flow there is
    // nothing to make room for, and that same offset would push the formation
    // clean off a narrow screen — so the camera tracks it across instead.
    const where = clamp((CAMERA_LEAD - z) / SPACING, 0, HOPS.length - 1);
    const a = Math.floor(where);
    const b = Math.min(HOPS.length - 1, a + 1);
    const track = this.wide ? 0 : mix(formationShift(a), formationShift(b), where - a);

    // And on a narrow screen the copy occupies the lower half, so the camera
    // drops to lift the formation into the space above it.
    const lift = this.wide ? 0 : -0.6;

    this.camera.position.set(
      track + sway * (this.wide ? 1 : 0.3) + this.pointer.x * 0.5,
      0.18 + lift - this.pointer.y * 0.32,
      z,
    );
    this.look.set(track + sway * 0.35, 0.05 + lift, z - 10);
    this.camera.lookAt(this.look);

    this.anchors.update();
    this.renderer.render(this.scene, this.camera);

    const drifting = Math.abs(this.aim.x - this.pointer.x) > 0.002
      || Math.abs(this.aim.y - this.pointer.y) > 0.002;
    return settling || drifting;
  }

  dispose() {
    this.stop();
    this.anchors.release();
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
