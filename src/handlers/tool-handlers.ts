import type {
  ListToolsRequest,
  ListToolsResult,
  CallToolRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionService } from "../services/notion-service.js";
import { NOTION_TOOLS, TOOL_ERROR_MESSAGES } from "../constants/tools.js";
import { validateToolRequest } from "../utils/tool-validation.js";
import { ajv, validateWithErrors } from "../utils/validation.js";
import { sendSamplingRequest } from "./sampling.js";
import { handleGetPrompt } from "./prompt-handlers.js";

export async function listTools(
  request: ListToolsRequest
): Promise<ListToolsResult> {
  return {
    tools: NOTION_TOOLS,
  };
}

export async function handleToolCall(
  request: CallToolRequest
): Promise<CallToolResult> {
  try {
    const tool = validateToolRequest(request);
    const args = request.params.arguments || {};
    const validateArgs = ajv.compile(tool.inputSchema);
    validateWithErrors(validateArgs, args);

    switch (request.params.name) {
      case "systemprompt_list_notion_pages": {
        const maxResults =
          typeof args.maxResults === "number" ? args.maxResults : 50;
        const notion = NotionService.getInstance();
        const result = await notion.listPages({ pageSize: maxResults });
        return {
          type: "text",
          content: [
            {
              type: "text",
              text:
                result._message +
                "\n\nPages:\n" +
                result.items
                  .map((page) => `- ${page.content} (ID: ${page.id})`)
                  .join("\n"),
            },
          ],
        };
      }

      case "systemprompt_list_notion_databases": {
        const maxResults =
          typeof args.maxResults === "number" ? args.maxResults : 50;
        const notion = NotionService.getInstance();
        const response = await notion.searchDatabases(maxResults);
        return {
          type: "text",
          content: [
            {
              type: "text",
              text:
                response._message +
                "\n\nDatabases:\n" +
                response.items
                  .map((db) => `- ${db.content} (ID: ${db.id})`)
                  .join("\n"),
            },
          ],
        };
      }

      case "systemprompt_search_notion_pages": {
        const maxResults =
          typeof args.maxResults === "number" ? args.maxResults : 10;
        const notion = NotionService.getInstance();
        const result = await notion.searchPages(String(args.query), maxResults);
        return {
          type: "text",
          content: [
            {
              type: "text",
              text:
                result._message +
                "\n\nMatched Pages:\n" +
                result.items
                  .map((page) => `- ${page.content} (ID: ${page.id})`)
                  .join("\n"),
            },
          ],
        };
      }

      case "systemprompt_get_notion_page": {
        const notion = NotionService.getInstance();
        const page = await notion.getPage(String(args.pageId));
        const blocks = await notion.getPageBlocks(String(args.pageId));

        // Format blocks into readable text
        const contentText = blocks.items
          .map((block) => {
            const type = block.metadata?.type;
            const content = block.content;

            switch (type) {
              case "paragraph":
                return content;
              case "heading_1":
                return `# ${content}`;
              case "heading_2":
                return `## ${content}`;
              case "heading_3":
                return `### ${content}`;
              case "bulleted_list_item":
                return `• ${content}`;
              case "numbered_list_item":
                return `1. ${content}`;
              case "to_do":
                return `☐ ${content}`;
              case "quote":
                return `> ${content}`;
              case "code":
                return `\`\`\`\n${content}\n\`\`\``;
              case "divider":
                return "---";
              default:
                return content || "";
            }
          })
          .filter((text) => text) // Remove empty blocks
          .join("\n\n");

        return {
          type: "text",
          content: [
            {
              type: "text",
              text:
                page._message +
                "\n\nPage Title: " +
                page.content +
                "\nID: " +
                page.id +
                "\nLast Edited: " +
                (page.metadata?.lastEditedTime || "Unknown") +
                "\n\nContent:\n" +
                contentText,
            },
          ],
        };
      }

      case "systemprompt_delete_notion_page": {
        const notion = NotionService.getInstance();
        const result = await notion.deletePage(String(args.pageId));
        return {
          type: "text",
          content: [
            {
              type: "text",
              text: result._message,
            },
          ],
        };
      }

      case "systemprompt_create_notion_page": {
        const samplingMetadata = tool._meta;
        if (!samplingMetadata?.sampling) {
          throw new Error(
            `${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} Tool is missing required sampling configuration`
          );
        }

        const prompt = await handleGetPrompt({
          method: "prompts/get",
          params: {
            name: samplingMetadata.sampling.prompt.name,
            arguments: args as Record<string, string>,
          },
        });

        const result = await sendSamplingRequest({
          method: "sampling/createMessage",
          params: {
            messages: prompt.messages as Array<{
              role: "user" | "assistant";
              content: { type: "text"; text: string };
            }>,
            maxTokens: samplingMetadata.sampling.maxTokens,
            temperature: samplingMetadata.sampling.temperature,
            _meta: samplingMetadata.sampling.prompt._meta,
            arguments: args,
          },
        });
        return {
          content: [
            {
              type: "text",
              text: result.content.text as string,
            },
          ],
        };
      }

      case "systemprompt_update_notion_page": {
        const validateArgs = ajv.compile(tool.inputSchema);
        validateWithErrors(validateArgs, args);

        const samplingMetadata = tool._meta;
        if (!samplingMetadata?.sampling) {
          throw new Error(
            `${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} Tool is missing required sampling configuration`
          );
        }

        const notion = NotionService.getInstance();
        const pageBlocks = await notion.getPageBlocks(String(args.pageId));
        const promptArgs = {
          ...(args as Record<string, string>),
          currentPage: `${pageBlocks._message}\n\nBlocks:\n${pageBlocks.items
            .map(
              (block) =>
                `- ${block.content || "[Empty block]"} (Type: ${
                  block.metadata?.type
                })`
            )
            .join("\n")}`,
        };

        const prompt = await handleGetPrompt({
          method: "prompts/get",
          params: {
            name: samplingMetadata.sampling.prompt.name,
            arguments: promptArgs,
          },
        });

        const result = await sendSamplingRequest({
          method: "sampling/createMessage",
          params: {
            messages: prompt.messages as Array<{
              role: "user" | "assistant";
              content: { type: "text"; text: string };
            }>,
            maxTokens: samplingMetadata.sampling.maxTokens,
            temperature: samplingMetadata.sampling.temperature,
            _meta: samplingMetadata.sampling.prompt._meta,
            arguments: args,
          },
        });
        return {
          content: [
            {
              type: "text",
              text: result.content.text as string,
            },
          ],
        };
      }

      default:
        throw new Error(
          `${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`
        );
    }
  } catch (error) {
    console.error("Tool call failed:", error);
    throw error;
  }
}
