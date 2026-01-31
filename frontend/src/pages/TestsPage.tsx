import { useState } from "react";
import { useTests } from "@/hooks/useTests";
import { TestsTable } from "@/components/tests/TestsTable";

export function TestsPage() {
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading } = useTests({ limit, offset });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
        <p className="text-muted-foreground">
          All webhook tests and their results
        </p>
      </div>

      <TestsTable
        tests={data?.tests}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setOffset}
      />
    </div>
  );
}
