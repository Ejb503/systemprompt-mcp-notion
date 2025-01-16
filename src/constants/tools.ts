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
    description: "Lists pages in Notion, sorted by last edited time.",
    inputSchema: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 50.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_list_notion_databases",
    description: "Lists databases in Notion, sorted by last edited time.",
    inputSchema: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 50.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_search_notion_pages",
    description: "Searches for pages in Notion using a text query.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find Notion pages",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 10.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_search_notion_pages_by_title",
    description: "Searches for pages in Notion by their title.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title to search for",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 10.",
        },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_get_notion_page",
    description: "Retrieves a specific Notion page by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the Notion page to retrieve",
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
      "Updates a Notion page with rich, detailed content that expands upon basic inputs.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page to edit",
        },
        userInstructions: {
          type: "string",
          description:
            "Basic instructions for editing the page that will be expanded into a comprehensive structure",
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
    description: "Deletes a Notion page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page to delete",
        },
      },
      required: ["pageId"],
      additionalProperties: false,
    },
  },
];
