import { Edge } from "@xyflow/react";

export type WorkflowGroup = {
  id: string;
  nodeIds: string[];
  isConnected: boolean;
  startNodes: string[]; // Nodes with no incoming edges
  endNodes: string[]; // Nodes with no outgoing edges
};

/**
 * Detect independent workflows in a node graph
 * Returns groups of connected nodes (workflows)
 */
export function detectWorkflows(
  nodeIds: string[],
  edges: Edge[]
): WorkflowGroup[] {
  if (nodeIds.length === 0) return [];

  // Build adjacency lists
  const adjacencyMap = new Map<string, Set<string>>();
  const incomingEdges = new Map<string, number>();
  const outgoingEdges = new Map<string, number>();

  // Initialize all nodes
  nodeIds.forEach((id) => {
    adjacencyMap.set(id, new Set());
    incomingEdges.set(id, 0);
    outgoingEdges.set(id, 0);
  });

  // Build the graph
  edges.forEach((edge) => {
    if (adjacencyMap.has(edge.source) && adjacencyMap.has(edge.target)) {
      adjacencyMap.get(edge.source)!.add(edge.target);
      adjacencyMap.get(edge.target)!.add(edge.source);
      incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
      outgoingEdges.set(edge.source, (outgoingEdges.get(edge.source) || 0) + 1);
    }
  });

  // Find connected components using DFS
  const visited = new Set<string>();
  const workflows: WorkflowGroup[] = [];

  function dfs(nodeId: string, component: Set<string>) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    component.add(nodeId);

    const neighbors = adjacencyMap.get(nodeId);
    if (neighbors) {
      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      });
    }
  }

  // Find all connected components
  nodeIds.forEach((nodeId) => {
    if (!visited.has(nodeId)) {
      const component = new Set<string>();
      dfs(nodeId, component);

      const componentNodes = Array.from(component);
      const isConnected = componentNodes.length > 1;

      // Find start nodes (no incoming edges within this workflow)
      const startNodes = componentNodes.filter(
        (id) => (incomingEdges.get(id) || 0) === 0
      );

      // Find end nodes (no outgoing edges within this workflow)
      const endNodes = componentNodes.filter(
        (id) => (outgoingEdges.get(id) || 0) === 0
      );

      workflows.push({
        id: `workflow-${workflows.length + 1}`,
        nodeIds: componentNodes,
        isConnected,
        startNodes: startNodes.length > 0 ? startNodes : componentNodes,
        endNodes: endNodes.length > 0 ? endNodes : componentNodes,
      });
    }
  });

  // Sort workflows by their first node ID
  workflows.sort((a, b) => {
    const aFirst = a.nodeIds[0];
    const bFirst = b.nodeIds[0];
    return aFirst.localeCompare(bFirst);
  });

  return workflows;
}

/**
 * Get a human-readable name for a workflow
 */
export function getWorkflowDisplayName(
  workflow: WorkflowGroup,
  index: number
): string {
  if (workflow.nodeIds.length === 1) {
    return `Node ${workflow.nodeIds[0]}`;
  }

  if (workflow.isConnected) {
    return `Workflow ${index + 1} (${workflow.nodeIds.length} nodes)`;
  }

  return `Independent Nodes (${workflow.nodeIds.length})`;
}
