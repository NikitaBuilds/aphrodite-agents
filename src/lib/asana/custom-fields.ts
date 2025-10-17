import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Custom Fields API Tools
 * Complete implementation of custom field endpoints
 */

export function createCustomFieldTools(credentials: AsanaCredentials) {
  return {
    asana_list_custom_fields: tool({
      description: "List all custom fields in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
      }),
      execute: async ({ workspace_gid }) => {
        try {
          const fields = await asanaRequest(
            credentials,
            `/workspaces/${workspace_gid}/custom_fields?opt_fields=name,type,resource_subtype`
          );

          return successResponse({
            count: fields.length,
            custom_fields: fields.map((f: any) => ({
              gid: f.gid,
              name: f.name,
              type: f.type,
              resource_subtype: f.resource_subtype,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list custom fields");
        }
      },
    }),

    asana_get_custom_field: tool({
      description: "Get details of a specific custom field.",
      inputSchema: z.object({
        custom_field_gid: z.string().describe("The GID of the custom field"),
      }),
      execute: async ({ custom_field_gid }) => {
        try {
          const field = await asanaRequest(
            credentials,
            `/custom_fields/${custom_field_gid}?opt_fields=name,type,resource_subtype,enum_options,precision,description`
          );

          return successResponse({
            custom_field: {
              gid: field.gid,
              name: field.name,
              type: field.type,
              resource_subtype: field.resource_subtype,
              description: field.description,
              enum_options: field.enum_options,
              precision: field.precision,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get custom field");
        }
      },
    }),

    asana_create_custom_field: tool({
      description:
        "Create a new custom field in a workspace (text, number, enum, etc).",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        name: z.string().describe("Custom field name"),
        resource_subtype: z
          .enum(["text", "number", "enum", "multi_enum", "date", "people"])
          .describe("Type of custom field"),
        description: z.string().optional().describe("Field description"),
        precision: z
          .number()
          .optional()
          .describe("Decimal precision for number fields"),
        enum_options: z
          .array(
            z.object({
              name: z.string(),
              color: z.string().optional(),
              enabled: z.boolean().optional(),
            })
          )
          .optional()
          .describe("Options for enum/multi_enum fields"),
      }),
      execute: async ({
        workspace_gid,
        name,
        resource_subtype,
        description,
        precision,
        enum_options,
      }) => {
        try {
          const data: any = {
            name,
            resource_subtype,
            workspace: workspace_gid,
          };

          if (description) data.description = description;
          if (precision !== undefined) data.precision = precision;
          if (enum_options) data.enum_options = enum_options;

          const field = await asanaRequest(credentials, "/custom_fields", {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              custom_field: {
                gid: field.gid,
                name: field.name,
                resource_subtype: field.resource_subtype,
              },
            },
            "Custom field created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create custom field");
        }
      },
    }),

    asana_update_custom_field: tool({
      description: "Update a custom field's properties.",
      inputSchema: z.object({
        custom_field_gid: z.string().describe("The GID of the custom field"),
        name: z.string().optional().describe("New field name"),
        description: z.string().optional().describe("New field description"),
        precision: z
          .number()
          .optional()
          .describe("New decimal precision for number fields"),
      }),
      execute: async ({ custom_field_gid, name, description, precision }) => {
        try {
          const data: any = {};

          if (name !== undefined) data.name = name;
          if (description !== undefined) data.description = description;
          if (precision !== undefined) data.precision = precision;

          const field = await asanaRequest(
            credentials,
            `/custom_fields/${custom_field_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              custom_field: {
                gid: field.gid,
                name: field.name,
              },
            },
            "Custom field updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update custom field");
        }
      },
    }),

    asana_delete_custom_field: tool({
      description: "Delete a custom field from the workspace.",
      inputSchema: z.object({
        custom_field_gid: z.string().describe("The GID of the custom field"),
      }),
      execute: async ({ custom_field_gid }) => {
        try {
          await asanaRequest(
            credentials,
            `/custom_fields/${custom_field_gid}`,
            {
              method: "DELETE",
            }
          );

          return successResponse(
            { custom_field_gid },
            "Custom field deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete custom field");
        }
      },
    }),

    asana_create_enum_option: tool({
      description: "Add a new option to an enum custom field.",
      inputSchema: z.object({
        custom_field_gid: z.string().describe("The GID of the custom field"),
        name: z.string().describe("Option name"),
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
          .describe("Option color"),
        insert_before: z
          .string()
          .optional()
          .describe("Option GID to insert before"),
        insert_after: z
          .string()
          .optional()
          .describe("Option GID to insert after"),
      }),
      execute: async ({
        custom_field_gid,
        name,
        color,
        insert_before,
        insert_after,
      }) => {
        try {
          const data: any = { name };
          if (color) data.color = color;
          if (insert_before) data.insert_before = insert_before;
          if (insert_after) data.insert_after = insert_after;

          const option = await asanaRequest(
            credentials,
            `/custom_fields/${custom_field_gid}/enum_options`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              enum_option: {
                gid: option.gid,
                name: option.name,
              },
            },
            "Enum option created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create enum option");
        }
      },
    }),

    asana_update_enum_option: tool({
      description: "Update an enum option's properties.",
      inputSchema: z.object({
        enum_option_gid: z.string().describe("The GID of the enum option"),
        name: z.string().optional().describe("New option name"),
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
          .describe("New option color"),
        enabled: z.boolean().optional().describe("Enable or disable option"),
      }),
      execute: async ({ enum_option_gid, name, color, enabled }) => {
        try {
          const data: any = {};
          if (name !== undefined) data.name = name;
          if (color !== undefined) data.color = color;
          if (enabled !== undefined) data.enabled = enabled;

          const option = await asanaRequest(
            credentials,
            `/enum_options/${enum_option_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              enum_option: {
                gid: option.gid,
                name: option.name,
              },
            },
            "Enum option updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update enum option");
        }
      },
    }),

    asana_reorder_enum_options: tool({
      description: "Reorder enum options in a custom field.",
      inputSchema: z.object({
        custom_field_gid: z.string().describe("The GID of the custom field"),
        enum_option_gid: z.string().describe("The GID of the option to move"),
        before_enum_option: z
          .string()
          .optional()
          .describe("Option GID to move before"),
        after_enum_option: z
          .string()
          .optional()
          .describe("Option GID to move after"),
      }),
      execute: async ({
        custom_field_gid,
        enum_option_gid,
        before_enum_option,
        after_enum_option,
      }) => {
        try {
          const data: any = { enum_option: enum_option_gid };
          if (before_enum_option) data.before_enum_option = before_enum_option;
          if (after_enum_option) data.after_enum_option = after_enum_option;

          await asanaRequest(
            credentials,
            `/custom_fields/${custom_field_gid}/enum_options/insert`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            { custom_field_gid, enum_option_gid },
            "Enum options reordered successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to reorder enum options");
        }
      },
    }),
  };
}
