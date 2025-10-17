"use client";

import { Panel } from "@xyflow/react";

type ToolbarProps = {
  onAddNode: (type: "llm" | "mcpAgent") => void;
  onAutoLayout: () => void;
  onExecute: () => void;
  onExport: () => void;
  onImport: () => void;
  isExecuting?: boolean;
};

export default function Toolbar({
  onAddNode,
  onAutoLayout,
  onExecute,
  onExport,
  onImport,
  isExecuting = false,
}: ToolbarProps) {
  return (
    <Panel position="top-left">
      <div
        style={{
          background: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => onAddNode("llm")}
          style={{
            padding: "8px 16px",
            background: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#7c3aed")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#8b5cf6")}
        >
          + LLM Node
        </button>
        <button
          onClick={() => onAddNode("mcpAgent")}
          style={{
            padding: "8px 16px",
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#ea580c")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f97316")}
          title="Add MCP Agent with tool access"
        >
          🤖 + MCP Agent
        </button>
        <button
          onClick={onAutoLayout}
          style={{
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#2563eb")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#3b82f6")}
        >
          ✨ Auto Layout
        </button>
        <button
          onClick={onExecute}
          disabled={isExecuting}
          style={{
            padding: "8px 16px",
            background: isExecuting ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isExecuting ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isExecuting ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (!isExecuting) e.currentTarget.style.background = "#059669";
          }}
          onMouseOut={(e) => {
            if (!isExecuting) e.currentTarget.style.background = "#10b981";
          }}
        >
          {isExecuting ? "⏳ Executing..." : "▶️ Execute"}
        </button>

        {/* Divider */}
        <div style={{ width: "1px", background: "#e5e7eb", margin: "0 4px" }} />

        <button
          onClick={onExport}
          style={{
            padding: "8px 16px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#d97706")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f59e0b")}
          title="Export workflow as JSON"
        >
          📥 Export
        </button>
        <button
          onClick={onImport}
          style={{
            padding: "8px 16px",
            background: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#7c3aed")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#8b5cf6")}
          title="Import workflow from JSON"
        >
          📤 Import
        </button>
      </div>
    </Panel>
  );
}
