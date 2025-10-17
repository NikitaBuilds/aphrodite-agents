import { z } from "zod/v3";

// LLM Node Schemas
export const LLMInputSchema = z.object({
  prompt: z.string(),
  model: z.string(),
  context: z.string().optional(),
  useStructuredOutput: z.boolean().default(false),
  outputSchema: z.string().optional(), // JSON string of the schema
});

export const LLMOutputSchema = z.object({
  content: z.union([z.string(), z.any()]), // Can be string or structured object
  model: z.string(),
  tokens: z.number().optional(),
  isStructured: z.boolean().optional(),
});

// Supabase Node Schemas
export const SupabaseOutputSchema = z.object({
  data: z.array(z.any()),
  count: z.number().optional(),
});

// MCP Agent Node Schemas
export const MCPServerConfigSchema = z.object({
  name: z.string(),
  transport: z.enum(["stdio", "http"]),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().optional(),
  env: z.record(z.string()).optional(),
});

export const MCPAgentInputSchema = z.object({
  prompt: z.string(),
  model: z.string(),
  mcpServers: z.array(MCPServerConfigSchema),
  maxIterations: z.number().default(10),
  maxTokens: z.number().default(4096),
  temperature: z.number().optional(),
});

export const MCPAgentOutputSchema = z.object({
  content: z.string(),
  model: z.string(),
  tokens: z.number().optional(),
  toolsUsed: z.array(z.string()),
  iterationCount: z.number().optional(),
});

// Workflow Execution
export const WorkflowExecutionSchema = z.object({
  workflowId: z.string(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export type LLMInput = z.infer<typeof LLMInputSchema>;
export type LLMOutput = z.infer<typeof LLMOutputSchema>;
export type SupabaseOutput = z.infer<typeof SupabaseOutputSchema>;
export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;
export type MCPAgentInput = z.infer<typeof MCPAgentInputSchema>;
export type MCPAgentOutput = z.infer<typeof MCPAgentOutputSchema>;
