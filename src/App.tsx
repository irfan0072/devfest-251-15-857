import { useState, useEffect } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import { Navbar } from './components/Navbar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { EscapeChallenge } from './components/EscapeChallenge';
import { VibeLab } from './components/VibeLab';
import { Telemetry } from './components/Telemetry';
import { Ecosystem } from './components/Ecosystem';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { triggerConfetti } from './components/Confetti';
import './App.css';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('devfest-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState<1 | 5 | 10>(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devfest-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addAchievement = (title: string, desc: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nextCount = count + multiplier;
    setCount(nextCount);

    // Confetti on milestone
    if (nextCount >= 10 && count < 10) {
      triggerConfetti(rect.left + rect.width / 2, rect.top);
      addAchievement('Speed Hacker', 'Reached 10 resonance points!');
    } else if (nextCount >= 25 && count < 25) {
      triggerConfetti(rect.left + rect.width / 2, rect.top);
      addAchievement('Cyber Vanguard', 'Crossed 25 quantum iterations!');
    } else if (nextCount >= 50 && count < 50) {
      triggerConfetti(rect.left + rect.width / 2, rect.top);
      addAchievement('Overclocked Legend', 'Achieved 50+ maximum matrix compute!');
    }
  };

  const getRank = (c: number) => {
    if (c >= 50) return { label: 'Quantum Overlord', color: 'var(--accent-rose)' };
    if (c >= 25) return { label: 'Cyber Vanguard', color: 'var(--accent-purple)' };
    if (c >= 10) return { label: 'Node Architect', color: 'var(--accent-cyan)' };
    return { label: 'Novice Runner', color: 'var(--accent-emerald)' };
  };

  const rank = getRank(count);
  const nextTarget = count < 10 ? 10 : count < 25 ? 25 : count < 50 ? 50 : 100;
  const progressPercent = Math.min(100, Math.floor((count / nextTarget) * 100));

  return (
    <>
      {/* Background Ambience & Grid */}
      <div className="ambient-glow-wrapper" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>
      <div className="bg-grid-overlay" aria-hidden="true"></div>

      {/* Particle Mesh */}
      {particlesEnabled && <ParticleCanvas interactive={true} />}

      {/* Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        particlesEnabled={particlesEnabled}
        onToggleParticles={() => setParticlesEnabled(!particlesEnabled)}
      />

      <main className="main-content">
        {/* Hero Section */}
        <section id="center" className="hero-showcase-section">
          <div className="hero-announcement">
            <span className="live-pulsar"></span>
            <span className="announcement-text">DevFest 2026 Innovation Showcase</span>
            <span className="badge-arrow">→</span>
          </div>

          <div className="hero-tilt-wrapper">
            <div className="hero-card-display glass-panel">
              <div className="hero-logos-stack">
                <img src={heroImg} className="base-orb-img" width="190" height="190" alt="Vibe Glow Core" />
                <img src={reactLogo} className="logo-badge react-badge" alt="React 19" />
                <img src={viteLogo} className="logo-badge vite-badge" alt="Vite 8" />
              </div>

              <div className="hero-text-block">
                <h1 className="hero-heading">
                  Vibe Code with <span className="gradient-text">Instant Velocity</span>
                </h1>
                <p className="hero-tagline">
                  Experience Next-Gen React 19 and Vite 8 with animated micro-interactions, cyber escape puzzles, and real-time telemetry.
                </p>
              </div>

              {/* Interactive Counter & Milestone Unlocks */}
              <div className="interactive-counter-card glass-panel">
                <div className="counter-meta">
                  <div className="rank-badge" style={{ borderColor: rank.color, color: rank.color }}>
                    <span className="rank-sparkle">★</span> {rank.label}
                  </div>
                  <div className="multiplier-selector">
                    <span className="multi-label">Step:</span>
                    {([1, 5, 10] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`multi-btn ${multiplier === m ? 'active' : ''}`}
                        onClick={() => setMultiplier(m)}
                      >
                        +{m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="counter-display-row">
                  <div className="counter-val-group">
                    <span className="count-number">{count}</span>
                    <span className="count-unit">CYCLES</span>
                  </div>

                  <button
                    type="button"
                    className="action-btn primary-glow-btn main-counter-btn"
                    onClick={handleIncrement}
                  >
                    <span>⚡ Pulse Pulse (+{multiplier})</span>
                  </button>
                </div>

                {/* Progress to next milestone */}
                <div className="milestone-progress-bar">
                  <div className="progress-labels">
                    <span>Progress to Level Milestone</span>
                    <span>{count} / {nextTarget}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: The Smart Escape Matrix */}
        <EscapeChallenge onUnlockAchievement={addAchievement} />

        {/* Feature 2: The Vibe Lab Synthesizer */}
        <VibeLab onUnlockAchievement={addAchievement} />

        {/* Feature 3: Real-Time Engine Telemetry */}
        <Telemetry onUnlockAchievement={addAchievement} />

        {/* Feature 4: Tech Ecosystem Explorer */}
        <Ecosystem onUnlockAchievement={addAchievement} />
      </main>

      {/* Polished Modern Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">DevFest 2026 • Smart Escape</span>
            <p className="footer-copy">
              Crafted for developers pushing the boundaries of modern UI and reactive web architecture.
            </p>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <a href="https://github.com/irfan0072/devfest-251-15-857" target="_blank" rel="noreferrer">
                GitHub Repository
              </a>
              <a href="https://vite.dev" target="_blank" rel="noreferrer">
                Vite 8 Docs
              </a>
              <a href="https://react.dev" target="_blank" rel="noreferrer">
                React 19 Docs
              </a>
            </div>
            <span className="build-tag">BUILD v1.2 • ZERO LATENCY</span>
          </div>
        </div>
      </footer>

      {/* Achievement Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}

export default App;
