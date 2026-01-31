export interface TestEntry {
  testId: string;
  status: "pending" | "completed" | "timeout";
  requestType: string;
  duration?: number;
  httpRequest?: Record<string, unknown>;
  httpResponse?: Record<string, unknown>;
  webhookPayload?: unknown;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface LogEntry {
  id: number | null;
  testId: string;
  eventType: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  timedOutTests: number;
  successRate: number;
  avgDuration: number;
  recentTests: number;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}
