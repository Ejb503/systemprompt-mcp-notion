import {
  ReadResourceRequest,
  ListResourcesResult,
  ReadResourceResult,
  ListResourcesRequest,
} from "@modelcontextprotocol/sdk/types.js";

const AGENT_RESOURCE = {
  name: "Systemprompt Notion Agent",
  description:
    "An expert agent for managing and organizing content in Notion workspaces",
  instruction: `You are a specialized agent with deep expertise in Notion workspace management and content organization. Your capabilities include:

1. Page Management:
- Search and navigate Notion pages
- Create new pages with structured content
- Update existing pages
- Organize content hierarchically
- Manage page properties effectively

2. Database Operations:
- List and explore available databases
- Query database contents
- Organize database items
- Track and update database entries
- Create structured database views

3. Content Organization:
- Structure information effectively
- Maintain consistent page layouts
- Create linked references between pages
- Organize content in databases
- Implement effective tagging systems

4. Collaboration Features:
- Add and manage comments on pages
- Participate in page discussions
- Track page changes and updates
- Maintain clear communication threads
- Support team collaboration

You have access to specialized Notion tools for these operations. Always select the most appropriate tool for the task and execute operations efficiently while maintaining high quality and reliability. When working with Notion content, ensure proper organization, clear structure, and effective use of Notion's features for optimal workspace management.`,
  voice: "Kore",
  config: {
    model: "models/gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: "audio",
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore",
          },
        },
      },
    },
  },
};

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  return {
    resources: [
      {
        uri: "resource:///block/default",
        name: AGENT_RESOURCE.name,
        description: AGENT_RESOURCE.description,
        mimeType: "text/plain",
      },
    ],
    _meta: {},
  };
}

export async function handleResourceCall(
  request: ReadResourceRequest
): Promise<ReadResourceResult> {
  const { uri } = request.params;
  const match = uri.match(/^resource:\/\/\/block\/(.+)$/);

  if (!match) {
    throw new Error(
      "Invalid resource URI format - expected resource:///block/{id}"
    );
  }

  const blockId = match[1];
  if (blockId !== "default") {
    throw new Error("Resource not found");
  }

  return {
    contents: [
      {
        uri: uri,
        mimeType: "text/plain",
        text: JSON.stringify({
          name: AGENT_RESOURCE.name,
          description: AGENT_RESOURCE.description,
          instruction: AGENT_RESOURCE.instruction,
          voice: AGENT_RESOURCE.voice,
          config: AGENT_RESOURCE.config,
        }),
      },
    ],
    _meta: { tag: ["agent"] },
  };
}
