import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Workspaces API Tools
 * Complete implementation of workspace-related endpoints
 */

export function createWorkspaceTools(credentials: AsanaCredentials) {
  return {
    asana_list_workspaces: tool({
      description:
        "List all Asana workspaces the user has access to. Start with this to get workspace IDs.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const workspaces = await asanaRequest(credentials, "/workspaces");
          return successResponse({
            count: workspaces.length,
            workspaces: workspaces.map((w: any) => ({
              gid: w.gid,
              name: w.name,
              is_organization: w.is_organization,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list workspaces");
        }
      },
    }),

    asana_get_workspace: tool({
      description: "Get detailed information about a specific workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
      }),
      execute: async ({ workspace_gid }) => {
        try {
          const workspace = await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}`
          );

          return successResponse({
            workspace: {
              gid: workspace.gid,
              name: workspace.name,
              is_organization: workspace.is_organization,
              email_domains: workspace.email_domains,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get workspace");
        }
      },
    }),

    asana_update_workspace: tool({
      description: "Update a workspace's name or settings.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        name: z.string().optional().describe("New workspace name"),
      }),
      execute: async ({ workspace_gid, name }) => {
        try {
          const data: any = {};
          if (name !== undefined) data.name = name;

          const workspace = await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              workspace: {
                gid: workspace.gid,
                name: workspace.name,
              },
            },
            "Workspace updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update workspace");
        }
      },
    }),

    asana_add_user_to_workspace: tool({
      description: "Add a user to a workspace or organization.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        user: z.string().describe("User GID or email to add"),
      }),
      execute: async ({ workspace_gid, user }) => {
        try {
          await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}/addUser`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { user },
              }),
            }
          );

          return successResponse(
            { workspace_gid, user },
            "User added to workspace"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add user to workspace");
        }
      },
    }),

    asana_remove_user_from_workspace: tool({
      description: "Remove a user from a workspace or organization.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        user: z.string().describe("User GID to remove"),
      }),
      execute: async ({ workspace_gid, user }) => {
        try {
          await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}/removeUser`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { user },
              }),
            }
          );

          return successResponse(
            { workspace_gid, user },
            "User removed from workspace"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove user from workspace");
        }
      },
    }),

    asana_get_workspace_events: tool({
      description:
        "Get events in a workspace for real-time updates (polling-based).",
      inputSchema: z.object({
        resource: z.string().describe("Resource GID to watch for events"),
        sync: z
          .string()
          .optional()
          .describe("Sync token from previous request for polling"),
      }),
      execute: async ({ resource, sync }) => {
        try {
          let endpoint = `/events?resource=${resource}`;
          if (sync) endpoint += `&sync=${sync}`;

          const result = await asanaRequest(credentials, endpoint);

          return successResponse({
            events: result.events || [],
            sync: result.sync,
          });
        } catch (error) {
          return errorResponse(error, "Failed to get workspace events");
        }
      },
    }),
  };
}
