"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { NodeStatusIndicator } from "@/components/node-status-indicator";
import { BaseNode, BaseNodeContent } from "@/components/base-node";

type MCPAgentNodeData = {
  label: string;
  model: string;
  prompt: string;
  mcpServers: Array<{ name: string; transport: string }>;
  executionStatus?: "idle" | "executing" | "completed" | "error";
};

function MCPAgentNode({ data, selected }: NodeProps<Node<MCPAgentNodeData>>) {
  const status = data.executionStatus || "idle";

  const getNodeStatus = () => {
    if (status === "executing") return "loading";
    if (status === "completed") return "success";
    if (status === "error") return "error";
    return "initial";
  };

  return (
    <NodeStatusIndicator status={getNodeStatus()} variant="border">
      <BaseNode className="min-w-[220px] border-orange-500">
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "#f97316" }}
          isConnectable={true}
        />

        <BaseNodeContent>
          <div className="font-semibold text-gray-800 flex items-center gap-2">
            🤖 {data.label}
          </div>
          <div className="text-xs text-gray-600">{data.model}</div>
          <div className="text-xs text-orange-600 font-medium">
            🔧 {data.mcpServers.length} MCP Server
            {data.mcpServers.length !== 1 ? "s" : ""}
          </div>
          {data.mcpServers.length > 0 && (
            <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1">
              {data.mcpServers.map((server, idx) => (
                <span
                  key={idx}
                  className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                >
                  {server.name}
                </span>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded max-w-[200px] truncate mt-2">
            {data.prompt}
          </div>
        </BaseNodeContent>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: "#f97316" }}
          isConnectable={true}
        />
      </BaseNode>
    </NodeStatusIndicator>
  );
}

export default memo(MCPAgentNode);
