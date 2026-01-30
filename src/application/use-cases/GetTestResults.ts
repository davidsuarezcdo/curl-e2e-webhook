import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { TestResult } from "../dto/TestResult.js";

export interface GetTestResultsInput {
  limit?: number;
}

export interface GetTestResultsOutput {
  total: number;
  showing: number;
  results: TestResult[];
}

export class GetTestResults {
  constructor(private readonly testRepository: ITestRepository) {}

  execute(input: GetTestResultsInput): GetTestResultsOutput {
    const limit = input.limit || 10;
    const results = this.testRepository.getAllTests(limit);

    // Parse JSON fields for display
    const parsedResults: TestResult[] = results.map((test) => ({
      testId: test.testId,
      status: test.status,
      requestType: test.requestType,
      duration: test.duration,
      httpRequest: test.httpRequest ? JSON.parse(test.httpRequest) : null,
      httpResponse: test.httpResponse ? JSON.parse(test.httpResponse) : null,
      webhookResponse: test.webhookPayload
        ? JSON.parse(test.webhookPayload)
        : null,
      error: test.error,
      createdAt: test.createdAt.toISOString(),
    }));

    return {
      total: results.length,
      showing: parsedResults.length,
      results: parsedResults,
    };
  }
}
