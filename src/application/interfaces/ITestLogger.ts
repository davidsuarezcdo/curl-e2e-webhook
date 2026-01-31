import { LogEventType, LogLevel } from "../../domain/entities/TestLog.js";

export interface ITestLogger {
  log(
    testId: string,
    eventType: LogEventType,
    message: string,
    level?: LogLevel,
    metadata?: Record<string, unknown>
  ): void;

  testCreated(testId: string, requestType: string): void;
  httpRequestSent(testId: string, request: Record<string, unknown>): void;
  httpResponseReceived(testId: string, response: Record<string, unknown>): void;
  webhookReceived(testId: string, payload: unknown): void;
  testCompleted(testId: string, duration: number): void;
  testTimeout(testId: string, error: string): void;
  testError(testId: string, error: string): void;
}
