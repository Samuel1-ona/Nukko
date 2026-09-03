import { useState, useCallback, useEffect, useRef } from 'react';

import { useWallet }      from './hooks/useWallet.js';
import { useContract }    from './hooks/useContract.js';
import { useTimer }       from './hooks/useTimer.js';
import { useGame }        from './hooks/useGame.js';
import { useLeaderboard } from './hooks/useLeaderboard.js';
import { usePurchase }    from './hooks/usePurchase.js';
import { usePowerUps }   from './hooks/usePowerUps.js';
import { useLadder }     from './hooks/useLadder.js';
import { useRewards }    from './hooks/useRewards.js';
import { useGasCheck }    from './hooks/useGasCheck.js';
import { useBgMusic }     from './hooks/useBgMusic.js';
import { isUserRejection } from './utils/miniPay.js';
import { useToast }       from './components/ui/Toast.jsx';
import { useAudio }       from './hooks/useAudio.js';
import { useProgress }    from './hooks/useProgress.js';
import { useTheme }       from './theme/ThemeContext.jsx';
import { getOrCreatePlayer, saveGameSession, addLeaderboardEntry, updatePlayerUsername } from './supabase/db.js';

import WalletConnect   from './components/screens/WalletConnect.jsx';
import SetUsername     from './components/screens/SetUsername.jsx';
import Home            from './components/screens/Home.jsx';
import Starting        from './components/screens/Starting.jsx';
import Playing         from './components/screens/Playing.jsx';
import Submitting      from './components/screens/Submitting.jsx';
import Result          from './components/screens/Result.jsx';
import SplashScreen    from './components/screens/SplashScreen.jsx';
import ModeSelect      from './components/screens/ModeSelect.jsx';
import Codex           from './components/screens/Codex.jsx';
import Profile         from './components/screens/Profile.jsx';
import Settings        from './components/screens/Settings.jsx';
import FullLeaderboard from './components/screens/FullLeaderboard.jsx';
import HowToPlay     from './components/ui/HowToPlay.jsx';
import LowGasModal   from './components/ui/LowGasModal.jsx';
import LegalModal    from './components/ui/LegalModal.jsx';
import FAQModal      from './components/ui/FAQModal.jsx';
import LadderModal   from './components/ui/LadderModal.jsx';
import LevelUpModal  from './components/ui/LevelUpModal.jsx';
import ClaimConfirmModal from './components/ui/ClaimConfirmModal.jsx';
import Admin         from './components/screens/Admin.jsx';
import FollowXModal  from './components/ui/FollowXModal.jsx';
import {
  recordGameFinished,
  shouldShowFollowPrompt,
  markFollowPromptShown,
  markFollowPromptDone,
} from './utils/social.js';

const S = {
  WALLET_CONNECT:  'WALLET_CONNECT',
  SET_USERNAME:    'SET_USERNAME',
  HOME:            'HOME',
  MODE_SELECT:     'MODE_SELECT',
  CODEX:           'CODEX',
  PROFILE:         'PROFILE',
  SETTINGS:        'SETTINGS',
  LEADERBOARD_FULL:'LEADERBOARD_FULL',
  STARTING:        'STARTING',
  PLAYING:         'PLAYING',
  SUBMITTING:      'SUBMITTING',
  RESULT:          'RESULT',
};

