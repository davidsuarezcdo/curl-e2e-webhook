import { Request, Response, Router } from "express";
import { ITestRepository } from "../../../domain/repositories/ITestRepository.js";
import { Config } from "../../../infrastructure/config/Config.js";

export function createHealthRoutes(
  testRepository: ITestRepository,
  config: Config
): Router {
  const router = Router();

  // Health check endpoint
  router.get("/health", (req: Request, res: Response) => {
    const allTests = testRepository.getAllTests(1000);
    const pendingTests = allTests.filter((t) => t.isPending());

    res.json({
      status: "ok",
      pendingWebhooks: pendingTests.length,
      testResults: allTests.length,
    });
  });

  // Get webhook URL for a test
  router.get("/webhook-url/:testId", (req: Request, res: Response) => {
    const { testId } = req.params;
    res.json({
      webhookUrl: config.getWebhookUrl(testId),
    });
  });

  return router;
}
