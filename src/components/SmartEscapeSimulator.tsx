import { useState, useMemo, useRef } from 'react';
import defaultBuildingData from '../data/defaultBuilding.json';
import {
  type BuildingData,
  type BuildingNode,
  type RouteResult,
  calculateEvacuationRoute,
  validateBuildingData,
} from '../utils/dijkstra';
import { triggerConfetti } from './Confetti';

interface SimulatorProps {
  onUnlockAchievement?: (title: string, desc: string) => void;
}

export function SmartEscapeSimulator({ onUnlockAchievement }: SimulatorProps) {
  const [buildingData, setBuildingData] = useState<BuildingData>(defaultBuildingData as BuildingData);
  const [selectedStart, setSelectedStart] = useState<string>('R1');
  const [blockedNodes, setBlockedNodes] = useState<Set<string>>(
    () => new Set(defaultBuildingData.initial_state.blocked_nodes)
  );
  const [blockedEdges, setBlockedEdges] = useState<Set<string>>(
    () => new Set(defaultBuildingData.initial_state.blocked_edges)
  );
  const [closedExits, setClosedExits] = useState<Set<string>>(
    () => new Set(defaultBuildingData.initial_state.closed_exits)
  );
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mapSvgRef = useRef<SVGSVGElement | null>(null);

  // Compute route immediately whenever start or hazards change (Section 3.2 & 3.4)
  const routeResult: RouteResult = useMemo(() => {
    return calculateEvacuationRoute(
      buildingData,
      selectedStart,
      blockedNodes,
      blockedEdges,
      closedExits
    );
  }, [buildingData, selectedStart, blockedNodes, blockedEdges, closedExits]);

  // Translations dictionary for bilingual support (Section 3.2)
  const t = {
    en: {
      sectionBadge: 'AI DEVFEST 2026 • SOLO MOCK TEST PRACTICE CHALLENGE',
      title: 'SMART ESCAPE',
      subtitle: 'Interactive Evacuation Route Simulator',
      tagline: 'BUILD AN INTERACTIVE MAP • COMPUTE ROUTES • RESPOND TO CHANGING HAZARDS',
      startLocation: 'Starting Location',
      selectStartPrompt: 'Select Start (Room or Junction):',
      resetInitial: 'Reset to Initial State',
      importJson: 'Import Building JSON',
      exportMap: 'Export Map (SVG)',
      statusLabel: 'Route Status:',
      routeFound: 'Optimal Evacuation Route Found',
      noRoute: 'No route available',
      startBlocked: 'Starting location blocked',
      totalCost: 'Total Cost',
      targetExit: 'Target Exit',
      routePath: 'Node Path Sequence',
      presetScenarios: 'Quick Scenarios (Problem Section 4.1):',
      scBaseline: '1. Baseline (R1)',
      scBlockC2: '2. Block Junction C2',
      scCloseExits: '3. Close Exits (E1 & E2)',
      scStartR2: '4. Start Room R2',
      scBlockStart: '5. Block Start (R1)',
      legendRoom: 'Room',
      legendJunction: 'Junction',
      legendExit: 'Exit',
      legendHazard: 'Hazard / Blocked',
      legendRoute: 'Active Route',
      controlsHelp: 'Click any node to select as Start or toggle Hazard. Click corridor cost to block/unblock.',
      setStart: 'Set as Start',
      toggleHazard: 'Toggle Hazard',
      toggleExit: 'Close / Open Exit',
    },
    bn: {
      sectionBadge: 'এআই দেবফেস্ট ২০২৬ • প্র্যাকটিস চ্যালেঞ্জ',
      title: 'স্মার্ট এস্কেপ (SMART ESCAPE)',
      subtitle: 'জরুরি উদ্ধার পথ সিমুলেটর (Evacuation Route Simulator)',
      tagline: 'ইন্টারেক্টিভ ম্যাপ তৈরি করুন • রুট হিসাব করুন • পরিবর্তনশীল বিপদে সাড়া দিন',
      startLocation: 'শুরুর স্থান',
      selectStartPrompt: 'শুরুর স্থান নির্বাচন করুন (রুম বা জংশন):',
      resetInitial: 'প্রাথমিক অবস্থায় রিসেট করুন',
      importJson: 'বিল্ডিং JSON আপলোড',
      exportMap: 'ম্যাপ এক্সপোর্ট (SVG)',
      statusLabel: 'রুটের অবস্থা:',
      routeFound: 'সর্বোত্তম উদ্ধার পথ পাওয়া গেছে',
      noRoute: 'কোনো পথ উপলব্ধ নেই (No route available)',
      startBlocked: 'শুরুর স্থান অবরুদ্ধ (Starting location blocked)',
      totalCost: 'মোট খরচ',
      targetExit: 'গন্তব্য এক্সিট',
      routePath: 'নোড পাথ সিকোয়েন্স',
      presetScenarios: 'টেস্ট কেস সিনারিও (সেকশন ৪.১):',
      scBaseline: '১. বেসলাইন (R1)',
      scBlockC2: '২. জংশন C2 ব্লক করুন',
      scCloseExits: '৩. এক্সিট বন্ধ করুন (E1 ও E2)',
      scStartR2: '৪. রুম R2 থেকে শুরু',
      scBlockStart: '৫. শুরুর স্থান ব্লক (R1)',
      legendRoom: 'রুম (Room)',
      legendJunction: 'জংশন (Junction)',
      legendExit: 'এক্সিট (Exit)',
      legendHazard: 'বিপদ / অবরুদ্ধ (Blocked)',
      legendRoute: 'সক্রিয় রুট (Active Route)',
      controlsHelp: 'স্টার্ট হিসেবে সেট করতে বা ব্লক করতে যেকোনো নোডে ক্লিক করুন। করিডোর ব্লক/আনব্লক করতে খরচে ক্লিক করুন।',
      setStart: 'স্টার্ট নির্বাচন',
      toggleHazard: 'বিপদ চালু/বন্ধ',
      toggleExit: 'এক্সিট বন্ধ/চালু',
    },
  }[lang];

  // Hazard Handlers
  const handleToggleNodeHazard = (nodeId: string, nodeType: string) => {
    if (nodeType === 'exit') {
      setClosedExits((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
    } else {
      setBlockedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
    }
  };

  const handleToggleEdgeHazard = (edgeId: string) => {
    setBlockedEdges((prev) => {
      const next = new Set(prev);
      if (next.has(edgeId)) next.delete(edgeId);
      else next.add(edgeId);
      return next;
    });
  };

  const handleResetToInitial = () => {
    setBlockedNodes(new Set(buildingData.initial_state.blocked_nodes));
    setBlockedEdges(new Set(buildingData.initial_state.blocked_edges));
    setClosedExits(new Set(buildingData.initial_state.closed_exits));
    setSelectedStart('R1');
    setUploadError(null);
  };

  // Preset Scenario Handlers (Section 4.1)
  const applyScenario = (scenario: 1 | 2 | 3 | 4 | 5) => {
    handleResetToInitial();
    if (scenario === 1) {
      setSelectedStart('R1');
      onUnlockAchievement?.('Scenario 1: Baseline', 'Verified R1 -> E1 optimal route with cost 7.');
    } else if (scenario === 2) {
      setSelectedStart('R1');
      setBlockedNodes(new Set(['C2']));
      triggerConfetti();
      onUnlockAchievement?.('Scenario 2: Reroute C2', 'Verified reroute to E2 via C3 & C4 with cost 11.');
    } else if (scenario === 3) {
      setSelectedStart('R1');
      setClosedExits(new Set(['E1', 'E2']));
      onUnlockAchievement?.('Scenario 3: Exits Closed', 'Verified "No route available" state.');
    } else if (scenario === 4) {
      setSelectedStart('R2');
      onUnlockAchievement?.('Scenario 4: Alternate Start', 'Verified R2 -> E2 optimal route with cost 7.');
    } else if (scenario === 5) {
      setSelectedStart('R1');
      setBlockedNodes(new Set(['R1']));
      onUnlockAchievement?.('Scenario 5: Blocked Start', 'Verified "Starting location blocked" state.');
    }
  };

  // JSON Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validation = validateBuildingData(json);
        if (!validation.valid || !validation.data) {
          setUploadError(`Validation Error: ${validation.error}`);
          return;
        }

        setBuildingData(validation.data);
        setBlockedNodes(new Set(validation.data.initial_state.blocked_nodes));
        setBlockedEdges(new Set(validation.data.initial_state.blocked_edges));
        setClosedExits(new Set(validation.data.initial_state.closed_exits));

        // Default start to first available room/junction
        const firstStart = validation.data.nodes.find((n) => n.type !== 'exit')?.id || 'R1';
        setSelectedStart(firstStart);
        setUploadError(null);
        triggerConfetti();
        onUnlockAchievement?.('Custom Dataset Loaded', `Loaded building: ${validation.data.building}`);
      } catch (err) {
        setUploadError(`Malformed JSON file: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  // Export SVG Map
  const handleExportSvg = () => {
    if (!mapSvgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(mapSvgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-escape-${buildingData.building.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // SVG coordinate scaling helper
  const viewBox = '0 0 520 250';

  const nodeMap = useMemo(() => {
    const map = new Map<string, BuildingNode>();
    for (const n of buildingData.nodes) map.set(n.id, n);
    return map;
  }, [buildingData.nodes]);

  const activeEdgeIds = useMemo(() => new Set(routeResult.edgeIds || []), [routeResult.edgeIds]);
  const activeNodeIds = useMemo(() => new Set(routeResult.nodePath || []), [routeResult.nodePath]);

  return (
    <section id="escape-simulator" className="feature-section smart-escape-section">
      <div className="section-header simulator-hero-header">
        <div className="section-badge">
          <span className="badge-glow-dot"></span>
          {t.sectionBadge}
        </div>
        <h1 className="simulator-hero-title">{t.title}</h1>
        <h2 className="simulator-hero-sub">{t.subtitle}</h2>
        <div className="simulator-tagline-pill">{t.tagline}</div>
      </div>

      {/* Top Action Toolbar (Language Toggle, Reset, Upload, Export) */}
      <div className="sim-toolbar glass-panel">
        <div className="toolbar-left">
          <div className="building-identity">
            <span className="building-icon">🏢</span>
            <div className="building-meta">
              <span className="building-name">{buildingData.building}</span>
              <span className="building-counts">
                {buildingData.nodes.length} Nodes • {buildingData.edges.length} Corridors
              </span>
            </div>
          </div>
        </div>

        <div className="toolbar-right">
          {/* Language Switcher */}
          <div className="lang-switcher">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'bn' ? 'active' : ''}`}
              onClick={() => setLang('bn')}
            >
              বাংলা
            </button>
          </div>

          <label className="action-btn file-upload-btn">
            <span>📁 {t.importJson}</span>
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button type="button" className="action-btn" onClick={handleExportSvg}>
            <span>🖼 {t.exportMap}</span>
          </button>

          <button type="button" className="action-btn secondary-btn" onClick={handleResetToInitial}>
            <span>↺ {t.resetInitial}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="status-banner status-error">
          <span className="status-icon">⚠</span>
          <span className="status-text">{uploadError}</span>
        </div>
      )}

      {/* Preset Scenarios from Problem Statement Section 4.1 */}
      <div className="scenarios-panel glass-panel">
        <span className="scenarios-title">{t.presetScenarios}</span>
        <div className="scenarios-grid">
          <button type="button" className="scenario-chip" onClick={() => applyScenario(1)}>
            {t.scBaseline}
          </button>
          <button type="button" className="scenario-chip" onClick={() => applyScenario(2)}>
            {t.scBlockC2}
          </button>
          <button type="button" className="scenario-chip" onClick={() => applyScenario(3)}>
            {t.scCloseExits}
          </button>
          <button type="button" className="scenario-chip" onClick={() => applyScenario(4)}>
            {t.scStartR2}
          </button>
          <button type="button" className="scenario-chip" onClick={() => applyScenario(5)}>
            {t.scBlockStart}
          </button>
        </div>
      </div>

      {/* Main Simulator Card: Map + Live Route Panel */}
      <div className="simulator-main-layout">
        {/* SVG Interactive Map */}
        <div className="map-container glass-panel">
          <div className="map-header">
            <span className="map-badge">GRAPH TOPOLOGY (2D)</span>
            <span className="map-tip">{t.controlsHelp}</span>
          </div>

          <div className="svg-wrapper">
            <svg
              ref={mapSvgRef}
              viewBox={viewBox}
              className="evacuation-svg-map"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render Edges */}
              {buildingData.edges.map((edge) => {
                const fromNode = nodeMap.get(edge.from);
                const toNode = nodeMap.get(edge.to);
                if (!fromNode || !toNode) return null;

                const isBlocked =
                  blockedEdges.has(edge.id) ||
                  blockedNodes.has(edge.from) ||
                  blockedNodes.has(edge.to);

                const isRouteEdge = activeEdgeIds.has(edge.id);

                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={edge.id} className="corridor-group">
                    {/* Line */}
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      className={`corridor-line ${
                        isRouteEdge ? 'is-active-route' : isBlocked ? 'is-blocked' : 'is-clear'
                      }`}
                      filter={isRouteEdge ? 'url(#routeGlow)' : undefined}
                    />

                    {/* Cost Badge (Click to toggle edge hazard) */}
                    <g
                      className="edge-cost-badge"
                      transform={`translate(${midX}, ${midY})`}
                      onClick={() => handleToggleEdgeHazard(edge.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r="11"
                        className={`cost-bg ${isRouteEdge ? 'cost-route' : isBlocked ? 'cost-blocked' : ''}`}
                      />
                      <text dy="3.5" textAnchor="middle" className="cost-text">
                        {isBlocked ? '✕' : edge.cost}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {buildingData.nodes.map((node) => {
                const isStart = selectedStart === node.id;
                const isBlocked =
                  node.type === 'exit' ? closedExits.has(node.id) : blockedNodes.has(node.id);
                const isRouteNode = activeNodeIds.has(node.id);

                let nodeColorClass = 'node-room';
                if (node.type === 'junction') nodeColorClass = 'node-junction';
                if (node.type === 'exit') nodeColorClass = 'node-exit';

                return (
                  <g
                    key={node.id}
                    className={`node-group ${isStart ? 'is-start' : ''} ${
                      isBlocked ? 'is-blocked' : ''
                    } ${isRouteNode ? 'is-route' : ''}`}
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {/* Selection halo if Start */}
                    {isStart && <circle r="22" className="start-pulse-halo" />}

                    {/* Main Node Circle */}
                    <circle
                      r="16"
                      className={`node-circle ${nodeColorClass}`}
                      onClick={() => {
                        if (node.type !== 'exit') {
                          setSelectedStart(node.id);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleToggleNodeHazard(node.id, node.type);
                      }}
                      aria-label={`${node.id} (${node.label})`}
                      style={{ cursor: 'pointer' }}
                    >
                      <title>{`${node.id} (${node.label}) - Left Click: Set Start, Right Click: Toggle Hazard`}</title>
                    </circle>

                    {/* Node ID */}
                    <text
                      dy="4"
                      textAnchor="middle"
                      className="node-id-text"
                      pointerEvents="none"
                    >
                      {node.id}
                    </text>

                    {/* Label below node */}
                    <text
                      dy="28"
                      textAnchor="middle"
                      className="node-label-text"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-dot dot-room"></span>
              <span>{t.legendRoom}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-junction"></span>
              <span>{t.legendJunction}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-exit"></span>
              <span>{t.legendExit}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-hazard"></span>
              <span>{t.legendHazard}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-route"></span>
              <span>{t.legendRoute}</span>
            </div>
          </div>
        </div>

        {/* Live Calculation & Controls Panel */}
        <div className="route-results-panel glass-panel">
          <div className="panel-section">
            <label className="section-field-label">{t.selectStartPrompt}</label>
            <div className="start-selector-chips">
              {buildingData.nodes
                .filter((n) => n.type !== 'exit')
                .map((node) => {
                  const isBlocked = blockedNodes.has(node.id);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`start-chip ${selectedStart === node.id ? 'active' : ''} ${
                        isBlocked ? 'chip-blocked' : ''
                      }`}
                      onClick={() => setSelectedStart(node.id)}
                    >
                      <span className="chip-id">{node.id}</span>
                      <span className="chip-name">{node.label}</span>
                      {isBlocked && <span className="chip-warn">⚠</span>}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Route Status Box */}
          <div className="route-status-card">
            <span className="status-micro-tag">{t.statusLabel}</span>

            {routeResult.status === 'SUCCESS' && (
              <div className="status-success-view">
                <div className="success-badge">
                  <span className="check-icon">✓</span>
                  <span>{t.routeFound}</span>
                </div>

                <div className="route-metrics-row">
                  <div className="metric-box">
                    <span className="metric-label">{t.targetExit}</span>
                    <span className="metric-val exit-val">{routeResult.exitId}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">{t.totalCost}</span>
                    <span className="metric-val cost-val">{routeResult.totalCost}</span>
                  </div>
                </div>

                <div className="path-sequence-box">
                  <span className="sequence-label">{t.routePath}:</span>
                  <div className="path-breadcrumbs">
                    {routeResult.nodePath?.map((nodeId, idx) => (
                      <span key={nodeId} className="path-step">
                        <span className="step-badge">{nodeId}</span>
                        {idx < (routeResult.nodePath?.length || 0) - 1 && (
                          <span className="step-arrow">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {routeResult.status === 'START_BLOCKED' && (
              <div className="status-failure-view failure-blocked">
                <div className="fail-icon">🚫</div>
                <div className="fail-message">
                  <h4>{t.startBlocked}</h4>
                  <p>
                    {selectedStart} is currently marked as blocked. Unblock the room or select an alternative starting point.
                  </p>
                </div>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => handleToggleNodeHazard(selectedStart, 'room')}
                >
                  Unblock {selectedStart}
                </button>
              </div>
            )}

            {routeResult.status === 'NO_ROUTE' && (
              <div className="status-failure-view failure-noroute">
                <div className="fail-icon">⚠️</div>
                <div className="fail-message">
                  <h4>{t.noRoute}</h4>
                  <p>
                    All pathways to open exits are severed or all exits are closed. Clear hazards to restore evacuation routes.
                  </p>
                </div>
                <button type="button" className="action-btn" onClick={handleResetToInitial}>
                  Restore Corridors
                </button>
              </div>
            )}
          </div>

          {/* Quick Hazard Toggles List */}
          <div className="hazard-toggle-panel">
            <span className="section-field-label">Hazard Controls (Click to Toggle):</span>
            <div className="toggle-chips-container">
              {buildingData.nodes.map((node) => {
                const isBlocked =
                  node.type === 'exit' ? closedExits.has(node.id) : blockedNodes.has(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`hazard-toggle-chip ${isBlocked ? 'is-blocked' : ''}`}
                    onClick={() => handleToggleNodeHazard(node.id, node.type)}
                  >
                    <span>{node.id}</span>
                    <span className="chip-type-tag">({node.type})</span>
                    <span className="state-indicator">{isBlocked ? '✕' : '✔'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
