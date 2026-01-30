export interface ExecuteCurlRequest {
  testId: string;
  curlCommand?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutSeconds?: number;
  webhookUrlPlaceholder?: string;
}
