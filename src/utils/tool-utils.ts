import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { NotionPage } from "../types/notion.js";
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

/**
 * Creates a text response for tool calls
 */
export function createTextResponse(text: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

/**
 * Creates a pages response for tool calls
 */
export function createPagesResponse(pages: NotionPage[]): CallToolResult {
  return {
    content: [
      {
        type: "resource",
        resource: {
          uri: "notion://pages",
          text: JSON.stringify(pages, null, 2),
          mimeType: "application/json",
        },
      },
    ],
  };
}

/**
 * Creates a databases response for tool calls
 */
export function createDatabasesResponse(
  databases: DatabaseObjectResponse[]
): CallToolResult {
  return {
    content: [
      {
        type: "resource",
        resource: {
          uri: "notion://databases",
          text: JSON.stringify(databases, null, 2),
          mimeType: "application/json",
        },
      },
    ],
  };
}
