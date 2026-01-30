import { HttpRequest } from "../../domain/entities/HttpRequest.js";

export class CurlParser {
  parse(curlCommand: string): HttpRequest {
    let url = "";
    let method = "GET";
    const headers: Record<string, string> = {};
    let body: any = undefined;

    // Remove leading/trailing whitespace and 'curl' command
    let cmd = curlCommand.trim();
    if (cmd.startsWith("curl ")) {
      cmd = cmd.substring(5).trim();
    }

    // Parse flags and URL
    const tokens = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Remove quotes if present
      const cleanToken = token.replace(/^["']|["']$/g, "");

      if (token === "-X" || token === "--request") {
        method = tokens[++i]?.replace(/^["']|["']$/g, "") || "GET";
      } else if (token === "-H" || token === "--header") {
        const header = tokens[++i]?.replace(/^["']|["']$/g, "") || "";
        const [key, ...valueParts] = header.split(":");
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join(":").trim();
        }
      } else if (
        token === "-d" ||
        token === "--data" ||
        token === "--data-raw"
      ) {
        const data = tokens[++i]?.replace(/^["']|["']$/g, "") || "";
        try {
          body = JSON.parse(data);
        } catch {
          body = data;
        }
      } else if (token.startsWith("http://") || token.startsWith("https://")) {
        url = cleanToken;
      }
    }

    if (!url) {
      throw new Error("No URL found in curl command");
    }

    return new HttpRequest(url, method, headers, body);
  }
}
