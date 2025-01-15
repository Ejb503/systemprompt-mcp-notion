# Handlers Directory Documentation

## Overview

This directory contains the MCP server request handlers that implement core functionality for resources, tools, and prompts. The handlers integrate with Notion and systemprompt.io APIs to provide comprehensive page, database, and content management capabilities.

## Handler Files

### `resource-handlers.ts`

Implements handlers for managing systemprompt.io blocks (resources):

- `handleListResources()`: Lists available blocks with metadata
  - Currently returns the default agent resource
  - Includes name, description, and MIME type
- `handleResourceCall()`: Retrieves block content by URI (`resource:///block/{id}`)
  - Validates URI format (`resource:///block/{id}`)
  - Returns block content with proper MCP formatting
  - Supports metadata and content management

### `tool-handlers.ts`

Implements handlers for Notion operations and resource management tools:

- `handleListTools()`: Lists available tools with their schemas
- `handleToolCall()`: Executes tool operations:

  **Page Operations:**

  - `systemprompt_search_notion_pages`: Search pages with text queries
  - `systemprompt_get_notion_page`: Get specific page details
  - `systemprompt_create_notion_page`: Create new pages
  - `systemprompt_update_notion_page`: Update existing pages

  **Database Operations:**

  - `systemprompt_list_notion_databases`: List available databases
  - `systemprompt_get_database_items`: Query database items

  **Comment Operations:**

  - `systemprompt_create_notion_comment`: Create page comments
  - `systemprompt_get_notion_comments`: Get page comments

  **Resource Operations:**

  - `systemprompt_fetch_resource`: Retrieve block content

### `prompt-handlers.ts`

Implements handlers for prompt management:

- `handleListPrompts()`: Lists available prompts with metadata
  - Returns predefined prompts for common tasks
  - Includes name, description, and required arguments
- `handleGetPrompt()`: Retrieves specific prompt by name
  - Returns prompt details with messages
  - Supports task-specific prompts (Page Manager, Database Organizer, etc.)

## Implementation Details

### Resource Handlers

- Default agent resource provides core functionality
- Includes specialized instructions for Notion operations
- Supports voice configuration for audio responses
- Returns content with proper MCP formatting

### Tool Handlers

- Implements comprehensive Notion operations
- Supports advanced page features:
  - Content searching and filtering
  - Property management
  - Page creation and updates
  - Hierarchical organization
- Database integration features:
  - Database listing and exploration
  - Item querying and filtering
  - Content organization
- Comment management:
  - Create and retrieve comments
  - Discussion thread support
- Input validation through TypeScript interfaces
- Proper error handling and response formatting

### Prompt Handlers

- Predefined prompts for common tasks:
  - Notion Page Manager
  - Database Content Organizer
  - Page Commenter
  - Page Creator
  - Database Explorer
- Each prompt includes:
  - Required and optional arguments
  - Clear descriptions
  - Task-specific instructions
- Supports both static and dynamic instructions

## Error Handling

- Comprehensive error handling across all handlers
- Specific error cases:
  - Invalid resource URI format
  - Resource not found
  - Invalid tool parameters
  - API operation failures
  - Authentication errors
- Descriptive error messages for debugging
- Proper error propagation to clients

## Usage Example

```typescript
// Register handlers with MCP server
server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
server.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleToolCall);
server.setRequestHandler(ListPromptsRequestSchema, handleListPrompts);
server.setRequestHandler(GetPromptRequestSchema, handleGetPrompt);
```

## Notifications

The server implements change notifications for:

- Prompt updates (`sendPromptChangedNotification`)
- Resource updates (`sendResourceChangedNotification`)
- Tool operation completions

These are sent asynchronously after successful operations to maintain responsiveness.

## Authentication

- Integrates with Notion API for workspace access
- Handles API token management
- Supports required capabilities
- Maintains secure credential handling

## Testing

Comprehensive test coverage includes:

- Unit tests for all handlers
- Mock services for Notion operations
- Error case validation
- Response format verification
- Tool operation validation
