import { AsanaCredentials } from "./base";
import { createTaskTools } from "./tasks";
import { createProjectTools } from "./projects";
import { createWorkspaceTools } from "./workspaces";
import { createTeamTools } from "./teams";
import { createUserTools } from "./users";
import { createTimeTrackingTools } from "./time-tracking";
import { createStoryTools } from "./stories";
import { createSectionTools } from "./sections";
import { createTagTools } from "./tags";
import { createAttachmentTools } from "./attachments";
import { createWebhookTools } from "./webhooks";
import { createGoalTools } from "./goals";
import { createPortfolioTools } from "./portfolios";
import { createCustomFieldTools } from "./custom-fields";

/**
 * Unified Asana Tools Factory
 * Creates a complete set of 100+ Asana API tools for AI SDK
 *
 * @param credentials - Asana OAuth token or PAT
 * @returns Object containing all Asana tools organized by category
 */
export function createAsanaTools(credentials: AsanaCredentials) {
  return {
    // Tasks (20+ tools) - Core task management
    ...createTaskTools(credentials),

    // Projects (14 tools) - Project management
    ...createProjectTools(credentials),

    // Workspaces (6 tools) - Workspace management
    ...createWorkspaceTools(credentials),

    // Teams (7 tools) - Team management
    ...createTeamTools(credentials),

    // Users (3 tools) - User information
    ...createUserTools(credentials),

    // Time Tracking (5 tools) - Time logging
    ...createTimeTrackingTools(credentials),

    // Stories/Comments (5 tools) - Task comments and activity
    ...createStoryTools(credentials),

    // Sections (8 tools) - Project sections/columns
    ...createSectionTools(credentials),

    // Tags (6 tools) - Tag management
    ...createTagTools(credentials),

    // Attachments (4 tools) - File attachments
    ...createAttachmentTools(credentials),

    // Webhooks (5 tools) - Real-time notifications
    ...createWebhookTools(credentials),

    // Goals (11 tools) - Goal tracking and metrics
    ...createGoalTools(credentials),

    // Portfolios (10 tools) - Portfolio management
    ...createPortfolioTools(credentials),

    // Custom Fields (8 tools) - Custom field management
    ...createCustomFieldTools(credentials),
  };
}

// Export types
export type { AsanaCredentials } from "./base";

// Export individual tool creators for advanced use cases
export {
  createTaskTools,
  createProjectTools,
  createWorkspaceTools,
  createTeamTools,
  createUserTools,
  createTimeTrackingTools,
  createStoryTools,
  createSectionTools,
  createTagTools,
  createAttachmentTools,
  createWebhookTools,
  createGoalTools,
  createPortfolioTools,
  createCustomFieldTools,
};
