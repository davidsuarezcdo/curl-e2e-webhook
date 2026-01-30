export class Config {
  readonly webhookPort: number;
  readonly webhookBaseUrl: string;
  readonly dbPath: string;

  constructor() {
    this.webhookPort = process.env.WEBHOOK_PORT
      ? parseInt(process.env.WEBHOOK_PORT)
      : 3456;
    this.webhookBaseUrl =
      process.env.WEBHOOK_BASE_URL || `http://localhost:${this.webhookPort}`;
    this.dbPath = process.env.DB_PATH || "./webhook-tests.db";
  }

  getWebhookUrl(testId: string): string {
    return `${this.webhookBaseUrl}/webhook/${testId}`;
  }
}
