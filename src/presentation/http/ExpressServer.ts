import express, { Express } from "express";
import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { Config } from "../../infrastructure/config/Config.js";
import { ILogger } from "../../application/interfaces/ILogger.js";
import { createWebhookRoutes } from "./routes/webhookRoutes.js";
import { createHealthRoutes } from "./routes/healthRoutes.js";

export class ExpressServer {
  private app: Express;
  private server?: ReturnType<Express["listen"]>;

  constructor(
    private readonly testRepository: ITestRepository,
    private readonly config: Config,
    private readonly logger: ILogger
  ) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Webhook routes
    this.app.use(createWebhookRoutes(this.testRepository, this.logger));

    // Health routes
    this.app.use(createHealthRoutes(this.testRepository, this.config));
  }

  async start(): Promise<boolean> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.webhookPort, () => {
        this.logger.info(
          `Webhook server listening on port ${this.config.webhookPort}`
        );
        this.testRepository.startCleanupTask();
        resolve(true);
      });

      this.server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          this.logger.warn(
            `Port ${this.config.webhookPort} is already in use. Another instance may be running.`
          );
          this.logger.warn(
            `This instance will use the shared database without running cleanup tasks.`
          );
          resolve(false);
        } else {
          this.logger.error(`Failed to start webhook server: ${error.message}`);
          throw error;
        }
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }
}
