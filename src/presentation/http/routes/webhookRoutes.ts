import { Request, Response, Router } from "express";
import { ITestRepository } from "../../../domain/repositories/ITestRepository.js";
import { ILogger } from "../../../application/interfaces/ILogger.js";

export function createWebhookRoutes(
  testRepository: ITestRepository,
  logger: ILogger
): Router {
  const router = Router();

  // Webhook endpoint
  router.post("/webhook/:testId", (req: Request, res: Response) => {
    const { testId } = req.params;

    const success = testRepository.completeTest(testId, req.body);

    if (!success) {
      logger.error(`Test ID not found or already completed: ${testId}`);
      return res
        .status(404)
        .json({ error: "Test ID not found or already completed" });
    }

    logger.info(`✓ Received webhook for test: ${testId}`);
    res.json({ status: "received", testId });
  });

  return router;
}
