import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { serverConfig, serverCapabilities } from "./config/server-config.js";

export const server = new Server(serverConfig, serverCapabilities);
