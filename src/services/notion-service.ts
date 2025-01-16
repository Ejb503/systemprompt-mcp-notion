import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  CreatePageParameters,
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";
import { isFullPage, mapPageToNotionPage } from "../utils/notion-utils.js";
import {
  ListPagesOptions,
  ListPagesResult,
  NotionPage,
  CreatePageOptions,
  UpdatePageOptions,
} from "../types/notion.js";

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

  /**
   * Updates an existing page in Notion
   */
  async updatePage(options: UpdatePageOptions): Promise<NotionPage> {
    const response = await this.client.pages.update({
      page_id: options.pageId,
      properties: options.properties,
    });

    if (!isFullPage(response)) {
      throw new Error("Invalid response from Notion API");
    }

    // After updating the page properties, update the content if provided
    if (options.children) {
      await this.client.blocks.children.append({
        block_id: options.pageId,
        children: options.children,
      });
    }

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

  async deletePage(pageId: string): Promise<void> {
    await this.client.pages.update({
      page_id: pageId,
      archived: true,
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

  async getPageBlocks(pageId: string) {
    const response = await this.client.blocks.children.list({
      block_id: pageId,
    });

    return response.results;
  }
}
