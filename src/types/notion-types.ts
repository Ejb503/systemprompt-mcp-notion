import type { Prompt, PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import type { JSONSchema7 } from "json-schema";

/**
 * Represents a Notion-specific prompt that extends the base MCP Prompt.
 * Used for generating Notion API requests and handling Notion-specific operations.
 */
export interface NotionPrompt extends Prompt {
  /** Array of messages that form the prompt conversation */
  messages: PromptMessage[];

  /** Optional metadata for Notion-specific functionality */
  _meta?: {
    /** JSON schema for validating the response format */
    responseSchema: JSONSchema7;
    /** Callback function name to handle the response */
    callback?: string;
  };
}
