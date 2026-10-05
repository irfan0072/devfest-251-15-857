import { useState, useRef, useEffect } from 'react';

interface VibeLabProps {
  onUnlockAchievement: (title: string, desc: string) => void;
}

export function VibeLab({ onUnlockAchievement }: VibeLabProps) {
  const [speed, setSpeed] = useState(1.5);
  const [hue, setHue] = useState(270); // Violet start
  const [amplitude, setAmplitude] = useState(35);
  const [waveMode, setWaveMode] = useState<'sine' | 'quantum' | 'pulse'>('quantum');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Web Audio Synth
  const toggleAudio = () => {
    if (isPlayingAudio) {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      gainRef.current?.disconnect();
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveMode === 'quantum' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(120 + hue * 0.8, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setIsPlayingAudio(true);
        onUnlockAchievement('Audio Alchemist', 'Synthesized real-time frequency waveforms.');
      } catch (err) {
        console.error('Audio initialization failed', err);
      }
    }
  };

  useEffect(() => {
    if (isPlayingAudio && oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setTargetAtTime(120 + hue * 0.8, audioCtxRef.current.currentTime, 0.05);
    }
  }, [hue, isPlayingAudio]);

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
    };
  }, []);

  const applyPreset = (presetName: string, pSpeed: number, pHue: number, pAmp: number, pMode: 'sine' | 'quantum' | 'pulse') => {
    setSpeed(pSpeed);
    setHue(pHue);
    setAmplitude(pAmp);
    setWaveMode(pMode);
    onUnlockAchievement('Preset Explorer', `Loaded ${presetName} visual vibe preset.`);
  };

  return (
    <section id="vibe-lab" className="feature-section vibe-section">
      <div className="section-header">
        <div className="section-badge">
          <span className="badge-glow-dot"></span>
          REAL-TIME SYNTHESIZER
        </div>
        <h2 className="section-title">The Vibe Coding Playground</h2>
        <p className="section-subtitle">
          Sculpt generative wave patterns, warp color frequencies, and feel the dynamic rhythm in real-time.
        </p>
      </div>

      <div className="vibe-playground-card glass-panel">
        <div className="vibe-canvas-display" style={{ '--vibe-color': `hsl(${hue}, 85%, 60%)` } as React.CSSProperties}>
          <div className="canvas-badge-overlay">
            <span className="badge-tag">WAVE: {waveMode.toUpperCase()}</span>
            <span className="badge-tag">{hue}° CHROMATIC HUE</span>
            <span className="badge-tag">{speed}x RATE</span>
          </div>

          <svg className="interactive-wave-svg" viewBox="0 0 800 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={`hsl(${hue}, 90%, 65%)`} />
                <stop offset="50%" stopColor={`hsl(${(hue + 60) % 360}, 90%, 65%)`} />
                <stop offset="100%" stopColor={`hsl(${(hue + 120) % 360}, 90%, 65%)`} />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Glow Ribbons */}
            <path
              d={`M 0 120 Q 200 ${120 - amplitude * 1.5} 400 120 T 800 120`}
              fill="none"
              stroke={`hsla(${hue}, 80%, 60%, 0.25)`}
              strokeWidth="8"
              filter="url(#neonGlow)"
              style={{ animation: `waveMotion ${6 / speed}s infinite linear` }}
            />

            {/* Main Interactive Wave */}
            <path
              d={
                waveMode === 'quantum'
                  ? `M 0 120 C 150 ${120 - amplitude * 2}, 250 ${120 + amplitude * 2}, 400 120 S 650 ${120 - amplitude * 2}, 800 120`
                  : waveMode === 'pulse'
                  ? `M 0 120 L 200 ${120 - amplitude * 1.8} L 400 ${120 + amplitude * 1.8} L 600 ${120 - amplitude * 1.8} L 800 120`
                  : `M 0 120 Q 200 ${120 - amplitude * 1.6} 400 120 T 800 120`
              }
              fill="none"
              stroke="url(#waveGlowGradient)"
              strokeWidth="4"
              filter="url(#neonGlow)"
              className="synthesizer-wave"
            />
          </svg>

          {/* Sound Synthesizer Floating Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`audio-synth-btn ${isPlayingAudio ? 'is-playing' : ''}`}
            title="Toggle Web Audio tone feedback"
          >
            <span>{isPlayingAudio ? '🔊 Mute Sound FX' : '🔈 Play Audio Tone'}</span>
          </button>
        </div>

        {/* Controls Grid */}
        <div className="vibe-controls-grid">
          <div className="control-card">
            <div className="control-label">
              <span>Oscillation Velocity</span>
              <span className="value-chip">{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="cyber-slider"
            />
          </div>

          <div className="control-card">
            <div className="control-label">
              <span>Chromatic Spectrum Hue</span>
              <span className="value-chip" style={{ color: `hsl(${hue}, 90%, 60%)` }}>
                {hue}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="cyber-slider"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
          </div>

          <div className="control-card">
            <div className="control-label">
              <span>Amplitude Height</span>
              <span className="value-chip">{amplitude}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="cyber-slider"
            />
          </div>

          <div className="control-card">
            <div className="control-label">
              <span>Waveform Geometry</span>
              <span className="value-chip">{waveMode}</span>
            </div>
            <div className="segmented-control">
              {(['quantum', 'sine', 'pulse'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`segment-btn ${waveMode === mode ? 'active' : ''}`}
                  onClick={() => setWaveMode(mode)}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets Row */}
        <div className="presets-footer">
          <span className="preset-label">EXPERIENCE PRESETS:</span>
          <div className="preset-buttons">
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyPreset('Cyberpunk Synth', 2.8, 290, 48, 'quantum')}
            >
              🟣 Cyberpunk Synth
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyPreset('Solar Aurora', 1.8, 175, 42, 'sine')}
            >
              🟢 Solar Aurora
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyPreset('Deep Pulse', 3.5, 345, 55, 'pulse')}
            >
              🔴 Deep Pulse
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyPreset('Zenith Flow', 1.0, 215, 25, 'sine')}
            >
              🔵 Zenith Flow
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
