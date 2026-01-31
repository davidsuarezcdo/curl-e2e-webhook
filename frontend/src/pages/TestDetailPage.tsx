import { useParams, Link } from "react-router-dom";
import { useTest, useTestLogs } from "@/hooks/useTests";
import { TestDetail } from "@/components/tests/TestDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function TestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const { data: test, isLoading: testLoading } = useTest(testId || "");
  const { data: logs, isLoading: logsLoading } = useTestLogs(testId || "");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tests">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Tests
          </Button>
        </Link>
      </div>

      <TestDetail
        test={test}
        logs={logs}
        isLoading={testLoading || logsLoading}
      />
    </div>
  );
}
