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
import type { CommentObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

// Mock objects
const mockCommentResponse: CommentObjectResponse = {
  id: "test-comment-id",
  object: "comment",
  discussion_id: "test-discussion-id",
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
  created_by: { object: "user", id: "user123" },
  parent: { type: "page_id", page_id: "test-page-id" },
};

const mockCommentsListResponse = {
  results: [mockCommentResponse],
  has_more: false,
  next_cursor: null,
};

// Mock the Client class
jest.mock("@notionhq/client", () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      comments: {
        create: jest.fn().mockResolvedValue(mockCommentResponse),
        list: jest.fn().mockResolvedValue(mockCommentsListResponse),
      },
    })),
  };
});

const TEST_TOKEN = "test-token";

describe("NotionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    NotionService.initialize(TEST_TOKEN);
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
      // Reset the NotionService instance
      (NotionService as any).instance = undefined;
      expect(() => NotionService.getInstance()).toThrow(
        "NotionService must be initialized before use"
      );
    });
  });

  describe("comment operations", () => {
    it("should create comment", async () => {
      const service = NotionService.getInstance();
      const result = await service.createComment(
        "test-page-id",
        "test comment"
      );
      expect(result).toEqual({
        id: "test-comment-id",
        discussionId: "test-discussion-id",
        content: "Test comment",
        createdTime: "2024-01-01T00:00:00.000Z",
        lastEditedTime: "2024-01-01T00:00:00.000Z",
        parentId: undefined,
      });
    }, 10000);

    it("should get comments", async () => {
      const service = NotionService.getInstance();
      const result = await service.getComments("test-page-id");
      expect(result).toEqual([
        {
          id: "test-comment-id",
          discussionId: "test-discussion-id",
          content: "Test comment",
          createdTime: "2024-01-01T00:00:00.000Z",
          lastEditedTime: "2024-01-01T00:00:00.000Z",
          parentId: undefined,
        },
      ]);
    }, 10000);
  });
});
