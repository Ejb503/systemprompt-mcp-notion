#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig, serverCapabilities } from "./config/server-config.js";
import {
  handleListResources,
  handleResourceCall,
} from "./handlers/resource-handlers.js";
import { listTools, handleToolCall } from "./handlers/tool-handlers.js";
import {
  handleListPrompts,
  handleGetPrompt,
} from "./handlers/prompt-handlers.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolRequestSchema,
  CreateMessageRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";
import { SystemPromptService } from "./services/systemprompt-service.js";
import { NotionService } from "./services/notion-service.js";
import { sendSamplingRequest } from "./handlers/sampling.js";

// Create server instance
export let server: Server;

export async function main() {
  config();

  // Initialize SystemPrompt service
  const apiKey = process.env.SYSTEMPROMPT_API_KEY;
  if (!apiKey) {
    throw new Error("SYSTEMPROMPT_API_KEY environment variable is required");
  }
  SystemPromptService.initialize(apiKey);

  // Initialize Notion service
  const notionToken = process.env.NOTION_API_KEY;
  if (!notionToken) {
    throw new Error("NOTION_API_KEY environment variable is required");
  }
  NotionService.initialize(notionToken);

  // Initialize server
  server = new Server(serverConfig, serverCapabilities);

  server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
  server.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
  server.setRequestHandler(ListToolsRequestSchema, listTools);
  server.setRequestHandler(CallToolRequestSchema, handleToolCall);
  server.setRequestHandler(ListPromptsRequestSchema, handleListPrompts);
  server.setRequestHandler(GetPromptRequestSchema, handleGetPrompt);
  server.setRequestHandler(CreateMessageRequestSchema, sendSamplingRequest);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Run the server unless in test environment
if (process.env.NODE_ENV !== "test") {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
