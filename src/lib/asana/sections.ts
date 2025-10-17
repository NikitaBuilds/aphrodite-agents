import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Sections API Tools
 * Complete implementation of section endpoints (columns/groups in projects)
 */

export function createSectionTools(credentials: AsanaCredentials) {
  return {
    asana_get_sections_for_project: tool({
      description: "Get all sections (columns/groups) in a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
      }),
      execute: async ({ project_gid }) => {
        try {
          const sections = await asanaRequest(
            credentials,
            `/projects/${project_gid}/sections`
          );

          return successResponse({
            count: sections.length,
            sections: sections.map((s: any) => ({
              gid: s.gid,
              name: s.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get sections");
        }
      },
    }),

    asana_get_section: tool({
      description: "Get details of a specific section.",
      inputSchema: z.object({
        section_gid: z.string().describe("The GID of the section"),
      }),
      execute: async ({ section_gid }) => {
        try {
          const section = await asanaRequest(
            credentials,
            `/sections/${section_gid}?opt_fields=name,project.name,created_at`
          );

          return successResponse({
            section: {
              gid: section.gid,
              name: section.name,
              project: section.project,
              created_at: section.created_at,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get section");
        }
      },
    }),

    asana_create_section: tool({
      description:
        "Create a new section in a project (e.g., 'To Do', 'In Progress').",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        name: z.string().describe("Section name (e.g., 'To Do', 'Done')"),
        insert_before: z
          .string()
          .optional()
          .describe("Section GID to insert before"),
        insert_after: z
          .string()
          .optional()
          .describe("Section GID to insert after"),
      }),
      execute: async ({ project_gid, name, insert_before, insert_after }) => {
        try {
          const data: any = { name };
          if (insert_before) data.insert_before = insert_before;
          if (insert_after) data.insert_after = insert_after;

          const section = await asanaRequest(
            credentials,
            `/projects/${project_gid}/sections`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              section: {
                gid: section.gid,
                name: section.name,
              },
            },
            "Section created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create section");
        }
      },
    }),

    asana_update_section: tool({
      description: "Update a section's name.",
      inputSchema: z.object({
        section_gid: z.string().describe("The GID of the section"),
        name: z.string().describe("New section name"),
      }),
      execute: async ({ section_gid, name }) => {
        try {
          const section = await asanaRequest(
            credentials,
            `/sections/${section_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({
                data: { name },
              }),
            }
          );

          return successResponse(
            {
              section: {
                gid: section.gid,
                name: section.name,
              },
            },
            "Section updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update section");
        }
      },
    }),

    asana_delete_section: tool({
      description: "Delete a section from a project.",
      inputSchema: z.object({
        section_gid: z.string().describe("The GID of the section to delete"),
      }),
      execute: async ({ section_gid }) => {
        try {
          await asanaRequest(credentials, `/sections/${section_gid}`, {
            method: "DELETE",
          });

          return successResponse(
            { section_gid },
            "Section deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete section");
        }
      },
    }),

    asana_add_task_to_section: tool({
      description: "Move a task to a specific section within a project.",
      inputSchema: z.object({
        section_gid: z.string().describe("The GID of the section"),
        task_gid: z.string().describe("The GID of the task to move"),
        insert_before: z
          .string()
          .optional()
          .describe("Task GID to insert before"),
        insert_after: z
          .string()
          .optional()
          .describe("Task GID to insert after"),
      }),
      execute: async ({
        section_gid,
        task_gid,
        insert_before,
        insert_after,
      }) => {
        try {
          const data: any = { task: task_gid };
          if (insert_before) data.insert_before = insert_before;
          if (insert_after) data.insert_after = insert_after;

          await asanaRequest(credentials, `/sections/${section_gid}/addTask`, {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            { section_gid, task_gid },
            "Task added to section"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add task to section");
        }
      },
    }),

    asana_get_tasks_in_section: tool({
      description: "Get all tasks in a specific section.",
      inputSchema: z.object({
        section_gid: z.string().describe("The GID of the section"),
      }),
      execute: async ({ section_gid }) => {
        try {
          const tasks = await asanaRequest(
            credentials,
            `/sections/${section_gid}/tasks?opt_fields=name,completed,due_on,assignee.name`
          );

          return successResponse({
            count: tasks.length,
            tasks: tasks.map((t: any) => ({
              gid: t.gid,
              name: t.name,
              completed: t.completed,
              due_on: t.due_on,
              assignee: t.assignee?.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get tasks in section");
        }
      },
    }),

    asana_move_section: tool({
      description: "Move/reorder a section within a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        section_gid: z.string().describe("The GID of the section to move"),
        before_section: z
          .string()
          .optional()
          .describe("Section GID to move before"),
        after_section: z
          .string()
          .optional()
          .describe("Section GID to move after"),
      }),
      execute: async ({
        project_gid,
        section_gid,
        before_section,
        after_section,
      }) => {
        try {
          const data: any = { section: section_gid };
          if (before_section) data.before_section = before_section;
          if (after_section) data.after_section = after_section;

          await asanaRequest(
            credentials,
            `/projects/${project_gid}/sections/insert`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            { project_gid, section_gid },
            "Section moved successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to move section");
        }
      },
    }),
  };
}
