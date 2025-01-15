const mockServer = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onRequest: jest.fn(),
  registerHandler: jest.fn(),
  registerHandlers: jest.fn(),
}));

const mockStdioServerTransport = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onRequest: jest.fn(),
}));

export const server = {
  Server: mockServer,
  StdioServerTransport: mockStdioServerTransport,
};

export const types = {
  ListToolsRequest: jest.fn(),
  CallToolRequest: jest.fn(),
};
