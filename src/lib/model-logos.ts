/**
 * Utility functions for mapping model names to their corresponding logos
 */

export function getModelLogo(model: string): string {
  // OpenAI models
  if (model.startsWith("gpt-")) {
    return "/logos/openai.svg";
  }

  // Anthropic models
  if (model.startsWith("claude-")) {
    return "/logos/anthropic.svg";
  }

  // Default fallback to OpenAI logo
  return "/logos/openai.svg";
}

export function getModelProvider(
  model: string
): "openai" | "anthropic" | "unknown" {
  if (model.startsWith("gpt-")) {
    return "openai";
  }

  if (model.startsWith("claude-")) {
    return "anthropic";
  }

  return "unknown";
}
