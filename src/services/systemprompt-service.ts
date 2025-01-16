import type {
  SystempromptBlockResponse,
  SystempromptPromptResponse,
} from "../types/systemprompt.js";

export class SystemPromptService {
  private static instance: SystemPromptService | null = null;
  private apiKey: string;
  private baseUrl: string;

  private constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://api.systemprompt.io/v1";
  }

  public static initialize(apiKey: string, baseUrl?: string): void {
    SystemPromptService.instance = new SystemPromptService(apiKey, baseUrl);
  }

  public static getInstance(): SystemPromptService {
    if (!SystemPromptService.instance) {
      throw new Error(
        "SystemPromptService must be initialized with an API key first"
      );
    }
    return SystemPromptService.instance;
  }

  public static cleanup(): void {
    SystemPromptService.instance = null;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      let responseData;
      if (response.status !== 204) {
        try {
          responseData = await response.json();
        } catch (e) {
          throw new Error("Failed to parse API response");
        }
      }

      if (!response.ok) {
        switch (response.status) {
          case 403:
            throw new Error("Invalid API key");
          case 404:
            throw new Error("Resource not found - it may have been deleted");
          case 409:
            throw new Error("Resource conflict - it may have been edited");
          case 400:
            throw new Error(
              responseData.message || "Invalid request parameters"
            );
          default:
            throw new Error(
              responseData?.message ||
                `API request failed with status ${response.status}`
            );
        }
      }

      return responseData as T;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error("API request failed");
    }
  }

  async getAllPrompts(): Promise<SystempromptPromptResponse[]> {
    return this.request<SystempromptPromptResponse[]>("/prompt", "GET");
  }

  async listBlocks(): Promise<SystempromptBlockResponse[]> {
    return this.request<SystempromptBlockResponse[]>("/block", "GET");
  }

  async getBlock(blockId: string): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>(`/block/${blockId}`, "GET");
  }
}
