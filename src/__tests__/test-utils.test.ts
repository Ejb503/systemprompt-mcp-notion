import { jest, describe, it, expect } from "@jest/globals";
import {
  createMockResponse,
  TestFixtures,
  flushPromises,
  isError,
  createPartialMock,
} from "./test-utils";

describe("Test Utilities", () => {
  describe("createMockResponse", () => {
    it("should create a successful response with defaults", async () => {
      const data = { test: "data" };
      const response = createMockResponse(data);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe("OK");
      expect(response.headers).toBeInstanceOf(Headers);

      // Test response methods
      expect(await response.json()).toEqual(data);
      expect(await response.text()).toBe(JSON.stringify(data));
      expect(await response.blob()).toBeInstanceOf(Blob);
    });

    it("should create a response with custom options", async () => {
      const data = "test-data";
      const options = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: { "Content-Type": "text/plain" },
      };
      const response = createMockResponse(data, options);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(response.statusText).toBe("Bad Request");
      expect(response.headers.get("Content-Type")).toBe("text/plain");

      // Test string data handling
      expect(await response.text()).toBe(data);
    });
  });

  describe("TestFixtures", () => {
    it("should create a note with default values", () => {
      const note = TestFixtures.createNote();

      expect(note).toHaveProperty("id", "test-note-1");
      expect(note).toHaveProperty("title", "Test Note");
      expect(note).toHaveProperty("content", "Test content");
      expect(note.created).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("should create a note with custom overrides", () => {
      const overrides = {
        id: "custom-id",
        title: "Custom Title",
        extraField: "extra",
      };
      const note = TestFixtures.createNote(overrides);

      expect(note).toMatchObject(overrides);
      expect(note).toHaveProperty("content", "Test content");
      expect(note.created).toBeDefined();
    });

    it("should create a list of notes with specified count", () => {
      const count = 3;
      const notes = TestFixtures.createNoteList(count);

      expect(notes).toHaveLength(count);
      notes.forEach((note, index) => {
        expect(note).toHaveProperty("id", `test-note-${index + 1}`);
        expect(note).toHaveProperty("title", "Test Note");
        expect(note).toHaveProperty("content", "Test content");
        expect(note.created).toBeDefined();
      });
    });
  });

  describe("flushPromises", () => {
    it("should wait for promises to resolve", async () => {
      let resolved = false;
      Promise.resolve().then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      await flushPromises();
      expect(resolved).toBe(true);
    });

    it("should handle multiple promises", async () => {
      const results: number[] = [];
      Promise.resolve().then(() => results.push(1));
      Promise.resolve().then(() => results.push(2));
      Promise.resolve().then(() => results.push(3));

      expect(results).toHaveLength(0);
      await flushPromises();
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe("isError", () => {
    it("should identify Error objects", () => {
      expect(isError(new Error("test"))).toBe(true);
      expect(isError(new TypeError("test"))).toBe(true);
    });

    it("should reject non-Error objects", () => {
      expect(isError({})).toBe(false);
      expect(isError("error")).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError(42)).toBe(false);
    });
  });

  describe("createPartialMock", () => {
    interface TestService {
      method1(): string;
      method2(arg: number): Promise<number>;
    }

    it("should create a typed mock object", () => {
      const mockMethod = jest.fn<() => string>().mockReturnValue("test");
      const mock = createPartialMock<TestService>({
        method1: mockMethod,
      });

      expect(mock.method1()).toBe("test");
      expect(mock.method1).toHaveBeenCalled();
    });

    it("should handle empty overrides", () => {
      const mock = createPartialMock<TestService>();
      expect(mock).toEqual({});
    });

    it("should preserve mock functionality", async () => {
      const mockMethod = jest
        .fn<(arg: number) => Promise<number>>()
        .mockResolvedValue(42);
      const mock = createPartialMock<TestService>({
        method2: mockMethod,
      });

      const result = await mock.method2(1);
      expect(result).toBe(42);
      expect(mock.method2).toHaveBeenCalledWith(1);
    });
  });
});
