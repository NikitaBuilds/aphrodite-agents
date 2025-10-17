import { tool } from "ai";
import { z } from "zod/v3";
import { google } from "googleapis";

/**
 * Gmail Tools for AI SDK
 * These tools allow AI agents to interact with Gmail using user-specific credentials
 * stored in Supabase. Each tool execution automatically uses the authenticated user's
 * Gmail tokens, making it multi-user safe and serverless-friendly.
 */

interface GmailCredentials {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

// Helper to create authenticated Gmail client
function createGmailClient(credentials: GmailCredentials) {
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
 * Creates Gmail tools that use the provided credentials
 * This factory function allows each execution to use different user credentials
 */
export function createGmailTools(credentials: GmailCredentials) {
  const gmail = createGmailClient(credentials);

  return {
    gmail_search: tool({
      description:
        "Search for emails in Gmail. Returns a list of matching email IDs and basic info.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Gmail search query (e.g., 'from:example@gmail.com is:unread', 'subject:invoice', 'after:2024/01/01')"
          ),
        maxResults: z
          .number()
          .optional()
          .describe("Maximum number of emails to return"),
      }),
      execute: async ({ query, maxResults }) => {
        try {
          const response = await gmail.users.messages.list({
            userId: "me",
            q: query,
            maxResults: maxResults || 10,
          });

          const messages = response.data.messages || [];

          if (messages.length === 0) {
            return {
              success: true,
              count: 0,
              message: "No emails found matching the query.",
            };
          }

          // Get details for each message
          const emailDetails = await Promise.all(
            messages.map(async (msg) => {
              const detail = await gmail.users.messages.get({
                userId: "me",
                id: msg.id!,
                format: "metadata",
                metadataHeaders: ["From", "To", "Subject", "Date"],
              });

              const headers = detail.data.payload?.headers || [];
              const getHeader = (name: string) =>
                headers.find(
                  (h) => h.name?.toLowerCase() === name.toLowerCase()
                )?.value || "";

              return {
                id: msg.id,
                threadId: msg.threadId,
                from: getHeader("From"),
                to: getHeader("To"),
                subject: getHeader("Subject"),
                date: getHeader("Date"),
                snippet: detail.data.snippet,
              };
            })
          );

          return {
            success: true,
            count: emailDetails.length,
            emails: emailDetails,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to search emails",
          };
        }
      },
    }),

    gmail_read: tool({
      description:
        "Read the full content of a specific email by ID. Returns the email body and attachments info.",
      inputSchema: z.object({
        messageId: z
          .string()
          .describe("The ID of the email message to read (from gmail_search)"),
      }),
      execute: async ({ messageId }) => {
        try {
          const response = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
            format: "full",
          });

          const message = response.data;
          const headers = message.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
              ?.value || "";

          // Extract email body
          let body = "";
          if (message.payload?.parts) {
            const textPart = message.payload.parts.find(
              (part) => part.mimeType === "text/plain"
            );
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, "base64").toString(
                "utf-8"
              );
            }
          } else if (message.payload?.body?.data) {
            body = Buffer.from(message.payload.body.data, "base64").toString(
              "utf-8"
            );
          }

          return {
            success: true,
            email: {
              id: message.id,
              threadId: message.threadId,
              from: getHeader("From"),
              to: getHeader("To"),
              subject: getHeader("Subject"),
              date: getHeader("Date"),
              body,
              snippet: message.snippet,
            },
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to read email",
          };
        }
      },
    }),

    gmail_send: tool({
      description: "Send an email via Gmail.",
      inputSchema: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content (plain text)"),
        cc: z
          .string()
          .optional()
          .describe("CC email addresses (comma-separated)"),
        bcc: z
          .string()
          .optional()
          .describe("BCC email addresses (comma-separated)"),
      }),
      execute: async ({ to, subject, body, cc, bcc }) => {
        try {
          const email = [
            `To: ${to}`,
            cc ? `Cc: ${cc}` : "",
            bcc ? `Bcc: ${bcc}` : "",
            `Subject: ${subject}`,
            "",
            body,
          ]
            .filter(Boolean)
            .join("\n");

          const encodedEmail = Buffer.from(email)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
              raw: encodedEmail,
            },
          });

          return {
            success: true,
            messageId: response.data.id,
            message: "Email sent successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to send email",
          };
        }
      },
    }),

    gmail_create_draft: tool({
      description:
        "Create a draft email in Gmail (doesn't send it, just saves as draft).",
      inputSchema: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content (plain text)"),
        cc: z
          .string()
          .optional()
          .describe("CC email addresses (comma-separated)"),
      }),
      execute: async ({ to, subject, body, cc }) => {
        try {
          const email = [
            `To: ${to}`,
            cc ? `Cc: ${cc}` : "",
            `Subject: ${subject}`,
            "",
            body,
          ]
            .filter(Boolean)
            .join("\n");

          const encodedEmail = Buffer.from(email)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          const response = await gmail.users.drafts.create({
            userId: "me",
            requestBody: {
              message: {
                raw: encodedEmail,
              },
            },
          });

          return {
            success: true,
            draftId: response.data.id,
            message: "Draft created successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to create draft",
          };
        }
      },
    }),

    gmail_list_labels: tool({
      description:
        "List all Gmail labels/folders available in the user's mailbox.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const response = await gmail.users.labels.list({
            userId: "me",
          });

          const labels = response.data.labels || [];

          return {
            success: true,
            count: labels.length,
            labels: labels.map((label) => ({
              id: label.id,
              name: label.name,
              type: label.type,
            })),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to list labels",
          };
        }
      },
    }),
  };
}
