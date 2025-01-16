import { Tool } from "@modelcontextprotocol/sdk/types.js";

import { NotionPrompt } from "./notion.js";

export interface NotionTool extends Tool {
  _meta?: {
    sampling?: {
      prompt: NotionPrompt;
      maxTokens: number;
      temperature: number;
      requiresExistingContent?: boolean;
    };
  };
}
