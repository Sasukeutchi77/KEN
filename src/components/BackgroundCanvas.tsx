import { useEffect, useRef } from 'react';
import { CREST_IMAGE, THEMES } from '../constants/themes';
import type { ThemeId } from '../types';

interface BackgroundCanvasProps {
  theme: ThemeId;
  bgEffectsEnabled: boolean;
  bgMediaUrl: string;
  bgIsVideo: boolean;
}

export function BackgroundCanvas({
  theme,
  bgEffectsEnabled,
  bgMediaUrl,
  bgIsVideo,
}: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const themeRef = useRef(theme);
  const enabledRef = useRef(bgEffectsEnabled);

  themeRef.current = theme;
  enabledRef.current = bgEffectsEnabled;

  useEffect(() => {
    if (bgIsVideo && videoRef.current && bgMediaUrl) {
      videoRef.current.play().catch(() => {});
    }
  }, [bgIsVideo, bgMediaUrl]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const resize = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00004,
      vy: (Math.random() - 0.5) * 0.00004,
      r: 0.6 + Math.random() * 0.8,
      t: Math.random() * Math.PI * 2,
      ts: 0.003 + Math.random() * 0.004,
      ci: i % 2,
    }));

    const rings = Array.from({ length: 4 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00003,
      vy: (Math.random() - 0.5) * 0.00003,
      radius: 50 + Math.random() * 70,
      t: Math.random() * Math.PI * 2,
      ts: 0.001 + Math.random() * 0.002,
      ci: Math.random() < 0.5 ? 0 : 1,
    }));

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0001,
      vy: -(0.00008 + Math.random() * 0.00012),
      size: 0.6 + Math.random() * 1.2,
      alpha: Math.random() * 0.3 + 0.05,
      t: Math.random() * Math.PI * 2,
      ts: 0.008 + Math.random() * 0.012,
      ci: Math.random() < 0.5 ? 0 : 1,
    }));

    let scanOff = 0;
    let rafId = 0;

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      if (!enabledRef.current) {
        rafId = requestAnimationFrame(frame);
        return;
      }

      const activeTheme = themeRef.current;
      const spec = THEMES[activeTheme] || THEMES.ombres;
      const orbColors = [spec.orb1, spec.orb2];

      if (activeTheme === 'sombre' || activeTheme === 'assassin' || activeTheme === 'blood') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        const col =
          activeTheme === 'sombre'
            ? '150,115,25'
            : activeTheme === 'blood'
              ? '138,0,16'
              : '180,0,10';
        const orbs2 = [
          { x: 0.15, y: 0.2, r: 280 },
          { x: 0.82, y: 0.5, r: 320 },
          { x: 0.5, y: 0.88, r: 250 },
          { x: 0.08, y: 0.72, r: 200 },
          { x: 0.88, y: 0.15, r: 240 },
        ];
        orbs2.forEach((o, i) => {
          const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.0005 + i * 1.2);
          const g = ctx.createRadialGradient(o.x * W, o.y * H, 0, o.x * W, o.y * H, o.r);
          g.addColorStop(0, `rgba(${col},${0.2 * pulse})`);
          g.addColorStop(0.4, `rgba(${col},${0.12 * pulse})`);
          g.addColorStop(0.75, `rgba(${col},${0.06 * pulse})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        });
        rafId = requestAnimationFrame(frame);
        return;
      }

      const vig = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.hypot(W, H) * 0.72
      );
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,.42)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      const step = 52;
      ctx.lineWidth = 0.45;
      for (let x = 0; x <= W; x += step) {
        const a = 0.025 + 0.015 * Math.sin(x * 0.05 + scanOff * 0.4);
        ctx.strokeStyle =
          activeTheme === 'ombres'
            ? `rgba(255,0,38,${a})`
            : `rgba(56,190,255,${a})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += step) {
        const a = 0.022 + 0.014 * Math.sin(y * 0.05 + scanOff * 0.3);
        ctx.strokeStyle =
          activeTheme === 'ombres'
            ? `rgba(180,0,28,${a})`
            : `rgba(212,175,55,${a})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const scanY = (scanOff * 0.65) % H;
      const sl = ctx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
      const scanCol = activeTheme === 'ombres' ? '255,0,38' : '56,190,255';
      sl.addColorStop(0, `rgba(${scanCol},0)`);
      sl.addColorStop(0.5, `rgba(${scanCol},.09)`);
      sl.addColorStop(1, `rgba(${scanCol},0)`);
      ctx.fillStyle = sl;
      ctx.fillRect(0, scanY - 3, W, 6);
      scanOff += 0.55;

      orbs.forEach((o) => {
        o.x += o.vx;
        o.y += o.vy;
        o.t += o.ts;
        if (o.x < -0.1) o.x = 1.1;
        if (o.x > 1.1) o.x = -0.1;
        if (o.y < -0.1) o.y = 1.1;
        if (o.y > 1.1) o.y = -0.1;
        const px = o.x * W;
        const py = o.y * H;
        const pulse = 0.5 + 0.5 * Math.sin(o.t);
        const rad = (o.r + pulse * o.r * 0.4) * 80;
        const col = orbColors[o.ci] || '56,190,255';
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, `rgba(${col},${0.08 * pulse})`);
        g.addColorStop(0.5, `rgba(${col},${0.03 * pulse})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      rings.forEach((r) => {
        r.x += r.vx;
        r.y += r.vy;
        r.t += r.ts;
        if (r.x < 0) r.x = 1;
        if (r.x > 1) r.x = 0;
        if (r.y < 0) r.y = 1;
        if (r.y > 1) r.y = 0;
        const px = r.x * W;
        const py = r.y * H;
        const pulse = 0.4 + 0.6 * Math.sin(r.t);
        const col = orbColors[r.ci] || '56,190,255';
        ctx.beginPath();
        ctx.arc(px, py, r.radius * (0.8 + 0.2 * pulse), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${col},${0.04 * pulse})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, r.radius * (0.4 + 0.1 * pulse), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${col},${0.02 * pulse})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.t += p.ts;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        const blink = 0.5 + 0.5 * Math.sin(p.t);
        const col = orbColors[p.ci] || '56,190,255';
        ctx.fillStyle = `rgba(${col},${p.alpha * blink})`;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas id="bg" ref={canvasRef} />
      {!bgIsVideo && <img id="bg3img" src={bgMediaUrl} alt="" />}
      <video
        id="bg3vid"
        ref={videoRef}
        src={bgIsVideo ? bgMediaUrl : undefined}
        autoPlay
        muted
        loop
        playsInline
        style={{ display: bgIsVideo ? 'block' : 'none' }}
      />
      <div className="bg-scrim" />
      <img className="site-watermark" src={CREST_IMAGE} alt="" />
    </>
  );
}
