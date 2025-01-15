import { describe, it, expect } from "@jest/globals";
import { serverConfig, serverCapabilities } from "../server-config.js";

describe("Server Configuration", () => {
  describe("serverConfig", () => {
    it("should have correct basic properties", () => {
      expect(serverConfig.name).toBe("systemprompt-mcp-notion");
      expect(serverConfig.version).toBe("1.0.0");
    });

    it("should have correct metadata", () => {
      expect(serverConfig.metadata).toBeDefined();
      expect(serverConfig.metadata.name).toBe(
        "System Prompt Notion Integration Server"
      );
      expect(serverConfig.metadata.icon).toBe("mdi:notion");
      expect(serverConfig.metadata.color).toBe("black");
      expect(typeof serverConfig.metadata.serverStartTime).toBe("number");
      expect(serverConfig.metadata.environment).toBe(process.env.NODE_ENV);
    });

    it("should have correct custom data", () => {
      expect(serverConfig.metadata.customData).toBeDefined();
      expect(serverConfig.metadata.customData.serverFeatures).toEqual([
        "notion-pages",
        "notion-databases",
        "notion-comments",
      ]);
      expect(serverConfig.metadata.customData.supportedAPIs).toEqual([
        "notion",
      ]);
      expect(serverConfig.metadata.customData.authProvider).toBe("notion-api");
      expect(serverConfig.metadata.customData.requiredCapabilities).toEqual([
        "read_content",
        "update_content",
        "insert_content",
        "comment_access",
      ]);
    });
  });

  describe("serverCapabilities", () => {
    it("should have correct capabilities structure", () => {
      expect(serverCapabilities.capabilities).toEqual({
        resources: {
          listChanged: true,
        },
        tools: {},
        prompts: {
          listChanged: true,
        },
        sampling: {},
      });
    });
  });
});
