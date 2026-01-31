export interface LogEntry {
  id: number | null;
  testId: string;
  eventType: string;
  level: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GetLogsResponse {
  logs: LogEntry[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
