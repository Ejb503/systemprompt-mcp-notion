# System Prompt Notion Integration Server

## Overview

This directory contains the configuration and metadata for the System Prompt Notion Integration Server, which implements the Model Context Protocol (MCP) for Notion services. It provides a standardized interface for AI agents to interact with Notion pages, databases, and comments.

## Files

### `server-config.ts`

The main configuration file that exports:

- `serverConfig`: Server metadata and Notion integration settings
- `serverCapabilities`: Server capability definitions

## Configuration Structure

### Server Configuration

```typescript
{
  name: string;           // "systemprompt-mcp-notion"
  version: string;        // Current server version
  metadata: {
    name: string;         // "System Prompt Notion Integration Server"
    description: string;  // Server description
    icon: string;         // "mdi:notion"
    color: string;        // "black"
    serverStartTime: number;  // Server start timestamp
    environment: string;  // process.env.NODE_ENV
    customData: {
      serverFeatures: string[];     // ["notion-pages", "notion-databases", "notion-comments"]
      supportedAPIs: string[];      // ["notion"]
      authProvider: string;         // "notion-api"
      requiredScopes: string[];     // Notion API capabilities needed for access
    }
  }
}
```

### Server Capabilities

```typescript
{
  capabilities: {
    resources: {
      listChanged: true,  // Support for resource change notifications
    },
    tools: {},           // Notion API-specific tool capabilities
    prompts: {
      listChanged: true, // Support for prompt change notifications
    }
  }
}
```

## Usage

Import the configuration objects when setting up the MCP server:

```typescript
import { serverConfig, serverCapabilities } from "./config/server-config.js";
```

## Environment Variables

The server requires these environment variables:

- `NODE_ENV`: Runtime environment (development/production)
- `NOTION_API_KEY`: Notion integration token for API access
- `SYSTEMPROMPT_API_KEY`: Systemprompt API key

## Features

The server provides these core features:

- **Page Management**: Create, read, update pages
- **Database Integration**: Query and manage database items
- **Comments**: Create and retrieve page comments
- **Resource Notifications**: Real-time updates for resource changes
- **MCP Compliance**: Full implementation of the Model Context Protocol

## Supported Notion Features

- Page Operations
- Database Operations
- Comments and Discussions
- Content Search
- Property Management

## Authentication

The server uses Notion's API token-based authentication with the following capabilities:

- Read content
- Update content
- Insert content
- Comment access

Additional capabilities can be configured as needed for expanded API access.
