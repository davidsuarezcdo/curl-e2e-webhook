import { HttpRequest } from "../entities/HttpRequest.js";
import { HttpResponse } from "../entities/HttpResponse.js";

export interface IHttpExecutor {
  execute(request: HttpRequest): Promise<HttpResponse>;
}
