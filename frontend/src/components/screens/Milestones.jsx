import CosmicBackground from '../ui/CosmicBackground.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import { TrophyIcon, LockIcon } from '../ui/Icons.jsx';

const MILESTONES = [
  { score: 5000,  reward: '0.02' },
  { score: 10000, reward: '0.05' },
  { score: 15000, reward: '0.10' },
];

export default function Milestones({ onBack }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackChevron onClick={onBack} />
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 21, color: '#fff' }}>
              Milestone Rewards
            </div>
          </div>

          {/* Preview banner — this feature isn't live yet, no real payouts exist */}
          <div style={{
            marginTop: 20, borderRadius: 22, padding: '18px 20px',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.14), rgba(0,230,118,0.08))',
            border: '1px solid rgba(255,215,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <TrophyIcon size={30} color="#ffd700" />
            <div>
              <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 14, color: '#ffd700' }}>
                Preview
              </div>
              <div style={{ marginTop: 2, fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                Reward payouts are coming soon — this is a preview of what's ahead.
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', marginTop: 22 }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10,
            }}>
              Upcoming rewards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MILESTONES.map(m => (
                <div key={m.score} style={{
                  borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LockIcon size={18} color="rgba(255,255,255,0.5)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 16, color: '#fff' }}>
                      {m.score.toLocaleString()} points
                    </div>
                    <div style={{ marginTop: 2, fontFamily: '"Space Mono", monospace', fontSize: 12, color: 'rgba(255,215,0,0.6)' }}>
                      +${m.reward} USDT
                    </div>
                  </div>
                  <div style={{
                    fontFamily: '"Nunito", system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: 99,
                  }}>SOON</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
