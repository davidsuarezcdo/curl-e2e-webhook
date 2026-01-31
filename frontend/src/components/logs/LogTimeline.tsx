import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LogEntry } from "@/api/types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Send,
  Inbox,
  Clock,
  Webhook,
} from "lucide-react";

interface LogTimelineProps {
  logs: LogEntry[];
}

const eventIcons: Record<string, React.ElementType> = {
  test_created: Clock,
  http_request_sent: Send,
  http_response_received: Inbox,
  webhook_received: Webhook,
  test_completed: CheckCircle,
  test_timeout: AlertTriangle,
  test_error: XCircle,
};

const levelColors: Record<string, string> = {
  debug: "text-gray-500",
  info: "text-blue-500",
  warn: "text-yellow-500",
  error: "text-red-500",
};

const levelBadgeVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "warning"
> = {
  debug: "secondary",
  info: "default",
  warn: "warning",
  error: "destructive",
};

export function LogTimeline({ logs }: LogTimelineProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No log entries found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log, index) => {
            const Icon = eventIcons[log.eventType] || Info;
            const iconColor = levelColors[log.level] || "text-gray-500";

            return (
              <div
                key={log.id || index}
                className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`p-2 rounded-full bg-muted ${iconColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{log.message}</span>
                    <Badge variant={levelBadgeVariants[log.level] || "default"}>
                      {log.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{format(new Date(log.timestamp), "HH:mm:ss.SSS")}</span>
                    <span className="font-mono text-xs">{log.eventType}</span>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                        View metadata
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
