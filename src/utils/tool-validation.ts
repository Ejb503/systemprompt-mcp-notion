import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { NOTION_TOOLS, TOOL_ERROR_MESSAGES } from "../constants/tools.js";
import type { NotionTool } from "../types/tool-schemas.js";
import type { JSONSchema7 } from "json-schema";
import { validateWithErrors } from "./validation.js";

/**
 * Validates a tool request and returns the tool configuration if valid
 */
export function validateToolRequest(request: CallToolRequest): NotionTool {
  if (!request.params?.name) {
    throw new Error("Invalid tool request: missing tool name");
  }

  const tool = NOTION_TOOLS.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(
      `${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`
    );
  }

  // Validate arguments against the tool's schema if present
  if (tool.inputSchema && request.params.arguments) {
    validateWithErrors(
      request.params.arguments,
      tool.inputSchema as JSONSchema7
    );
  }

  return tool;
}

/**
 * Gets the schema for a tool by name
 */
export function getToolSchema(toolName: string): JSONSchema7 | undefined {
  const tool = NOTION_TOOLS.find((t) => t.name === toolName);
  return tool?.inputSchema as JSONSchema7;
}
