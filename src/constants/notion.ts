import { JSONSchema7, JSONSchema7TypeName } from "json-schema";

export const NOTION_CALLBACKS = {
  CREATE_PAGE: "systemprompt_create_notion_page_complex",
  EDIT_PAGE: "systemprompt_edit_notion_page_complex",
} as const;

export const ERROR_MESSAGES = {
  INVALID_REQUEST: {
    MISSING_MESSAGES: "Invalid request: missing messages",
    MISSING_PARAMS: "Request must have params",
    EMPTY_MESSAGES: "Request must have at least one message",
  },
  VALIDATION: {
    INVALID_ROLE: 'Message role must be either "user" or "assistant"',
    MISSING_CONTENT: "Message must have a content object",
    INVALID_CONTENT_TYPE: 'Content type must be either "text" or "image"',
    INVALID_TEXT_CONTENT: "Text content must have a string text field",
    INVALID_IMAGE_DATA: "Image content must have a base64 data field",
    INVALID_IMAGE_MIME: "Image content must have a mimeType field",
    INVALID_MAX_TOKENS: "maxTokens must be a positive number",
    INVALID_TEMPERATURE: "temperature must be a number between 0 and 1",
    INVALID_INCLUDE_CONTEXT:
      'includeContext must be "none", "thisServer", or "allServers"',
    INVALID_MODEL_PRIORITY:
      "Model preference priorities must be numbers between 0 and 1",
  },
  SAMPLING: {
    EXPECTED_TEXT: "Expected text response from LLM",
    UNKNOWN_CALLBACK: "Unknown callback type: ",
    REQUEST_FAILED: "Sampling request failed: ",
  },
} as const;

export const VALID_ROLES = ["user", "assistant"] as const;
export const VALID_CONTENT_TYPES = ["text", "image", "resource"] as const;
export const VALID_INCLUDE_CONTEXT = [
  "none",
  "thisServer",
  "allServers",
] as const;

export const XML_TAGS = {
  REQUEST_PARAMS_CLOSE: "</requestParams>",
  EXISTING_CONTENT_TEMPLATE: (content: string) => `</requestParams>
  <existingContent>
    ${content}
  </existingContent>`,
} as const;

// Base schema for rich text content
export const richTextSchema: JSONSchema7 = {
  type: "array",
  items: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["text"] },
      text: {
        type: "object",
        properties: {
          content: { type: "string" },
          link: {
            type: ["object", "null"],
            properties: {
              url: { type: "string" },
            },
          },
        },
        required: ["content"],
      },
      annotations: {
        type: "object",
        properties: {
          bold: { type: "boolean" },
          italic: { type: "boolean" },
          strikethrough: { type: "boolean" },
          underline: { type: "boolean" },
          code: { type: "boolean" },
          color: { type: "string" },
        },
      },
      plain_text: { type: "string" },
      href: { type: ["string", "null"] },
    },
    required: ["type", "text"],
  },
};

// Title property schema
export const titlePropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    title: richTextSchema,
  },
  required: ["title"],
};

// Text property schema
export const textPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    rich_text: richTextSchema,
  },
  required: ["rich_text"],
};

// Number property schema
export const numberPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    number: { type: ["number", "null"] },
  },
  required: ["number"],
};

// Select property schema
export const selectPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    select: {
      type: ["object", "null"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        color: { type: "string" },
      },
    },
  },
  required: ["select"],
};

// Multi-select property schema
export const multiSelectPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    multi_select: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          color: { type: "string" },
        },
        required: ["id", "name"],
      },
    },
  },
  required: ["multi_select"],
};

// Date property schema
export const datePropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    date: {
      type: ["object", "null"],
      properties: {
        start: { type: "string", format: "date-time" },
        end: { type: ["string", "null"], format: "date-time" },
        time_zone: { type: ["string", "null"] },
      },
      required: ["start"],
    },
  },
  required: ["date"],
};

// People property schema
export const peoplePropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    people: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          object: { type: "string", enum: ["user"] },
        },
        required: ["id", "object"],
      },
    },
  },
  required: ["people"],
};

