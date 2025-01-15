# systemprompt-mcp-notion

[![npm version](https://img.shields.io/npm/v/systemprompt-mcp-notion.svg)](https://www.npmjs.com/package/systemprompt-mcp-notion)
[![Coverage Status](https://coveralls.io/repos/github/systemprompt-io/systemprompt-mcp-notion/badge.svg?branch=main)](https://coveralls.io/github/systemprompt-io/systemprompt-mcp-notion?branch=main)
[![Twitter Follow](https://img.shields.io/twitter/follow/tyingshoelaces_?style=social)](https://twitter.com/tyingshoelaces_)
[![Discord](https://img.shields.io/discord/1255160891062620252?color=7289da&label=discord)](https://discord.com/invite/wkAbSuPWpr)

[Website](https://systemprompt.io) | [Documentation](https://systemprompt.io/documentation) | [Blog](https://tyingshoelaces.com)

# SystemPrompt MCP Notion Server

A high-performance Model Context Protocol (MCP) server that seamlessly integrates Notion into your AI workflows. This server enables AI agents to interact with Notion pages, databases, and comments through a standardized protocol.

## Key Features

- **🔄 Real-time Synchronization**

  - Bi-directional sync between AI agents and Notion
  - Instant updates and notifications
  - Conflict resolution handling

- **📝 Comprehensive Content Management**

  - Create and update pages with rich text formatting
  - Manage databases with complex queries
  - Handle comments and discussions
  - Search across your Notion workspace

- **🔒 Enterprise-Grade Security**

  - Secure API key management
  - Granular permission controls
  - Rate limiting and request validation

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
     - Comment management
     - Search functionality

4. **MCP-Compatible Client**
   - [Systemprompt MCP Client](https://github.com/Ejb503/multimodal-mcp-client)
   - Claude Desktop
   - Any other MCP-compatible client

## Quick Start

1. **Installation**

   ```bash
   npm install systemprompt-mcp-notion
   ```

2. **Configuration**
   Create a `.env` file:

   ```env
   SYSTEMPROMPT_API_KEY=your_systemprompt_api_key
   NOTION_API_KEY=your_notion_integration_token
   ```

3. **Basic Usage**

   ```typescript
   import { NotionMCPServer } from "systemprompt-mcp-notion";

   const server = new NotionMCPServer();
   server.start();
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

### Code Quality

- **Linting**: ESLint with TypeScript support

  ```bash
  npm run lint
  npm run lint:fix
  ```

- **Type Checking**: TypeScript with strict mode

  ```bash
  npm run build
  ```

- **Continuous Integration**
  - Automated tests on pull requests
  - Coverage reporting to Coveralls
  - Dependency security scanning

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📖 [Documentation](https://systemprompt.io/documentation)
- 💬 [Discord Community](https://discord.com/invite/wkAbSuPWpr)
- 🐛 [Issue Tracker](https://github.com/systemprompt-io/systemprompt-mcp-notion/issues)
- 📧 [Email Support](mailto:support@systemprompt.io)

## License

MIT © [SystemPrompt](https://systemprompt.io)
