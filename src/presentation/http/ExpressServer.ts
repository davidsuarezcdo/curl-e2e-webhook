import express, { Express, Request, Response, NextFunction } from "express";
import { resolve, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { ITestLogRepository } from "../../domain/repositories/ITestLogRepository.js";
import { Config } from "../../infrastructure/config/Config.js";
import { ILogger } from "../../application/interfaces/ILogger.js";
import { ITestLogger } from "../../application/interfaces/ITestLogger.js";
import { createWebhookRoutes } from "./routes/webhookRoutes.js";
import { createHealthRoutes } from "./routes/healthRoutes.js";
import { createApiRoutes } from "./routes/apiRoutes.js";
import { corsMiddleware } from "./middleware/cors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ExpressServer {
  private app: Express;
  private server?: ReturnType<Express["listen"]>;

  constructor(
    private readonly testRepository: ITestRepository,
    private readonly config: Config,
    private readonly logger: ILogger,
    private readonly testLogger?: ITestLogger,
    private readonly testLogRepository?: ITestLogRepository,
  ) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(corsMiddleware(this.config.corsOrigins));
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Webhook routes
    this.app.use(
      createWebhookRoutes(this.testRepository, this.logger, this.testLogger),
    );

    // Health routes
    this.app.use(createHealthRoutes(this.testRepository, this.config));

    // API routes (only if log repository is provided)
    if (this.testLogRepository) {
      this.app.use(
        createApiRoutes(
          this.testRepository,
          this.testLogRepository,
          this.logger,
        ),
      );
    }

    // Serve frontend static files in production
    this.setupStaticFiles();
  }

  private setupStaticFiles(): void {
    // Check for frontend build in multiple possible locations
    const possiblePaths = [
      resolve(__dirname, "../../../frontend/dist"),
      resolve(__dirname, "../../../../frontend/dist"),
      resolve(process.cwd(), "frontend/dist"),
    ];

    const frontendPath = possiblePaths.find((p) => existsSync(p));

    if (frontendPath) {
      this.logger.info(`Serving frontend from: ${frontendPath}`);

      // Serve static files
      this.app.use(express.static(frontendPath));

      // SPA fallback - serve index.html for non-API routes
      this.app.get("*", (req: Request, res: Response, next: NextFunction) => {
        // Skip API and webhook routes
        if (
          req.path.startsWith("/api") ||
          req.path.startsWith("/webhook") ||
          req.path.startsWith("/health")
        ) {
          return next();
        }
        res.sendFile(resolve(frontendPath, "index.html"));
      });
    }
  }

  async start(): Promise<boolean> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.webhookPort, () => {
        this.logger.info(
          `Webhook server listening on port ${this.config.webhookPort}`,
        );
        this.testRepository.startCleanupTask();
        resolve(true);
      });

      this.server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          this.logger.warn(
            `Port ${this.config.webhookPort} is already in use. Another instance may be running.`,
          );
          this.logger.warn(
            `This instance will use the shared database without running cleanup tasks.`,
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
