"use client";

import { useState, useMemo } from "react";
import { Node, Edge } from "@xyflow/react";
import { getModelLogo } from "@/lib/model-logos";
import Image from "next/image";

type NodeOutputPickerProps = {
  nodes: Node[];
  edges: Edge[];
  currentNodeId: string;
  onInsert: (template: string) => void;
};

export default function NodeOutputPicker({
  nodes,
  edges,
  currentNodeId,
  onInsert,
}: NodeOutputPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Find all nodes that are ancestors of the current node (connected via edges)
  const availableNodes = useMemo(() => {
    const ancestors = new Set<string>();

    // BFS to find all nodes that can reach the current node
    function findAncestors(nodeId: string) {
      edges.forEach((edge) => {
        if (edge.target === nodeId && !ancestors.has(edge.source)) {
          ancestors.add(edge.source);
          findAncestors(edge.source); // Recursively find ancestors of ancestors
        }
      });
    }

    findAncestors(currentNodeId);

    // Return nodes that are ancestors
    return nodes.filter((n) => ancestors.has(n.id));
  }, [nodes, edges, currentNodeId]);

  const getNodeIcon = (type: string, model?: string) => {
    if (type === "llm" && model) {
      return (
        <Image
          src={getModelLogo(model)}
          alt={`${model} logo`}
          width={18}
          height={18}
          className="w-[18px] h-[18px]"
        />
      );
    }
    if (type === "llm") return "🤖";
    if (type === "supabase") return "📊";
    return "📦";
  };

  const getStructuredFields = (node: Node) => {
    if (
      node.type === "llm" &&
      node.data.useStructuredOutput &&
      node.data.outputSchema
    ) {
      try {
        const schema = JSON.parse(node.data.outputSchema);
        if (schema.properties) {
          return Object.keys(schema.properties);
        }
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleInsert = (nodeId: string, field?: string) => {
    const template = field
      ? `{{node:${nodeId}.${field}}}`
      : `{{node:${nodeId}}}`;
    onInsert(template);
    setIsOpen(false);
    setSelectedNode(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "8px 12px",
          background: "#8b5cf6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "500",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#7c3aed")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#8b5cf6")}
      >
        <span>+</span> Insert Previous Output
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={() => {
        setIsOpen(false);
        setSelectedNode(null);
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          width: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              Select Node Output
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedNode(null);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          {availableNodes.length === 0 && (
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              🔗 No connected nodes found. Connect other nodes to this one to
              use their outputs.
            </p>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {!selectedNode ? (
            // Node List
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {availableNodes.map((node) => {
                const structuredFields = getStructuredFields(node);
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      padding: "16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#8b5cf6";
                      e.currentTarget.style.background = "#f9fafb";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>
                            {getNodeIcon(node.type || "", node.data?.model)}
                          </span>
                          <span style={{ fontWeight: "600", fontSize: "14px" }}>
                            {node.data.label || node.id}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          ID:{" "}
                          <code
                            style={{
                              background: "#f3f4f6",
                              padding: "2px 6px",
                              borderRadius: "3px",
                            }}
                          >
                            {node.id}
                          </code>
                        </div>
                        {structuredFields.length > 0 && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#8b5cf6",
                              marginTop: "4px",
                            }}
                          >
                            {structuredFields.length} structured field
                            {structuredFields.length !== 1 ? "s" : ""} available
                          </div>
                        )}
                      </div>
                      <div style={{ color: "#8b5cf6", fontSize: "20px" }}>
                        →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Field Selection
            <div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8b5cf6",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "8px 0",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ← Back to nodes
              </button>

              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "18px" }}>
                    {getNodeIcon(
                      selectedNode.type || "",
                      selectedNode.data?.model
                    )}
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    {selectedNode.data.label || selectedNode.id}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  ID:{" "}
                  <code
                    style={{
                      background: "white",
                      padding: "2px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    {selectedNode.id}
                  </code>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {/* Full Output Option */}
                <div
                  onClick={() => handleInsert(selectedNode.id)}
                  style={{
                    padding: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.background = "#f0fdf4";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    📦 Full Output
                  </div>
                  <code
                    style={{
                      fontSize: "11px",
                      color: "#059669",
                      background: "#dcfce7",
                      padding: "2px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    {`{{node:${selectedNode.id}}}`}
                  </code>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginTop: "6px",
                    }}
                  >
                    Inserts the complete output from this node
                  </div>
                </div>

                {/* Structured Fields */}
                {getStructuredFields(selectedNode).map((field) => (
                  <div
                    key={field}
                    onClick={() => handleInsert(selectedNode.id, field)}
                    style={{
                      padding: "14px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#8b5cf6";
                      e.currentTarget.style.background = "#f5f3ff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                      🔹 {field}
                    </div>
                    <code
                      style={{
                        fontSize: "11px",
                        color: "#7c3aed",
                        background: "#ede9fe",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      {`{{node:${selectedNode.id}.${field}}}`}
                    </code>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "6px",
                      }}
                    >
                      Inserts only the "{field}" field
                    </div>
                  </div>
                ))}

                {getStructuredFields(selectedNode).length === 0 && (
                  <div
                    style={{
                      padding: "16px",
                      background: "#fef3c7",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#92400e",
                    }}
                  >
                    ℹ️ This node doesn't have structured output enabled. Only
                    the full output is available.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
