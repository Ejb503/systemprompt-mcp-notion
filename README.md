# systemprompt-mcp-notion

[![npm version](https://img.shields.io/npm/v/systemprompt-mcp-notion.svg)](https://www.npmjs.com/package/systemprompt-mcp-notion)
[![Twitter Follow](https://img.shields.io/twitter/follow/tyingshoelaces_?style=social)](https://twitter.com/tyingshoelaces_)
[![Discord](https://img.shields.io/discord/1255160891062620252?color=7289da&label=discord)](https://discord.com/invite/wkAbSuPWpr)
TEST CONVERAGE BADGE
[Website](https://systemprompt.io) | [Documentation](https://systemprompt.io/documentation) | [Blog](https://tyingshoelaces.com)

This is tested and actively maintainer Model Context Protocol (MCP) server that integrates Notion into your AI workflows. This server enables seamless access to Notion through MCP, allowing AI agents to interact with pages, databases, and comments.

## Prerequisites

Before using this server, you'll need:

1. A Systemprompt API key (currently free):

   - Sign up at [systemprompt.io/console](https://systemprompt.io/console)
   - Create a new API key
   - Required to run the server

2. A Notion account and workspace

3. A Notion integration:

   - Create at [notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Required to access Notion's API

4. An MCP-compatible client like:
   - [Systemprompt MCP Client](https://github.com/Ejb503/multimodal-mcp-client)
   - Claude Desktop
   - Or any other MCP-compatible client

## Setup

### 1. Create a Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name your integration (e.g., "AI Assistant")
4. Select the workspace where you want to use the integration
5. Under "Capabilities", enable:
   - Read content
   - Update content
   - Insert content
   - Create databases
   - Create pages
   - Create comments
   - Search content
6. Click "Submit" to create the integration
7. Copy the "Internal Integration Token" (this will be your NOTION_API_KEY)

### 2. Share Pages/Databases with Your Integration

For each page or database you want to access:

1. Open the page/database in Notion
2. Click the "•••" (three dots) menu in the top right
3. Click "Add connections"
4. Find and select your integration
5. The page and all its sub-pages will now be accessible to the integration

### 3. Server Installation

1. Install the package:

```bash
npm install systemprompt-mcp-notion
```

2. Create a .env file with your API keys:

```env
SYSTEMPROMPT_API_KEY=your_systemprompt_api_key
NOTION_API_KEY=your_notion_integration_token
```

### 4. MCP Client Setup

Choose your preferred MCP client:

#### Using Systemprompt MCP Client

1. Install and configure the client following its [setup instructions](https://github.com/Ejb503/multimodal-mcp-client#-getting-started)
2. In the client's MCP configuration, add this server:

```json
{
  "servers": {
    "notion": {
      "type": "stdio",
      "command": "npx systemprompt-mcp-notion",
      "env": {
        "NOTION_API_KEY": "your_notion_integration_token",
        "SYSTEMPROMPT_API_KEY": "your_systemprompt_api_key"
      }
    }
  }
}
```

#### Using Claude Desktop

1. Install Claude Desktop
2. Add this server in Claude's MCP configuration section:
   ```json
   {
     "command": "npx systemprompt-mcp-notion",
     "env": {
       "NOTION_API_KEY": "your_notion_integration_token",
       "SYSTEMPROMPT_API_KEY": "your_systemprompt_api_key"
     }
   }
   ```
3. Configure the connection to use stdio mode

## Features

### Notion Integration

- **Page Operations**

  - Create and update pages
  - Search pages by title or content
  - Retrieve page properties
  - Add and manage comments

- **Database Operations**
  - List and explore databases
  - Query database items
  - Track and update entries
  - Create structured views

### Available Tools

1. `systemprompt_search_notion_pages`

   - Search for pages using text queries
   - Filter and sort results

2. `systemprompt_get_notion_page`

   - Retrieve a specific page by ID
   - Get all page content and properties

3. `systemprompt_list_notion_databases`

   - List all accessible databases
   - View database schemas

4. `systemprompt_get_database_items`

   - Query items from a specific database
   - Filter and sort results

5. `systemprompt_create_notion_page`

   - Create new pages in databases or as sub-pages
   - Set page properties and content

6. `systemprompt_update_notion_page`

   - Update existing page properties
   - Modify page content

7. `systemprompt_create_notion_comment`

   - Add comments to pages
   - Reply to existing comments

8. `systemprompt_get_notion_comments`
   - Retrieve comments from pages
   - View discussion threads

## Development

## Issues

If you encounter any issues, please create an issue on the [GitHub repository](https://github.com/Ejb503/systemprompt-mcp-notion/issues).

### Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/systemprompt-mcp-notion.git
cd systemprompt-mcp-notion
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add:
SYSTEMPROMPT_API_KEY=your_api_key  # from systemprompt.io/console
NOTION_API_KEY=your_notion_token    # from notion.so/my-integrations
```

4. Test the Notion connection:

```bash
npm run inspector # inspect the server
npm run test:notion # test the notion API
```

This will verify:

- Your API key is valid
- The integration has the correct permissions
- You can access pages and databases

### Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## License

MIT

## Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol/protocol)
- [Systemprompt MCP Client](https://github.com/Ejb503/multimodal-mcp-client)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
