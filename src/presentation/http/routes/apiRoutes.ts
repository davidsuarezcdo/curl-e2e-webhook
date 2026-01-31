import { Request, Response, Router } from "express";
import { GetLogs } from "../../../application/use-cases/GetLogs.js";
import { GetTests } from "../../../application/use-cases/GetTests.js";
import { GetDashboardStats } from "../../../application/use-cases/GetDashboardStats.js";
import { ITestRepository } from "../../../domain/repositories/ITestRepository.js";
import { ITestLogRepository } from "../../../domain/repositories/ITestLogRepository.js";
import { ILogger } from "../../../application/interfaces/ILogger.js";

export function createApiRoutes(
  testRepository: ITestRepository,
  logRepository: ITestLogRepository,
  logger: ILogger
): Router {
  const router = Router();

  const getLogs = new GetLogs(logRepository);
  const getTests = new GetTests(testRepository);
  const getDashboardStats = new GetDashboardStats(testRepository);

  // GET /api/stats - Dashboard statistics
  router.get("/api/stats", (_req: Request, res: Response) => {
    try {
      const stats = getDashboardStats.execute();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      logger.error(`Error getting stats: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/tests - List tests with pagination
  router.get("/api/tests", (req: Request, res: Response) => {
    try {
      const result = getTests.execute({
        status: req.query.status as string | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      });
      res.json({
        success: true,
        data: result.tests,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.hasMore,
        },
      });
    } catch (error: any) {
      logger.error(`Error getting tests: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/tests/:testId - Get single test details
  router.get("/api/tests/:testId", (req: Request, res: Response) => {
    try {
      const { testId } = req.params;
      const test = testRepository.getTest(testId);

      if (!test) {
        return res.status(404).json({ success: false, error: "Test not found" });
      }

      const testData = {
        testId: test.testId,
        status: test.status,
        requestType: test.requestType,
        duration: test.duration,
        httpRequest: test.httpRequest ? JSON.parse(test.httpRequest) : undefined,
        httpResponse: test.httpResponse ? JSON.parse(test.httpResponse) : undefined,
        webhookPayload: test.webhookPayload ? JSON.parse(test.webhookPayload) : undefined,
        error: test.error,
        createdAt: test.createdAt.toISOString(),
        completedAt: test.completedAt?.toISOString(),
      };

      res.json({ success: true, data: testData });
    } catch (error: any) {
      logger.error(`Error getting test: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/tests/:testId/logs - Get logs for a specific test
  router.get("/api/tests/:testId/logs", (req: Request, res: Response) => {
    try {
      const { testId } = req.params;
      const logs = logRepository.getLogsByTestId(testId);

      res.json({
        success: true,
        data: logs.map((log) => log.toJSON()),
      });
    } catch (error: any) {
      logger.error(`Error getting test logs: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/logs - Get all logs with filters
  router.get("/api/logs", (req: Request, res: Response) => {
    try {
      const result = getLogs.execute({
        testId: req.query.testId as string | undefined,
        eventType: req.query.eventType as string | undefined,
        level: req.query.level as string | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.hasMore,
        },
      });
    } catch (error: any) {
      logger.error(`Error getting logs: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
