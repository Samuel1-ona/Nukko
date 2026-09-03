import { XLogoIcon } from './Icons.jsx';
import { Modal, ModalTitle, PrimaryButton, GhostButton } from './kit.jsx';
import { DIM, RULE } from '../../theme/tokens.js';
import { X_HANDLE, openXProfile } from '../../utils/social.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * Occasional "follow us on X" prompt. Frequency gating lives in
 * utils/social.js — this component only renders and handles the two actions.
 */
export default function FollowXModal({ onClose, onFollowed }) {
  const { theme } = useTheme();

  const handleFollow = () => {
    openXProfile();
    onFollowed?.();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '26px 22px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            border: `1px solid ${RULE}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <XLogoIcon size={17} color="#fff" />
          </div>
        </div>

        <ModalTitle subtitle={<>Follow <span style={{ color: theme.secondary, fontWeight: 700 }}>{X_HANDLE}</span> for updates, events and cosmic drops.</>}>
          Join the Cosmos Crew
        </ModalTitle>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <PrimaryButton onClick={handleFollow} icon={<XLogoIcon size={14} color="#fff" />}>
            Follow
          </PrimaryButton>
          <GhostButton onClick={onClose} height={40} style={{ border: 'none', color: DIM }}>
            Maybe later
          </GhostButton>
        </div>
      </div>
    </Modal>
  );
}
