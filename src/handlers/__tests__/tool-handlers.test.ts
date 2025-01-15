import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { NotionService } from "../../services/notion-service.js";
import { handleToolCall } from "../tool-handlers.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import type {
  PageObjectResponse,
  CommentObjectResponse,
  RichTextItemResponse,
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
import type { NotionPage } from "../../types/notion.js";

const richTextContent: RichTextItemResponse = {
  type: "text",
  text: { content: "Test comment", link: null },
  annotations: {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: "default",
  },
  plain_text: "Test comment",
  href: null,
};

const mockPage: NotionPage = {
  id: "page123",
  title: "Test Page",
  url: "https://notion.so/page123",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  properties: {},
  parent: { type: "database_id", database_id: "db123" },
};

const mockComment = {
  id: "comment123",
  object: "comment",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: { object: "user", id: "user123" },
  parent: { type: "page_id", page_id: "page123" },
  discussion_id: "discussion123",
  rich_text: [richTextContent],
} as CommentObjectResponse;

// Mock NotionService with proper types
const mockNotionService = {
  searchPages: jest
    .fn<typeof NotionService.prototype.searchPages>()
    .mockResolvedValue([mockPage]),
  searchPagesByTitle: jest
    .fn<typeof NotionService.prototype.searchPagesByTitle>()
    .mockResolvedValue([mockPage]),
  getPage: jest
    .fn<typeof NotionService.prototype.getPage>()
    .mockResolvedValue(mockPage),
  createPage: jest
    .fn<typeof NotionService.prototype.createPage>()
    .mockResolvedValue(mockPage),
  updatePage: jest
    .fn<typeof NotionService.prototype.updatePage>()
    .mockResolvedValue(mockPage),
  createComment: jest
    .fn<typeof NotionService.prototype.createComment>()
    .mockResolvedValue({
      id: mockComment.id,
      discussionId: mockComment.discussion_id,
      content: mockComment.rich_text[0].plain_text,
      createdTime: mockComment.created_time,
      lastEditedTime: mockComment.last_edited_time,
    }),
  getComments: jest
    .fn<typeof NotionService.prototype.getComments>()
    .mockResolvedValue([
      {
        id: mockComment.id,
        discussionId: mockComment.discussion_id,
        content: mockComment.rich_text[0].plain_text,
        createdTime: mockComment.created_time,
        lastEditedTime: mockComment.last_edited_time,
      },
    ]),
  listPages: jest
    .fn<typeof NotionService.prototype.listPages>()
    .mockResolvedValue({ pages: [mockPage], hasMore: false }),
  getPageProperty: jest
    .fn<typeof NotionService.prototype.getPageProperty>()
    .mockResolvedValue({
      object: "property_item",
      id: "prop123",
      type: "title",
      title: {},
    } as GetPagePropertyResponse),
};

// Mock the NotionService module
jest.mock("../../services/notion-service.js", () => ({
  NotionService: {
    initialize: jest.fn(),
    getInstance: jest.fn(() => mockNotionService),
  },
}));

