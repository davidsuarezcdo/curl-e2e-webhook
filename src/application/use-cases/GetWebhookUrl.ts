import { v4 as uuidv4 } from "uuid";
import { Config } from "../../infrastructure/config/Config.js";

export interface GetWebhookUrlInput {
  testId?: string;
}

export interface GetWebhookUrlOutput {
  testId: string;
  webhookUrl: string;
  instructions: string[];
}

export class GetWebhookUrl {
  constructor(private readonly config: Config) {}

  execute(input: GetWebhookUrlInput): GetWebhookUrlOutput {
    const testId = input.testId || uuidv4();
    const webhookUrl = this.config.getWebhookUrl(testId);

    return {
      testId,
      webhookUrl,
      instructions: [
        "Use this webhook URL as callback in your HTTP request",
        `Then call waitForWebhook with testId: ${testId}`,
      ],
    };
  }
}
