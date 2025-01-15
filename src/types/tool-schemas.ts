import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notionPropertySchemas } from "./notion-property-schemas.js";

export const NOTION_TOOLS: Tool[] = [
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

  // Page Operations
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
      "Creates a new page in Notion based on user instructions and content. Returns an MCP Sampling Request to generate the Notion API request.",
    inputSchema: {
      type: "object",
      properties: {
        userInstructions: {
          type: "string",
          description:
            "High-level instructions for how to create the page, including title, structure, and any special requirements",
        },
        contentInstructions: {
          type: "string",
          description:
            "The actual content to be converted into Notion blocks, following Notion's markdown-like format",
        },
      },
      required: ["userInstructions", "contentInstructions"],
      additionalProperties: false,
    },
  },
  {
    name: "systemprompt_create_notion_page_complex",
    description:
      "Creates a new page in Notion with complex properties using direct Notion API format.",
    inputSchema: {
      type: "object",
      required: ["parent", "properties"],
      additionalProperties: false,
      properties: {
        parent: {
          type: "object",
          required: ["type", "workspace"],
          additionalProperties: false,
          properties: {
            type: {
              type: "string",
              const: "workspace",
            },
            workspace: {
              type: "boolean",
              const: true,
            },
          },
        },
        properties: {
          type: "object",
          required: ["title"],
          additionalProperties: false,
          properties: {
            title: {
              type: "array",
              items: {
                type: "object",
                required: ["text"],
                additionalProperties: false,
                properties: {
                  text: {
                    type: "object",
                    required: ["content"],
                    additionalProperties: false,
                    properties: {
                      content: {
                        type: "string",
                        description: "The title text of the page",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        children: {
          type: "array",
          items: {
            type: "object",
            required: ["object", "type"],
            properties: {
              object: {
                type: "string",
                const: "block",
              },
              type: {
                type: "string",
                enum: [
                  "paragraph",
                  "heading_1",
                  "heading_2",
                  "heading_3",
                  "bulleted_list_item",
                  "numbered_list_item",
                  "to_do",
                  "toggle",
                  "code",
                  "quote",
                ],
              },
              paragraph: {
                type: "object",
                required: ["rich_text"],
                additionalProperties: false,
                properties: {
                  rich_text: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["text"],
                      additionalProperties: false,
                      properties: {
                        text: {
                          type: "object",
                          required: ["content"],
                          additionalProperties: false,
                          properties: {
                            content: {
                              type: "string",
                              description: "The text content of the paragraph",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              heading_1: { $ref: "#/definitions/heading" },
              heading_2: { $ref: "#/definitions/heading" },
              heading_3: { $ref: "#/definitions/heading" },
            },
          },
        },
      },
      definitions: {
        heading: {
          type: "object",
          required: ["rich_text"],
          additionalProperties: false,
          properties: {
            rich_text: {
              type: "array",
              items: {
                type: "object",
                required: ["text"],
                additionalProperties: false,
                properties: {
                  text: {
                    type: "object",
                    required: ["content"],
                    additionalProperties: false,
                    properties: {
                      content: {
                        type: "string",
                        description: "The text content of the heading",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    _meta: { hidden: true },
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
