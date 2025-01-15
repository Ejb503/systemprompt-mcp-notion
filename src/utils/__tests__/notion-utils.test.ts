import { describe, it, expect } from "@jest/globals";
import {
  isFullPage,
  mapPageToNotionPage,
  extractTitle,
  extractDatabaseTitle,
} from "../notion-utils.js";
import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints.js";

describe("notion-utils", () => {
  describe("isFullPage", () => {
    it("should return false for non-object values", () => {
      expect(isFullPage(null)).toBe(false);
      expect(isFullPage(undefined)).toBe(false);
      expect(isFullPage("string")).toBe(false);
      expect(isFullPage(123)).toBe(false);
    });

    it("should return false for objects missing required properties", () => {
      expect(isFullPage({})).toBe(false);
      expect(isFullPage({ object: "page" })).toBe(false);
      expect(isFullPage({ parent: {} })).toBe(false);
    });

    it("should return false for non-page objects", () => {
      expect(isFullPage({ object: "database", parent: {} })).toBe(false);
    });

    it("should return false for invalid parent types", () => {
      expect(isFullPage({ object: "page", parent: { type: "invalid" } })).toBe(
        false
      );
    });

    it("should return true for valid page objects", () => {
      expect(
        isFullPage({ object: "page", parent: { type: "database_id" } })
      ).toBe(true);
      expect(isFullPage({ object: "page", parent: { type: "page_id" } })).toBe(
        true
      );
      expect(
        isFullPage({ object: "page", parent: { type: "workspace" } })
      ).toBe(true);
    });
  });

  describe("mapPageToNotionPage", () => {
    const baseMockPage = {
      object: "page",
      id: "page-id",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: {
        object: "user",
        id: "user-id",
      },
      last_edited_by: {
        object: "user",
        id: "user-id",
      },
      cover: null,
      icon: null,
      archived: false,
      url: "https://notion.so/page-id",
      public_url: null,
      properties: {
        title: {
          id: "title-id",
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
    } as unknown as PageObjectResponse;

    it("should map database parent correctly", () => {
      const page = {
        ...baseMockPage,
        parent: { type: "database_id", database_id: "db-id" },
      } as PageObjectResponse;

      const result = mapPageToNotionPage(page);
      expect(result.parent).toEqual({ type: "database_id", id: "db-id" });
    });

    it("should map page parent correctly", () => {
      const page = {
        ...baseMockPage,
        parent: { type: "page_id", page_id: "parent-id" },
      } as PageObjectResponse;

      const result = mapPageToNotionPage(page);
      expect(result.parent).toEqual({ type: "page_id", id: "parent-id" });
    });

    it("should map workspace parent correctly", () => {
      const page = {
        ...baseMockPage,
        parent: { type: "workspace", workspace: true },
      } as PageObjectResponse;

      const result = mapPageToNotionPage(page);
      expect(result.parent).toEqual({ type: "workspace", id: "workspace" });
    });
  });

  describe("extractTitle", () => {
    const baseMockPage = {
      object: "page",
      id: "page-id",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: {
        object: "user",
        id: "user-id",
      },
      last_edited_by: {
        object: "user",
        id: "user-id",
      },
      cover: null,
      icon: null,
      archived: false,
      url: "https://notion.so/page-id",
      public_url: null,
      parent: { type: "database_id", database_id: "db-id" },
    } as unknown as PageObjectResponse;

    it("should return 'Untitled' for missing title property", () => {
      const page = {
        ...baseMockPage,
        properties: {},
      } as unknown as PageObjectResponse;

      expect(extractTitle(page)).toBe("Untitled");
    });

    it("should return 'Untitled' for empty title", () => {
      const page = {
        ...baseMockPage,
        properties: {
          title: {
            id: "title-id",
            type: "title",
            title: [],
          },
        },
      } as unknown as PageObjectResponse;

      expect(extractTitle(page)).toBe("Untitled");
    });

    it("should concatenate multiple title segments", () => {
      const page = {
        ...baseMockPage,
        properties: {
          title: {
            id: "title-id",
            type: "title",
            title: [
              {
                type: "text",
                text: { content: "Hello", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: "Hello",
                href: null,
              },
              {
                type: "text",
                text: { content: " ", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: " ",
                href: null,
              },
              {
                type: "text",
                text: { content: "World", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: "World",
                href: null,
              },
            ],
          },
        },
      } as unknown as PageObjectResponse;

      expect(extractTitle(page)).toBe("Hello World");
    });
  });

  describe("extractDatabaseTitle", () => {
    const baseMockDatabase = {
      object: "database",
      id: "db-id",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: {
        object: "user",
        id: "user-id",
      },
      last_edited_by: {
        object: "user",
        id: "user-id",
      },
      icon: null,
      cover: null,
      url: "https://notion.so/db-id",
      public_url: null,
      archived: false,
      description: [],
      is_inline: false,
      properties: {},
      parent: { type: "workspace", workspace: true },
      title: [] as RichTextItemResponse[],
      in_trash: false,
    } as DatabaseObjectResponse;

    it("should return 'Untitled Database' for missing title", () => {
      const database = {
        ...baseMockDatabase,
        title: [] as RichTextItemResponse[],
      } as DatabaseObjectResponse;

      expect(extractDatabaseTitle(database)).toBe("Untitled Database");
    });

    it("should return 'Untitled Database' for empty title", () => {
      const database = {
        ...baseMockDatabase,
        title: [] as RichTextItemResponse[],
      } as DatabaseObjectResponse;

      expect(extractDatabaseTitle(database)).toBe("Untitled Database");
    });

    it("should concatenate multiple title segments", () => {
      const database = {
        ...baseMockDatabase,
        title: [
          {
            type: "text",
            text: { content: "Test", link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: "Test",
            href: null,
          },
          {
            type: "text",
            text: { content: " ", link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: " ",
            href: null,
          },
          {
            type: "text",
            text: { content: "Database", link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: "Database",
            href: null,
          },
        ] as RichTextItemResponse[],
      } as DatabaseObjectResponse;

      expect(extractDatabaseTitle(database)).toBe("Test Database");
    });
  });
});
