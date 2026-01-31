import type {
  TestEntry,
  LogEntry,
  DashboardStats,
  ApiResponse,
  PaginationInfo,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export interface GetTestsParams {
  status?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface GetLogsParams {
  testId?: string;
  eventType?: string;
  level?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export async function getStats(): Promise<DashboardStats> {
  const response = await fetchApi<DashboardStats>("/api/stats");
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch stats");
  }
  return response.data;
}

export async function getTests(
  params: GetTestsParams = {}
): Promise<{ tests: TestEntry[]; pagination: PaginationInfo }> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.fromDate) searchParams.set("fromDate", params.fromDate);
  if (params.toDate) searchParams.set("toDate", params.toDate);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());

  const query = searchParams.toString();
  const endpoint = `/api/tests${query ? `?${query}` : ""}`;

  const response = await fetchApi<TestEntry[]>(endpoint);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch tests");
  }
  return {
    tests: response.data,
    pagination: response.pagination || {
      total: response.data.length,
      limit: params.limit || 50,
      offset: params.offset || 0,
      hasMore: false,
    },
  };
}

export async function getTest(testId: string): Promise<TestEntry> {
  const response = await fetchApi<TestEntry>(`/api/tests/${testId}`);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch test");
  }
  return response.data;
}

export async function getTestLogs(testId: string): Promise<LogEntry[]> {
  const response = await fetchApi<LogEntry[]>(`/api/tests/${testId}/logs`);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch test logs");
  }
  return response.data;
}

export async function getLogs(
  params: GetLogsParams = {}
): Promise<{ logs: LogEntry[]; pagination: PaginationInfo }> {
  const searchParams = new URLSearchParams();
  if (params.testId) searchParams.set("testId", params.testId);
  if (params.eventType) searchParams.set("eventType", params.eventType);
  if (params.level) searchParams.set("level", params.level);
  if (params.fromDate) searchParams.set("fromDate", params.fromDate);
  if (params.toDate) searchParams.set("toDate", params.toDate);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());

  const query = searchParams.toString();
  const endpoint = `/api/logs${query ? `?${query}` : ""}`;

  const response = await fetchApi<LogEntry[]>(endpoint);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch logs");
  }
  return {
    logs: response.data,
    pagination: response.pagination || {
      total: response.data.length,
      limit: params.limit || 50,
      offset: params.offset || 0,
      hasMore: false,
    },
  };
}
