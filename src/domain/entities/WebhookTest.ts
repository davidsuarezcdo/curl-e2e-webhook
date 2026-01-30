export type TestStatus = "pending" | "completed" | "timeout";

export class WebhookTest {
  constructor(
    public readonly testId: string,
    public readonly status: TestStatus,
    public readonly requestType: string,
    public readonly createdAt: Date,
    public readonly timeoutAt: Date,
    public readonly completedAt?: Date,
    public readonly duration?: number,
    public readonly httpRequest?: string,
    public readonly httpResponse?: string,
    public readonly webhookPayload?: string,
    public readonly error?: string
  ) {}

  isCompleted(): boolean {
    return this.status === "completed";
  }

  isTimedOut(): boolean {
    return this.status === "timeout";
  }

  isPending(): boolean {
    return this.status === "pending";
  }

  toJSON() {
    return {
      testId: this.testId,
      status: this.status,
      requestType: this.requestType,
      createdAt: this.createdAt.toISOString(),
      timeoutAt: this.timeoutAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      duration: this.duration,
      httpRequest: this.httpRequest,
      httpResponse: this.httpResponse,
      webhookPayload: this.webhookPayload,
      error: this.error,
    };
  }
}
