import { IHttpExecutor } from "../../domain/services/IHttpExecutor.js";
import { HttpRequest } from "../../domain/entities/HttpRequest.js";
import { HttpResponse } from "../../domain/entities/HttpResponse.js";
import { ILogger } from "../interfaces/ILogger.js";
import { CurlParser } from "../../infrastructure/http/CurlParser.js";

export interface ExecuteHttpRequestInput {
  curlCommand?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface ExecuteHttpRequestOutput {
  success: boolean;
  duration: number;
  request: any;
  response: any;
}

export class ExecuteHttpRequest {
  constructor(
    private readonly httpExecutor: IHttpExecutor,
    private readonly curlParser: CurlParser,
    private readonly logger: ILogger
  ) {}

  async execute(
    input: ExecuteHttpRequestInput
  ): Promise<ExecuteHttpRequestOutput> {
    const startTime = Date.now();

    // Parse request
    let httpRequest: HttpRequest;
    if (input.curlCommand) {
      httpRequest = this.curlParser.parse(input.curlCommand);
    } else if (input.url) {
      httpRequest = new HttpRequest(
        input.url,
        input.method || "GET",
        input.headers || {},
        input.body
      );
    } else {
      throw new Error("Must provide either 'curlCommand' or 'url'");
    }

    try {
      this.logger.info(
        `Executing HTTP request: ${httpRequest.method} ${httpRequest.url}`
      );

      // Execute HTTP request
      const httpResponse = await this.httpExecutor.execute(httpRequest);

      const duration = Date.now() - startTime;

      this.logger.info(
        `✓ HTTP request completed in ${duration}ms with status ${httpResponse.status}`
      );

      return {
        success: true,
        duration,
        request: httpRequest.toJSON(),
        response: httpResponse.toJSON(),
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      this.logger.error(`HTTP request failed in ${duration}ms: ${error.message}`);

      throw error;
    }
  }
}