describe("Tool Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe("handleToolCall", () => {
    describe("Page Operations", () => {
      it("should handle systemprompt_search_notion_pages", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_search_notion_pages",
            arguments: {
              query: "test query",
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.searchPages).toHaveBeenCalledWith(
          "test query",
          10
        );
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://pages",
                text: JSON.stringify([mockPage], null, 2),
                mimeType: "application/json",
              },
            },
          ],
        });
      });

      it("should handle systemprompt_get_notion_page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_get_notion_page",
            arguments: {
              pageId: "page123",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.getPage).toHaveBeenCalledWith("page123");
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://pages/page123",
                text: JSON.stringify(mockPage, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        });
      });

      it("should handle systemprompt_create_notion_page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: { database_id: "db123" },
              properties: {
                title: {
                  title: [{ text: { content: "Test Page" } }],
                },
              },
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.createPage).toHaveBeenCalledWith({
          parent: { database_id: "db123" },
          properties: {
            title: {
              title: [{ text: { content: "Test Page" } }],
            },
          },
        });
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: `notion://pages/${mockPage.id}`,
                text: JSON.stringify(mockPage, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        });
      });

      it("should handle systemprompt_update_notion_page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_update_notion_page",
            arguments: {
              pageId: "page123",
              properties: {
                title: {
                  title: [{ text: { content: "Updated Title" } }],
                },
              },
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.updatePage).toHaveBeenCalledWith({
          pageId: "page123",
          properties: {
            title: {
              title: [{ text: { content: "Updated Title" } }],
            },
          },
        });
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: `notion://pages/${mockPage.id}`,
                text: JSON.stringify(mockPage, null, 2),
                mimeType: "application/json",
              },
            },
          ],
        });
      });

      it("should handle page not found error", async () => {
        mockNotionService.getPage.mockRejectedValueOnce(
          new Error("Page not found")
        );

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_get_notion_page",
            arguments: {
              pageId: "nonexistent",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow("Page not found");
      });

      it("should handle systemprompt_search_notion_pages_by_title", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_search_notion_pages_by_title",
            arguments: {
              title: "test title",
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.searchPagesByTitle).toHaveBeenCalledWith(
          "test title",
          10
        );
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://pages",
                text: JSON.stringify([mockPage], null, 2),
                mimeType: "application/json",
              },
            },
          ],
        });
      });

      it("should reject invalid parent object in create page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: "invalid",
              properties: {},
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Parent must be a valid object"
        );
      });

      it("should reject missing parent type in create page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: {},
              properties: {},
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Parent must have either database_id or page_id"
        );
      });

      it("should reject invalid properties object in create page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: { database_id: "db123" },
              properties: "invalid",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Properties must be a valid object"
        );
      });

      it("should reject missing title property in database page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: { database_id: "db123" },
              properties: {
                description: {
                  rich_text: [{ text: { content: "Description" } }],
                },
              },
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "When creating a page in a database, properties must include a title field"
        );
      });
    });

    describe("Comments", () => {
      it("should handle systemprompt_create_notion_comment", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_comment",
            arguments: {
              pageId: "test-page-id",
              content: "test comment",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://comments/comment123",
                text: JSON.stringify(
                  {
                    id: "comment123",
                    discussionId: "discussion123",
                    content: "Test comment",
                    createdTime: "2024-01-01T00:00:00.000Z",
                    lastEditedTime: "2024-01-01T00:00:00.000Z",
                  },
                  null,
                  2
                ),
                mimeType: "application/json",
              },
            },
          ],
        });
      });

      it("should handle systemprompt_get_notion_comments", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_get_notion_comments",
            arguments: {
              pageId: "test-page-id",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result).toEqual({
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://pages/test-page-id/comments",
                text: JSON.stringify(
                  [
                    {
                      id: "comment123",
                      discussionId: "discussion123",
                      content: "Test comment",
                      createdTime: "2024-01-01T00:00:00.000Z",
                      lastEditedTime: "2024-01-01T00:00:00.000Z",
                    },
                  ],
                  null,
                  2
                ),
                mimeType: "application/json",
              },
            },
          ],
        });
      });
    });

    describe("Error Handling", () => {
      it("should handle invalid tool name", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "invalid_tool",
            arguments: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Unknown tool: invalid_tool"
        );
      });

      it("should handle missing required arguments", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_get_notion_page",
            arguments: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Missing required argument: pageId"
        );
      });

      it("should handle API rate limits", async () => {
        mockNotionService.searchPages.mockRejectedValueOnce(
          new Error("Rate limit exceeded")
        );

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_search_notion_pages",
            arguments: {
              query: "test",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Rate limit exceeded"
        );
      });

      it("should handle network errors", async () => {
        mockNotionService.getPage.mockRejectedValueOnce(
          new Error("Network error")
        );

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_get_notion_page",
            arguments: {
              pageId: "page123",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow("Network error");
      });
    });
  });
});
