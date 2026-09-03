import { useState, useEffect } from 'react';
import { Sheet, PrimaryButton } from './kit.jsx';
import { ChevronRightIcon } from './Icons.jsx';
import { INK, DIM, FAINT, RULE, BODY } from '../../theme/tokens.js';

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

function FAQRow({ item, isOpen, onToggle, last }) {
  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${RULE}` }}>
      <button
        onClick={onToggle}
        className="nk-press"
        style={{
          display: 'flex', width: '100%', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12,
          padding: '14px 0', textAlign: 'left', background: 'none', border: 'none',
        }}
      >
        <span style={{
          fontFamily: BODY, fontWeight: 700, fontSize: 13,
          color: isOpen ? INK : 'rgba(233,224,246,0.82)', lineHeight: 1.5,
        }}>
          {item.q}
        </span>
        <span style={{
          flexShrink: 0, marginTop: 2, display: 'flex',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
        }}>
          <ChevronRightIcon size={13} color={FAINT} />
        </span>
      </button>
      {isOpen && (
        <p style={{
          margin: '0 0 14px', paddingRight: 24,
          fontFamily: BODY, fontSize: 12.5, lineHeight: 1.75, color: DIM,
        }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

export default function FAQModal({ isOpen, onClose }) {
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
    <Sheet title="Help & FAQ" subtitle="Common questions answered" onClose={onClose}>
      {FAQ_ITEMS.map((item, i) => (
        <FAQRow
          key={i}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => toggle(i)}
          last={i === FAQ_ITEMS.length - 1}
        />
      ))}

      <div style={{ marginTop: 20 }}>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{ textDecoration: 'none', display: 'block' }}>
          <PrimaryButton height={48}>Contact support</PrimaryButton>
        </a>
      </div>
    </Sheet>
  );
}
