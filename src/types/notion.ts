import type {
  CreatePageParameters,
  SearchParameters,
  PageObjectResponse,
  CommentObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";

export type NotionParentType = "database_id" | "page_id" | "workspace";

export type NotionParent =
  | {
      type: "database_id";
      database_id: string;
    }
  | {
      type: "page_id";
      page_id: string;
    }
  | {
      type: "workspace";
      workspace: true;
    };

export interface NotionPage {
  id: PageObjectResponse["id"];
  title: string;
  url: PageObjectResponse["url"];
  created_time: PageObjectResponse["created_time"];
  last_edited_time: PageObjectResponse["last_edited_time"];
  properties: PageObjectResponse["properties"];
  parent: NotionParent;
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
  parent: CreatePageParameters["parent"];
  properties: CreatePageParameters["properties"];
  children?: CreatePageParameters["children"];
};

export interface UpdatePageOptions {
  pageId: string;
  properties: CreatePageParameters["properties"];
}

export interface NotionComment {
  id: CommentObjectResponse["id"];
  discussionId: CommentObjectResponse["discussion_id"];
  content: string;
  createdTime: CommentObjectResponse["created_time"];
  lastEditedTime: CommentObjectResponse["last_edited_time"];
  parentId?: string;
}
