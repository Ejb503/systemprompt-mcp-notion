import type { Prompt } from "@modelcontextprotocol/sdk/types.js";
import type { JSONSchema7TypeName } from "json-schema";
import type { SystempromptPromptResponse } from "../types/index.js";

// Basic mock with simple string input
export const mockSystemPromptResult: SystempromptPromptResponse = {
  id: "123",
  instruction: {
    static: "You are a helpful assistant that helps users write documentation.",
    dynamic: "",
    state: "",
  },
  input: {
    name: "message",
    description: "The user's documentation request",
    type: ["message"],
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        message: {
          type: "string" as JSONSchema7TypeName,
          description: "The user's documentation request",
        },
      },
      required: ["message"],
    },
  },
  output: {
    name: "response",
    description: "The assistant's response",
    type: ["message"],
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        response: {
          type: "string" as JSONSchema7TypeName,
          description: "The assistant's response",
        },
      },
      required: ["response"],
    },
  },
  metadata: {
    title: "Documentation Helper",
    description: "An assistant that helps users write better documentation",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 1,
    status: "published",
    author: "test-user",
    log_message: "Initial creation",
  },
  _link: "https://systemprompt.io/prompts/123",
};

// Mock with array input
export const mockArrayPromptResult: SystempromptPromptResponse = {
  id: "124",
  instruction: {
    dynamic: "",
    state: "",
    static:
      "You are a helpful assistant that helps users manage their todo lists.",
  },
  input: {
    name: "todos",
    description: "The user's todo list items",
    type: ["structured_data"],
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        items: {
          type: "array" as JSONSchema7TypeName,
          description: "List of todo items",
          items: {
            type: "string" as JSONSchema7TypeName,
            description: "A todo item",
          },
          minItems: 1,
        },
        priority: {
          type: "string" as JSONSchema7TypeName,
          enum: ["high", "medium", "low"],
          description: "Priority level for the items",
        },
      },
      required: ["items"],
    },
  },
  output: {
    name: "organized_todos",
    description: "The organized todo list",
    type: ["structured_data"],
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        organized_items: {
          type: "array" as JSONSchema7TypeName,
          items: {
            type: "string" as JSONSchema7TypeName,
          },
        },
      },
      required: ["organized_items"],
    },
  },
  metadata: {
    title: "Todo List Organizer",
    description: "An assistant that helps users organize their todo lists",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 1,
    status: "published",
    author: "test-user",
    log_message: "Initial creation",
  },
  _link: "https://systemprompt.io/prompts/124",
};

// Mock with nested object input
export const mockNestedPromptResult: SystempromptPromptResponse = {
  id: "125",
  instruction: {
    dynamic: "",
    state: "",
    static:
      "You are a helpful assistant that helps users manage their contacts.",
  },
  input: {
    name: "contact",
    description: "The contact information",
    type: ["structured_data"],
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        person: {
          type: "object" as JSONSchema7TypeName,
          description: "Person's information",
          properties: {
            name: {
              type: "object" as JSONSchema7TypeName,
              properties: {
                first: {
                  type: "string" as JSONSchema7TypeName,
                  description: "First name",
                },
                last: {
                  type: "string" as JSONSchema7TypeName,
                  description: "Last name",
                },
              },
              required: ["first", "last"],
            },
            contact: {
              type: "object" as JSONSchema7TypeName,
              properties: {
                email: {
                  type: "string" as JSONSchema7TypeName,
                  description: "Email address",
                  format: "email",
                },
                phone: {
                  type: "string" as JSONSchema7TypeName,
                  description: "Phone number",
                  pattern: "^\\+?[1-9]\\d{1,14}$",
                },
              },
              required: ["email"],
            },
          },
          required: ["name"],
        },
        tags: {
          type: "array" as JSONSchema7TypeName,
          description: "Contact tags",
          items: {
            type: "string" as JSONSchema7TypeName,
          },
        },
      },
      required: ["person"],
    },
  },
  output: {
    name: "formatted_contact",
    description: "The formatted contact information",
    type: ["structured_data"],
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        formatted: {
          type: "string" as JSONSchema7TypeName,
        },
      },
      required: ["formatted"],
    },
  },
  metadata: {
    title: "Contact Manager",
    description: "An assistant that helps users manage their contacts",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 1,
    status: "published",
    author: "test-user",
    log_message: "Initial creation",
  },
  _link: "https://systemprompt.io/prompts/125",
};

// Test mocks for edge cases
export const mockEmptyPropsPrompt = {
  ...mockSystemPromptResult,
  input: {
    ...mockSystemPromptResult.input,
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {},
    },
  },
};

export const mockInvalidPropsPrompt = {
  ...mockSystemPromptResult,
  input: {
    ...mockSystemPromptResult.input,
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        test1: {
          type: "string" as JSONSchema7TypeName,
        },
      },
    },
  },
};

export const mockWithoutDescPrompt = {
  ...mockSystemPromptResult,
  input: {
    ...mockSystemPromptResult.input,
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        test: {
          type: "string" as JSONSchema7TypeName,
        },
      },
      required: ["test"],
    },
  },
};

export const mockWithoutRequiredPrompt = {
  ...mockSystemPromptResult,
  input: {
    ...mockSystemPromptResult.input,
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        test: {
          type: "string" as JSONSchema7TypeName,
          description: "test field",
        },
      },
    },
  },
};

export const mockFalsyDescPrompt = {
  ...mockSystemPromptResult,
  input: {
    ...mockSystemPromptResult.input,
    schema: {
      type: "object" as JSONSchema7TypeName,
      properties: {
        test1: {
          type: "string" as JSONSchema7TypeName,
          description: "",
        },
        test2: {
          type: "string" as JSONSchema7TypeName,
          description: "",
        },
        test3: {
          type: "string" as JSONSchema7TypeName,
          description: "",
        },
      },
      required: ["test1", "test2", "test3"],
    },
  },
};

// Expected MCP format for basic mock
export const mockMCPPrompt: Prompt = {
  name: "Documentation Helper",
  description: "An assistant that helps users write better documentation",
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are a helpful assistant that helps users write documentation.",
      },
    },
  ],
  arguments: [
    {
      name: "message",
      description: "The user's documentation request",
      required: true,
    },
  ],
};

// Expected MCP format for array mock
export const mockArrayMCPPrompt: Prompt = {
  name: "Todo List Organizer",
  description: "An assistant that helps users organize their todo lists",
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are a helpful assistant that helps users manage their todo lists.",
      },
    },
  ],
  arguments: [
    {
      name: "items",
      description: "List of todo items",
      required: true,
    },
    {
      name: "priority",
      description: "Priority level for the items",
      required: false,
    },
  ],
};

// Expected MCP format for nested mock
export const mockNestedMCPPrompt: Prompt = {
  name: "Contact Manager",
  description: "An assistant that helps users manage their contacts",
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are a helpful assistant that helps users manage their contacts.",
      },
    },
  ],
  arguments: [
    {
      name: "person",
      description: "Person's information",
      required: true,
    },
    {
      name: "tags",
      description: "Contact tags",
      required: false,
    },
  ],
};
