import { ExecuteCurlAndWaitWebhook } from "../../../application/use-cases/ExecuteCurlAndWaitWebhook.js";
import { ExecuteHttpRequest } from "../../../application/use-cases/ExecuteHttpRequest.js";
import { GetWebhookUrl } from "../../../application/use-cases/GetWebhookUrl.js";
import { WaitForWebhook } from "../../../application/use-cases/WaitForWebhook.js";
import { GetTestResults } from "../../../application/use-cases/GetTestResults.js";
import { ClearTestResults } from "../../../application/use-cases/ClearTestResults.js";
import { McpAdapter } from "../adapters/McpAdapter.js";

export class ToolHandlers {
  constructor(
    private readonly executeCurlAndWaitWebhook: ExecuteCurlAndWaitWebhook,
    private readonly executeHttpRequest: ExecuteHttpRequest,
    private readonly getWebhookUrl: GetWebhookUrl,
    private readonly waitForWebhook: WaitForWebhook,
    private readonly getTestResults: GetTestResults,
    private readonly clearTestResults: ClearTestResults
  ) {}

  async handleExecuteCurlAndWaitWebhook(args: any) {
    const request = McpAdapter.toExecuteCurlRequest(args);
    const result = await this.executeCurlAndWaitWebhook.execute(request);
    return McpAdapter.toMcpResponse(result);
  }

  async handleExecuteHttpRequest(args: any) {
    const result = await this.executeHttpRequest.execute(args);
    return McpAdapter.toMcpResponse(result);
  }

  async handleGetWebhookUrl(args: any) {
    const result = this.getWebhookUrl.execute(args);
    return McpAdapter.toMcpResponse(result);
  }

  async handleWaitForWebhook(args: any) {
    const result = await this.waitForWebhook.execute(args);
    return McpAdapter.toMcpResponse(result);
  }

  async handleGetTestResults(args: any) {
    const result = this.getTestResults.execute(args);
    return McpAdapter.toMcpResponse(result);
  }

  async handleClearTestResults() {
    const result = this.clearTestResults.execute();
    return McpAdapter.toMcpTextResponse(`Cleared ${result.count} test results`);
  }
}
