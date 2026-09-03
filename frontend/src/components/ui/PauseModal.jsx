import Toggle from './Toggle.jsx';
import { PlayIcon, HomeIcon, SoundIcon, MusicIcon, PauseIcon } from './Icons.jsx';
import { Modal, ModalTitle, PrimaryButton, GhostButton } from './kit.jsx';
import { INK, DIM, RULE, BODY } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/** Audio row — same shape as the Settings screen, so the two agree. */
function AudioRow({ icon, label, value, onChange, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '13px 0',
      borderBottom: last ? 'none' : `1px solid ${RULE}`,
    }}>
      <span style={{ color: value ? INK : DIM, display: 'flex' }}>{icon}</span>
      <span style={{
        flex: 1, fontFamily: BODY, fontSize: 13.5, fontWeight: 600,
        color: value ? INK : DIM,
      }}>
        {label}
      </span>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

export default function PauseModal({ onResume, onGoHome, muted, onToggleMute, musicMuted, onToggleMusic }) {
  const { theme } = useTheme();
  const soundOn = !muted;
  const musicOn = !musicMuted;

  return (
    <Modal>
      <div style={{ padding: '26px 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            border: `1px solid ${RULE}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PauseIcon size={17} color={theme.secondary} />
          </div>
        </div>

        <ModalTitle subtitle="Your progress is saved">Paused</ModalTitle>

        <div style={{ marginTop: 20 }}>
          <PrimaryButton onClick={onResume} icon={<PlayIcon size={13} />}>Resume</PrimaryButton>
        </div>

        <div style={{ marginTop: 16 }}>
          <AudioRow
            icon={<SoundIcon size={16} muted={!soundOn} />}
            label="Sound effects" value={soundOn} onChange={onToggleMute}
          />
          <AudioRow
            icon={<MusicIcon size={16} muted={!musicOn} />}
            label="Music" value={musicOn} onChange={onToggleMusic} last
          />
        </div>

        <GhostButton onClick={onGoHome} style={{ marginTop: 18 }}>
          <HomeIcon size={14} />
          Back to home
        </GhostButton>
      </div>
    </Modal>
  );
}
