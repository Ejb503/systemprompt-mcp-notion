import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { NotionService } from "../notion-service.js";
import { mockClient } from "./__mocks__/notion-client.js";
import type {
  CreatePageOptions,
  UpdatePageOptions,
} from "../../types/notion.js";

// Mock the Notion client module
jest.mock("@notionhq/client", () => {
  return {
    Client: jest.fn().mockImplementation(() => mockClient),
  };
});

describe("NotionService", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // Initialize NotionService before each test
    NotionService.initialize("test-token");
  });

  describe("Page Operations", () => {
    it("should search pages", async () => {
      const notion = NotionService.getInstance();
      const pages = await notion.searchPages("test");
      expect(pages).toHaveLength(1);
      expect(pages[0].id).toBe("page123");
      expect(pages[0].title).toBe("Test Page");
    });

    it("should search pages by title", async () => {
      const notion = NotionService.getInstance();
      const pages = await notion.searchPagesByTitle("Test Page");
      expect(pages).toHaveLength(1);
      expect(pages[0].id).toBe("page123");
      expect(pages[0].title).toBe("Test Page");
    });

    it("should get a page", async () => {
      const notion = NotionService.getInstance();
      const page = await notion.getPage("page123");
      expect(page.id).toBe("page123");
      expect(page.title).toBe("Test Page");
    });

    it("should create a page", async () => {
      const notion = NotionService.getInstance();
      const createOptions: CreatePageOptions = {
        parent: { database_id: "db123" },
        properties: {
          Title: {
            title: [
              {
                type: "text",
                text: { content: "New Page", link: null },
              },
            ],
          },
        },
      };
      const page = await notion.createPage(createOptions);
      expect(page.id).toBe("page123");
      expect(page.title).toBe("Test Page");
    });

    it("should update a page", async () => {
      const notion = NotionService.getInstance();
      const updateOptions: UpdatePageOptions = {
        pageId: "page123",
        properties: {
          Title: {
            title: [
              {
                type: "text",
                text: { content: "Updated Page", link: null },
              },
            ],
          },
        },
      };
      const page = await notion.updatePage(updateOptions);
      expect(page.id).toBe("page123");
      expect(page.title).toBe("Test Page");
    });
  });

  describe("Database Operations", () => {
    it("should list databases", async () => {
      const notion = NotionService.getInstance();
      const databases = await notion.listDatabases();
      expect(databases).toHaveLength(1);
      expect(databases[0].id).toBe("db123");
      expect(databases[0].title).toBe("Test Database");
    });

    it("should get database items", async () => {
      const notion = NotionService.getInstance();
      const pages = await notion.getDatabaseItems("db123");
      expect(pages).toHaveLength(1);
      expect(pages[0].id).toBe("page123");
    });

    it("should create a database", async () => {
      const notion = NotionService.getInstance();
      const database = await notion.createDatabase(
        { page_id: "parent123" },
        "New Database",
        {
          Name: {
            title: {},
          },
        }
      );
      expect(database.id).toBe("db123");
      expect(database.title).toBe("Test Database");
    });
  });

  describe("Comment Operations", () => {
    it("should create a comment", async () => {
      const notion = NotionService.getInstance();
      const comment = await notion.createComment("page123", "Test comment");
      expect(comment.id).toBe("comment123");
      expect(comment.content).toBe("Test comment");
    });

    it("should get comments", async () => {
      const notion = NotionService.getInstance();
      const comments = await notion.getComments("page123");
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe("comment123");
      expect(comments[0].content).toBe("Test comment");
    });
  });
});
