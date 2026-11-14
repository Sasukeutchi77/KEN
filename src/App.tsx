import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Cube3D } from './components/Cube3D';
import { HistorySheet } from './components/HistorySheet';
import { IntroOverlay } from './components/IntroOverlay';
import { MusicDock } from './components/MusicDock';
import { SettingsModal } from './components/SettingsModal';
import { VerdictDialogs } from './components/VerdictDialogs';
import {
  ALT_OK_MSG,
  CHECK_API_URL,
  DEFAULT_BG_IMAGE,
  DEFAULT_IMAGE,
  DEFAULTS,
  THEMES,
  applyThemeToDom,
} from './constants/themes';
import type { AppConfig, HistoryItem, ThemeId, VerdictState } from './types';
import { deleteMusicRecord, getMusicRecord, setMusicRecord } from './utils/musicDb';
import { fmtTs, getErr, parsePh } from './utils/phone';

function loadInitialConfig(): AppConfig {
  let theme: ThemeId = 'ombres';
  try {
    const savedTheme = localStorage.getItem('checker-theme') as ThemeId | null;
    if (savedTheme && THEMES[savedTheme]) theme = savedTheme;
  } catch {
    // ignore storage errors
  }

  let banMsg = DEFAULTS.banMsg;
  let okMsg = DEFAULTS.okMsg;
  let anim = DEFAULTS.anim;
  let bg = DEFAULTS.bg;

  try {
    const sc = JSON.parse(localStorage.getItem('kaneki-cfg') || '{}');
    if (sc.banMsg) banMsg = sc.banMsg;
    if (sc.okMsg) okMsg = sc.okMsg;
    if (typeof sc.anim === 'boolean') anim = sc.anim;
    if (typeof sc.bg === 'boolean') bg = sc.bg;
  } catch {
    // ignore storage errors
  }

  return { banMsg, okMsg, anim, bg, theme };
}

