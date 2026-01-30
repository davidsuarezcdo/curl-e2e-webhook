import { ITestRepository } from "../../domain/repositories/ITestRepository.js";

export interface ClearTestResultsOutput {
  count: number;
}

export class ClearTestResults {
  constructor(private readonly testRepository: ITestRepository) {}

  execute(): ClearTestResultsOutput {
    const count = this.testRepository.clearAllTests();
    return { count };
  }
}
