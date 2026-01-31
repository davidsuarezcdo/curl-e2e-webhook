import { ITestRepository } from "../../domain/repositories/ITestRepository.js";
import { DashboardStats } from "../dto/DashboardStats.js";

export class GetDashboardStats {
  constructor(private readonly testRepository: ITestRepository) {}

  execute(): DashboardStats {
    const stats = this.testRepository.getStats();

    const successRate =
      stats.totalTests > 0
        ? Math.round((stats.completedTests / stats.totalTests) * 100)
        : 0;

    return {
      totalTests: stats.totalTests,
      completedTests: stats.completedTests,
      pendingTests: stats.pendingTests,
      timedOutTests: stats.timedOutTests,
      successRate,
      avgDuration: stats.avgDuration,
      recentTests: stats.recentTests,
    };
  }
}
