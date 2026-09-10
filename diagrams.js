/**
 * Animated architecture diagrams, as inline SVG.
 *
 * Each diagram shows the real shape of the system rather than decorating the
 * card: nodes are the actual services, and the travelling pulse follows the
 * request path described in the project's `flow`. Motion comes from CSS
 * (`.diagram .pulse`), so `prefers-reduced-motion` disables it for free and
 * nothing depends on JavaScript running per frame.
 *
 * All diagrams share a 320×190 viewBox and scale to their container.
 */

const W = 320;
const H = 190;

/** A rounded node box with a centred label. */
function node(x, y, label, { w = 82, h = 34 } = {}) {
  return `
    <rect class="node" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="9"/>
    <text class="node-label" x="${x}" y="${y + 3}">${label}</text>
  `;
}

/** A wire plus the pulse that travels along it. `d` staggers the animation. */
function wire(path, delay = 0) {
  return `
    <path class="wire" d="${path}"/>
    <path class="pulse" d="${path}" style="--d:${delay}s"/>
  `;
}

function svg(inner) {
  return `<svg class="diagram" viewBox="0 0 ${W} ${H}" role="img" fill="none">${inner}</svg>`;
}

/**
 * Arovita: client → API Gateway → Lambda → PostgreSQL, with Cognito verifying
 * the token at the gateway. Laid out on two rows so no node sits on a wire.
 */
function serverless() {
  return svg(`
    <circle class="halo" cx="160" cy="58" r="50"/>

    ${wire('M 50 58 H 116')}
    ${wire('M 204 58 H 268', 0.5)}
    ${wire('M 268 76 V 104 H 246', 1)}

    ${node(50, 58, 'CLIENT', { w: 58 })}
    ${node(160, 58, 'API GATEWAY')}
    ${node(268, 58, 'LAMBDA', { w: 58 })}
    ${node(200, 118, 'POSTGRESQL', { w: 92 })}

    <path class="wire" d="M 132 74 V 104" stroke-dasharray="3 4" stroke-opacity="0.32"/>
    ${node(108, 118, 'COGNITO', { w: 62, h: 28 })}

    <text class="node-label" x="160" y="168" opacity="0.55">JWT · MFA · MULTI-TENANT</text>
  `);
}

/** AgriStore: role-gated commerce ending in a generated invoice. */
function commerce() {
  return svg(`
    <circle class="halo" cx="160" cy="95" r="46"/>
    ${wire('M 56 46 H 130')}
    ${wire('M 190 46 H 264', 0.45)}
    ${wire('M 264 64 V 100 H 190', 0.9)}
    ${wire('M 130 118 H 56', 1.35)}
    ${node(56, 46, 'USER', { w: 60 })}
    ${node(160, 46, 'SPRING BOOT', { w: 96 })}
    ${node(264, 46, 'MYSQL', { w: 60 })}
    ${node(160, 118, 'ORDER', { w: 70 })}
    ${node(56, 118, 'PDF INVOICE', { w: 88 })}
    <text class="node-label" x="160" y="168" opacity="0.55">EC2 · S3 · RDS · BEANSTALK</text>
  `);
}

/** DoctorG: voice in, vision + reasoning, speech out — a loop. */
function multimodal() {
  return svg(`
    <circle class="halo" cx="160" cy="95" r="50"/>
    ${wire('M 58 52 H 122')}
    ${wire('M 198 52 H 262', 0.5)}
    ${wire('M 262 70 V 128 H 198', 1)}
    ${wire('M 122 128 H 58 V 70', 1.5)}
    ${node(58, 52, 'VOICE', { w: 62 })}
    ${node(160, 52, 'WHISPER', { w: 72 })}
    ${node(262, 52, 'VISION', { w: 62 })}
    ${node(160, 128, 'GROQ · LLAMA 3', { w: 104 })}
    ${node(58, 128, 'SPEECH', { w: 62 })}
  `);
}

/** Research: one input fanning out to three models, then a comparison. */
function benchmark() {
  const bars = [
    { x: 108, h: 38 },
    { x: 152, h: 54 },
    { x: 196, h: 30 },
  ].map(({ x, h }, i) => `
    <rect class="node" x="${x - 15}" y="${132 - h}" width="30" height="${h}" rx="5"
          style="animation: breathe 3s ${i * 0.35}s var(--ease) infinite"/>
  `).join('');

  return svg(`
    <circle class="halo" cx="152" cy="86" r="48"/>
    ${wire('M 44 48 H 96 V 78')}
    ${wire('M 44 48 H 152 V 78', 0.4)}
    ${wire('M 44 48 H 208 V 78', 0.8)}
    ${node(44, 48, 'INPUT', { w: 56 })}
    ${bars}
    <text class="node-label" x="108" y="150">YOLOv8</text>
    <text class="node-label" x="152" y="150">R-CNN</text>
    <text class="node-label" x="196" y="150">SSD</text>
    ${node(276, 100, 'RESULT', { w: 62 })}
    <path class="wire" d="M 226 110 H 245" stroke-dasharray="3 4"/>
    <text class="node-label" x="152" y="172" opacity="0.55">ACCURACY · LATENCY</text>
  `);
}

/** FaceMeet: a face gate in front of a two-party session. */
function auth() {
  return svg(`
    <circle class="halo" cx="82" cy="70" r="34"/>
    <circle class="node" cx="82" cy="70" r="26"/>
    <path class="wire" d="M 72 64 h 4 M 88 64 h 4 M 74 80 q 8 6 16 0" stroke-opacity="0.75"/>
    <path class="wire" d="M 56 48 V 40 h 10 M 108 48 V 40 h -10 M 56 92 v 8 h 10 M 108 92 v 8 h -10"
          stroke-opacity="0.6"/>
    ${wire('M 112 70 H 158')}
    ${node(196, 70, 'AUTH · JWT', { w: 84 })}
    ${wire('M 196 88 V 122', 0.6)}
    ${node(196, 138, 'VIDEO SESSION', { w: 108 })}
    <text class="node-label" x="82" y="122" opacity="0.7">FACE</text>
  `);
}

const DIAGRAMS = { serverless, commerce, multimodal, benchmark, auth };

export function renderDiagram(name) {
  return (DIAGRAMS[name] ?? serverless)();
}

/**
 * The hero fallback: a small system sketch used when WebGL is unavailable or
 * the visitor prefers reduced motion.
 */
export function heroFallback() {
  return `
    <svg class="diagram" viewBox="0 0 240 240" role="img"
         aria-label="A layered system diagram" fill="none" style="--tint: var(--coral)">
      <circle class="halo" cx="120" cy="120" r="88"/>
      <circle class="wire" cx="120" cy="120" r="88"/>
      <circle class="wire" cx="120" cy="120" r="62" stroke-dasharray="4 6"/>
      <circle class="node" cx="120" cy="120" r="30"/>
      <text class="node-label" x="120" y="123">CORE</text>
      ${[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 120 + Math.cos(a) * 88;
        const y = 120 + Math.sin(a) * 88;
        return `<circle class="node" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/>`;
      }).join('')}
    </svg>
  `;
}
