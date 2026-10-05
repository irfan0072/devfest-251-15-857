export interface BuildingNode {
  id: string;
  label: string;
  type: 'room' | 'junction' | 'exit';
  x: number;
  y: number;
}

export interface BuildingEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export interface InitialState {
  blocked_nodes: string[];
  blocked_edges: string[];
  closed_exits: string[];
}

export interface BuildingData {
  building: string;
  nodes: BuildingNode[];
  edges: BuildingEdge[];
  initial_state: InitialState;
}

export interface RouteResult {
  status: 'SUCCESS' | 'START_BLOCKED' | 'NO_ROUTE';
  exitId?: string;
  totalCost?: number;
  nodePath?: string[];
  edgeIds?: string[];
}

/**
 * Validates a building JSON object against Section 3.1 requirements.
 */
export function validateBuildingData(data: unknown): { valid: boolean; error?: string; data?: BuildingData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON: Expected a root object' };
  }

  const d = data as Record<string, unknown>;

  if (typeof d.building !== 'string' || !d.building.trim()) {
    return { valid: false, error: 'Missing or empty building name' };
  }

  if (!Array.isArray(d.nodes) || d.nodes.length < 2 || d.nodes.length > 60) {
    return { valid: false, error: 'Nodes must be an array of 2 to 60 elements' };
  }

  if (!Array.isArray(d.edges) || d.edges.length < 1 || d.edges.length > 150) {
    return { valid: false, error: 'Edges must be an array of 1 to 150 elements' };
  }

  const nodeMap = new Map<string, BuildingNode>();
  let hasRoomOrJunction = false;
  let hasExit = false;

  for (const n of d.nodes) {
    if (!n || typeof n !== 'object') return { valid: false, error: 'Malformed node entry' };
    const node = n as BuildingNode;
    if (typeof node.id !== 'string' || !node.id.trim()) return { valid: false, error: 'Node missing valid id' };
    if (nodeMap.has(node.id)) return { valid: false, error: `Duplicate node ID: ${node.id}` };
    if (!['room', 'junction', 'exit'].includes(node.type)) {
      return { valid: false, error: `Invalid node type for ${node.id}: ${node.type}` };
    }
    if (typeof node.x !== 'number' || typeof node.y !== 'number') {
      return { valid: false, error: `Node ${node.id} missing numeric coordinates x, y` };
    }

    if (node.type === 'room' || node.type === 'junction') hasRoomOrJunction = true;
    if (node.type === 'exit') hasExit = true;
    nodeMap.set(node.id, node);
  }

  if (!hasRoomOrJunction) return { valid: false, error: 'At least one room or junction is required' };
  if (!hasExit) return { valid: false, error: 'At least one exit is required' };

  const edgeMap = new Map<string, BuildingEdge>();
  const seenPairs = new Set<string>();

  for (const e of d.edges) {
    if (!e || typeof e !== 'object') return { valid: false, error: 'Malformed edge entry' };
    const edge = e as BuildingEdge;
    if (typeof edge.id !== 'string' || !edge.id.trim()) return { valid: false, error: 'Edge missing valid id' };
    if (edgeMap.has(edge.id)) return { valid: false, error: `Duplicate edge ID: ${edge.id}` };
    if (!nodeMap.has(edge.from) || !nodeMap.has(edge.to)) {
      return { valid: false, error: `Edge ${edge.id} references non-existent node: ${edge.from} -> ${edge.to}` };
    }
    if (edge.from === edge.to) {
      return { valid: false, error: `Self-loops are forbidden: Edge ${edge.id}` };
    }
    if (typeof edge.cost !== 'number' || edge.cost <= 0 || !Number.isInteger(edge.cost)) {
      return { valid: false, error: `Edge ${edge.id} cost must be a positive integer` };
    }

    const pairKey = [edge.from, edge.to].sort().join(':::');
    if (seenPairs.has(pairKey)) {
      return { valid: false, error: `Repeated edge pair forbidden: ${edge.from} - ${edge.to}` };
    }
    seenPairs.add(pairKey);
    edgeMap.set(edge.id, edge);
  }

  const initialState = d.initial_state as InitialState | undefined;
  const blockedNodes = Array.isArray(initialState?.blocked_nodes) ? initialState!.blocked_nodes : [];
  const blockedEdges = Array.isArray(initialState?.blocked_edges) ? initialState!.blocked_edges : [];
  const closedExits = Array.isArray(initialState?.closed_exits) ? initialState!.closed_exits : [];

  for (const bn of blockedNodes) {
    const n = nodeMap.get(bn);
    if (!n || n.type === 'exit') {
      return { valid: false, error: `Blocked node ${bn} must exist and be a room or junction` };
    }
  }

  for (const ce of closedExits) {
    const n = nodeMap.get(ce);
    if (!n || n.type !== 'exit') {
      return { valid: false, error: `Closed exit ${ce} must exist and be of type exit` };
    }
  }

  for (const be of blockedEdges) {
    if (!edgeMap.has(be)) {
      return { valid: false, error: `Blocked edge ${be} does not exist in edges` };
    }
  }

  return {
    valid: true,
    data: {
      building: d.building as string,
      nodes: d.nodes as BuildingNode[],
      edges: d.edges as BuildingEdge[],
      initial_state: {
        blocked_nodes: blockedNodes,
        blocked_edges: blockedEdges,
        closed_exits: closedExits,
      },
    },
  };
}

