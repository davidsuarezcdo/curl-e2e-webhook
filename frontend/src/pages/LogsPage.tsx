import { useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { LogTimeline } from "@/components/logs/LogTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function LogsPage() {
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const { data, isLoading } = useLogs({ limit, offset });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">All test events and system logs</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading logs...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <LogTimeline logs={data?.logs || []} />

          {data?.pagination && data.pagination.total > limit && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing {data.pagination.offset + 1}-
                {Math.min(
                  data.pagination.offset + (data.logs?.length || 0),
                  data.pagination.total,
                )}{" "}
                of {data.pagination.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={!data.pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
