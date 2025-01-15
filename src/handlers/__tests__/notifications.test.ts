import { jest } from "@jest/globals";
import {
  SystempromptPromptResponse,
  SystempromptBlockResponse,
} from "../../types/index.js";
import {
  sendPromptChangedNotification,
  sendResourceChangedNotification,
} from "../notifications.js";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import { server } from "../../index.js";

jest.mock("../../services/systemprompt-service.js");

// Mock the SDK module
jest.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: jest.fn(),
}));

jest.mock("../../index.js", () => ({
  __esModule: true,
  server: {
    notification: jest.fn(),
  },
}));

describe("Notifications", () => {
  let mockSystemPromptService: jest.Mocked<SystemPromptService>;

  beforeEach(() => {
    mockSystemPromptService = {
      getAllPrompts: jest.fn(),
      createPrompt: jest.fn(),
      editPrompt: jest.fn(),
      deletePrompt: jest.fn(),
      listBlocks: jest.fn(),
      createBlock: jest.fn(),
      editBlock: jest.fn(),
      deleteBlock: jest.fn(),
    } as unknown as jest.Mocked<SystemPromptService>;

    jest
      .spyOn(SystemPromptService, "getInstance")
      .mockReturnValue(mockSystemPromptService);
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("sendPromptChangedNotification", () => {
    it("should send a notification when prompts are fetched successfully", async () => {
      const mockPrompts: SystempromptPromptResponse[] = [
        {
          id: "test-prompt",
          metadata: {
            title: "Test Prompt",
            description: "A test prompt",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "published",
            author: "test",
            log_message: "Created",
          },
          instruction: {
            static: "Test instruction",
            dynamic: "Test dynamic",
            state: "Test state",
          },
          input: {
            name: "test_input",
            description: "Test input description",
            type: ["message"],
            schema: {},
          },
          output: {
            name: "test_output",
            description: "Test output description",
            type: ["message"],
            schema: {},
          },
          _link: "test-link",
        },
      ];

      mockSystemPromptService.getAllPrompts.mockResolvedValue(mockPrompts);

      await sendPromptChangedNotification();

      expect(server.notification).toHaveBeenCalledWith({
        method: "notifications/prompts/list_changed",
        params: {
          _meta: {
            prompts: mockPrompts,
          },
          prompts: [
            {
              name: "Test Prompt",
              description: "A test prompt",
              arguments: [],
            },
          ],
        },
      });
    });

    it("should handle errors when fetching prompts", async () => {
      mockSystemPromptService.getAllPrompts.mockRejectedValue(
        new Error("Test error")
      );

      await expect(sendPromptChangedNotification()).rejects.toThrow(
        "Test error"
      );
    });
  });

  describe("sendResourceChangedNotification", () => {
    it("should send a notification when blocks are fetched successfully", async () => {
      const mockBlocks: SystempromptBlockResponse[] = [
        {
          id: "test-block",
          content: "Test content",
          prefix: "test",
          metadata: {
            title: "Test Block",
            description: "A test block",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "published",
            author: "test",
            log_message: "Created",
          },
        },
      ];

      mockSystemPromptService.listBlocks.mockResolvedValue(mockBlocks);

      await sendResourceChangedNotification();

      expect(server.notification).toHaveBeenCalledWith({
        method: "notifications/resources/list_changed",
        params: {
          _meta: {},
          resources: [
            {
              name: "Test Block",
              description: "A test block",
              uri: "resource:///block/test-block",
              mimeType: "text/plain",
            },
          ],
        },
      });
    });

    it("should handle errors when fetching blocks", async () => {
      mockSystemPromptService.listBlocks.mockRejectedValue(
        new Error("Test error")
      );

      await expect(sendResourceChangedNotification()).rejects.toThrow(
        "Test error"
      );
    });
  });
});
