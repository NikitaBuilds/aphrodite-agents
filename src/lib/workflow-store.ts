import { redis } from "./redis";

const WORKFLOW_TTL = 3600; // 1 hour in seconds

export type NodeOutput = {
  content: string | object;
  model?: string;
  tokens?: number;
  isStructured?: boolean;
  timestamp: number;
};

export type WorkflowExecution = {
  id: string;
  status: "running" | "completed" | "failed";
  nodeOutputs: Record<string, NodeOutput>;
  createdAt: number;
  updatedAt: number;
};

/**
 * Store a node's output in Redis
 */
export async function setNodeOutput(
  workflowId: string,
  nodeId: string,
  output: Omit<NodeOutput, "timestamp">
): Promise<void> {
  const key = `workflow:${workflowId}:node:${nodeId}`;
  const data: NodeOutput = {
    ...output,
    timestamp: Date.now(),
  };

  await redis.set(key, JSON.stringify(data), { ex: WORKFLOW_TTL });
}

/**
 * Get a node's output from Redis
 */
export async function getNodeOutput(
  workflowId: string,
  nodeId: string
): Promise<NodeOutput | null> {
  const key = `workflow:${workflowId}:node:${nodeId}`;
  const data = await redis.get(key);

  if (!data) return null;

  return typeof data === "string" ? JSON.parse(data) : (data as NodeOutput);
}

/**
 * Get all node outputs for a workflow
 */
export async function getAllNodeOutputs(
  workflowId: string
): Promise<Record<string, NodeOutput>> {
  const pattern = `workflow:${workflowId}:node:*`;

  // Use SCAN to find all keys matching the pattern
  const [, keys] = await redis.scan(0, { match: pattern, count: 100 });

  if (keys.length === 0) return {};

  // Get all values
  const outputs: Record<string, NodeOutput> = {};

  for (const key of keys) {
    const nodeId = key.split(":").pop();
    if (nodeId) {
      const data = await redis.get(key);
      if (data) {
        outputs[nodeId] = typeof data === "string" ? JSON.parse(data) : data;
      }
    }
  }

  return outputs;
}

/**
 * Store workflow execution metadata
 */
export async function setWorkflowExecution(
  execution: WorkflowExecution
): Promise<void> {
  const key = `workflow:${execution.id}:meta`;
  await redis.set(key, JSON.stringify(execution), { ex: WORKFLOW_TTL });
}

/**
 * Get workflow execution metadata
 */
export async function getWorkflowExecution(
  workflowId: string
): Promise<WorkflowExecution | null> {
  const key = `workflow:${workflowId}:meta`;
  const data = await redis.get(key);

  if (!data) return null;

  return typeof data === "string"
    ? JSON.parse(data)
    : (data as WorkflowExecution);
}

/**
 * Delete all workflow data (cleanup)
 */
export async function deleteWorkflowData(workflowId: string): Promise<void> {
  const pattern = `workflow:${workflowId}:*`;
  const [, keys] = await redis.scan(0, { match: pattern, count: 100 });

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Replace template variables in a prompt with node outputs
 * Template syntax: {{node:nodeId}} or {{node:nodeId.field}}
 */
export function injectNodeOutputs(
  prompt: string,
  nodeOutputs: Record<string, NodeOutput>
): string {
  return prompt.replace(/\{\{node:([^}]+)\}\}/g, (match, path) => {
    const parts = path.split(".");
    const nodeId = parts[0];
    const field = parts[1];

    const output = nodeOutputs[nodeId];
    if (!output) {
      console.warn(`Node output not found: ${nodeId}`);
      return match; // Keep original if not found
    }

    // If field specified, try to access it
    if (field && typeof output.content === "object") {
      const value = (output.content as Record<string, unknown>)[field];
      if (value !== undefined) {
        return typeof value === "string" ? value : JSON.stringify(value);
      }
    }

    // Return full content
    if (typeof output.content === "string") {
      return output.content;
    }

    return JSON.stringify(output.content, null, 2);
  });
}
