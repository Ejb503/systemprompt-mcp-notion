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
} from "@notionhq/client/build/src/api-endpoints.js";

// Mock objects
const mockPage = {
  id: "page123",
  object: "page",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: { object: "user", id: "user123" },
  last_edited_by: { object: "user", id: "user123" },
  archived: false,
  properties: {},
  url: "https://notion.so/page123",
  parent: { type: "database_id", database_id: "db123" },
  cover: null,
  icon: null,
  public_url: null,
  in_trash: false,
} as PageObjectResponse;

const mockComment = {
  id: "comment123",
  object: "comment",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: { object: "user", id: "user123" },
  parent: { type: "page_id", page_id: "page123" },
  discussion_id: "discussion123",
  rich_text: [
    {
      type: "text",
      text: {
        content: "Test comment",
        link: null,
      },
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
    },
  ],
} as CommentObjectResponse;

// Mock NotionService
const mockNotionService = {
  searchPages: jest.fn().mockResolvedValue([mockPage]),
  searchPagesByTitle: jest.fn().mockResolvedValue([mockPage]),
  getPage: jest.fn().mockResolvedValue(mockPage),
  createPage: jest.fn().mockResolvedValue(mockPage),
  updatePage: jest.fn().mockResolvedValue(mockPage),
  listDatabases: jest.fn().mockResolvedValue([]),
  getDatabaseItems: jest.fn().mockResolvedValue([]),
  createComment: jest.fn().mockResolvedValue({
    id: mockComment.id,
    discussionId: mockComment.discussion_id,
    content: mockComment.rich_text[0].plain_text,
    createdTime: mockComment.created_time,
    lastEditedTime: mockComment.last_edited_time,
  }),
  getComments: jest.fn().mockResolvedValue([
    {
      id: mockComment.id,
      discussionId: mockComment.discussion_id,
      content: mockComment.rich_text[0].plain_text,
      createdTime: mockComment.created_time,
      lastEditedTime: mockComment.last_edited_time,
    },
  ]),
  listPages: jest.fn().mockResolvedValue({ pages: [mockPage], hasMore: false }),
  getPageProperty: jest.fn().mockResolvedValue({}),
  createDatabase: jest.fn().mockResolvedValue({}),
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
    describe("Comments", () => {
      beforeEach(() => {
        // Mock NotionService
        const mockNotionService = {
          createComment: jest.fn().mockResolvedValue({
            id: "comment123",
            discussionId: "discussion123",
            content: "Test comment",
            createdTime: "2024-01-01T00:00:00.000Z",
            lastEditedTime: "2024-01-01T00:00:00.000Z",
          }),
          getComments: jest.fn().mockResolvedValue([
            {
              id: "comment123",
              discussionId: "discussion123",
              content: "Test comment",
              createdTime: "2024-01-01T00:00:00.000Z",
              lastEditedTime: "2024-01-01T00:00:00.000Z",
            },
          ]),
        };
        (NotionService as any).instance = mockNotionService;
      });

      it("should handle systemprompt_create_notion_comment", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
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
      }, 10000);

      it("should handle systemprompt_get_notion_comments", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
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
      }, 10000);
    });
  });
});
