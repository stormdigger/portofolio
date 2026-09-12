import * as THREE from './assets/vendor/three.module.js';

/**
 * Anchored copy: real HTML, positioned from the 3D scene.
 *
 * A card sitting in front of a canvas always reads as a card, because it never
 * agrees with what is behind it. Here each block is pinned to a point in the
 * corridor and given one `transform` per frame, computed by projecting that
 * point through the same camera that draws the world. The text arrives out of
 * depth, holds while it is beside the camera, and leaves past the shoulder —
 * because the node it belongs to does.
 *
 * Why HTML rather than text drawn into the canvas: it stays selectable,
 * searchable, translatable, reachable by a screen reader, and styled by the
 * same stylesheet as the rest of the site. The scene only decides where it goes.
 *
 * Deliberately restrained on scale. Depth is carried by position and opacity;
 * scaling runs over a narrow range because large scale factors on live text
 * look soft and cost real paint time.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Beyond this distance a block is not worth drawing. */
const FAR = 15.5;
/** Inside this distance it has gone past the camera's shoulder. */
const NEAR = 1.4;

export class Anchors {
  constructor(camera) {
    this.camera = camera;
    this.items = [];
    this.probe = new THREE.Vector3();
    this.enabled = false;
  }

  /**
   * @param element  the block to position
   * @param position world-space point it is pinned to
   */
  add(element, position) {
    if (!element) return;
    element.classList.add('anchored');
    // Start hidden. A block whose hop is far down the corridor is out of range
    // on the first frame, and the update loop skips anything already offscreen —
    // so without this it would sit there, positioned but never placed.
    element.hidden = true;
    this.items.push({
      element,
      position: new THREE.Vector3(position[0], position[1], position[2]),
      shown: false,
      live: false,
    });
  }

  /** Hand every block back to normal document flow. */
  release() {
    this.enabled = false;
    for (const item of this.items) {
      item.element.classList.remove('anchored', 'anchor-live');
      item.element.style.transform = '';
      item.element.style.opacity = '';
      item.element.hidden = false;
      item.shown = false;
      item.live = false;
    }
  }

  update() {
    if (!this.enabled) return;

    const halfW = innerWidth / 2;
    const halfH = innerHeight / 2;
    const camera = this.camera;

    for (const item of this.items) {
      // Distance along the camera's own forward axis, not straight-line
      // distance — a block off to one side should not read as further away.
      const depth = camera.position.z - item.position.z;

      if (depth < NEAR || depth > FAR) {
        if (item.shown) {
          item.element.hidden = true;
          item.element.classList.remove('anchor-live');
          item.shown = false;
          item.live = false;
        }
        continue;
      }

      if (!item.shown) {
        item.element.hidden = false;
        item.shown = true;
      }

      this.probe.copy(item.position).project(camera);

      const x = this.probe.x * halfW + halfW;
      const y = -this.probe.y * halfH + halfH;

      // In front of the camera for a while, then receding.
      const approach = clamp((FAR - depth) / (FAR * 0.42), 0, 1);
      const leaving = clamp((depth - NEAR) / 2.6, 0, 1);
      const opacity = approach * leaving;

      // A narrow range: enough to feel like depth, not enough to blur the type.
      const scale = clamp(0.86 + (1 - depth / FAR) * 0.22, 0.86, 1.06);

      item.element.style.transform =
        `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) translate(-50%, -50%)`;
      item.element.style.opacity = opacity.toFixed(3);

      // Only the block the camera is actually beside takes clicks, so a fading
      // neighbour can never swallow a link.
      const live = opacity > 0.62;
      if (live !== item.live) {
        item.element.classList.toggle('anchor-live', live);
        item.live = live;
      }
    }
  }
}
