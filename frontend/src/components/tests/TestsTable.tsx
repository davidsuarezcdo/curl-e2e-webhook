import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TestStatusBadge } from "./TestStatusBadge";
import type { TestEntry, PaginationInfo } from "@/api/types";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface TestsTableProps {
  tests?: TestEntry[];
  pagination?: PaginationInfo;
  isLoading: boolean;
  onPageChange?: (offset: number) => void;
  compact?: boolean;
}

export function TestsTable({
  tests,
  pagination,
  isLoading,
  onPageChange,
  compact = false,
}: TestsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No tests found. Run a test using the MCP tools to see results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tests</CardTitle>
        {pagination && (
          <span className="text-sm text-muted-foreground">
            Showing {pagination.offset + 1}-
            {Math.min(pagination.offset + tests.length, pagination.total)} of{" "}
            {pagination.total}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Test ID</th>
                <th className="pb-3 font-medium">Status</th>
                {!compact && <th className="pb-3 font-medium">Request Type</th>}
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.testId} className="border-b">
                  <td className="py-3">
                    <code className="text-sm">{test.testId}</code>
                  </td>
                  <td className="py-3">
                    <TestStatusBadge status={test.status} />
                  </td>
                  {!compact && (
                    <td className="py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {test.requestType}
                    </td>
                  )}
                  <td className="py-3 text-sm">
                    {test.duration
                      ? test.duration > 1000
                        ? `${(test.duration / 1000).toFixed(1)}s`
                        : `${test.duration}ms`
                      : "-"}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(test.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="py-3">
                    <Link to={`/tests/${test.testId}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && onPageChange && pagination.total > pagination.limit && (
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(Math.max(0, pagination.offset - pagination.limit))
              }
              disabled={pagination.offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(pagination.offset + pagination.limit)
              }
              disabled={!pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
