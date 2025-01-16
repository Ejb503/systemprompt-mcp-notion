import { describe, it, expect } from "@jest/globals";
import {
  createTextResponse,
  createPagesResponse,
  createDatabasesResponse,
} from "../tool-utils.js";
import type { NotionPage } from "../../types/notion.js";
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

describe("Tool Utils", () => {
  describe("createTextResponse", () => {
    it("should create a text response", () => {
      const response = createTextResponse("Test message");
      expect(response).toEqual({
        content: [
          {
            type: "text",
            text: "Test message",
          },
        ],
      });
    });
  });

  describe("createPagesResponse", () => {
    it("should create a pages response", () => {
      const pages: NotionPage[] = [
        {
          id: "page123",
          title: "Test Page",
          url: "https://notion.so/page123",
          created_time: "2024-01-01T00:00:00.000Z",
          last_edited_time: "2024-01-01T00:00:00.000Z",
          properties: {},
          parent: { type: "database_id", database_id: "db123" },
        },
      ];

      const response = createPagesResponse(pages);
      expect(response).toEqual({
        content: [
          {
            type: "resource",
            resource: {
              uri: "notion://pages",
              text: JSON.stringify(pages, null, 2),
              mimeType: "application/json",
            },
          },
        ],
      });
    });
  });

  describe("createDatabasesResponse", () => {
    it("should create a databases response", () => {
      const databases: DatabaseObjectResponse[] = [
        {
          object: "database",
          id: "db123",
          created_time: "2024-01-01T00:00:00.000Z",
          last_edited_time: "2024-01-01T00:00:00.000Z",
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
          properties: {},
          parent: { type: "workspace", workspace: true },
          url: "https://notion.so/db123",
          archived: false,
          icon: null,
          cover: null,
          is_inline: false,
          public_url: null,
          created_by: {
            object: "user",
            id: "user123",
          },
          last_edited_by: {
            object: "user",
            id: "user123",
          },
          in_trash: false,
        },
      ];

      const response = createDatabasesResponse(databases);
      expect(response).toEqual({
        content: [
          {
            type: "resource",
            resource: {
              uri: "notion://databases",
              text: JSON.stringify(databases, null, 2),
              mimeType: "application/json",
            },
          },
        ],
      });
    });
  });
});
