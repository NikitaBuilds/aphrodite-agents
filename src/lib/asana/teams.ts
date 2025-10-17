import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Teams API Tools
 * Complete implementation of team-related endpoints
 */

export function createTeamTools(credentials: AsanaCredentials) {
  return {
    asana_list_teams_in_workspace: tool({
      description: "List all teams in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
      }),
      execute: async ({ workspace_gid }) => {
        try {
          const teams = await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}/teams`
          );

          return successResponse({
            count: teams.length,
            teams: teams.map((t: any) => ({
              gid: t.gid,
              name: t.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list teams");
        }
      },
    }),

    asana_list_teams_for_user: tool({
      description: "List all teams a user belongs to in an organization.",
      inputSchema: z.object({
        user_gid: z.string().describe("The GID of the user"),
        organization_gid: z.string().describe("The GID of the organization"),
      }),
      execute: async ({ user_gid, organization_gid }) => {
        try {
          const teams = await asanaRequest(
            credentials,
            `/users/${user_gid}/teams?organization=${organization_gid}`
          );

          return successResponse({
            count: teams.length,
            teams: teams.map((t: any) => ({
              gid: t.gid,
              name: t.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list teams for user");
        }
      },
    }),

    asana_get_team: tool({
      description: "Get detailed information about a specific team.",
      inputSchema: z.object({
        team_gid: z.string().describe("The GID of the team"),
      }),
      execute: async ({ team_gid }) => {
        try {
          const team = await asanaRequest(credentials, `/teams/${team_gid}`);

          return successResponse({
            team: {
              gid: team.gid,
              name: team.name,
              description: team.description,
              organization: team.organization,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get team");
        }
      },
    }),

    asana_create_team: tool({
      description: "Create a new team in an organization.",
      inputSchema: z.object({
        organization_gid: z.string().describe("The GID of the organization"),
        name: z.string().describe("Team name"),
        description: z.string().optional().describe("Team description"),
      }),
      execute: async ({ organization_gid, name, description }) => {
        try {
          const data: any = {
            name,
            organization: organization_gid,
          };
          if (description) data.description = description;

          const team = await asanaRequest(credentials, "/teams", {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              team: {
                gid: team.gid,
                name: team.name,
              },
            },
            "Team created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create team");
        }
      },
    }),

    asana_update_team: tool({
      description: "Update a team's name or description.",
      inputSchema: z.object({
        team_gid: z.string().describe("The GID of the team"),
        name: z.string().optional().describe("New team name"),
        description: z.string().optional().describe("New team description"),
      }),
      execute: async ({ team_gid, name, description }) => {
        try {
          const data: any = {};
          if (name !== undefined) data.name = name;
          if (description !== undefined) data.description = description;

          const team = await asanaRequest(credentials, `/teams/${team_gid}`, {
            method: "PUT",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              team: {
                gid: team.gid,
                name: team.name,
              },
            },
            "Team updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update team");
        }
      },
    }),

    asana_add_user_to_team: tool({
      description: "Add a user to a team.",
      inputSchema: z.object({
        team_gid: z.string().describe("The GID of the team"),
        user: z.string().describe("User GID or email to add"),
      }),
      execute: async ({ team_gid, user }) => {
        try {
          await asanaRequest(credentials, `/teams/${team_gid}/addUser`, {
            method: "POST",
            body: JSON.stringify({
              data: { user },
            }),
          });

          return successResponse({ team_gid, user }, "User added to team");
        } catch (error) {
          return errorResponse(error, "Failed to add user to team");
        }
      },
    }),

    asana_remove_user_from_team: tool({
      description: "Remove a user from a team.",
      inputSchema: z.object({
        team_gid: z.string().describe("The GID of the team"),
        user: z.string().describe("User GID to remove"),
      }),
      execute: async ({ team_gid, user }) => {
        try {
          await asanaRequest(credentials, `/teams/${team_gid}/removeUser`, {
            method: "POST",
            body: JSON.stringify({
              data: { user },
            }),
          });

          return successResponse({ team_gid, user }, "User removed from team");
        } catch (error) {
          return errorResponse(error, "Failed to remove user from team");
        }
      },
    }),
  };
}
