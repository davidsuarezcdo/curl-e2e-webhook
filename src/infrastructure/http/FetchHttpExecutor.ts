import { IHttpExecutor } from "../../domain/services/IHttpExecutor.js";
import { HttpRequest } from "../../domain/entities/HttpRequest.js";
import { HttpResponse } from "../../domain/entities/HttpResponse.js";

export class FetchHttpExecutor implements IHttpExecutor {
  async execute(request: HttpRequest): Promise<HttpResponse> {
    const { url, method, headers, body } = request;

    const options: RequestInit = {
      method,
      headers: headers || {},
    };

    if (body) {
      if (typeof body === "object") {
        options.body = JSON.stringify(body);
        if (!options.headers) options.headers = {};
        (options.headers as any)["Content-Type"] = "application/json";
      } else {
        options.body = body;
      }
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    let responseData;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return new HttpResponse(
      response.status,
      response.statusText,
      Object.fromEntries(response.headers.entries()),
      responseData
    );
  }
}
