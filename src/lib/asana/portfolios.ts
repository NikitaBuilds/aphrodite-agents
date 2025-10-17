import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Portfolios API Tools
 * Complete implementation of portfolio-related endpoints
 */

export function createPortfolioTools(credentials: AsanaCredentials) {
  return {
    asana_list_portfolios: tool({
      description: "List all portfolios in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        owner: z
          .string()
          .optional()
          .describe("User GID to filter portfolios by owner"),
      }),
      execute: async ({ workspace_gid, owner }) => {
        try {
          let endpoint = `/portfolios?workspace=${workspace_gid}&opt_fields=name,color,owner.name`;

          if (owner) endpoint += `&owner=${owner}`;

          const portfolios = await asanaRequest(credentials, endpoint);

          return successResponse({
            count: portfolios.length,
            portfolios: portfolios.map((p: any) => ({
              gid: p.gid,
              name: p.name,
              color: p.color,
              owner: p.owner?.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to list portfolios");
        }
      },
    }),

    asana_get_portfolio: tool({
      description: "Get detailed information about a portfolio.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
      }),
      execute: async ({ portfolio_gid }) => {
        try {
          const portfolio = await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}?opt_fields=name,color,owner.name,workspace.name,members.name`
          );

          return successResponse({
            portfolio: {
              gid: portfolio.gid,
              name: portfolio.name,
              color: portfolio.color,
              owner: portfolio.owner?.name,
              workspace: portfolio.workspace?.name,
              members: portfolio.members?.map((m: any) => m.name),
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get portfolio");
        }
      },
    }),

    asana_create_portfolio: tool({
      description: "Create a new portfolio in a workspace.",
      inputSchema: z.object({
        workspace_gid: z.string().describe("The GID of the workspace"),
        name: z.string().describe("Portfolio name"),
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
          .describe("Portfolio color"),
        public: z
          .boolean()
          .optional()
          .describe("Make portfolio public to workspace"),
      }),
      execute: async ({ workspace_gid, name, color, public: isPublic }) => {
        try {
          const data: any = {
            name,
            workspace: workspace_gid,
          };

          if (color) data.color = color;
          if (isPublic !== undefined) data.public = isPublic;

          const portfolio = await asanaRequest(credentials, "/portfolios", {
            method: "POST",
            body: JSON.stringify({ data }),
          });

          return successResponse(
            {
              portfolio: {
                gid: portfolio.gid,
                name: portfolio.name,
              },
            },
            "Portfolio created successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to create portfolio");
        }
      },
    }),

    asana_update_portfolio: tool({
      description: "Update a portfolio's properties.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
        name: z.string().optional().describe("New portfolio name"),
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
          .describe("New portfolio color"),
        public: z.boolean().optional().describe("Change public/private status"),
      }),
      execute: async ({ portfolio_gid, name, color, public: isPublic }) => {
        try {
          const data: any = {};

          if (name !== undefined) data.name = name;
          if (color !== undefined) data.color = color;
          if (isPublic !== undefined) data.public = isPublic;

          const portfolio = await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}`,
            {
              method: "PUT",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            {
              portfolio: {
                gid: portfolio.gid,
                name: portfolio.name,
              },
            },
            "Portfolio updated successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to update portfolio");
        }
      },
    }),

    asana_delete_portfolio: tool({
      description: "Delete a portfolio permanently.",
      inputSchema: z.object({
        portfolio_gid: z
          .string()
          .describe("The GID of the portfolio to delete"),
      }),
      execute: async ({ portfolio_gid }) => {
        try {
          await asanaRequest(credentials, `/portfolios/${portfolio_gid}`, {
            method: "DELETE",
          });

          return successResponse(
            { portfolio_gid },
            "Portfolio deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete portfolio");
        }
      },
    }),

    asana_get_portfolio_items: tool({
      description: "Get all projects in a portfolio.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
      }),
      execute: async ({ portfolio_gid }) => {
        try {
          const items = await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}/items?opt_fields=name,archived,owner.name`
          );

          return successResponse({
            count: items.length,
            items: items.map((i: any) => ({
              gid: i.gid,
              name: i.name,
              archived: i.archived,
              owner: i.owner?.name,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get portfolio items");
        }
      },
    }),

    asana_add_item_to_portfolio: tool({
      description: "Add a project to a portfolio.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
        item_gid: z.string().describe("The GID of the project to add"),
        insert_before: z
          .string()
          .optional()
          .describe("Item GID to insert before"),
        insert_after: z
          .string()
          .optional()
          .describe("Item GID to insert after"),
      }),
      execute: async ({
        portfolio_gid,
        item_gid,
        insert_before,
        insert_after,
      }) => {
        try {
          const data: any = { item: item_gid };
          if (insert_before) data.insert_before = insert_before;
          if (insert_after) data.insert_after = insert_after;

          await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}/addItem`,
            {
              method: "POST",
              body: JSON.stringify({ data }),
            }
          );

          return successResponse(
            { portfolio_gid, item_gid },
            "Item added to portfolio"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add item to portfolio");
        }
      },
    }),

    asana_remove_item_from_portfolio: tool({
      description: "Remove a project from a portfolio.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
        item_gid: z.string().describe("The GID of the project to remove"),
      }),
      execute: async ({ portfolio_gid, item_gid }) => {
        try {
          await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}/removeItem`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { item: item_gid },
              }),
            }
          );

          return successResponse(
            { portfolio_gid, item_gid },
            "Item removed from portfolio"
          );
        } catch (error) {
          return errorResponse(error, "Failed to remove item from portfolio");
        }
      },
    }),

    asana_add_members_to_portfolio: tool({
      description: "Add members to a portfolio.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
        members: z.array(z.string()).describe("Array of user GIDs or emails"),
      }),
      execute: async ({ portfolio_gid, members }) => {
        try {
          await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}/addMembers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { members },
              }),
            }
          );

          return successResponse(
            { portfolio_gid, members },
            "Members added to portfolio"
          );
        } catch (error) {
          return errorResponse(error, "Failed to add members to portfolio");
        }
      },
    }),

    asana_remove_members_from_portfolio: tool({
      description: "Remove members from a portfolio.",
      inputSchema: z.object({
        portfolio_gid: z.string().describe("The GID of the portfolio"),
        members: z.array(z.string()).describe("Array of user GIDs to remove"),
      }),
      execute: async ({ portfolio_gid, members }) => {
        try {
          await asanaRequest(
            credentials,
            `/portfolios/${portfolio_gid}/removeMembers`,
            {
              method: "POST",
              body: JSON.stringify({
                data: { members },
              }),
            }
          );

          return successResponse(
            { portfolio_gid, members },
            "Members removed from portfolio"
          );
        } catch (error) {
          return errorResponse(
            error,
            "Failed to remove members from portfolio"
          );
        }
      },
    }),
  };
}
