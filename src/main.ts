#!/usr/bin/env node

// Infrastructure
import { Config } from "./infrastructure/config/Config.js";
import { ConsoleLogger } from "./infrastructure/logger/ConsoleLogger.js";
import { getTestRepository } from "./infrastructure/database/SqliteTestRepository.js";
import { FetchHttpExecutor } from "./infrastructure/http/FetchHttpExecutor.js";
import { CurlParser } from "./infrastructure/http/CurlParser.js";

// Application
import { ExecuteCurlAndWaitWebhook } from "./application/use-cases/ExecuteCurlAndWaitWebhook.js";
import { ExecuteHttpRequest } from "./application/use-cases/ExecuteHttpRequest.js";
import { GetWebhookUrl } from "./application/use-cases/GetWebhookUrl.js";
import { WaitForWebhook } from "./application/use-cases/WaitForWebhook.js";
import { GetTestResults } from "./application/use-cases/GetTestResults.js";
import { ClearTestResults } from "./application/use-cases/ClearTestResults.js";

// Presentation
import { McpServer } from "./presentation/mcp/McpServer.js";
import { ToolHandlers } from "./presentation/mcp/tools/ToolHandlers.js";

async function main() {
  // 1. Create infrastructure components
  const config = new Config();
  const logger = new ConsoleLogger();
  const testRepository = getTestRepository(config.dbPath);
  const httpExecutor = new FetchHttpExecutor();
  const curlParser = new CurlParser();

  // 2. Create use cases (application layer)
  const executeCurlAndWaitWebhook = new ExecuteCurlAndWaitWebhook(
    testRepository,
    httpExecutor,
    curlParser,
    config,
    logger
  );

  const executeHttpRequest = new ExecuteHttpRequest(
    httpExecutor,
    curlParser,
    logger
  );

  const getWebhookUrl = new GetWebhookUrl(config);

  const waitForWebhook = new WaitForWebhook(testRepository, logger);

  const getTestResults = new GetTestResults(testRepository);

  const clearTestResults = new ClearTestResults(testRepository);

  // 3. Create tool handlers
  const toolHandlers = new ToolHandlers(
    executeCurlAndWaitWebhook,
    executeHttpRequest,
    getWebhookUrl,
    waitForWebhook,
    getTestResults,
    clearTestResults
  );

  // 4. Create and start MCP server
  const mcpServer = new McpServer(toolHandlers, config, logger);
  await mcpServer.start();
}

main().catch((error) => {
  console.error("[MCP] Fatal error:", error);
  process.exit(1);
});
