import { ITestLogger } from "../../application/interfaces/ITestLogger.js";
import { ITestLogRepository } from "../../domain/repositories/ITestLogRepository.js";
import { LogEventType, LogLevel } from "../../domain/entities/TestLog.js";

export class TestLoggerService implements ITestLogger {
  constructor(private readonly logRepository: ITestLogRepository) {}

  log(
    testId: string,
    eventType: LogEventType,
    message: string,
    level: LogLevel = "info",
    metadata?: Record<string, unknown>
  ): void {
    try {
      this.logRepository.createLog(testId, eventType, message, level, metadata);
    } catch (error) {
      // Don't let logging failures break the main flow
      console.error(`[TestLogger] Failed to log event: ${error}`);
    }
  }

  testCreated(testId: string, requestType: string): void {
    this.log(testId, "test_created", `Test created: ${requestType}`, "info", {
      requestType,
    });
  }

  httpRequestSent(testId: string, request: Record<string, unknown>): void {
    this.log(
      testId,
      "http_request_sent",
      `HTTP request sent: ${request.method} ${request.url}`,
      "info",
      { request }
    );
  }

  httpResponseReceived(testId: string, response: Record<string, unknown>): void {
    const status = response.status as number;
    const level: LogLevel = status >= 400 ? "warn" : "info";
    this.log(
      testId,
      "http_response_received",
      `HTTP response received: ${status} ${response.statusText}`,
      level,
      { response }
    );
  }

  webhookReceived(testId: string, payload: unknown): void {
    this.log(testId, "webhook_received", "Webhook received", "info", {
      payload,
    });
  }

  testCompleted(testId: string, duration: number): void {
    this.log(
      testId,
      "test_completed",
      `Test completed in ${duration}ms`,
      "info",
      { duration }
    );
  }

  testTimeout(testId: string, error: string): void {
    this.log(testId, "test_timeout", `Test timed out: ${error}`, "warn", {
      error,
    });
  }

  testError(testId: string, error: string): void {
    this.log(testId, "test_error", `Test error: ${error}`, "error", { error });
  }
}
