import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notionPropertySchemas } from "./notion-property-schemas.js";

export const NOTION_TOOLS: Tool[] = [
  // Page Search and Retrieval
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
      "Creates a new page in Notion within a database or as a subpage.",
    inputSchema: {
      type: "object",
      properties: {
        parent: {
          type: "object",
          oneOf: [
            {
              type: "object",
              properties: {
                database_id: {
                  type: "string",
                  description: "ID of the parent database",
                },
                type: {
                  type: "string",
                  enum: ["database_id"],
                  description: "Type of parent (must be 'database_id')",
                },
              },
              required: ["database_id"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                page_id: {
                  type: "string",
                  description: "ID of the parent page",
                },
                type: {
                  type: "string",
                  enum: ["page_id"],
                  description: "Type of parent (must be 'page_id')",
                },
              },
              required: ["page_id"],
              additionalProperties: false,
            },
          ],
          description: "Parent container where the page will be created",
        },
        properties: {
          type: "object",
          description: "Page properties in Notion API format",
          patternProperties: {
            "^.*$": {
              oneOf: Object.values(notionPropertySchemas),
            },
          },
          additionalProperties: false,
        },
        children: {
          type: "array",
          description: "Optional page content blocks",
          items: {
            type: "object",
            additionalProperties: true,
          },
        },
      },
      required: ["parent", "properties"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_update_notion_page",
    description: "Updates properties of an existing Notion page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "ID of the page to update",
        },
        properties: {
          type: "object",
          description: "Updated page properties in Notion API format",
          patternProperties: {
            "^.*$": {
              oneOf: Object.values(notionPropertySchemas),
            },
          },
          additionalProperties: false,
        },
      },
      required: ["pageId", "properties"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_create_notion_comment",
    description: "Creates a comment on a Notion page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "ID of the page to comment on",
        },
        content: {
          type: "string",
          description: "Text content of the comment",
        },
        discussionId: {
          type: "string",
          description:
            "Optional discussion ID for replying to existing comments",
        },
      },
      required: ["pageId", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_get_notion_comments",
    description: "Retrieves all comments from a Notion page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "ID of the page to get comments from",
        },
      },
      required: ["pageId"],
      additionalProperties: false,
    },
  },
];
