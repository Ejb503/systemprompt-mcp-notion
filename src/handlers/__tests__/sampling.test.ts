import { jest, describe, it, expect } from "@jest/globals";
import { server } from "../../index.js";
import { sendSamplingRequest } from "../sampling";
import { handleCallback } from "../../utils/message-handlers";
import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import { ERROR_MESSAGES } from "../../constants/notion.js";

// Mock dependencies
jest.mock("../../index.js", () => ({
  server: {
    createMessage: jest.fn(),
  },
}));
jest.mock("../../utils/message-handlers", () => ({
  handleCallback: jest.fn(),
}));

const mockCreateMessage = server.createMessage as jest.MockedFunction<
  typeof server.createMessage
>;
const mockHandleCallback = handleCallback as jest.MockedFunction<
  typeof handleCallback
>;

describe("sendSamplingRequest", () => {
  const mockResult = {
    id: "test-id",
    content: {
      type: "text",
      text: "Test response",
    },
    role: "assistant",
    model: "test-model",
    metadata: {},
  } as CreateMessageResult;

  const validRequest = {
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
  } as CreateMessageRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateMessage.mockResolvedValue(mockResult);
    mockHandleCallback.mockResolvedValue(mockResult);
  });

  describe("Basic Request Validation", () => {
    it("should successfully process a valid request", async () => {
      const result = await sendSamplingRequest(validRequest);

      expect(mockCreateMessage).toHaveBeenCalledWith({
        messages: validRequest.params.messages,
        maxTokens: validRequest.params.maxTokens,
      });
      expect(result).toEqual(mockResult);
    });

    it("should throw error for missing method", async () => {
      const invalidRequest = {
        params: validRequest.params,
      };
      await expect(
        sendSamplingRequest(invalidRequest as any)
      ).rejects.toThrow();
    });

    it("should throw error for missing params", async () => {
      const invalidRequest = {
        method: "sampling/createMessage",
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Request must have params"
      );
    });

    it("should throw error for empty messages array", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          messages: [],
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "Request must have at least one message"
      );
    });
  });

  describe("Message Content Validation", () => {
    it("should throw error for missing content object", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          messages: [{ role: "user" }],
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Message must have a content object"
      );
    });

    it("should throw error for missing content type", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          messages: [{ role: "user", content: {} }],
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Message content must have a type field"
      );
    });

    it("should throw error for invalid content type", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "invalid",
                text: "Hello",
              },
            },
          ],
          maxTokens: 100,
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        'Content type must be either "text" or "image"'
      );
    });

    it("should throw error for text content without text field", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
              },
            },
          ],
          maxTokens: 100,
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Text content must have a string text field"
      );
    });

    it("should throw error for image content without required fields", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "image",
              },
            },
          ],
          maxTokens: 100,
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        /Image content must have a (base64 data|mimeType) field/
      );
    });
  });

  describe("Parameter Validation", () => {
    it("should throw error for invalid temperature", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          temperature: 2,
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "temperature must be a number between 0 and 1"
      );
    });

    it("should throw error for invalid maxTokens", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          maxTokens: 0,
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "maxTokens must be a positive number"
      );
    });

    it("should throw error for invalid includeContext", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          includeContext: "invalid",
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        'includeContext must be "none", "thisServer", or "allServers"'
      );
    });

    it("should throw error for invalid model preferences", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          modelPreferences: {
            costPriority: 1.5,
            speedPriority: 0.5,
            intelligencePriority: 0.5,
          },
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "Model preference priorities must be numbers between 0 and 1"
      );
    });
  });

  describe("Callback Handling", () => {
    it("should handle callback if provided", async () => {
      const requestWithCallback = {
        ...validRequest,
        params: {
          ...validRequest.params,
          _meta: {
            callback: "http://callback-url.com",
          },
        },
      } as CreateMessageRequest;

      await sendSamplingRequest(requestWithCallback);

      expect(mockHandleCallback).toHaveBeenCalledWith(
        "http://callback-url.com",
        mockResult
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle server error", async () => {
      const error = new Error("Server error");
      mockCreateMessage.mockRejectedValue(error);

      await expect(sendSamplingRequest(validRequest)).rejects.toThrow(error);
    });

    it("should format non-Error errors", async () => {
      const errorMessage = "Unknown server error";
      mockCreateMessage.mockRejectedValue(errorMessage);

      await expect(sendSamplingRequest(validRequest)).rejects.toThrow(
        `${ERROR_MESSAGES.SAMPLING.REQUEST_FAILED}${errorMessage}`
      );
    });
  });
});
