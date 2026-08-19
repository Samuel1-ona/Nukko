import { useState, useRef, useCallback } from 'react';

let _ac = null;
function getAC() {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  if (_ac.state === 'suspended') _ac.resume().catch(() => {});
  return _ac;
}

// Module-level mute flag — persisted across renders, synced to localStorage
let _muted = localStorage.getItem('nk_sfx_muted') === '1';

function noise(ac, dur = 0.08) {
  const len  = Math.ceil(ac.sampleRate * dur);
  const buf  = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1);
  return buf;
}

function playOsc(ac, type, freq, gainPeak, attack, decay, detune = 0) {
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type    = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.detune.setValueAtTime(detune, now);
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(gainPeak, now + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  osc.connect(env); env.connect(ac.destination);
  osc.start(now); osc.stop(now + attack + decay + 0.01);
}

export function useAudio() {
  const dangerIntervalRef = useRef(null);
  const isDangerRef       = useRef(false);
  const [muted, setMuted] = useState(_muted);

  const toggleMute = useCallback(() => {
    _muted = !_muted;
    localStorage.setItem('nk_sfx_muted', _muted ? '1' : '0');
    setMuted(_muted);
    // If muting while danger is playing, stop the heartbeat immediately
    if (_muted && dangerIntervalRef.current) {
      clearInterval(dangerIntervalRef.current);
      dangerIntervalRef.current = null;
      isDangerRef.current = false;
    }
  }, []);

  const playDrop = useCallback(() => {
    if (_muted) return;
    try {
      const ac  = getAC();
      const now = ac.currentTime;
      // Low thud
      const osc = ac.createOscillator();
      const env = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.25, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(env); env.connect(ac.destination);
      osc.start(now); osc.stop(now + 0.2);

      // Short noise transient
      const src  = ac.createBufferSource();
      const nenv = ac.createGain();
      const filt = ac.createBiquadFilter();
      src.buffer = noise(ac, 0.05);
      filt.type  = 'bandpass'; filt.frequency.value = 300; filt.Q.value = 1.2;
      nenv.gain.setValueAtTime(0.12, now);
      nenv.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      src.connect(filt); filt.connect(nenv); nenv.connect(ac.destination);
      src.start(now);
    } catch (_) {}
  }, []);

  const playMerge = useCallback((tier = 0, chain = 1) => {
    if (_muted) return;
    // tier 0–13: pitch and volume scale up.
    // chain climbs the pitch further on each link so a cascade is audible
    // before it's visible — the ear registers the combo faster than the eye.
    try {
      const ac   = getAC();
      const freq = 280 + tier * 80 + Math.max(0, chain - 1) * 55;
      const vol  = 0.12 + tier * 0.018;
      playOsc(ac, 'sine', freq,          vol,       0.01, 0.18);
      playOsc(ac, 'sine', freq * 1.5,    vol * 0.5, 0.02, 0.14);
      playOsc(ac, 'sine', freq * 2,      vol * 0.25,0.03, 0.10);
      if (tier >= 5) {
        playOsc(ac, 'sine', freq * 0.5,  vol * 0.4, 0.01, 0.22);
      }
    } catch (_) {}
  }, []);

  const playReady = useCallback(() => {
    if (_muted) return;
    try {
      const ac  = getAC();
      playOsc(ac, 'sine', 880, 0.09, 0.005, 0.08);
      playOsc(ac, 'sine', 1320, 0.05, 0.02, 0.07);
    } catch (_) {}
  }, []);

  const playBomb = useCallback(() => {
    if (_muted) return;
    try {
      const ac  = getAC();
      const now = ac.currentTime;

      // Deep boom
      const osc = ac.createOscillator();
      const env = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);
      env.gain.setValueAtTime(0.5, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(env); env.connect(ac.destination);
      osc.start(now); osc.stop(now + 0.55);

      // Noise burst
      const src  = ac.createBufferSource();
      const nenv = ac.createGain();
      const filt = ac.createBiquadFilter();
      src.buffer = noise(ac, 0.25);
      filt.type  = 'lowpass'; filt.frequency.value = 1800;
      nenv.gain.setValueAtTime(0.38, now);
      nenv.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      src.connect(filt); filt.connect(nenv); nenv.connect(ac.destination);
      src.start(now);
    } catch (_) {}
  }, []);

  // Gravity-well collapse — deliberately uglier and lower than playBomb so the
  // ear learns "this cost me something" rather than "I did something good".
  const playCollapse = useCallback(() => {
    if (_muted) return;
    try {
      const ac  = getAC();
      const now = ac.currentTime;

      // Descending detuned groan
      [0, 18].forEach((detune, i) => {
        const osc = ac.createOscillator();
        const env = ac.createGain();
        osc.type = 'sawtooth';
        osc.detune.setValueAtTime(detune, now);
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.75);
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.3 - i * 0.1, now + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        const filt = ac.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 700;
        osc.connect(filt); filt.connect(env); env.connect(ac.destination);
        osc.start(now); osc.stop(now + 0.85);
      });

      // Debris rumble
      const src  = ac.createBufferSource();
      const nenv = ac.createGain();
      const filt = ac.createBiquadFilter();
      src.buffer = noise(ac, 0.5);
      filt.type  = 'lowpass'; filt.frequency.value = 900;
      nenv.gain.setValueAtTime(0.3, now);
      nenv.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      src.connect(filt); filt.connect(nenv); nenv.connect(ac.destination);
      src.start(now);
    } catch (_) {}
  }, []);

  const playExpand = useCallback(() => {
    if (_muted) return;
    try {
      const ac  = getAC();
      const now = ac.currentTime;
      // Rising whoosh
      const osc = ac.createOscillator();
      const env = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.18, now + 0.05);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      const filt = ac.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 600; filt.Q.value = 0.8;
      osc.connect(filt); filt.connect(env); env.connect(ac.destination);
      osc.start(now); osc.stop(now + 0.45);
    } catch (_) {}
  }, []);

  const playTime = useCallback(() => {
    if (_muted) return;
    try {
      const ac   = getAC();
      // Gentle ascending chime trio
      [0, 80, 160].forEach((delayMs, i) => {
        setTimeout(() => {
          try {
            playOsc(getAC(), 'sine', 660 + i * 220, 0.12, 0.01, 0.3);
          } catch (_) {}
        }, delayMs);
      });
    } catch (_) {}
  }, []);

  const playGameOver = useCallback(() => {
    if (_muted) return;
    try {
      const ac  = getAC();
      // Descending minor chord sting
      [440, 370, 294, 220].forEach((f, i) => {
        setTimeout(() => {
          try {
            playOsc(getAC(), 'sine', f, 0.14, 0.01, 0.4 - i * 0.05);
          } catch (_) {}
        }, i * 90);
      });
    } catch (_) {}
  }, []);

  const startDanger = useCallback(() => {
    if (_muted || isDangerRef.current) return;
    isDangerRef.current = true;
    const beat = () => {
      try {
        const ac  = getAC();
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const env = ac.createGain();
        osc.type = 'sine'; osc.frequency.value = 55;
        env.gain.setValueAtTime(0.22, now);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(env); env.connect(ac.destination);
        osc.start(now); osc.stop(now + 0.14);
      } catch (_) {}
    };
    beat();
    dangerIntervalRef.current = setInterval(beat, 600);
  }, []);

  const stopDanger = useCallback(() => {
    if (!isDangerRef.current) return;
    isDangerRef.current = false;
    clearInterval(dangerIntervalRef.current);
    dangerIntervalRef.current = null;
  }, []);

  return { playDrop, playMerge, playReady, playBomb, playCollapse, playExpand, playTime, playGameOver, startDanger, stopDanger, muted, toggleMute };
}
