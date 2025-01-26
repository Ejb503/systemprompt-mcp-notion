import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  CreatePageParameters,
  GetPagePropertyResponse,
  DatabaseObjectResponse,
  PartialPageObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";
import { isFullPage, mapPageToNotionPage } from "../utils/notion-utils.js";
import {
  ListPagesOptions,
  CreatePageOptions,
  UpdatePageOptions,
} from "../types/notion.js";

// Simplified types for LLM-friendly responses
type SimplifiedResponse = {
  id: string;
  content: string;
  _message: string;
  metadata?: {
    lastEditedTime?: string;
    createdTime?: string;
    type?: string;
    [key: string]: any;
  };
};

type SimplifiedListResponse = {
  items: SimplifiedResponse[];
  _message: string;
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
  };
};

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

  async listPages(
    options: ListPagesOptions = {}
  ): Promise<SimplifiedListResponse> {
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

    const items = response.results
      .filter((result): result is PageObjectResponse => isFullPage(result))
      .map((page) => ({
        id: page.id,
        content: this.extractPageTitle(page),
        _message: `Page ${page.id} retrieved successfully`,
        metadata: {
          lastEditedTime: page.last_edited_time,
          createdTime: page.created_time,
          type: "page",
        },
      }));

    return {
      items,
      _message: "List pages operation completed successfully",
      pagination: {
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      },
    };
  }

  // Helper function to safely extract page title
  private extractPageTitle(page: PageObjectResponse): string {
    const titleProperty = Object.values(page.properties).find(
      (prop) => prop.type === "title"
    );
    return titleProperty?.type === "title"
      ? titleProperty.title[0]?.plain_text || ""
      : "";
  }

  async searchPages(
    query: string,
    maxResults: number = 50
  ): Promise<SimplifiedListResponse> {
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

    const items = response.results
      .filter((result): result is PageObjectResponse => isFullPage(result))
      .map((page) => ({
        id: page.id,
        content: this.extractPageTitle(page),
        _message: `Page ${page.id} found in search`,
        metadata: {
          lastEditedTime: page.last_edited_time,
          type: "page",
        },
      }));

    return {
      items,
      _message: `Search pages operation completed successfully with ${items.length} results`,
      pagination: {
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      },
    };
  }

  async getPage(pageId: string): Promise<SimplifiedResponse> {
    const page = (await this.client.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;

    return {
      id: page.id,
      content: this.extractPageTitle(page),
      _message: `Page ${pageId} retrieved successfully`,
      metadata: {
        lastEditedTime: page.last_edited_time,
        createdTime: page.created_time,
        type: "page",
        properties: page.properties,
      },
    };
  }

  async createPage(options: CreatePageOptions): Promise<SimplifiedResponse> {
    const page = (await this.client.pages.create(
      options
    )) as PageObjectResponse;

    return {
      id: page.id,
      content: this.extractPageTitle(page),
      _message: `Page ${page.id} created successfully`,
      metadata: {
        lastEditedTime: page.last_edited_time,
        createdTime: page.created_time,
        type: "page",
      },
    };
  }

  async updatePage(options: UpdatePageOptions): Promise<SimplifiedResponse> {
    const response = await this.client.pages.update({
      page_id: options.pageId,
      properties: options.properties,
    });

    if (!isFullPage(response)) {
      throw new Error("Invalid response from Notion API");
    }

    if (options.children) {
      await this.client.blocks.children.append({
        block_id: options.pageId,
        children: options.children,
      });
    }

    return {
      id: response.id,
      content: this.extractPageTitle(response),
      _message: `Page ${options.pageId} updated successfully`,
      metadata: {
        lastEditedTime: response.last_edited_time,
        type: "page",
        updated: true,
      },
    };
  }

  async searchPagesByTitle(
    title: string,
    maxResults: number = 10
  ): Promise<SimplifiedListResponse> {
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

    const items = response.results
      .filter((result): result is PageObjectResponse => isFullPage(result))
      .map((page) => ({
        id: page.id,
        content: this.extractPageTitle(page),
        _message: `Page ${page.id} matched title search`,
        metadata: {
          lastEditedTime: page.last_edited_time,
          type: "page",
        },
      }))
      .filter((page) =>
        page.content.toLowerCase().includes(title.toLowerCase())
      );

    return {
      items,
      _message: `Title search completed successfully with ${items.length} matches`,
      pagination: {
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      },
    };
  }

  async searchDatabases(
    maxResults: number = 50
  ): Promise<SimplifiedListResponse> {
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

    const items = response.results
      .filter(
        (result): result is DatabaseObjectResponse =>
          result.object === "database"
      )
      .map((database) => ({
        id: database.id,
        content: database.title[0]?.plain_text || "",
        _message: `Database ${database.id} found`,
        metadata: {
          type: "database",
          lastEditedTime: database.last_edited_time,
        },
      }));

    return {
      items,
      _message: `Database search completed successfully with ${items.length} results`,
      pagination: {
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      },
    };
  }

  async deletePage(pageId: string): Promise<SimplifiedResponse> {
    const response = (await this.client.pages.update({
      page_id: pageId,
      archived: true,
    })) as PageObjectResponse;

    return {
      id: pageId,
      content: "Page archived",
      _message: `Page ${pageId} archived successfully`,
      metadata: {
        type: "page",
        archived: true,
        lastEditedTime: response.last_edited_time,
      },
    };
  }

  async getPageProperty(
    pageId: string,
    propertyId: string
  ): Promise<SimplifiedResponse> {
    const response = await this.client.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    });

    return {
      id: propertyId,
      content: JSON.stringify(response),
      _message: `Property ${propertyId} retrieved successfully from page ${pageId}`,
      metadata: {
        type: "property",
        pageId: pageId,
      },
    };
  }

  async getPageBlocks(pageId: string): Promise<SimplifiedListResponse> {
    const response = await this.client.blocks.children.list({
      block_id: pageId,
    });

    const items = response.results.map((block) => {
      const blockResponse = block as BlockObjectResponse;
      return {
        id: block.id,
        content:
          blockResponse.type === "paragraph"
            ? blockResponse.paragraph?.rich_text?.[0]?.plain_text || ""
            : "",
        _message: `Block ${block.id} retrieved successfully`,
        metadata: {
          type: blockResponse.type,
          hasChildren: blockResponse.has_children || false,
        },
      };
    });

    return {
      items,
      _message: `Page blocks retrieved successfully with ${items.length} blocks`,
      pagination: {
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      },
    };
  }
}
