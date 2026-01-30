import { ExecuteCurlRequest } from "../../../application/dto/ExecuteCurlRequest.js";

export class McpAdapter {
  static toExecuteCurlRequest(args: any): ExecuteCurlRequest {
    return {
      testId: args.testId,
      curlCommand: args.curlCommand,
      url: args.url,
      method: args.method,
      headers: args.headers,
      body: args.body,
      timeoutSeconds: args.timeoutSeconds,
      webhookUrlPlaceholder: args.webhookUrlPlaceholder,
    };
  }

  static toMcpResponse(result: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  static toMcpTextResponse(text: string) {
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }

  static toMcpErrorResponse(error: Error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
