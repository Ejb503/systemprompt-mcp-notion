import type { JSONSchema7 } from "json-schema";

export interface SystempromptBlockRequest {
  content: string;
  prefix: string;
  metadata: {
    title: string;
    description: string | null;
  };
}

export interface SystempromptBlockResponse {
  id: string;
  content: string;
  prefix: string;
  metadata: {
    title: string;
    description: string | null;
    created: string;
    updated: string;
    version: number;
    status: string;
    author: string;
    log_message: string;
  };
  _link?: string;
}

export interface SystempromptPromptRequest {
  metadata: {
    title: string;
    description: string;
  };
  instruction: {
    static: string;
  };
  input: {
    type: string[];
  };
  output: {
    type: string[];
  };
}

export interface SystempromptPromptAPIRequest {
  metadata: {
    title: string;
    description: string;
  };
  instruction: {
    static: string;
    dynamic: string;
    state: string;
  };
  input: {
    type: string[];
    schema: JSONSchema7;
    name: string;
    description: string;
  };
  output: {
    type: string[];
    schema: JSONSchema7;
    name: string;
    description: string;
  };
}

export interface SystempromptPromptResponse {
  id: string;
  metadata: {
    title: string;
    description: string;
    created: string;
    updated: string;
    version: number;
    status: string;
    author: string;
    log_message: string;
  };
  instruction: {
    static: string;
    dynamic: string;
    state: string;
  };
  input: {
    name: string;
    description: string;
    type: string[];
    schema: JSONSchema7;
  };
  output: {
    name: string;
    description: string;
    type: string[];
    schema: JSONSchema7;
  };
  _link: string;
}
