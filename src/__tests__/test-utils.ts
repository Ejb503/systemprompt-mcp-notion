import { jest } from "@jest/globals";

/**
 * Type for mock response options
 */
export interface MockResponseOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

/**
 * Creates a mock response object for testing
 */
export function createMockResponse(
  data: any,
  options: MockResponseOptions = {}
): Response {
  const { ok = true, status = 200, statusText = "OK", headers = {} } = options;

  return {
    ok,
    status,
    statusText,
    headers: new Headers(headers),
    json: () => Promise.resolve(data),
    text: () =>
      Promise.resolve(typeof data === "string" ? data : JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
  } as Response;
}

/**
 * Test fixture generator for common test data
 */
export class TestFixtures {
  static createNote(overrides = {}) {
    return {
      id: "test-note-1",
      title: "Test Note",
      content: "Test content",
      created: new Date().toISOString(),
      ...overrides,
    };
  }

  static createNoteList(count: number) {
    return Array.from({ length: count }, (_, i) =>
      this.createNote({ id: `test-note-${i + 1}` })
    );
  }
}

/**
 * Helper to wait for promises to resolve
 */
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

/**
 * Type guard for error objects
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Creates a partial mock object with type safety
 */
export function createPartialMock<T extends object>(
  overrides: Partial<T> = {}
): jest.Mocked<T> {
  return overrides as jest.Mocked<T>;
}
