import Database from "better-sqlite3";
import { resolve } from "path";
import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { WebhookTest, TestStatus } from "../../domain/entities/WebhookTest.js";

export class SqliteTestRepository implements ITestRepository {
  private db: Database.Database;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(dbPath: string = "./webhook-tests.db") {
    this.db = new Database(resolve(dbPath));
    this.initializeSchema();
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS webhook_tests (
        testId TEXT PRIMARY KEY,
        status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'timeout')),
        requestType TEXT NOT NULL,
        httpRequest TEXT,
        httpResponse TEXT,
        webhookPayload TEXT,
        error TEXT,
        createdAt INTEGER NOT NULL,
        timeoutAt INTEGER NOT NULL,
        completedAt INTEGER,
        duration INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_status ON webhook_tests(status);
      CREATE INDEX IF NOT EXISTS idx_timeout ON webhook_tests(timeoutAt);
      CREATE INDEX IF NOT EXISTS idx_created ON webhook_tests(createdAt);
    `);
  }

  private deleteTest(testId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM webhook_tests WHERE testId = ?
    `);

    const result = stmt.run(testId);
    return result.changes > 0;
  }

  createTest(
    testId: string,
    requestType: string,
    timeoutSeconds: number,
    httpRequest?: any,
    httpResponse?: any
  ): void {
    const now = Date.now();
    const timeoutAt = now + timeoutSeconds * 1000;

    // Check if test already exists
    const existingTest = this.getTest(testId);

    if (existingTest) {
      if (existingTest.isPending()) {
        // Don't delete active tests - throw error
        throw new Error(
          `testId '${testId}' is already in use by an active test. ` +
            `Please use a different testId or wait for the current test to complete.`
        );
      } else {
        // Auto-cleanup completed/timeout tests
        console.error(
          `[DB] Auto-cleanup: removing previous test '${testId}' (status: ${existingTest.status})`
        );
        this.deleteTest(testId);
      }
    }

    const stmt = this.db.prepare(`
      INSERT INTO webhook_tests (
        testId, status, requestType, httpRequest, httpResponse,
        createdAt, timeoutAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      testId,
      "pending",
      requestType,
      httpRequest ? JSON.stringify(httpRequest) : null,
      httpResponse ? JSON.stringify(httpResponse) : null,
      now,
      timeoutAt
    );
  }

  getTest(testId: string): WebhookTest | null {
    const stmt = this.db.prepare(`
      SELECT * FROM webhook_tests WHERE testId = ?
    `);

    const row = stmt.get(testId) as any;
    if (!row) {
      return null;
    }

    return new WebhookTest(
      row.testId,
      row.status as TestStatus,
      row.requestType,
      new Date(row.createdAt),
      new Date(row.timeoutAt),
      row.completedAt ? new Date(row.completedAt) : undefined,
      row.duration,
      row.httpRequest,
      row.httpResponse,
      row.webhookPayload,
      row.error
    );
  }

  completeTest(testId: string, webhookPayload: any): boolean {
    const now = Date.now();
    const test = this.getTest(testId);

    if (!test || !test.isPending()) {
      return false;
    }

    const duration = now - test.createdAt.getTime();

    const stmt = this.db.prepare(`
      UPDATE webhook_tests
      SET status = 'completed',
          webhookPayload = ?,
          completedAt = ?,
          duration = ?
      WHERE testId = ? AND status = 'pending'
    `);

    const result = stmt.run(JSON.stringify(webhookPayload), now, duration, testId);
    return result.changes > 0;
  }

  timeoutTest(testId: string, error: string): boolean {
    const now = Date.now();
    const test = this.getTest(testId);

    if (!test) {
      return false;
    }

    const duration = now - test.createdAt.getTime();

    const stmt = this.db.prepare(`
      UPDATE webhook_tests
      SET status = 'timeout',
          error = ?,
          completedAt = ?,
          duration = ?
      WHERE testId = ? AND status = 'pending'
    `);

    const result = stmt.run(error, now, duration, testId);
    return result.changes > 0;
  }

  async waitForCompletion(
    testId: string,
    timeoutSeconds: number,
    pollIntervalMs: number = 200
  ): Promise<WebhookTest> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    return new Promise((resolve, reject) => {
      const poll = () => {
        const test = this.getTest(testId);

        if (!test) {
          clearInterval(interval);
          reject(new Error(`Test ${testId} not found`));
          return;
        }

        // Check if completed
        if (test.isCompleted()) {
          clearInterval(interval);
          resolve(test);
          return;
        }

        // Check if timed out
        if (test.isTimedOut()) {
          clearInterval(interval);
          reject(
            new Error(test.error || `Timeout after ${timeoutSeconds} seconds`)
          );
          return;
        }

        // Check if we've exceeded our wait time
        if (Date.now() - startTime >= timeoutMs) {
          clearInterval(interval);
          this.timeoutTest(testId, `Timeout after ${timeoutSeconds} seconds`);
          reject(new Error(`Timeout after ${timeoutSeconds} seconds`));
          return;
        }
      };

      const interval = setInterval(poll, pollIntervalMs);
      poll(); // Check immediately
    });
  }

  getAllTests(limit: number = 10): WebhookTest[] {
    const stmt = this.db.prepare(`
      SELECT * FROM webhook_tests
      ORDER BY createdAt DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];
    return rows.map(
      (row) =>
        new WebhookTest(
          row.testId,
          row.status as TestStatus,
          row.requestType,
          new Date(row.createdAt),
          new Date(row.timeoutAt),
          row.completedAt ? new Date(row.completedAt) : undefined,
          row.duration,
          row.httpRequest,
          row.httpResponse,
          row.webhookPayload,
          row.error
        )
    );
  }

  clearAllTests(): number {
    const stmt = this.db.prepare(`DELETE FROM webhook_tests`);
    const result = stmt.run();
    return result.changes;
  }

  cleanupOldTests(hoursOld: number = 24): number {
    const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000;

    const stmt = this.db.prepare(`
      DELETE FROM webhook_tests
      WHERE createdAt < ?
    `);

    const result = stmt.run(cutoffTime);
    return result.changes;
  }

  cleanupTimedOutTests(): number {
    const now = Date.now();

    const stmt = this.db.prepare(`
      UPDATE webhook_tests
      SET status = 'timeout',
          error = 'Cleanup: exceeded timeout',
          completedAt = ?
      WHERE status = 'pending' AND timeoutAt < ?
    `);

    const result = stmt.run(now, now);
    return result.changes;
  }

  startCleanupTask() {
    if (this.cleanupInterval) {
      console.error("[DB] Cleanup task already running");
      return;
    }

    console.error("[DB] Starting cleanup task (every 5 minutes)");

    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const timedOut = this.cleanupTimedOutTests();
      const oldTests = this.cleanupOldTests(24);

      if (timedOut > 0 || oldTests > 0) {
        console.error(
          `[DB] Cleanup: ${timedOut} timed out, ${oldTests} old tests removed`
        );
      }
    }, 5 * 60 * 1000);
  }

  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
      console.error("[DB] Cleanup task stopped");
    }
  }

  close() {
    this.stopCleanupTask();
    this.db.close();
  }
}

// Singleton instance
let dbInstance: SqliteTestRepository | null = null;

export function getTestRepository(dbPath?: string): SqliteTestRepository {
  if (!dbInstance) {
    dbInstance = new SqliteTestRepository(dbPath);
  }
  return dbInstance;
}

export function closeTestRepository() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
