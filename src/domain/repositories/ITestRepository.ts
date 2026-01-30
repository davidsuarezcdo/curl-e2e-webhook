import { WebhookTest } from "../entities/WebhookTest.js";

export interface ITestRepository {
  createTest(
    testId: string,
    requestType: string,
    timeoutSeconds: number,
    httpRequest?: any,
    httpResponse?: any
  ): void;

  getTest(testId: string): WebhookTest | null;

  completeTest(testId: string, webhookPayload: any): boolean;

  timeoutTest(testId: string, error: string): boolean;

  waitForCompletion(
    testId: string,
    timeoutSeconds: number
  ): Promise<WebhookTest>;

  getAllTests(limit: number): WebhookTest[];

  clearAllTests(): number;

  cleanupOldTests(hoursOld: number): number;

  cleanupTimedOutTests(): number;

  startCleanupTask(): void;

  stopCleanupTask(): void;

  close(): void;
}
