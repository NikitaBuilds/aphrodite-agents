import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Tasks API Tools
 * Complete implementation of all task-related endpoints
 */

export function createTaskTools(credentials: AsanaCredentials) {
  return {
    asana_list_tasks: tool({
      description:
        "List tasks assigned to the user or in a specific project/workspace. Supports filtering by completion status.",
      inputSchema: z.object({
        project_gid: z
          .string()
          .optional()
          .describe("Filter by project GID (optional)"),
        workspace_gid: z
          .string()
          .optional()
          .describe("Filter by workspace GID (optional)"),
        assignee: z
          .enum(["me"])
          .optional()
          .describe('Use "me" to get tasks assigned to you'),
        completed: z
          .boolean()
          .optional()
          .describe("Filter by completion status (true/false)"),
      }),
      execute: async ({ project_gid, workspace_gid, assignee, completed }) => {
        try {
          let endpoint =
            "/tasks?opt_fields=name,completed,due_on,projects.name,notes,assignee.name";

          if (assignee === "me") {
            endpoint += "&assignee=me";
          }

          if (project_gid) {
            endpoint += `&project=${project_gid}`;
          } else if (workspace_gid) {
            endpoint += `&workspace=${workspace_gid}`;
          } else {
            const workspaces = await asanaRequest(credentials, "/workspaces");
            endpoint += `&workspace=${workspaces[0]?.gid}`;
          }

          if (completed !== undefined) {
            endpoint += `&completed=${completed}`;
          }

          const tasks = await asanaRequest(credentials, endpoint);

          return successResponse({
            count: tasks.length,
            tasks: tasks.map((t: any) => ({
              gid: t.gid,
              name: t.name,
              completed: t.completed,
              due_on: t.due_on,
              assignee: t.assignee?.name,
              projects: t.projects?.map((p: any) => p.name),
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list tasks");
        }
      },
    }),

    asana_get_task: tool({
      description:
        "Get detailed information about a specific Asana task including all fields.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task to retrieve"),
      }),
      execute: async ({ task_gid }) => {
        try {
          const task = await asanaRequest(
            credentials,
            `/tasks/${task_gid}?opt_fields=name,notes,completed,due_on,assignee.name,projects.name,created_at,modified_at,tags.name,custom_fields`
          );

          return successResponse({
            task: {
              gid: task.gid,
              name: task.name,
              notes: task.notes,
              completed: task.completed,
              due_on: task.due_on,
              assignee: task.assignee?.name,
              projects: task.projects?.map((p: any) => p.name),
              tags: task.tags?.map((t: any) => t.name),
              created_at: task.created_at,
              modified_at: task.modified_at,
              permalink_url: `https://app.asana.com/0/0/${task.gid}`,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get task");
        }
      },
    }),

    asana_create_task: tool({
      description:
        "Create a new task in Asana. Can be added to a project or directly to a workspace.",
      inputSchema: z.object({
        name: z.string().describe("Task name/title"),
        notes: z.string().optional().describe("Task description/notes"),
        project_gid: z
          .string()
          .optional()
          .describe("Project GID to add task to (recommended)"),
        workspace_gid: z
          .string()
          .optional()
          .describe("Workspace GID (required if no project specified)"),
        due_on: z.string().optional().describe("Due date in YYYY-MM-DD format"),
        assignee: z
          .string()
          .optional()
          .describe("Email or GID of person to assign task to"),
      }),
      execute: async ({
        name,
        notes,
        project_gid,
        workspace_gid,
        due_on,
        assignee,
      }) => {
        try {
          const taskData: any = { name };

          if (notes) taskData.notes = notes;
          if (due_on) taskData.due_on = due_on;
          if (assignee) taskData.assignee = assignee;

          if (project_gid) {
            taskData.projects = [project_gid];
          } else if (workspace_gid) {
            taskData.workspace = workspace_gid;
          } else {
            const workspaces = await asanaRequest(credentials, "/workspaces");
            taskData.workspace = workspaces[0]?.gid;
          }

          const task = await asanaRequest(credentials, "/tasks", {
            method: "POST",
            body: JSON.stringify({ data: taskData }),
          });

          return successResponse(
            {
              task: {
                gid: task.gid,
                name: task.name,
                permalink_url: task.permalink_url,
              },
            },
            "Task created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create task");
        }
      },
    }),

    asana_update_task: tool({
      description:
        "Update an existing Asana task (mark complete, change name, notes, due date, etc).",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task to update"),
        name: z.string().optional().describe("New task name"),
        notes: z.string().optional().describe("New task notes/description"),
        completed: z.boolean().optional().describe("Mark task as completed"),
        due_on: z.string().optional().describe("New due date (YYYY-MM-DD)"),
        assignee: z.string().optional().describe("New assignee email or GID"),
      }),
      execute: async ({
        task_gid,
        name,
        notes,
        completed,
        due_on,
        assignee,
      }) => {
        try {
          const taskData: any = {};

          if (name !== undefined) taskData.name = name;
          if (notes !== undefined) taskData.notes = notes;
          if (completed !== undefined) taskData.completed = completed;
          if (due_on !== undefined) taskData.due_on = due_on;
          if (assignee !== undefined) taskData.assignee = assignee;

          const task = await asanaRequest(credentials, `/tasks/${task_gid}`, {
            method: "PUT",
            body: JSON.stringify({ data: taskData }),
          });

          return successResponse(
            {
              task: {
                gid: task.gid,
                name: task.name,
                completed: task.completed,
              },
            },
            "Task updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update task");
        }
      },
    }),

    asana_delete_task: tool({
      description: "Delete a task permanently from Asana.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task to delete"),
      }),
      execute: async ({ task_gid }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}`, {
            method: "DELETE",
          });

          return successResponse({ task_gid }, "Task deleted successfully");
        } catch (error) {
          return errorResponse(error, "Failed to delete task");
        }
      },
    }),

    asana_duplicate_task: tool({
      description:
        "Duplicate an existing task with optional fields to include.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task to duplicate"),
        name: z.string().optional().describe("Name for the duplicated task"),
        include: z
          .array(
            z.enum([
              "notes",
              "assignee",
              "subtasks",
              "attachments",
              "tags",
              "followers",
              "projects",
              "dates",
            ])
          )
          .optional()
          .describe("Fields to include in duplication"),
      }),
      execute: async ({ task_gid, name, include }) => {
        try {
          const data: any = {};
          if (name) data.name = name;
          if (include) data.include = include.join(",");

          const job = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/duplicate`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              job_gid: job.gid,
              new_task_gid: job.new_task?.gid,
            },
            "Task duplication initiated"
          );
        } catch (error) {
          return errorResponse(error, "Failed to duplicate task");
        }
      },
    }),

    asana_search_tasks: tool({
      description:
        "Search for tasks in a workspace using advanced filters and sorting.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("Workspace GID to search in"),
        text: z.string().optional().describe("Text to search for"),
        assignee_any: z
          .string()
          .optional()
          .describe("Comma-separated list of user GIDs"),
        projects_any: z
          .string()
          .optional()
          .describe("Comma-separated list of project GIDs"),
        completed: z.boolean().optional().describe("Filter by completion"),
        modified_since: z
          .string()
          .optional()
          .describe("ISO 8601 date for modified since filter"),
      }),
      execute: async ({
        workspace_gid,
        text,
        assignee_any,
        projects_any,
        completed,
        modified_since,
      }) => {
        try {
          let endpoint = `/workspaces/${workspace_gid}/tasks/search?opt_fields=name,completed,due_on,assignee.name`;

          if (text) endpoint += `&text=${encodeURIComponent(text)}`;
          if (assignee_any) endpoint += `&assignee.any=${assignee_any}`;
          if (projects_any) endpoint += `&projects.any=${projects_any}`;
          if (completed !== undefined) endpoint += `&completed=${completed}`;
          if (modified_since)
            endpoint += `&modified_since=${encodeURIComponent(modified_since)}`;

          const tasks = await asanaRequest(credentials, endpoint);

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
          return errorResponse(error, "Failed to search tasks");
        }
      },
    }),

    asana_get_subtasks: tool({
      description: "Get all subtasks of a specific task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the parent task"),
      }),
      execute: async ({ task_gid }) => {
        try {
          const subtasks = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/subtasks?opt_fields=name,completed,due_on,assignee.name`
          );

          return successResponse({
            count: subtasks.length,
            subtasks: subtasks.map((t: any) => ({
              gid: t.gid,
              name: t.name,
              completed: t.completed,
              due_on: t.due_on,
              assignee: t.assignee?.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get subtasks");
        }
      },
    }),

    asana_create_subtask: tool({
      description: "Create a new subtask under an existing task.",
      inputSchema: z.object({
        parent_task_gid: z.string().describe("The GID of the parent task"),
        name: z.string().describe("Subtask name/title"),
        notes: z.string().optional().describe("Subtask description/notes"),
        due_on: z.string().optional().describe("Due date in YYYY-MM-DD format"),
        assignee: z
          .string()
          .optional()
          .describe("Email or GID of person to assign subtask to"),
      }),
      execute: async ({ parent_task_gid, name, notes, due_on, assignee }) => {
        try {
          const taskData: any = { name };

          if (notes) taskData.notes = notes;
          if (due_on) taskData.due_on = due_on;
          if (assignee) taskData.assignee = assignee;

          const subtask = await asanaRequest(
            credentials,
            `/tasks/${parent_task_gid}/subtasks`,
            {
              method: "POST",
              body: JSON.stringify({ data: taskData }),
            }
          );

          return successResponse(
            {
              subtask: {
                gid: subtask.gid,
                name: subtask.name,
                permalink_url: subtask.permalink_url,
              },
            },
            "Subtask created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create subtask");
        }
      },
    }),

    asana_set_parent_task: tool({
      description:
        "Change the parent of a task (convert to subtask or move subtask).",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task to modify"),
        parent_gid: z
          .string()
          .describe(
            "The GID of the new parent task (or null to remove parent)"
          ),
      }),
      execute: async ({ task_gid, parent_gid }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}/setParent`, {
            method: "POST",
            body: JSON.stringify({
              data: { parent: parent_gid },
            }),
          });

          return successResponse(
            { task_gid, parent_gid },
            "Parent task updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to set parent task");
        }
      },
    }),

    asana_get_dependencies: tool({
      description: "Get all tasks that must be completed before this task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
      }),
      execute: async ({ task_gid }) => {
        try {
          const dependencies = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/dependencies?opt_fields=name,completed,due_on`
          );

          return successResponse({
            count: dependencies.length,
            dependencies: dependencies.map((t: any) => ({
              gid: t.gid,
              name: t.name,
              completed: t.completed,
              due_on: t.due_on,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get dependencies");
        }
      },
    }),

    asana_add_dependencies: tool({
      description:
        "Set tasks that must be completed before this task can start.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        dependencies: z
          .array(z.string())
          .describe("Array of task GIDs that must be completed first"),
      }),
      execute: async ({ task_gid, dependencies }) => {
        try {
          await asanaRequest(
            credentials,
            `/tasks/${task_gid}/addDependencies`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { dependencies },
              }),
            }
          );

          return successResponse(
            { task_gid, dependencies },
            "Dependencies added successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add dependencies");
        }
      },
    }),

    asana_remove_dependencies: tool({
      description: "Remove dependency relationships from a task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        dependencies: z
          .array(z.string())
          .describe("Array of task GIDs to remove as dependencies"),
      }),
      execute: async ({ task_gid, dependencies }) => {
        try {
          await asanaRequest(
            credentials,
            `/tasks/${task_gid}/removeDependencies`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { dependencies },
              }),
            }
          );

          return successResponse(
            { task_gid, dependencies },
            "Dependencies removed successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove dependencies");
        }
      },
    }),

    asana_get_dependents: tool({
      description:
        "Get all tasks that depend on this task being completed first.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
      }),
      execute: async ({ task_gid }) => {
        try {
          const dependents = await asanaRequest(
            credentials,
            `/tasks/${task_gid}/dependents?opt_fields=name,completed,due_on`
          );

          return successResponse({
            count: dependents.length,
            dependents: dependents.map((t: any) => ({
              gid: t.gid,
              name: t.name,
              completed: t.completed,
              due_on: t.due_on,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get dependents");
        }
      },
    }),

    asana_add_dependents: tool({
      description: "Set tasks that cannot start until this task is completed.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        dependents: z
          .array(z.string())
          .describe("Array of task GIDs that depend on this task"),
      }),
      execute: async ({ task_gid, dependents }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}/addDependents`, {
            method: "POST",
            body: JSON.stringify({
              data: { dependents },
            }),
          });

          return successResponse(
            { task_gid, dependents },
            "Dependents added successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add dependents");
        }
      },
    }),

    asana_remove_dependents: tool({
      description: "Remove dependent relationships from a task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        dependents: z
          .array(z.string())
          .describe("Array of task GIDs to remove as dependents"),
      }),
      execute: async ({ task_gid, dependents }) => {
        try {
          await asanaRequest(
            credentials,
            `/tasks/${task_gid}/removeDependents`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { dependents },
              }),
            }
          );

          return successResponse(
            { task_gid, dependents },
            "Dependents removed successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove dependents");
        }
      },
    }),

    asana_add_project_to_task: tool({
      description: "Add a task to an additional project.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        project_gid: z.string().describe("The GID of the project to add"),
        section_gid: z
          .string()
          .optional()
          .describe("Optional section GID within the project"),
      }),
      execute: async ({ task_gid, project_gid, section_gid }) => {
        try {
          const data: any = { project: project_gid };
          if (section_gid) data.section = section_gid;

          await asanaRequest(credentials, `/tasks/${task_gid}/addProject`, {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            { task_gid, project_gid, section_gid },
            "Task added to project successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add project to task");
        }
      },
    }),

    asana_remove_project_from_task: tool({
      description: "Remove a task from a project.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        project_gid: z.string().describe("The GID of the project to remove"),
      }),
      execute: async ({ task_gid, project_gid }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}/removeProject`, {
            method: "POST",
            body: JSON.stringify({
              data: { project: project_gid },
            }),
          });

          return successResponse(
            { task_gid, project_gid },
            "Task removed from project successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove project from task");
        }
      },
    }),

    asana_add_tag_to_task: tool({
      description: "Add a tag to a task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        tag_gid: z.string().describe("The GID of the tag to add"),
      }),
      execute: async ({ task_gid, tag_gid }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}/addTag`, {
            method: "POST",
            body: JSON.stringify({
              data: { tag: tag_gid },
            }),
          });

          return successResponse(
            { task_gid, tag_gid },
            "Tag added to task successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add tag to task");
        }
      },
    }),

    asana_remove_tag_from_task: tool({
      description: "Remove a tag from a task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        tag_gid: z.string().describe("The GID of the tag to remove"),
      }),
      execute: async ({ task_gid, tag_gid }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}/removeTag`, {
            method: "POST",
            body: JSON.stringify({
              data: { tag: tag_gid },
            }),
          });

          return successResponse(
            { task_gid, tag_gid },
            "Tag removed from task successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove tag from task");
        }
      },
    }),

    asana_add_followers_to_task: tool({
      description:
        "Add followers to a task to receive notifications about changes.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        followers: z
          .array(z.string())
          .describe("Array of user GIDs or emails to add as followers"),
      }),
      execute: async ({ task_gid, followers }) => {
        try {
          await asanaRequest(credentials, `/tasks/${task_gid}/addFollowers`, {
            method: "POST",
            body: JSON.stringify({
              data: { followers },
            }),
          });

          return successResponse(
            { task_gid, followers },
            "Followers added successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add followers");
        }
      },
    }),

    asana_remove_follower_from_task: tool({
      description: "Remove a follower from a task.",
      inputSchema: z.object({
        task_gid: z.string().describe("The GID of the task"),
        followers: z
          .array(z.string())
          .describe("Array of user GIDs to remove as followers"),
      }),
      execute: async ({ task_gid, followers }) => {
        try {
          await asanaRequest(
            credentials,
            `/tasks/${task_gid}/removeFollowers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { followers },
              }),
            }
          );

          return successResponse(
            { task_gid, followers },
            "Followers removed successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove followers");
        }
      },
    }),

    asana_get_task_by_custom_id: tool({
      description: "Find a task by its custom external ID.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The workspace GID"),
        custom_id: z.string().describe("The custom external ID to search for"),
      }),
      execute: async ({ workspace_gid, custom_id }) => {
        try {
          const task = await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}/tasks/custom_id/${custom_id}?opt_fields=name,completed,due_on,assignee.name`
          );

          return successResponse({
            task: {
              gid: task.gid,
              name: task.name,
              completed: task.completed,
              due_on: task.due_on,
              assignee: task.assignee?.name,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get task by custom ID");
        }
      },
    }),
  };
}
