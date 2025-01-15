import {
  GetPromptRequest,
  GetPromptResult,
  ListPromptsRequest,
  ListPromptsResult,
  Prompt,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";

// Define the base prompts without messages
const Prompts: Prompt[] = [
  {
    name: "Notion Page Manager",
    description:
      "An assistant that helps users manage their Notion pages and content",
    arguments: [
      {
        name: "action",
        description: "Action to perform (search/create/update)",
        required: true,
      },
      {
        name: "query",
        description: "Search query or page content",
        required: true,
      },
      {
        name: "maxResults",
        description: "Maximum number of results to return",
        required: false,
      },
    ],
  },
  {
    name: "Database Content Organizer",
    description: "Helps organize and manage content within Notion databases",
    arguments: [
      {
        name: "databaseId",
        description: "ID of the database to work with",
        required: true,
      },
      {
        name: "maxResults",
        description: "Maximum number of items to retrieve",
        required: false,
      },
    ],
  },
  {
    name: "Page Commenter",
    description: "Manages comments and discussions on Notion pages",
    arguments: [
      {
        name: "pageId",
        description: "ID of the page to comment on",
        required: true,
      },
      {
        name: "content",
        description: "Comment content to add",
        required: true,
      },
      {
        name: "discussionId",
        description: "Optional discussion ID for replying to existing comments",
        required: false,
      },
    ],
  },
  {
    name: "Page Creator",
    description:
      "Creates new pages in Notion with specified content and properties",
    arguments: [
      {
        name: "parent",
        description:
          "Parent database or page ID where the new page will be created",
        required: true,
      },
      {
        name: "properties",
        description: "Page properties in Notion API format",
        required: true,
      },
      {
        name: "children",
        description: "Optional page content blocks",
        required: false,
      },
    ],
  },
  {
    name: "Database Explorer",
    description: "Lists and explores available Notion databases",
    arguments: [
      {
        name: "maxResults",
        description: "Maximum number of databases to list",
        required: false,
      },
    ],
  },
];

// Define the prompt messages separately
const PromptMessages: Record<string, PromptMessage[]> = {
  "Notion Page Manager": [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I am a Notion page management assistant. I can help you search, create, and update pages in your Notion workspace.",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I will:\n1. Search for pages using text queries\n2. Create new pages with specified properties\n3. Update existing pages\n4. Help organize your Notion content effectively",
      },
    },
  ],
  "Database Content Organizer": [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I am a Notion database management assistant. I help you organize and manage content within your Notion databases.",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I will:\n1. List items from your databases\n2. Help organize database content\n3. Retrieve specific database entries\n4. Provide database content summaries",
      },
    },
  ],
  "Page Commenter": [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I am a Notion page commenting assistant. I help you manage comments and discussions on your Notion pages.",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I will:\n1. Create new comments on pages\n2. Reply to existing discussions\n3. Retrieve page comments\n4. Help maintain productive discussions",
      },
    },
  ],
  "Page Creator": [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I am a Notion page creation assistant. I help you create new pages with specific properties and content.",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I will:\n1. Create pages in databases or as subpages\n2. Set up page properties correctly\n3. Add content blocks as needed\n4. Ensure proper page organization",
      },
    },
  ],
  "Database Explorer": [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I am a Notion database exploration assistant. I help you discover and navigate your available Notion databases.",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I will:\n1. List accessible databases\n2. Show database properties\n3. Help you find relevant databases\n4. Provide database overviews",
      },
    },
  ],
};

export async function handleListPrompts(
  request: ListPromptsRequest
): Promise<ListPromptsResult> {
  try {
    return {
      prompts: Prompts,
    };
  } catch (error: any) {
    console.error("Failed to fetch prompts:", error);
    throw new Error("Failed to fetch prompts");
  }
}

export async function handleGetPrompt(
  request: GetPromptRequest
): Promise<GetPromptResult> {
  try {
    const foundPrompt = Prompts.find((p) => p.name === request.params.name);
    if (!foundPrompt) {
      throw new Error(`Prompt not found: ${request.params.name}`);
    }

    const messages = PromptMessages[foundPrompt.name];
    if (!messages) {
      throw new Error(`Messages not found for prompt: ${request.params.name}`);
    }

    return {
      name: foundPrompt.name,
      description: foundPrompt.description,
      arguments: foundPrompt.arguments || [],
      messages: messages,
    };
  } catch (error: any) {
    console.error("Failed to fetch prompt:", error);
    throw new Error(
      `Failed to fetch prompt: ${error.message || "Unknown error"}`
    );
  }
}
