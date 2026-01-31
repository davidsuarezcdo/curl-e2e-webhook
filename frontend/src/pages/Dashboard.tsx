import { useStats } from "@/hooks/useStats";
import { useTests } from "@/hooks/useTests";
import { StatsCards, AdditionalStats } from "@/components/dashboard/StatsCards";
import { TestsTable } from "@/components/tests/TestsTable";

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: testsData, isLoading: testsLoading } = useTests({ limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your webhook test results
        </p>
      </div>

      <StatsCards stats={stats} isLoading={statsLoading} />

      <AdditionalStats stats={stats} isLoading={statsLoading} />

      <TestsTable
        tests={testsData?.tests}
        isLoading={testsLoading}
        compact
      />
    </div>
  );
}
