import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Time Tracking API Tools
 * Complete implementation of time tracking endpoints
 */

export function createTimeTrackingTools(credentials: AsanaCredentials) {
  return {
    asana_get_time_entries_for_task: tool({
      description: "Get all time tracking entries for a specific task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
      }),
      execute: async ({ task_gid }) => {
        try {
          const entries = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/time_tracking_entries`
          );

          return successResponse({
            count: entries.length,
            entries: entries.map((e: any) => ({
              gid: e.gid,
              duration_minutes: e.duration_minutes,
              entered_on: e.entered_on,
              created_by: e.created_by?.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get time entries");
        }
      },
    }),

    asana_create_time_entry: tool({
      description:
        "Create a new time tracking entry for a task. Log time spent on work.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        duration_minutes: z
          .number()
          .positive()
          .describe("Duration in minutes (e.g., 60 for 1 hour)"),
        entered_on: z
          .string()
          .optional()
          .describe(
            "Date the time was tracked (YYYY-MM-DD). Defaults to today."
          ),
      }),
      execute: async ({ task_gid, duration_minutes, entered_on }) => {
        try {
          const data: any = {
            task: task_gid,
            duration_minutes,
          };

          if (entered_on) {
            data.entered_on = entered_on;
          }

          const entry = await asanaRequest(
            credentials,
            "/time_tracking_entries",
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              entry: {
                gid: entry.gid,
                duration_minutes: entry.duration_minutes,
                entered_on: entry.entered_on,
              },
            },
            "Time entry created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create time entry");
        }
      },
    }),

    asana_get_time_entry: tool({
      description: "Get details of a specific time tracking entry.",
      inputSchema: z.object({
        time_entry_gid: z.string().describe("The GID of the time entry"),
      }),
      execute: async ({ time_entry_gid }) => {
        try {
          const entry = await asanaRequest(
            credentials,
            `/time_tracking_entries/${time_entry_gid}`
          );

          return successResponse({
            entry: {
              gid: entry.gid,
              task: entry.task,
              duration_minutes: entry.duration_minutes,
              entered_on: entry.entered_on,
              created_at: entry.created_at,
              created_by: entry.created_by,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get time entry");
        }
      },
    }),

    asana_update_time_entry: tool({
      description:
        "Update an existing time tracking entry. Modify duration or date.",
      inputSchema: z.object({
        time_entry_gid: z.string().describe("The GID of the time entry"),
        duration_minutes: z
          .number()
          .positive()
          .optional()
          .describe("New duration in minutes"),
        entered_on: z.string().optional().describe("New date (YYYY-MM-DD)"),
      }),
      execute: async ({ time_entry_gid, duration_minutes, entered_on }) => {
        try {
          const data: any = {};

          if (duration_minutes !== undefined) {
            data.duration_minutes = duration_minutes;
          }
          if (entered_on !== undefined) {
            data.entered_on = entered_on;
          }

          const entry = await asanaRequest(
            credentials,
            `/time_tracking_entries/${time_entry_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              entry: {
                gid: entry.gid,
                duration_minutes: entry.duration_minutes,
                entered_on: entry.entered_on,
              },
            },
            "Time entry updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update time entry");
        }
      },
    }),

    asana_delete_time_entry: tool({
      description: "Delete a time tracking entry permanently.",
      inputSchema: z.object({
        time_entry_gid: z.string().describe("The GID of the time entry"),
      }),
      execute: async ({ time_entry_gid }) => {
        try {
          await asanaRequest(
            credentials,
            `/time_tracking_entries/${time_entry_gid}`,
            {
              method: "DELETE",
            }
          );

          return successResponse(
            { time_entry_gid },
            "Time entry deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete time entry");
        }
      },
    }),
  };
}
