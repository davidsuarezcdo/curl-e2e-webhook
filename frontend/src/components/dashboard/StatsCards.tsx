import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/api/types";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Timer,
} from "lucide-react";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Tests",
      value: stats.totalTests,
      description: `${stats.recentTests} in last 24h`,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Completed",
      value: stats.completedTests,
      description: `${stats.successRate}% success rate`,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Pending",
      value: stats.pendingTests,
      description: "Waiting for webhook",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Timed Out",
      value: stats.timedOutTests,
      description: "Failed to receive webhook",
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdditionalStats({
  stats,
  isLoading,
}: {
  stats?: DashboardStats;
  isLoading: boolean;
}) {
  if (isLoading || !stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <div className="mt-2 h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Timer className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgDuration > 1000
              ? `${(stats.avgDuration / 1000).toFixed(1)}s`
              : `${stats.avgDuration}ms`}
          </div>
          <p className="text-xs text-muted-foreground">
            Average test completion time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
