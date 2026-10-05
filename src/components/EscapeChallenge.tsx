import { useState } from 'react';
import { triggerConfetti } from './Confetti';

interface EscapeChallengeProps {
  onUnlockAchievement: (title: string, desc: string) => void;
}

export function EscapeChallenge({ onUnlockAchievement }: EscapeChallengeProps) {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [inputVal, setInputVal] = useState('');
  const [frequency, setFrequency] = useState(50);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'info' | 'error' | 'success' }>({
    text: 'SYSTEM LOCKDOWN: Decrypt the cipher key to unlock Node Alpha.',
    type: 'info',
  });
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isEscaped, setIsEscaped] = useState(false);

  // Puzzle 1: Decrypt binary/ASCII
  const handleSolveLevel1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim().toUpperCase() === 'VIBE') {
      setStatusMsg({ text: 'ACCESS GRANTED: Node Alpha unlocked. Frequency calibration required.', type: 'success' });
      setCompletedLevels((prev) => [...prev, 1]);
      setLevel(2);
      setInputVal('');
      triggerConfetti();
      onUnlockAchievement('Cipher Breaker', 'Successfully decrypted Node Alpha cipher.');
    } else {
      setStatusMsg({ text: 'INVALID HASH: Hint: 01010110 01001001 01000010 01000101 spells V...', type: 'error' });
    }
  };

  // Puzzle 2: Frequency calibration (target is 78%)
  const handleCalibrateLevel2 = () => {
    if (frequency >= 76 && frequency <= 80) {
      setStatusMsg({ text: 'RESONANCE LOCKED: Quantum gateway aligned. Final terminal breach active.', type: 'success' });
      setCompletedLevels((prev) => [...prev, 2]);
      setLevel(3);
      triggerConfetti();
      onUnlockAchievement('Quantum Synchronizer', 'Calibrated resonance frequency to 78MHz.');
    } else {
      setStatusMsg({
        text: `HARMONIC DISTORTION: Current: ${frequency}MHz. Target is near 78MHz. Tune carefully!`,
        type: 'error',
      });
    }
  };

  // Puzzle 3: Terminal Override
  const handleSolveLevel3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim().toLowerCase() === 'escape') {
      setStatusMsg({ text: 'OVERRIDE CONFIRMED: SMART ESCAPE COMPLETE. ALL SYSTEM CORES UNLOCKED!', type: 'success' });
      setCompletedLevels((prev) => [...prev, 3]);
      setIsEscaped(true);
      triggerConfetti();
      onUnlockAchievement('Grand Escape Master', 'Completed the DevFest Smart Escape Matrix challenge!');
    } else {
      setStatusMsg({ text: 'SECURITY ALERT: Command rejected. Type "escape" to bypass lockdown.', type: 'error' });
    }
  };

  const handleReset = () => {
    setLevel(1);
    setInputVal('');
    setFrequency(50);
    setCompletedLevels([]);
    setIsEscaped(false);
    setStatusMsg({ text: 'SYSTEM REBOOTED: Lockdown initiated.', type: 'info' });
  };

  return (
    <section id="escape-challenge" className="feature-section escape-section">
      <div className="section-header">
        <div className="section-badge">
          <span className="badge-glow-dot"></span>
          CYBER PUZZLE
        </div>
        <h2 className="section-title">The Smart Escape Matrix</h2>
        <p className="section-subtitle">
          Decrypt encrypted nodes, balance quantum resonance, and trigger the master firewall bypass.
        </p>
      </div>

      <div className="escape-terminal-card glass-panel">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="terminal-title">
            <span className="terminal-prompt">$</span> /devfest/security/escape-matrix.sh
          </div>
          <div className="terminal-status-pill">
            {isEscaped ? 'SYSTEM UNLOCKED' : `NODE ${level} OF 3 LOCKED`}
          </div>
        </div>

        {/* Level Steps */}
        <div className="level-stepper">
          {[1, 2, 3].map((lvl) => (
            <div
              key={lvl}
              className={`step-item ${level === lvl ? 'active' : ''} ${
                completedLevels.includes(lvl) ? 'completed' : ''
              }`}
            >
              <div className="step-number">
                {completedLevels.includes(lvl) ? '✓' : lvl}
              </div>
              <div className="step-label">
                {lvl === 1 ? 'Cipher Key' : lvl === 2 ? 'Resonance' : 'Master Override'}
              </div>
            </div>
          ))}
        </div>

        <div className="terminal-body">
          {/* Status Alert Banner */}
          <div className={`status-banner status-${statusMsg.type}`}>
            <span className="status-icon">
              {statusMsg.type === 'success' ? '✔' : statusMsg.type === 'error' ? '⚠' : 'ℹ'}
            </span>
            <span className="status-text">{statusMsg.text}</span>
          </div>

          {!isEscaped ? (
            <div className="puzzle-content">
              {level === 1 && (
                <form onSubmit={handleSolveLevel1} className="puzzle-form">
                  <div className="puzzle-clue-box">
                    <span className="clue-tag">ENCRYPTED STREAM:</span>
                    <code className="cipher-code">01010110 01001001 01000010 01000101</code>
                    <p className="clue-hint">Decode this 4-letter binary phrase to unlock Node Alpha.</p>
                  </div>

                  <div className="terminal-input-row">
                    <span className="terminal-caret">&gt;</span>
                    <input
                      type="text"
                      className="terminal-input"
                      placeholder="Enter 4-letter word (e.g. VIBE)..."
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="action-btn primary-glow-btn">
                      Decrypt Node
                    </button>
                  </div>
                </form>
              )}

              {level === 2 && (
                <div className="puzzle-form">
                  <div className="puzzle-clue-box">
                    <span className="clue-tag">HARMONIC ALIGNMENT:</span>
                    <div className="wave-visualizer">
                      <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
                        <path
                          d={`M 0 30 Q 100 ${30 - (frequency - 50) * 0.8} 200 30 T 400 30`}
                          fill="none"
                          stroke="var(--accent-cyan)"
                          strokeWidth="3"
                          className="pulse-wave"
                        />
                        <path
                          d="M 0 30 Q 100 8 200 30 T 400 30"
                          fill="none"
                          stroke="rgba(16, 185, 129, 0.4)"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    </div>
                    <div className="resonance-meta">
                      <span>Target: ~78 MHz</span>
                      <span className="current-freq">Current: {frequency} MHz</span>
                    </div>
                  </div>

                  <div className="slider-control-group">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      className="cyber-slider"
                    />
                    <button
                      type="button"
                      onClick={handleCalibrateLevel2}
                      className="action-btn primary-glow-btn"
                    >
                      Calibrate Lock
                    </button>
                  </div>
                </div>
              )}

              {level === 3 && (
                <form onSubmit={handleSolveLevel3} className="puzzle-form">
                  <div className="puzzle-clue-box">
                    <span className="clue-tag">FINAL FIREWALL BYPASS:</span>
                    <p className="clue-hint">Type <code>escape</code> to disengage safety clamps and claim victory.</p>
                  </div>

                  <div className="terminal-input-row">
                    <span className="terminal-caret">&gt;</span>
                    <input
                      type="text"
                      className="terminal-input"
                      placeholder="Type command 'escape'..."
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="action-btn primary-glow-btn">
                      Execute Override
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="escape-victory-box">
              <div className="victory-badge">🏆 MISSION COMPLETE</div>
              <h3 className="victory-title">Escape Protocol Succeeded!</h3>
              <p className="victory-desc">
                You bypassed all 3 cyber security containment nodes with 100% precision.
              </p>
              <div className="victory-stats">
                <div className="stat-chip">
                  <span className="stat-label">Security Clearance</span>
                  <span className="stat-value">LEVEL 5 DEV</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-label">Latency</span>
                  <span className="stat-value">0.14ms</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">S-RANK</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="action-btn secondary-btn"
              >
                Replay Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
