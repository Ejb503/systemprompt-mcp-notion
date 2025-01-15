import { Client } from "@notionhq/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function testNotionAPI() {
  try {
    console.log("\n=== Testing Search Pages ===");
    const searchResponse = await notion.search({
      query: "test",
      filter: {
        value: "page",
        property: "object",
      },
    });
    console.log("Search Results:", JSON.stringify(searchResponse, null, 2));

    console.log("\n=== Testing List Databases ===");
    const databasesResponse = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
    });
    console.log("Databases:", JSON.stringify(databasesResponse, null, 2));

    if (databasesResponse.results.length > 0) {
      const firstDatabase = databasesResponse.results[0];
      console.log("\n=== Testing Query Database ===");
      const databaseItems = await notion.databases.query({
        database_id: firstDatabase.id,
      });
      console.log("Database Items:", JSON.stringify(databaseItems, null, 2));
    }

    console.log("\n=== Testing Create Page ===");
    // Create a page in the first database if available
    if (databasesResponse.results.length > 0) {
      const database = databasesResponse.results[0];
      const createPageResponse = await notion.pages.create({
        parent: {
          database_id: database.id,
        },
        properties: {
          // Adjust these properties based on your database schema
          Name: {
            title: [
              {
                text: {
                  content: "Test Page",
                },
              },
            ],
          },
          // Add other properties as needed
        },
      });
      console.log("Created Page:", JSON.stringify(createPageResponse, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the tests
console.log("Starting Notion API tests...");
testNotionAPI().then(() => console.log("Tests completed"));
