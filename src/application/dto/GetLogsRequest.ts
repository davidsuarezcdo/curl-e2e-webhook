export interface GetLogsRequest {
  testId?: string;
  eventType?: string;
  level?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}
