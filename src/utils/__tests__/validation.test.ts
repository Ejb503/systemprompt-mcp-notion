import { validateRequest, validateNotionPageRequest } from "../validation";
import type { CreateMessageRequest } from "@modelcontextprotocol/sdk/types.js";

describe("validateRequest", () => {
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

  it("should validate a correct request", () => {
    expect(() => validateRequest(validRequest)).not.toThrow();
  });

  it("should throw error for missing method", () => {
    const invalidRequest = {
      params: validRequest.params,
    };
    expect(() => validateRequest(invalidRequest)).toThrow();
  });

  it("should throw error for missing params", () => {
    const invalidRequest = {
      method: "sampling/createMessage",
    };
    expect(() => validateRequest(invalidRequest)).toThrow(
      "Request must have params"
    );
  });

  it("should throw error for empty messages array", () => {
    const invalidRequest = {
      ...validRequest,
      params: {
        ...validRequest.params,
        messages: [],
      },
    };
    expect(() => validateRequest(invalidRequest)).toThrow(
      "Request must have at least one message"
    );
  });

  it("should throw error for invalid message role", () => {
    const invalidRequest = {
      ...validRequest,
      params: {
        messages: [
          {
            role: "invalid",
            content: {
              type: "text",
              text: "Hello",
            },
          },
        ],
      },
    };
    expect(() => validateRequest(invalidRequest)).toThrow(
      'Message role must be either "user" or "assistant"'
    );
  });

  it("should throw error for invalid content type", () => {
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
      },
    };
    expect(() => validateRequest(invalidRequest)).toThrow(
      'Content type must be either "text" or "image"'
    );
  });

  it("should validate image content correctly", () => {
    const imageRequest = {
      ...validRequest,
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
      },
    };
    expect(() => validateRequest(imageRequest)).not.toThrow();
  });
});

describe("validateNotionPageRequest", () => {
  it("should validate a correct Notion page request", () => {
    const validRequest = {
      pageId: "12345678-1234-1234-1234-123456789012",
      properties: {},
    };
    expect(() => validateNotionPageRequest(validRequest)).not.toThrow();
  });

  it("should throw error for missing pageId", () => {
    const invalidRequest = {
      properties: {},
    };
    expect(() => validateNotionPageRequest(invalidRequest)).toThrow(
      "Missing required argument: pageId"
    );
  });

  it("should throw error for invalid pageId format", () => {
    const invalidRequest = {
      pageId: "invalid-id",
      properties: {},
    };
    expect(() => validateNotionPageRequest(invalidRequest)).toThrow(
      "Invalid page ID format"
    );
  });
});
