import { JSONSchema7 } from "json-schema";
import { NotionPrompt } from "./notion-types.js";

export const NOTION_PAGE_CREATOR_INSTRUCTIONS = `You are an expert at creating Notion pages using the Notion API. Your task is to generate a valid Notion API request for creating a new page.

INPUT PARAMETERS:
The user message will include these parameters:
1. instructions: The user's instructions for creating the page (required)
2. content: The main content to be converted into Notion blocks (required)

PARAMETER HANDLING:
1. Instructions: Parse the user instructions to determine:
   - The page title (required)
   - Any additional context or requirements
2. Content: Must be parsed and converted into appropriate Notion blocks
3. All text must be preserved exactly as provided

RESPONSE FORMAT:
You must return a valid JSON object that matches this exact schema:
{
  "parent": { 
    "type": "workspace",  // Always create in workspace root
    "workspace": true 
  },
  "properties": {
    "title": [{ 
      "text": { 
        "content": string  // Extract title from user instructions
      }
    }]
  },
  "children": [  // Array of content blocks
    {
      "object": "block",
      "type": string,     // The block type (paragraph, heading_1, etc.)
      [blockType]: {      // Object matching the block type
        "rich_text": [{
          "text": {
            "content": string  // The block's content
          }
        }]
      }
    }
  ]
}

CONTENT FORMATTING RULES:
1. Title: Extract an appropriate title from the user instructions
2. Content: Parse and structure the content into appropriate blocks:
   - Use heading_1/2/3 for section headers (# for h1, ## for h2, ### for h3)
   - Use paragraph blocks for regular text
   - Use bulleted_list_item for lists starting with - or *
   - Use numbered_list_item for lists starting with numbers
   - Use quote blocks for text starting with >
   - Use code blocks for text wrapped in \`\`\`
3. Rich Text: Always wrap text content in the rich_text array format

BLOCK TYPE REFERENCE:
- paragraph: Regular text content
- heading_1/2/3: Section headers (3 levels)
- bulleted_list_item: Unordered list items
- numbered_list_item: Ordered list items
- to_do: Checkable items (- [ ] or - [x])
- toggle: Collapsible content
- code: Code snippets with syntax highlighting
- quote: Block quotes`;

export const NOTION_PAGE_CREATOR_SCHEMA = {
  type: "object",
  required: ["parent", "properties"],
  additionalProperties: false,
  properties: {
    parent: {
      type: "object",
      required: ["type", "workspace"],
      additionalProperties: false,
      properties: {
        type: {
          type: "string",
          const: "workspace",
        },
        workspace: {
          type: "boolean",
          const: true,
        },
      },
    },
    properties: {
      type: "object",
      required: ["title"],
      additionalProperties: false,
      properties: {
        title: {
          type: "array",
          items: {
            type: "object",
            required: ["text"],
            additionalProperties: false,
            properties: {
              text: {
                type: "object",
                required: ["content"],
                additionalProperties: false,
                properties: {
                  content: {
                    type: "string",
                    description: "The title text of the page",
                  },
                },
              },
            },
          },
        },
      },
    },
    children: {
      type: "array",
      items: {
        type: "object",
        required: ["object", "type"],
        properties: {
          object: {
            type: "string",
            const: "block",
          },
          type: {
            type: "string",
            enum: [
              "paragraph",
              "heading_1",
              "heading_2",
              "heading_3",
              "bulleted_list_item",
              "numbered_list_item",
              "to_do",
              "toggle",
              "code",
              "quote",
            ],
          },
          paragraph: {
            type: "object",
            required: ["rich_text"],
            additionalProperties: false,
            properties: {
              rich_text: {
                type: "array",
                items: {
                  type: "object",
                  required: ["text"],
                  additionalProperties: false,
                  properties: {
                    text: {
                      type: "object",
                      required: ["content"],
                      additionalProperties: false,
                      properties: {
                        content: {
                          type: "string",
                          description: "The text content of the paragraph",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          heading_1: { $ref: "#/definitions/heading" },
          heading_2: { $ref: "#/definitions/heading" },
          heading_3: { $ref: "#/definitions/heading" },
        },
      },
    },
  },
  definitions: {
    heading: {
      type: "object",
      required: ["rich_text"],
      additionalProperties: false,
      properties: {
        rich_text: {
          type: "array",
          items: {
            type: "object",
            required: ["text"],
            additionalProperties: false,
            properties: {
              text: {
                type: "object",
                required: ["content"],
                additionalProperties: false,
                properties: {
                  content: {
                    type: "string",
                    description: "The text content of the heading",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const NOTION_PAGE_CREATOR_PROMPT: NotionPrompt = {
  name: "Notion Page Creator",
  description:
    "Generates a Notion API request for creating a new page with the specified content",
  arguments: [
    {
      name: "instructions",
      description: "The user's instructions for creating the page",
      required: true,
    },
    {
      name: "content",
      description: "The main content of the page",
      required: true,
    },
  ],
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
    <instructions>{{instructions}}</instructions>
    <content>{{content}}</content>
  </requestParams>
</input>`,
      },
    },
  ],
  _meta: {
    responseSchema: NOTION_PAGE_CREATOR_SCHEMA as JSONSchema7,
    callback: "systemprompt_create_notion_page_complex",
  },
};

export const NOTION_PROMPTS = [NOTION_PAGE_CREATOR_PROMPT];