// Files property schema
export const filesPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    files: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["file", "external"] },
          file: {
            type: "object",
            properties: {
              url: { type: "string" },
              expiry_time: { type: "string", format: "date-time" },
            },
          },
          external: {
            type: "object",
            properties: {
              url: { type: "string" },
            },
          },
        },
        required: ["name", "type"],
      },
    },
  },
  required: ["files"],
};

// Checkbox property schema
export const checkboxPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    checkbox: { type: "boolean" },
  },
  required: ["checkbox"],
};

// URL property schema
export const urlPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    url: { type: ["string", "null"] },
  },
  required: ["url"],
};

// Email property schema
export const emailPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    email: { type: ["string", "null"] },
  },
  required: ["email"],
};

// Phone number property schema
export const phoneNumberPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    phone_number: { type: ["string", "null"] },
  },
  required: ["phone_number"],
};

// Formula property schema
export const formulaPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    formula: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["string", "number", "boolean", "date"] },
        string: { type: "string" },
        number: { type: "number" },
        boolean: { type: "boolean" },
        date: {
          type: "object",
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: ["string", "null"], format: "date-time" },
          },
        },
      },
      required: ["type"],
    },
  },
  required: ["formula"],
};

// Relation property schema
export const relationPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    relation: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  required: ["relation"],
};

// Rollup property schema
export const rollupPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    rollup: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["number", "date", "array"] },
        number: { type: "number" },
        date: {
          type: "object",
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: ["string", "null"], format: "date-time" },
          },
        },
        array: {
          type: "array",
          items: {
            type: "object",
            // The items can be of any property type
            additionalProperties: true,
          },
        },
      },
      required: ["type"],
    },
  },
  required: ["rollup"],
};

// Created time property schema
export const createdTimePropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    created_time: { type: "string", format: "date-time" },
  },
  required: ["created_time"],
};

// Created by property schema
export const createdByPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    created_by: {
      type: "object",
      properties: {
        id: { type: "string" },
        object: { type: "string", enum: ["user"] },
      },
      required: ["id", "object"],
    },
  },
  required: ["created_by"],
};

// Last edited time property schema
export const lastEditedTimePropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    last_edited_time: { type: "string", format: "date-time" },
  },
  required: ["last_edited_time"],
};

// Last edited by property schema
export const lastEditedByPropertySchema: JSONSchema7 = {
  type: "object",
  properties: {
    last_edited_by: {
      type: "object",
      properties: {
        id: { type: "string" },
        object: { type: "string", enum: ["user"] },
      },
      required: ["id", "object"],
    },
  },
  required: ["last_edited_by"],
};

// Combined property schemas map
export const notionPropertySchemas: Record<string, JSONSchema7> = {
  title: titlePropertySchema,
  rich_text: textPropertySchema,
  number: numberPropertySchema,
  select: selectPropertySchema,
  multi_select: multiSelectPropertySchema,
  date: datePropertySchema,
  people: peoplePropertySchema,
  files: filesPropertySchema,
  checkbox: checkboxPropertySchema,
  url: urlPropertySchema,
  email: emailPropertySchema,
  phone_number: phoneNumberPropertySchema,
  formula: formulaPropertySchema,
  relation: relationPropertySchema,
  rollup: rollupPropertySchema,
  created_time: createdTimePropertySchema,
  created_by: createdByPropertySchema,
  last_edited_time: lastEditedTimePropertySchema,
  last_edited_by: lastEditedByPropertySchema,
};

// Common schema definitions for rich text blocks
const richTextBlockDef = {
  type: "object" as JSONSchema7TypeName,
  required: ["rich_text"],
  additionalProperties: false,
  properties: {
    rich_text: { $ref: "#/definitions/richTextArray" },
  },
};

const richTextArrayDef = {
  type: "array" as JSONSchema7TypeName,
  items: {
    type: "object" as JSONSchema7TypeName,
    required: ["text"],
    additionalProperties: false,
    properties: {
      text: {
        type: "object" as JSONSchema7TypeName,
        required: ["content"],
        additionalProperties: false,
        properties: {
          content: {
            type: "string" as JSONSchema7TypeName,
            description: "The text content",
          },
        },
      },
    },
  },
};

