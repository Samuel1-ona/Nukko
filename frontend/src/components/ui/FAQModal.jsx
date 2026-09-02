import { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext.jsx';

const SUPPORT_EMAIL = 'studioscracked@gmail.com';

const FAQ_ITEMS = [
  {
    q: 'How do I play Nukko?',
    a: 'Tap anywhere on the board to drop a planet. When two matching planets touch, they merge into a bigger, rarer planet. Keep merging to chain combos, earn bonus time, and push your score as high as possible before the timer runs out.',
  },
  {
    q: 'Why does my wallet pop up when I start a game?',
    a: 'Nukko records your game session on the Celo network. When you tap PLAY NOW, your wallet asks you to confirm a transaction that registers your session on-chain. Tap CONFIRM to proceed — without it the game cannot start.',
  },
  {
    q: 'Why does my wallet pop up again after the game ends?',
    a: 'A second transaction submits your final score to the smart contract so it appears on the leaderboard. Tap CONFIRM to save your score — rejecting it means your score will not be recorded on-chain.',
  },
  {
    q: 'What happens if I reject a wallet popup?',
    a: 'If you reject at game start, you are returned to the home screen. If you reject at game over, your score will not appear on the leaderboard. The game will still show your score locally, but it will not be saved on-chain.',
  },
  {
    q: 'How do merges give me extra time?',
    a: 'Every successful merge awards bonus seconds: small merges give +2 s, mid-tier merges randomly give +2 s or +5 s, and high-tier merges always give +5 s. Chaining fast merges is the best way to keep your session alive.',
  },
  {
    q: 'What are Bombs and Bucket Expansions?',
    a: 'Bombs destroy the most dangerous planet on the board. Bucket Expansions widen the drop zone to give you more room for big merges. Every player starts with 3 free Bombs and 3 free Bucket Expansions. Once used up, more can be purchased with stablecoins.',
  },
  {
    q: 'How much do power-ups cost?',
    a: '1 unit costs $0.10 · 5 units cost $0.40 · 10 units cost $0.90. Power-ups are purchased with USDm, USDC, or USDT on the Celo network. Prices are fixed in USD regardless of which token you use.',
  },
  {
    q: 'Can I extend my game time?',
    a: 'Yes. Open the time shop during a game to buy a time extension using stablecoins. Purchasing more time lets you keep playing after the timer would otherwise expire.',
  },
  {
    q: 'What stablecoins can I use?',
    a: 'Nukko accepts USDm (cUSD), USDC, and USDT — all on the Celo network. When you open the shop, your balances are shown for each token so you can pick the one that suits you.',
  },
  {
    q: 'What is the on-chain leaderboard?',
    a: 'The top 50 scores are stored directly in the Nukko smart contract on Celo mainnet. Your username at the time you set the record is preserved permanently. Tap the leaderboard on the home screen to see current rankings.',
  },
  {
    q: 'What network does Nukko use?',
    a: 'Nukko runs on Celo Mainnet (Chain ID 42220) — a fast, low-fee blockchain. Transaction fees are sub-cent. Make sure your MiniPay wallet is connected to Celo Mainnet before playing.',
  },
  {
    q: 'Where can I find the Terms of Use and Privacy Policy?',
    a: 'Both documents are available via the Terms and Privacy links at the bottom of the home screen.',
  },
  {
    q: 'How do I contact support?',
    a: `Send us an email at ${SUPPORT_EMAIL} and we'll get back to you as soon as possible.`,
  },
];

// ── Accordion row ────────────────────────────────────────────────────────────

function FAQRow({ item, isOpen, onToggle }) {
  const { theme } = useTheme();
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', width: '100%', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12,
          padding: '14px 20px', textAlign: 'left', background: 'none', border: 'none',
          cursor: 'pointer',
          backgroundColor: isOpen ? `rgba(${theme.primaryRGB},0.08)` : 'transparent',
        }}
      >
        <span style={{
          fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 12.5,
          color: '#fff', lineHeight: 1.5, letterSpacing: '0.01em',
        }}>
          {item.q}
        </span>
        <span style={{
          flexShrink: 0, marginTop: 1,
          fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 18,
          color: 'rgba(255,255,255,0.4)', lineHeight: 1,
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 180ms ease',
          display: 'inline-block',
        }}>
          +
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 20px 14px' }}>
          <p style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12.5, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.58)', margin: 0,
          }}>
            {item.a}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Close icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

export default function FAQModal({ isOpen, onClose }) {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 210,
          background: 'rgba(0,0,0,0.72)',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Help & FAQ"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 220,
          display: 'flex', flexDirection: 'column',
          height: '90dvh', maxHeight: '90dvh',
          background: 'linear-gradient(180deg, #110526 0%, #0a0015 100%)',
          border: `1px solid rgba(${theme.primaryRGB},0.35)`,
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          boxShadow: `0 -12px 48px rgba(${theme.primaryRGB},0.25)`,
          animation: 'legalSlideUp 280ms cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 16,
              color: '#fff', letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              Help &amp; FAQ
            </div>
            <div style={{
              marginTop: 3, fontFamily: '"Nunito", system-ui', fontSize: 10,
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Common questions answered
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable FAQ list */}
        <div style={{
          flex: 1, overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQRow
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}

          {/* Support CTA */}
          <div style={{ padding: '20px' }}>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 50, borderRadius: 14, textDecoration: 'none',
                background: theme.gradient,
                fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 13,
                color: '#fff', letterSpacing: '0.04em',
                boxShadow: `0 8px 24px -6px rgba(${theme.primaryRGB},0.5)`,
              }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes legalSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
