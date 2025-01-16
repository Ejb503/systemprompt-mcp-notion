import { jest } from "@jest/globals";
import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import type { NotionPrompt } from "../../types/notion.js";
import { handleListPrompts, handleGetPrompt } from "../prompt-handlers.js";

// Mock the constants modules
jest.mock("../../constants/instructions.js", () => ({
  NOTION_PAGE_CREATOR_INSTRUCTIONS: "Test assistant instruction",
  NOTION_PAGE_EDITOR_INSTRUCTIONS: "Test editor instruction",
}));

jest.mock("../../constants/notion.js", () => ({
  NOTION_CALLBACKS: {
    CREATE_PAGE: "systemprompt_create_notion_page_complex",
    EDIT_PAGE: "systemprompt_edit_notion_page_complex",
  },
  NOTION_PAGE_CREATOR_SCHEMA: {
    type: "object",
    properties: {},
    required: ["parent", "properties"],
  },
  NOTION_PAGE_EDITOR_SCHEMA: {
    type: "object",
    properties: {},
    required: ["pageId"],
  },
}));

const mockPrompts: NotionPrompt[] = [
  {
    name: "Notion Page Creator",
    description:
      "Generates a rich, detailed Notion page that expands upon basic inputs into comprehensive, well-structured content",
    arguments: [
      {
        name: "databaseId",
        description: "The ID of the database to create the page in",
        required: true,
      },
      {
        name: "userInstructions",
        description:
          "Basic instructions or outline for the page content that will be expanded into a comprehensive structure",
        required: true,
      },
    ],
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "Test assistant instruction",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `
<input>
  <requestParams>
    <databaseId>{{databaseId}}</databaseId>
    <userInstructions>{{userInstructions}}</userInstructions>
  </requestParams>
</input>`,
        },
      },
    ],
    _meta: {
      complexResponseSchema: {
        type: "object",
        properties: {},
        required: ["parent", "properties"],
      },
      callback: "systemprompt_create_notion_page_complex",
    },
  },
  {
    name: "Notion Page Editor",
    description:
      "Modifies an existing Notion page based on user instructions while preserving its core structure and content",
    arguments: [
      {
        name: "pageId",
        description: "The ID of the page to edit",
        required: true,
      },
      {
        name: "userInstructions",
        description: "Instructions for how to modify the page content",
        required: true,
      },
    ],
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "Test editor instruction",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `
<input>
  <requestParams>
    <pageId>{{pageId}}</pageId>
    <userInstructions>{{userInstructions}}</userInstructions>
  </requestParams>
</input>`,
        },
      },
    ],
    _meta: {
      complexResponseSchema: {
        type: "object",
        properties: {},
        required: ["pageId"],
      },
      callback: "systemprompt_edit_notion_page_complex",
    },
  },
];

