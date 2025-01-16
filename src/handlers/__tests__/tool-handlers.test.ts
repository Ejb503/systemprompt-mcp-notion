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
  RichTextItemResponse,
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
import type { NotionPage } from "../../types/notion.js";
import { NOTION_TOOLS, TOOL_ERROR_MESSAGES } from "../../constants/tools.js";

// Mock the server config
jest.mock("../../config/server-config.js", () => ({
  serverConfig: {
    port: 3000,
    host: "localhost",
  },
  serverCapabilities: {
    tools: [],
  },
}));

// Mock the main function
jest.mock("../../index.ts", () => {
  const mockNotification = jest.fn().mockImplementation(async () => {});
  return {
    main: jest.fn(),
    server: {
      notification: mockNotification,
    },
  };
});

// Mock the sampling module
jest.mock("../sampling.js", () => ({
  sendSamplingRequest: jest.fn().mockImplementation(async () => ({
    content: {
      type: "text",
      text: "Sampling response",
    },
  })),
}));

// Mock the prompt handlers
jest.mock("../prompt-handlers.js", () => ({
  handleGetPrompt: jest.fn().mockImplementation(async () => ({
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "Test prompt",
        },
      },
    ],
  })),
}));

const mockPage: NotionPage = {
  id: "page123",
  title: "Test Page",
  url: "https://notion.so/page123",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  properties: {},
  parent: { type: "database_id", database_id: "db123" },
};

// Mock NotionService with proper types
const mockNotionService = {
  searchPages: jest
    .fn<typeof NotionService.prototype.searchPages>()
    .mockResolvedValue({
      pages: [mockPage],
      hasMore: false,
      nextCursor: undefined,
    }),
  getPage: jest
    .fn<typeof NotionService.prototype.getPage>()
    .mockResolvedValue(mockPage),
  createPage: jest
    .fn<typeof NotionService.prototype.createPage>()
    .mockResolvedValue(mockPage),
  updatePage: jest
    .fn<typeof NotionService.prototype.updatePage>()
    .mockResolvedValue(mockPage),
  listPages: jest
    .fn<typeof NotionService.prototype.listPages>()
    .mockResolvedValue({
      pages: [mockPage],
      hasMore: false,
    }),
  searchDatabases: jest
    .fn<typeof NotionService.prototype.searchDatabases>()
    .mockResolvedValue({
      results: [],
      has_more: false,
    }),
  getPageBlocks: jest
    .fn<typeof NotionService.prototype.getPageBlocks>()
    .mockResolvedValue([]),
};

// Mock the NotionService module
jest.mock("../../services/notion-service.js", () => ({
  NotionService: {
    initialize: jest.fn(),
    getInstance: jest.fn(() => mockNotionService),
  },
}));

// Mock the validation module
jest.mock("../../utils/validation.js", () => ({
  validateWithErrors: jest.fn(),
  ajv: {
    compile: jest.fn(),
  },
}));

jest.mock("../../utils/tool-validation.js", () => {
  const validateToolRequest = jest.fn((request: CallToolRequest) => {
    if (!request.params?.name) {
      throw new Error("Invalid tool request: missing tool name");
    }

    const tool = NOTION_TOOLS.find((t) => t.name === request.params.name);
    if (!tool) {
      throw new Error(
        `${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`
      );
    }

    // Validate arguments against the tool's schema if present
    if (tool.inputSchema && request.params.arguments) {
      const schema = tool.inputSchema;
      const args = request.params.arguments;

      // Check required fields
      if (schema.required && Array.isArray(schema.required)) {
        for (const field of schema.required) {
          // Map field names to match expected error messages
          const errorField = field === "databaseId" ? "database_id" : field;
          if (!(field in args)) {
            throw new Error(`Missing required argument: ${errorField}`);
          }
        }
      }
    }

    return tool;
  });

  return { validateToolRequest };
});

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
                uri: "notion://pages",
                text: JSON.stringify([mockPage], null, 2),
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
              parent: { database_id: "db123", type: "database_id" },
              properties: {
                title: {
                  title: [{ text: { content: "Test Page" } }],
                },
              },
              databaseId: "db123",
              userInstructions: "Create a test page",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Sampling response",
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
              userInstructions: "Update the page title",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Sampling response",
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

      it("should reject missing required arguments in create page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              properties: {
                title: {
                  title: [{ text: { content: "Test Page" } }],
                },
              },
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Missing required argument: database_id"
        );
      });

      it("should reject missing userInstructions in create page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              databaseId: "db123",
              properties: {
                title: {
                  title: [{ text: { content: "Test Page" } }],
                },
              },
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Missing required argument: userInstructions"
        );
      });

      it("should reject missing pageId in update page", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_update_notion_page",
            arguments: {
              properties: {
                title: {
                  title: [{ text: { content: "Updated Title" } }],
                },
              },
              userInstructions: "Update the page title",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Missing required argument: pageId"
        );
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

    describe("List and Search Operations", () => {
      it("should handle list pages with default maxResults", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_list_notion_pages",
            arguments: {},
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.listPages).toHaveBeenCalledWith({
          pageSize: 50,
        });
        expect(result).toBeDefined();
      });

      it("should handle list pages with custom maxResults", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_list_notion_pages",
            arguments: {
              maxResults: 10,
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.listPages).toHaveBeenCalledWith({
          pageSize: 10,
        });
        expect(result).toBeDefined();
      });

      it("should handle list databases with default maxResults", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_list_notion_databases",
            arguments: {},
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.searchDatabases).toHaveBeenCalledWith(50);
        expect(result).toBeDefined();
      });

      it("should handle search pages with default maxResults", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_search_notion_pages",
            arguments: {
              query: "test",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(mockNotionService.searchPages).toHaveBeenCalledWith("test", 10);
        expect(result).toBeDefined();
      });
    });

    describe("Page Creation and Update", () => {
      it("should reject create page when sampling metadata is missing", async () => {
        // Mock a tool without sampling metadata
        const mockTool = {
          ...NOTION_TOOLS.find(
            (t) => t.name === "systemprompt_create_notion_page"
          )!,
        };
        delete mockTool._meta;
        jest.spyOn(NOTION_TOOLS, "find").mockReturnValueOnce(mockTool);

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_notion_page",
            arguments: {
              databaseId: "db123",
              userInstructions: "Create a test page",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Tool call failed: Tool is missing required sampling configuration"
        );
      });

      it("should reject update page when sampling metadata is missing", async () => {
        // Mock a tool without sampling metadata
        const mockTool = {
          ...NOTION_TOOLS.find(
            (t) => t.name === "systemprompt_update_notion_page"
          )!,
        };
        delete mockTool._meta;
        jest.spyOn(NOTION_TOOLS, "find").mockReturnValueOnce(mockTool);

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_update_notion_page",
            arguments: {
              pageId: "page123",
              userInstructions: "Update the page",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Tool call failed: Tool is missing required sampling configuration"
        );
      });
    });
  });
});
