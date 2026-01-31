import { TestLog, LogEventType, LogLevel } from "../entities/TestLog.js";

export interface LogFilter {
  testId?: string;
  eventType?: LogEventType;
  level?: LogLevel;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ITestLogRepository {
  createLog(
    testId: string,
    eventType: LogEventType,
    message: string,
    level?: LogLevel,
    metadata?: Record<string, unknown>
  ): TestLog;

  getLogsByTestId(testId: string): TestLog[];

  getLogs(
    filter: LogFilter,
    pagination: PaginationOptions
  ): PaginatedResult<TestLog>;

  getLogCount(filter: LogFilter): number;

  deleteLogsForTest(testId: string): number;

  deleteOldLogs(hoursOld: number): number;

  close(): void;
}
