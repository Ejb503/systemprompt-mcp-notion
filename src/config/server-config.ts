import {
  Implementation,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";

interface ServerMetadata {
  name: string;
  description: string;
  icon: string;
  color: string;
  serverStartTime: number;
  environment: string | undefined;
  customData: {
    serverFeatures: string[];
    supportedAPIs: string[];
    authProvider: string;
    requiredCapabilities: string[];
  };
}

export const serverConfig: Implementation & { metadata: ServerMetadata } = {
  name: "systemprompt-mcp-notion",
  version: "1.0.0",
  metadata: {
    name: "System Prompt Notion Integration Server",
    description:
      "MCP server providing seamless integration with Notion. Enables AI agents to interact with Notion pages, databases, and comments through a secure, standardized interface.",
    icon: "mdi:notion",
    color: "black",
    serverStartTime: Date.now(),
    environment: process.env.NODE_ENV,
    customData: {
      serverFeatures: ["notion-pages", "notion-databases", "notion-comments"],
      supportedAPIs: ["notion"],
      authProvider: "notion-api",
      requiredCapabilities: [
        "read_content",
        "update_content",
        "insert_content",
        "comment_access",
      ],
    },
  },
};

export const serverCapabilities: { capabilities: ServerCapabilities } = {
  capabilities: {
    resources: {
      listChanged: true,
    },
    tools: {},
    prompts: {
      listChanged: true,
    },
  },
};
