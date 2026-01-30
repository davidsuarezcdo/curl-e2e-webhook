export class HttpRequest {
  constructor(
    public readonly url: string,
    public readonly method: string,
    public readonly headers: Record<string, string> = {},
    public readonly body?: any
  ) {}

  replaceUrlPlaceholder(placeholder: string, value: string): HttpRequest {
    const newUrl = this.url.replace(new RegExp(placeholder, "g"), value);
    return new HttpRequest(newUrl, this.method, this.headers, this.body);
  }

  replaceBodyPlaceholder(placeholder: string, value: string): HttpRequest {
    if (!this.body) {
      return this;
    }

    const bodyStr =
      typeof this.body === "string" ? this.body : JSON.stringify(this.body);
    const replacedBody = bodyStr.replace(new RegExp(placeholder, "g"), value);

    let newBody: any;
    try {
      newBody = JSON.parse(replacedBody);
    } catch {
      newBody = replacedBody;
    }

    return new HttpRequest(this.url, this.method, this.headers, newBody);
  }

  replacePlaceholder(placeholder: string, value: string): HttpRequest {
    let result = this.replaceUrlPlaceholder(placeholder, value);
    result = result.replaceBodyPlaceholder(placeholder, value);
    return result;
  }

  toJSON() {
    return {
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
    };
  }
}
