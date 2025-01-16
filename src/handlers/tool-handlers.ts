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
              text: JSON.stringify(result.pages, null, 2),
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
              text: JSON.stringify(response.results, null, 2),
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
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://pages",
                text: JSON.stringify(
                  result.pages.slice(0, maxResults),
                  null,
                  2
                ),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_get_notion_page": {
        const notion = NotionService.getInstance();
        const page = await notion.getPage(String(args.pageId));
        return {
          content: [
            {
              type: "resource",
              resource: {
                uri: "notion://pages",
                text: JSON.stringify([page], null, 2),
                mimeType: "application/json",
              },
            },
          ],
        };
      }

      case "systemprompt_delete_notion_page": {
        const notion = NotionService.getInstance();
        await notion.deletePage(String(args.pageId));
        return {
          type: "text",
          content: [
            {
              type: "text",
              text: "Page deleted successfully",
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
          currentPage: JSON.stringify(pageBlocks, null, 2),
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
