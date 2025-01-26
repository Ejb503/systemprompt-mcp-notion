import { server } from "../server.js";
import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import { ERROR_MESSAGES } from "../constants/notion.js";
import { validateRequest } from "../utils/validation.js";
import { handleCallback } from "../utils/message-handlers.js";

export async function sendSamplingRequest(
  request: CreateMessageRequest
): Promise<CreateMessageResult> {
  try {
    // Validate the request first
    validateRequest(request);
    const result = await server.createMessage({
      ...request.params,
      messages: request.params.messages,
    });

    const callback = request.params._meta?.callback;
    if (callback && typeof callback === "string") {
      return await handleCallback(callback, result);
    }
    return result;
  } catch (error) {
    // Log the error for debugging
    console.error(
      ERROR_MESSAGES.SAMPLING.REQUEST_FAILED,
      error instanceof Error ? error.message : error
    );

    // If it's already an Error object, throw it directly
    if (error instanceof Error) {
      throw error;
    }

    // For other errors, throw a formatted error
    throw new Error(
      `${ERROR_MESSAGES.SAMPLING.REQUEST_FAILED}${error || "Unknown error"}`
    );
  }
}
