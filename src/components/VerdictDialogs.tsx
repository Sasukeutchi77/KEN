import { LINK_WHATSAPP } from '../constants/themes';
import type { VerdictState } from '../types';

interface VerdictDialogsProps {
  verdict: VerdictState;
  banMsg: string;
  okMsg: string;
  onClose: () => void;
}

export function VerdictDialogs({ verdict, banMsg, okMsg, onClose }: VerdictDialogsProps) {
  const showBan = verdict.open && verdict.banned;
  const showOk = verdict.open && !verdict.banned;

  return (
    <>
      {/* DIALOG BAN */}
      <div
        className={`backdrop${showBan ? ' show' : ''}`}
        id="dlgBan"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="dlg ban">
          <div className="dlg-bar" />
          <div className="verdict-head">
            <div className="verdict-icon-wrap">
              <svg
                className="verdict-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="skullGrad"
                    x1="0"
                    y1="0"
                    x2="64"
                    y2="64"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#ff5468" />
                    <stop offset="1" stopColor="#8b0016" />
                  </linearGradient>
                </defs>
                <path
                  d="M32 6c-12 0-20 9-20 20 0 7 3 12 7 16l1 8h4l1-5h2l1 5h4l1-5h2l1 5h4l1-8c4-4 7-9 7-16 0-11-8-20-20-20z"
                  stroke="url(#skullGrad)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <ellipse cx="24" cy="27" rx="4.5" ry="6" fill="url(#skullGrad)" />
                <ellipse cx="40" cy="27" rx="4.5" ry="6" fill="url(#skullGrad)" />
                <path
                  d="M30 34l2 4 2-4"
                  stroke="url(#skullGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="verdict-drip" />
            <div className="verdict-title">Condamnation Fatale</div>
            <div className="verdict-glyphs">✦ ☠ DOMAINE DE KANEKI ☠ ✦</div>
          </div>
          <div className="dlg-body">
            <div className="chip-row">
              <div className="chip">
                <div className="chip-dot" />
                COMPTE BANNI
              </div>
              <div className="dlg-ban-date" id="banTs">
                {verdict.ts}
              </div>
            </div>
            <div className="dnum" id="banNum">
              {verdict.num}
            </div>
            <div className="dmsg" id="banMsg">
              {banMsg}
            </div>
            <div className="dlg-reason-wrap" id="banReasonWrap">
              <div className="dlg-type-row">
                <span className="dlg-type-lbl">Statut:</span>
                <span className="dlg-type-val">DÉVORÉ · OFF</span>
              </div>
              <div className="dlg-reason-row" style={{ marginTop: 6 }}>
                <span className="dlg-reason-lbl">Raison:</span>
                <span className="dlg-reason-val" id="banReason">
                  {verdict.reason && verdict.reason.trim()
                    ? verdict.reason
                    : "violation des conditions d'utilisation"}
                </span>
              </div>
            </div>
          </div>
          <div className="dlg-sep" />
          <div className="dlg-acts-ban">
            <div className="dlg-acts-spacer" />
            <button type="button" className="dbtn" onClick={onClose}>
              Fermer
            </button>
            <div className="dbtn-vsep" />
            <a
              className="dbtn c-red"
              href={LINK_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chaîne
            </a>
          </div>
        </div>
      </div>

      {/* DIALOG OK */}
      <div
        className={`backdrop${showOk ? ' show' : ''}`}
        id="dlgOk"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="dlg ok">
          <div className="dlg-bar" />
          <div className="verdict-head">
            <div className="verdict-icon-wrap">
              <svg
                className="verdict-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="scaleGrad"
                    x1="0"
                    y1="0"
                    x2="64"
                    y2="64"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#f0d488" />
                    <stop offset="1" stopColor="#a8842a" />
                  </linearGradient>
                </defs>
                <line
                  x1="32"
                  y1="8"
                  x2="32"
                  y2="48"
                  stroke="url(#scaleGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <line
                  x1="14"
                  y1="16"
                  x2="50"
                  y2="16"
                  stroke="url(#scaleGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx="32" cy="10" r="3" fill="url(#scaleGrad)" />
                <path
                  d="M14 16l-7 16a7 7 0 0014 0z"
                  stroke="url(#scaleGrad)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M50 16l-7 16a7 7 0 0014 0z"
                  stroke="url(#scaleGrad)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <line x1="14" y1="16" x2="14" y2="32" stroke="url(#scaleGrad)" strokeWidth="1.4" />
                <line x1="50" y1="16" x2="50" y2="32" stroke="url(#scaleGrad)" strokeWidth="1.4" />
                <rect x="22" y="48" width="20" height="4" rx="2" fill="url(#scaleGrad)" />
              </svg>
            </div>
            <div className="verdict-title">Sursis Accordé</div>
            <div className="verdict-glyphs">✦ ⚖ SOUS L'ŒIL DU GHOUL ⚖ ✦</div>
          </div>
          <div className="dlg-body">
            <div className="chip">
              <div className="chip-dot" />
              COMPTE EN VIE
            </div>
            <div className="dnum" id="okNum">
              {verdict.num}
            </div>
            <div className="dmsg" id="okMsg">
              {okMsg}
            </div>
          </div>
          <div className="dlg-sep" />
          <div className="dlg-acts-ok">
            <button type="button" className="dbtn" onClick={onClose}>
              Fermer
            </button>
            <div className="dlg-acts-spacer" />
            <button type="button" className="dbtn c-gold" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
