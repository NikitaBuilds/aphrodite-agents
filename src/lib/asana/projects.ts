import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Projects API Tools
 * Complete implementation of all project-related endpoints
 */

export function createProjectTools(credentials: AsanaCredentials) {
  return {
    asana_list_projects: tool({
      description:
        "List all projects in an Asana workspace or team. Returns project names, IDs, and status.",
      inputSchema: z.object({
        workspace_gid: z
          .string()
          .optional()
          .describe(
            "Workspace GID (if not provided, lists from first available workspace)"
          ),
        team_gid: z.string().optional().describe("Team GID to filter by"),
        archived: z
          .boolean()
          .optional()
          .describe("Include archived projects (default: false)"),
      }),
      execute: async ({ workspace_gid, team_gid, archived }) => {
        try {
          let workspaceId = workspace_gid;
          if (!workspaceId && !team_gid) {
            const workspaces = await asanaRequest(credentials, "/workspaces");
            workspaceId = workspaces[0]?.gid;
          }

          let endpoint =
            "/projects?opt_fields=name,archived,owner.name,due_date,current_status.title";

          if (team_gid) {
            endpoint += `&team=${team_gid}`;
          } else if (workspaceId) {
            endpoint += `&workspace=${workspaceId}`;
          }

          if (archived !== undefined) {
            endpoint += `&archived=${archived}`;
          }

          const projects = await asanaRequest(credentials, endpoint);

          return successResponse({
            count: projects.length,
            projects: projects.map((p: any) => ({
              gid: p.gid,
              name: p.name,
              archived: p.archived,
              owner: p.owner?.name,
              due_date: p.due_date,
              current_status: p.current_status?.title,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list projects");
        }
      },
    }),

    asana_get_project: tool({
      description:
        "Get detailed information about a specific Asana project including its tasks.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project to retrieve"),
        include_tasks: z
          .boolean()
          .optional()
          .describe("Include project tasks in response (default: true)"),
      }),
      execute: async ({ project_gid, include_tasks = true }) => {
        try {
          const project = await asanaRequest(
            credentials,
            `/projects/${project_gid}?opt_fields=name,archived,notes,due_date,owner.name,team.name,current_status,members.name,custom_fields`
          );

          const result: any = {
            project: {
              gid: project.gid,
              name: project.name,
              archived: project.archived,
              notes: project.notes,
              due_date: project.due_date,
              owner: project.owner?.name,
              team: project.team?.name,
              current_status: project.current_status,
              members: project.members?.map((m: any) => m.name),
            },
          };

          if (include_tasks) {
            const tasks = await asanaRequest(
              credentials,
              `/projects/${project_gid}/tasks?opt_fields=name,completed,due_on,assignee.name`
            );
            result.project.task_count = tasks.length;
            result.project.tasks = tasks.map((t: any) => ({
              gid: t.gid,
              name: t.name,
              completed: t.completed,
              due_on: t.due_on,
              assignee: t.assignee?.name,
            }));
          }

          return successResponse(result);
        } catch (error) {
          return errorResponse(error, "Failed to get project details");
        }
      },
    }),

    asana_create_project: tool({
      description: "Create a new project in a workspace or team.",
      inputSchema: z.object({
        name: z.string().describe("Project name"),
        workspace_gid: z
          .string()
          .optional()
          .describe("Workspace GID (required if team not specified)"),
        team_gid: z
          .string()
          .optional()
          .describe("Team GID (recommended over workspace)"),
        notes: z.string().optional().describe("Project description/notes"),
        due_date: z
          .string()
          .optional()
          .describe("Project due date (YYYY-MM-DD)"),
        public: z
          .boolean()
          .optional()
          .describe("Make project public to workspace/team"),
        owner: z
          .string()
          .optional()
          .describe("User GID to set as project owner"),
      }),
      execute: async ({
        name,
        workspace_gid,
        team_gid,
        notes,
        due_date,
        public: isPublic,
        owner,
      }) => {
        try {
          const projectData: any = { name };

          if (notes) projectData.notes = notes;
          if (due_date) projectData.due_date = due_date;
          if (isPublic !== undefined) projectData.public = isPublic;
          if (owner) projectData.owner = owner;

          if (team_gid) {
            projectData.team = team_gid;
          } else if (workspace_gid) {
            projectData.workspace = workspace_gid;
          } else {
            const workspaces = await asanaRequest(credentials, "/workspaces");
            projectData.workspace = workspaces[0]?.gid;
          }

          const project = await asanaRequest(credentials, "/projects", {
            method: "POST",
            body: JSON.stringify({ data: projectData }),
          });

          return successResponse(
            {
              project: {
                gid: project.gid,
                name: project.name,
                permalink_url: project.permalink_url,
              },
            },
            "Project created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create project");
        }
      },
    }),

    asana_update_project: tool({
      description: "Update an existing project's properties.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project to update"),
        name: z.string().optional().describe("New project name"),
        notes: z.string().optional().describe("New project description"),
        due_date: z
          .string()
          .optional()
          .describe("New due date (YYYY-MM-DD) or null to clear"),
        archived: z
          .boolean()
          .optional()
          .describe("Archive or unarchive project"),
        public: z.boolean().optional().describe("Change public/private status"),
        owner: z.string().optional().describe("New owner user GID"),
      }),
      execute: async ({
        project_gid,
        name,
        notes,
        due_date,
        archived,
        public: isPublic,
        owner,
      }) => {
        try {
          const projectData: any = {};

          if (name !== undefined) projectData.name = name;
          if (notes !== undefined) projectData.notes = notes;
          if (due_date !== undefined) projectData.due_date = due_date;
          if (archived !== undefined) projectData.archived = archived;
          if (isPublic !== undefined) projectData.public = isPublic;
          if (owner !== undefined) projectData.owner = owner;

          const project = await asanaRequest(
            credentials,
            `/projects/${project_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({ data: projectData }),
            }
          );

          return successResponse(
            {
              project: {
                gid: project.gid,
                name: project.name,
                archived: project.archived,
              },
            },
            "Project updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update project");
        }
      },
    }),

    asana_delete_project: tool({
      description: "Delete a project permanently from Asana.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project to delete"),
      }),
      execute: async ({ project_gid }) => {
        try {
          await asanaRequest(credentials, `/projects/${project_gid}`, {
            method: "DELETE",
          });

          return successResponse(
            { project_gid },
            "Project deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete project");
        }
      },
    }),

    asana_duplicate_project: tool({
      description:
        "Duplicate an existing project with optional elements to include.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project to duplicate"),
        name: z.string().describe("Name for the duplicated project"),
        team_gid: z.string().optional().describe("Team to create project in"),
        include: z
          .array(
            z.enum([
              "forms",
              "notes",
              "task_notes",
              "task_assignee",
              "task_subtasks",
              "task_attachments",
              "task_dates",
              "task_dependencies",
              "task_followers",
              "task_tags",
              "task_projects",
            ])
          )
          .optional()
          .describe("Elements to include in duplication"),
      }),
      execute: async ({ project_gid, name, team_gid, include }) => {
        try {
          const data: any = { name };
          if (team_gid) data.team = team_gid;
          if (include) data.include = include.join(",");

          const job = await asanaRequest(
            credentials,
            `/projects/${project_gid}/duplicate`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              job_gid: job.gid,
              new_project_gid: job.new_project?.gid,
            },
            "Project duplication initiated"
          );
        } catch (error) {
          return errorResponse(error, "Failed to duplicate project");
        }
      },
    }),

    asana_add_members_to_project: tool({
      description: "Add members to a project to give them access.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        members: z
          .array(z.string())
          .describe("Array of user GIDs or emails to add as members"),
      }),
      execute: async ({ project_gid, members }) => {
        try {
          await asanaRequest(
            credentials,
            `/projects/${project_gid}/addMembers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { members },
              }),
            }
          );

          return successResponse(
            { project_gid, members },
            "Members added successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add members to project");
        }
      },
    }),

    asana_remove_members_from_project: tool({
      description: "Remove members from a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        members: z
          .array(z.string())
          .describe("Array of user GIDs to remove as members"),
      }),
      execute: async ({ project_gid, members }) => {
        try {
          await asanaRequest(
            credentials,
            `/projects/${project_gid}/removeMembers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { members },
              }),
            }
          );

          return successResponse(
            { project_gid, members },
            "Members removed successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove members from project");
        }
      },
    }),

    asana_add_followers_to_project: tool({
      description: "Add followers to a project to receive notifications.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        followers: z
          .array(z.string())
          .describe("Array of user GIDs or emails to add as followers"),
      }),
      execute: async ({ project_gid, followers }) => {
        try {
          await asanaRequest(
            credentials,
            `/projects/${project_gid}/addFollowers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { followers },
              }),
            }
          );

          return successResponse(
            { project_gid, followers },
            "Followers added successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add followers to project");
        }
      },
    }),

    asana_remove_followers_from_project: tool({
      description: "Remove followers from a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        followers: z
          .array(z.string())
          .describe("Array of user GIDs to remove as followers"),
      }),
      execute: async ({ project_gid, followers }) => {
        try {
          await asanaRequest(
            credentials,
            `/projects/${project_gid}/removeFollowers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { followers },
              }),
            }
          );

          return successResponse(
            { project_gid, followers },
            "Followers removed successfully"
          );
        } catch (error) {
          return errorResponse(
            error,
            "Failed to remove followers from project"
          );
        }
      },
    }),

    asana_get_task_counts: tool({
      description: "Get task count statistics for a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
      }),
      execute: async ({ project_gid }) => {
        try {
          const counts = await asanaRequest(
            credentials,
            `/projects/${project_gid}/task_counts`
          );

          return successResponse({
            project_gid,
            counts: {
              num_tasks: counts.num_tasks,
              num_incomplete_tasks: counts.num_incomplete_tasks,
              num_completed_tasks: counts.num_completed_tasks,
              num_milestones: counts.num_milestones,
              num_incomplete_milestones: counts.num_incomplete_milestones,
              num_completed_milestones: counts.num_completed_milestones,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get task counts");
        }
      },
    }),

    asana_save_project_as_template: tool({
      description: "Create a project template from an existing project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project to convert"),
        name: z.string().describe("Name for the project template"),
        team_gid: z
          .string()
          .describe("Team GID where the template will be available"),
        public: z
          .boolean()
          .optional()
          .describe("Make template public to the team"),
      }),
      execute: async ({ project_gid, name, team_gid, public: isPublic }) => {
        try {
          const data: any = { name, team: team_gid };
          if (isPublic !== undefined) data.public = isPublic;

          const template = await asanaRequest(
            credentials,
            `/projects/${project_gid}/saveAsTemplate`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              template: {
                gid: template.gid,
                name: template.name,
              },
            },
            "Project template created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create project template");
        }
      },
    }),

    asana_add_custom_field_to_project: tool({
      description: "Add a custom field to a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        custom_field_gid: z.string().describe("The GID of the custom field"),
        is_important: z
          .boolean()
          .optional()
          .describe("Mark as important field"),
        insert_before: z
          .string()
          .optional()
          .describe("Custom field GID to insert before"),
        insert_after: z
          .string()
          .optional()
          .describe("Custom field GID to insert after"),
      }),
      execute: async ({
        project_gid,
        custom_field_gid,
        is_important,
        insert_before,
        insert_after,
      }) => {
        try {
          const data: any = { custom_field: custom_field_gid };
          if (is_important !== undefined) data.is_important = is_important;
          if (insert_before) data.insert_before = insert_before;
          if (insert_after) data.insert_after = insert_after;

          await asanaRequest(
            credentials,
            `/projects/${project_gid}/addCustomFieldSetting`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            { project_gid, custom_field_gid },
            "Custom field added to project"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add custom field to project");
        }
      },
    }),

    asana_remove_custom_field_from_project: tool({
      description: "Remove a custom field from a project.",
      inputSchema: z.object({
        project_gid: z.string().describe("The GID of the project"),
        custom_field_gid: z.string().describe("The GID of the custom field"),
      }),
      execute: async ({ project_gid, custom_field_gid }) => {
        try {
          await asanaRequest(
            credentials,
            `/projects/${project_gid}/removeCustomFieldSetting`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { custom_field: custom_field_gid },
              }),
            }
          );

          return successResponse(
            { project_gid, custom_field_gid },
            "Custom field removed from project"
          );
        } catch (error) {
          return errorResponse(
            error,
            "Failed to remove custom field from project"
          );
        }
      },
    }),
  };
}
