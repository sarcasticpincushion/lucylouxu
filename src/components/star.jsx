import React, { useEffect, useRef } from 'react';
import { VERTICES, FACES } from './../resources/starData';

// ASCII grid resolution. Phones render at a smaller grid (see the effect
// below): fewer cells means far fewer triangles to rasterize and a much
// shorter output string, which is the difference between a smooth star and a
// crashed tab on low-end devices.
const DESKTOP_WIDTH = 120;
const DESKTOP_HEIGHT = 80;
const MOBILE_WIDTH = 72;
const MOBILE_HEIGHT = 48;

const ASCII_CHARS = ' .:-+*=%@#';

// Below this viewport width the star only accepts touch drags within a small
// centered hotspot, so most of it still passes scroll gestures to the page.
const MOBILE_BREAKPOINT = 576; // px
const MOBILE_HOTSPOT_FRACTION = 0.4; // fraction of the star box (centered)

// On phones, cap the animation frame rate. The star spins slowly, so half the
// frames look the same but cost half the CPU/GC. Desktop stays uncapped (60fps).
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const ROTATION_PER_FRAME = 0.003; // radians added each rendered frame at 60fps

function normalizeVertices(verts) {
  if (verts.length === 0) return [];
  let minX = verts[0][0],
    maxX = verts[0][0];
  let minY = verts[0][1],
    maxY = verts[0][1];
  let minZ = verts[0][2],
    maxZ = verts[0][2];
  for (let v of verts) {
    minX = Math.min(minX, v[0]);
    maxX = Math.max(maxX, v[0]);
    minY = Math.min(minY, v[1]);
    maxY = Math.max(maxY, v[1]);
    minZ = Math.min(minZ, v[2]);
    maxZ = Math.max(maxZ, v[2]);
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  const scale = size > 0 ? 3.0 / size : 1.0;
  return verts.map((v) => [
    (v[0] - centerX) * scale,
    (v[1] - centerY) * scale,
    (v[2] - centerZ) * scale,
  ]);
}

// The geometry and lighting never change, so do this expensive work exactly
// once at module load instead of re-deriving it on every animation frame.
const BASE_VERTICES = normalizeVertices(VERTICES);
const VERTEX_COUNT = BASE_VERTICES.length;

const LIGHT_DIR = (() => {
  const d = [0.5, 0.5, -1];
  const len = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) || 1;
  return [d[0] / len, d[1] / len, d[2] / len];
})();

const PROJ_SCALE = Math.tan((45 * Math.PI) / 360);

// Build a renderer for a given grid size. All scratch buffers are allocated
// once here and reused across every frame, so a running star produces no
// per-frame garbage (the previous version allocated ~30k arrays per frame).
function createRenderer(width, height) {
  const rot = new Float64Array(VERTEX_COUNT * 3); // rotated 3D coords
  const projX = new Int32Array(VERTEX_COUNT); // projected screen x
  const projY = new Int32Array(VERTEX_COUNT); // projected screen y
  const projZ = new Float64Array(VERTEX_COUNT); // projected depth
  const cellCount = width * height;
  const depthBuffer = new Float64Array(cellCount);
  const lightBuffer = new Float64Array(cellCount);

  return function render(rotX, rotY, cameraDistance) {
    const cosY = Math.cos(rotY),
      sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX),
      sinX = Math.sin(rotX);

    // Rotate (Y then X) and project every vertex into the scratch buffers.
    for (let i = 0; i < VERTEX_COUNT; i++) {
      const v = BASE_VERTICES[i];
      // rotateY
      const x1 = v[0] * cosY + v[2] * sinY;
      const y1 = v[1];
      const z1 = -v[0] * sinY + v[2] * cosY;
      // rotateX
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const o = i * 3;
      rot[o] = x1;
      rot[o + 1] = y2;
      rot[o + 2] = z2;
      // project
      const zScreen = z2 + cameraDistance;
      const xProj = x1 / zScreen / PROJ_SCALE;
      const yProj = y2 / zScreen / PROJ_SCALE;
      projX[i] = Math.round(((xProj + 1) * width) / 2);
      projY[i] = Math.round(((1 - yProj) * height) / 2);
      projZ[i] = zScreen;
    }

    depthBuffer.fill(100);
    lightBuffer.fill(0);

    for (let f = 0; f < FACES.length; f++) {
      const face = FACES[f];
      const n = face.length;
      if (n < 3) continue;

      const i0 = face[0],
        i1 = face[1],
        i2 = face[2];

      let sumDepth = 0;
      for (let k = 0; k < n; k++) sumDepth += projZ[face[k]];
      const avgDepth = sumDepth / n;

      // Face normal from the first three rotated vertices.
      const o0 = i0 * 3,
        o1 = i1 * 3,
        o2 = i2 * 3;
      const e1x = rot[o1] - rot[o0],
        e1y = rot[o1 + 1] - rot[o0 + 1],
        e1z = rot[o1 + 2] - rot[o0 + 2];
      const e2x = rot[o2] - rot[o0],
        e2y = rot[o2 + 1] - rot[o0 + 1],
        e2z = rot[o2 + 2] - rot[o0 + 2];
      const nx = e1y * e2z - e1z * e2y;
      const ny = e1z * e2x - e1x * e2z;
      const nz = e1x * e2y - e1y * e2x;
      const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const dot =
        (nx / nLen) * LIGHT_DIR[0] +
        (ny / nLen) * LIGHT_DIR[1] +
        (nz / nLen) * LIGHT_DIR[2];
      const lighting = dot > 0 ? dot : 0;

      // Rasterize the face as a triangle fan.
      for (let i = 1; i < n - 1; i++) {
        const a = face[0],
          b = face[i],
          c = face[i + 1];
        const ax = projX[a],
          ay = projY[a];
        const bx = projX[b],
          by = projY[b];
        const cx = projX[c],
          cy = projY[c];

        let minX = ax < bx ? (ax < cx ? ax : cx) : bx < cx ? bx : cx;
        let maxX = ax > bx ? (ax > cx ? ax : cx) : bx > cx ? bx : cx;
        let minY = ay < by ? (ay < cy ? ay : cy) : by < cy ? by : cy;
        let maxY = ay > by ? (ay > cy ? ay : cy) : by > cy ? by : cy;
        if (minX < 0) minX = 0;
        if (minY < 0) minY = 0;
        if (maxX > width - 1) maxX = width - 1;
        if (maxY > height - 1) maxY = height - 1;

        for (let y = minY; y <= maxY; y++) {
          const row = y * width;
          for (let x = minX; x <= maxX; x++) {
            const idx = row + x;
            if (avgDepth < depthBuffer[idx]) {
              depthBuffer[idx] = avgDepth;
              lightBuffer[idx] = lighting;
            }
          }
        }
      }
    }

    let output = '';
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = row + x;
        if (depthBuffer[idx] < 99) {
          const stepped = Math.pow(lightBuffer[idx], 0.4);
          const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          const jitter = (noise - 0.5) * 0.2;
          const rawIdx = (1 - stepped) * (ASCII_CHARS.length - 1) + jitter;
          const charIdx = Math.floor(
            Math.max(0, Math.min(ASCII_CHARS.length - 1, rawIdx))
          );
          output += ASCII_CHARS[charIdx];
        } else {
          output += ' ';
        }
      }
      output += '\n';
    }
    return output;
  };
}

