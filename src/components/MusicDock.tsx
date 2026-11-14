import type { RefObject } from 'react';

interface MusicDockProps {
  hasTrack: boolean;
  isPlaying: boolean;
  trackName: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onTogglePlay: () => void;
  onUploadFile: (file: File) => void;
  onRemoveTrack: () => void;
}

export function MusicDock({
  hasTrack,
  isPlaying,
  trackName,
  fileInputRef,
  onTogglePlay,
  onUploadFile,
  onRemoveTrack,
}: MusicDockProps) {
  return (
    <div
      className={`music-dock${hasTrack ? ' has-track' : ''}${isPlaying ? ' playing' : ''}`}
      id="musicDock"
    >
      <button
        type="button"
        className="mbtn"
        id="musicPlay"
        aria-label="Lecture / pause"
        onClick={onTogglePlay}
      >
        <svg className="ic-play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg className="ic-pause" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      </button>
      <div className="eq">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="mname" id="musicName">
        {hasTrack ? trackName : 'Ajouter une musique'}
      </div>
      <label className="mbtn ghost" title="Ajouter une musique">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <input
          ref={fileInputRef}
          type="file"
          id="musicFile"
          accept="audio/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadFile(f);
            e.target.value = '';
          }}
        />
      </label>
      <button
        type="button"
        className="mbtn ghost m-del"
        id="musicDel"
        title="Retirer la musique"
        onClick={onRemoveTrack}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
