import type { NotionPage } from "../../types/notion";

export class NotionService {
  private static instance: NotionService;

  private constructor() {}

  public static initialize(): void {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
  }

  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
    return NotionService.instance;
  }

  async createPage(): Promise<NotionPage> {
    return Promise.resolve({} as NotionPage);
  }

  async updatePage(): Promise<NotionPage> {
    return Promise.resolve({} as NotionPage);
  }
}

export default NotionService;
