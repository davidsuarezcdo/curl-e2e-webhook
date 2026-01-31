import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { IHttpExecutor } from "../../domain/services/IHttpExecutor.js";
import { HttpRequest } from "../../domain/entities/HttpRequest.js";
import { ILogger } from "../interfaces/ILogger.js";
import { ITestLogger } from "../interfaces/ITestLogger.js";
import { Config } from "../../infrastructure/config/Config.js";
import { CurlParser } from "../../infrastructure/http/CurlParser.js";
import { ExecuteCurlRequest } from "../dto/ExecuteCurlRequest.js";
import { ExecuteCurlResponse } from "../dto/ExecuteCurlResponse.js";

export class ExecuteCurlAndWaitWebhook {
  constructor(
    private readonly testRepository: ITestRepository,
    private readonly httpExecutor: IHttpExecutor,
    private readonly curlParser: CurlParser,
    private readonly config: Config,
    private readonly logger: ILogger,
    private readonly testLogger?: ITestLogger,
  ) {}

  async execute(request: ExecuteCurlRequest): Promise<ExecuteCurlResponse> {
    if (!request.testId) {
      throw new Error(
        "testId is required. Please provide a descriptive test ID like 'test-payment-001'",
      );
    }

    const testId = request.testId;
    const webhookUrl = this.config.getWebhookUrl(testId);
    const placeholder = request.webhookUrlPlaceholder || "{{WEBHOOK_URL}}";

    this.logger.info(`Starting HTTP request test ${testId}`);

    // Parse request
    let httpRequest: HttpRequest;
    if (request.curlCommand) {
      httpRequest = this.curlParser.parse(request.curlCommand);
    } else if (request.url) {
      httpRequest = new HttpRequest(
        request.url,
        request.method || "GET",
        request.headers || {},
        request.body,
      );
    } else {
      throw new Error("Must provide either 'curlCommand' or 'url'");
    }

    // Replace webhook URL placeholder in the request
    httpRequest = httpRequest.replacePlaceholder(placeholder, webhookUrl);

    try {
      this.logger.info(
        `Executing HTTP request: ${httpRequest.method} ${httpRequest.url}`,
      );
      this.logger.info(`Webhook URL: ${webhookUrl}`);

      // Log HTTP request sent
      this.testLogger?.httpRequestSent(testId, httpRequest.toJSON());

      // Execute HTTP request
      const httpResponse = await this.httpExecutor.execute(httpRequest);

      this.logger.info(
        `HTTP request completed with status ${httpResponse.status}`,
      );

      // Log HTTP response received
      this.testLogger?.httpResponseReceived(testId, httpResponse.toJSON());

      // Create test in database
      this.testRepository.createTest(
        testId,
        `${httpRequest.method} ${httpRequest.url}`,
        request.timeoutSeconds || 300,
        httpRequest.toJSON(),
        httpResponse.toJSON(),
      );

      // Log test created
      this.testLogger?.testCreated(
        testId,
        `${httpRequest.method} ${httpRequest.url}`,
      );

      this.logger.info(`Waiting for webhook...`);

      // BLOCKING WAIT for webhook (with database polling)
      const completedTest = await this.testRepository.waitForCompletion(
        testId,
        request.timeoutSeconds || 300,
      );

      const webhookResponse = completedTest.webhookPayload
        ? JSON.parse(completedTest.webhookPayload)
        : null;

      this.logger.info(
        `✓ Test ${testId} completed in ${completedTest.duration}ms`,
      );

      // Log test completed
      this.testLogger?.testCompleted(testId, completedTest.duration || 0);

      return {
        success: true,
        testId,
        duration: completedTest.duration,
        httpRequest: httpRequest.toJSON(),
        httpResponse: httpResponse.toJSON(),
        webhookResponse,
        webhookUrl,
      };
    } catch (error: any) {
      this.logger.error(`Test ${testId} failed: ${error.message}`);
      // Log test error
      this.testLogger?.testError(testId, error.message);
      throw error;
    }
  }
}
