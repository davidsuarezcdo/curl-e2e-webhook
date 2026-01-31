export type LogEventType =
  | "test_created"
  | "http_request_sent"
  | "http_response_received"
  | "webhook_received"
  | "test_completed"
  | "test_timeout"
  | "test_error";

export type LogLevel = "debug" | "info" | "warn" | "error";

export class TestLog {
  constructor(
    public readonly id: number | null,
    public readonly testId: string,
    public readonly eventType: LogEventType,
    public readonly level: LogLevel,
    public readonly message: string,
    public readonly timestamp: Date,
    public readonly metadata?: Record<string, unknown>
  ) {}

  toJSON() {
    return {
      id: this.id,
      testId: this.testId,
      eventType: this.eventType,
      level: this.level,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
    };
  }
}
