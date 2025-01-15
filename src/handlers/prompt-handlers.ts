import type {
  GetPromptRequest,
  GetPromptResult,
  ListPromptsRequest,
  ListPromptsResult,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { NOTION_PROMPTS } from "../types/notion-prompts.js";
import type { NotionPrompt } from "../types/notion-types.js";

// Use the prompts from notion-prompts.ts
const Prompts: NotionPrompt[] = NOTION_PROMPTS;

export async function handleListPrompts(
  request: ListPromptsRequest
): Promise<ListPromptsResult> {
  try {
    // Validate prompts array
    if (!NOTION_PROMPTS || !Array.isArray(NOTION_PROMPTS)) {
      throw new Error("Failed to fetch prompts");
    }

    // Return prompts without messages
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

    // Validate messages
    if (
      !foundPrompt.messages ||
      !Array.isArray(foundPrompt.messages) ||
      foundPrompt.messages.length === 0
    ) {
      throw new Error(`Messages not found for prompt: ${request.params.name}`);
    }

    // Inject variables into messages if provided
    const injectedMessages = foundPrompt.messages.map((message) => {
      if (
        message.role === "user" &&
        message.content.type === "text" &&
        request.params.arguments
      ) {
        // Replace {{variable}} with actual values
        let text = message.content.text;
        Object.entries(request.params.arguments).forEach(([key, value]) => {
          text = text.replace(new RegExp(`{{${key}}}`, "g"), value || "");
        });
        return {
          role: message.role,
          content: {
            type: "text" as const,
            text,
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
