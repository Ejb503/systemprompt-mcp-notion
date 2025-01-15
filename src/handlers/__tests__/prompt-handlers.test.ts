import { jest } from "@jest/globals";
import { handleListPrompts, handleGetPrompt } from "../prompt-handlers.js";

describe("Prompt Handlers", () => {
  describe("handleListPrompts", () => {
    it("should return list of prompts with correct schema", async () => {
      const result = await handleListPrompts({ method: "prompts/list" });

      expect(result.prompts).toBeDefined();
      expect(Array.isArray(result.prompts)).toBe(true);
      expect(result.prompts.length).toBeGreaterThan(0);

      // Check first prompt structure
      const firstPrompt = result.prompts[0];
      expect(firstPrompt).toHaveProperty("name");
      expect(firstPrompt).toHaveProperty("description");
      expect(firstPrompt).toHaveProperty("arguments");
      expect(Array.isArray(firstPrompt.arguments)).toBe(true);

      // Verify no messages are included in list response
      expect(firstPrompt).not.toHaveProperty("messages");
    });
  });

  describe("handleGetPrompt", () => {
    it("should return prompt by name with correct structure", async () => {
      const result = await handleGetPrompt({
        method: "prompts/get",
        params: { name: "Notion Page Manager" },
      });

      // Check basic prompt properties
      expect(result).toMatchObject({
        name: "Notion Page Manager",
        description: expect.any(String),
        arguments: expect.arrayContaining([
          expect.objectContaining({
            name: "action",
            description: expect.any(String),
            required: true,
          }),
          expect.objectContaining({
            name: "query",
            description: expect.any(String),
            required: true,
          }),
          expect.objectContaining({
            name: "maxResults",
            description: expect.any(String),
            required: false,
          }),
        ]),
      });

      // Check messages structure
      expect(result.messages).toBeDefined();
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages[0]).toMatchObject({
        role: "assistant",
        content: {
          type: "text",
          text: expect.any(String),
        },
      });
    });

    it("should throw error for unknown prompt", async () => {
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Unknown Prompt" },
        })
      ).rejects.toThrow("Prompt not found: Unknown Prompt");
    });

    it("should return Database Content Organizer prompt with required arguments", async () => {
      const result = await handleGetPrompt({
        method: "prompts/get",
        params: { name: "Database Content Organizer" },
      });

      expect(result.arguments).toEqual([
        {
          name: "databaseId",
          description: "ID of the database to work with",
          required: true,
        },
        {
          name: "maxResults",
          description: "Maximum number of items to retrieve",
          required: false,
        },
      ]);
    });
  });
});
