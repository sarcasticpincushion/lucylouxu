import React, { useEffect, useRef, useCallback } from 'react';
import { VERTICES, FACES } from './../resources/starData';

const WIDTH = 120;
const HEIGHT = 80;
const ASCII_CHARS = ' .:-+*=%@#';

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

function rotateX(v, angle) {
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
}

function rotateY(v, angle) {
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
}

function projectVertex(v, camDist) {
  const zScreen = v[2] + camDist;
  const scale = Math.tan((45 * Math.PI) / 360);
  const xProj = v[0] / zScreen / scale;
  const yProj = v[1] / zScreen / scale;
  return [
    Math.round(((xProj + 1) * WIDTH) / 2),
    Math.round(((1 - yProj) * HEIGHT) / 2),
    zScreen,
  ];
}

function renderFrame(rotX, rotY, cameraDistance) {
  let verts = normalizeVertices(VERTICES);
  verts = verts.map((v) => rotateY(v, rotY));
  verts = verts.map((v) => rotateX(v, rotX));
  const projected = verts.map((v) => projectVertex(v, cameraDistance));
  const depthBuffer = Array(HEIGHT)
    .fill(null)
    .map(() => Array(WIDTH).fill(100));

  const lightDir = [0.5, 0.5, -1];
  const lightLen = Math.sqrt(
    lightDir[0] ** 2 + lightDir[1] ** 2 + lightDir[2] ** 2
  );
  lightDir[0] /= lightLen;
  lightDir[1] /= lightLen;
  lightDir[2] /= lightLen;

  const lightBuffer = Array(HEIGHT)
    .fill(null)
    .map(() => Array(WIDTH).fill(0));

  for (let face of FACES) {
    if (face.length < 3) continue;
    const pVerts = face.map((i) => projected[i]).filter((v) => v);
    if (pVerts.length < 3) continue;
    const avgDepth = pVerts.reduce((sum, p) => sum + p[2], 0) / pVerts.length;

    const fVerts = face.map((i) => verts[i]);
    const e1 = [
      fVerts[1][0] - fVerts[0][0],
      fVerts[1][1] - fVerts[0][1],
      fVerts[1][2] - fVerts[0][2],
    ];
    const e2 = [
      fVerts[2][0] - fVerts[0][0],
      fVerts[2][1] - fVerts[0][1],
      fVerts[2][2] - fVerts[0][2],
    ];
    const nx = e1[1] * e2[2] - e1[2] * e2[1];
    const ny = e1[2] * e2[0] - e1[0] * e2[2];
    const nz = e1[0] * e2[1] - e1[1] * e2[0];
    const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const normal = [nx / nLen, ny / nLen, nz / nLen];
    const dot =
      normal[0] * lightDir[0] +
      normal[1] * lightDir[1] +
      normal[2] * lightDir[2];
    const lighting = Math.max(0, dot);

    for (let i = 1; i < pVerts.length - 1; i++) {
      const p1 = pVerts[0],
        p2 = pVerts[i],
        p3 = pVerts[i + 1];
      const minX = Math.max(0, Math.floor(Math.min(p1[0], p2[0], p3[0])));
      const maxX = Math.min(
        WIDTH - 1,
        Math.ceil(Math.max(p1[0], p2[0], p3[0]))
      );
      const minY = Math.max(0, Math.floor(Math.min(p1[1], p2[1], p3[1])));
      const maxY = Math.min(
        HEIGHT - 1,
        Math.ceil(Math.max(p1[1], p2[1], p3[1]))
      );
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (avgDepth < depthBuffer[y][x]) {
            depthBuffer[y][x] = avgDepth;
            lightBuffer[y][x] = lighting;
          }
        }
      }
    }
  }

  let output = '';
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const depth = depthBuffer[y][x];
      if (depth < 99) {
        const brightness = lightBuffer[y][x];
        const stepped = Math.pow(brightness, 0.4);
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

  const updateDisplay = useCallback(() => {
    const { rotationX, rotationY, cameraDistance } = stateRef.current;
    if (preRef.current) {
      preRef.current.textContent = renderFrame(
        rotationX,
        rotationY,
        cameraDistance
      );
    }
  }, []);

  useEffect(() => {
    updateDisplay();

    function animate() {
      if (!stateRef.current.isDragging) {
        stateRef.current.rotationY += 0.003;
        updateDisplay();
      }
      animFrameRef.current = requestAnimationFrame(animate);
    }
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [updateDisplay]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastMouseX = e.clientX;
      stateRef.current.lastMouseY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (stateRef.current.isDragging) {
        const deltaX = e.clientX - stateRef.current.lastMouseX;
        const deltaY = e.clientY - stateRef.current.lastMouseY;
        stateRef.current.rotationY -= deltaX * 0.01;
        stateRef.current.rotationX -= deltaY * 0.01;
        stateRef.current.lastMouseX = e.clientX;
        stateRef.current.lastMouseY = e.clientY;
        updateDisplay();
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      stateRef.current.cameraDistance += e.deltaY * 0.01;
      stateRef.current.cameraDistance = Math.max(
        2,
        Math.min(20, stateRef.current.cameraDistance)
      );
      updateDisplay();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // document.removeEventListener('wheel', handleWheel);
    };
  }, [updateDisplay]);

  return (
    // <div style={styles.wrapper}>
    //   <div style={styles.container}>
    //     <pre ref={preRef} style={styles.output}>
    //       Rendering Asset 6...
    //     </pre>
    //   </div>
    //   <div style={styles.info}>
    //     <div>🖱️ Drag to rotate</div>
    //     <div>🔄 Auto-rotating</div>
    //   </div>
    // </div>
    <pre ref={preRef} style={styles.output}></pre>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Courier New', monospace",
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    cursor: 'grab',
  },
  container: {
    background: '#fff',
    padding: '40px',
    borderRadius: '8px',
    overflow: 'visible',
  },
  output: {
    fontFamily: "'Courier New', monospace",
    fontSize: '6.5px',
    lineHeight: 1,
    whiteSpace: 'pre',
    color: '#000',
    letterSpacing: '0px',
    userSelect: 'none',
    margin: 0,
    cursor: 'pointer',
    // width: '50vw',
    transform: 'scale(1.5)',
  },
  info: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    fontSize: '11px',
    color: '#999',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'right',
    pointerEvents: 'none',
  },
};