export default function App() {
  const { theme } = useTheme();
  const [splashDone,  setSplashDone]  = useState(false);
  const [screen,      setScreen]      = useState(S.WALLET_CONNECT);
  const [profile,     setProfile]     = useState(null);
  // Surfaced on the connect screen when the profile read fails; bumping
  // profileAttempt re-runs it.
  const [profileError,   setProfileError]   = useState(null);
  const [profileAttempt, setProfileAttempt] = useState(0);
  const [score,       setScore]       = useState(0);
  const [finalScore,  setFinalScore]  = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [resultRank,  setResultRank]  = useState(null);
  const [runSummary,  setRunSummary]  = useState(null); // XP / discoveries / challenges
  const [shop,          setShop]          = useState(null); // 'bomb' | 'expand' | null
  const [sessionStatus, setSessionStatus] = useState('idle'); // 'idle'|'pending'|'confirmed'|'failed'
  const [showTutorial,  setShowTutorial]  = useState(false);
  const [hasPausedGame,     setHasPausedGame]     = useState(false);
  const [isGuestMode,       setIsGuestMode]       = useState(false);
  const [guestTrialExpired, setGuestTrialExpired] = useState(false);
  // Ref so the PLAYING useEffect can skip startEngine when resuming a paused game
  const isResumingRef = useRef(false);
  // Ref version of isGuestMode — readable inside timer/game callbacks without stale closures
  const isGuestRef = useRef(false);
  // Track game start time for session duration
  const gameStartTimeRef = useRef(null);
  useEffect(() => { isGuestRef.current = isGuestMode; }, [isGuestMode]);
  const [legalModal,    setLegalModal]    = useState(null); // 'terms'|'privacy'|'about'|null
  const [showFAQ,       setShowFAQ]       = useState(false);
  const [showLadder,    setShowLadder]    = useState(false);
  // Owner-only admin surface, reached at /#admin — never linked from the game.
  const [isAdminRoute,  setIsAdminRoute]  = useState(() => window.location.hash === '#admin');
  const [showFollowPrompt, setShowFollowPrompt] = useState(false);

  // Refs prevent stale closures in timer/game callbacks
  const screenRef  = useRef(screen);
  const scoreRef   = useRef(0);
  const profileRef = useRef(null);
  useEffect(() => { screenRef.current  = screen;  }, [screen]);
  useEffect(() => { scoreRef.current   = score;   }, [score]);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // ── Hooks ──────────────────────────────────────────────────────────────────

  const { address, walletClient, isMiniPay, connect, connectWithSocial, socialLoading, disconnect, error: walletError } = useWallet();

  const powerUpsEnabled = !!address;

  const { hasGas, balanceDisplay, checking: gasChecking, recheckNow } = useGasCheck(address, isMiniPay);

  const {
    startGame: startGameTx,
    submitScore: submitScoreTx,
    setUsername: setUsernameTx,
    getProfile,
    getLeaderboard,
    checkUsernameAvailable,
  } = useContract(walletClient, address);

  const { toast, showToast } = useToast();
  const audio = useAudio();
  const { muted, toggleMute } = audio;
  const { musicMuted, toggleMusicMute, fadeOut: fadeMusicOut, fadeIn: fadeMusicIn } = useBgMusic();

  const handleScorePts = useCallback((pts) => {
    setScore((prev) => prev + pts);
  }, []);

  const handleTimerExpire = useCallback(() => {
    if (screenRef.current === S.PLAYING) {
      if (isGuestRef.current) {
        // Guest trial ended — pause everything and show the connect prompt
        setGuestTrialExpired(true);
        return;
      }
      setFinalScore(scoreRef.current);
      setScreen(S.SUBMITTING);
    }
  }, []);

  // Local progression — codex, rank, challenges, streak. localStorage only.
  const {
    progress, challenges, challengesDone, streakBroken,
    discovery, clearDiscovery, recordMerge, beginRun, finishRun,
  } = useProgress(address);

  // useTimer must come before useGame so addTime is defined when passed in
  const { remaining, startTimer, addTime, halveTime, stopTimer, pauseTimer, resumeTimer } = useTimer(handleTimerExpire);

  // A gravity-well collapse costs time instead of ending the run: it halves
  // whatever is left. Proportional, so it needs no guest-trial special case —
  // a 25s trial and a 90s run both lose exactly half. Returns the seconds taken
  // so the canvas FX and the clock pulse can name the number.
  const handleCollapse = useCallback(() => {
    const lost = halveTime();
    showToast(`Collapse — time halved, −${lost}s`, 2400);
    return lost;
  }, [halveTime, showToast]);

  const {
    canvasRef, nextIdx, nextNextIdx, holdIdx, canHold, chain, timeDelta,
    gameOver, containerWidth,
    startEngine, dropFruit, swapHold, movePointer, stopEngine,
    pauseEngine, resumeEngine,
    activateBomb, expandContainer, triggerTimeFX,
    getMergeCount, getRunStats,
  } = useGame(handleScorePts, showToast, addTime, audio, theme, recordMerge, handleCollapse);

  // Power-ups used during the current run — reported to the session log
  const powerUpsUsedRef = useRef({ bombs: 0, expands: 0 });

  const {
    entries: leaderboard,
    loading: leaderboardLoading,
    refresh: refreshLeaderboard,
  } = useLeaderboard(getLeaderboard);

  const {
    packages,
    balances,
    selectedToken,
    setSelectedToken,
    purchase,
    loading: purchaseLoading,
  } = usePurchase(walletClient, address, addTime);

  const {
    totalBombs,
    totalExpands,
    consumeBomb,
    consumeExpand,
    buyPowerUp,
    powerUpPackages,
    selectedToken:    powerUpToken,
    setSelectedToken: setPowerUpToken,
    loading:          powerUpLoading,
  } = usePowerUps(walletClient, address);

  const ladderApi  = useLadder(address);
  const rewardsApi = useRewards(address);

  // ── Admin route (hash based — the app has no router) ───────────────────────

  useEffect(() => {
    const onHash = () => setIsAdminRoute(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ── Load profile after wallet connects ─────────────────────────────────────

  useEffect(() => {
    if (!address) return;
    // If wallet connects while a guest trial is running, stop the trial cleanly
    if (isGuestRef.current) {
      setIsGuestMode(false);
      isGuestRef.current = false;
      setGuestTrialExpired(false);
      stopEngine();
      stopTimer();
    }

    let cancelled = false;
    setProfileError(null);
    getOrCreatePlayer(address).catch(console.error);
    getProfile(address)
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        if (p.username) {
          localStorage.setItem('nk_username', p.username);
          updatePlayerUsername(address, p.username).catch(console.error);
        }
        setScreen(p.username ? S.HOME : S.SET_USERNAME);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        // This read is the ONLY route off the connect screen. Swallowing its
        // rejection parked the app on "Connecting…" forever with nothing said,
        // so the failure has to reach the player with a way to retry.
        setProfileError('Could not reach the Celo network. Check your connection and try again.');
      });

    return () => { cancelled = true; };
  }, [address, getProfile, stopEngine, stopTimer, profileAttempt]);

  // ── Show how-to-play the first time the HOME screen appears ───────────────

  useEffect(() => {
    if (screen === S.HOME && !localStorage.getItem('nk_tutorial_seen')) {
      setShowTutorial(true);
    }
  }, [screen]);

  // ── Guest trial expiry — pause engine + timer ─────────────────────────────

  useEffect(() => {
    if (!guestTrialExpired) return;
    pauseEngine();
    pauseTimer();
  }, [guestTrialExpired, pauseEngine, pauseTimer]);

  // ── Physics game-over → SUBMITTING (or guest connect prompt) ──────────────

  useEffect(() => {
    if (!gameOver || screenRef.current !== S.PLAYING) return;
    stopTimer();
    if (isGuestRef.current) {
      setGuestTrialExpired(true);
      return;
    }
    setHasPausedGame(false);
    setFinalScore(scoreRef.current);
    fadeMusicOut();
    setScreen(S.SUBMITTING);
  }, [gameOver, stopTimer, fadeMusicOut]);

  // ── Fade music back in when returning to HOME ──────────────────────────────

  useEffect(() => {
    if (screen === S.HOME) fadeMusicIn();
  }, [screen, fadeMusicIn]);

  // ── Engine starts the moment the PLAYING screen mounts ────────────────────
  // startEngine() reads window.innerWidth automatically so the canvas fills
  // the full device width without needing to measure the DOM first.

  useEffect(() => {
    if (screen !== S.PLAYING) return;
    // If we're resuming a paused game, engine + timer are already running —
    // just clear the flag and leave everything alone.
    if (isResumingRef.current) {
      isResumingRef.current = false;
      return;
    }
    // Fresh start — guests get 25 s, ranked players get full 90 s
    setScore(0);
    scoreRef.current = 0;
    powerUpsUsedRef.current = { bombs: 0, expands: 0 };
    gameStartTimeRef.current = Date.now();
    beginRun();
    startEngine();
    startTimer(isGuestRef.current ? 25 : undefined);
  }, [screen, startEngine, startTimer, beginRun]);

  // ── Submit score when SUBMITTING screen appears ─────────────────────────────

  useEffect(() => {
    if (screen !== S.SUBMITTING) return;

    stopEngine();
    const submitted = scoreRef.current;
    // personalBest before this game — used to detect new record client-side
    const prevBest  = profileRef.current?.personalBest ?? 0;

    const durationSeconds = gameStartTimeRef.current
      ? Math.round((Date.now() - gameStartTimeRef.current) / 1000)
      : null;

    // Settle local progression immediately — it's localStorage-only, so it must
    // not wait on (or be lost to) a failed chain submit.
    setRunSummary(finishRun({ score: submitted, ...getRunStats() }));

    (async () => {
      // Save session + leaderboard entry to Supabase first (non-blocking) so
      // the record survives even when the on-chain score submit fails
      const username = profileRef.current?.username ?? null;
      saveGameSession({
        walletAddress:   address,
        score:           submitted,
        durationSeconds,
        merges:          getMergeCount(),
        powerUpsUsed:    { ...powerUpsUsedRef.current },
      }).catch(err => console.error('saveGameSession failed:', err));

      addLeaderboardEntry({
        walletAddress: address,
        username,
        score:         submitted,
      }).catch(err => console.error('addLeaderboardEntry failed:', err));

      try {
        await submitScoreTx(submitted);

        // Contract only updates personalBest when score > previous best
        const updated = await getProfile(address);
        setProfile(updated);

        const newRecord = submitted > prevBest;
        setIsNewRecord(newRecord);
        setFinalScore(submitted);

        // The score is now on-chain, so the ladder's verifiable counters can
        // move. `fresh` skips the indexer's poll interval rather than making
        // the player wait up to a minute to see the run counted.
        ladderApi.sync({ fresh: true, silent: true });

        // Refresh leaderboard then find player's rank
        await refreshLeaderboard();
        const lb  = await getLeaderboard();
        const idx = lb.findIndex(
          (e) => e.address?.toLowerCase() === address?.toLowerCase(),
        );
        setResultRank(idx >= 0 ? idx + 1 : null);
      } catch (err) {
        console.error('submitScore failed:', err);
        setFinalScore(submitted);
      } finally {
        setScreen(S.RESULT);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Occasional "follow us on X" prompt — shows on the result screen after the
  // score animation settles. All frequency gating lives in utils/social.js.
  useEffect(() => {
    if (screen !== S.RESULT) return;
    recordGameFinished();
    if (!shouldShowFollowPrompt()) return;
    const timer = setTimeout(() => {
      markFollowPromptShown();
      setShowFollowPrompt(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, [screen]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Pause-to-home: keep the physics world + timer alive so game can be continued.
  // For guest mode, discard the trial and return to the connect screen.
  const handleGoHome = useCallback(() => {
    pauseEngine();
    pauseTimer();
    if (isGuestRef.current) {
      setIsGuestMode(false);
      isGuestRef.current = false;
      setGuestTrialExpired(false);
      stopEngine();
      stopTimer();
      setScreen(S.WALLET_CONNECT);
      return;
    }
    setHasPausedGame(true);
    setScreen(S.HOME);
  }, [pauseEngine, pauseTimer, stopEngine, stopTimer]);

  // Continue a paused game: set the resuming flag, unblock the timer, switch screen.
  // resumeEngine() is intentionally NOT called here — Playing's mount-effect calls it
  // after the canvas element is in the DOM (avoids black screen from stale ctx).
  const handleContinueGame = useCallback(() => {
    isResumingRef.current = true;
    resumeTimer();
    setHasPausedGame(false);
    setScreen(S.PLAYING);
  }, [resumeTimer]);

  // Launch a no-wallet guest trial (web only, never MiniPay)
  const handlePlayAsGuest = useCallback(() => {
    setIsGuestMode(true);
    isGuestRef.current = true;
    setGuestTrialExpired(false);
    setHasPausedGame(false);
    isResumingRef.current = false;
    setSessionStatus('idle');
    setScreen(S.PLAYING);
  }, []);

  // Restart the 25-second trial from inside the expired-modal
  const handleRetryGuest = useCallback(() => {
    setGuestTrialExpired(false);
    setScore(0);
    scoreRef.current = 0;
    beginRun();
    startEngine();
    startTimer(25);
  }, [startEngine, startTimer, beginRun]);

  const handleStartGame = useCallback(async () => {
    // Discard any paused game and start fresh
    setHasPausedGame(false);
    isResumingRef.current = false;
    setSessionStatus('pending');
    setScreen(S.PLAYING); // game starts immediately — tx fires concurrently
    try {
      await startGameTx();
      setSessionStatus('confirmed');
    } catch (err) {
      if (isUserRejection(err)) {
        stopEngine();
        stopTimer();
        setSessionStatus('idle');
        setScreen(S.HOME);
        return;
      }
      setSessionStatus('failed');
    }
  }, [startGameTx, stopEngine, stopTimer]);

  const handleSetUsername = useCallback(async (username) => {
    await setUsernameTx(username);
    updatePlayerUsername(address, username).catch(console.error);
    const updated = await getProfile(address);
    setProfile(updated);
    setScreen(S.HOME);
  }, [setUsernameTx, getProfile, address]);

  const handlePurchase = useCallback(async (pkgIdx) => {
    try {
      const secs = await purchase(pkgIdx);
      showToast(`+${secs}s`);
      triggerTimeFX(`+${secs}s`);
    } catch (err) {
      if (isUserRejection(err)) return; // stay on game board
      showToast(err.diagnostic || err.message || 'Purchase failed', 9000);
    }
  }, [purchase, showToast, triggerTimeFX]);

  const handleUseBomb = useCallback(() => {
    const consumed = consumeBomb();
    if (!consumed) return;
    powerUpsUsedRef.current.bombs += 1;
    const removed = activateBomb();
    if (removed) showToast('Detonated! +200');
  }, [consumeBomb, activateBomb, showToast]);

  const handleUseExpand = useCallback(() => {
    const consumed = consumeExpand();
    if (!consumed) return;
    powerUpsUsedRef.current.expands += 1;
    expandContainer();
    showToast('Vacuum widened!');
  }, [consumeExpand, expandContainer, showToast]);

  const handlePurchasePowerUp = useCallback(async (pkgIdx) => {
    try {
      const qty = await buyPowerUp(shop, pkgIdx);
      showToast(`+${qty} ${shop === 'bomb' ? 'bomb' : 'expand'}${qty > 1 ? 's' : ''} added`);
      setShop(null);
    } catch (err) {
      if (isUserRejection(err)) { setShop(null); return; } // stay on game board
      showToast(err.diagnostic || err.message || 'Purchase failed', 9000);
    }
  }, [buyPowerUp, shop, showToast]);

  // ── Simple navigation handlers (new hub screens) ────────────────────────────

  const onOpenModes      = useCallback(() => setScreen(S.MODE_SELECT), []);
  const onOpenCodex      = useCallback(() => setScreen(S.CODEX), []);
  const onOpenProfile    = useCallback(() => setScreen(S.PROFILE), []);
  const onOpenSettings   = useCallback(() => setScreen(S.SETTINGS), []);
  const onOpenLeaderboard = useCallback(() => setScreen(S.LEADERBOARD_FULL), []);
  const onBackToHome     = useCallback(() => setScreen(S.HOME), []);

  // Disconnecting only makes sense outside MiniPay — MiniPay auto-reconnects
  // the injected wallet on a timer, so offering it there would just flicker.
  const handleDisconnect = useCallback(() => {
    disconnect();
    setScreen(S.WALLET_CONNECT);
  }, [disconnect]);

  // ── Screen routing ──────────────────────────────────────────────────────────

  // Low-gas modal overlays every post-connect screen.
  // MiniPay uses fee abstraction — CELO is invisible to users and never required.
  const showGasModal = !!address && !hasGas && !isMiniPay && screen !== S.WALLET_CONNECT;

  let currentScreen;
  switch (screen) {
    case S.WALLET_CONNECT:
      currentScreen = (
        <WalletConnect
          address={address}
          onConnect={connect}
          onConnectSocial={connectWithSocial}
          socialLoading={socialLoading}
          isMiniPay={isMiniPay}
          error={walletError ?? profileError}
          onRetry={profileError ? () => setProfileAttempt(n => n + 1) : undefined}
          onPlayAsGuest={isMiniPay ? undefined : handlePlayAsGuest}
        />
      );
      break;

    case S.SET_USERNAME:
      currentScreen = (
        <SetUsername
          onSubmit={handleSetUsername}
          onSkip={() => setScreen(S.HOME)}
          checkUsernameAvailable={checkUsernameAvailable}
        />
      );
      break;

    case S.HOME:
      currentScreen = (
        <>
          <Home
            profile={profile}
            address={address}
            isMiniPay={isMiniPay}
            leaderboard={leaderboard}
            leaderboardLoading={leaderboardLoading}
            onOpenModes={onOpenModes}
            hasPausedGame={hasPausedGame}
            pausedScore={score}
            pausedRemaining={remaining}
            onContinueGame={handleContinueGame}
            onOpenLegal={setLegalModal}
            onOpenFAQ={() => setShowFAQ(true)}
            ladder={ladderApi.ladder}
            unclaimedRewards={rewardsApi.unclaimedCount}
            onOpenLadder={() => setShowLadder(true)}
            onOpenSettings={onOpenSettings}
            onOpenProfile={onOpenProfile}
            onOpenCodex={onOpenCodex}
            onOpenLeaderboard={onOpenLeaderboard}
            progress={progress}
            challenges={challenges}
            challengesDone={challengesDone}
            streakBroken={streakBroken}
          />
          {showTutorial && (
            <HowToPlay onDone={() => {
              localStorage.setItem('nk_tutorial_seen', '1');
              setShowTutorial(false);
            }} />
          )}
          <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
          <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
        </>
      );
      break;

    case S.MODE_SELECT:
      currentScreen = (
        <ModeSelect
          onBack={onBackToHome}
          onSelectMerge={handleStartGame}
        />
      );
      break;

    case S.CODEX:
      currentScreen = <Codex onBack={onBackToHome} progress={progress} />;
      break;

    case S.PROFILE:
      currentScreen = (
        <Profile
          profile={profile}
          address={address}
          progress={progress}
          onBack={onBackToHome}
          onEditName={() => setScreen(S.SET_USERNAME)}
        />
      );
      break;

    case S.SETTINGS:
      currentScreen = (
        <Settings
          onBack={onBackToHome}
          muted={muted}
          onToggleMute={toggleMute}
          musicMuted={musicMuted}
          onToggleMusic={toggleMusicMute}
          onDisconnect={isMiniPay ? undefined : handleDisconnect}
        />
      );
      break;

    case S.LEADERBOARD_FULL:
      currentScreen = (
        <FullLeaderboard
          onBack={onBackToHome}
          entries={leaderboard}
          loading={leaderboardLoading}
          myUsername={profile?.username}
        />
      );
      break;

    case S.STARTING:
      currentScreen = <Starting />;
      break;

    case S.PLAYING:
      currentScreen = (
        <Playing
          canvasRef={canvasRef}
          nextIdx={nextIdx}
          nextNextIdx={nextNextIdx}
          holdIdx={holdIdx}
          canHold={canHold}
          onSwapHold={swapHold}
          chain={chain}
          timeDelta={timeDelta}
          discovery={discovery}
          onDiscoveryDone={clearDiscovery}
          sessionStatus={sessionStatus}
          score={score}
          personalBest={profile?.personalBest ?? 0}
          remaining={remaining}
          containerWidth={containerWidth}
          packages={packages}
          onPurchase={handlePurchase}
          purchaseLoading={purchaseLoading}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          balances={balances}
          totalBombs={totalBombs}
          totalExpands={totalExpands}
          powerUpsEnabled={powerUpsEnabled}
          onUseBomb={handleUseBomb}
          onUseExpand={handleUseExpand}
          onBuyBombs={() => powerUpsEnabled && setShop('bomb')}
          onBuyExpands={() => powerUpsEnabled && setShop('expand')}
          powerUpLoading={powerUpLoading}
          shop={shop}
          onCloseShop={() => setShop(null)}
          powerUpPackages={powerUpPackages}
          powerUpToken={powerUpToken}
          onSelectPowerUpToken={setPowerUpToken}
          onPurchasePowerUp={handlePurchasePowerUp}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          pauseEngine={pauseEngine}
          resumeEngine={resumeEngine}
          onGoHome={handleGoHome}
          muted={muted}
          onToggleMute={toggleMute}
          musicMuted={musicMuted}
          onToggleMusic={toggleMusicMute}
          toast={toast}
          movePointer={movePointer}
          dropFruit={dropFruit}
          gameOver={gameOver}
          isGuestMode={isGuestMode}
          guestTrialExpired={guestTrialExpired}
          onConnectWallet={connect}
          onConnectSocial={connectWithSocial}
          socialLoading={socialLoading}
          onRetryGuest={handleRetryGuest}
        />
      );
      break;

    case S.SUBMITTING:
      currentScreen = <Submitting score={finalScore} />;
      break;

    case S.RESULT:
      currentScreen = (
        <Result
          score={finalScore}
          personalBest={profile?.personalBest ?? 0}
          isNewRecord={isNewRecord}
          rank={resultRank}
          leaderboard={leaderboard}
          leaderboardLoading={leaderboardLoading}
          onPlayAgain={handleStartGame}
          onGoHome={onBackToHome}
          runSummary={runSummary}
          progress={progress}
          myUsername={profile?.username}
        />
      );
      break;

    default:
      currentScreen = null;
  }

  if (isAdminRoute) {
    return (
      <Admin
        address={address}
        walletClient={walletClient}
        onConnect={connect}
        onExit={() => { window.location.hash = ''; setIsAdminRoute(false); }}
      />
    );
  }

  return (
    <>
      {currentScreen}
      {showGasModal && (
        <LowGasModal
          address={address}
          balanceDisplay={balanceDisplay}
          checking={gasChecking}
          onRecheck={recheckNow}
        />
      )}
      <LadderModal
        isOpen={showLadder}
        onClose={() => setShowLadder(false)}
        ladder={ladderApi.ladder}
        levels={ladderApi.levels}
        rewards={rewardsApi}
      />

      {/* Celebration — only fires for levels that actually paid out */}
      <LevelUpModal
        levels={ladderApi.celebrate}
        onClose={ladderApi.clearCelebration}
      />

      {/* Step 2 of a claim, re-surfaced after the app returns from MiniPay */}
      <ClaimConfirmModal
        pending={rewardsApi.pending}
        onConfirm={rewardsApi.confirm}
        onDismiss={rewardsApi.dismissPending}
      />

      {showFollowPrompt && (
        <FollowXModal
          onClose={() => setShowFollowPrompt(false)}
          onFollowed={markFollowPromptDone}
        />
      )}
      {/* Splash screen sits on top of everything, self-dismisses after ~3s */}
      {!splashDone && (
        <SplashScreen onDone={() => setSplashDone(true)} />
      )}
    </>
  );
}
