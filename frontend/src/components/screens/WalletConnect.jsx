import { useState } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoMascot      from '../ui/NukkoMascot.jsx';
import NukkoWordmark    from '../ui/NukkoWordmark.jsx';
import { ArrowRightIcon } from '../ui/Icons.jsx';
import { useTheme }     from '../../theme/ThemeContext.jsx';

// ── Icons ──────────────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="#ffd700">
      <path d="M6 1l1.236 2.501L10 3.82l-2 1.95.472 2.75L6 7.25 3.528 8.52 4 5.77 2 3.82l2.764-.319z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(255,255,255,0.7)" style={{ flexShrink: 0 }}>
      <path d="M9.19 6.78 14.47 0h-1.24L8.62 5.88 4.94 0H.53l5.55 8.07L.53 15.29h1.24l4.85-5.64 3.87 5.64H14.9L9.19 6.78Zm-1.72 2-.56-.8L2.2 1h1.92l3.61 5.16.56.8 4.7 6.71h-1.92L7.47 8.78Z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="3.5" width="15" height="11" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4"/>
      <path d="M1.5 6l7.5 5 7.5-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="4" width="18" height="13" rx="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <path d="M1 8h18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <rect x="13" y="11" width="4" height="3" rx="1" fill="rgba(255,255,255,0.6)"/>
    </svg>
  );
}

