import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import type {
  CallToolRequest,
  CallToolResult,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionService } from "../../services/notion-service.js";
import { listTools, handleToolCall } from "../tool-handlers.js";

// Mock process.exit
const mockExit = jest
  .spyOn(process, "exit")
  .mockImplementation(() => undefined as never);

// Mock the SDK modules
jest.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  __esModule: true,
  StdioServerTransport: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    onRequest: jest.fn(),
  })),
}));

jest.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  __esModule: true,
  Server: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    onRequest: jest.fn(),
    registerHandler: jest.fn(),
    registerHandlers: jest.fn(),
  })),
}));

jest.mock("@modelcontextprotocol/sdk/types.js", () => ({
  __esModule: true,
  ListToolsRequest: jest.fn(),
  CallToolRequest: jest.fn(),
}));

// Mock Notion Service
jest.mock("../../services/notion-service.js", () => {
  const mockPage = {
    id: "page123",
    title: "Test Page",
    url: "https://notion.so/test-page",
    createdTime: "2024-01-14T00:00:00.000Z",
    lastEditedTime: "2024-01-14T00:00:00.000Z",
  } as const;

  const mockDatabase = {
    id: "db123",
    title: "Test Database",
    url: "https://notion.so/test-database",
    createdTime: "2024-01-14T00:00:00.000Z",
    lastEditedTime: "2024-01-14T00:00:00.000Z",
    properties: {},
  } as const;

  const mockComment = {
    id: "comment123",
    content: "Test comment",
    createdTime: "2024-01-14T00:00:00.000Z",
    lastEditedTime: "2024-01-14T00:00:00.000Z",
  } as const;

  class MockNotionService {
    private static instance: MockNotionService;

    private constructor() {}

    public static initialize(token: string): void {
      if (!MockNotionService.instance) {
        MockNotionService.instance = new MockNotionService();
      }
    }

    public static getInstance(): MockNotionService {
      if (!MockNotionService.instance) {
        throw new Error("NotionService must be initialized before use");
      }
      return MockNotionService.instance;
    }

    searchPages = jest.fn(async (query: string, maxResults?: number) => [
      mockPage,
    ]);
    searchPagesByTitle = jest.fn(async (title: string, maxResults?: number) => [
      mockPage,
    ]);
    getPage = jest.fn(async (pageId: string) => mockPage);
    createPage = jest.fn(
      async (args: { parent: any; properties: any; children?: any }) => mockPage
    );
    updatePage = jest.fn(
      async (args: { pageId: string; properties: any }) => mockPage
    );
    listDatabases = jest.fn(async (maxResults?: number) => [mockDatabase]);
    getDatabaseItems = jest.fn(
      async (databaseId: string, maxResults?: number) => [mockPage]
    );
    createComment = jest.fn(
      async (pageId: string, content: string, discussionId?: string) =>
        mockComment
    );
    getComments = jest.fn(async (pageId: string) => [mockComment]);
    listPages = jest.fn(async () => ({ pages: [mockPage], hasMore: false }));
    getPageProperty = jest.fn(async () => ({}));
    createDatabase = jest.fn(async () => mockDatabase);
  }

  return {
    __esModule: true,
    NotionService: MockNotionService,
  };
});

describe("Tool Handlers", () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
    // Initialize NotionService before each test
    NotionService.initialize("test-token");
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe("listTools", () => {
    it("should return list of available Notion tools", async () => {
      const request = {
        method: "tools/list" as const,
      };

      const result = await listTools(request);

      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);

      // Verify the structure of each tool
      result.tools.forEach((tool: Tool) => {
        expect(tool).toMatchObject({
          name: expect.stringMatching(/^systemprompt_/),
          description: expect.any(String),
          inputSchema: expect.objectContaining({
            type: "object",
            properties: expect.any(Object),
          }),
        });
      });

      // Verify specific Notion tools exist
      const toolNames = result.tools.map((t: Tool) => t.name);
      expect(toolNames).toContain("systemprompt_search_notion_pages");
      expect(toolNames).toContain("systemprompt_create_notion_page");
      expect(toolNames).toContain("systemprompt_list_notion_databases");
    });
  });

  describe("handleToolCall", () => {
    it("should handle invalid tool name", async () => {
      const request: CallToolRequest = {
        method: "tools/call" as const,
        params: {
          name: "invalid_tool" as any,
          arguments: {},
        },
      };

      await expect(handleToolCall(request)).rejects.toThrow(
        "Tool call failed: Unknown tool: invalid_tool"
      );
    });

    describe("Page Search and Retrieval", () => {
      it("should handle systemprompt_search_notion_pages", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_search_notion_pages",
            arguments: {
              query: "test",
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });

      it("should handle systemprompt_search_notion_pages_by_title", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_search_notion_pages_by_title",
            arguments: {
              title: "Test Page",
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });

      it("should handle systemprompt_get_notion_page", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_get_notion_page",
            arguments: {
              pageId: "page123",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });
    });

    describe("Page Creation and Updates", () => {
      it("should handle systemprompt_create_notion_page in database", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: { database_id: "db123" },
              properties: {
                Name: {
                  title: [{ text: { content: "New Page" } }],
                },
              },
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });

      it("should handle systemprompt_create_notion_page as subpage", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              parent: { page_id: "page123" },
              properties: {
                title: [{ text: { content: "New Subpage" } }],
              },
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });

      it("should handle systemprompt_update_notion_page", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_update_notion_page",
            arguments: {
              pageId: "page123",
              properties: {
                title: [{ text: { content: "Updated Page" } }],
              },
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });
    });

    describe("Database Operations", () => {
      it("should handle systemprompt_list_notion_databases", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_list_notion_databases",
            arguments: {
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "db123",
          title: "Test Database",
        });
      });

      it("should handle systemprompt_get_database_items", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_get_database_items",
            arguments: {
              databaseId: "db123",
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "page123",
          title: "Test Page",
        });
      });
    });

    describe("Comments", () => {
      it("should handle systemprompt_create_notion_comment", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_create_notion_comment",
            arguments: {
              pageId: "page123",
              content: "Test comment",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "comment123",
          content: "Test comment",
        });
      });

      it("should handle systemprompt_get_notion_comments", async () => {
        const request: CallToolRequest = {
          method: "tools/call" as const,
          params: {
            name: "systemprompt_get_notion_comments",
            arguments: {
              pageId: "page123",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("resource");
        expect(result.content[0].resource).toMatchObject({
          id: "comment123",
          content: "Test comment",
        });
      });
    });
  });
});
