# DevFest 2026 — Smart Escape & Interactive Showcase

[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg?style=flat-square&logo=vite)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19.2-blue.svg?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Oxlint](https://img.shields.io/badge/Oxlint-1.81-orange.svg?style=flat-square)](https://oxc.rs)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

An interactive, high-performance web experience crafted for **DevFest 2026**. Features real-time physics particle systems, cyber puzzle escape room mechanics, a live audio-visual vibe synthesizer, and instant system telemetry diagnostics.

---

## ✨ Features

- **🌐 Interactive Particle Grid**: Responsive HTML5 canvas mesh with proximity line connections and mouse repulsion physics.
- **⚡ Supercharged Hero**: 3D floating badge levitation, quantum cycle counter with streak badges, dynamic milestone progression, and celebratory confetti bursts.
- **🔐 The Smart Escape Matrix**: Multi-stage cyber security challenge:
  - *Stage 1*: Binary cipher decryption.
  - *Stage 2*: Resonance harmonic frequency calibration.
  - *Stage 3*: Master terminal override command execution.
- **🎵 Vibe Lab Synthesizer**: Generative SVG waveform animator with real-time Web Audio API tone synthesis, chromatic spectrum sliders, and custom presets (Cyberpunk Synth, Solar Aurora, Deep Pulse, Zenith Flow).
- **📊 Real-Time Engine Telemetry**: Live FPS sparkline chart, event loop latency meter, CPU thread utilization dial, and an interactive benchmark stress-test engine.
- **🎨 Modern Glassmorphic Design System**:
  - Full Dark/Light theme switching with persistent storage.
  - Ambient floating gradient orbs with keyframe motion.
  - Accessible focus outlines and `prefers-reduced-motion` compliance.
  - Toast notification engine for instant achievement alerts.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/irfan0072/devfest-251-15-857.git

# Enter the project directory
cd "vibe coding"

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🛠️ Build & Scripts

| Script | Command | Purpose |
|---|---|---|
| Development | `npm run dev` | Starts Vite dev server with sub-millisecond HMR |
| Production Build | `npm run build` | Compiles TypeScript and packages optimized bundle |
| Preview Build | `npm run preview` | Serves the production build locally |
| Oxlint | `npm run lint` | High-speed Rust-based code quality verification |

---

## 📂 Project Architecture

```
src/
├── assets/                  # SVG logos and hero graphics
├── components/
│   ├── Confetti.ts          # Zero-dependency canvas confetti burst engine
│   ├── Ecosystem.tsx        # Tech stack architecture & rapid onboarding cards
│   ├── EscapeChallenge.tsx  # Multi-stage Cyber Escape Matrix puzzle
│   ├── Navbar.tsx           # Sticky glassmorphic navigation & theme switch
│   ├── ParticleCanvas.tsx   # Interactive physics-based particle canvas
│   ├── Telemetry.tsx        # Real-time SVG charts & stress benchmark
│   ├── Toast.tsx            # Floating achievement notification system
│   └── VibeLab.tsx          # Real-time audio/visual waveform synthesizer
├── App.css                  # Responsive design, animations, & glassmorphic tokens
├── App.tsx                  # Root state orchestration & milestone engine
├── index.css                # CSS variables, color tokens & ambient background
└── main.tsx                 # React 19 entrypoint
```

---

## 📄 License

Distributed under the MIT License. Built with passion for DevFest 2026.
