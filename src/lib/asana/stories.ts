import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Stories (Comments) API Tools
 * Complete implementation of story/comment endpoints
 */

export function createStoryTools(credentials: AsanaCredentials) {
  return {
    asana_get_stories_for_task: tool({
      description: "Get all comments and activity stories for a task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
      }),
      execute: async ({ task_gid }) => {
        try {
          const stories = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/stories?opt_fields=text,created_by.name,created_at,type`
          );

          return successResponse({
            count: stories.length,
            stories: stories.map((s: any) => ({
              gid: s.gid,
              text: s.text,
              type: s.type,
              created_by: s.created_by?.name,
              created_at: s.created_at,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get stories");
        }
      },
    }),

    asana_add_comment: tool({
      description: "Add a comment to an Asana task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task to comment on"),
        text: z.string().describe("The comment text to add"),
      }),
      execute: async ({ task_gid, text }) => {
        try {
          const story = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/stories`,
            {
              method: "POST",
              body: JSON.stringify({
                data: {
                  text,
                },
              }),
            }
          );

          return successResponse(
            {
              comment: {
                gid: story.gid,
                text: story.text,
                created_at: story.created_at,
              },
            },
            "Comment added successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add comment");
        }
      },
    }),

    asana_get_story: tool({
      description: "Get details of a specific story/comment.",
      inputSchema: z.object({
        story_gid: z.string().describe("The GID of the story"),
      }),
      execute: async ({ story_gid }) => {
        try {
          const story = await asanaRequest(
            credentials,
            `/stories/${story_gid}?opt_fields=text,created_by.name,created_at,type,task`
          );

          return successResponse({
            story: {
              gid: story.gid,
              text: story.text,
              type: story.type,
              created_by: story.created_by?.name,
              created_at: story.created_at,
              task: story.task,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get story");
        }
      },
    }),

    asana_update_story: tool({
      description: "Update the text of a comment/story.",
      inputSchema: z.object({
        story_gid: z.string().describe("The GID of the story"),
        text: z.string().describe("New comment text"),
      }),
      execute: async ({ story_gid, text }) => {
        try {
          const story = await asanaRequest(
            credentials,
            `/stories/${story_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({
                data: { text },
              }),
            }
          );

          return successResponse(
            {
              story: {
                gid: story.gid,
                text: story.text,
              },
            },
            "Comment updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update story");
        }
      },
    }),

    asana_delete_story: tool({
      description: "Delete a comment/story from a task.",
      inputSchema: z.object({
        story_gid: z.string().describe("The GID of the story to delete"),
      }),
      execute: async ({ story_gid }) => {
        try {
          await asanaRequest(credentials, `/stories/${story_gid}`, {
            method: "DELETE",
          });

          return successResponse({ story_gid }, "Comment deleted successfully");
        } catch (error) {
          return errorResponse(error, "Failed to delete story");
        }
      },
    }),
  };
}
