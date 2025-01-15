import {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionService } from "../services/notion-service.js";
import {
  SearchPagesArgs,
  GetPageArgs,
  GetDatabaseItemsArgs,
  CreatePageArgs,
  UpdatePageArgs,
  SearchPagesByTitleArgs,
  CreateCommentArgs,
  GetCommentsArgs,
  ListDatabasesArgs,
} from "../types/tool-args.js";
import { NOTION_TOOLS } from "../types/tool-schemas.js";

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
    // Get the NotionService instance (it should already be initialized in tests)
    const notion = NotionService.getInstance();
    console.log("Tool request:", request.params.name);

    switch (request.params.name) {
      // Page Search and Retrieval
      case "systemprompt_search_notion_pages": {
        const args = request.params.arguments as unknown as SearchPagesArgs;
        const pages = await notion.searchPages(args.query, args.maxResults);
        console.log("Search pages result:", pages);
        return {
          content: pages.map((page) => ({
            type: "resource" as const,
            resource: page,
          })),
        };
      }

      case "systemprompt_search_notion_pages_by_title": {
        const args = request.params
          .arguments as unknown as SearchPagesByTitleArgs;
        const pages = await notion.searchPagesByTitle(
          args.title,
          args.maxResults
        );
        return {
          content: pages.map((page) => ({
            type: "resource" as const,
            resource: page,
          })),
        };
      }

      case "systemprompt_get_notion_page": {
        const args = request.params.arguments as unknown as GetPageArgs;
        const page = await notion.getPage(args.pageId);
        return {
          content: [
            {
              type: "resource" as const,
              resource: page,
            },
          ],
        };
      }

      // Page Creation and Updates
      case "systemprompt_create_notion_page": {
        const args = request.params.arguments as unknown as CreatePageArgs;

        // Validate parent object
        if (!args.parent || typeof args.parent !== "object") {
          throw new Error("Parent must be a valid object");
        }

        // Validate parent type and ID
        if (!("database_id" in args.parent) && !("page_id" in args.parent)) {
          throw new Error(
            'Parent must have either database_id or page_id. Example: { "database_id": "your-database-id" } or { "page_id": "your-page-id" }'
          );
        }

        // Validate properties
        if (!args.properties || typeof args.properties !== "object") {
          throw new Error(
            'Properties must be a valid object. For pages in a database, this must match the database schema. Example: { "Name": { "title": [{ "text": { "content": "Page Title" } }] } }'
          );
        }

        // If creating in a database, ensure there's a title property
        if ("database_id" in args.parent) {
          const hasTitleProperty = Object.values(args.properties).some(
            (prop: any) => prop.type === "title" || (prop as any).title
          );
          if (!hasTitleProperty) {
            throw new Error(
              "When creating a page in a database, properties must include a title field"
            );
          }
        }

        const page = await notion.createPage({
          parent: args.parent,
          properties: args.properties,
          children: args.children,
        });

        return {
          content: [
            {
              type: "resource" as const,
              resource: page,
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
              resource: page,
            },
          ],
        };
      }

      // Database Operations
      case "systemprompt_list_notion_databases": {
        const args = request.params.arguments as unknown as ListDatabasesArgs;
        const maxResults = args?.maxResults || 10;
        const databases = await notion.listDatabases(maxResults);
        return {
          content: databases.map((database) => ({
            type: "resource" as const,
            resource: database,
          })),
        };
      }

      case "systemprompt_get_database_items": {
        const args = request.params
          .arguments as unknown as GetDatabaseItemsArgs;
        const items = await notion.getDatabaseItems(
          args.databaseId,
          args.maxResults
        );
        return {
          content: items.map((item) => ({
            type: "resource" as const,
            resource: item,
          })),
        };
      }

      // Comments
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
              resource: comment,
            },
          ],
        };
      }

      case "systemprompt_get_notion_comments": {
        const args = request.params.arguments as unknown as GetCommentsArgs;
        const comments = await notion.getComments(args.pageId);
        return {
          content: comments.map((comment) => ({
            type: "resource" as const,
            resource: comment,
          })),
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
