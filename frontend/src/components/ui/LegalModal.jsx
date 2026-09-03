import { useEffect } from 'react';
import { Sheet } from './kit.jsx';
import { INK, DIM, FAINT, RULE, BODY, DISPLAY } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

const SUPPORT_EMAIL = 'studioscracked@gmail.com';
const ABOUT_URL     = 'https://crackedstudios.xyz';

// ── Shared typography helpers ────────────────────────────────────────────────

function H2({ children }) {
  return (
    <h2 style={{
      fontFamily: DISPLAY, fontWeight: 600, fontSize: 11,
      textTransform: 'uppercase', letterSpacing: '0.2em',
      color: FAINT, marginTop: 24, marginBottom: 8,
    }}>
      {children}
    </h2>
  );
}

function P({ children }) {
  return (
    <p style={{
      fontFamily: BODY, fontSize: 12.5, lineHeight: 1.75,
      color: DIM, marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

function Ul({ items }) {
  return (
    <ul style={{ marginBottom: 10, paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: 'flex', gap: 8, marginBottom: 6,
          fontFamily: BODY, fontSize: 12.5, lineHeight: 1.75,
          color: DIM,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: 1, background: '#a78bff',
            flexShrink: 0, marginTop: 8,
          }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Email({ addr }) {
  return (
    <a href={`mailto:${addr}`} style={{ color: '#00d4ff', textDecoration: 'underline' }}>
      {addr}
    </a>
  );
}

function Rule() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />;
}

function Strong({ children }) {
  return <strong style={{ color: '#fff', fontWeight: 700 }}>{children}</strong>;
}

// ── Close icon ───────────────────────────────────────────────────────────────

function ExternalIcon() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="square" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ── Scroll wrapper ───────────────────────────────────────────────────────────

function ScrollBody({ pdfHref, children }) {
  // The Sheet owns scrolling; this only appends the download affordance.
  return (
    <div>
      {children}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${RULE}` }}>
        <a href={pdfHref} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            fontFamily: BODY, fontSize: 9.5, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: FAINT, textDecoration: 'none',
          }}
        >
          <ExternalIcon /> Download PDF
        </a>
      </div>
    </div>
  );
}

// ── Terms of Service ─────────────────────────────────────────────────────────

function TermsContent() {
  return (
    <div>
      <P>
        Cracked Studios ("Cracked Studios," "we," "us," or "our") is a game developer and publisher
        that provides games, features, content, and services to users via websites, mobile applications,
        and other channels or platforms (the "Services"), including but not limited to Nukko on the
        MiniPay platform. These Terms of Use (the "Terms") form a legally binding agreement between
        you and Cracked Studios. Please read these Terms carefully before accessing or using the Services.
        By using the Services, you agree to these Terms. If you do not agree, do not use the Services.
      </P>

      <Rule />

      <H2>1. Definitions</H2>
      <P>In these Terms, unless the context otherwise requires:</P>
      <Ul items={[
        <><Strong>"Account"</Strong> means an account created by the User directly or through a third-party platform (including MiniPay) for the purpose of accessing and using the Services.</>,
        <><Strong>"Content"</Strong> includes, without limitation, text, images, audio, video, graphics, data, source code, in-game items, stablecoin payments, and any other materials or information displayed in or made available through the Services.</>,
        <><Strong>"Services"</Strong> means all games, applications, software, features, content, websites, customer support services, and any other related services provided or operated by Cracked Studios, including Nukko on the MiniPay platform.</>,
        <><Strong>"User"</Strong> or "you" means any individual who accesses, registers for, uses, or otherwise interacts with the Services in any manner.</>,
      ]} />

      <H2>2. Eligibility and Service Scope</H2>
      <P><Strong>2.1 Eligibility</Strong></P>
      <P>
        The Services are designed for users aged 13 and above. You must be at least 13 years of age
        to use the Services or otherwise have the consent of your parent or legal guardian where
        required by applicable law. If you believe your child has used the Services unlawfully,
        please contact us at <Email addr={SUPPORT_EMAIL} />.
      </P>
      <P><Strong>2.2 Service Scope</Strong></P>
      <Ul items={[
        'Planet-drop and merge gameplay, levels, events, and gameplay-related content;',
        'On-chain session recording and leaderboard management via the Celo blockchain;',
        'Purchasable power-ups and time extensions paid with stablecoins on the MiniPay platform;',
        'Customer support services;',
        'Other services we make available from time to time.',
      ]} />
      <P>
        Some services are free. Others require stablecoin payments via MiniPay. Availability may vary
        by region, platform, device, or app version.
      </P>

      <H2>3. MiniPay Platform & Blockchain Integration</H2>
      <P>
        Nukko is built on and integrated with the MiniPay platform and the Celo blockchain. Your use
        of Nukko is subject to MiniPay's Terms of Service and Privacy Policy in addition to these Terms.
        You are responsible for:
      </P>
      <Ul items={[
        'Maintaining your MiniPay account security and credentials;',
        'Protecting your cryptocurrency wallet information;',
        'Complying with MiniPay\'s policies and terms;',
        'Understanding the risks associated with stablecoins and blockchain transactions.',
      ]} />

      <H2>4. Stablecoin Payments and Disclaimers</H2>
      <P>
        <Strong>IMPORTANT:</Strong> Nukko allows players to purchase in-game power-ups and time
        extensions using stablecoins (USDm, USDC, USDT) on the Celo network. All payments are
        processed on-chain and are final and non-refundable. Please note:
      </P>
      <Ul items={[
        'All in-game purchases are voluntary and non-refundable once confirmed on-chain;',
        'Cracked Studios reserves the right to modify, suspend, or terminate in-game purchase options at any time;',
        'Stablecoin values may fluctuate and are subject to market, technological, and regulatory risks;',
        'You assume all risks associated with cryptocurrency ownership, storage, and transactions;',
        'Fraudulent activity, cheating, or violation of these Terms may result in account suspension.',
      ]} />

      <H2>5. License</H2>
      <P>
        Subject to your compliance with these Terms, we grant you a non-exclusive, non-transferable,
        non-sublicensable, revocable license for your own non-commercial entertainment use. All rights
        not expressly granted are reserved by us and our licensors. This license terminates if you
        materially breach any provision of these Terms.
      </P>

      <H2>6. User Account</H2>
      <P><Strong>6.1 Access via MiniPay</Strong></P>
      <P>
        You access Nukko through your MiniPay wallet. By doing so, you agree to comply with MiniPay's
        terms and policies. We are not responsible for any act, outage, suspension, or termination
        relating to your MiniPay account.
      </P>
      <P><Strong>6.2 Username</Strong></P>
      <P>
        You may set an in-game username stored on the Celo blockchain. Usernames are case-insensitive,
        must be 1–20 characters, and may only contain letters, numbers, and underscores. You may
        rename once every 7 days. We reserve the right to remove usernames that violate these Terms.
      </P>
      <P><Strong>6.3 Account Security</Strong></P>
      <P>
        You are responsible for maintaining the confidentiality of your wallet credentials and for
        all activities occurring through your account.
      </P>

      <H2>7. User Conduct</H2>
      <P>You agree to use the Services lawfully and responsibly. You must not:</P>
      <Ul items={[
        'Interfere with, damage, or disrupt any part of the Services;',
        'Exploit bugs, errors, or unintended features for unfair advantage;',
        'Engage in fraudulent behavior, including payment fraud or leaderboard manipulation;',
        'Use bots, scripts, or automation to interact with the Services;',
        'Reverse engineer, decompile, or create unauthorized derivative works;',
        'Buy, sell, or transfer accounts or in-game advantages except as expressly permitted;',
        'Use the Services in violation of applicable law or regulation.',
      ]} />

      <H2>8. Intellectual Property Rights</H2>
      <P>
        The Services, including all Content, software, code, design, text, graphics, logos, trademarks,
        gameplay elements, and audiovisual works, are owned by us or our licensors and are protected
        by applicable intellectual property laws. You may not use, copy, reproduce, or distribute any
        part of the Services without our prior written consent.
      </P>

      <H2>9. Personal Data Protection</H2>
      <P>
        We value your privacy. Please refer to our Privacy Policy for information on how we collect,
        use, and protect your personal data in connection with the Services.
      </P>

      <H2>10. Disclaimer and Limitation of Liability</H2>
      <P><Strong>10.1 Disclaimer of Warranties</Strong></P>
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES ARE PROVIDED ON AN
        "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT
        THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
      </P>
      <P><Strong>10.2 Limitation of Liability</Strong></P>
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CRACKED STUDIOS SHALL NOT BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
        INCLUDING LOSS OF PROFITS, DATA, OR STABLECOIN VALUE, ARISING FROM YOUR USE OF THE SERVICES.
      </P>

      <H2>11. Suspension and Termination</H2>
      <P>
        You may stop using the Services at any time. We may suspend or terminate your access if you
        breach these Terms, we suspect fraud or abuse, or we are required to do so by law.
        Termination may result in forfeiture of in-game progress. Contact us at <Email addr={SUPPORT_EMAIL} /> to appeal.
      </P>

      <H2>12. Governing Law</H2>
      <P>
        These Terms shall be governed by the laws of Nigeria. Disputes shall be resolved through
        amicable consultation. If unresolved within 30 days, either party may submit the dispute
        to arbitration at the Nigerian Institute of Chartered Arbitrators (NICArb) in English.
      </P>

      <H2>13. General Provisions</H2>
      <Ul items={[
        <><Strong>Entire Agreement.</Strong> These Terms and our Privacy Policy constitute the entire agreement regarding the Services.</>,
        <><Strong>Severability.</Strong> If any provision is held invalid, the remaining provisions remain in full force.</>,
        <><Strong>Changes.</Strong> We may update these Terms from time to time. Continued use constitutes acceptance.</>,
      ]} />

      <H2>14. Contact</H2>
      <P>Questions? Contact us at: <Email addr={SUPPORT_EMAIL} /></P>
    </div>
  );
}

// ── Privacy Policy ───────────────────────────────────────────────────────────

function PrivacyContent() {
  return (
    <div>
      <H2>1. Introduction</H2>
      <P>
        Cracked Studios ("we," "our," or "us") respects your privacy. This Privacy Policy explains
        how we handle your information when you use Nukko on the MiniPay platform.
      </P>

      <Rule />

      <H2>2. Minimal Data Collection</H2>
      <P>Nukko does <Strong>NOT</Strong> collect personal data directly from you. Our data collection is limited to:</P>
      <Ul items={[
        'Gameplay statistics: your game scores, personal bests, games played, and leaderboard position — stored on the Celo blockchain;',
        'Username: an optional display name you set, stored on-chain and visible to all players;',
        'Anonymous device information: device type, operating system, and app version for technical optimisation.',
      ]} />

      <H2>3. On-Chain Data</H2>
      <P>
        Core gameplay data (session records, scores, username) is stored directly on the Celo
        blockchain via the Nukko smart contract at{' '}
        <code style={{ color: '#00d4ff', fontSize: 11 }}>0x8c7BA50a06ECF8a3d9930d8B537B6de00439B552</code>.
        Blockchain data is public and permanent by design. Do not use your real name as a username
        if you wish to remain anonymous.
      </P>

      <H2>4. MiniPay Integration</H2>
      <P>
        Your personal information (email, wallet address, financial data) is managed exclusively by
        MiniPay. When you use Nukko, MiniPay shares your verified wallet address with us to:
      </P>
      <Ul items={[
        'Record your game sessions and scores on-chain;',
        'Link your in-game purchases to your wallet;',
        'Prevent fraud and duplicate accounts;',
        'Comply with applicable laws and regulations.',
      ]} />

      <H2>5. Stablecoin Payments</H2>
      <P>
        We do not store your private keys or wallet credentials. All payment processing is handled
        by the MiniPay platform and the Celo blockchain. We only receive your wallet address as
        the transaction sender to credit your in-game purchase.
      </P>

      <H2>6. Data Security</H2>
      <P>
        We implement industry-standard security measures to protect any off-chain data we hold.
        However, no transmission over the internet is completely secure. You are responsible for
        maintaining the confidentiality of your MiniPay credentials.
      </P>

      <H2>7. Your Rights</H2>
      <Ul items={[
        'Access your gameplay data upon request;',
        'Request deletion of any off-chain data associated with your account;',
        'Note: on-chain data (scores, username) cannot be deleted as it is stored permanently on the Celo blockchain.',
      ]} />

      <H2>8. Third-Party Links</H2>
      <P>
        Nukko may contain links to third-party websites. We are not responsible for their privacy
        practices. Please review their Privacy Policies separately.
      </P>

      <H2>9. International Compliance</H2>
      <P>
        Nukko complies with applicable data protection regulations in all jurisdictions where it
        operates, including GDPR for EU users.
      </P>

      <H2>10. Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy periodically. Your continued use of Nukko constitutes
        acceptance of any changes.
      </P>

      <Rule />
      <P>For privacy concerns, contact <Email addr={SUPPORT_EMAIL} />.</P>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────────────────────

function AboutBody({ onClose }) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: '28px 24px 32px',
    }}>
      <div style={{
        width: '100%', maxWidth: 280,
        background: `rgba(${theme.primaryRGB},0.15)`,
        border: `1px solid rgba(${theme.primaryRGB},0.35)`,
        borderRadius: 16, padding: '18px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontWeight: 900,
          fontSize: 28, letterSpacing: '-0.02em',
          background: theme.gradient,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Nukko
        </div>
        <div style={{
          marginTop: 4, fontFamily: '"Nunito", system-ui', fontSize: 11,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          by Cracked Studios
        </div>
      </div>

      <p style={{
        fontFamily: '"Nunito", system-ui', fontSize: 13, lineHeight: 1.7,
        color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 300,
      }}>
        Nukko is built by{' '}
        <strong style={{ color: '#fff' }}>Cracked Studios</strong>,
        an independent game studio crafting on-chain experiences on the Celo blockchain.
      </p>

      <div style={{ width: '100%', maxWidth: 320, height: 1, background: 'rgba(255,255,255,0.08)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        <a
          href={ABOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 50, borderRadius: 14, textDecoration: 'none',
            background: theme.gradient,
            fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 13,
            color: '#fff', letterSpacing: '0.04em',
          }}
        >
          <ExternalIcon /> Visit crackedstudios.xyz
        </a>

        <button
          onClick={onClose}
          style={{
            height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 12,
            color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Modal meta ───────────────────────────────────────────────────────────────

const MODAL_META = {
  terms:   { title: 'Terms of Use',     subtitle: 'Last updated: June 2026',  pdfHref: '/nukko-terms.pdf'   },
  privacy: { title: 'Privacy Policy',   subtitle: 'Last updated: June 2026',  pdfHref: '/nukko-privacy.pdf' },
  about:   { title: 'About',            subtitle: 'Cracked Studios' },
};

// ── Main modal ───────────────────────────────────────────────────────────────

export default function LegalModal({ type, onClose }) {
  const { theme } = useTheme();
  const isOpen = type !== null;

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

  if (!type) return null;
  const meta = MODAL_META[type];

  return (
    <Sheet
      title={meta.title}
      subtitle={meta.subtitle}
      onClose={onClose}
      height={type === 'about' ? 'auto' : '90dvh'}
      zIndex={210}
    >
      {type === 'about'   ? <AboutBody onClose={onClose} /> :
       type === 'terms'   ? <ScrollBody pdfHref={meta.pdfHref}><TermsContent /></ScrollBody> :
                            <ScrollBody pdfHref={meta.pdfHref}><PrivacyContent /></ScrollBody>}
    </Sheet>
  );
}
