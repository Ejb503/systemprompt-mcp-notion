import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  CommentObjectResponse,
  CreatePageParameters,
  GetPagePropertyResponse,
  CreateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints.d.ts";
import {
  NotionPage,
  NotionDatabase,
  ListPagesOptions,
  ListPagesResult,
  CreatePageOptions,
  UpdatePageOptions,
  NotionComment,
} from "../types/notion.js";
import {
  isFullPage,
  mapPageToNotionPage,
  extractDatabaseTitle,
} from "../utils/notion-utils.js";

export class NotionService {
  private static instance: NotionService;
  protected client: Client;

  private constructor(token: string) {
    this.client = new Client({
      auth: token,
    });
  }

  public static initialize(token: string): void {
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
        ...options.filter,
      },
      page_size: options.pageSize || 100,
      sort: options.sort || {
        direction: "descending",
        timestamp: "last_edited_time",
      },
      start_cursor: options.startCursor,
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
    maxResults: number = 10
  ): Promise<NotionPage[]> {
    console.log(`Searching for pages with query: "${query}"`);

    const response = await this.client.search({
      query,
      filter: {
        value: "page",
        property: "object",
      },
      page_size: maxResults,
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    console.log(`Found ${response.results.length} results before filtering`);

    const pages = response.results.filter(isFullPage).map(mapPageToNotionPage);
    console.log(`Returning ${pages.length} pages after filtering`);

    return pages;
  }

  async getPage(pageId: string): Promise<NotionPage> {
    const page = (await this.client.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;

    return mapPageToNotionPage(page);
  }

  async getDatabaseItems(
    databaseId: string,
    maxResults: number = 10
  ): Promise<NotionPage[]> {
    const response = await this.client.databases.query({
      database_id: databaseId,
      page_size: maxResults,
    });

    return response.results.filter(isFullPage).map(mapPageToNotionPage);
  }

  async listDatabases(maxResults: number = 10): Promise<NotionDatabase[]> {
    const response = await this.client.databases.list({
      page_size: maxResults,
    });

    return response.results
      .filter(
        (database): database is DatabaseObjectResponse =>
          "title" in database && "url" in database && "created_time" in database
      )
      .map((database) => ({
        id: database.id,
        title: extractDatabaseTitle(database),
        url: database.url,
        properties: database.properties,
        createdTime: database.created_time,
        lastEditedTime: database.last_edited_time,
      }));
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
  ): Promise<NotionPage[]> {
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

    return response.results
      .filter(isFullPage)
      .map(mapPageToNotionPage)
      .filter((page) => page.title.toLowerCase().includes(title.toLowerCase()));
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

  async createDatabase(
    parent: { page_id: string },
    title: string,
    properties: CreateDatabaseParameters["properties"]
  ): Promise<NotionDatabase> {
    const response = (await this.client.databases.create({
      parent,
      title: [
        {
          type: "text",
          text: { content: title },
        },
      ],
      properties,
    })) as DatabaseObjectResponse;

    return {
      id: response.id,
      title: extractDatabaseTitle(response),
      url: response.url,
      properties: response.properties,
    };
  }
}
