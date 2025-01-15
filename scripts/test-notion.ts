import { Client } from "@notionhq/client";
import { config } from "dotenv";
import type {
  PageObjectResponse,
  DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";

// Load environment variables
config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function testNotionAPI() {
  try {
    // First test the API key by getting user bot info
    console.log("\n=== Testing API Access ===");
    try {
      const response = await notion.users.me({});
      console.log("Bot Info:", JSON.stringify(response, null, 2));
      console.log("Integration Name:", response.name);
      console.log("Integration Type:", response.type);
    } catch (error) {
      console.error(
        "Failed to get bot info. Your API key might be invalid:",
        error
      );
      return;
    }

    console.log("\n=== Testing Workspace Access ===");
    // Try to list all pages without any filter first
    const workspaceResponse = await notion.search({
      page_size: 10,
    });
    console.log("Total items in workspace:", workspaceResponse.results.length);
    console.log(
      "Types of items found:",
      workspaceResponse.results
        .map((item) => item.object)
        .filter((v, i, a) => a.indexOf(v) === i)
    );

    if (workspaceResponse.results.length === 0) {
      console.log("\nNo items found in workspace. This likely means:");
      console.log(
        "1. You haven't shared any pages/databases with the integration"
      );
      console.log("2. The integration doesn't have the correct permissions");
      console.log("\nTo fix this:");
      console.log("1. Go to a page in your Notion workspace");
      console.log("2. Click the '•••' menu in the top right");
      console.log("3. Click 'Add connections'");
      console.log("4. Select your integration");
      return;
    }

    console.log("\n=== Testing Search Pages ===");
    const searchResponse = await notion.search({
      query: "test",
      filter: {
        property: "object",
        value: "page",
      },
    });
    console.log("Number of pages found:", searchResponse.results.length);

    console.log("\n=== Testing List Databases ===");
    const databasesResponse = await notion.search({
      filter: {
        property: "object",
        value: "database",
      },
    });
    console.log("Number of databases found:", databasesResponse.results.length);

    if (databasesResponse.results.length > 0) {
      const firstDatabase = databasesResponse
        .results[0] as DatabaseObjectResponse;
      console.log("\nFound database:");
      console.log("- ID:", firstDatabase.id);
      console.log(
        "- Title:",
        firstDatabase.title?.[0]?.plain_text || "Untitled"
      );

      console.log("\n=== Testing Database Access ===");
      try {
        const databaseItems = await notion.databases.query({
          database_id: firstDatabase.id,
          page_size: 10,
        });
        console.log("Can query database:", true);
        console.log("Number of items:", databaseItems.results.length);
      } catch (error) {
        console.log("Cannot query database. Error:", error);
      }
    } else {
      console.log("\nNo databases found. To test database functionality:");
      console.log("1. Create a database in Notion");
      console.log("2. Share it with this integration");
      console.log("3. Run this test again");
    }
  } catch (error) {
    console.error("\nError:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

// Run the tests
console.log("Starting Notion API tests...");
console.log(
  "Using API Key:",
  process.env.NOTION_API_KEY ? "Present" : "Missing"
);
testNotionAPI().then(() => console.log("\nTests completed"));
