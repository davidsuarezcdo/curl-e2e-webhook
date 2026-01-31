import { ITestLogRepository } from "../../domain/repositories/ITestLogRepository.js";
import { LogEventType, LogLevel } from "../../domain/entities/TestLog.js";
import { GetLogsRequest } from "../dto/GetLogsRequest.js";
import { GetLogsResponse, LogEntry } from "../dto/GetLogsResponse.js";

export class GetLogs {
  constructor(private readonly logRepository: ITestLogRepository) {}

  execute(request: GetLogsRequest): GetLogsResponse {
    const limit = Math.min(request.limit || 50, 100);
    const offset = request.offset || 0;

    const filter = {
      testId: request.testId,
      eventType: request.eventType as LogEventType | undefined,
      level: request.level as LogLevel | undefined,
      fromDate: request.fromDate ? new Date(request.fromDate) : undefined,
      toDate: request.toDate ? new Date(request.toDate) : undefined,
    };

    const result = this.logRepository.getLogs(filter, { limit, offset });

    const logs: LogEntry[] = result.data.map((log) => ({
      id: log.id,
      testId: log.testId,
      eventType: log.eventType,
      level: log.level,
      message: log.message,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata,
    }));

    return {
      logs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    };
  }
}
