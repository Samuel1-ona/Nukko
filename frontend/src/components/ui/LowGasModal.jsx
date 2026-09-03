import { useState } from 'react';
import { CheckIcon } from './Icons.jsx';
import { Modal, ModalTitle, SectionHead, PrimaryButton } from './kit.jsx';
import { INK, DIM, FAINT, RULE, BODY, NUM } from '../../theme/tokens.js';

const TELEGRAM_URL = 'https://t.me/+BAnzMviv8_5mZjI0';
const AMBER = '#ffb400';

function CopyIcon({ size = 14, color = DIM }) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <path d="M3 10V3a1 1 0 0 1 1-1h7" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function TelegramIcon({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M21.8 2.3 2.7 9.8c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.7c.2.7.5.9 1 .9.4 0 .6-.2 1-.5l2.4-2.3 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9.3 12.9l-.3 4.4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.3 12.9l9.2-8.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Empty fuel pump — the one illustration this sheet needs. */
function FuelIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ display: 'block' }}>
      <rect x="9" y="12" width="12" height="14" rx="2" stroke={AMBER} strokeWidth="1.5"/>
      <path d="M21 16h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-3" stroke={AMBER} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M15 18c0 1.66-1.12 3-2 3s-2-1.34-2-3c0-1.1.9-2.5 2-4 1.1 1.5 2 2.9 2 4Z" fill={AMBER} opacity="0.75"/>
      <line x1="24" y1="8" x2="28" y2="12" stroke="#ff4646" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="28" y1="8" x2="24" y2="12" stroke="#ff4646" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function LowGasModal({ address, balanceDisplay, checking, onRecheck }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const el = document.createElement('textarea');
      el.value = address; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = address ? `${address.slice(0, 8)}…${address.slice(-6)}` : '';

  // No onClose: this blocks play until gas arrives, and it closes itself.
  return (
    <Modal zIndex={300} width={360}>
      <div style={{ padding: '26px 22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <FuelIcon />
        </div>

        <ModalTitle subtitle={<>You need a little <span style={{ color: AMBER, fontWeight: 700 }}>CELO</span> to cover gas for starting and submitting games.</>}>
          Not enough gas
        </ModalTitle>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 13px', borderRadius: 99,
            border: '1px solid rgba(255,70,70,0.35)',
          }}>
            <span className="nk-motion" style={{
              width: 6, height: 6, borderRadius: '50%', background: AMBER, flexShrink: 0,
              animation: 'nukko-pulse 0.9s ease-in-out infinite alternate',
            }} />
            <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 11.5, color: '#ff7070' }}>
              {checking ? 'Checking…' : balanceDisplay ?? '0.0000 CELO'}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionHead>Step 1 — copy your address</SectionHead>
          <button
            onClick={copyAddress}
            className="nk-press"
            style={{
              width: '100%', padding: '11px 13px', borderRadius: 12,
              background: 'transparent',
              border: `1px solid ${copied ? 'rgba(46,204,113,0.5)' : RULE}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}
          >
            <span style={{
              fontFamily: NUM, fontSize: 12, fontWeight: 700,
              color: copied ? '#2ecc71' : INK,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1, textAlign: 'left',
            }}>
              {copied ? 'Copied' : shortAddr}
            </span>
            {copied
              ? <CheckIcon size={13} color="#2ecc71" />
              : <CopyIcon size={13} color={FAINT} />}
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHead>Step 2 — request gas in Telegram</SectionHead>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
            <PrimaryButton icon={<TelegramIcon size={15} />} height={50}>
              Join &amp; request gas
            </PrimaryButton>
          </a>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          marginTop: 18, paddingTop: 14, borderTop: `1px solid ${RULE}`,
        }}>
          <span className="nk-motion" style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: checking ? AMBER : '#2ecc71',
            animation: 'nukko-pulse 0.9s ease-in-out infinite alternate',
          }} />
          <span style={{ fontFamily: BODY, fontSize: 11, color: FAINT, textAlign: 'center' }}>
            {checking ? 'Checking balance…' : 'Rechecking every 5s — this closes itself once gas lands'}
          </span>
        </div>
      </div>
    </Modal>
  );
}