// Base schema for page content blocks
const pageBlocksSchema: JSONSchema7 = {
  type: "array" as JSONSchema7TypeName,
  items: {
    type: "object" as JSONSchema7TypeName,
    required: ["object", "type"],
    properties: {
      object: {
        type: "string" as JSONSchema7TypeName,
        const: "block",
      },
      type: {
        type: "string" as JSONSchema7TypeName,
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
    },
    allOf: [
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "paragraph" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["paragraph"],
          properties: {
            paragraph: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "heading_1" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["heading_1"],
          properties: {
            heading_1: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "heading_2" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["heading_2"],
          properties: {
            heading_2: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "heading_3" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["heading_3"],
          properties: {
            heading_3: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "bulleted_list_item" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["bulleted_list_item"],
          properties: {
            bulleted_list_item: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "numbered_list_item" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["numbered_list_item"],
          properties: {
            numbered_list_item: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "to_do" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["to_do"],
          properties: {
            to_do: {
              type: "object" as JSONSchema7TypeName,
              required: ["rich_text", "checked"],
              additionalProperties: false,
              properties: {
                rich_text: { $ref: "#/definitions/richTextArray" },
                checked: {
                  type: "boolean" as JSONSchema7TypeName,
                  description: "Whether the to-do is checked",
                },
              },
            },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "toggle" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["toggle"],
          properties: {
            toggle: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "code" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["code"],
          properties: {
            code: {
              type: "object" as JSONSchema7TypeName,
              required: ["rich_text", "language"],
              additionalProperties: false,
              properties: {
                rich_text: { $ref: "#/definitions/richTextArray" },
                language: {
                  type: "string" as JSONSchema7TypeName,
                  description: "The programming language of the code block",
                },
              },
            },
          },
        },
      },
      {
        if: {
          type: "object" as JSONSchema7TypeName,
          properties: {
            type: { const: "quote" },
          },
        },
        then: {
          type: "object" as JSONSchema7TypeName,
          required: ["quote"],
          properties: {
            quote: { $ref: "#/definitions/richTextBlock" },
          },
        },
      },
    ],
  },
};

// Schema for creating new pages
export const NOTION_PAGE_CREATOR_SCHEMA: JSONSchema7 = {
  type: "object" as JSONSchema7TypeName,
  required: ["parent", "properties"],
  additionalProperties: false,
  properties: {
    parent: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        database_id: {
          type: "string" as JSONSchema7TypeName,
          description: "The ID of the database to create the page in",
        },
      },
      required: ["database_id"],
      additionalProperties: false,
    },
    properties: {
      type: "object" as JSONSchema7TypeName,
      required: ["title"],
      additionalProperties: false,
      properties: {
        title: {
          type: "array" as JSONSchema7TypeName,
          items: {
            type: "object" as JSONSchema7TypeName,
            required: ["text"],
            additionalProperties: false,
            properties: {
              text: {
                type: "object" as JSONSchema7TypeName,
                required: ["content"],
                additionalProperties: false,
                properties: {
                  content: {
                    type: "string" as JSONSchema7TypeName,
                    description: "The title text of the page",
                  },
                },
              },
            },
          },
        },
      },
    },
    children: pageBlocksSchema,
  },
  definitions: {
    richTextBlock: richTextBlockDef,
    richTextArray: richTextArrayDef,
  },
};

// Schema for editing existing pages
export const NOTION_PAGE_EDITOR_SCHEMA: JSONSchema7 = {
  type: "object" as JSONSchema7TypeName,
  required: ["pageId"],
  additionalProperties: false,
  properties: {
    pageId: {
      type: "string" as JSONSchema7TypeName,
      description: "The ID of the page to edit",
      pattern: "^[a-f0-9-]+$",
    },
    archived: {
      type: "boolean" as JSONSchema7TypeName,
      description: "Whether to archive the page",
    },
    properties: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        title: {
          type: "array" as JSONSchema7TypeName,
          items: {
            type: "object" as JSONSchema7TypeName,
            required: ["text"],
            additionalProperties: false,
            properties: {
              text: {
                type: "object" as JSONSchema7TypeName,
                required: ["content"],
                additionalProperties: false,
                properties: {
                  content: {
                    type: "string" as JSONSchema7TypeName,
                    description: "The title text of the page",
                  },
                },
              },
            },
          },
        },
      },
    },
    children: pageBlocksSchema,
  },
  definitions: {
    richTextBlock: richTextBlockDef,
    richTextArray: richTextArrayDef,
  },
};
