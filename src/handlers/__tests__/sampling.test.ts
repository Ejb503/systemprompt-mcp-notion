import { jest } from "@jest/globals";
import { server } from "../../index.js";
import { sendSamplingRequest } from "../sampling.js";
import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";

// Mock the server
jest.mock("../../index.js", () => ({
  server: {
    createMessage: jest.fn(),
  },
}));

const mockCreateMessage = server.createMessage as jest.MockedFunction<
  typeof server.createMessage
>;

describe("Sampling Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Message Validation", () => {
    it("should accept valid text messages", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
        },
      };

      const mockResponse: CreateMessageResult = {
        role: "assistant",
        content: {
          type: "text",
          text: "Response",
        },
        model: "test-model",
      };

      mockCreateMessage.mockResolvedValueOnce(mockResponse);
      await expect(sendSamplingRequest(request)).resolves.toEqual(mockResponse);
    });

    it("should reject messages with invalid role", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "invalid" as any,
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        'Message role must be either "user" or "assistant"'
      );
    });

    it("should reject text messages without text field", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
              } as any,
            },
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Text content must have a string text field"
      );
    });

    it("should reject text messages with non-string text field", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: 123 as any,
              },
            },
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Text content must have a string text field"
      );
    });

    it("should reject messages with invalid content type", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "invalid" as any,
                data: "base64data",
                mimeType: "image/png",
              },
            },
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        'Content type must be either "text" or "image"'
      );
    });

    it("should reject messages without content object", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
            } as any,
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Message must have a content object"
      );
    });

    it("should accept valid image messages", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "image",
                data: "base64data",
                mimeType: "image/png",
              },
            },
          ],
          maxTokens: 100,
        },
      };

      const mockResponse: CreateMessageResult = {
        role: "assistant",
        content: {
          type: "text",
          text: "Response",
        },
        model: "test-model",
      };

      mockCreateMessage.mockResolvedValueOnce(mockResponse);
      await expect(sendSamplingRequest(request)).resolves.toEqual(mockResponse);
    });

    it("should reject image messages without data", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "image",
                mimeType: "image/png",
              } as any,
            },
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Image content must have a base64 data field"
      );
    });

    it("should reject image messages without mimeType", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "image",
                data: "base64data",
              } as any,
            },
          ],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Image content must have a mimeType field"
      );
    });
  });

  describe("Request Validation", () => {
    it("should reject requests without messages", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [],
          maxTokens: 100,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Request must have at least one message"
      );
    });

    it("should reject requests with invalid maxTokens", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: -1,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "maxTokens must be a positive number"
      );
    });

    it("should reject requests with invalid temperature", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
          temperature: 2,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "temperature must be a number between 0 and 1"
      );
    });

    it("should reject requests with invalid includeContext", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
          includeContext: "invalid" as any,
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        'includeContext must be "none", "thisServer", or "allServers"'
      );
    });

    it("should reject requests without params", async () => {
      const request = {
        method: "sampling/createMessage",
      } as CreateMessageRequest;

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Request must have params"
      );
    });

    it("should validate model preferences", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
          modelPreferences: {
            costPriority: 2,
            speedPriority: 0.5,
            intelligencePriority: 0.5,
          },
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Model preference priorities must be numbers between 0 and 1"
      );
    });

    it("should accept valid model preferences", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
          modelPreferences: {
            costPriority: 0.3,
            speedPriority: 0.3,
            intelligencePriority: 0.4,
          },
        },
      };

      const mockResponse: CreateMessageResult = {
        role: "assistant",
        content: {
          type: "text",
          text: "Response",
        },
        model: "test-model",
      };

      mockCreateMessage.mockResolvedValueOnce(mockResponse);
      await expect(sendSamplingRequest(request)).resolves.toEqual(mockResponse);
    });
  });

  describe("Sampling Request", () => {
    it("should forward valid requests to the server", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
        },
      };

      const mockResponse: CreateMessageResult = {
        role: "assistant",
        content: {
          type: "text",
          text: "Response",
        },
        model: "test-model",
      };

      mockCreateMessage.mockResolvedValueOnce(mockResponse);

      const result = await sendSamplingRequest(request);
      expect(result).toEqual(mockResponse);
      expect(server.createMessage).toHaveBeenCalledWith(request.params);
    });

    it("should handle server errors gracefully", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello world",
              },
            },
          ],
          maxTokens: 100,
        },
      };

      const error = new Error("Server error");
      mockCreateMessage.mockRejectedValueOnce(error);

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Sampling request failed: Server error"
      );
    });
  });
});
