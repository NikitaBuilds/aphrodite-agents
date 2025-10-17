import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Webhooks API Tools
 * Complete implementation of webhook endpoints for real-time notifications
 */

export function createWebhookTools(credentials: AsanaCredentials) {
  return {
    asana_list_webhooks: tool({
      description: "List all webhooks in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
      }),
      execute: async ({ workspace_gid }) => {
        try {
          const webhooks = await asanaRequest(
            credentials,
            `/webhooks?workspace=${workspace_gid}`
          );

          return successResponse({
            count: webhooks.length,
            webhooks: webhooks.map((w: any) => ({
              gid: w.gid,
              resource: w.resource,
              target: w.target,
              active: w.active,
              created_at: w.created_at,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list webhooks");
        }
      },
    }),

    asana_get_webhook: tool({
      description: "Get details of a specific webhook.",
      inputSchema: z.object({
        webhook_gid: z.string().describe("The GID of the webhook"),
      }),
      execute: async ({ webhook_gid }) => {
        try {
          const webhook = await asanaRequest(
            credentials,
            `/webhooks/${webhook_gid}`
          );

          return successResponse({
            webhook: {
              gid: webhook.gid,
              resource: webhook.resource,
              target: webhook.target,
              active: webhook.active,
              filters: webhook.filters,
              created_at: webhook.created_at,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get webhook");
        }
      },
    }),

    asana_create_webhook: tool({
      description:
        "Create a webhook to receive real-time notifications about changes to a resource.",
      inputSchema: z.object({
        resource: z
          .string()
          .describe("GID of the resource to watch (project, task, etc)"),
        target: z
          .string()
          .url()
          .describe("HTTPS URL that will receive webhook events"),
        filters: z
          .array(
            z.object({
              resource_type: z.string(),
              resource_subtype: z.string().optional(),
              action: z.string().optional(),
            })
          )
          .optional()
          .describe("Optional filters for events"),
      }),
      execute: async ({ resource, target, filters }) => {
        try {
          const data: any = {
            resource,
            target,
          };
          if (filters) data.filters = filters;

          const webhook = await asanaRequest(credentials, "/webhooks", {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              webhook: {
                gid: webhook.gid,
                resource: webhook.resource,
                target: webhook.target,
                active: webhook.active,
              },
            },
            "Webhook created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create webhook");
        }
      },
    }),

    asana_update_webhook: tool({
      description: "Update a webhook's filters.",
      inputSchema: z.object({
        webhook_gid: z.string().describe("The GID of the webhook"),
        filters: z
          .array(
            z.object({
              resource_type: z.string(),
              resource_subtype: z.string().optional(),
              action: z.string().optional(),
            })
          )
          .describe("New filters for events"),
      }),
      execute: async ({ webhook_gid, filters }) => {
        try {
          const webhook = await asanaRequest(
            credentials,
            `/webhooks/${webhook_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({
                data: { filters },
              }),
            }
          );

          return successResponse(
            {
              webhook: {
                gid: webhook.gid,
                filters: webhook.filters,
              },
            },
            "Webhook updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update webhook");
        }
      },
    }),

    asana_delete_webhook: tool({
      description: "Delete a webhook to stop receiving notifications.",
      inputSchema: z.object({
        webhook_gid: z.string().describe("The GID of the webhook to delete"),
      }),
      execute: async ({ webhook_gid }) => {
        try {
          await asanaRequest(credentials, `/webhooks/${webhook_gid}`, {
            method: "DELETE",
          });

          return successResponse(
            { webhook_gid },
            "Webhook deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete webhook");
        }
      },
    }),
  };
}
