import { useState } from 'react';

interface EcosystemProps {
  onUnlockAchievement: (title: string, desc: string) => void;
}

export function Ecosystem({ onUnlockAchievement }: EcosystemProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'core' | 'tooling' | 'community'>('all');

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    onUnlockAchievement('Clipboard Synthesizer', 'Copied quickstart terminal command.');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const stackItems = [
    {
      id: 'vite',
      category: 'core',
      name: 'Vite 8',
      role: 'Next-Gen Build Engine',
      desc: 'Blazing sub-millisecond Hot Module Replacement (HMR) powered by native ESM and Rolldown.',
      link: 'https://vite.dev',
      badge: 'Core Engine',
      icon: '⚡',
      color: '#a855f7',
    },
    {
      id: 'react',
      category: 'core',
      name: 'React 19',
      role: 'UI Composition Fiber',
      desc: 'Optimized rendering pipeline with concurrent mode, transition primitives, and custom hooks.',
      link: 'https://react.dev',
      badge: 'Frontend Framework',
      icon: '⚛️',
      color: '#06b6d4',
    },
    {
      id: 'typescript',
      category: 'tooling',
      name: 'TypeScript',
      role: 'Type System',
      desc: 'Complete static type verification ensuring bulletproof safety across every component and state.',
      link: 'https://www.typescriptlang.org/',
      badge: 'Type Safety',
      icon: '🔷',
      color: '#3b82f6',
    },
    {
      id: 'oxlint',
      category: 'tooling',
      name: 'Oxlint',
      role: 'Rust-Powered Linter',
      desc: '50-100x faster than traditional linters, catching subtle bugs before code reaches production.',
      link: 'https://oxc.rs',
      badge: 'Code Quality',
      icon: '🦀',
      color: '#f97316',
    },
    {
      id: 'devfest',
      category: 'community',
      name: 'DevFest 2026',
      role: 'Global Developer Community',
      desc: 'Join millions of creators worldwide exploring AI, agentic workflows, and future web standards.',
      link: 'https://devfest.withgoogle.com',
      badge: 'Innovation Hub',
      icon: '🌐',
      color: '#10b981',
    },
  ];

  const filteredItems = stackItems.filter((item) => filter === 'all' || item.category === filter);

  return (
    <section id="resources" className="feature-section ecosystem-section">
      <div className="section-header">
        <div className="section-badge">
          <span className="badge-glow-dot"></span>
          ECOSYSTEM &amp; RESOURCES
        </div>
        <h2 className="section-title">Technological Architecture</h2>
        <p className="section-subtitle">
          Engineered with the modern web stack for unprecedented developer velocity and visual delight.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {(['all', 'core', 'tooling', 'community'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 3D Stack Cards Grid */}
      <div className="stack-cards-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="stack-card glass-panel"
            style={{ '--card-accent': item.color } as React.CSSProperties}
          >
            <div className="card-top">
              <div className="card-icon-bubble">{item.icon}</div>
              <span className="card-badge">{item.badge}</span>
            </div>

            <h3 className="card-name">{item.name}</h3>
            <span className="card-role">{item.role}</span>
            <p className="card-desc">{item.desc}</p>

            <div className="card-actions">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn card-link-btn"
              >
                <span>Documentation</span>
                <span className="arrow">↗</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Setup Terminal Snippet */}
      <div className="quickstart-box glass-panel">
        <div className="quickstart-header">
          <span className="quickstart-tag">⚡ RAPID ONBOARDING COMMAND</span>
          <button
            type="button"
            className="copy-trigger-btn"
            onClick={() => copyText('git clone https://github.com/irfan0072/devfest-251-15-857.git && cd "vibe coding" && npm install && npm run dev', 'git-cmd')}
          >
            {copiedIndex === 'git-cmd' ? '✓ Copied!' : '📋 Copy Terminal Command'}
          </button>
        </div>
        <div className="quickstart-code-display">
          <code>
            git clone https://github.com/irfan0072/devfest-251-15-857.git &amp;&amp; cd &quot;vibe coding&quot; &amp;&amp; npm install &amp;&amp; npm run dev
          </code>
        </div>
      </div>
    </section>
  );
}
