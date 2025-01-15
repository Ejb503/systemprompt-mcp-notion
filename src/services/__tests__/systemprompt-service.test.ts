import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { SystemPromptService } from "../systemprompt-service.js";
import type { SystempromptPromptResponse } from "../../types/index.js";

// Mock fetch
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(""),
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

global.fetch = mockFetch as unknown as typeof fetch;

describe("SystemPromptService", () => {
  let service: SystemPromptService;
  const mockApiKey = "test-api-key";
  const baseUrl = "http://127.0.0.1/v1";

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the instance before each test
    (SystemPromptService as any).instance = null;
    SystemPromptService.initialize(mockApiKey, baseUrl);
    service = SystemPromptService.getInstance();
  });

  describe("initialization", () => {
    it("should throw error when initialized without API key", () => {
      (SystemPromptService as any).instance = null;
      expect(() => SystemPromptService.initialize("")).toThrow(
        "API key is required"
      );
    });

    it("should throw error when getInstance called before initialization", () => {
      (SystemPromptService as any).instance = null;
      expect(() => SystemPromptService.getInstance()).toThrow(
        "SystemPromptService must be initialized with an API key first"
      );
    });
  });

  describe("request error handling", () => {
    it("should handle invalid API key", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ message: "Invalid API key" }),
        })
      );

      await expect(service.getAllPrompts()).rejects.toThrow("Invalid API key");
    });

    it("should handle network errors", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.reject(new Error("API request failed"))
      );
      await expect(service.getAllPrompts()).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle invalid JSON response", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error("Invalid JSON")),
        })
      );

      await expect(service.getAllPrompts()).rejects.toThrow(
        "Failed to parse API response"
      );
    });
  });

  describe("block operations", () => {
    const mockBlock = {
      id: "test-block-id",
      content: "Test content",
      prefix: "test-prefix",
      metadata: {
        title: "Test Block",
        description: "Test description",
        created: "2024-01-01",
        updated: "2024-01-01",
      },
      _link: "test-link",
    };

    it("should list blocks successfully", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockBlock]),
        })
      );

      const result = await service.listBlocks();
      expect(result).toEqual([mockBlock]);
    });

    it("should get a block successfully", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBlock),
        })
      );

      const result = await service.getBlock(mockBlock.id);
      expect(result).toEqual(mockBlock);
    });
  });

  describe("prompt operations", () => {
    it("should get all prompts successfully", async () => {
      const mockPrompts = [
        {
          id: "test-uuid",
          instruction: {
            static: "Test instruction",
            dynamic: "",
            state: "",
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
          metadata: {
            title: "Test prompt",
            description: "Test description",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Created",
          },
          _link: "test-link",
        },
      ];
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPrompts),
        })
      );

      const result = await service.getAllPrompts();
      expect(result).toEqual(mockPrompts);
    });
  });
});
