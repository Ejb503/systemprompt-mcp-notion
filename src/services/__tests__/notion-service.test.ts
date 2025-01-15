import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { NotionService } from "../notion-service.js";
import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  CommentObjectResponse,
  UserObjectResponse,
  CreateDatabaseParameters,
  GetPagePropertyResponse,
  TitlePropertyItemObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints.js";

const TEST_TOKEN = "test-token";

const mockUser: UserObjectResponse = {
  id: "test-user-id",
  object: "user",
  type: "person",
  person: {},
  name: "Test User",
  avatar_url: null,
};

const mockPage: PageObjectResponse = {
  id: "test-page-id",
  object: "page",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: mockUser,
  last_edited_by: mockUser,
  cover: null,
  icon: null,
  parent: { type: "database_id", database_id: "test-db-id" },
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
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          href: null,
        },
      ],
    },
  },
  url: "https://notion.so/test-page-id",
  public_url: null,
  in_trash: false,
};

const mockDatabase: DatabaseObjectResponse = {
  id: "test-db-id",
  object: "database",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: mockUser,
  last_edited_by: mockUser,
  title: [
    {
      type: "text",
      text: { content: "Test Database", link: null },
      plain_text: "Test Database",
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
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
    Status: {
      id: "status",
      name: "Status",
      type: "select",
      select: {
        options: [],
      },
      description: null,
    },
  },
  parent: { type: "page_id", page_id: "test-page-id" },
  url: "https://notion.so/test-db-id",
  public_url: null,
  archived: false,
  is_inline: false,
  in_trash: false,
};

const mockComment: CommentObjectResponse = {
  id: "test-comment-id",
  object: "comment",
  parent: { type: "page_id", page_id: "test-page-id" },
  discussion_id: "test-discussion-id",
  rich_text: [
    {
      type: "text",
      text: { content: "Test comment", link: null },
      plain_text: "Test comment",
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      href: null,
    },
  ],
  created_by: mockUser,
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
};

// Mock Notion Client
jest.mock("@notionhq/client", () => ({
  Client: jest.fn().mockImplementation(() => ({
    pages: {
      create: jest.fn().mockImplementation(() => Promise.resolve(mockPage)),
      update: jest.fn().mockImplementation(() => Promise.resolve(mockPage)),
      retrieve: jest.fn().mockImplementation(() => Promise.resolve(mockPage)),
    },
    databases: {
      create: jest.fn().mockImplementation(() => Promise.resolve(mockDatabase)),
      query: jest.fn().mockImplementation(() =>
        Promise.resolve({
          results: [mockPage],
          has_more: false,
          next_cursor: null,
        })
      ),
      list: jest.fn().mockImplementation(() =>
        Promise.resolve({
          results: [mockDatabase],
          has_more: false,
          next_cursor: null,
        })
      ),
    },
    search: jest.fn().mockImplementation(() =>
      Promise.resolve({
        results: [mockPage],
        has_more: false,
        next_cursor: null,
      })
    ),
    comments: {
      create: jest.fn().mockImplementation(() => Promise.resolve(mockComment)),
      list: jest.fn().mockImplementation(() =>
        Promise.resolve({
          results: [mockComment],
          has_more: false,
          next_cursor: null,
        })
      ),
    },
  })),
}));

describe("NotionService", () => {
  let service: NotionService;

  beforeEach(() => {
    jest.clearAllMocks();
    NotionService.initialize(TEST_TOKEN);
    service = NotionService.getInstance();
    (service as any).client = {
      search: jest.fn(),
      pages: {
        create: jest.fn(),
        update: jest.fn(),
        retrieve: jest.fn(),
        properties: {
          retrieve: jest.fn(),
        },
      },
      comments: {
        create: jest.fn(),
        list: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe("initialization", () => {
    it("should initialize with token", () => {
      expect(() => NotionService.getInstance()).not.toThrow();
      expect(Client).toHaveBeenCalledWith({ auth: TEST_TOKEN });
    });

    it("should throw error if not initialized", () => {
      (NotionService as any).instance = undefined;
      expect(() => NotionService.getInstance()).toThrow(
        "NotionService must be initialized before use"
      );
    });

    it("should throw error if initialized with empty token", () => {
      expect(() => NotionService.initialize("")).toThrow(
        "Notion API token is required"
      );
    });
  });

  describe("page operations", () => {
    it("should create page", async () => {
      const client = (service as any).client;
      client.pages.create.mockResolvedValueOnce(mockPage);

      const result = await service.createPage({
        parent: { database_id: "test-db-id" },
        properties: {
          title: {
            title: [{ text: { content: "Test Page" } }],
          },
        },
      });

      expect(client.pages.create).toHaveBeenCalledWith({
        parent: { database_id: "test-db-id" },
        properties: {
          title: {
            title: [{ text: { content: "Test Page" } }],
          },
        },
      });
      expect(result).toMatchObject({ id: "test-page-id" });
    });

    it("should update page", async () => {
      const client = (service as any).client;
      client.pages.update.mockResolvedValueOnce(mockPage);

      const result = await service.updatePage({
        pageId: "test-page-id",
        properties: {
          title: {
            title: [{ text: { content: "Updated Page" } }],
          },
        },
      });

      expect(client.pages.update).toHaveBeenCalledWith({
        page_id: "test-page-id",
        properties: {
          title: {
            title: [{ text: { content: "Updated Page" } }],
          },
        },
      });
      expect(result).toMatchObject({ id: "test-page-id" });
    });

    it("should get page", async () => {
      const client = (service as any).client;
      client.pages.retrieve.mockResolvedValueOnce(mockPage);

      const result = await service.getPage("test-page-id");

      expect(client.pages.retrieve).toHaveBeenCalledWith({
        page_id: "test-page-id",
      });
      expect(result).toMatchObject({ id: "test-page-id" });
    });

    it("should search pages", async () => {
      const client = (service as any).client;
      client.search.mockResolvedValueOnce({
        results: [mockPage],
        has_more: false,
        next_cursor: null,
      });

      const result = await service.searchPages("test query");

      expect(client.search).toHaveBeenCalledWith({
        query: "test query",
        filter: {
          property: "object",
          value: "page",
        },
        page_size: 50,
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
      });

      expect(result).toMatchObject({
        pages: [{ id: "test-page-id" }],
        hasMore: false,
      });
    });

    it("should handle page not found", async () => {
      const client = (service as any).client;
      client.pages.retrieve.mockRejectedValueOnce(new Error("Page not found"));
      await expect(service.getPage("nonexistent")).rejects.toThrow(
        "Page not found"
      );
    });

    it("should list pages with options", async () => {
      const client = (service as any).client;
      client.search.mockResolvedValueOnce({
        results: [mockPage],
        has_more: false,
        next_cursor: null,
      });

      const result = await service.listPages({
        pageSize: 50,
        sort: {
          direction: "ascending",
          timestamp: "last_edited_time",
        },
      });

      expect(client.search).toHaveBeenCalledWith({
        filter: {
          property: "object",
          value: "page",
        },
        page_size: 50,
        sort: {
          direction: "ascending",
          timestamp: "last_edited_time",
        },
      });

      expect(result).toMatchObject({
        pages: [{ id: "test-page-id" }],
        hasMore: false,
      });
    });

    it("should search pages by title with filtering", async () => {
      const client = (service as any).client;
      client.search.mockResolvedValueOnce({
        results: [mockPage],
        has_more: false,
        next_cursor: null,
      });

      const result = await service.searchPagesByTitle("test", 10);

      expect(client.search).toHaveBeenCalledWith({
        query: "test",
        filter: {
          property: "object",
          value: "page",
        },
        page_size: 10,
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
      });

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].title).toBe("Test Page");
    });

    it("should get page property", async () => {
      const client = (service as any).client;
      const mockProperty: GetPagePropertyResponse = {
        object: "property_item",
        id: "prop123",
        type: "title",
        title: {
          type: "text",
          text: { content: "Test Title", link: null },
          plain_text: "Test Title",
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          href: null,
        },
      };

      client.pages.properties.retrieve.mockResolvedValueOnce(mockProperty);

      const result = await service.getPageProperty("page123", "prop123");
      expect(client.pages.properties.retrieve).toHaveBeenCalledWith({
        page_id: "page123",
        property_id: "prop123",
      });
      expect(result).toBe(mockProperty);
    });
  });

  describe("comment operations", () => {
    it("should create comment", async () => {
      const client = (service as any).client;
      const mockComment: CommentObjectResponse = {
        id: "comment123",
        parent: { type: "page_id", page_id: "page123" },
        discussion_id: "discussion123",
        rich_text: [
          {
            type: "text",
            text: { content: "Test comment", link: null },
            plain_text: "Test comment",
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            href: null,
          },
        ],
        created_time: "2024-01-01T00:00:00.000Z",
        last_edited_time: "2024-01-01T00:00:00.000Z",
        created_by: mockUser,
        object: "comment",
      };

      client.comments.create.mockResolvedValueOnce(mockComment);

      const result = await service.createComment("page123", "Test comment");
      expect(client.comments.create).toHaveBeenCalledWith({
        parent: { page_id: "page123" },
        rich_text: [
          {
            type: "text",
            text: { content: "Test comment" },
          },
        ],
      });
      expect(result).toMatchObject({
        id: "comment123",
        discussionId: "discussion123",
        content: "Test comment",
      });
    });

    it("should get comments", async () => {
      const client = (service as any).client;
      const mockComment: CommentObjectResponse = {
        id: "comment123",
        parent: { type: "page_id", page_id: "page123" },
        discussion_id: "discussion123",
        rich_text: [
          {
            type: "text",
            text: { content: "Test comment", link: null },
            plain_text: "Test comment",
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            href: null,
          },
        ],
        created_time: "2024-01-01T00:00:00.000Z",
        last_edited_time: "2024-01-01T00:00:00.000Z",
        created_by: mockUser,
        object: "comment",
      };

      client.comments.list.mockResolvedValueOnce({
        results: [mockComment],
        has_more: false,
        next_cursor: null,
      });

      const result = await service.getComments("page123");
      expect(client.comments.list).toHaveBeenCalledWith({
        block_id: "page123",
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "comment123",
        discussionId: "discussion123",
        content: "Test comment",
      });
    });
  });

  describe("error handling", () => {
    it("should handle API rate limits", async () => {
      const client = (service as any).client;
      client.search.mockRejectedValueOnce(new Error("Rate limit exceeded"));
      await expect(service.searchPages("test")).rejects.toThrow(
        "Rate limit exceeded"
      );
    });

    it("should handle network errors", async () => {
      const client = (service as any).client;
      client.pages.retrieve.mockRejectedValueOnce(new Error("Network error"));
      await expect(service.getPage("test-page-id")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle invalid responses", async () => {
      const client = (service as any).client;
      client.pages.retrieve.mockResolvedValueOnce({
        // Missing required properties
        id: "test-page-id",
      });
      await expect(service.getPage("test-page-id")).rejects.toThrow();
    });
  });
});
