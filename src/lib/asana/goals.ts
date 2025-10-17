import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Goals API Tools
 * Complete implementation of goal-related endpoints
 */

export function createGoalTools(credentials: AsanaCredentials) {
  return {
    asana_list_goals: tool({
      description: "List goals in a workspace, team, or portfolio.",
      inputSchema: z.object({
        workspace_gid: z
          .string()
          .optional()
          .describe("Workspace GID to list goals from"),
        team_gid: z.string().optional().describe("Team GID to list goals from"),
        portfolio_gid: z
          .string()
          .optional()
          .describe("Portfolio GID to list goals from"),
        time_periods: z
          .array(z.string())
          .optional()
          .describe("Filter by time period GIDs"),
        is_workspace_level: z
          .boolean()
          .optional()
          .describe("Filter for workspace-level goals"),
      }),
      execute: async ({
        workspace_gid,
        team_gid,
        portfolio_gid,
        time_periods,
        is_workspace_level,
      }) => {
        try {
          let endpoint = "/goals?opt_fields=name,status,due_on,owner.name";

          if (workspace_gid) endpoint += `&workspace=${workspace_gid}`;
          if (team_gid) endpoint += `&team=${team_gid}`;
          if (portfolio_gid) endpoint += `&portfolio=${portfolio_gid}`;
          if (time_periods)
            endpoint += `&time_periods=${time_periods.join(",")}`;
          if (is_workspace_level !== undefined)
            endpoint += `&is_workspace_level=${is_workspace_level}`;

          const goals = await asanaRequest(credentials, endpoint);

          return successResponse({
            count: goals.length,
            goals: goals.map((g: any) => ({
              gid: g.gid,
              name: g.name,
              status: g.status,
              due_on: g.due_on,
              owner: g.owner?.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list goals");
        }
      },
    }),

    asana_get_goal: tool({
      description: "Get detailed information about a specific goal.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the goal"),
      }),
      execute: async ({ goal_gid }) => {
        try {
          const goal = await asanaRequest(
            credentials,
            `/goals/${goal_gid}?opt_fields=name,notes,status,due_on,start_on,owner.name,team.name,workspace.name,current_status_update,metric`
          );

          return successResponse({
            goal: {
              gid: goal.gid,
              name: goal.name,
              notes: goal.notes,
              status: goal.status,
              due_on: goal.due_on,
              start_on: goal.start_on,
              owner: goal.owner?.name,
              team: goal.team?.name,
              workspace: goal.workspace?.name,
              current_status_update: goal.current_status_update,
              metric: goal.metric,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get goal");
        }
      },
    }),

    asana_create_goal: tool({
      description: "Create a new goal in a workspace or team.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        name: z.string().describe("Goal name"),
        team_gid: z.string().optional().describe("Team GID (optional)"),
        notes: z.string().optional().describe("Goal description"),
        due_on: z.string().optional().describe("Due date (YYYY-MM-DD)"),
        start_on: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        owner: z.string().optional().describe("User GID to set as goal owner"),
      }),
      execute: async ({
        workspace_gid,
        name,
        team_gid,
        notes,
        due_on,
        start_on,
        owner,
      }) => {
        try {
          const data: any = {
            name,
            workspace: workspace_gid,
          };

          if (team_gid) data.team = team_gid;
          if (notes) data.notes = notes;
          if (due_on) data.due_on = due_on;
          if (start_on) data.start_on = start_on;
          if (owner) data.owner = owner;

          const goal = await asanaRequest(credentials, "/goals", {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              goal: {
                gid: goal.gid,
                name: goal.name,
              },
            },
            "Goal created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create goal");
        }
      },
    }),

    asana_update_goal: tool({
      description: "Update a goal's properties.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the goal"),
        name: z.string().optional().describe("New goal name"),
        notes: z.string().optional().describe("New goal description"),
        status: z
          .enum(["green", "yellow", "red", "on_hold", "complete", "at_risk"])
          .optional()
          .describe("Goal status"),
        due_on: z.string().optional().describe("New due date (YYYY-MM-DD)"),
        start_on: z.string().optional().describe("New start date (YYYY-MM-DD)"),
      }),
      execute: async ({ goal_gid, name, notes, status, due_on, start_on }) => {
        try {
          const data: any = {};

          if (name !== undefined) data.name = name;
          if (notes !== undefined) data.notes = notes;
          if (status !== undefined) data.status = status;
          if (due_on !== undefined) data.due_on = due_on;
          if (start_on !== undefined) data.start_on = start_on;

          const goal = await asanaRequest(credentials, `/goals/${goal_gid}`, {
            method: "PUT",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              goal: {
                gid: goal.gid,
                name: goal.name,
                status: goal.status,
              },
            },
            "Goal updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update goal");
        }
      },
    }),

    asana_delete_goal: tool({
      description: "Delete a goal permanently.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the goal to delete"),
      }),
      execute: async ({ goal_gid }) => {
        try {
          await asanaRequest(credentials, `/goals/${goal_gid}`, {
            method: "DELETE",
          });

          return successResponse({ goal_gid }, "Goal deleted successfully");
        } catch (error) {
          return errorResponse(error, "Failed to delete goal");
        }
      },
    }),

    asana_create_goal_metric: tool({
      description: "Create a metric for tracking goal progress.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the goal"),
        precision: z
          .number()
          .optional()
          .describe("Decimal places (default: 2)"),
        unit: z
          .enum([
            "none",
            "currency",
            "percentage",
            "custom",
            "number",
            "boolean",
          ])
          .optional()
          .describe("Metric unit type"),
        currency_code: z
          .string()
          .optional()
          .describe("Currency code if unit is currency (e.g., USD)"),
        initial_number_value: z.number().optional().describe("Initial value"),
        target_number_value: z.number().optional().describe("Target value"),
      }),
      execute: async ({
        goal_gid,
        precision,
        unit,
        currency_code,
        initial_number_value,
        target_number_value,
      }) => {
        try {
          const data: any = {};

          if (precision !== undefined) data.precision = precision;
          if (unit) data.unit = unit;
          if (currency_code) data.currency_code = currency_code;
          if (initial_number_value !== undefined)
            data.initial_number_value = initial_number_value;
          if (target_number_value !== undefined)
            data.target_number_value = target_number_value;

          const metric = await asanaRequest(
            credentials,
            `/goals/${goal_gid}/setMetric`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            { metric },
            "Goal metric created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create goal metric");
        }
      },
    }),

    asana_update_goal_metric: tool({
      description: "Update the current value of a goal metric.",
      inputSchema: z.object({
        goal_metric_gid: z.string().describe("The GID of the goal metric"),
        current_number_value: z
          .number()
          .describe("New current value for the metric"),
      }),
      execute: async ({ goal_metric_gid, current_number_value }) => {
        try {
          const metric = await asanaRequest(
            credentials,
            `/goal_metrics/${goal_metric_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({
                data: { current_number_value },
              }),
            }
          );

          return successResponse(
            {
              metric: {
                gid: metric.gid,
                current_number_value: metric.current_number_value,
              },
            },
            "Goal metric updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update goal metric");
        }
      },
    }),

    asana_add_followers_to_goal: tool({
      description: "Add followers to a goal to receive updates.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the goal"),
        followers: z.array(z.string()).describe("Array of user GIDs or emails"),
      }),
      execute: async ({ goal_gid, followers }) => {
        try {
          await asanaRequest(credentials, `/goals/${goal_gid}/addFollowers`, {
            method: "POST",
            body: JSON.stringify({
              data: { followers },
            }),
          });

          return successResponse(
            { goal_gid, followers },
            "Followers added to goal"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add followers to goal");
        }
      },
    }),

    asana_remove_followers_from_goal: tool({
      description: "Remove followers from a goal.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the goal"),
        followers: z.array(z.string()).describe("Array of user GIDs to remove"),
      }),
      execute: async ({ goal_gid, followers }) => {
        try {
          await asanaRequest(
            credentials,
            `/goals/${goal_gid}/removeFollowers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { followers },
              }),
            }
          );

          return successResponse(
            { goal_gid, followers },
            "Followers removed from goal"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove followers from goal");
        }
      },
    }),

    asana_add_supporting_goal_relationship: tool({
      description: "Create a supporting relationship between two goals.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the parent goal"),
        supporting_goal_gid: z
          .string()
          .describe("The GID of the supporting goal"),
      }),
      execute: async ({ goal_gid, supporting_goal_gid }) => {
        try {
          const relationship = await asanaRequest(
            credentials,
            `/goals/${goal_gid}/addSupportingRelationship`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { supporting_resource: supporting_goal_gid },
              }),
            }
          );

          return successResponse(
            { relationship_gid: relationship.gid },
            "Supporting goal relationship created"
          );
        } catch (error) {
          return errorResponse(
            error,
            "Failed to create supporting goal relationship"
          );
        }
      },
    }),

    asana_remove_supporting_goal_relationship: tool({
      description: "Remove a supporting relationship between two goals.",
      inputSchema: z.object({
        goal_gid: z.string().describe("The GID of the parent goal"),
        supporting_goal_gid: z
          .string()
          .describe("The GID of the supporting goal"),
      }),
      execute: async ({ goal_gid, supporting_goal_gid }) => {
        try {
          await asanaRequest(
            credentials,
            `/goals/${goal_gid}/removeSupportingRelationship`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { supporting_resource: supporting_goal_gid },
              }),
            }
          );

          return successResponse(
            { goal_gid, supporting_goal_gid },
            "Supporting goal relationship removed"
          );
        } catch (error) {
          return errorResponse(
            error,
            "Failed to remove supporting goal relationship"
          );
        }
      },
    }),
  };
}
