import type {
  CreatePageParameters,
  CreateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints.d.ts";

export interface SearchPagesArgs {
  query: string;
  maxResults?: number;
}

export interface GetPageArgs {
  pageId: string;
}

export interface GetDatabaseItemsArgs {
  databaseId: string;
  maxResults?: number;
}

export type CreatePageArgs = {
  parent:
    | { database_id: string; type?: "database_id" }
    | { page_id: string; type?: "page_id" };
  properties: CreatePageParameters["properties"];
  children?: CreatePageParameters["children"];
};

export interface GetPagePropertyArgs {
  pageId: string;
  propertyId: string;
}

export interface UpdatePageArgs {
  pageId: string;
  properties: Record<string, any>;
}

export interface SearchPagesByTitleArgs {
  title: string;
  maxResults?: number;
}

export interface CreateCommentArgs {
  pageId: string;
  content: string;
  discussionId?: string;
}

export interface GetCommentsArgs {
  pageId: string;
}

export interface CreateDatabaseArgs {
  parent: { page_id: string };
  title: string;
  properties: CreateDatabaseParameters["properties"];
}

export interface ListDatabasesArgs {
  maxResults?: number;
}
