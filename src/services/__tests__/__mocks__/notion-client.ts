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
  object: "page",
  created_time: "2021-01-01T00:00:00.000Z",
  last_edited_time: "2021-01-01T00:00:00.000Z",
  created_by: {
    object: "user",
    id: "user123",
  },
  last_edited_by: {
    object: "user",
    id: "user123",
  },
  cover: null,
  icon: null,
  parent: {
    type: "database_id",
    database_id: "db123",
  },
  archived: false,
  properties: {
    Title: {
      id: "title",
      type: "title",
      title: [
        {
          type: "text",
          text: {
            content: "Test Page",
            link: null,
          },
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
  url: "https://notion.so/page123",
  public_url: null,
  in_trash: false,
};

const mockDatabase: DatabaseObjectResponse = {
  id: "db123",
  object: "database",
  created_time: "2021-01-01T00:00:00.000Z",
  last_edited_time: "2021-01-01T00:00:00.000Z",
  created_by: {
    object: "user",
    id: "user123",
  },
  last_edited_by: {
    object: "user",
    id: "user123",
  },
  title: [
    {
      type: "text",
      text: {
        content: "Test Database",
        link: null,
      },
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
  icon: null,
  cover: null,
  parent: {
    type: "page_id",
    page_id: "parent123",
  },
  url: "https://notion.so/db123",
  archived: false,
  is_inline: false,
  public_url: null,
  in_trash: false,
  properties: {
    Name: {
      id: "title",
      name: "Name",
      type: "title",
      title: {},
      description: null,
    },
  },
};

const mockComment: CommentObjectResponse = {
  id: "comment123",
  object: "comment",
  parent: {
    type: "page_id",
    page_id: "page123",
  },
  discussion_id: "discussion123",
  rich_text: [
    {
      type: "text",
      text: {
        content: "Test comment",
        link: null,
      },
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
  created_time: "2021-01-01T00:00:00.000Z",
  last_edited_time: "2021-01-01T00:00:00.000Z",
  created_by: {
    object: "user",
    id: "user123",
  },
};

// Create mock functions with proper typing
const mockSearch = jest.fn<() => Promise<SearchResponse>>().mockResolvedValue({
  object: "list",
  results: [mockPage],
  has_more: false,
  next_cursor: null,
  type: "page_or_database",
  page_or_database: {},
});

const mockPagesRetrieve = jest
  .fn<() => Promise<GetPageResponse>>()
  .mockResolvedValue(mockPage);
const mockPagesCreate = jest
  .fn<() => Promise<CreatePageResponse>>()
  .mockResolvedValue(mockPage);
const mockPagesUpdate = jest
  .fn<() => Promise<UpdatePageResponse>>()
  .mockResolvedValue(mockPage);

const mockDatabasesQuery = jest
  .fn<() => Promise<QueryDatabaseResponse>>()
  .mockResolvedValue({
    object: "list",
    results: [mockPage],
    has_more: false,
    next_cursor: null,
    type: "page_or_database",
    page_or_database: {},
  });

const mockDatabasesCreate = jest
  .fn<() => Promise<CreateDatabaseResponse>>()
  .mockResolvedValue(mockDatabase);
const mockDatabasesList = jest
  .fn<() => Promise<ListDatabasesResponse>>()
  .mockResolvedValue({
    object: "list",
    results: [mockDatabase],
    has_more: false,
    next_cursor: null,
    type: "database",
    database: {},
  });

const mockCommentsCreate = jest
  .fn<() => Promise<CreateCommentResponse>>()
  .mockResolvedValue(mockComment);
const mockCommentsList = jest
  .fn<() => Promise<ListCommentsResponse>>()
  .mockResolvedValue({
    object: "list",
    results: [mockComment],
    has_more: false,
    next_cursor: null,
    type: "comment",
    comment: {},
  });

const mockPropertiesRetrieve = jest
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
  });

// Create a mock client
export const mockClient = {
  search: mockSearch,
  pages: {
    retrieve: mockPagesRetrieve,
    create: mockPagesCreate,
    update: mockPagesUpdate,
    properties: {
      retrieve: mockPropertiesRetrieve,
    },
  },
  databases: {
    query: mockDatabasesQuery,
    create: mockDatabasesCreate,
    list: mockDatabasesList,
    retrieve: jest
      .fn<() => Promise<DatabaseObjectResponse>>()
      .mockResolvedValue(mockDatabase),
    update: jest
      .fn<() => Promise<DatabaseObjectResponse>>()
      .mockResolvedValue(mockDatabase),
  },
  comments: {
    create: mockCommentsCreate,
    list: mockCommentsList,
  },
};

// Export mock objects for use in tests
export { mockPage, mockDatabase, mockComment };
