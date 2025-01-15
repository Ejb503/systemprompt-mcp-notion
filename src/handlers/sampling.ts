import { server } from "../index.js";
import type {
  CreateMessageRequest,
  CreateMessageResult,
  SamplingMessage,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Validates a sampling message to ensure it has the required fields and proper format.
 * @param message The message to validate
 * @throws Error if the message is invalid
 */
function validateMessage(message: SamplingMessage): void {
  if (!message.role || !["user", "assistant"].includes(message.role)) {
    throw new Error('Message role must be either "user" or "assistant"');
  }

  if (!message.content || typeof message.content !== "object") {
    throw new Error("Message must have a content object");
  }

  if (!["text", "image"].includes(message.content.type)) {
    throw new Error('Content type must be either "text" or "image"');
  }

  if (
    message.content.type === "text" &&
    typeof message.content.text !== "string"
  ) {
    throw new Error("Text content must have a string text field");
  }

  if (message.content.type === "image") {
    if (typeof message.content.data !== "string") {
      throw new Error("Image content must have a base64 data field");
    }
    if (typeof message.content.mimeType !== "string") {
      throw new Error("Image content must have a mimeType field");
    }
  }
}

/**
 * Validates a sampling request to ensure it has the required fields and proper format.
 * @param request The request to validate
 * @throws Error if the request is invalid
 */
function validateRequest(request: CreateMessageRequest): void {
  if (!request.params) {
    throw new Error("Request must have params");
  }

  if (
    !Array.isArray(request.params.messages) ||
    request.params.messages.length === 0
  ) {
    throw new Error("Request must have at least one message");
  }

  // Validate each message
  request.params.messages.forEach(validateMessage);

  // Validate maxTokens
  if (
    typeof request.params.maxTokens !== "number" ||
    request.params.maxTokens <= 0
  ) {
    throw new Error("maxTokens must be a positive number");
  }

  // Validate optional fields if present
  if (
    request.params.temperature !== undefined &&
    (typeof request.params.temperature !== "number" ||
      request.params.temperature < 0 ||
      request.params.temperature > 1)
  ) {
    throw new Error("temperature must be a number between 0 and 1");
  }

  if (
    request.params.includeContext &&
    !["none", "thisServer", "allServers"].includes(
      request.params.includeContext
    )
  ) {
    throw new Error(
      'includeContext must be "none", "thisServer", or "allServers"'
    );
  }

  if (request.params.modelPreferences) {
    const { costPriority, speedPriority, intelligencePriority } =
      request.params.modelPreferences;
    [costPriority, speedPriority, intelligencePriority].forEach((priority) => {
      if (
        priority !== undefined &&
        (typeof priority !== "number" || priority < 0 || priority > 1)
      ) {
        throw new Error(
          "Model preference priorities must be numbers between 0 and 1"
        );
      }
    });
  }
}

/**
 * Handles sampling requests from the server to the client.
 *
 * This function follows the MCP sampling flow:
 * 1. Server sends a sampling/createMessage request to the client
 * 2. Client reviews the request and can modify it
 * 3. Client samples from an LLM
 * 4. Client reviews the completion
 * 5. Client returns the result to the server
 *
 * The client has full control over:
 * - Modifying or rejecting the request
 * - Selecting the model to use
 * - Including or excluding context
 * - Reviewing and modifying the completion
 *
 * @param request The sampling request containing messages and parameters
 * @returns The sampling result from the client
 * @throws Error if the request is invalid or sampling fails
 */
export async function sendSamplingRequest(
  request: CreateMessageRequest
): Promise<CreateMessageResult> {
  try {
    // Validate the request
    validateRequest(request);

    // Send the request to the client and wait for their response
    return await server.createMessage(request.params);
  } catch (error) {
    // Log the error for debugging
    console.error("Sampling request failed:", error);

    // Rethrow with a clear message
    throw new Error(
      `Sampling request failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
