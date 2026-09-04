import { useState } from 'react';
import { Modal, ModalTitle, PrimaryButton, GhostButton } from './kit.jsx';
import { DIM, GOLD, BODY, NUM } from '../../theme/tokens.js';

/**
 * Shown when the app comes back to the foreground after a claim. The reward
 * is already marked claimed — the link was handed over — so both answers
 * lead somewhere useful: YES retries the write if it failed while offline,
 * NO reopens the same link instead of sending the player hunting for it.
 */
export default function ClaimConfirmModal({ pending, onConfirm, onReopen, onDismiss }) {
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
          If it did not land, reopen the link — it is the same one, and it stays
          open until the money is taken.
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <PrimaryButton onClick={confirm} disabled={busy} height={48}>
            {busy ? 'Saving…' : 'Yes, I got it'}
          </PrimaryButton>
          <GhostButton onClick={busy ? undefined : onReopen} height={42}>
            Not yet — reopen the link
          </GhostButton>
          <GhostButton onClick={busy ? undefined : onDismiss} height={38}>
            Close
          </GhostButton>
        </div>
      </div>
    </Modal>
  );
}
