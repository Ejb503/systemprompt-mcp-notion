import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  TitlePropertyItemObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";
import type { NotionPage, NotionParent } from "../types/notion.js";

export function isFullPage(obj: unknown): obj is PageObjectResponse {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  if (!("object" in obj) || !("parent" in obj)) {
    return false;
  }

  if ((obj as any).object !== "page") {
    return false;
  }

  const parent = (obj as any).parent;
  if (!parent || typeof parent !== "object") {
    return false;
  }

  if (!("type" in parent)) {
    return false;
  }

  const parentType = parent.type;
  const isValid =
    parentType === "database_id" ||
    parentType === "page_id" ||
    parentType === "workspace";

  return isValid;
}

export function mapPageToNotionPage(page: PageObjectResponse): NotionPage {
  let parent: NotionParent;

  if ("database_id" in page.parent) {
    parent = {
      type: "database_id",
      database_id: page.parent.database_id,
    };
  } else if ("page_id" in page.parent) {
    parent = {
      type: "page_id",
      page_id: page.parent.page_id,
    };
  } else if (page.parent.type === "workspace") {
    parent = {
      type: "workspace",
      workspace: true,
    };
  } else {
    throw new Error("Invalid parent type");
  }

  return {
    id: page.id,
    title: extractTitle(page),
    url: page.url,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    properties: page.properties,
    parent,
  };
}

export function extractTitle(page: PageObjectResponse): string {
  const titleProperty = Object.entries(page.properties).find(
    ([_, prop]) => prop.type === "title"
  )?.[1] as TitlePropertyItemObjectResponse | undefined;

  if (!titleProperty?.title) return "Untitled";

  const richTextItems =
    titleProperty.title as unknown as RichTextItemResponse[];
  return richTextItems.map((item) => item.plain_text).join("") || "Untitled";
}

export function extractDatabaseTitle(database: DatabaseObjectResponse): string {
  if (!database.title) return "Untitled Database";

  const richTextItems = database.title as unknown as RichTextItemResponse[];
  return (
    richTextItems.map((item) => item.plain_text).join("") || "Untitled Database"
  );
}
