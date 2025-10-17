// Node data types for the AI Agent Builder

export type LLMNodeData = {
  label: string;
  model: string;
  prompt: string;
  useStructuredOutput?: boolean;
  outputSchema?: string; // JSON schema as string
  executionStatus?: "idle" | "executing" | "completed" | "error";
  temperature?: number;
  maxTokens?: number;
};

export type SupabaseNodeData = {
  label: string;
  table: string;
  query: string;
  filters?: Record<string, unknown>;
  executionStatus?: "idle" | "executing" | "completed" | "error";
};

export type MCPServerConfig = {
  name: string;
  transport: "stdio" | "http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
};

export type MCPAgentNodeData = {
  label: string;
  model: string; // Anthropic model
  prompt: string;
  mcpServers: MCPServerConfig[];
  maxIterations?: number;
  executionStatus?: "idle" | "executing" | "completed" | "error";
  temperature?: number;
  maxTokens?: number;
};

export type NodeType = "llm" | "supabase" | "mcpAgent";

export type AgentNodeData = LLMNodeData | SupabaseNodeData | MCPAgentNodeData;
