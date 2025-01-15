import type {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
  GetPromptRequest,
  GetPromptResult,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionService } from "../services/notion-service.js";
import {
  SearchPagesArgs,
  GetPageArgs,
  CreatePageArgs,
  UpdatePageArgs,
  SearchPagesByTitleArgs,
  CreateCommentArgs,
  GetCommentsArgs,
  ListPagesArgs,
  ListDatabasesArgs,
} from "../types/tool-args.js";
import { NOTION_TOOLS } from "../types/tool-schemas.js";
import { handleGetPrompt } from "../handlers/prompt-handlers.js";
import { isFullPage, mapPageToNotionPage } from "../utils/notion-utils.js";
import { server } from "../index.js";

export async function listTools(
  _request: ListToolsRequest
): Promise<ListToolsResult> {
  return {
    tools: NOTION_TOOLS,
  };
}

export async function handleToolCall(
  request: CallToolRequest
): Promise<CallToolResult> {
  try {
    const notion = NotionService.getInstance();
    switch (request.params.name) {
      // Page Search and Retrieval
      case "systemprompt_search_notion_pages": {
        const args = request.params.arguments as unknown as SearchPagesArgs;
        const searchResult = await notion.searchPages(
          args.query,
          args.maxResults
        );
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: "notion://pages",
                text: JSON.stringify(searchResult.pages, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_search_notion_pages_by_title": {
        const args = request.params
          .arguments as unknown as SearchPagesByTitleArgs;
        const searchResult = await notion.searchPagesByTitle(
          args.title,
          args.maxResults
        );
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: "notion://pages",
                text: JSON.stringify(searchResult.pages, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_get_notion_page": {
        const args = request.params.arguments as unknown as GetPageArgs;
        if (!args.pageId) {
          throw new Error("Missing required argument: pageId");
        }
        const page = await notion.getPage(args.pageId);
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: `notion://pages/${page.id}`,
                text: JSON.stringify(page, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      // Page Creation and Updates
      case "systemprompt_create_notion_page": {
        const args = request.params.arguments as unknown as CreatePageArgs;

        // Validate parent
        if (!args.parent || typeof args.parent !== "object") {
          throw new Error("Parent must be a valid object");
        }

        // Validate parent type and create properly typed parent object
        let parent:
          | { database_id: string; type?: "database_id" }
          | { page_id: string; type?: "page_id" };
        if ("database_id" in args.parent && args.parent.database_id) {
          parent = {
            database_id: args.parent.database_id,
            type: "database_id",
          };
        } else if ("page_id" in args.parent && args.parent.page_id) {
          parent = { page_id: args.parent.page_id, type: "page_id" };
        } else {
          throw new Error("Parent must have either database_id or page_id");
        }

        // Validate properties
        if (!args.properties || typeof args.properties !== "object") {
          throw new Error("Properties must be a valid object");
        }
        if (
          "database_id" in parent &&
          (!args.properties.title || !args.properties.title.title)
        ) {
          throw new Error(
            "When creating a page in a database, properties must include a title field"
          );
        }

        // Create the page
        const page = await notion.createPage({
          parent,
          properties: args.properties,
        });

        // Return the created page
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: `notion://pages/${page.id}`,
                text: JSON.stringify(page, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_update_notion_page": {
        const args = request.params.arguments as unknown as UpdatePageArgs;
        const page = await notion.updatePage({
          pageId: args.pageId,
          properties: args.properties,
        });
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: `notion://pages/${page.id}`,
                text: JSON.stringify(page, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_create_notion_comment": {
        const args = request.params.arguments as unknown as CreateCommentArgs;
        const comment = await notion.createComment(
          args.pageId,
          args.content,
          args.discussionId
        );
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: `notion://comments/${comment.id}`,
                text: JSON.stringify(comment, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_get_notion_comments": {
        const args = request.params.arguments as unknown as GetCommentsArgs;
        const comments = await notion.getComments(args.pageId);
        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: `notion://pages/${args.pageId}/comments`,
                text: JSON.stringify(comments, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_list_notion_pages": {
        const args = request.params.arguments as unknown as ListPagesArgs;
        const result = await notion.listPages({
          pageSize: args.maxResults || 50,
          sort: {
            direction: "descending",
            timestamp: "last_edited_time",
          },
        });

        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: "notion://pages",
                text: JSON.stringify(result.pages, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_list_notion_databases": {
        const args = request.params.arguments as unknown as ListDatabasesArgs;
        const response = await notion.searchDatabases(args.maxResults || 50);

        return {
          content: [
            {
              type: "resource" as const,
              resource: {
                uri: "notion://databases",
                text: JSON.stringify(response.results, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      default:
        throw new Error(
          `Tool call failed: Unknown tool: ${request.params.name}`
        );
    }
  } catch (error) {
    console.error("Tool call failed:", error);
    if (
      error instanceof Error &&
      !error.message.startsWith("Tool call failed:")
    ) {
      throw new Error(`Tool call failed: ${error.message}`);
    }
    throw error;
  }
}
