import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Tags API Tools
 * Complete implementation of tag endpoints
 */

export function createTagTools(credentials: AsanaCredentials) {
  return {
    asana_list_tags: tool({
      description: "List all tags in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
      }),
      execute: async ({ workspace_gid }) => {
        try {
          const tags = await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}/tags`
          );

          return successResponse({
            count: tags.length,
            tags: tags.map((t: any) => ({
              gid: t.gid,
              name: t.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list tags");
        }
      },
    }),

    asana_get_tag: tool({
      description: "Get detailed information about a specific tag.",
      inputSchema: z.object({
        tag_gid: z.string().describe("The GID of the tag"),
      }),
      execute: async ({ tag_gid }) => {
        try {
          const tag = await asanaRequest(
            credentials,
            `/tags/${tag_gid}?opt_fields=name,color,notes,workspace.name`
          );

          return successResponse({
            tag: {
              gid: tag.gid,
              name: tag.name,
              color: tag.color,
              notes: tag.notes,
              workspace: tag.workspace?.name,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get tag");
        }
      },
    }),

    asana_create_tag: tool({
      description: "Create a new tag in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        name: z.string().describe("Tag name"),
        color: z
          .enum([
            "dark-pink",
            "dark-green",
            "dark-blue",
            "dark-red",
            "dark-teal",
            "dark-brown",
            "dark-orange",
            "dark-purple",
            "dark-warm-gray",
            "light-pink",
            "light-green",
            "light-blue",
            "light-red",
            "light-teal",
            "light-brown",
            "light-orange",
            "light-purple",
            "light-warm-gray",
          ])
          .optional()
          .describe("Tag color"),
        notes: z.string().optional().describe("Tag description"),
      }),
      execute: async ({ workspace_gid, name, color, notes }) => {
        try {
          const data: any = {
            name,
            workspace: workspace_gid,
          };
          if (color) data.color = color;
          if (notes) data.notes = notes;

          const tag = await asanaRequest(credentials, "/tags", {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              tag: {
                gid: tag.gid,
                name: tag.name,
                color: tag.color,
              },
            },
            "Tag created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create tag");
        }
      },
    }),

    asana_update_tag: tool({
      description: "Update a tag's name, color, or notes.",
      inputSchema: z.object({
        tag_gid: z.string().describe("The GID of the tag"),
        name: z.string().optional().describe("New tag name"),
        color: z
          .enum([
            "dark-pink",
            "dark-green",
            "dark-blue",
            "dark-red",
            "dark-teal",
            "dark-brown",
            "dark-orange",
            "dark-purple",
            "dark-warm-gray",
            "light-pink",
            "light-green",
            "light-blue",
            "light-red",
            "light-teal",
            "light-brown",
            "light-orange",
            "light-purple",
            "light-warm-gray",
          ])
          .optional()
          .describe("New tag color"),
        notes: z.string().optional().describe("New tag description"),
      }),
      execute: async ({ tag_gid, name, color, notes }) => {
        try {
          const data: any = {};
          if (name !== undefined) data.name = name;
          if (color !== undefined) data.color = color;
          if (notes !== undefined) data.notes = notes;

          const tag = await asanaRequest(credentials, `/tags/${tag_gid}`, {
            method: "PUT",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              tag: {
                gid: tag.gid,
                name: tag.name,
                color: tag.color,
              },
            },
            "Tag updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update tag");
        }
      },
    }),

    asana_delete_tag: tool({
      description: "Delete a tag from the workspace.",
      inputSchema: z.object({
        tag_gid: z.string().describe("The GID of the tag to delete"),
      }),
      execute: async ({ tag_gid }) => {
        try {
          await asanaRequest(credentials, `/tags/${tag_gid}`, {
            method: "DELETE",
          });

          return successResponse({ tag_gid }, "Tag deleted successfully");
        } catch (error) {
          return errorResponse(error, "Failed to delete tag");
        }
      },
    }),

    asana_get_tasks_with_tag: tool({
      description: "Get all tasks that have a specific tag.",
      inputSchema: z.object({
        tag_gid: z.string().describe("The GID of the tag"),
      }),
      execute: async ({ tag_gid }) => {
        try {
          const tasks = await asanaRequest(
            credentials,
            `/tags/${tag_gid}/tasks?opt_fields=name,completed,due_on,assignee.name`
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
          return errorResponse(error, "Failed to get tasks with tag");
        }
      },
    }),
  };
}
