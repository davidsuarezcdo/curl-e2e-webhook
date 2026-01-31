#!/usr/bin/env node

// Infrastructure
import { Config } from "./infrastructure/config/Config.js";
import { ConsoleLogger } from "./infrastructure/logger/ConsoleLogger.js";
import { getTestRepository } from "./infrastructure/database/SqliteTestRepository.js";
import { getTestLogRepository } from "./infrastructure/database/SqliteTestLogRepository.js";
import { TestLoggerService } from "./infrastructure/logger/TestLoggerService.js";

// Presentation
import { ExpressServer } from "./presentation/http/ExpressServer.js";

async function main() {
  // 1. Create infrastructure components
  const config = new Config();
  const logger = new ConsoleLogger();
  const testRepository = getTestRepository(config.dbPath);
  const testLogRepository = getTestLogRepository(config.dbPath);
  const testLogger = new TestLoggerService(testLogRepository);

  // 2. Create and start HTTP server (webhook receiver)
  const expressServer = new ExpressServer(
    testRepository,
    config,
    logger,
    testLogger,
    testLogRepository,
  );
  await expressServer.start();

  logger.info(
    `Webhook server running on port ${config.webhookPort}. Press Ctrl+C to stop.`,
  );
}

main().catch((error) => {
  console.error("[HTTP] Fatal error:", error);
  process.exit(1);
});
