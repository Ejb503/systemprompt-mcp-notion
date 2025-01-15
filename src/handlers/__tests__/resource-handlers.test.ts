import { jest } from "@jest/globals";
import {
  handleListResources,
  handleResourceCall,
} from "../resource-handlers.js";

describe("Resource Handlers", () => {
  describe("handleListResources", () => {
    it("should list the default agent resource", async () => {
      const result = await handleListResources({
        method: "resources/list",
      });

      expect(result.resources).toEqual([
        {
          uri: "resource:///block/default",
          name: "Systemprompt Notion Agent",
          description:
            "An expert agent for managing and organizing content in Notion workspaces",
          mimeType: "text/plain",
        },
      ]);
      expect(result._meta).toEqual({});
    });
  });

  describe("handleResourceCall", () => {
    it("should get the default agent resource", async () => {
      const result = await handleResourceCall({
        method: "resources/read",
        params: {
          uri: "resource:///block/default",
        },
      });

      const parsedContent = JSON.parse(result.contents[0].text as string) as {
        name: string;
        description: string;
        instruction: string;
        voice: string;
        config: {
          model: string;
          generationConfig: {
            responseModalities: string;
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: string;
                };
              };
            };
          };
        };
      };

      expect(result.contents[0].uri).toBe("resource:///block/default");
      expect(result.contents[0].mimeType).toBe("text/plain");
      expect(parsedContent).toEqual({
        name: "Systemprompt Notion Agent",
        description:
          "An expert agent for managing and organizing content in Notion workspaces",
        instruction: expect.stringContaining("You are a specialized agent"),
        voice: "Kore",
        config: {
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            responseModalities: "audio",
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore",
                },
              },
            },
          },
        },
      });
      expect(result._meta).toEqual({ tag: ["agent"] });
    });

    it("should handle invalid URI format", async () => {
      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "invalid-uri",
          },
        })
      ).rejects.toThrow(
        "Invalid resource URI format - expected resource:///block/{id}"
      );
    });

    it("should handle non-default resource request", async () => {
      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "resource:///block/nonexistent",
          },
        })
      ).rejects.toThrow("Resource not found");
    });
  });
});
