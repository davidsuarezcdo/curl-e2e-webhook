export interface TestEntry {
  testId: string;
  status: string;
  requestType: string;
  duration?: number;
  httpRequest?: Record<string, unknown>;
  httpResponse?: Record<string, unknown>;
  webhookPayload?: unknown;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GetTestsResponse {
  tests: TestEntry[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
