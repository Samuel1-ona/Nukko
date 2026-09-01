import { useState } from 'react';

const GOLD = '#ffd700';

/**
 * Step 2 of a claim. Shown when the app comes back to the foreground with
 * a claim still pending, because a reward marked claimed that never
 * arrived cannot be proven or undone.
 */
export default function ClaimConfirmModal({ pending, onConfirm, onDismiss }) {
  const [busy, setBusy] = useState(false);
  if (!pending) return null;

  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };

  return (
    <>
      <div aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)' }} />

      <div role="dialog" aria-modal="true" aria-label="Confirm your reward"
        style={{
          position: 'fixed', zIndex: 310,
          left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: 'min(330px, calc(100vw - 40px))',
          borderRadius: 22, padding: '24px 20px 18px',
          background: 'linear-gradient(160deg, #1b0838 0%, #0a0015 100%)',
          border: `1px solid ${GOLD}55`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 15, fontWeight: 900,
          color: '#fff', marginBottom: 8, textAlign: 'center',
        }}>
          Did the money arrive?
        </div>

        <div style={{
          fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700,
          color: GOLD, textAlign: 'center', marginBottom: 6,
        }}>
          ${pending.amount} {pending.token}
        </div>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.5)',
          textAlign: 'center', lineHeight: 1.6, marginBottom: 18,
        }}>
          {pending.label}
          <br />
          Only confirm once it is in your wallet. If it did not arrive, keep it unclaimed and
          open the link again.
        </div>

        <button onClick={confirm} disabled={busy}
          style={{
            width: '100%', padding: '13px', borderRadius: 13, marginBottom: 8,
            background: `linear-gradient(135deg, ${GOLD}, #ffb700)`, border: 'none',
            color: '#08010f', fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 900,
            cursor: busy ? 'wait' : 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {busy ? 'SAVING…' : 'YES, I GOT IT'}
        </button>

        <button onClick={onDismiss} disabled={busy}
          style={{
            width: '100%', padding: '11px', borderRadius: 13,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          Not yet — keep it unclaimed
        </button>
      </div>
    </>
  );
}
