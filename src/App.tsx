import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { SmartEscapeSimulator } from './components/SmartEscapeSimulator';
import { EscapeChallenge } from './components/EscapeChallenge';
import { VibeLab } from './components/VibeLab';
import { Telemetry } from './components/Telemetry';
import { Ecosystem } from './components/Ecosystem';
import { ToastContainer, type ToastMessage } from './components/Toast';
import './App.css';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('devfest-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [particlesEnabled, setParticlesEnabled] = useState(true);
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

  return (
    <>
      {/* Ambient Animated Glow Mesh & Dot Grid */}
      <div className="ambient-glow-wrapper" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>
      <div className="bg-grid-overlay" aria-hidden="true"></div>

      {/* Background Interactive Particle Network */}
      {particlesEnabled && <ParticleCanvas interactive={true} />}

      {/* Sticky Top Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        particlesEnabled={particlesEnabled}
        onToggleParticles={() => setParticlesEnabled(!particlesEnabled)}
      />

      <main className="main-content">
        {/* CORE APPLICATION: The Smart Escape Evacuation Route Simulator (Front & Center) */}
        <SmartEscapeSimulator onUnlockAchievement={addAchievement} />

        {/* BONUS MODULE 1: Cyber Escape Matrix Puzzle */}
        <EscapeChallenge onUnlockAchievement={addAchievement} />

        {/* BONUS MODULE 2: The Vibe Lab Synthesizer */}
        <VibeLab onUnlockAchievement={addAchievement} />

        {/* BONUS MODULE 3: Real-Time Engine Telemetry & Benchmark */}
        <Telemetry onUnlockAchievement={addAchievement} />

        {/* BONUS MODULE 4: Tech Stack & Ecosystem Architecture */}
        <Ecosystem onUnlockAchievement={addAchievement} />
      </main>

      {/* Polished Modern Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">AI DevFest 2026 • Smart Escape</span>
            <p className="footer-copy">
              Built for the AI DevFest Solo Mock Test Practice Challenge. Solves dynamic building evacuation routing via Dijkstra algorithm.
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
            <span className="build-tag">REG: 251-15-857 • OFFICIAL SUBMISSION</span>
          </div>
        </div>
      </footer>

      {/* Achievement Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}

export default App;
