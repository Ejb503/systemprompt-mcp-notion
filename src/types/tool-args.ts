import type {} from "@notionhq/client/build/src/api-endpoints.js";

export interface SearchPagesArgs {
  query: string;
  maxResults?: number;
}

export interface GetPageArgs {
  pageId: string;
}

export interface CreatePageArgs {
  /**
   * High-level instructions for how to create the page, including title, structure, and any special requirements.
   * Example: "Create a meeting notes page titled 'Q4 Planning' with sections for agenda, attendees, and action items"
   */
  userInstructions?: string;

  /**
   * The actual content to be converted into Notion blocks, following Notion's markdown-like format.
   * Example: "# Agenda\n1. Review Q3 metrics\n2. Plan Q4 initiatives\n\n# Action Items\n- [ ] Update roadmap\n- [ ] Schedule follow-ups"
   */
  contentInstructions?: string;

  /**
   * The parent object where the page will be created (database or page)
   */
  parent?: {
    database_id?: string;
    page_id?: string;
  };

  /**
   * The properties of the page
   */
  properties?: Record<string, any>;
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
