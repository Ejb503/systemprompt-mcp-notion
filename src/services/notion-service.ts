import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  CommentObjectResponse,
  CreatePageParameters,
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";
import {
  NotionPage,
  ListPagesOptions,
  ListPagesResult,
  CreatePageOptions,
  UpdatePageOptions,
  NotionComment,
} from "../types/notion.js";
import { isFullPage, mapPageToNotionPage } from "../utils/notion-utils.js";

export class NotionService {
  private static instance: NotionService;
  protected client: Client;

  private constructor(token: string) {
    this.client = new Client({
      auth: token,
    });
  }

  public static initialize(token: string): void {
    if (!token) {
      throw new Error("Notion API token is required");
    }
    if (!NotionService.instance) {
      NotionService.instance = new NotionService(token);
    }
  }

  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      throw new Error("NotionService must be initialized before use");
    }
    return NotionService.instance;
  }

  async listPages(options: ListPagesOptions = {}): Promise<ListPagesResult> {
    const response = await this.client.search({
      filter: {
        property: "object",
        value: "page",
      },
      page_size: options?.pageSize || 50,
      sort: options?.sort || {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
      start_cursor: options?.startCursor,
    });

    const pages = response.results.filter(isFullPage).map(mapPageToNotionPage);

    return {
      pages,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined,
    };
  }

  async searchPages(
    query: string,
    maxResults: number = 50
  ): Promise<ListPagesResult> {
    const response = await this.client.search({
      query,
      filter: {
        property: "object",
        value: "page",
      },
      page_size: maxResults,
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    const pages = response.results.filter(isFullPage).map(mapPageToNotionPage);

    return {
      pages,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined,
    };
  }

  async getPage(pageId: string): Promise<NotionPage> {
    const page = (await this.client.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;

    return mapPageToNotionPage(page);
  }

  async createPage(options: CreatePageOptions): Promise<NotionPage> {
    const createParams: CreatePageParameters = {
      parent: options.parent,
      properties: options.properties,
      children: options.children,
    };

    const page = (await this.client.pages.create(
      createParams
    )) as PageObjectResponse;
    return mapPageToNotionPage(page);
  }

  async updatePage(options: UpdatePageOptions): Promise<NotionPage> {
    const response = (await this.client.pages.update({
      page_id: options.pageId,
      properties: options.properties,
    })) as PageObjectResponse;

    return mapPageToNotionPage(response);
  }

  async searchPagesByTitle(
    title: string,
    maxResults: number = 10
  ): Promise<ListPagesResult> {
    const response = await this.client.search({
      query: title,
      filter: {
        property: "object",
        value: "page",
      },
      page_size: maxResults,
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    const pages = response.results
      .filter(isFullPage)
      .map(mapPageToNotionPage)
      .filter((page) => page.title.toLowerCase().includes(title.toLowerCase()));

    return {
      pages,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined,
    };
  }

  async searchDatabases(maxResults: number = 50): Promise<any> {
    const response = await this.client.search({
      filter: {
        property: "object",
        value: "database",
      },
      page_size: maxResults,
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    return response;
  }

  async createComment(
    pageId: string,
    content: string,
    discussionId?: string
  ): Promise<NotionComment> {
    const response = (await this.client.comments.create({
      parent: {
        page_id: pageId,
      },
      discussion_id: discussionId,
      rich_text: [
        {
          type: "text",
          text: {
            content,
          },
        },
      ],
    })) as CommentObjectResponse;

    return {
      id: response.id,
      discussionId: response.discussion_id,
      content: response.rich_text[0]?.plain_text || "",
      createdTime: response.created_time,
      lastEditedTime: response.last_edited_time,
      parentId: discussionId,
    };
  }

  async getComments(pageId: string): Promise<NotionComment[]> {
    const response = await this.client.comments.list({
      block_id: pageId,
    });

    return response.results
      .filter(
        (comment): comment is CommentObjectResponse =>
          "discussion_id" in comment
      )
      .map((comment) => {
        const parentId =
          "comment_id" in comment.parent
            ? (comment.parent as { comment_id: string }).comment_id
            : undefined;

        return {
          id: comment.id,
          discussionId: comment.discussion_id,
          content: comment.rich_text[0]?.plain_text || "",
          createdTime: comment.created_time,
          lastEditedTime: comment.last_edited_time,
          parentId,
        };
      });
  }

  async getPageProperty(
    pageId: string,
    propertyId: string
  ): Promise<GetPagePropertyResponse> {
    return await this.client.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    });
  }
}
