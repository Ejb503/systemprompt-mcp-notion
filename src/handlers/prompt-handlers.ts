import type {
  GetPromptRequest,
  GetPromptResult,
  ListPromptsRequest,
  ListPromptsResult,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { NOTION_PROMPTS } from "../constants/prompts.js";
import { injectVariablesIntoText } from "../utils/message-handlers.js";

export async function handleListPrompts(
  request: ListPromptsRequest
): Promise<ListPromptsResult> {
  try {
    if (!NOTION_PROMPTS || !Array.isArray(NOTION_PROMPTS)) {
      throw new Error("Failed to fetch prompts");
    }

    return {
      prompts: NOTION_PROMPTS.map(({ messages, ...rest }) => rest),
    };
  } catch (error: any) {
    console.error("Failed to fetch prompts:", error);
    throw error;
  }
}

export async function handleGetPrompt(
  request: GetPromptRequest
): Promise<GetPromptResult> {
  try {
    if (!NOTION_PROMPTS || !Array.isArray(NOTION_PROMPTS)) {
      throw new Error("Failed to fetch prompts");
    }

    const foundPrompt = NOTION_PROMPTS.find(
      (p) => p.name === request.params.name
    );
    if (!foundPrompt) {
      throw new Error(`Prompt not found: ${request.params.name}`);
    }

    if (
      !foundPrompt.messages ||
      !Array.isArray(foundPrompt.messages) ||
      foundPrompt.messages.length === 0
    ) {
      throw new Error(`Messages not found for prompt: ${request.params.name}`);
    }

    const injectedMessages = foundPrompt.messages.map((message) => {
      if (
        message.role === "user" &&
        message.content.type === "text" &&
        request.params.arguments
      ) {
        return {
          role: message.role,
          content: {
            type: "text" as const,
            text: injectVariablesIntoText(
              message.content.text,
              request.params.arguments
            ),
          },
        } satisfies PromptMessage;
      }
      return message;
    });

    return {
      name: foundPrompt.name,
      description: foundPrompt.description,
      arguments: foundPrompt.arguments || [],
      messages: injectedMessages,
      _meta: foundPrompt._meta,
    };
  } catch (error: any) {
    console.error("Failed to fetch prompt:", error);
    throw error;
  }
}
