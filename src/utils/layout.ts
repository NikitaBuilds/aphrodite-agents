import ELK from "elkjs/lib/elk.bundled.js";
import { Node, Edge } from "@xyflow/react";

const elk = new ELK();

// ELK layout options for a clean hierarchical layout
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
  "elk.layered.nodePlacement.strategy": "SIMPLE",
};

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options = {}
) {
  const graph = {
    id: "root",
    layoutOptions: { ...elkOptions, ...options },
    children: nodes.map((node) => ({
      id: node.id,
      // Approximate node dimensions based on type
      width: 220,
      height: node.type === "llm" ? 140 : 120,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find(
        (n) => n.id === node.id
      );
      return {
        ...node,
        position: {
          x: layoutedNode?.x ?? node.position.x,
          y: layoutedNode?.y ?? node.position.y,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error("Layout error:", error);
    return { nodes, edges };
  }
}
