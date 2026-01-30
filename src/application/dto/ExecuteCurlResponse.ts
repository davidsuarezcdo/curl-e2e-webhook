export interface ExecuteCurlResponse {
  success: boolean;
  testId: string;
  duration?: number;
  httpRequest: any;
  httpResponse: any;
  webhookResponse?: any;
  webhookUrl: string;
  error?: string;
}
