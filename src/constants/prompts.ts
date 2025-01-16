import type { NotionPrompt } from "../types/notion.js";
import {
  NOTION_PAGE_CREATOR_SCHEMA,
  NOTION_PAGE_EDITOR_SCHEMA,
} from "./notion.js";
import {
  NOTION_PAGE_CREATOR_INSTRUCTIONS,
  NOTION_PAGE_EDITOR_INSTRUCTIONS,
} from "./instructions.js";
import type { CreatePageArgs, UpdatePageArgs } from "../types/tool-args.js";

// Type utility to validate prompt arguments match the interface
type ValidateArgs<T> = {
  name: keyof T;
  description: string;
  required: boolean;
}[];

// Validate arguments at compile time
export const createPageArgs: ValidateArgs<CreatePageArgs> = [
  {
    name: "databaseId",
    description: "The ID of the database to create the page in",
    required: true,
  },
  {
    name: "userInstructions",
    description:
      "Basic instructions or outline for the page content that will be expanded into a comprehensive structure",
    required: true,
  },
];

export const editPageArgs: ValidateArgs<
  UpdatePageArgs & { userInstructions: string }
> = [
  {
    name: "pageId",
    description: "The ID of the page to edit",
    required: true,
  },
  {
    name: "userInstructions",
    description: "Instructions for how to modify the page content",
    required: true,
  },
];

// Prompt for creating new pages
export const NOTION_PAGE_CREATOR_PROMPT: NotionPrompt = {
  name: "Notion Page Creator",
  description:
    "Generates a rich, detailed Notion page that expands upon basic inputs into comprehensive, well-structured content",
  arguments: createPageArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: NOTION_PAGE_CREATOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `
<input>
  <requestParams>
    <databaseId>{{databaseId}}</databaseId>
    <userInstructions>{{userInstructions}}</userInstructions>
  </requestParams>
</input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: NOTION_PAGE_CREATOR_SCHEMA,
    callback: "systemprompt_create_notion_page_complex",
  },
};

// Prompt for editing existing pages
export const NOTION_PAGE_EDITOR_PROMPT: NotionPrompt = {
  name: "Notion Page Editor",
  description:
    "Modifies an existing Notion page based on user instructions while preserving its core structure and content",
  arguments: editPageArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: NOTION_PAGE_EDITOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `
<input>
  <requestParams>
    <pageId>{{pageId}}</pageId>
    <userInstructions>{{userInstructions}}</userInstructions>
  </requestParams>
  <currentPage>{{currentPage}}</currentPage>
</input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: NOTION_PAGE_EDITOR_SCHEMA,
    callback: "systemprompt_edit_notion_page_complex",
  },
};

// Export all prompts
export const NOTION_PROMPTS = [
  NOTION_PAGE_CREATOR_PROMPT,
  NOTION_PAGE_EDITOR_PROMPT,
];
