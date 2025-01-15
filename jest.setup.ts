import { jest } from "@jest/globals";
import {
  createMockResponse,
  MockResponseOptions,
} from "./src/__tests__/test-utils";

// Define global types for our custom matchers and utilities
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidUUID(): R;
    }
  }

  function mockFetchResponse(data: any, options?: MockResponseOptions): void;
  function mockFetchError(message: string): void;
}

// Mock fetch globally with a more flexible implementation
const mockFetch = jest.fn(
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Default success response
    return Promise.resolve(createMockResponse({}));
  }
);

// Type assertion for global fetch mock
global.fetch = mockFetch;

// Utility to set up fetch mock responses
global.mockFetchResponse = (data: any, options: MockResponseOptions = {}) => {
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve(createMockResponse(data, options))
  );
};

// Utility to set up fetch mock error
global.mockFetchError = (message: string) => {
  mockFetch.mockImplementationOnce(() => Promise.reject(new Error(message)));
};

// Add custom matchers
expect.extend({
  toBeValidDate(received: string) {
    const date = new Date(received);
    const pass = date instanceof Date && !isNaN(date.getTime());
    return {
      pass,
      message: () =>
        `expected ${received} to ${pass ? "not " : ""}be a valid date string`,
    };
  },
  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        `expected ${received} to ${pass ? "not " : ""}be a valid UUID`,
    };
  },
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
