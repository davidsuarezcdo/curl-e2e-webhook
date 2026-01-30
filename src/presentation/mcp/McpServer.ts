import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ILogger } from "../../application/interfaces/ILogger.js";
import { ToolHandlers } from "./tools/ToolHandlers.js";
import { TOOLS } from "./tools/ToolDefinitions.js";
import { McpAdapter } from "./adapters/McpAdapter.js";
import { Config } from "../../infrastructure/config/Config.js";

export class McpServer {
  private server: Server;

  constructor(
    private readonly toolHandlers: ToolHandlers,
    private readonly config: Config,
    private readonly logger: ILogger
  ) {
    this.server = new Server(
      {
        name: "curl-webhook-tester",
        version: "4.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "executeCurlAndWaitWebhook":
            return await this.toolHandlers.handleExecuteCurlAndWaitWebhook(args);

          case "executeHttpRequest":
            return await this.toolHandlers.handleExecuteHttpRequest(args);

          case "getWebhookUrl":
            return await this.toolHandlers.handleGetWebhookUrl(args);

          case "waitForWebhook":
            return await this.toolHandlers.handleWaitForWebhook(args);

          case "getTestResults":
            return await this.toolHandlers.handleGetTestResults(args);

          case "clearTestResults":
            return await this.toolHandlers.handleClearTestResults();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return McpAdapter.toMcpErrorResponse(error);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info("Server started successfully");
    this.logger.info(
      `Webhook endpoint: ${this.config.webhookBaseUrl}/webhook/:testId`
    );
    this.logger.info(`Set WEBHOOK_BASE_URL env var if using ngrok/tunnel`);
  }
}
