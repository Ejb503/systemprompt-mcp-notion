import { jest } from "@jest/globals";
import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import type { NotionPrompt } from "../../types/notion-types.js";

const mockPrompts = [
  {
    name: "Notion Page Creator",
    description: "Creates a new Notion page",
    arguments: [
      {
        name: "title",
        description: "The title of the page",
        required: true,
      },
      {
        name: "content",
        description: "The content of the page",
        required: true,
      },
    ],
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Title: {{title}}\nContent: {{content}}",
        },
      },
    ],
  },
  {
    name: "Test Prompt",
    description: "Test Description",
    arguments: [],
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Test message",
        },
      },
    ],
  },
];

// Set up the default mock implementation
jest.mock("../../types/notion-prompts.js", () => ({
  NOTION_PROMPTS: mockPrompts,
}));

describe("Prompt Handlers", () => {
  describe("handleListPrompts", () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it("should handle errors gracefully", async () => {
      // Mock NOTION_PROMPTS to be undefined
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: undefined,
      }));

      const { handleListPrompts } = require("../prompt-handlers.js");
      await expect(
        handleListPrompts({ method: "prompts/list" })
      ).rejects.toThrow("Failed to fetch prompts");
    });

    it("should handle errors when prompts are not accessible", async () => {
      // Mock NOTION_PROMPTS to be undefined
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: undefined,
      }));

      const { handleListPrompts } = require("../prompt-handlers.js");
      await expect(
        handleListPrompts({ method: "prompts/list" })
      ).rejects.toThrow("Failed to fetch prompts");
    });
  });

  describe("handleGetPrompt", () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it("should handle unknown prompts", async () => {
      // Mock NOTION_PROMPTS with a valid array but without the requested prompt
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: [
          {
            name: "Some Other Prompt",
            description: "Test Description",
            messages: [],
          },
        ],
      }));

      const { handleGetPrompt } = require("../prompt-handlers.js");
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Unknown Prompt" },
        })
      ).rejects.toThrow("Prompt not found: Unknown Prompt");
    });

    it("should inject variables into message content", async () => {
      // Mock NOTION_PROMPTS with a prompt that has variables to inject
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: [
          {
            name: "Notion Page Creator",
            description: "Test Description",
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Create a page with title {{title}} and content {{content}}",
                },
              },
            ],
          },
        ],
      }));

      const { handleGetPrompt } = require("../prompt-handlers.js");
      const result = await handleGetPrompt({
        method: "prompts/get",
        params: {
          name: "Notion Page Creator",
          arguments: {
            title: "Test Title",
            content: "Test Content",
          },
        },
      });

      // Verify variables are injected
      const userMessage = result.messages.find(
        (m: { role: string; content: { type: string; text?: string } }) =>
          m.role === "user" && m.content.type === "text"
      );
      expect(userMessage?.content.text).toContain("Test Title");
      expect(userMessage?.content.text).toContain("Test Content");
    });

    it("should handle missing messages gracefully", async () => {
      // Mock NOTION_PROMPTS with a prompt without messages
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: [
          {
            name: "Test Prompt",
            description: "Test Description",
            arguments: [],
          },
        ],
      }));

      const { handleGetPrompt } = require("../prompt-handlers.js");
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Test Prompt" },
        })
      ).rejects.toThrow("Messages not found for prompt: Test Prompt");
    });

    it("should handle missing messages for a prompt", async () => {
      // Mock NOTION_PROMPTS with empty messages
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: [
          {
            name: "Test Prompt",
            messages: [],
          },
        ],
      }));

      const { handleGetPrompt } = require("../prompt-handlers.js");
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Test Prompt" },
        })
      ).rejects.toThrow("Messages not found for prompt: Test Prompt");
    });

    it("should handle undefined messages array", async () => {
      // Mock NOTION_PROMPTS with undefined messages
      jest.doMock("../../types/notion-prompts.js", () => ({
        NOTION_PROMPTS: [
          {
            name: "Test Prompt",
            messages: undefined,
          },
        ],
      }));

      const { handleGetPrompt } = require("../prompt-handlers.js");
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Test Prompt" },
        })
      ).rejects.toThrow("Messages not found for prompt: Test Prompt");
    });
  });
});
