export type ModelProvider = "anthropic" | "openai";

export interface Model {
  name: string;
  apiName: string;
  provider: ModelProvider;
  supportsStructuredOutput: boolean;
}

export const MODELS: Model[] = [
  // Anthropic Models (via OpenAI compatibility layer)
  {
    name: "Claude Sonnet 4.5",
    apiName: "claude-sonnet-4-5-20250929",
    provider: "anthropic",
    supportsStructuredOutput: true,
  },
  {
    name: "Claude Opus 4.1",
    apiName: "claude-opus-4-1-20250805",
    provider: "anthropic",
    supportsStructuredOutput: true,
  },
  {
    name: "Claude Sonnet 4",
    apiName: "claude-sonnet-4-20250514",
    provider: "anthropic",
    supportsStructuredOutput: true,
  },
  {
    name: "Claude Opus 4",
    apiName: "claude-opus-4-20250514",
    provider: "anthropic",
    supportsStructuredOutput: true,
  },
  {
    name: "Claude Sonnet 3.7",
    apiName: "claude-sonnet-3-7-20250224",
    provider: "anthropic",
    supportsStructuredOutput: true,
  },
  {
    name: "Claude Haiku 3.5",
    apiName: "claude-3-5-haiku-20241022",
    provider: "anthropic",
    supportsStructuredOutput: true,
  },
  // OpenAI Models
  {
    name: "GPT-5",
    apiName: "gpt-5",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-5 Pro",
    apiName: "gpt-5-pro",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-5 Thinking",
    apiName: "gpt-5-thinking",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-5 Instant",
    apiName: "gpt-5-instant",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4.1",
    apiName: "gpt-4.1",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4.1 Mini",
    apiName: "gpt-4.1-mini",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4.1 Nano",
    apiName: "gpt-4.1-nano",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4o",
    apiName: "gpt-4o",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4o (Latest)",
    apiName: "chatgpt-4o-latest",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4o Mini",
    apiName: "gpt-4o-mini",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4o (2024-08-06)",
    apiName: "gpt-4o-2024-08-06",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "OpenAI o3",
    apiName: "o3",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "OpenAI o3 Pro",
    apiName: "o3-pro",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "OpenAI o3 Mini",
    apiName: "o3-mini",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "OpenAI o4 Mini",
    apiName: "o4-mini",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "OpenAI o4 Mini High",
    apiName: "o4-mini-high",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4 Turbo",
    apiName: "gpt-4-turbo",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-4",
    apiName: "gpt-4",
    provider: "openai",
    supportsStructuredOutput: true,
  },
  {
    name: "GPT-3.5 Turbo",
    apiName: "gpt-3.5-turbo",
    provider: "openai",
    supportsStructuredOutput: true,
  },
];

export function getModelByApiName(apiName: string): Model | undefined {
  return MODELS.find((model) => model.apiName === apiName);
}

export function getModelsByProvider(provider: ModelProvider): Model[] {
  return MODELS.filter((model) => model.provider === provider);
}
