import type {
  CreateMessageResult,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionService } from "../services/notion-service.js";
import {
  ERROR_MESSAGES,
  NOTION_CALLBACKS,
  XML_TAGS,
} from "../constants/notion.js";
import { validateWithErrors } from "./validation.js";
import type {
  CreatePageParameters,
  UpdatePageParameters,
  BlockObjectRequest,
} from "@notionhq/client/build/src/api-endpoints.js";
import type { JSONSchema7 } from "json-schema";

// Schema for validating Notion page requests
const notionPageRequestSchema: JSONSchema7 = {
  type: "object",
  required: ["pageId"],
  properties: {
    pageId: {
      type: "string",
      pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$",
    },
    properties: { type: "object" },
  },
};

interface NotionUpdateRequest {
  pageId: string;
  properties: NonNullable<UpdatePageParameters["properties"]>;
  children?: BlockObjectRequest[];
}

/**
 * Extracts the pageId from a message array
 * @param messages Array of messages to search through
 * @returns The pageId if found, undefined otherwise
 */
export function extractPageId(messages: PromptMessage[]): string | undefined {
  const userMessage = messages.find((msg) => msg.role === "user");
  if (!userMessage || userMessage.content.type !== "text") {
    return undefined;
  }
  return userMessage.content.text.match(/<pageId>([^<]+)<\/pageId>/)?.[1];
}

/**
 * Updates a user message with existing page content
 * @param messages Array of messages to update
 * @param blocks The page blocks to include
 */
export function updateUserMessageWithContent(
  messages: PromptMessage[],
  blocks: unknown
): void {
  const userMessageIndex = messages.findIndex((msg) => msg.role === "user");
  if (userMessageIndex === -1) return;

  const userMessage = messages[userMessageIndex];
  if (userMessage.content.type !== "text") return;

  messages[userMessageIndex] = {
    role: "user",
    content: {
      type: "text",
      text: userMessage.content.text.replace(
        XML_TAGS.REQUEST_PARAMS_CLOSE,
        XML_TAGS.EXISTING_CONTENT_TEMPLATE(JSON.stringify(blocks, null, 2))
      ),
    },
  };
}

/**
 * Injects variables into text
 * @param text The text to inject variables into
 * @param variables The variables to inject
 * @returns The text with variables injected
 */
export function injectVariablesIntoText(
  text: string,
  variables: Record<string, unknown>
): string {
  const matches = text.match(/{{([^}]+)}}/g);
  if (!matches) return text;

  const missingVariables = matches
    .map((match) => match.slice(2, -2))
    .filter((key) => !(key in variables));

  if (missingVariables.length > 0) {
    throw new Error(
      "Missing required variables: " + missingVariables.join(", ")
    );
  }

  return text.replace(/{{([^}]+)}}/g, (_, key) => String(variables[key]));
}

/**
 * Injects variables into a message
 * @param message The message to inject variables into
 * @param variables The variables to inject
 * @returns The message with variables injected
 */
export function injectVariables(
  message: PromptMessage,
  variables: Record<string, unknown>
): PromptMessage {
  if (message.content.type !== "text") return message;

  return {
    ...message,
    content: {
      type: "text",
      text: injectVariablesIntoText(message.content.text, variables),
    },
  };
}

/**
 * Handles a create page callback
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreatePageCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error(ERROR_MESSAGES.SAMPLING.EXPECTED_TEXT);
  }

  const createRequest = JSON.parse(result.content.text) as CreatePageParameters;
  const notion = NotionService.getInstance();
  const page = await notion.createPage(createRequest);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(page, null, 2),
    },
  };
}

/**
 * Handles an edit page callback
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditPageCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error(ERROR_MESSAGES.SAMPLING.EXPECTED_TEXT);
  }

  const pageRequest = JSON.parse(result.content.text) as NotionUpdateRequest;
  validateWithErrors(pageRequest, notionPageRequestSchema);

  const notion = NotionService.getInstance();
  const page = await notion.updatePage({
    pageId: pageRequest.pageId,
    properties: pageRequest.properties,
    children: pageRequest.children,
  });

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(page, null, 2),
    },
  };
}

/**
 * Handles a callback based on its type
 * @param callback The callback type
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCallback(
  callback: string,
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  switch (callback) {
    case NOTION_CALLBACKS.CREATE_PAGE:
      return handleCreatePageCallback(result);
    case NOTION_CALLBACKS.EDIT_PAGE:
      return handleEditPageCallback(result);
    default:
      console.warn(`${ERROR_MESSAGES.SAMPLING.UNKNOWN_CALLBACK} ${callback}`);
      return result;
  }
}
