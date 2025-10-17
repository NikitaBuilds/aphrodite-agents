"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";

type SupabaseNodeData = {
  label: string;
  table: string;
  query: string;
};

function SupabaseNode({ data, selected }: NodeProps<Node<SupabaseNodeData>>) {
  return (
    <div
      style={{
        padding: "15px",
        borderRadius: "8px",
        border: `2px solid ${selected ? "#3b82f6" : "#10b981"}`,
        background: "white",
        minWidth: "200px",
        boxShadow: selected
          ? "0 4px 12px rgba(59, 130, 246, 0.3)"
          : "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#10b981" }}
        isConnectable={true}
      />

      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <strong style={{ color: "#1f2937" }}>{data.label}</strong>
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280", marginLeft: "16px" }}>
          📊 Table: {data.table}
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#374151",
          background: "#f0fdf4",
          padding: "8px",
          borderRadius: "4px",
          marginTop: "8px",
          fontFamily: "monospace",
          maxWidth: "180px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {data.query}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#10b981" }}
        isConnectable={true}
      />
    </div>
  );
}

export default memo(SupabaseNode);
