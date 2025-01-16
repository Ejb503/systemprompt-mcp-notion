import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { MockServer } from "../__mocks__/@modelcontextprotocol/sdk";
import { SystemPromptService } from "../services/systemprompt-service.js";
import { NotionService } from "../services/notion-service.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolRequestSchema,
  CreateMessageRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { serverConfig, serverCapabilities } from "../config/server-config.js";
import { main } from "../index.js";

// Mock dependencies
jest.mock("../services/systemprompt-service.js", () => ({
  SystemPromptService: {
    initialize: jest.fn(),
    getInstance: jest.fn(),
    cleanup: jest.fn(),
  },
}));
jest.mock("../services/notion-service.js", () => ({
  NotionService: {
    initialize: jest.fn(),
    getInstance: jest.fn().mockReturnValue({
      searchPages: jest.fn(),
      getPage: jest.fn(),
      createPage: jest.fn(),
      updatePage: jest.fn(),
      deletePage: jest.fn(),
    }),
  },
}));
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Mock the server module
const mockServer: MockServer = {
  setRequestHandler: jest.fn(),
  connect: jest.fn(),
  onRequest: jest.fn(),
};

jest.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: jest.fn().mockImplementation(() => mockServer),
}));

// Mock process.env
const originalEnv = process.env;

describe("Server Initialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    jest.resetModules();

    // Reset server mock
    Object.assign(mockServer, {
      setRequestHandler: jest.fn(),
      connect: jest.fn(),
      onRequest: jest.fn(),
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should initialize services and connect server with valid environment", async () => {
    // Set up environment variables
    process.env.SYSTEMPROMPT_API_KEY = "test-systemprompt-key";
    process.env.NOTION_API_KEY = "test-notion-key";

    // Run main function
    await main();

    // Verify SystemPrompt service initialization
    expect(SystemPromptService.initialize).toHaveBeenCalledWith(
      "test-systemprompt-key"
    );

    // Verify Notion service initialization
    expect(NotionService.initialize).toHaveBeenCalledWith("test-notion-key");

    // Verify server initialization
    expect(Server).toHaveBeenCalledWith(serverConfig, serverCapabilities);

    // Verify request handlers were set
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ListResourcesRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ReadResourceRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ListToolsRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ListPromptsRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      GetPromptRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      CallToolRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      CreateMessageRequestSchema,
      expect.any(Function)
    );

    // Verify server connection
    expect(mockServer.connect).toHaveBeenCalled();
  });

  it("should throw error if SYSTEMPROMPT_API_KEY is missing", async () => {
    // Set up environment variables without SYSTEMPROMPT_API_KEY
    process.env.NOTION_API_KEY = "test-notion-key";
    delete process.env.SYSTEMPROMPT_API_KEY;

    // Import and run main function
    const { main } = await import("../index.js");
    await expect(main()).rejects.toThrow(
      "SYSTEMPROMPT_API_KEY environment variable is required"
    );
  });

  it("should throw error if NOTION_API_KEY is missing", async () => {
    // Set up environment variables without NOTION_API_KEY
    process.env.SYSTEMPROMPT_API_KEY = "test-systemprompt-key";
    delete process.env.NOTION_API_KEY;

    // Import and run main function
    const { main } = await import("../index.js");
    await expect(main()).rejects.toThrow(
      "NOTION_API_KEY environment variable is required"
    );
  });
});
