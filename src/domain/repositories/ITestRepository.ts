import { WebhookTest, TestStatus } from "../entities/WebhookTest.js";

export interface TestFilter {
  status?: TestStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface PaginatedTests {
  data: WebhookTest[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TestStats {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  timedOutTests: number;
  avgDuration: number;
  recentTests: number;
}

export interface ITestRepository {
  createTest(
    testId: string,
    requestType: string,
    timeoutSeconds: number,
    httpRequest?: any,
    httpResponse?: any,
  ): void;

  getTest(testId: string): WebhookTest | null;

  completeTest(testId: string, webhookPayload: any): boolean;

  timeoutTest(testId: string, error: string): boolean;

  waitForCompletion(
    testId: string,
    timeoutSeconds: number,
  ): Promise<WebhookTest>;

  getAllTests(limit: number): WebhookTest[];

  getTestsPaginated(
    filter: TestFilter,
    pagination: PaginationOptions,
  ): PaginatedTests;

  getTestCount(filter: TestFilter): number;

  getStats(): TestStats;

  clearAllTests(): number;

  cleanupOldTests(hoursOld: number): number;

  cleanupTimedOutTests(): number;

  startCleanupTask(): void;

  stopCleanupTask(): void;

  close(): void;
}
