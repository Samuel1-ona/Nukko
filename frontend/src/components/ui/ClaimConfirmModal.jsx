import { useState } from 'react';
import { Modal, ModalTitle, PrimaryButton, GhostButton } from './kit.jsx';
import { DIM, GOLD, BODY, NUM } from '../../theme/tokens.js';

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
    // Deliberately not click-outside dismissable: the answer is the whole point.
    <Modal zIndex={300} width={330}>
      <div style={{ padding: '24px 20px 20px' }}>
        <ModalTitle>Did the money arrive?</ModalTitle>

        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: NUM, fontSize: 20, fontWeight: 700, color: GOLD,
          fontVariantNumeric: 'tabular-nums',
        }}>
          ${pending.amount} {pending.token}
        </div>

        <div style={{
          marginTop: 10, fontFamily: BODY, fontSize: 11.5, color: DIM,
          textAlign: 'center', lineHeight: 1.6,
        }}>
          {pending.label}
          <br />
          Only confirm once it is in your wallet. If it did not arrive, keep it
          unclaimed and open the link again.
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <PrimaryButton onClick={confirm} disabled={busy} height={48}>
            {busy ? 'Saving…' : 'Yes, I got it'}
          </PrimaryButton>
          <GhostButton onClick={busy ? undefined : onDismiss} height={42}>
            Not yet — keep it unclaimed
          </GhostButton>
        </div>
      </div>
    </Modal>
  );
}
