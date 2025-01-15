import { jest } from "@jest/globals";

const mockProcess = {
  stdout: {
    write: jest.fn(),
    on: jest.fn(),
  },
  stdin: {
    on: jest.fn(),
    resume: jest.fn(),
    setEncoding: jest.fn(),
  },
  env: {},
  exit: jest.fn(),
};

export default mockProcess;
