import { jest } from "@jest/globals";
import mockProcess from "../node_process";

// Mock server type
export type MockServer = {
  setRequestHandler: jest.Mock;
  connect: jest.Mock;
  onRequest: jest.Mock;
};

// Mock implementations
const mockServer = jest.fn().mockImplementation(() => ({
  setRequestHandler: jest.fn(),
  connect: jest.fn(),
  onRequest: jest.fn(),
}));

const mockStdioServerTransport = jest.fn().mockImplementation(() => ({
  onRequest: jest.fn(),
  onNotification: jest.fn(),
}));

const mockTypes = {
  ListToolsRequest: jest.fn(),
  CallToolRequest: jest.fn(),
  ToolCallContent: jest.fn().mockImplementation((args: unknown) => ({
    type: "sampling_request",
    sampling_request: {
      method: "createPage",
      params: {
        parent: {
          type: "workspace",
          workspace: true,
        },
        properties: {
          title: [
            {
              text: {
                content: "Test Page",
              },
            },
          ],
        },
        children: [],
      },
    },
  })),
};

// Export everything needed by the tests
export const Server = mockServer;
export const StdioServerTransport = mockStdioServerTransport;
export const types = mockTypes;
export { mockProcess as process };

// Default export for ESM compatibility
export default {
  Server: mockServer,
  StdioServerTransport: mockStdioServerTransport,
  types: mockTypes,
  process: mockProcess,
};

// Mark as ESM module
Object.defineProperty(exports, "__esModule", { value: true });
