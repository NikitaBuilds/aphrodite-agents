"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { NodeStatusIndicator } from "@/components/node-status-indicator";
import { BaseNode, BaseNodeContent } from "@/components/base-node";
import { getModelLogo } from "@/lib/model-logos";
import Image from "next/image";

type LLMNodeData = {
  label: string;
  model: string;
  prompt: string;
  useStructuredOutput?: boolean;
  outputSchema?: string;
  executionStatus?: "idle" | "executing" | "completed" | "error";
};

function LLMNode({ data, selected }: NodeProps<Node<LLMNodeData>>) {
  const status = data.executionStatus || "idle";

  const getNodeStatus = () => {
    if (status === "executing") return "loading";
    if (status === "completed") return "success";
    if (status === "error") return "error";
    return "initial";
  };

  return (
    <NodeStatusIndicator status={getNodeStatus()} variant="border">
      <BaseNode className="min-w-[200px] border-purple-500">
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "#8b5cf6" }}
          isConnectable={true}
        />

        <BaseNodeContent>
          <div className="font-semibold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Image
              src={getModelLogo(data.model)}
              alt={`${data.model} logo`}
              width={12}
              height={12}
              className="w-3 h-3"
            />
            {data.model}
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded max-w-[180px] truncate">
            {data.prompt}
          </div>
        </BaseNodeContent>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: "#8b5cf6" }}
          isConnectable={true}
        />
      </BaseNode>
    </NodeStatusIndicator>
  );
}

export default memo(LLMNode);
