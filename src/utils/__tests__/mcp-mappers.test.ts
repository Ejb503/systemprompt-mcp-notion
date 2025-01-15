import {
  mapPromptToGetPromptResult,
  mapPromptsToListPromptsResult,
  mapBlockToReadResourceResult,
  mapBlocksToListResourcesResult,
} from "../mcp-mappers.js";
import {
  mockSystemPromptResult,
  mockArrayPromptResult,
  mockNestedPromptResult,
} from "../../__tests__/mock-objects.js";
import type { SystempromptBlockResponse } from "../../types/index.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

describe("MCP Mappers", () => {
  describe("mapPromptToGetPromptResult", () => {
    it("should correctly map a single prompt to GetPromptResult format", () => {
      const result = mapPromptToGetPromptResult(mockSystemPromptResult);

      expect(result.name).toBe(mockSystemPromptResult.metadata.title);
      expect(result.description).toBe(
        mockSystemPromptResult.metadata.description
      );
      expect(result.messages).toEqual([
        {
          role: "assistant",
          content: {
            type: "text",
            text: mockSystemPromptResult.instruction.static,
          },
        },
      ]);
      expect(result.tools).toEqual([]);
      expect(result._meta).toEqual({ prompt: mockSystemPromptResult });
    });

    it("should handle prompts with array inputs", () => {
      const result = mapPromptToGetPromptResult(mockArrayPromptResult);

      expect(result.name).toBe(mockArrayPromptResult.metadata.title);
      expect(result.description).toBe(
        mockArrayPromptResult.metadata.description
      );
      expect(result.messages).toEqual([
        {
          role: "assistant",
          content: {
            type: "text",
            text: mockArrayPromptResult.instruction.static,
          },
        },
      ]);
      expect(result.tools).toEqual([]);
      expect(result._meta).toEqual({ prompt: mockArrayPromptResult });
    });

    it("should handle prompts with nested object inputs", () => {
      const result = mapPromptToGetPromptResult(mockNestedPromptResult);

      expect(result.name).toBe(mockNestedPromptResult.metadata.title);
      expect(result.description).toBe(
        mockNestedPromptResult.metadata.description
      );
      expect(result.messages).toEqual([
        {
          role: "assistant",
          content: {
            type: "text",
            text: mockNestedPromptResult.instruction.static,
          },
        },
      ]);
      expect(result.tools).toEqual([]);
      expect(result._meta).toEqual({ prompt: mockNestedPromptResult });
    });
  });

  describe("mapPromptsToListPromptsResult", () => {
    it("should correctly map an array of prompts to ListPromptsResult format", () => {
      const prompts = [mockSystemPromptResult, mockArrayPromptResult];
      const result = mapPromptsToListPromptsResult(prompts);

      expect(result.prompts).toHaveLength(2);
      expect(result.prompts[0]).toEqual({
        name: mockSystemPromptResult.metadata.title,
        description: mockSystemPromptResult.metadata.description,
        arguments: [],
      });
      expect(result._meta).toEqual({ prompts });
    });

    it("should handle empty prompt array", () => {
      const result = mapPromptsToListPromptsResult([]);

      expect(result.prompts).toHaveLength(0);
      expect(result._meta).toEqual({ prompts: [] });
    });
  });

  describe("mapBlockToReadResourceResult", () => {
    const mockBlock: SystempromptBlockResponse = {
      id: "block-123",
      content: "Test block content",
      prefix: "{{message}}",
      metadata: {
        title: "Test Block",
        description: "Test block description",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: 1,
        status: "published",
        author: "test-user",
        log_message: "Initial creation",
      },
    };

    it("should correctly map a single block to ReadResourceResult format", () => {
      const result = mapBlockToReadResourceResult(mockBlock);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]).toEqual({
        uri: `resource:///block/${mockBlock.id}`,
        mimeType: "text/plain",
        text: mockBlock.content,
      });
      expect(result._meta).toEqual({});
    });
  });

  describe("mapBlocksToListResourcesResult", () => {
    const mockBlocks: SystempromptBlockResponse[] = [
      {
        id: "block-123",
        content: "Test block content 1",
        prefix: "{{message}}",
        metadata: {
          title: "Test Block 1",
          description: "Test block description 1",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          status: "published",
          author: "test-user",
          log_message: "Initial creation",
        },
      },
      {
        id: "block-456",
        content: "Test block content 2",
        prefix: "{{message}}",
        metadata: {
          title: "Test Block 2",
          description: null,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          status: "published",
          author: "test-user",
          log_message: "Initial creation",
        },
      },
    ];

    it("should correctly map an array of blocks to ListResourcesResult format", () => {
      const result = mapBlocksToListResourcesResult(mockBlocks);

      expect(result.resources).toHaveLength(2);
      expect(result.resources[0]).toEqual({
        uri: `resource:///block/${mockBlocks[0].id}`,
        name: mockBlocks[0].metadata.title,
        description: mockBlocks[0].metadata.description,
        mimeType: "text/plain",
      });
      expect(result.resources[1]).toEqual({
        uri: `resource:///block/${mockBlocks[1].id}`,
        name: mockBlocks[1].metadata.title,
        description: undefined,
        mimeType: "text/plain",
      });
      expect(result._meta).toEqual({});
    });

    it("should handle empty block array", () => {
      const result = mapBlocksToListResourcesResult([]);

      expect(result.resources).toHaveLength(0);
      expect(result._meta).toEqual({});
    });
  });
});
