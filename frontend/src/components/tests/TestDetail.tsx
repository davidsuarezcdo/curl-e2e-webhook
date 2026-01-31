import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TestStatusBadge } from "./TestStatusBadge";
import { LogTimeline } from "@/components/logs/LogTimeline";
import type { TestEntry, LogEntry } from "@/api/types";

interface TestDetailProps {
  test?: TestEntry;
  logs?: LogEntry[];
  isLoading: boolean;
}

export function TestDetail({ test, logs, isLoading }: TestDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!test) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Test not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono">{test.testId}</CardTitle>
            <TestStatusBadge status={test.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Request Type</p>
              <p className="font-medium truncate">{test.requestType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">
                {test.duration
                  ? test.duration > 1000
                    ? `${(test.duration / 1000).toFixed(2)}s`
                    : `${test.duration}ms`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(new Date(test.createdAt), "PPpp")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="font-medium">
                {test.completedAt
                  ? formatDistanceToNow(new Date(test.completedAt), {
                      addSuffix: true,
                    })
                  : "-"}
              </p>
            </div>
          </div>
          {test.error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{test.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Test ID</dt>
                  <dd className="font-mono">{test.testId}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd>
                    <TestStatusBadge status={test.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Request</dt>
                  <dd className="font-mono text-sm">{test.requestType}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>HTTP Request</CardTitle>
            </CardHeader>
            <CardContent>
              {test.httpRequest ? (
                <pre className="p-4 bg-muted rounded-md overflow-auto text-sm">
                  {JSON.stringify(test.httpRequest, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">No request data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>HTTP Response</CardTitle>
            </CardHeader>
            <CardContent>
              {test.httpResponse ? (
                <pre className="p-4 bg-muted rounded-md overflow-auto text-sm">
                  {JSON.stringify(test.httpResponse, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">No response data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Payload</CardTitle>
            </CardHeader>
            <CardContent>
              {test.webhookPayload ? (
                <pre className="p-4 bg-muted rounded-md overflow-auto text-sm">
                  {JSON.stringify(test.webhookPayload, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">
                  {test.status === "pending"
                    ? "Waiting for webhook..."
                    : "No webhook payload received"}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <LogTimeline logs={logs || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
