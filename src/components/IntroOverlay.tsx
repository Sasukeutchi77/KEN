import { useEffect, useState } from 'react';

interface IntroOverlayProps {
  onEnter: () => void;
}

export function IntroOverlay({ onEnter }: IntroOverlayProps) {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  const handleEnter = () => {
    onEnter();
    setFading(true);
    setTimeout(() => setHidden(true), 800);
  };

  return (
    <div
      id="introOverlay"
      className={fading ? 'hide' : undefined}
      style={{ opacity: fading ? 0 : visible ? 1 : 0 }}
    >
      <div className="intro-bg-glow" />
      <h1>check ban ᤢᩧ𝑲𝑬𝑵 ༄𝘿᭄⋆ 𝑲𝑨𝑵𝑬𝑲𝑰⋆𒌋꯭⵿</h1>
      <p>✦ 1000 - 7 · JUGEMENT DES GHOULS ✦</p>
      <button type="button" className="intro-btn" id="introBtn" onClick={handleEnter}>
        ENTRER
      </button>
    </div>
  );
}
