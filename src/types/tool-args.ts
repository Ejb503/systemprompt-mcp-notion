import type {} from "@notionhq/client/build/src/api-endpoints.js";

export interface SearchPagesArgs {
  query: string;
  maxResults?: number;
}

export interface GetPageArgs {
  pageId: string;
}

export interface CreatePageArgs {
  databaseId: string;
  userInstructions: string;
}

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

export interface ListPagesArgs {
  maxResults?: number;
}

export interface ListDatabasesArgs {
  maxResults?: number;
}

export type ToolResponse = {
  content: {
    type: "text" | "resource";
    text: string;
    resource?: {
      uri: string;
      text: string;
      mimeType: string;
    };
  }[];
  _meta?: Record<string, unknown>;
  isError?: boolean;
};
