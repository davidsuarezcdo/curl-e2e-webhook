export interface TestResult {
  testId: string;
  status: string;
  requestType: string;
  duration?: number;
  httpRequest?: any;
  httpResponse?: any;
  webhookResponse?: any;
  error?: string;
  createdAt: string;
}
