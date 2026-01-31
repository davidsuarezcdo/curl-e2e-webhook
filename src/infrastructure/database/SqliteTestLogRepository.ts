import Database from "better-sqlite3";
import {
  ITestLogRepository,
  LogFilter,
  PaginationOptions,
  PaginatedResult,
} from "../../domain/repositories/ITestLogRepository.js";
import { TestLog, LogEventType, LogLevel } from "../../domain/entities/TestLog.js";
import { getDatabase } from "./DatabaseConnection.js";

export class SqliteTestLogRepository implements ITestLogRepository {
  private db: Database.Database;

  constructor(dbPath: string = "./webhook-tests.db") {
    this.db = getDatabase(dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        testId TEXT NOT NULL,
        eventType TEXT NOT NULL CHECK(eventType IN (
          'test_created', 'http_request_sent', 'http_response_received',
          'webhook_received', 'test_completed', 'test_timeout', 'test_error'
        )),
        level TEXT NOT NULL DEFAULT 'info' CHECK(level IN ('debug', 'info', 'warn', 'error')),
        message TEXT NOT NULL,
        metadata TEXT,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (testId) REFERENCES webhook_tests(testId) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_logs_testId ON test_logs(testId);
      CREATE INDEX IF NOT EXISTS idx_logs_eventType ON test_logs(eventType);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON test_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON test_logs(level);
    `);
  }

  createLog(
    testId: string,
    eventType: LogEventType,
    message: string,
    level: LogLevel = "info",
    metadata?: Record<string, unknown>
  ): TestLog {
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO test_logs (testId, eventType, level, message, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      testId,
      eventType,
      level,
      message,
      metadata ? JSON.stringify(metadata) : null,
      now
    );

    return new TestLog(
      result.lastInsertRowid as number,
      testId,
      eventType,
      level,
      message,
      new Date(now),
      metadata
    );
  }

  getLogsByTestId(testId: string): TestLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM test_logs
      WHERE testId = ?
      ORDER BY timestamp ASC
    `);

    const rows = stmt.all(testId) as DatabaseRow[];
    return rows.map((row) => this.rowToTestLog(row));
  }

  getLogs(
    filter: LogFilter,
    pagination: PaginationOptions
  ): PaginatedResult<TestLog> {
    const { whereClause, params } = this.buildWhereClause(filter);
    const total = this.getLogCount(filter);

    const stmt = this.db.prepare(`
      SELECT * FROM test_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(...params, pagination.limit, pagination.offset) as DatabaseRow[];
    const data = rows.map((row) => this.rowToTestLog(row));

    return {
      data,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + data.length < total,
    };
  }

  getLogCount(filter: LogFilter): number {
    const { whereClause, params } = this.buildWhereClause(filter);

    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM test_logs
      ${whereClause}
    `);

    const result = stmt.get(...params) as { count: number };
    return result.count;
  }

  deleteLogsForTest(testId: string): number {
    const stmt = this.db.prepare(`
      DELETE FROM test_logs WHERE testId = ?
    `);

    const result = stmt.run(testId);
    return result.changes;
  }

  deleteOldLogs(hoursOld: number): number {
    const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000;

    const stmt = this.db.prepare(`
      DELETE FROM test_logs WHERE timestamp < ?
    `);

    const result = stmt.run(cutoffTime);
    return result.changes;
  }

  close(): void {
    // Connection is managed by DatabaseConnection singleton
  }

  private buildWhereClause(filter: LogFilter): { whereClause: string; params: unknown[] } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.testId) {
      conditions.push("testId = ?");
      params.push(filter.testId);
    }

    if (filter.eventType) {
      conditions.push("eventType = ?");
      params.push(filter.eventType);
    }

    if (filter.level) {
      conditions.push("level = ?");
      params.push(filter.level);
    }

    if (filter.fromDate) {
      conditions.push("timestamp >= ?");
      params.push(filter.fromDate.getTime());
    }

    if (filter.toDate) {
      conditions.push("timestamp <= ?");
      params.push(filter.toDate.getTime());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    return { whereClause, params };
  }

  private rowToTestLog(row: DatabaseRow): TestLog {
    return new TestLog(
      row.id,
      row.testId,
      row.eventType as LogEventType,
      row.level as LogLevel,
      row.message,
      new Date(row.timestamp),
      row.metadata ? JSON.parse(row.metadata) : undefined
    );
  }
}

interface DatabaseRow {
  id: number;
  testId: string;
  eventType: string;
  level: string;
  message: string;
  metadata: string | null;
  timestamp: number;
}

// Singleton instance
let logRepoInstance: SqliteTestLogRepository | null = null;

export function getTestLogRepository(dbPath?: string): SqliteTestLogRepository {
  if (!logRepoInstance) {
    logRepoInstance = new SqliteTestLogRepository(dbPath);
  }
  return logRepoInstance;
}

export function closeTestLogRepository(): void {
  if (logRepoInstance) {
    logRepoInstance.close();
    logRepoInstance = null;
  }
}
