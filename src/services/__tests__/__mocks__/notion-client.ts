import { jest } from "@jest/globals";
import { Client } from "@notionhq/client";
import type {
  SearchResponse,
  GetPageResponse,
  CreatePageResponse,
  UpdatePageResponse,
  QueryDatabaseResponse,
  CreateDatabaseResponse,
  ListDatabasesResponse,
  CreateCommentResponse,
  ListCommentsResponse,
  GetPagePropertyResponse,
  RichTextItemResponse,
  PageObjectResponse,
  DatabaseObjectResponse,
  CommentObjectResponse,
  PropertyItemObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

// Mock objects
const mockPage: PageObjectResponse = {
  id: "page123",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: {
    id: "user123",
    object: "user",
  },
  last_edited_by: {
    id: "user123",
    object: "user",
  },
  cover: null,
  icon: null,
  parent: {
    type: "database_id",
    database_id: "db123",
  },
  archived: false,
  properties: {
    Name: {
      id: "title",
      type: "title",
      title: [
        {
          type: "text",
          text: { content: "Test Page", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "Test Page",
          href: null,
        },
      ],
    },
  },
  url: "https://notion.so/page123",
  public_url: null,
  object: "page",
  in_trash: false,
};

const mockDatabase: DatabaseObjectResponse = {
  id: "db123",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: {
    id: "user123",
    object: "user",
  },
  last_edited_by: {
    id: "user123",
    object: "user",
  },
  title: [
    {
      type: "text",
      text: { content: "Test Database", link: null },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      plain_text: "Test Database",
      href: null,
    },
  ],
  description: [],
  icon: null,
  cover: null,
  properties: {
    Name: {
      id: "title",
      name: "Name",
      type: "title",
      title: {},
      description: null,
    },
  },
  parent: {
    type: "page_id",
    page_id: "parent123",
  },
  url: "https://notion.so/db123",
  public_url: null,
  archived: false,
  object: "database",
  in_trash: false,
  is_inline: false,
};

const mockComment: CommentObjectResponse = {
  id: "comment123",
  parent: {
    type: "page_id",
    page_id: "page123",
  },
  discussion_id: "discussion123",
  rich_text: [
    {
      type: "text",
      text: { content: "Test comment", link: null },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      plain_text: "Test comment",
      href: null,
    },
  ],
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: {
    id: "user123",
    object: "user",
  },
  object: "comment",
};

// Create a mock client
export const mockClient = {
  search: jest.fn<() => Promise<SearchResponse>>().mockResolvedValue({
    object: "list",
    results: [mockPage],
    has_more: false,
    next_cursor: null,
    type: "page_or_database",
    page_or_database: {},
  }),
  pages: {
    retrieve: jest
      .fn<() => Promise<GetPageResponse>>()
      .mockResolvedValue(mockPage),
    create: jest
      .fn<() => Promise<CreatePageResponse>>()
      .mockResolvedValue(mockPage),
    update: jest
      .fn<() => Promise<UpdatePageResponse>>()
      .mockResolvedValue(mockPage),
    properties: {
      retrieve: jest
        .fn<() => Promise<GetPagePropertyResponse>>()
        .mockResolvedValue({
          object: "property_item",
          id: "property123",
          type: "title",
          title: {
            type: "text",
            text: {
              content: "Test Property",
              link: null,
            },
            plain_text: "Test Property",
            href: null,
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
          } as RichTextItemResponse,
        }),
    },
  },
  databases: {
    query: jest.fn<() => Promise<QueryDatabaseResponse>>().mockResolvedValue({
      object: "list",
      results: [mockPage],
      has_more: false,
      next_cursor: null,
      type: "page_or_database",
      page_or_database: {},
    }),
    create: jest
      .fn<() => Promise<CreateDatabaseResponse>>()
      .mockResolvedValue(mockDatabase),
    list: jest.fn<() => Promise<ListDatabasesResponse>>().mockResolvedValue({
      object: "list",
      results: [mockDatabase],
      has_more: false,
      next_cursor: null,
      type: "database",
      database: {},
    }),
    retrieve: jest
      .fn<() => Promise<DatabaseObjectResponse>>()
      .mockResolvedValue(mockDatabase),
    update: jest
      .fn<() => Promise<DatabaseObjectResponse>>()
      .mockResolvedValue(mockDatabase),
  },
  comments: {
    create: jest
      .fn<() => Promise<CreateCommentResponse>>()
      .mockResolvedValue(mockComment),
    list: jest.fn<() => Promise<ListCommentsResponse>>().mockResolvedValue({
      object: "list",
      results: [mockComment],
      has_more: false,
      next_cursor: null,
      type: "comment",
      comment: {},
    }),
  },
} as unknown as Client;

jest.mock("@notionhq/client", () => ({
  Client: jest.fn().mockImplementation(() => mockClient),
}));

// Export mock objects for use in tests
export { mockPage, mockDatabase, mockComment };
