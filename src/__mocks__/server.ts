import { jest } from "@jest/globals";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";

export const mockServer: Partial<Server> = {};

export const getMockServer = () => mockServer;
