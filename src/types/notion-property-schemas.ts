import { JSONSchema7 } from "json-schema";

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
