"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import LLMNode from "./nodes/LLMNode";
import MCPAgentNode from "./nodes/MCPAgentNode";
import Toolbar from "./Toolbar";
import PropertiesPanel from "./PropertiesPanel";
import ExecutionResultsModal from "./ExecutionResultsModal";
import { getLayoutedElements } from "@/utils/layout";

const nodeTypes = {
  llm: LLMNode,
  mcpAgent: MCPAgentNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const initialNodes: Node[] = [
  {
    id: "1",
    type: "llm",
    position: { x: 250, y: 50 },
    data: {
      label: "Script Generator",
      model: "gpt-4o-2024-08-06",
      prompt:
        "Create a 30-second engaging social media script for a {{user:creator_type}} creator. Consider their mission: {{user:mission_statement}}, core interests: {{user:core_interests}}, and brand summary: {{user:ai_brand_summary}}. Make it highly personalized and optimized for {{user:content_type}} content with a {{user:speaking_or_visual}} style.",
      useStructuredOutput: true,
      outputSchema: JSON.stringify(
        {
          type: "object",
          properties: {
            hook: {
              type: "string",
              description: "Attention-grabbing opening line",
            },
            mainContent: {
              type: "string",
              description: "Core message and value proposition",
            },
            callToAction: {
              type: "string",
              description: "Clear next step for viewers",
            },
            hashtags: {
              type: "array",
              items: { type: "string" },
              description: "3-5 relevant hashtags",
            },
          },
          required: ["hook", "mainContent", "callToAction", "hashtags"],
          additionalProperties: false,
        },
        null,
        2
      ),
    },
  },
];

const initialEdges: Edge[] = [];

type ExecutionOutput = {
  content?: string;
  formatted?: string;
  format?: string;
  model?: string;
  tokens?: number;
  userName?: string;
  userId?: string;
};

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [executionResults, setExecutionResults] = useState<
    Record<string, ExecutionOutput>
  >({});
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { fitView } = useReactFlow();

  // Ref to store the absolute latest nodes data for execution
  // This bypasses React's async state updates
  const nodesRef = useRef<Node[]>(initialNodes);

  // Keep ref in sync with nodes state
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Apply layout on initial load
  useEffect(() => {
    const applyInitialLayout = async () => {
      const layouted = await getLayoutedElements(initialNodes, initialEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    };
    applyInitialLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Clicked node:", node);
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onAutoLayout = useCallback(async () => {
    const layouted = await getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
  }, [nodes, edges, setNodes, fitView]);

  const onExport = useCallback(() => {
    const workflow = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;
    const exportFileDefaultName = `workflow-${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  const onImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const workflow = JSON.parse(text);

        if (!workflow.nodes || !workflow.edges) {
          throw new Error("Invalid workflow file: missing nodes or edges");
        }

        // Import nodes and edges
        setNodes(workflow.nodes);
        setEdges(workflow.edges);

        // Apply layout after import
        setTimeout(async () => {
          const layouted = await getLayoutedElements(
            workflow.nodes,
            workflow.edges
          );
          setNodes(layouted.nodes);
          setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
        }, 100);

        alert(
          `✅ Workflow imported successfully!\n\nNodes: ${workflow.nodes.length}\nEdges: ${workflow.edges.length}`
        );
      } catch (error) {
        alert(
          `❌ Import failed: ${
            error instanceof Error ? error.message : "Invalid file"
          }`
        );
      }
    };

    input.click();
  }, [setNodes, setEdges, fitView]);

  const onAddNode = useCallback(
    (type: "llm" | "mcpAgent") => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data:
          type === "llm"
            ? {
                label: "New LLM Node",
                model: "gpt-4o-2024-08-06",
                prompt: "Enter your prompt here",
                useStructuredOutput: false,
                outputSchema: JSON.stringify(
                  {
                    type: "object",
                    properties: {
                      response: { type: "string" },
                    },
                    required: ["response"],
                    additionalProperties: false,
                  },
                  null,
                  2
                ),
              }
            : {
                label: "New MCP Agent",
                model: "claude-sonnet-4-5-20250929",
                prompt: "Enter your agent instructions here",
                mcpServers: [
                  {
                    name: "gmail",
                    transport: "stdio" as const,
                    command: "uvx",
                    args: ["mcp-gsuite"],
                  },
                  {
                    name: "asana",
                    transport: "stdio" as const,
                    command: "npx",
                    args: ["-y", "@roychri/mcp-server-asana"],
                    env: {
                      ASANA_ACCESS_TOKEN: "your-token-here",
                    },
                  },
                ],
                maxIterations: 10,
                maxTokens: 4096,
              },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onExecute = useCallback(async () => {
    setIsExecuting(true);
    setExecutionResults({});

    // Generate unique workflow ID
    const workflowId = `workflow-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Reset all nodes to idle status
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, executionStatus: "idle" as const },
      }))
    );

    // Simple execution: execute nodes in order based on connections
    const results: Record<string, ExecutionOutput> = {};

    // Get the latest nodes from ref (guaranteed to be current)
    const currentNodes = nodesRef.current;

    try {
      for (const node of currentNodes) {
        // Set node to executing
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: { ...n.data, executionStatus: "executing" as const },
                }
              : n
          )
        );

        console.log(`Executing node: ${node.id} (${node.type})`);

        if (node.type === "llm") {
          console.log(`🚀 Executing LLM node ${node.id} with:`, {
            useStructuredOutput: node.data.useStructuredOutput,
            outputSchema: node.data.outputSchema,
          });

          const response = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeId: node.id,
              nodeType: "llm",
              workflowId, // Pass workflow ID for context
              input: {
                prompt: node.data.prompt,
                model: node.data.model,
                useStructuredOutput: node.data.useStructuredOutput || false,
                outputSchema: node.data.outputSchema,
              },
            }),
          });

          if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || "LLM execution failed");
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "LLM execution failed");
          }

          results[node.id] = result.output;

          // Store node output in workflow store
          await fetch("/api/workflow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "setNodeOutput",
              workflowId,
              nodeId: node.id,
              output: result.output,
            }),
          });

          // Mark node as completed
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: { ...n.data, executionStatus: "completed" as const },
                  }
                : n
            )
          );
        } else if (node.type === "mcpAgent") {
          console.log(`🚀 Executing MCP Agent node ${node.id} with:`, {
            model: node.data.model,
            prompt: node.data.prompt,
            mcpServers: node.data.mcpServers,
          });

          const response = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeId: node.id,
              nodeType: "mcpAgent",
              workflowId, // Pass workflow ID for context
              input: {
                prompt: node.data.prompt,
                model: node.data.model,
                mcpServers: node.data.mcpServers,
                maxIterations: node.data.maxIterations || 10,
                maxTokens: node.data.maxTokens || 4096,
              },
            }),
          });

          if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || "MCP Agent execution failed");
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "MCP Agent execution failed");
          }

          results[node.id] = result.output;

          // Store node output in workflow store
          await fetch("/api/workflow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "setNodeOutput",
              workflowId,
              nodeId: node.id,
              output: result.output,
            }),
          });

          // Mark node as completed
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: { ...n.data, executionStatus: "completed" as const },
                  }
                : n
            )
          );
        }
      }

      setExecutionResults(results);
      setShowResultsModal(true);
    } catch (error) {
      console.error("Execution error:", error);

      // Mark current node as error
      setNodes((nds) =>
        nds.map((n) =>
          n.data.executionStatus === "executing"
            ? { ...n, data: { ...n.data, executionStatus: "error" as const } }
            : n
        )
      );

      alert(
        `Execution failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease check console for more details.`
      );
    } finally {
      setIsExecuting(false);
    }
  }, [setNodes]); // nodesRef doesn't need to be in deps

  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      // Update the ref synchronously FIRST - this ensures execution always has latest data
      nodesRef.current = nodesRef.current.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
          console.log(`✅ Updated node ${nodeId} in ref:`, updatedNode.data);
          return updatedNode;
        }
        return node;
      });

      // Then update React state (async)
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
      // Update selected node to reflect changes
      setSelectedNode((current) => {
        if (current?.id === nodeId) {
          return {
            ...current,
            data: {
              ...current.data,
              ...newData,
            },
          };
        }
        return current;
      });
    },
    [setNodes]
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Toolbar
        onAddNode={onAddNode}
        onAutoLayout={onAutoLayout}
        onExecute={onExecute}
        onExport={onExport}
        onImport={onImport}
        isExecuting={isExecuting}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {selectedNode && (
        <PropertiesPanel
          node={selectedNode}
          nodes={nodes}
          edges={edges}
          onUpdateNode={onUpdateNodeData}
          onClose={() => setSelectedNode(null)}
        />
      )}
      <ExecutionResultsModal
        open={showResultsModal}
        onOpenChange={setShowResultsModal}
        results={executionResults}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
}
