import { ITestRepository, TestFilter } from "../../domain/repositories/ITestRepository.js";
import { TestStatus } from "../../domain/entities/WebhookTest.js";
import { GetTestsRequest } from "../dto/GetTestsRequest.js";
import { GetTestsResponse, TestEntry } from "../dto/GetTestsResponse.js";

export class GetTests {
  constructor(private readonly testRepository: ITestRepository) {}

  execute(request: GetTestsRequest): GetTestsResponse {
    const limit = Math.min(request.limit || 50, 100);
    const offset = request.offset || 0;

    const filter: TestFilter = {
      status: request.status as TestStatus | undefined,
      fromDate: request.fromDate ? new Date(request.fromDate) : undefined,
      toDate: request.toDate ? new Date(request.toDate) : undefined,
    };

    const result = this.testRepository.getTestsPaginated(filter, {
      limit,
      offset,
    });

    const tests: TestEntry[] = result.data.map((test) => ({
      testId: test.testId,
      status: test.status,
      requestType: test.requestType,
      duration: test.duration,
      httpRequest: test.httpRequest ? JSON.parse(test.httpRequest) : undefined,
      httpResponse: test.httpResponse
        ? JSON.parse(test.httpResponse)
        : undefined,
      webhookPayload: test.webhookPayload
        ? JSON.parse(test.webhookPayload)
        : undefined,
      error: test.error,
      createdAt: test.createdAt.toISOString(),
      completedAt: test.completedAt?.toISOString(),
    }));

    return {
      tests,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    };
  }
}
