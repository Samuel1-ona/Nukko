import { useState } from 'react';
import Planet, { PLANET_DATA } from '../ui/Planet.jsx';
import { Screen, ScreenHeader, SectionHead, Readout, ReadoutStrip, ReadoutDivider, GhostButton, Rail, Reveal } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, GOLD, DISPLAY, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { levelProgress, titleForLevel } from '../../game/progression.js';

function stageFromScore(score) {
  if (!score || score < 100)  return 2;
  if (score < 500)   return 3;
  if (score < 2000)  return 4;
  if (score < 5000)  return 6;
  if (score < 10000) return 8;
  if (score < 20000) return 10;
  if (score < 50000) return 12;
  return 13;
}

export default function Profile({ profile, address, onBack, onEditName, progress }) {
  const { theme } = useTheme();
  const username = profile?.username || 'Anonymous';
  const best     = profile?.personalBest ?? 0;
  const games    = profile?.gamesPlayed  ?? 0;
  const stage    = stageFromScore(best);
  const planet   = PLANET_DATA[stage - 1];
  const rank     = levelProgress(progress?.xp ?? 0);
  const found    = progress?.discovered?.length ?? 0;

  const addr = address || profile?.address || '';
  const shortAddr = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!addr) return;
    navigator.clipboard?.writeText(addr).catch(() => {
      const el = document.createElement('textarea');
      el.value = addr; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Screen intensity="medium">
      <ScreenHeader title="Profile" onBack={onBack} />

      {/* Identity — the planet is the avatar, at a size worth looking at */}
      <Reveal delay={60} style={{
        marginTop: 22, display: 'flex', flexDirection: 'column',
        alignItems: 'center', flex: '0 0 auto',
      }}>
        <div className="nk-motion" style={{ animation: 'nk-breathe 7s ease-in-out infinite' }}>
          <Planet stage={stage} size={92} glow />
        </div>
        <div style={{
          marginTop: 14, fontFamily: DISPLAY, fontWeight: 600, fontSize: 24,
          color: INK, lineHeight: 1.15,
        }}>
          {username}
        </div>
        <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 12, fontWeight: 700, color: DIM }}>
          {titleForLevel(rank.level)}
        </div>
        <button
          onClick={copyAddress}
          className="nk-press-sm"
          style={{
            marginTop: 9, padding: '4px 10px', borderRadius: 8,
            background: 'transparent',
            border: `1px solid ${copied ? 'rgba(46,204,113,0.5)' : RULE}`,
            fontFamily: NUM, fontSize: 10.5, fontWeight: 700,
            color: copied ? '#2ecc71' : FAINT,
          }}
        >
          {copied ? 'Copied' : shortAddr}
        </button>
      </Reveal>

      <Reveal delay={130} style={{ marginTop: 22, flex: '0 0 auto' }}>
        <ReadoutStrip>
          <Readout label="Best" value={best > 0 ? best.toLocaleString() : '—'} accent={GOLD} />
          <ReadoutDivider />
          <Readout label="Runs" value={games.toLocaleString()} />
          <ReadoutDivider />
          <Readout label="Level" value={rank.level} accent={theme.secondary} />
        </ReadoutStrip>
      </Reveal>

      <div style={{
        flex: '1 1 auto', overflowY: 'auto', marginTop: 22,
        display: 'flex', flexDirection: 'column',
      }}>
        <SectionHead delay={190}>Furthest reached</SectionHead>
        <Reveal delay={210} style={{ marginBottom: 22 }}>
          <Rail accent={theme.primary}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Planet stage={stage} size={34} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, color: INK }}>
                  {planet?.name ?? `Stage ${stage}`}
                </div>
                <div style={{ marginTop: 1, fontFamily: BODY, fontSize: 11.5, color: DIM }}>
                  Stage {stage} of {PLANET_DATA.length} · {found} catalogued
                </div>
              </div>
            </div>
          </Rail>
        </Reveal>

        <div style={{ flex: 1, minHeight: 12 }} />

        <SectionHead delay={250}>Account</SectionHead>
        <Reveal delay={270}>
          <GhostButton onClick={onEditName}>Edit name</GhostButton>
        </Reveal>
      </div>
    </Screen>
  );
}
