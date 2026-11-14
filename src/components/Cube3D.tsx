import { useEffect, useRef, useState } from 'react';
import { THEMES } from '../constants/themes';
import type { ThemeId } from '../types';

interface Cube3DProps {
  theme: ThemeId;
  animEnabled: boolean;
  cubeImage: string;
  onDoubleTap?: () => void;
}

const V: [number, number, number][] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const F: { v: [number, number, number, number]; n: [number, number, number] }[] = [
  { v: [4, 5, 6, 7], n: [0, 0, 1] },
  { v: [1, 0, 3, 2], n: [0, 0, -1] },
  { v: [0, 4, 7, 3], n: [-1, 0, 0] },
  { v: [5, 1, 2, 6], n: [1, 0, 0] },
  { v: [7, 6, 2, 3], n: [0, 1, 0] },
  { v: [0, 1, 5, 4], n: [0, -1, 0] },
];

export function Cube3D({ theme, animEnabled, cubeImage, onDoubleTap }: Cube3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const texRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef(animEnabled);
  const colorRef = useRef(THEMES[theme]?.cube || '212,175,55');
  const lastTapRef = useRef(0);
  const lastTriggerRef = useRef(0);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [tapped, setTapped] = useState(false);

  animRef.current = animEnabled;
  colorRef.current = THEMES[theme]?.cube || '212,175,55';

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const triggerDoubleTap = () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 350) return;
    lastTriggerRef.current = now;
    lastTapRef.current = 0;
    setTapped(true);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setTapped(false), 450);
    onDoubleTap?.();
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const sz = Math.min(img.naturalWidth, img.naturalHeight);
        if (!sz) {
          texRef.current = null;
          return;
        }
        const ox = (img.naturalWidth - sz) / 2;
        const oy = (img.naturalHeight - sz) / 2;
        const oc = document.createElement('canvas');
        oc.width = 256;
        oc.height = 256;
        const octx = oc.getContext('2d');
        if (octx) {
          octx.drawImage(img, ox, oy, sz, sz, 0, 0, 256, 256);
          texRef.current = oc;
        }
      } catch {
        texRef.current = null;
      }
    };
    img.onerror = () => {
      texRef.current = null;
    };
    img.src = cubeImage;
  }, [cubeImage]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;

    const S = 164;
    cv.width = S;
    cv.height = S;
    const MX = S / 2;
    const MY = S / 2;

    let rx = 0.42;
    let ry = 0.68;
    let vx = 0;
    let vy = 0;
    let drag = false;
    let lx = 0;
    let ly = 0;
    let auto = true;
    let T = 0;
    let rafId = 0;
    let respinTimer: ReturnType<typeof setTimeout> | undefined;

    function rot([x, y, z]: [number, number, number], rX: number, rY: number): [number, number, number] {
      const x1 = x * Math.cos(rY) - z * Math.sin(rY);
      const z1 = x * Math.sin(rY) + z * Math.cos(rY);
      const y2 = y * Math.cos(rX) - z1 * Math.sin(rX);
      const z2 = y * Math.sin(rX) + z1 * Math.cos(rX);
      return [x1, y2, z2];
    }

    function proj([x, y, z]: [number, number, number]): [number, number, number] {
      const fov = 4.1;
      const s = 47;
      return [MX + (x * s * fov) / (fov + z), MY + (y * s * fov) / (fov + z), z];
    }

    function texTri(
      pts2d: [number, number][],
      src: [number, number][],
      image: HTMLCanvasElement
    ) {
      if (!c) return;
      const W = image.width || 256;
      const H = image.height || 256;
      const dx = [pts2d[0][0], pts2d[1][0], pts2d[2][0]];
      const dy = [pts2d[0][1], pts2d[1][1], pts2d[2][1]];
      const sx = [src[0][0], src[1][0], src[2][0]];
      const sy = [src[0][1], src[1][1], src[2][1]];

      c.save();
      c.beginPath();
      c.moveTo(dx[0], dy[0]);
      c.lineTo(dx[1], dy[1]);
      c.lineTo(dx[2], dy[2]);
      c.closePath();
      c.clip();

      const D = sx[0] * (sy[1] - sy[2]) + sx[1] * (sy[2] - sy[0]) + sx[2] * (sy[0] - sy[1]);
      if (Math.abs(D) < 0.001) {
        c.restore();
        return;
      }

      const a = (dx[0] * (sy[1] - sy[2]) + dx[1] * (sy[2] - sy[0]) + dx[2] * (sy[0] - sy[1])) / D;
      const cc = (dx[0] * (sx[2] - sx[1]) + dx[1] * (sx[0] - sx[2]) + dx[2] * (sx[1] - sx[0])) / D;
      const e =
        (dx[0] * (sx[1] * sy[2] - sx[2] * sy[1]) +
          dx[1] * (sx[2] * sy[0] - sx[0] * sy[2]) +
          dx[2] * (sx[0] * sy[1] - sx[1] * sy[0])) /
        D;
      const b = (dy[0] * (sy[1] - sy[2]) + dy[1] * (sy[2] - sy[0]) + dy[2] * (sy[0] - sy[1])) / D;
      const d = (dy[0] * (sx[2] - sx[1]) + dy[1] * (sx[0] - sx[2]) + dy[2] * (sx[1] - sx[0])) / D;
      const f =
        (dy[0] * (sx[1] * sy[2] - sx[2] * sy[1]) +
          dy[1] * (sx[2] * sy[0] - sx[0] * sy[2]) +
          dy[2] * (sx[0] * sy[1] - sx[1] * sy[0])) /
        D;

      c.setTransform(a, b, cc, d, e, f);
      try {
        c.drawImage(image, 0, 0, W, H);
      } catch {
        // ignore
      }
      c.restore();
    }

    function drawTexturedFace(
      pts: [number, number, number][],
      image: HTMLCanvasElement,
      brightness: number
    ) {
      if (!c) return;
      const W = image.width || 256;
      const H = image.height || 256;
      const p2d: [number, number][] = pts.map(([px, py]) => [px, py]);
      texTri(
        [p2d[0], p2d[1], p2d[2]],
        [
          [0, 0],
          [W, 0],
          [W, H],
        ],
        image
      );
      texTri(
        [p2d[0], p2d[2], p2d[3]],
        [
          [0, 0],
          [W, H],
          [0, H],
        ],
        image
      );
      c.save();
      c.beginPath();
      p2d.forEach((p, i) => (i === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1])));
      c.closePath();
      const dark = Math.max(0, (1 - brightness) * 0.6);
      if (dark > 0.01) {
        c.fillStyle = `rgba(0,0,0,${dark})`;
        c.fill();
      }
      c.fillStyle = `rgba(${colorRef.current},.06)`;
      c.fill();
      c.restore();
    }

    function getCubeMat(i: number, lt: number) {
      const [r, g, b] = colorRef.current.split(',').map(Number);
      const facs = [
        [0.14, 0.7],
        [0.04, 0.1],
        [0.07, 0.35],
        [0.1, 0.45],
        [0.12, 0.55],
        [0.02, 0.07],
      ];
      const [f1, f2] = facs[i] || [0.1, 0.5];
      const br = f1 + lt * (f2 - f1);
      return `rgba(${(r * br) | 0},${(g * br) | 0},${(b * br) | 0},${0.75 + lt * 0.15})`;
    }

    function draw() {
      if (!c) return;
      const cubeColor = colorRef.current;
      c.clearRect(0, 0, S, S);
      const rv = V.map((v) => rot(v, rx, ry));
      const pv = rv.map(proj);
      const fd = F.map((f, i) => {
        const rn = rot(f.n, rx, ry);
        const depth = f.v.reduce((s, vi) => s + rv[vi][2], 0) / 4;
        return { pts: f.v.map((vi) => pv[vi]), depth, dot: rn[2], i };
      }).sort((a, b) => a.depth - b.depth);

      const grd = c.createRadialGradient(MX, MY, 10, MX, MY, 70);
      grd.addColorStop(0, `rgba(${cubeColor},.04)`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = grd;
      c.fillRect(0, 0, S, S);

      fd.forEach(({ pts, dot, i }) => {
        if (dot > 0.04) return;
        const lt = Math.max(0, -dot);
        const spec = Math.pow(lt, 5) * 0.8;
        const br = 0.08 + lt * 0.92;
        if (texRef.current) {
          drawTexturedFace(pts, texRef.current, br);
        } else {
          c.beginPath();
          pts.forEach((p, k) => (k === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1])));
          c.closePath();
          c.fillStyle = getCubeMat(i, lt);
          c.fill();
        }
        c.beginPath();
        pts.forEach((p, k) => (k === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1])));
        c.closePath();
        c.strokeStyle = `rgba(${cubeColor},${(0.06 + lt * 0.5).toFixed(2)})`;
        c.lineWidth = 0.6;
        c.shadowBlur = lt > 0.65 ? 12 : 4;
        c.shadowColor = `rgba(${cubeColor},.6)`;
        c.stroke();
        c.shadowBlur = 0;

        if (spec > 0.05 && pts.length === 4) {
          const sx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4;
          const sy = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) / 4;
          const sg = c.createRadialGradient(sx - 8, sy - 8, 0, sx, sy, 24);
          sg.addColorStop(0, `rgba(255,255,255,${(spec * 0.2).toFixed(2)})`);
          sg.addColorStop(1, 'rgba(255,255,255,0)');
          c.beginPath();
          pts.forEach((p, k) => (k === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1])));
          c.closePath();
          c.fillStyle = sg;
          c.fill();
        }
      });

      rv.forEach((v) => {
        if (v[2] > 0.45) return;
        const [px, py] = proj(v);
        const a = Math.max(0, (-v[2] + 1) * 0.4);
        c.shadowBlur = 4;
        c.shadowColor = `rgba(${cubeColor},.6)`;
        c.fillStyle = `rgba(${cubeColor},${a.toFixed(2)})`;
        c.beginPath();
        c.arc(px, py, 1.2, 0, Math.PI * 2);
        c.fill();
      });
      c.shadowBlur = 0;
    }

    function loop() {
      T += 0.02;
      if (auto && !drag) {
        ry += 0.012 + Math.sin(T * 0.4) * 0.004;
        rx += 0.004 + Math.cos(T * 0.3) * 0.002;
      }
      if (!drag) {
        vx *= 0.88;
        vy *= 0.88;
        rx += vx;
        ry += vy;
      }
      draw();
      if (animRef.current) {
        rafId = requestAnimationFrame(loop);
      }
    }

    loop();

    const reSpin = () => {
      if (respinTimer) clearTimeout(respinTimer);
      respinTimer = setTimeout(() => {
        auto = true;
        if (animRef.current) {
          cancelAnimationFrame(rafId);
          loop();
        }
      }, 3500);
    };

    const onMouseDown = (e: MouseEvent) => {
      drag = true;
      auto = false;
      lx = e.clientX;
      ly = e.clientY;
      vx = 0;
      vy = 0;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!drag) return;
      vy += (e.clientX - lx) * 0.014;
      vx += (e.clientY - ly) * 0.014;
      ry += vy;
      rx += vx;
      lx = e.clientX;
      ly = e.clientY;
      if (!animRef.current) draw();
    };
    const onMouseUp = () => {
      if (!drag) return;
      drag = false;
      reSpin();
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      drag = true;
      auto = false;
      lx = e.touches[0].clientX;
      ly = e.touches[0].clientY;
      vx = 0;
      vy = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!drag) return;
      vy += (e.touches[0].clientX - lx) * 0.014;
      vx += (e.touches[0].clientY - ly) * 0.014;
      ry += vy;
      rx += vx;
      lx = e.touches[0].clientX;
      ly = e.touches[0].clientY;
      if (!animRef.current) draw();
    };
    const onTouchEnd = () => {
      drag = false;
      reSpin();
    };

    cv.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    cv.addEventListener('touchstart', onTouchStart, { passive: false });
    cv.addEventListener('touchmove', onTouchMove, { passive: false });
    cv.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(rafId);
      if (respinTimer) clearTimeout(respinTimer);
      cv.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cv.removeEventListener('touchstart', onTouchStart);
      cv.removeEventListener('touchmove', onTouchMove);
      cv.removeEventListener('touchend', onTouchEnd);
    };
  }, [animEnabled]);

  return (
    <div className="cube-wrap">
      <canvas id="c3" ref={canvasRef} width={164} height={164} />
      <div
        className={`baron-circle${tapped ? ' tapped' : ''}`}
        id="baronCircle"
        onDoubleClick={triggerDoubleTap}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') return;
          const now = Date.now();
          const delta = now - lastTapRef.current;
          if (delta > 30 && delta <= 350) {
            triggerDoubleTap();
          } else {
            lastTapRef.current = now;
          }
        }}
      >
        <img src={cubeImage} alt="" id="baronImg" draggable={false} />
      </div>
    </div>
  );
}