function loadInitialHistory(): HistoryItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('xen-hist') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const DEFAULT_SITE_NAME = 'check ban ᤢᩧ𝑲𝑬𝑵 ༄𝘿᭄⋆ 𝑲𝑨𝑵𝑬𝑲𝑰⋆𒌋꯭⵿';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(loadInitialConfig);
  const [title, setTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('kaneki-title') || DEFAULT_SITE_NAME;
    } catch {
      return DEFAULT_SITE_NAME;
    }
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(DEFAULT_SITE_NAME);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const [cubeImage, setCubeImage] = useState<string>(() => {
    try {
      return localStorage.getItem('kaneki-cube-image') || DEFAULT_IMAGE;
    } catch {
      return DEFAULT_IMAGE;
    }
  });

  const [bgMediaUrl, setBgMediaUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('kaneki-bg-image') || DEFAULT_BG_IMAGE;
    } catch {
      return DEFAULT_BG_IMAGE;
    }
  });

  const [bgIsVideo, setBgIsVideo] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kaneki-bg-media-type') === 'video';
    } catch {
      return false;
    }
  });

  const [phone, setPhone] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [phoneErr, setPhoneErr] = useState('');
  const [checking, setChecking] = useState(false);
  const [glitchFrame, setGlitchFrame] = useState<{
    x: number;
    y: number;
    skew: number;
    opacity: number;
    active: boolean;
    c1t: number;
    c1b: number;
    c1x: number;
    c2t: number;
    c2b: number;
    c2x: number;
    corruptText: string;
  } | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(loadInitialHistory);

  const [verdict, setVerdict] = useState<VerdictState>({
    open: false,
    banned: false,
    num: '',
    reason: '',
    ts: '',
  });

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  // Music state & IndexedDB integration
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);
  const musicObjectUrlRef = useRef<string | null>(null);
  const [hasMusic, setHasMusic] = useState(false);
  const [musicName, setMusicName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState<number>(() => {
    try {
      const v0 = parseFloat(localStorage.getItem('music-vol') || '');
      return Number.isNaN(v0) ? 0.7 : v0;
    } catch {
      return 0.7;
    }
  });

  useEffect(() => {
    applyThemeToDom(config.theme);
  }, [config.theme]);

  useEffect(() => {
    if (!checking) {
      setGlitchFrame(null);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const glitchChars = '▓▒░█✖☠∆¥§';

    const corruptTitle = (src: string) => {
      if (Math.random() > 0.45 || src.length < 3) return src;
      const chars = Array.from(src);
      const count = Math.random() > 0.6 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * chars.length);
        if (chars[idx] !== ' ') {
          chars[idx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
      }
      return chars.join('');
    };

    const tick = () => {
      if (cancelled) return;
      const isBurst = Math.random() > 0.28;
      if (isBurst) {
        const c1t = Math.floor(Math.random() * 55);
        const c1h = 14 + Math.floor(Math.random() * 28);
        const c2t = Math.floor(Math.random() * 65);
        const c2h = 12 + Math.floor(Math.random() * 26);
        setGlitchFrame({
          x: Number(((Math.random() - 0.5) * 9).toFixed(1)),
          y: Number(((Math.random() - 0.5) * 4).toFixed(1)),
          skew: Number(((Math.random() - 0.5) * 14).toFixed(1)),
          opacity: Number((0.62 + Math.random() * 0.38).toFixed(2)),
          active: true,
          c1t,
          c1b: Math.max(0, 100 - c1t - c1h),
          c1x: Number(((Math.random() - 0.5) * 18).toFixed(1)),
          c2t,
          c2b: Math.max(0, 100 - c2t - c2h),
          c2x: Number(((Math.random() - 0.5) * 18).toFixed(1)),
          corruptText: corruptTitle(title),
        });
      } else {
        setGlitchFrame({
          x: 0,
          y: 0,
          skew: 0,
          opacity: Number((0.75 + Math.random() * 0.25).toFixed(2)),
          active: false,
          c1t: 0,
          c1b: 100,
          c1x: 0,
          c2t: 0,
          c2b: 100,
          c2x: 0,
          corruptText: title,
        });
      }
      const nextDelay = isBurst
        ? 42 + Math.floor(Math.random() * 85)
        : 60 + Math.floor(Math.random() * 110);
      timer = setTimeout(tick, nextDelay);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [checking, title]);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = musicVolume;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    getMusicRecord()
      .then((rec) => {
        if (rec && rec.blob) {
          if (musicObjectUrlRef.current) URL.revokeObjectURL(musicObjectUrlRef.current);
          const url = URL.createObjectURL(rec.blob);
          musicObjectUrlRef.current = url;
          audio.src = url;
          setHasMusic(true);
          setMusicName(rec.name);
        }
      })
      .catch(() => {});

    const kick = () => {
      const want = (() => {
        try {
          return localStorage.getItem('music-on') !== '0';
        } catch {
          return true;
        }
      })();
      if (audio.src && want && audio.paused) {
        audio.play().catch(() => {});
      }
    };

    const onceKick = () => {
      kick();
      document.removeEventListener('pointerdown', onceKick);
    };
    document.addEventListener('pointerdown', onceKick);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      document.removeEventListener('pointerdown', onceKick);
    };
  }, []);

  const handleIntroEnter = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const want = (() => {
      try {
        return localStorage.getItem('music-on') !== '0';
      } catch {
        return true;
      }
    })();
    if (hasMusic && want && audio.paused) {
      audio.play().catch(() => {});
    }
  };

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasMusic) {
      musicInputRef.current?.click();
      return;
    }
    if (audio.paused) {
      try {
        localStorage.setItem('music-on', '1');
      } catch {}
      audio.play().catch(() => showToast('Touche ▶ pour lancer la musique'));
    } else {
      try {
        localStorage.setItem('music-on', '0');
      } catch {}
      audio.pause();
    }
  };

  const handleUploadMusic = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      showToast('Choisis un fichier audio');
      return;
    }
    if (file.size > 60 * 1024 * 1024) {
      showToast('Fichier trop lourd (max 60 Mo)');
      return;
    }
    const name = file.name.replace(/\.[^.]+$/, '');
    try {
      await setMusicRecord({ blob: file, name });
    } catch {
      showToast("Impossible d'enregistrer la musique");
      return;
    }
    const audio = audioRef.current;
    if (audio) {
      if (musicObjectUrlRef.current) URL.revokeObjectURL(musicObjectUrlRef.current);
      const url = URL.createObjectURL(file);
      musicObjectUrlRef.current = url;
      audio.src = url;
      setHasMusic(true);
      setMusicName(name);
      try {
        localStorage.setItem('music-on', '1');
      } catch {}
      audio.play().catch(() => showToast('Touche ▶ pour lancer la musique'));
      showToast('Musique ajoutée');
    }
  };

  const handleRemoveMusic = async () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    if (musicObjectUrlRef.current) {
      URL.revokeObjectURL(musicObjectUrlRef.current);
      musicObjectUrlRef.current = null;
    }
    setHasMusic(false);
    setMusicName('');
    setIsPlaying(false);
    try {
      await deleteMusicRecord();
    } catch {}
    showToast('Musique retirée');
  };

  const handleVolumeChange = (val: number) => {
    setMusicVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    try {
      localStorage.setItem('music-vol', String(val));
    } catch {}
  };

  const openTitleEdit = () => {
    setDropdownOpen(false);
    setTitleDraft(title);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 10);
  };

  const saveTitleEdit = () => {
    const v = titleDraft.trim();
    if (v) {
      setTitle(v);
      try {
        localStorage.setItem('kaneki-title', v);
      } catch {}
    }
    setEditingTitle(false);
    showToast('Nom mis à jour');
  };

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setPhone(digits);
    if (digits.length >= 6 && !parsePh(digits)) {
      setPhoneErr(getErr(digits));
    } else {
      setPhoneErr('');
    }
  };

  const saveToHist = (num: string, banned: boolean) => {
    setHistory((prev) => {
      const next = [{ num, banned, ts: Date.now() }, ...prev].slice(0, 50);
      try {
        localStorage.setItem('xen-hist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCheck = async () => {
    const d = phone.trim();
    const num = parsePh(d);
    if (!num) {
      setPhoneErr(getErr(d));
      return;
    }
    setPhoneErr('');
    setChecking(true);
    try {
      const res = await fetch(CHECK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: num }),
      });
      const data = await res.json();
      const banned = data.banned === true;
      const reason = typeof data.reason === 'string' ? data.reason : '';
      saveToHist(num, banned);
      setVerdict({
        open: true,
        banned,
        num,
        reason,
        ts: fmtTs(),
      });
    } catch {
      setVerdict({
        open: true,
        banned: false,
        num,
        reason: '',
        ts: fmtTs(),
      });
    } finally {
      setChecking(false);
    }
  };

  const handleSelectTheme = (theme: ThemeId) => {
    setConfig((prev) => ({ ...prev, theme }));
    try {
      localStorage.setItem('checker-theme', theme);
    } catch {}
  };

  const handleUpdateCubeImage = (dataUrl: string) => {
    setCubeImage(dataUrl);
    try {
      localStorage.setItem('kaneki-cube-image', dataUrl);
    } catch {}
  };

  const handleUpdateBgMedia = (dataUrl: string, isVideo: boolean) => {
    try {
      localStorage.setItem('kaneki-bg-image', dataUrl);
      localStorage.setItem('kaneki-bg-media-type', isVideo ? 'video' : 'image');
    } catch {
      showToast('Fichier trop volumineux pour être enregistré, essaie plus léger');
      return;
    }
    setBgMediaUrl(dataUrl);
    setBgIsVideo(isVideo);
    showToast(isVideo ? 'Vidéo de fond mise à jour' : 'Image de fond mise à jour');
  };

  const handleSaveConfig = (banMsg: string, okMsg: string, anim: boolean, bg: boolean) => {
    const nextBan = banMsg.trim() || config.banMsg;
    const nextOk = okMsg.trim() || config.okMsg;
    setConfig((prev) => ({ ...prev, banMsg: nextBan, okMsg: nextOk, anim, bg }));
    try {
      localStorage.setItem(
        'kaneki-cfg',
        JSON.stringify({ banMsg: nextBan, okMsg: nextOk, anim, bg })
      );
    } catch {}
    setSettingsOpen(false);
    showToast('Paramètres enregistrés');
  };

  const handleResetAll = () => {
    try {
      localStorage.removeItem('checker-theme');
      localStorage.removeItem('kaneki-cfg');
      localStorage.removeItem('kaneki-cube-image');
      localStorage.removeItem('kaneki-bg-image');
      localStorage.removeItem('kaneki-bg-media-type');
      localStorage.removeItem('kaneki-title');
    } catch {}
    setConfig(DEFAULTS);
    setTitle(DEFAULT_SITE_NAME);
    setCubeImage(DEFAULT_IMAGE);
    setBgMediaUrl(DEFAULT_BG_IMAGE);
    setBgIsVideo(false);
    setSettingsOpen(false);
    showToast('Paramètres réinitialisés');
  };

  const handleGifDoubleTap = useCallback(() => {
    setConfig((prev) => {
      const next = { ...prev, okMsg: ALT_OK_MSG };
      try {
        localStorage.setItem(
          'kaneki-cfg',
          JSON.stringify({
            banMsg: next.banMsg,
            okMsg: next.okMsg,
            anim: next.anim,
            bg: next.bg,
          })
        );
      } catch {}
      return next;
    });
    showToast('Message mis à jour ⚖️');
  }, [showToast]);

  const activeSpec = THEMES[config.theme] || THEMES.ombres;

  return (
    <>
      <IntroOverlay onEnter={handleIntroEnter} />

      <BackgroundCanvas
        theme={config.theme}
        bgEffectsEnabled={config.bg}
        bgMediaUrl={bgMediaUrl}
        bgIsVideo={bgIsVideo}
      />

      {/* TOPBAR */}
      <div className="topbar">
        <div className="tb-l">
          <div
            className="pip"
            id="pip"
            style={{
              background: `rgb(${activeSpec.pip})`,
              boxShadow: `0 0 16px rgba(${activeSpec.pip}, .6)`,
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="hist-btn"
            id="openHist"
            title="Historique"
            onClick={() => setHistoryOpen(true)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <div
            className="hbg"
            id="hbg"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* DROPDOWN */}
      <div
        className={`dropdown${dropdownOpen ? ' open' : ''}`}
        id="dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ditem" id="editTitleBtn" onClick={openTitleEdit}>
          <div className="ditem-ic">✏</div>
          Modifier le nom
        </div>
        <div
          className="ditem"
          id="openSettings"
          onClick={() => {
            setDropdownOpen(false);
            setSettingsOpen(true);
          }}
        >
          <div className="ditem-ic">⚙</div>
          Paramètres
        </div>
      </div>

      {/* HISTORY SHEET */}
      <HistorySheet
        open={historyOpen}
        items={history}
        onClose={() => setHistoryOpen(false)}
        onClearAll={() => {
          setHistory([]);
          try {
            localStorage.removeItem('xen-hist');
          } catch {}
          setTimeout(() => setHistoryOpen(false), 300);
        }}
        onSelectNumber={(num) => {
          setHistoryOpen(false);
          setPhone(num.replace('+', ''));
          setPhoneErr('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MAIN */}
      <div className="main">
        <div className="title-wrap">
          <div
            className={`title${checking ? ' glitching' : ''}${glitchFrame?.active ? ' burst' : ''}`}
            id="titleEl"
            onClick={openTitleEdit}
            style={
              checking && glitchFrame
                ? ({
                    '--gx': `${glitchFrame.x}px`,
                    '--gy': `${glitchFrame.y}px`,
                    '--gskew': `${glitchFrame.skew}deg`,
                    '--gopacity': String(glitchFrame.opacity),
                    '--gc1t': `${glitchFrame.c1t}%`,
                    '--gc1b': `${glitchFrame.c1b}%`,
                    '--gc1x': `${glitchFrame.c1x}px`,
                    '--gc2t': `${glitchFrame.c2t}%`,
                    '--gc2b': `${glitchFrame.c2b}%`,
                    '--gc2x': `${glitchFrame.c2x}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            {title}
            {checking && (
              <>
                <span className="title-glitch title-glitch-r" aria-hidden="true">
                  {glitchFrame?.corruptText || title}
                </span>
                <span className="title-glitch title-glitch-c" aria-hidden="true">
                  {glitchFrame?.corruptText || title}
                </span>
              </>
            )}
          </div>
          <div className="title-sub">1000 - 7 · Verdict WhatsApp</div>
          <div className={`edit-row${editingTitle ? ' show' : ''}`} id="editRow">
            <input
              ref={titleInputRef}
              className="edit-in"
              id="editIn"
              maxLength={48}
              placeholder="VOTRE NOM ICI"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitleEdit();
              }}
            />
            <button type="button" className="edit-ok" id="editOk" onClick={saveTitleEdit}>
              OK
            </button>
          </div>
        </div>

        <Cube3D
          theme={config.theme}
          animEnabled={config.anim}
          cubeImage={cubeImage}
          onDoubleTap={handleGifDoubleTap}
        />

        <div className="divider">
          <div className="dl" />
          <div className="dd" />
          <div className="dl" />
        </div>

        <div className="ncard">
          <div className="nlabel">Cible WhatsApp</div>
          <div
            className={`nfield${phoneErr ? ' error' : phoneFocused ? ' focused' : ''}`}
            id="nfield"
          >
            <span className="nplus">+</span>
            <input
              className="ninput"
              type="tel"
              id="phone"
              placeholder="55xxxxxxxxxx"
              maxLength={20}
              inputMode="numeric"
              autoComplete="off"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                const raw = e.clipboardData.getData('text');
                handlePhoneChange(raw.replace(/\D/g, '').substring(0, 15));
              }}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !checking) handleCheck();
              }}
            />
          </div>
          <div className={`nerr${phoneErr ? ' show' : ''}`} id="nerr">
            {phoneErr}
          </div>
        </div>

        <button
          type="button"
          className="cbtn"
          id="cbtn"
          disabled={checking}
          onClick={handleCheck}
        >
          VÉRIFIER
        </button>

        <div className={`spin-row${checking ? ' active' : ''}`} id="spin">
          <div className="ring" />
          <span>Analyse des ténèbres</span>
        </div>

        <div className="footer">
          <span className="footer-txt">
            Powered by <span className="footer-name">𝑲𝑬𝑵 𝑲𝑨𝑵𝑬𝑲𝑰</span>
          </span>
        </div>
      </div>

      <VerdictDialogs
        verdict={verdict}
        banMsg={config.banMsg}
        okMsg={config.okMsg}
        onClose={() => setVerdict((prev) => ({ ...prev, open: false }))}
      />

      <SettingsModal
        open={settingsOpen}
        config={config}
        cubeImage={cubeImage}
        bgMediaUrl={bgMediaUrl}
        bgIsVideo={bgIsVideo}
        musicName={musicName}
        hasMusic={hasMusic}
        musicVolume={musicVolume}
        onClose={() => setSettingsOpen(false)}
        onSelectTheme={handleSelectTheme}
        onUpdateCubeImage={handleUpdateCubeImage}
        onUpdateBgMedia={handleUpdateBgMedia}
        onUploadMusic={handleUploadMusic}
        onRemoveMusic={handleRemoveMusic}
        onVolumeChange={handleVolumeChange}
        onSaveConfig={handleSaveConfig}
        onResetAll={handleResetAll}
        onToast={showToast}
      />

      <audio ref={audioRef} id="bgMusic" loop preload="auto" />

      <MusicDock
        hasTrack={hasMusic}
        isPlaying={isPlaying}
        trackName={musicName}
        fileInputRef={musicInputRef}
        onTogglePlay={handleTogglePlay}
        onUploadFile={handleUploadMusic}
        onRemoveTrack={handleRemoveMusic}
      />

      <div className={`toast${toastVisible ? ' show' : ''}`} id="toast">
        {toastMsg}
      </div>
    </>
  );
}
