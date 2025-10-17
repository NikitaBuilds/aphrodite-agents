import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Users API Tools
 * Complete implementation of user-related endpoints
 */

export function createUserTools(credentials: AsanaCredentials) {
  return {
    asana_list_users: tool({
      description:
        "List all users in a workspace or team. Use to find user GIDs.",
      inputSchema: z.object({
        workspace_gid: z
          .string()
          .optional()
          .describe("Workspace GID to list users from"),
        team_gid: z.string().optional().describe("Team GID to list users from"),
      }),
      execute: async ({ workspace_gid, team_gid }) => {
        try {
          let endpoint = "/users";

          if (workspace_gid) {
            endpoint = `/workspaces/${workspace_gid}/users`;
          } else if (team_gid) {
            endpoint = `/teams/${team_gid}/users`;
          }

          const users = await asanaRequest(credentials, endpoint);

          return successResponse({
            count: users.length,
            users: users.map((u: any) => ({
              gid: u.gid,
              name: u.name,
              email: u.email,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list users");
        }
      },
    }),

    asana_get_user: tool({
      description:
        "Get detailed information about a specific user. Use 'me' for current user.",
      inputSchema: z.object({
        user_gid: z
          .string()
          .describe('The GID of the user, or "me" for current user'),
      }),
      execute: async ({ user_gid }) => {
        try {
          const user = await asanaRequest(credentials, `/users/${user_gid}`);

          return successResponse({
            user: {
              gid: user.gid,
              name: user.name,
              email: user.email,
              photo: user.photo,
              workspaces: user.workspaces?.map((w: any) => ({
                gid: w.gid,
                name: w.name,
              })),
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get user");
        }
      },
    }),

    asana_get_user_favorites: tool({
      description: "Get a user's favorite projects and tasks.",
      inputSchema: z.object({
        user_gid: z
          .string()
          .describe('The GID of the user, or "me" for current user'),
        resource_type: z
          .enum(["project", "task", "portfolio", "user_task_list"])
          .optional()
          .describe("Filter favorites by resource type"),
        workspace_gid: z
          .string()
          .describe("Workspace GID to get favorites from"),
      }),
      execute: async ({ user_gid, resource_type, workspace_gid }) => {
        try {
          let endpoint = `/users/${user_gid}/favorites?workspace=${workspace_gid}`;

          if (resource_type) {
            endpoint += `&resource_type=${resource_type}`;
          }

          const favorites = await asanaRequest(credentials, endpoint);

          return successResponse({
            count: favorites.length,
            favorites: favorites.map((f: any) => ({
              gid: f.gid,
              name: f.name,
              resource_type: f.resource_type,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get user favorites");
        }
      },
    }),
  };
}
