import { tool } from "ai";
import { z } from "zod/v3";
import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";

/**
 * Base utilities for Gmail API integration
 * Shared types, helpers, and Gmail client creation
 */

export interface GmailCredentials {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

/**
 * Create an authenticated Gmail client using OAuth2 credentials
 */
export function createGmailClient(
  credentials: GmailCredentials
): gmail_v1.Gmail {
  const oauth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret
  );

  oauth2Client.setCredentials({
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
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
 * Helper to extract header value from Gmail message headers
 */
export function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  return (
    headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ||
    ""
  );
}

/**
 * Helper to create a base64url encoded email from headers and body
 */
export function createRawEmail(params: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  from?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const { to, subject, body, cc, bcc, from, replyTo, inReplyTo, references } =
    params;

  const email = [
    from ? `From: ${from}` : "",
    `To: ${to}`,
    cc ? `Cc: ${cc}` : "",
    bcc ? `Bcc: ${bcc}` : "",
    replyTo ? `Reply-To: ${replyTo}` : "",
    inReplyTo ? `In-Reply-To: ${inReplyTo}` : "",
    references ? `References: ${references}` : "",
    `Subject: ${subject}`,
    "",
    body,
  ]
    .filter(Boolean)
    .join("\n");

  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Extract email body text from Gmail message payload
 */
export function extractEmailBody(
  payload: gmail_v1.Schema$MessagePart | undefined
): string {
  if (!payload) return "";

  // Try to find text/plain part
  if (payload.parts) {
    const textPart = payload.parts.find(
      (part) => part.mimeType === "text/plain"
    );
    if (textPart?.body?.data) {
      return Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }

    // Fallback to text/html if no plain text
    const htmlPart = payload.parts.find(
      (part) => part.mimeType === "text/html"
    );
    if (htmlPart?.body?.data) {
      return Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
    }
  } else if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  return "";
}

/**
 * Type helper for tool creation
 */
export { tool, z };
export type { gmail_v1 };
