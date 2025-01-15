import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  TitlePropertyItemObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";
import { NotionPage, NotionParentType } from "../types/notion.js";

export function isFullPage(obj: unknown): obj is PageObjectResponse {
  console.log("Checking if object is a full page:", obj);

  if (!obj || typeof obj !== "object") {
    console.log("Not an object");
    return false;
  }

  if (!("object" in obj) || !("parent" in obj)) {
    console.log("Missing object or parent property");
    return false;
  }

  if ((obj as any).object !== "page") {
    console.log("Not a page object");
    return false;
  }

  const parent = (obj as any).parent;
  if (!parent || typeof parent !== "object") {
    console.log("Parent is not an object");
    return false;
  }

  if (!("type" in parent)) {
    console.log("Parent missing type");
    return false;
  }

  const parentType = parent.type;
  const isValid =
    parentType === "database_id" ||
    parentType === "page_id" ||
    parentType === "workspace";
  console.log(`Parent type is ${parentType}, isValid: ${isValid}`);

  return isValid;
}

export function mapPageToNotionPage(page: PageObjectResponse): NotionPage {
  let parentType: NotionParentType;
  let parentId: string;

  if ("database_id" in page.parent) {
    parentType = "database_id";
    parentId = page.parent.database_id;
  } else if ("page_id" in page.parent) {
    parentType = "page_id";
    parentId = page.parent.page_id;
  } else {
    parentType = "workspace";
    parentId = "workspace";
  }

  return {
    id: page.id,
    title: extractTitle(page),
    url: page.url,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    properties: page.properties,
    parent: {
      type: parentType,
      id: parentId,
    },
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
