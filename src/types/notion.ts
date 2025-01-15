import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  CreatePageParameters,
  SearchParameters,
} from "@notionhq/client/build/src/api-endpoints.d.ts";

export type NotionParentType = Extract<
  PageObjectResponse["parent"]["type"],
  "database_id" | "page_id" | "workspace"
>;

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: PageObjectResponse["properties"];
  parent: {
    type: NotionParentType;
    id: string;
  };
}

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  properties: DatabaseObjectResponse["properties"];
}

export interface ListPagesOptions {
  startCursor?: string;
  pageSize?: number;
  filter?: SearchParameters["filter"];
  sort?: SearchParameters["sort"];
}

export interface ListPagesResult {
  pages: NotionPage[];
  hasMore: boolean;
  nextCursor?: string;
}

export type CreatePageOptions = {
  parent:
    | { database_id: string; type?: "database_id" }
    | { page_id: string; type?: "page_id" };
  properties: CreatePageParameters["properties"];
  children?: CreatePageParameters["children"];
};

export interface UpdatePageOptions {
  pageId: string;
  properties: CreatePageParameters["properties"];
}

export interface NotionComment {
  id: string;
  discussionId: string;
  content: string;
  createdTime: string;
  lastEditedTime: string;
  parentId?: string;
}
