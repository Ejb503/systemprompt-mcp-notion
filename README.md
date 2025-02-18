# systemprompt-mcp-notion

[![npm version](https://img.shields.io/npm/v/systemprompt-mcp-notion.svg)](https://www.npmjs.com/package/systemprompt-mcp-notion)
[![Coverage Status](https://coveralls.io/repos/github/Ejb503/systemprompt-mcp-notion/badge.svg?branch=main)](https://coveralls.io/github/Ejb503/systemprompt-mcp-notion?branch=main)
[![Twitter Follow](https://img.shields.io/twitter/follow/tyingshoelaces_?style=social)](https://twitter.com/tyingshoelaces_)
[![Discord](https://img.shields.io/discord/1255160891062620252?color=7289da&label=discord)](https://discord.com/invite/wkAbSuPWpr)
[![smithery badge](https://smithery.ai/badge/systemprompt-mcp-notion)](https://smithery.ai/server/systemprompt-mcp-notion)

[Website](https://systemprompt.io) | [Documentation](https://systemprompt.io/documentation)

# SystemPrompt MCP Notion Server

A high-performance Model Context Protocol (MCP) server that seamlessly integrates Notion into your AI workflows. This server enables AI agents to interact with Notion pages and databases through a standardized protocol. This server supports and requires MCP Sampling, which is required to the MCP to create and update Notion pages.

A compatible MCP client is available [here](https://github.com/Ejb503/multimodal-mcp-client).

<a href="https://glama.ai/mcp/servers/xe6grtrr0k"><img width="380" height="200" src="https://glama.ai/mcp/servers/xe6grtrr0k/badge" alt="SystemPrompt Notion Server MCP server" /></a>

## Server Capabilities

```typescript
const serverCapabilities: { capabilities: ServerCapabilities } = {
  capabilities: {
    resources: {
      listChanged: true,
    },
    tools: {},
    prompts: {
      listChanged: true,
    },
    sampling: {},
  },
};
```

## Key Features

- **📝 Comprehensive Content Management**

  - Create and update pages with rich text formatting
  - Search across your Notion workspace

- **🛠 Developer-Friendly**
  - Extensive test coverage with Jest
  - TypeScript support
  - Comprehensive error handling
  - Detailed logging and debugging tools

## Prerequisites

Before using this server, you'll need:

1. **Systemprompt API Key** (Free)

   - Sign up at [systemprompt.io/console](https://systemprompt.io/console)
   - Create a new API key in your dashboard

2. **Notion Account and Workspace**

   - Active Notion account
   - Workspace with content you want to access

3. **Notion Integration**

   - Create at [notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Required capabilities:
     - Read/Update/Insert content
     - Database management
     - Search functionality

4. **MCP-Compatible Client**
   - [Systemprompt MCP Client](https://github.com/Ejb503/multimodal-mcp-client)
   - Any other MCP-compatible client

## Quick Start

1. **Installation**

   ### Installing via Smithery

   To install systemprompt-mcp-notion for Claude Desktop automatically via [Smithery](https://smithery.ai/server/systemprompt-mcp-notion):

   ```bash
   npx -y @smithery/cli install systemprompt-mcp-notion --client claude
   ```

   ```bash
   npm install systemprompt-mcp-notion
   ```

2. **Configuration**
   Create a `.env` file:

   ```env
   SYSTEMPROMPT_API_KEY=your_systemprompt_api_key
   NOTION_API_KEY=your_notion_integration_token
   ```

3. **MCP Configuration**
   Add the following to your MCP configuration JSON:

   ```json
   {
     "mcpServers": {
       "notion": {
         "command": "npx",
         "args": ["systemprompt-mcp-notion"],
         "env": {
           "SYSTEMPROMPT_API_KEY": "your_systemprompt_api_key",
           "NOTION_API_KEY": "your_notion_integration_token"
         }
       }
     }
   }
   ```

   Alternatively, if you've installed the package locally:

   ```json
   {
     "mcpServers": {
       "notion": {
         "command": "node",
         "args": ["./node_modules/systemprompt-mcp-notion/build/index.js"],
         "env": {
           "SYSTEMPROMPT_API_KEY": "your_systemprompt_api_key",
           "NOTION_API_KEY": "your_notion_integration_token"
         }
       }
     }
   }
   ```

## Development

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/systemprompt-io/systemprompt-mcp-notion.git
   cd systemprompt-mcp-notion
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

### Testing

We maintain high test coverage using Jest:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Test Notion API connection
npm run test:notion
```
