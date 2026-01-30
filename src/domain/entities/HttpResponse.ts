export class HttpResponse {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly headers: Record<string, string>,
    public readonly body: any
  ) {}

  isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  toJSON() {
    return {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      body: this.body,
    };
  }
}
