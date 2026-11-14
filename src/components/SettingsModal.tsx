import { useEffect, useState } from 'react';
import { THEMES, THEME_ORDER } from '../constants/themes';
import type { AppConfig, ThemeId } from '../types';

interface SettingsModalProps {
  open: boolean;
  config: AppConfig;
  cubeImage: string;
  bgMediaUrl: string;
  bgIsVideo: boolean;
  musicName: string;
  hasMusic: boolean;
  musicVolume: number;
  onClose: () => void;
  onSelectTheme: (theme: ThemeId) => void;
  onUpdateCubeImage: (dataUrl: string) => void;
  onUpdateBgMedia: (dataUrl: string, isVideo: boolean) => void;
  onUploadMusic: (file: File) => void;
  onRemoveMusic: () => void;
  onVolumeChange: (val: number) => void;
  onSaveConfig: (banMsg: string, okMsg: string, anim: boolean, bg: boolean) => void;
  onResetAll: () => void;
  onToast: (msg: string) => void;
}

export function SettingsModal({
  open,
  config,
  cubeImage,
  bgMediaUrl,
  bgIsVideo,
  musicName,
  hasMusic,
  musicVolume,
  onClose,
  onSelectTheme,
  onUpdateCubeImage,
  onUpdateBgMedia,
  onUploadMusic,
  onRemoveMusic,
  onVolumeChange,
  onSaveConfig,
  onResetAll,
  onToast,
}: SettingsModalProps) {
  const [banMsg, setBanMsg] = useState(config.banMsg);
  const [okMsg, setOkMsg] = useState(config.okMsg);
  const [anim, setAnim] = useState(config.anim);
  const [bg, setBg] = useState(config.bg);
  const [cubeUploaded, setCubeUploaded] = useState(false);
  const [bgUploaded, setBgUploaded] = useState<'none' | 'image' | 'video'>('none');

  useEffect(() => {
    if (open) {
      setBanMsg(config.banMsg);
      setOkMsg(config.okMsg);
      setAnim(config.anim);
      setBg(config.bg);
    }
  }, [open, config]);

  const handleCubeFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        onUpdateCubeImage(dataUrl);
        setCubeUploaded(true);
        onToast('Image du cube mise à jour');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBgFile = (file?: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    if (isVideo && file.size > 15 * 1024 * 1024) {
      onToast('Vidéo trop lourde (max ~15 Mo), choisis un clip plus court/léger');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        onUpdateBgMedia(dataUrl, isVideo);
        setBgUploaded(isVideo ? 'video' : 'image');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`modal-back${open ? ' active' : ''}`}
      id="modalBack"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="mhandle" />
        <div className="mhead">
          <h2>PARAMÈTRES</h2>
          <div className="xbtn" id="closeModal" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="mbody">
          {/* Messages */}
          <div className="sg">
            <label>Message si banni</label>
            <textarea
              className="si"
              id="setBan"
              rows={2}
              value={banMsg}
              onChange={(e) => setBanMsg(e.target.value)}
            />
          </div>
          <div className="sg">
            <label>Message si non banni</label>
            <textarea
              className="si"
              id="setOk"
              rows={2}
              value={okMsg}
              onChange={(e) => setOkMsg(e.target.value)}
            />
          </div>

          {/* Thèmes */}
          <div className="sg">
            <label>Design</label>
            <div className="theme-row" id="themeRow">
              {THEME_ORDER.map((id) => (
                <div
                  key={id}
                  className={`tbtn${config.theme === id ? ' active' : ''}`}
                  data-theme={id}
                  onClick={() => onSelectTheme(id)}
                >
                  {THEMES[id].label}
                </div>
              ))}
            </div>
          </div>

          {/* Upload GIF ou image centrale */}
          <div className="sg">
            <label>GIF ou image centrale (remplacer le faux GIF)</label>
            <div className="upload-row">
              <label
                className={`upload-label${cubeUploaded ? ' uploaded' : ''}`}
                id="cubeUploadLabel"
              >
                <span id="cubeUploadText">
                  {cubeUploaded ? 'GIF / Image changé(e) ✓' : 'Choisir un GIF ou une image'}
                </span>
                <input
                  type="file"
                  id="cubeUpload"
                  accept="image/*,.gif"
                  onChange={(e) => {
                    handleCubeFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              <img
                id="cubePreview"
                className="upload-preview show"
                src={cubeImage}
                alt=""
              />
            </div>
          </div>

          {/* Upload image ou vidéo de fond */}
          <div className="sg">
            <label>Fond (image ou vidéo — un seul à la fois)</label>
            <div className="upload-row">
              <label
                className={`upload-label${bgUploaded !== 'none' ? ' uploaded' : ''}`}
                id="bgUploadLabel"
              >
                <span id="bgUploadText">
                  {bgUploaded === 'video'
                    ? 'Vidéo changée ✓'
                    : bgUploaded === 'image'
                      ? 'Image changée ✓'
                      : 'Choisir une image ou vidéo'}
                </span>
                <input
                  type="file"
                  id="bgUpload"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    handleBgFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              <img
                id="bgPreview"
                className={`upload-preview${!bgIsVideo ? ' show' : ''}`}
                src={!bgIsVideo ? bgMediaUrl : ''}
                alt=""
              />
              <video
                id="bgPreviewVid"
                className={`upload-preview${bgIsVideo ? ' show' : ''}`}
                src={bgIsVideo ? bgMediaUrl : undefined}
                muted
                loop
                autoPlay
                playsInline
              />
            </div>
          </div>

          {/* Musique */}
          <div className="sg">
            <label>Musique de fond</label>
            <div className="upload-row">
              <label className="upload-label" id="musicUploadLabel">
                <span id="musicUploadText">
                  {hasMusic ? `${musicName} ✓` : 'Choisir une musique'}
                </span>
                <input
                  type="file"
                  id="musicFile2"
                  accept="audio/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadMusic(f);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="srow" style={{ marginTop: 10 }}>
              <span className="srow-lbl">Volume</span>
              <input
                type="range"
                className="vol"
                id="musicVol"
                min={0}
                max={100}
                value={Math.round(musicVolume * 100)}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              />
            </div>
            <button
              type="button"
              className="social-btn"
              id="musicRemove"
              style={{
                marginTop: 10,
                borderColor: 'rgba(255,255,255,.15)',
                color: '#fff',
              }}
              onClick={onRemoveMusic}
            >
              Retirer la musique
            </button>
          </div>

          {/* Toggles */}
          <div className="sg">
            <div className="srow">
              <span className="srow-lbl">Animation du cube</span>
              <div
                className={`tog${anim ? ' on' : ''}`}
                id="togAnim"
                onClick={() => setAnim((prev) => !prev)}
              />
            </div>
          </div>
          <div className="sg">
            <div className="srow">
              <span className="srow-lbl">Effets de fond</span>
              <div
                className={`tog${bg ? ' on' : ''}`}
                id="togBg"
                onClick={() => setBg((prev) => !prev)}
              />
            </div>
          </div>

          <button
            type="button"
            className="savebtn"
            id="saveBtn"
            onClick={() => onSaveConfig(banMsg, okMsg, anim, bg)}
          >
            ENREGISTRER
          </button>
          <button
            type="button"
            className="resetbtn"
            id="resetBtn"
            onClick={() => {
              setCubeUploaded(false);
              setBgUploaded('none');
              onResetAll();
            }}
          >
            RÉINITIALISER
          </button>
        </div>
      </div>
    </div>
  );
}
