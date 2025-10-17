import {
  AsanaCredentials,
  asanaRequest,
  errorResponse,
  successResponse,
  tool,
  z,
} from "./base";

/**
 * Asana Attachments API Tools
 * Complete implementation of attachment/file endpoints
 */

export function createAttachmentTools(credentials: AsanaCredentials) {
  return {
    asana_get_attachments_for_object: tool({
      description: "Get all attachments on a task or other object.",
      inputSchema: z.object({
        parent_gid: z
          .string()
          .describe("The GID of the parent object (usually a task)"),
      }),
      execute: async ({ parent_gid }) => {
        try {
          const attachments = await asanaRequest(
            credentials,
            `/attachments?parent=${parent_gid}`
          );

          return successResponse({
            count: attachments.length,
            attachments: attachments.map((a: any) => ({
              gid: a.gid,
              name: a.name,
              resource_type: a.resource_type,
              created_at: a.created_at,
              download_url: a.download_url,
              host: a.host,
            })),
          });
        } catch (error) {
          return errorResponse(error, "Failed to get attachments");
        }
      },
    }),

    asana_get_attachment: tool({
      description: "Get details of a specific attachment.",
      inputSchema: z.object({
        attachment_gid: z.string().describe("The GID of the attachment"),
      }),
      execute: async ({ attachment_gid }) => {
        try {
          const attachment = await asanaRequest(
            credentials,
            `/attachments/${attachment_gid}`
          );

          return successResponse({
            attachment: {
              gid: attachment.gid,
              name: attachment.name,
              resource_type: attachment.resource_type,
              size: attachment.size,
              created_at: attachment.created_at,
              download_url: attachment.download_url,
              view_url: attachment.view_url,
              host: attachment.host,
              parent: attachment.parent,
            },
          });
        } catch (error) {
          return errorResponse(error, "Failed to get attachment");
        }
      },
    }),

    asana_upload_attachment: tool({
      description:
        "Upload a file attachment to a task. Note: This requires multipart/form-data which may need special handling.",
      inputSchema: z.object({
        parent_gid: z
          .string()
          .describe("The GID of the parent object (usually a task)"),
        file_url: z
          .string()
          .describe("URL of the file to upload (must be accessible)"),
        file_name: z.string().describe("Name for the uploaded file"),
      }),
      execute: async ({ parent_gid, file_url, file_name }) => {
        try {
          // Note: This is a simplified implementation
          // In production, you'd need to fetch the file and create proper multipart/form-data
          const fileResponse = await fetch(file_url);
          const fileBlob = await fileResponse.blob();

          const formData = new FormData();
          formData.append("file", fileBlob, file_name);
          formData.append("parent", parent_gid);

          const response = await fetch(
            `https://app.asana.com/api/1.0/attachments`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${credentials.access_token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();
          const attachment = result.data;

          return successResponse(
            {
              attachment: {
                gid: attachment.gid,
                name: attachment.name,
                download_url: attachment.download_url,
              },
            },
            "Attachment uploaded successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to upload attachment");
        }
      },
    }),

    asana_delete_attachment: tool({
      description: "Delete an attachment from Asana.",
      inputSchema: z.object({
        attachment_gid: z
          .string()
          .describe("The GID of the attachment to delete"),
      }),
      execute: async ({ attachment_gid }) => {
        try {
          await asanaRequest(credentials, `/attachments/${attachment_gid}`, {
            method: "DELETE",
          });

          return successResponse(
            { attachment_gid },
            "Attachment deleted successfully"
          );
        } catch (error) {
          return errorResponse(error, "Failed to delete attachment");
        }
      },
    }),
  };
}