function ChevronDown({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transition: 'transform 0.22s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <polyline points="2,4.5 7,9.5 12,4.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.2)',
      borderTopColor: '#fff',
      animation: 'nukko-spin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          animation: `nukko-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function WalletConnect({ address, onConnect, onConnectSocial, socialLoading, isMiniPay, error, onRetry, onPlayAsGuest }) {
  const { theme } = useTheme();
  const [open,          setOpen]          = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [copied,        setCopied]        = useState(false);

  const shortAddr = address ? `${address.slice(0, 8)}…${address.slice(-6)}` : '';

  const copyAddress = async () => {
    if (!address) return;
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

  const handleWallet = async () => {
    setOpen(false);
    setWalletLoading(true);
    await onConnect();
    setWalletLoading(false);
  };

  const handleSocial = () => {
    setOpen(false);
    onConnectSocial();
  };

  const anyLoading = socialLoading || walletLoading;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="lush">
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '52px 24px 44px', boxSizing: 'border-box',
        }}>

          {/* Logo + tagline */}
          <div style={{ textAlign: 'center' }}>
            <NukkoWordmark size={50} />
            <div style={{
              marginTop: 10, fontFamily: '"Nunito", system-ui', fontSize: 12,
              color: 'rgba(255,255,255,0.42)', letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}>
              Drop &middot; Merge &middot; Evolve
            </div>
          </div>

          {/* Mascot */}
          <div style={{ animation: 'nukko-bob 3s ease-in-out infinite' }}>
            <NukkoMascot size={190} pose="idle" />
          </div>

          {/* CTA block */}
          <div style={{ width: '100%', maxWidth: 360 }}>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 14, padding: '10px 16px', borderRadius: 12,
                background: 'rgba(255,59,59,0.12)', border: '1px solid rgba(255,59,59,0.3)',
                fontFamily: '"Nunito", system-ui', fontSize: 13,
                color: '#ff8a8a', textAlign: 'center',
              }}>
                {error}
                {onRetry && (
                  <button
                    onClick={onRetry}
                    style={{
                      display: 'block', width: '100%', marginTop: 10,
                      padding: '9px 0', borderRadius: 10,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 13,
                      color: '#fff', cursor: 'pointer',
                    }}
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            {/* MiniPay: silent auto-connect, no button */}
            {isMiniPay ? (
              <div style={{
                padding: 20, borderRadius: 18,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}>
                <div style={{
                  marginBottom: 14, fontFamily: '"Nunito", system-ui',
                  fontSize: 14, color: 'rgba(255,255,255,0.7)',
                }}>
                  {onRetry ? 'Could not finish signing in.' : 'Connecting MiniPay wallet…'}
                </div>
                {/* Without this the panel spins forever on any failed read. */}
                {!onRetry && <LoadingDots />}
              </div>
            ) : (
              /* Dropdown anchor */
              <div style={{ position: 'relative' }}>

                {/* Dropdown panel — slides up above the button */}
                {open && (
                  <>
                    {/* Backdrop */}
                    <div
                      onClick={() => setOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    />

                    {/* Panel */}
                    <div style={{
                      position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, right: 0,
                      zIndex: 20,
                      background: 'linear-gradient(170deg, #1e0d3a 0%, #110624 100%)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 20,
                      overflow: 'hidden',
                      boxShadow: `0 -8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(${theme.primaryRGB},0.15)`,
                      animation: 'nukko-slide-up 0.22s cubic-bezier(.22,1,.36,1)',
                    }}>
                      {/* Handle */}
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
                      </div>

                      <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                        {/* ── Social option — RECOMMENDED ── */}
                        <button
                          onClick={handleSocial}
                          disabled={anyLoading}
                          style={{
                            width: '100%', padding: '14px 16px',
                            borderRadius: 14,
                            background: `linear-gradient(135deg, rgba(${theme.primaryRGB},0.22) 0%, rgba(${theme.secondaryRGB},0.12) 100%)`,
                            border: `1px solid rgba(${theme.primaryRGB},0.5)`,
                            cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 12,
                            transition: 'background 0.15s',
                          }}
                        >
                          {/* Icons row */}
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <GoogleIcon />
                            </div>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <XIcon />
                            </div>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: `rgba(${theme.primaryRGB},0.25)`, border: `1px solid rgba(${theme.primaryRGB},0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <EmailIcon />
                            </div>
                          </div>

                          {/* Text */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                              <span style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 14, color: '#fff' }}>
                                Social Login
                              </span>
                              {/* Recommended badge */}
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)',
                                borderRadius: 6, padding: '1px 6px',
                                fontSize: 9, fontWeight: 800, color: '#ffd700',
                                fontFamily: '"Nunito", system-ui', letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                              }}>
                                <StarIcon /> Recommended
                              </span>
                            </div>
                            <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>
                              Google · X · Email — no seed phrase
                            </div>
                          </div>

                          {anyLoading && <Spinner />}
                        </button>

                        {/* ── Wallet option ── */}
                        <button
                          onClick={handleWallet}
                          disabled={anyLoading}
                          style={{
                            width: '100%', padding: '13px 16px',
                            borderRadius: 14,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 12,
                            transition: 'background 0.15s',
                          }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <WalletIcon />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>
                              Connect Wallet
                            </div>
                            <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                              MetaMask or browser wallet
                            </div>
                          </div>
                          {walletLoading && <Spinner />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Trigger button */}
                <button
                  onClick={() => !anyLoading && setOpen(o => !o)}
                  disabled={anyLoading}
                  style={{
                    width: '100%', height: 58, borderRadius: 18,
                    background: anyLoading
                      ? `rgba(${theme.primaryRGB},0.35)`
                      : theme.gradient,
                    border: 'none', color: '#fff',
                    fontFamily: '"Nunito", system-ui', fontWeight: 800,
                    fontSize: 17, cursor: anyLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: anyLoading ? 'none' : `0 12px 36px -8px rgba(${theme.primaryRGB},0.65), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    animation: anyLoading ? 'none' : 'nukko-glow-pulse 2.4s ease-in-out infinite',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {anyLoading ? (
                    <>
                      <Spinner />
                      <span>Connecting…</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <ChevronDown open={open} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Guest trial — web only */}
            {!isMiniPay && onPlayAsGuest && (
              <button
                onClick={onPlayAsGuest}
                disabled={anyLoading}
                style={{
                  width: '100%', marginTop: 16,
                  background: 'none', border: 'none', padding: '6px 0',
                  fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13,
                  color: anyLoading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.38)',
                  cursor: anyLoading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  Try it first — 25-second free trial
                  <ArrowRightIcon size={13} color="currentColor" />
                </span>
              </button>
            )}

            <div style={{
              textAlign: 'center', marginTop: 12,
              fontFamily: '"Nunito", system-ui', fontSize: 11,
              color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em',
            }}>
              Powered by MiniPay &middot; Celo Network
            </div>
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
