import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { ILogger } from "../interfaces/ILogger.js";

export interface WaitForWebhookInput {
  testId: string;
  timeoutSeconds?: number;
}

export interface WaitForWebhookOutput {
  success: boolean;
  testId: string;
  duration?: number;
  webhookResponse?: any;
}

export class WaitForWebhook {
  constructor(
    private readonly testRepository: ITestRepository,
    private readonly logger: ILogger
  ) {}

  async execute(input: WaitForWebhookInput): Promise<WaitForWebhookOutput> {
    const { testId } = input;

    this.logger.info(`Waiting for webhook for test: ${testId}`);

    // Check if test exists, if not create it
    let test = this.testRepository.getTest(testId);
    if (!test) {
      this.testRepository.createTest(
        testId,
        "manual",
        input.timeoutSeconds || 300
      );
    }

    try {
      const completedTest = await this.testRepository.waitForCompletion(
        testId,
        input.timeoutSeconds || 300
      );

      const webhookResponse = completedTest.webhookPayload
        ? JSON.parse(completedTest.webhookPayload)
        : null;

      this.logger.info(
        `✓ Webhook received for test ${testId} in ${completedTest.duration}ms`
      );

      return {
        success: true,
        testId,
        duration: completedTest.duration,
        webhookResponse,
      };
    } catch (error: any) {
      this.logger.error(`Webhook wait failed for test ${testId}: ${error.message}`);
      throw error;
    }
  }
}
