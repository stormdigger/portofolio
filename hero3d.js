import * as THREE from './assets/vendor/three.module.js';

/**
 * The single 3D moment on the page: a slowly rotating node network that stands
 * for a distributed system. Deliberately small in scope — it lives inside the
 * hero card, never takes over the viewport, and never hijacks scrolling.
 *
 * Design notes
 * - Lit for a light background: bright ambient, warm key, soft coral/amber
 *   materials matching the page palette. No fog, no bloom, no dark void.
 * - Renders only while the hero is on screen (IntersectionObserver) and pauses
 *   on tab blur, so it costs nothing once the visitor scrolls to the work.
 * - Fails soft: the constructor throws if WebGL is unavailable and the caller
 *   swaps in a static SVG.
 */

const PALETTE = [0xf2604a, 0xf2a03d, 0x3fa87b, 0x3f8fd4, 0x7b62d9, 0xe0577f];

export class HeroScene {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.reduced = reducedMotion;
    this.running = false;
    this.pointer = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0.3, 15.5);

    // Lighting tuned for a pale background: no deep shadows.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xf1e5d8, 2.1));

    const key = new THREE.DirectionalLight(0xfff4e6, 2.4);
    key.position.set(4, 6, 8);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xdce9f7, 1.1);
    fill.position.set(-6, -2, 4);
    this.scene.add(fill);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.buildNetwork();
    this.resize();
    this.bind();
  }

  /**
   * Nodes on a Fibonacci sphere, connected to their nearest neighbours. The
   * even distribution is what makes it read as a network rather than a blob.
   */
  buildNetwork() {
    const COUNT = 26;
    const RADIUS = 3.5;
    const golden = Math.PI * (3 - Math.sqrt(5));

    this.nodes = [];
    const positions = [];

    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      positions.push(new THREE.Vector3(
        Math.cos(theta) * r * RADIUS,
        y * RADIUS,
        Math.sin(theta) * r * RADIUS,
      ));
    }

    const sphere = new THREE.IcosahedronGeometry(0.2, 1);

    positions.forEach((position, i) => {
      const color = PALETTE[i % PALETTE.length];
      const mesh = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({
        color,
        roughness: 0.34,
        metalness: 0.1,
        emissive: color,
        emissiveIntensity: 0.16,
      }));
      mesh.position.copy(position);
      // Vary the size a little so the network has a visual hierarchy.
      mesh.scale.setScalar(0.7 + ((i * 37) % 10) / 14);
      mesh.userData.phase = (i * 1.7) % (Math.PI * 2);
      mesh.userData.home = position.clone();
      this.root.add(mesh);
      this.nodes.push(mesh);
    });

    // Connect each node to the two nearest others, de-duplicated.
    const seen = new Set();
    const segments = [];

    positions.forEach((a, i) => {
      const near = positions
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((entry) => entry.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);

      for (const { j } of near) {
        const pairKey = i < j ? `${i}:${j}` : `${j}:${i}`;
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);
        segments.push(a, positions[j]);
      }
    });

    this.links = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(segments),
      new THREE.LineBasicMaterial({ color: 0xc9ae95, transparent: true, opacity: 0.5 }),
    );
    this.root.add(this.links);

    // A faint shell to give the cluster a silhouette.
    this.shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(RADIUS + 0.55, 1),
      new THREE.MeshBasicMaterial({
        color: 0xf2a03d, wireframe: true, transparent: true, opacity: 0.14,
      }),
    );
    this.root.add(this.shell);
  }

  bind() {
    this.onPointer = (event) => {
      if (this.reduced) return;
      const rect = this.canvas.getBoundingClientRect();
      this.target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      this.target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    this.onLeave = () => { this.target.x = 0; this.target.y = 0; };

    this.canvas.addEventListener('pointermove', this.onPointer, { passive: true });
    this.canvas.addEventListener('pointerleave', this.onLeave, { passive: true });

    this.onVisibility = () => {
      if (document.hidden) this.stop();
      else if (this.visible) this.start();
    };
    document.addEventListener('visibilitychange', this.onVisibility);

    // The card is fluid, so track its box rather than the window's.
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }

    // Only animate while the hero is actually on screen.
    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (entry.isIntersecting && !document.hidden) this.start();
      else this.stop();
    }, { threshold: 0.05 });
    this.observer.observe(this.canvas);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const aspect = width / height;

    this.camera.aspect = aspect;

    // Frame the whole cluster whatever the card's shape: solve the distance
    // that fits SPAN vertically, and again horizontally, and take the larger.
    const SPAN = 4.6;
    const vFov = (this.camera.fov * Math.PI) / 180;
    const distV = SPAN / Math.tan(vFov / 2);
    const distH = SPAN / (Math.tan(vFov / 2) * aspect);
    this.camera.position.z = Math.max(distV, distH);

    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderOnce();
  }

  start() {
    if (this.running || this.reduced) {
      // Reduced motion still deserves one correct frame.
      if (this.reduced) this.renderOnce();
      return;
    }
    this.running = true;
    this.clock ??= new THREE.Clock();
    this.clock.getDelta();
    this.loop = (time) => {
      if (!this.running) return;
      this.frame(time * 0.001);
      this.raf = requestAnimationFrame(this.loop);
    };
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  renderOnce() {
    this.frame(0);
  }

  frame(t) {
    // Ease toward the pointer so the parallax never snaps.
    this.pointer.x += (this.target.x - this.pointer.x) * 0.06;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.06;

    this.root.rotation.y = t * 0.16 + this.pointer.x * 0.42;
    this.root.rotation.x = Math.sin(t * 0.22) * 0.12 - this.pointer.y * 0.3;
    this.shell.rotation.y = -t * 0.09;

    // Nodes breathe gently along their own radius.
    for (const node of this.nodes) {
      const home = node.userData.home;
      const pulse = 1 + Math.sin(t * 1.1 + node.userData.phase) * 0.045;
      node.position.copy(home).multiplyScalar(pulse);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('pointermove', this.onPointer);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
    this.scene.traverse((object) => {
      object.geometry?.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    this.renderer.dispose();
  }
}
