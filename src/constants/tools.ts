import { NotionTool } from "../types/tool-schemas.js";
import {
  NOTION_PAGE_CREATOR_PROMPT,
  NOTION_PAGE_EDITOR_PROMPT,
} from "./prompts.js";

export const TOOL_ERROR_MESSAGES = {
  UNKNOWN_TOOL: "Unknown tool:",
  TOOL_CALL_FAILED: "Tool call failed:",
} as const;

export const TOOL_RESPONSE_MESSAGES = {
  ASYNC_PROCESSING: "Request is being processed asynchronously",
} as const;

export const NOTION_TOOLS: NotionTool[] = [
  // List Operations
  {
    name: "systemprompt_list_notion_pages",
    description:
      "Lists all accessible Notion pages in your workspace, sorted by last edited time. Returns key metadata including title, URL, and last edited timestamp.",
    inputSchema: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description:
            "Maximum number of pages to return in the response. Defaults to 50 if not specified.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_list_notion_databases",
    description:
      "Lists all accessible Notion databases in your workspace, sorted by last edited time. Returns key metadata including database title, schema, and last edited timestamp.",
    inputSchema: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description:
            "Maximum number of databases to return in the response. Defaults to 50 if not specified.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_search_notion_pages",
    description:
      "Performs a full-text search across all accessible Notion pages using the provided query. Searches through titles, content, and metadata to find relevant matches.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query to find relevant Notion pages. Can include keywords, phrases, or partial matches.",
        },
        maxResults: {
          type: "number",
          description:
            "Maximum number of search results to return. Defaults to 10 if not specified.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_search_notion_pages_by_title",
    description:
      "Searches specifically for Notion pages with titles matching the provided query. Useful for finding exact or similar title matches when you know the page name.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Title text to search for. Can be exact or partial match.",
        },
        maxResults: {
          type: "number",
          description:
            "Maximum number of matching pages to return. Defaults to 10 if not specified.",
        },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_get_notion_page",
    description:
      "Retrieves comprehensive details of a specific Notion page, including its content, properties, and metadata. Returns the complete page structure and all nested content blocks.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description:
            "The unique identifier of the Notion page to retrieve. Must be a valid Notion page ID.",
        },
      },
      required: ["pageId"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_create_notion_page",
    description:
      "Creates a rich, comprehensive Notion page that expands upon basic user inputs. Takes simple instructions and content, then generates a detailed, well-structured page with appropriate sections, formatting, and supplementary content.",
    inputSchema: {
      type: "object",
      properties: {
        databaseId: {
          type: "string",
          description: "The ID of the database to create the page in",
        },
        userInstructions: {
          type: "string",
          description:
            "Basic instructions or outline for the page content. These will be expanded into a comprehensive structure with appropriate sections, formatting, and enhanced detail. Can include desired title, key points, or general direction.",
        },
      },
      required: ["databaseId", "userInstructions"],
      additionalProperties: false,
    },
    _meta: {
      sampling: {
        prompt: NOTION_PAGE_CREATOR_PROMPT,
        maxTokens: 100000,
        temperature: 0.7,
      },
    },
  },
  {
    name: "systemprompt_update_notion_page",
    description:
      "Updates an existing Notion page with rich, comprehensive content based on user instructions. Takes simple inputs and transforms them into well-structured, detailed page content while preserving existing information. Can enhance, reorganize, or expand the current content while maintaining page integrity.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description:
            "The unique identifier of the Notion page to update. Must be a valid Notion page ID.",
        },
        userInstructions: {
          type: "string",
          description:
            "Natural language instructions for updating the page. These will be expanded into comprehensive changes, potentially including new sections, enhanced formatting, additional context, and improved structure while respecting existing content. Can include specific changes, content additions, or general directions for improvement.",
        },
      },
      required: ["pageId", "userInstructions"],
      additionalProperties: false,
    },
    _meta: {
      sampling: {
        prompt: NOTION_PAGE_EDITOR_PROMPT,
        maxTokens: 100000,
        temperature: 0.7,
        requiresExistingContent: true,
      },
    },
  },
  {
    name: "systemprompt_delete_notion_page",
    description:
      "Permanently deletes a specified Notion page and all its contents. This action cannot be undone, so use with caution.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description:
            "The unique identifier of the Notion page to delete. Must be a valid Notion page ID. Warning: deletion is permanent.",
        },
      },
      required: ["pageId"],
      additionalProperties: false,
    },
  },
];