/**
 * Computes lowest-cost evacuation route following Section 3.3.
 */
export function calculateEvacuationRoute(
  building: BuildingData,
  startNodeId: string,
  blockedNodes: Set<string>,
  blockedEdges: Set<string>,
  closedExits: Set<string>
): RouteResult {
  // If start node is blocked
  if (blockedNodes.has(startNodeId)) {
    return { status: 'START_BLOCKED' };
  }

  const startNode = building.nodes.find((n) => n.id === startNodeId);
  if (!startNode || startNode.type === 'exit') {
    return { status: 'NO_ROUTE' };
  }

  // Build adjacency list excluding blocked elements
  interface Neighbor {
    nodeId: string;
    edgeId: string;
    cost: number;
  }

  const adj = new Map<string, Neighbor[]>();
  for (const n of building.nodes) {
    adj.set(n.id, []);
  }

  for (const edge of building.edges) {
    if (blockedEdges.has(edge.id)) continue;
    if (blockedNodes.has(edge.from) || blockedNodes.has(edge.to)) continue;

    adj.get(edge.from)?.push({ nodeId: edge.to, edgeId: edge.id, cost: edge.cost });
    adj.get(edge.to)?.push({ nodeId: edge.from, edgeId: edge.id, cost: edge.cost });
  }

  // Open exits
  const openExits = new Set(
    building.nodes
      .filter((n) => n.type === 'exit' && !closedExits.has(n.id))
      .map((n) => n.id)
  );

  if (openExits.size === 0) {
    return { status: 'NO_ROUTE' };
  }

  // Modified Dijkstra storing optimal distance and path
  interface PathInfo {
    cost: number;
    path: string[];
    edges: string[];
  }

  const best = new Map<string, PathInfo>();
  best.set(startNodeId, { cost: 0, path: [startNodeId], edges: [] });

  // Priority Queue / Min-Heap using array sorted by cost & tie-break
  interface QueueItem {
    nodeId: string;
    cost: number;
    path: string[];
    edges: string[];
  }

  const pq: QueueItem[] = [{ nodeId: startNodeId, cost: 0, path: [startNodeId], edges: [] }];

  // Helper to compare paths lexicographically
  const comparePathLexicographically = (a: string[], b: string[]): number => {
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return a.length - b.length;
  };

  while (pq.length > 0) {
    // Sort to extract minimum cost; on equal cost, smallest sequence of node IDs
    pq.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return comparePathLexicographically(a.path, b.path);
    });

    const current = pq.shift()!;

    // If current path is worse than known best, skip
    const currentBest = best.get(current.nodeId);
    if (
      currentBest &&
      (current.cost > currentBest.cost ||
        (current.cost === currentBest.cost && comparePathLexicographically(current.path, currentBest.path) > 0))
    ) {
      continue;
    }

    // If node is an open exit, do NOT explore further from it (exits are terminal destinations)
    if (openExits.has(current.nodeId)) {
      continue;
    }

    // Closed exits cannot be intermediate nodes (Section 3.3)
    if (closedExits.has(current.nodeId)) {
      continue;
    }

    const neighbors = adj.get(current.nodeId) || [];
    for (const neighbor of neighbors) {
      // Cannot traverse through closed exits
      if (closedExits.has(neighbor.nodeId)) continue;
      // Cannot revisit node in the same simple path
      if (current.path.includes(neighbor.nodeId)) continue;

      const nextCost = current.cost + neighbor.cost;
      const nextPath = [...current.path, neighbor.nodeId];
      const nextEdges = [...current.edges, neighbor.edgeId];

      const existingBest = best.get(neighbor.nodeId);
      const isBetter =
        !existingBest ||
        nextCost < existingBest.cost ||
        (nextCost === existingBest.cost && comparePathLexicographically(nextPath, existingBest.path) < 0);

      if (isBetter) {
        best.set(neighbor.nodeId, { cost: nextCost, path: nextPath, edges: nextEdges });
        pq.push({ nodeId: neighbor.nodeId, cost: nextCost, path: nextPath, edges: nextEdges });
      }
    }
  }

  // Find reachable open exits
  interface ExitCandidate {
    exitId: string;
    cost: number;
    path: string[];
    edges: string[];
  }

  const candidates: ExitCandidate[] = [];

  for (const exitId of openExits) {
    const result = best.get(exitId);
    if (result) {
      candidates.push({
        exitId,
        cost: result.cost,
        path: result.path,
        edges: result.edges,
      });
    }
  }

  if (candidates.length === 0) {
    return { status: 'NO_ROUTE' };
  }

  // Sort candidates by:
  // 1. Minimum cost
  // 2. Lexicographically smallest exit ID
  // 3. Lexicographically smallest sequence of node IDs
  candidates.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    if (a.exitId !== b.exitId) return a.exitId.localeCompare(b.exitId);
    return comparePathLexicographically(a.path, b.path);
  });

  const winner = candidates[0];

  return {
    status: 'SUCCESS',
    exitId: winner.exitId,
    totalCost: winner.cost,
    nodePath: winner.path,
    edgeIds: winner.edges,
  };
}
