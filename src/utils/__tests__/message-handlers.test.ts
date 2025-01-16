import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import {
  extractPageId,
  updateUserMessageWithContent,
  injectVariablesIntoText,
  injectVariables,
  handleCreatePageCallback,
  handleEditPageCallback,
  handleCallback,
} from "../message-handlers";
import { NotionService } from "../../services/notion-service";
import { NOTION_CALLBACKS, XML_TAGS } from "../../constants/notion";
import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import type {
  NotionPage,
  CreatePageOptions,
  UpdatePageOptions,
} from "../../types/notion";

// Mock the NotionService
const mockNotionService = {
  createPage: jest.fn<(options: CreatePageOptions) => Promise<NotionPage>>(),
  updatePage: jest.fn<(options: UpdatePageOptions) => Promise<NotionPage>>(),
};

jest.mock("../../services/notion-service", () => ({
  NotionService: {
    getInstance: jest.fn(() => mockNotionService),
  },
}));

describe("message-handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractPageId", () => {
    test("extracts pageId from valid user message", () => {
      const messages: PromptMessage[] = [
        {
          role: "user",
          content: { type: "text", text: "<pageId>123-456</pageId>" },
        },
      ];
      expect(extractPageId(messages)).toBe("123-456");
    });

    test("returns undefined for no user message", () => {
      const messages: PromptMessage[] = [
        {
          role: "assistant",
          content: { type: "text", text: "<pageId>123-456</pageId>" },
        },
      ];
      expect(extractPageId(messages)).toBeUndefined();
    });

    test("returns undefined for non-text content", () => {
      const messages: PromptMessage[] = [
        {
          role: "user",
          content: { type: "image", data: "test-data", mimeType: "image/jpeg" },
        },
      ];
      expect(extractPageId(messages)).toBeUndefined();
    });
  });

  describe("updateUserMessageWithContent", () => {
    test("updates user message with content", () => {
      const messages: PromptMessage[] = [
        {
          role: "user",
          content: {
            type: "text",
            text: `some text${XML_TAGS.REQUEST_PARAMS_CLOSE}`,
          },
        },
      ];
      const blocks = { test: "content" };
      updateUserMessageWithContent(messages, blocks);
      expect(messages[0].content.type).toBe("text");
      expect(messages[0].content.text).toContain(
        JSON.stringify(blocks, null, 2)
      );
    });

    test("does nothing if no user message found", () => {
      const messages: PromptMessage[] = [
        {
          role: "assistant",
          content: { type: "text", text: "test" },
        },
      ];
      const originalMessages = [...messages];
      updateUserMessageWithContent(messages, {});
      expect(messages).toEqual(originalMessages);
    });
  });

  describe("injectVariablesIntoText", () => {
    test("replaces variables in text", () => {
      const text = "Hello {{name}}, your age is {{age}}";
      const variables = { name: "John", age: 30 };
      expect(injectVariablesIntoText(text, variables)).toBe(
        "Hello John, your age is 30"
      );
    });

    test("throws error for missing variables", () => {
      const text = "Hello {{name}}, your age is {{age}}";
      const variables = { name: "John" };
      expect(() => injectVariablesIntoText(text, variables)).toThrow(
        "Missing required variables"
      );
    });
  });

  describe("injectVariables", () => {
    test("injects variables into user message", () => {
      const message: PromptMessage = {
        role: "user",
        content: { type: "text", text: "Hello {{name}}" },
      };
      const variables = { name: "John" };
      const result = injectVariables(message, variables);
      expect(result.content.type).toBe("text");
      expect(result.content.text).toBe("Hello John");
    });

    test("returns original message for non-text content", () => {
      const message: PromptMessage = {
        role: "user",
        content: { type: "image", data: "test-data", mimeType: "image/jpeg" },
      };
      const variables = { name: "John" };
      const result = injectVariables(message, variables);
      expect(result).toEqual(message);
    });
  });

  describe("handleCreatePageCallback", () => {
    const mockPage: NotionPage = {
      id: "test-id",
      title: "Test Page",
      url: "https://notion.so/test-id",
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      properties: {},
      parent: { type: "database_id", database_id: "test-db" },
    };

    beforeEach(() => {
      mockNotionService.createPage.mockResolvedValue(mockPage);
    });

    test("creates page successfully", async () => {
      const result = {
        role: "assistant" as const,
        model: "test-model",
        content: {
          type: "text" as const,
          text: JSON.stringify({
            parent: { database_id: "test-db" },
            properties: {
              title: [{ text: { content: "Test" } }],
            },
          }),
        },
      };

      const response = await handleCreatePageCallback(result);
      expect(response.content.type).toBe("text");
      expect(response.content.text).toContain("test-id");
    });

    test("throws error for invalid content type", async () => {
      const result = {
        role: "assistant" as const,
        model: "test-model",
        content: {
          type: "image" as const,
          data: "test-data",
          mimeType: "image/jpeg",
        },
      };

      await expect(handleCreatePageCallback(result)).rejects.toThrow();
    });
  });

  describe("handleEditPageCallback", () => {
    const mockPage: NotionPage = {
      id: "a1b2c3d4-e5f6-4321-9876-123456789abc",
      title: "Test Page",
      url: "https://notion.so/test-id",
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      properties: {},
      parent: { type: "database_id", database_id: "test-db" },
    };

    beforeEach(() => {
      mockNotionService.updatePage.mockResolvedValue(mockPage);
    });

    test("updates page successfully", async () => {
      const result = {
        role: "assistant" as const,
        model: "test-model",
        content: {
          type: "text" as const,
          text: JSON.stringify({
            pageId: "a1b2c3d4-e5f6-4321-9876-123456789abc",
            properties: {
              title: [{ text: { content: "Updated" } }],
            },
          }),
        },
      };

      const response = await handleEditPageCallback(result);
      expect(response.content.type).toBe("text");
      expect(response.content.text).toContain(mockPage.id);
    });

    test("throws error for invalid page ID", async () => {
      const result = {
        role: "assistant" as const,
        model: "test-model",
        content: {
          type: "text" as const,
          text: JSON.stringify({
            pageId: "invalid!id",
            properties: {},
          }),
        },
      };

      await expect(handleEditPageCallback(result)).rejects.toThrow(
        "Invalid page ID format"
      );
    });
  });

  describe("handleCallback", () => {
    test("handles create page callback", async () => {
      const mockResult = {
        role: "assistant" as const,
        model: "test-model",
        content: {
          type: "text" as const,
          text: JSON.stringify({
            parent: { database_id: "test-db" },
            properties: {
              title: [{ text: { content: "Test" } }],
            },
          }),
        },
      };

      const response = await handleCallback(
        NOTION_CALLBACKS.CREATE_PAGE,
        mockResult
      );
      expect(response.content.type).toBe("text");
      expect(response.content.text).toContain("test-id");
    });

    test("returns original result for unknown callback", async () => {
      const mockResult = {
        role: "assistant" as const,
        model: "test-model",
        content: { type: "text" as const, text: "test" },
      };

      const response = await handleCallback("unknown", mockResult);
      expect(response).toEqual(mockResult);
    });
  });
});
