# Services Directory Documentation

## Overview

This directory contains service implementations that handle external integrations and business logic for the MCP server. The services are organized into two main categories:

1. System Prompt Services - For interacting with the systemprompt.io API
2. Notion Services - For interacting with the Notion API

## Service Architecture

### Base Services

#### `notion-base-service.ts`

An abstract base class that provides common functionality for all Notion services:

```typescript
abstract class NotionBaseService {
  protected client: NotionClient;

  constructor();
  protected waitForInit(): Promise<void>;
}
```

Features:

- Automatic client initialization
- Shared client instance management
- Error handling for API failures

### Core Services

#### `systemprompt-service.ts`

A singleton service for interacting with the systemprompt.io API:

```typescript
class SystemPromptService {
  private static instance: SystemPromptService | null = null;

  static initialize(apiKey: string, baseUrl?: string): void;
  static getInstance(): SystemPromptService;
  static cleanup(): void;

  // Prompt Operations
  async getAllPrompts(): Promise<SystempromptPromptResponse[]>;

  // Block Operations
  async listBlocks(): Promise<SystempromptBlockResponse[]>;
  async getBlock(blockId: string): Promise<SystempromptBlockResponse>;
}
```

Features:

- Singleton pattern with API key initialization
- Comprehensive error handling with specific error types
- Configurable API endpoint
- Type-safe request/response handling

#### `notion-service.ts`

Manages Notion API interactions:

```typescript
class NotionService extends NotionBaseService {
  static getInstance(): NotionService;
  async initialize(): Promise<void>;

  // Page Operations
  async searchPages(query: string): Promise<NotionPage[]>;
  async getPage(pageId: string): Promise<NotionPage>;
  async createPage(options: CreatePageOptions): Promise<NotionPage>;
  async updatePage(options: UpdatePageOptions): Promise<NotionPage>;

  // Database Operations
  async listDatabases(): Promise<NotionDatabase[]>;
  async getDatabaseItems(databaseId: string): Promise<NotionPage[]>;

  // Comment Operations
  async createComment(pageId: string, content: string): Promise<NotionComment>;
  async getComments(pageId: string): Promise<NotionComment[]>;
}
```

## Implementation Details

### Error Handling

All services implement comprehensive error handling:

```typescript
try {
  const response = await this.client.pages.retrieve({ page_id: pageId });
  if (!response) {
    throw new Error("Page not found");
  }
  return this.mapPageResponse(response);
} catch (error) {
  throw new Error(`Notion API request failed: ${error.message}`);
}
```

### Authentication

#### System Prompt Authentication

- API key-based authentication
- Key passed via headers
- Environment variable configuration

#### Notion Authentication

- API token-based authentication
- Integration token management
- Capability-based access control

## Usage Examples

### System Prompt Service

```typescript
// Initialize
SystemPromptService.initialize(process.env.SYSTEMPROMPT_API_KEY);
const service = SystemPromptService.getInstance();

// Get all prompts
const prompts = await service.getAllPrompts();

// List blocks
const blocks = await service.listBlocks();
```

### Notion Service

```typescript
// Initialize
const notionService = NotionService.getInstance();
await notionService.initialize();

// Page operations
const pages = await notionService.searchPages("query");
const page = await notionService.getPage("page-id");

// Database operations
const databases = await notionService.listDatabases();
const items = await notionService.getDatabaseItems("database-id");

// Comment operations
const comment = await notionService.createComment("page-id", "comment text");
const comments = await notionService.getComments("page-id");
```

## Testing

All services have corresponding test files in the `__tests__` directory:

- `systemprompt-service.test.ts`
- `notion-service.test.ts`
- `notion-base-service.test.ts`

Tests cover:

- Service initialization
- API interactions
- Error handling
- Authentication flows
- Response mapping
- Edge cases