describe("Prompt Handlers", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Set up default mocks
    jest.doMock("../../constants/prompts.js", () => ({
      NOTION_PROMPTS: mockPrompts,
    }));
  });

  describe("handleListPrompts", () => {
    it("should return a list of prompts without messages", async () => {
      const result = await handleListPrompts({ method: "prompts/list" });
      const expectedPrompts = mockPrompts.map(({ messages, ...rest }) => rest);
      expect(result.prompts).toEqual(expectedPrompts);
    });

    it("should handle errors gracefully", async () => {
      // Override mock for this specific test
      await jest.isolateModules(async () => {
        jest.doMock("../../constants/prompts.js", () => ({
          NOTION_PROMPTS: undefined,
        }));

        const { handleListPrompts } = await import("../prompt-handlers.js");
        await expect(
          handleListPrompts({ method: "prompts/list" })
        ).rejects.toThrow("Failed to fetch prompts");
      });
    });
  });

  describe("handleGetPrompt", () => {
    it("should handle invalid prompts array", async () => {
      // Override mock for this specific test
      await jest.isolateModules(async () => {
        jest.doMock("../../constants/prompts.js", () => ({
          NOTION_PROMPTS: "not an array",
        }));

        const { handleGetPrompt } = await import("../prompt-handlers.js");
        await expect(
          handleGetPrompt({
            method: "prompts/get",
            params: { name: "Test Prompt" },
          })
        ).rejects.toThrow("Failed to fetch prompts");
      });
    });

    it("should handle unknown prompts", async () => {
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Unknown Prompt" },
        })
      ).rejects.toThrow("Prompt not found: Unknown Prompt");
    });

    it("should inject variables into message content", async () => {
      const result = await handleGetPrompt({
        method: "prompts/get",
        params: {
          name: "Notion Page Creator",
          arguments: {
            databaseId: "test-db-123",
            userInstructions: "Create a test page",
          },
        },
      });

      // Verify variables are injected
      const userMessage = result.messages.find(
        (m) => m.role === "user" && m.content.type === "text"
      );
      expect(userMessage?.content.text).toBe(`
<input>
  <requestParams>
    <databaseId>test-db-123</databaseId>
    <userInstructions>Create a test page</userInstructions>
  </requestParams>
</input>`);
    });

    it("should handle missing messages gracefully", async () => {
      // Override mock for this specific test
      jest.isolateModules(async () => {
        jest.doMock("../../constants/prompts.js", () => ({
          NOTION_PROMPTS: [
            {
              name: "Test Prompt",
              description: "Test Description",
              arguments: [],
              _meta: {
                complexResponseSchema: {
                  type: "object",
                  properties: {},
                },
                callback: "test",
              },
            },
          ],
        }));

        const { handleGetPrompt } = await import("../prompt-handlers.js");
        await expect(
          handleGetPrompt({
            method: "prompts/get",
            params: { name: "Test Prompt" },
          })
        ).rejects.toThrow("Messages not found for prompt: Test Prompt");
      });
    });

    it("should handle missing messages for a prompt", async () => {
      // Override mock for this specific test
      jest.isolateModules(async () => {
        jest.doMock("../../constants/prompts.js", () => ({
          NOTION_PROMPTS: [
            {
              name: "Test Prompt",
              description: "Test Description",
              messages: [],
              _meta: {
                complexResponseSchema: {
                  type: "object",
                  properties: {},
                },
                callback: "test",
              },
            },
          ],
        }));

        const { handleGetPrompt } = await import("../prompt-handlers.js");
        await expect(
          handleGetPrompt({
            method: "prompts/get",
            params: { name: "Test Prompt" },
          })
        ).rejects.toThrow("Messages not found for prompt: Test Prompt");
      });
    });

    it("should handle undefined messages array", async () => {
      // Override mock for this specific test
      jest.isolateModules(async () => {
        jest.doMock("../../constants/prompts.js", () => ({
          NOTION_PROMPTS: [
            {
              name: "Test Prompt",
              description: "Test Description",
              messages: undefined,
              _meta: {
                complexResponseSchema: {
                  type: "object",
                  properties: {},
                },
                callback: "test",
              },
            },
          ],
        }));

        const { handleGetPrompt } = await import("../prompt-handlers.js");
        await expect(
          handleGetPrompt({
            method: "prompts/get",
            params: { name: "Test Prompt" },
          })
        ).rejects.toThrow("Messages not found for prompt: Test Prompt");
      });
    });

    it("should handle undefined arguments array", async () => {
      // Override mock for this specific test
      await jest.isolateModules(async () => {
        jest.doMock("../../constants/prompts.js", () => ({
          NOTION_PROMPTS: [
            {
              name: "Test Prompt",
              description: "Test Description",
              messages: [
                {
                  role: "assistant",
                  content: {
                    type: "text",
                    text: "Test instruction",
                  },
                },
              ],
              _meta: {
                complexResponseSchema: {
                  type: "object",
                  properties: {},
                },
                callback: "test",
              },
            },
          ],
        }));

        const { handleGetPrompt } = await import("../prompt-handlers.js");
        const result = await handleGetPrompt({
          method: "prompts/get",
          params: { name: "Test Prompt" },
        });

        expect(result.arguments).toEqual([]);
      });
    });

    it("should return all expected fields in prompt response", async () => {
      const result = await handleGetPrompt({
        method: "prompts/get",
        params: {
          name: "Notion Page Creator",
          arguments: {
            databaseId: "test-db-123",
            userInstructions: "Create a test page",
          },
        },
      });

      expect(result).toEqual({
        name: "Notion Page Creator",
        description:
          "Generates a rich, detailed Notion page that expands upon basic inputs into comprehensive, well-structured content",
        arguments: [
          {
            name: "databaseId",
            description: "The ID of the database to create the page in",
            required: true,
          },
          {
            name: "userInstructions",
            description:
              "Basic instructions or outline for the page content that will be expanded into a comprehensive structure",
            required: true,
          },
        ],
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "Test assistant instruction",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `
<input>
  <requestParams>
    <databaseId>test-db-123</databaseId>
    <userInstructions>Create a test page</userInstructions>
  </requestParams>
</input>`,
            },
          },
        ],
        _meta: {
          complexResponseSchema: {
            type: "object",
            properties: {},
            required: ["parent", "properties"],
          },
          callback: "systemprompt_create_notion_page_complex",
        },
      });
    });
  });
});
