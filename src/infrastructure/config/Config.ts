export class Config {
  readonly webhookPort: number;
  readonly webhookBaseUrl: string;
  readonly dbPath: string;
  readonly corsOrigins: string[];

  constructor() {
    this.webhookPort = process.env.WEBHOOK_PORT
      ? parseInt(process.env.WEBHOOK_PORT)
      : 3456;
    this.webhookBaseUrl =
      process.env.WEBHOOK_BASE_URL || `http://localhost:${this.webhookPort}`;
    this.dbPath = process.env.DB_PATH || "./webhook-tests.db";
    this.corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
      : ["http://localhost:5173", "http://localhost:3000", "*"];
  }

  getWebhookUrl(testId: string): string {
    return `${this.webhookBaseUrl}/webhook/${testId}`;
  }
}
