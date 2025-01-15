import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  CommentObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";

export const mockPage = {
  id: "page123",
  created_time: "2024-01-14T00:00:00.000Z",
  last_edited_time: "2024-01-14T00:00:00.000Z",
  created_by: { id: "user123", object: "user" },
  last_edited_by: { id: "user123", object: "user" },
  cover: null,
  icon: null,
  parent: { type: "database_id", database_id: "db123" },
  archived: false,
  properties: {
    title: {
      id: "title",
      type: "title",
      title: [
        {
          type: "text",
          text: { content: "Test Page", link: null },
          plain_text: "Test Page",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ],
    },
  },
  url: "https://notion.so/test-page",
  object: "page",
  in_trash: false,
  public_url: null,
} as PageObjectResponse;

export const mockDatabase = {
  id: "db123",
  created_time: "2024-01-14T00:00:00.000Z",
  last_edited_time: "2024-01-14T00:00:00.000Z",
  created_by: { id: "user123", object: "user" },
  last_edited_by: { id: "user123", object: "user" },
  title: [
    {
      type: "text",
      text: { content: "Test Database", link: null },
      plain_text: "Test Database",
      href: null,
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
    },
  ],
  description: [],
  is_inline: false,
  properties: {
    title: {
      id: "title",
      name: "Title",
      type: "title",
      title: {},
      description: null,
    },
  },
  parent: { type: "page_id", page_id: "parent123" },
  url: "https://notion.so/test-database",
  archived: false,
  icon: null,
  cover: null,
  object: "database",
  in_trash: false,
  public_url: null,
} as DatabaseObjectResponse;

export const mockComment = {
  id: "comment123",
  parent: { type: "page_id", page_id: "page123" },
  discussion_id: "discussion123",
  rich_text: [
    {
      type: "text",
      text: { content: "Test comment", link: null },
      plain_text: "Test comment",
      href: null,
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
    },
  ],
  created_time: "2024-01-14T00:00:00.000Z",
  last_edited_time: "2024-01-14T00:00:00.000Z",
  created_by: { id: "user123", object: "user" },
  object: "comment",
} as CommentObjectResponse;
