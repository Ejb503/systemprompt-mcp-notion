import { jest, describe, it, expect } from "@jest/globals";
import { validateToolRequest, getToolSchema } from "../tool-validation.js";
import { NOTION_TOOLS, TOOL_ERROR_MESSAGES } from "../../constants/tools.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import type { NotionTool } from "../../types/tool-schemas.js";

// Mock validation module
jest.mock("../validation.js", () => ({
  validateWithErrors: jest.fn(),
}));

describe("Tool Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateToolRequest", () => {
    it("should throw error for missing tool name", () => {
      const request = {
        method: "tools/call",
        params: {},
      } as CallToolRequest;

      expect(() => validateToolRequest(request)).toThrow(
        "Invalid tool request: missing tool name"
      );
    });

    it("should throw error for unknown tool", () => {
      const request = {
        method: "tools/call",
        params: {
          name: "unknown_tool",
          arguments: {},
        },
      } as CallToolRequest;

      expect(() => validateToolRequest(request)).toThrow(
        `${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} unknown_tool`
      );
    });

    it("should validate tool with schema", () => {
      const request = {
        method: "tools/call",
        params: {
          name: "systemprompt_get_notion_page",
          arguments: {
            pageId: "123",
          },
        },
      } as CallToolRequest;

      const tool = validateToolRequest(request);
      expect(tool).toBeDefined();
      expect(tool.name).toBe("systemprompt_get_notion_page");
    });

    it("should handle tool without input validation", () => {
      // Create a mock tool with empty schema
      const mockTool: NotionTool = {
        name: "test_tool",
        description: "Test tool",
        inputSchema: {
          type: "object" as const,
          properties: {},
          additionalProperties: false,
        },
      };
      jest.spyOn(NOTION_TOOLS, "find").mockReturnValueOnce(mockTool);

      const request = {
        method: "tools/call",
        params: {
          name: "test_tool",
          arguments: {},
        },
      } as CallToolRequest;

      const tool = validateToolRequest(request);
      expect(tool).toBeDefined();
      expect(tool.name).toBe("test_tool");
    });
  });

  describe("getToolSchema", () => {
    it("should return schema for valid tool", () => {
      const schema = getToolSchema("systemprompt_get_notion_page");
      expect(schema).toBeDefined();
    });

    it("should return undefined for unknown tool", () => {
      const schema = getToolSchema("unknown_tool");
      expect(schema).toBeUndefined();
    });
  });
});