export default function Asset6AsciiViewer() {
  const preRef = useRef(null);
  const stateRef = useRef({
    rotationX: 0,
    rotationY: 0,
    cameraDistance: 5,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });
  const animFrameRef = useRef(null);
  // Set by the animation effect; the input effect calls it to redraw on drag.
  const drawRef = useRef(null);

  // Animation loop: renders the spinning star, throttled and paused when it
  // isn't needed.
  useEffect(() => {
    const el = preRef.current;
    if (!el) return;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const width = isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH;
    const height = isMobile ? MOBILE_HEIGHT : DESKTOP_HEIGHT;
    const render = createRenderer(width, height);

    const draw = () => {
      const { rotationX, rotationY, cameraDistance } = stateRef.current;
      el.textContent = render(rotationX, rotationY, cameraDistance);
    };
    drawRef.current = draw;

    draw(); // initial frame

    // Users who prefer reduced motion get a single static frame, no loop.
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return () => {
        drawRef.current = null;
      };
    }

    // Don't burn CPU rendering the star once it's scrolled out of view.
    let visible = true;
    let observer = null;
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      observer.observe(el);
    }

    const frameInterval = isMobile ? FRAME_INTERVAL : 0; // 0 = every frame
    // Keep the spin speed consistent regardless of the capped frame rate.
    const rotationStep = isMobile
      ? ROTATION_PER_FRAME * (60 / TARGET_FPS)
      : ROTATION_PER_FRAME;
    let lastTime = 0;

    const animate = (now) => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!visible) return;
      if (now - lastTime < frameInterval) return;
      lastTime = now;
      if (!stateRef.current.isDragging) {
        stateRef.current.rotationY += rotationStep;
        draw();
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (observer) observer.disconnect();
      drawRef.current = null;
    };
  }, []);

  // Pointer/touch input: rotate the star by dragging.
  useEffect(() => {
    const el = preRef.current;
    if (!el) return;

    const startDrag = (x, y) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastMouseX = x;
      stateRef.current.lastMouseY = y;
    };

    const moveDrag = (x, y) => {
      if (!stateRef.current.isDragging) return;
      const deltaX = x - stateRef.current.lastMouseX;
      const deltaY = y - stateRef.current.lastMouseY;
      stateRef.current.rotationY -= deltaX * 0.01;
      stateRef.current.rotationX -= deltaY * 0.01;
      stateRef.current.lastMouseX = x;
      stateRef.current.lastMouseY = y;
      if (drawRef.current) drawRef.current();
    };

    const endDrag = () => {
      stateRef.current.isDragging = false;
    };

    // Mouse: only start a drag when pressing directly on the star, but
    // track movement/release on the document so the drag keeps going even
    // if the cursor wanders off the star mid-drag.
    const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
    const handleMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();

    // Touch: touch events are implicitly captured to the element that
    // received touchstart, so move/end can live on the element itself.
    // On small (mobile) viewports, only start a drag when the touch lands in
    // a small central hotspot; touches elsewhere on the star box fall through
    // to the page so vertical scrolling still works.
    const isInTouchHotspot = (x, y) => {
      if (window.innerWidth > MOBILE_BREAKPOINT) return true;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const halfW = (rect.width * MOBILE_HOTSPOT_FRACTION) / 2;
      const halfH = (rect.height * MOBILE_HOTSPOT_FRACTION) / 2;
      return Math.abs(x - cx) <= halfW && Math.abs(y - cy) <= halfH;
    };

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      if (!isInTouchHotspot(t.clientX, t.clientY)) return;
      startDrag(t.clientX, t.clientY);
    };
    const handleTouchMove = (e) => {
      if (!stateRef.current.isDragging) return;
      e.preventDefault(); // don't scroll the page while rotating the star
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    };
    const handleTouchEnd = () => endDrag();

    el.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return <pre ref={preRef} className="star"></pre>;
}
