import type { HistoryItem } from '../types';
import { timeAgo } from '../utils/phone';

interface HistorySheetProps {
  open: boolean;
  items: HistoryItem[];
  onClose: () => void;
  onClearAll: () => void;
  onSelectNumber: (num: string) => void;
}

export function HistorySheet({
  open,
  items,
  onClose,
  onClearAll,
  onSelectNumber,
}: HistorySheetProps) {
  return (
    <div
      className={`hist-back${open ? ' open' : ''}`}
      id="histBack"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hist-sheet" id="histSheet">
        <div className="hist-handle" />
        <div className="hist-head">
          <span className="hist-title-txt">History</span>
          <button type="button" className="hist-clearall" id="histClearAll" onClick={onClearAll}>
            Clear all
          </button>
          <button type="button" className="hist-close" id="histClose" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="hist-sep" />
        <div className="hist-list" id="histList">
          {items.length === 0 ? (
            <div className="hist-empty">Aucune vérification pour l'instant</div>
          ) : (
            items.map((h, idx) => (
              <div
                key={`${h.num}-${h.ts}-${idx}`}
                className="hist-item"
                onClick={() => onSelectNumber(h.num)}
              >
                <div className="hist-item-info">
                  <div className="hist-item-num">{h.num}</div>
                  <div className="hist-item-time">{timeAgo(h.ts)}</div>
                </div>
                <div className={`hist-badge ${h.banned ? 'banned' : 'ok'}`}>
                  {h.banned ? 'BANNED' : 'OK'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
