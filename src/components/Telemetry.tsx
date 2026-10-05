import { useState, useEffect } from 'react';
import { triggerConfetti } from './Confetti';

interface TelemetryProps {
  onUnlockAchievement: (title: string, desc: string) => void;
}

export function Telemetry({ onUnlockAchievement }: TelemetryProps) {
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [history, setHistory] = useState<number[]>([45, 52, 58, 60, 59, 60, 60, 58, 60, 60, 59, 60]);

  // Live telemetry ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isBenchmarking) {
        const nextFps = Math.floor(58 + Math.random() * 3);
        const nextLatency = Math.floor(12 + Math.random() * 6);
        const nextCpu = Math.floor(20 + Math.random() * 8);

        setFps(nextFps);
        setLatency(nextLatency);
        setCpuUsage(nextCpu);
        setHistory((prev) => [...prev.slice(1), nextFps]);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isBenchmarking]);

  const runBenchmark = () => {
    setIsBenchmarking(true);
    let step = 0;
    const benchInterval = setInterval(() => {
      step++;
      setFps(Math.floor(85 + Math.random() * 35));
      setCpuUsage(Math.floor(75 + Math.random() * 20));
      setLatency(Math.max(4, Math.floor(8 - Math.random() * 4)));

      if (step >= 8) {
        clearInterval(benchInterval);
        setIsBenchmarking(false);
        setFps(60);
        setCpuUsage(22);
        setLatency(12);
        triggerConfetti();
        onUnlockAchievement('Benchmark Champion', 'Pushed engine to 120 FPS stress capability.');
      }
    }, 250);
  };

  // Convert history array to SVG polyline points
  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * 300;
      const y = 80 - ((val - 30) / 90) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section id="telemetry" className="feature-section telemetry-section">
      <div className="section-header">
        <div className="section-badge">
          <span className="badge-glow-dot"></span>
          REAL-TIME TELEMETRY
        </div>
        <h2 className="section-title">Engine Health &amp; Diagnostics</h2>
        <p className="section-subtitle">
          Continuous performance telemetry monitoring DOM compositor frames, pipeline latency, and core services.
        </p>
      </div>

      <div className="telemetry-grid">
        {/* Metric Card 1: FPS Graph */}
        <div className="telemetry-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Framerate Performance</span>
            <span className={`status-pill ${fps >= 58 ? 'pill-green' : 'pill-yellow'}`}>
              {fps >= 58 ? 'OPTIMAL' : 'WARPING'}
            </span>
          </div>
          <div className="metric-primary-value">
            <span className="number-counter">{fps}</span>
            <span className="unit-label">FPS</span>
          </div>

          <div className="svg-sparkline-box">
            <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={`0,90 ${points} 300,90`} fill="url(#chartGradient)" />
              <polyline
                fill="none"
                stroke="var(--accent-purple)"
                strokeWidth="2.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric Card 2: Latency Gauge */}
        <div className="telemetry-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Event Loop Latency</span>
            <span className="status-pill pill-cyan">ULTRA-LOW</span>
          </div>
          <div className="metric-primary-value">
            <span className="number-counter">{latency}</span>
            <span className="unit-label">ms</span>
          </div>

          <div className="meter-bar-container">
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill latency-fill"
                style={{ width: `${Math.min(100, (latency / 50) * 100)}%` }}
              ></div>
            </div>
            <div className="meter-labels">
              <span>0ms</span>
              <span>25ms</span>
              <span>50ms (Budget)</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: CPU Usage Dial */}
        <div className="telemetry-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Thread Utilization</span>
            <span className="status-pill pill-purple">V8 ENGINE</span>
          </div>
          <div className="metric-primary-value">
            <span className="number-counter">{cpuUsage}</span>
            <span className="unit-label">%</span>
          </div>

          <div className="meter-bar-container">
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill cpu-fill"
                style={{ width: `${cpuUsage}%` }}
              ></div>
            </div>
            <div className="meter-labels">
              <span>Idle</span>
              <span>Workload: Normal</span>
              <span>Peak</span>
            </div>
          </div>
        </div>

        {/* Microservice Matrix Status */}
        <div className="telemetry-card glass-panel node-matrix-card">
          <div className="metric-header">
            <span className="metric-title">Active Node Topology</span>
            <button
              type="button"
              className={`benchmark-btn ${isBenchmarking ? 'loading' : ''}`}
              onClick={runBenchmark}
              disabled={isBenchmarking}
            >
              {isBenchmarking ? '⚡ Stress Testing...' : '🚀 Run Benchmark'}
            </button>
          </div>

          <div className="node-chips-list">
            <div className="node-chip">
              <span className="node-dot online"></span>
              <span className="node-name">Vite 8 HMR Gateway</span>
              <span className="node-status">100% HEALTH</span>
            </div>
            <div className="node-chip">
              <span className="node-dot online"></span>
              <span className="node-name">React 19 Fiber Tree</span>
              <span className="node-status">ZERO LEAKS</span>
            </div>
            <div className="node-chip">
              <span className="node-dot online"></span>
              <span className="node-name">Oxlint Static Validator</span>
              <span className="node-status">0 WARNINGS</span>
            </div>
            <div className="node-chip">
              <span className="node-dot online"></span>
              <span className="node-name">DevFest Quantum Relay</span>
              <span className="node-status">SYNCED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
