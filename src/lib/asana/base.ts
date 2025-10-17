import { tool } from "ai";
import { z } from "zod/v3";

/**
 * Base utilities for Asana API integration
 * Shared types, helpers, and request handling
 */

export interface AsanaCredentials {
  access_token: string;
}

export const ASANA_API_BASE = "https://app.asana.com/api/1.0";

/**
 * Make an authenticated request to the Asana API
 */
export async function asanaRequest(
  credentials: AsanaCredentials,
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${ASANA_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${credentials.access_token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Asana API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Helper to create a standardized error response
 */
export function errorResponse(error: unknown, defaultMessage: string) {
  return {
    success: false,
    error: error instanceof Error ? error.message : defaultMessage,
  };
}

/**
 * Helper to create a standardized success response
 */
export function successResponse(data: any, message?: string) {
  return {
    success: true,
    ...data,
    ...(message && { message }),
  };
}

/**
 * Type helper for tool creation
 */
export { tool, z };
