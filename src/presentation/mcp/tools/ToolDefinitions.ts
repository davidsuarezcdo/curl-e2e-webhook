import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "executeCurlAndWaitWebhook",
    description: `
Executes a curl command (or HTTP request) and waits for a webhook response.
This is the PRIMARY tool for executing any HTTP request and waiting for an async response.

Perfect for testing integrations where:
1. You make an HTTP request to trigger a process
2. The system processes it asynchronously
3. It sends a webhook back when done

You can provide either:
- A curl command string (e.g., 'curl -X POST https://api.example.com/endpoint -H "Content-Type: application/json" -d "{\\"key\\":\\"value\\"}"')
- Or structured HTTP request parameters (url, method, headers, body)

Returns both the HTTP response and the webhook payload received.
`,
    inputSchema: {
      type: "object",
      properties: {
        testId: {
          type: "string",
          description:
            "REQUIRED test ID for the webhook URL. Use descriptive IDs like 'test-payment-001' or 'webhook-checkout-flow'. This ID will be used to construct the webhook URL: ${WEBHOOK_BASE_URL}/webhook/{testId}",
        },
        curlCommand: {
          type: "string",
          description:
            "Full curl command to execute (e.g., 'curl -X POST https://api.example.com -d ...')",
        },
        url: {
          type: "string",
          description: "URL to request (alternative to curlCommand)",
        },
        method: {
          type: "string",
          description: "HTTP method: GET, POST, PUT, DELETE, etc. (default: GET)",
          default: "GET",
        },
        headers: {
          type: "object",
          description: "HTTP headers as key-value pairs",
        },
        body: {
          type: ["object", "string"],
          description: "Request body (will be JSON stringified if object)",
        },
        timeoutSeconds: {
          type: "number",
          description:
            "Timeout in seconds to wait for webhook (default: 300 = 5 minutes)",
          default: 300,
        },
        webhookUrlPlaceholder: {
          type: "string",
          description:
            "Placeholder in the request that should be replaced with the webhook URL (e.g., '{{WEBHOOK_URL}}')",
          default: "{{WEBHOOK_URL}}",
        },
      },
      required: ["testId"],
    },
  },
  {
    name: "executeHttpRequest",
    description: `
Executes an HTTP request without waiting for a webhook.
Use this for simple HTTP requests that return immediate responses.

You can provide either:
- A curl command string
- Or structured HTTP request parameters

Returns the HTTP response immediately.
`,
    inputSchema: {
      type: "object",
      properties: {
        curlCommand: {
          type: "string",
          description: "Full curl command to execute",
        },
        url: {
          type: "string",
          description: "URL to request (alternative to curlCommand)",
        },
        method: {
          type: "string",
          description: "HTTP method: GET, POST, PUT, DELETE, etc. (default: GET)",
          default: "GET",
        },
        headers: {
          type: "object",
          description: "HTTP headers as key-value pairs",
        },
        body: {
          type: ["object", "string"],
          description: "Request body (will be JSON stringified if object)",
        },
      },
    },
  },
  {
    name: "getWebhookUrl",
    description: `
Generates a unique webhook URL for manual testing.
Use this when you want to manually trigger an external API
and get a webhook URL to configure as the callback.
`,
    inputSchema: {
      type: "object",
      properties: {
        testId: {
          type: "string",
          description: "Optional custom test ID (auto-generated if not provided)",
        },
      },
    },
  },
  {
    name: "waitForWebhook",
    description: `
Waits for a webhook to arrive at a previously generated URL.
Use this after calling getWebhookUrl and triggering an external API manually.
`,
    inputSchema: {
      type: "object",
      properties: {
        testId: {
          type: "string",
          description: "Test ID from getWebhookUrl",
        },
        timeoutSeconds: {
          type: "number",
          description: "Timeout in seconds (default: 300 = 5 minutes)",
          default: 300,
        },
      },
      required: ["testId"],
    },
  },
  {
    name: "getTestResults",
    description: `
Returns all test results from the current session.
Useful for reviewing what tests have been run and their outcomes.
`,
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 10)",
          default: 10,
        },
      },
    },
  },
  {
    name: "clearTestResults",
    description: "Clears all test results from memory",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
