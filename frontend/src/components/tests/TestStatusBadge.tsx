import { Badge } from "@/components/ui/badge";

interface TestStatusBadgeProps {
  status: "pending" | "completed" | "timeout" | string;
}

export function TestStatusBadge({ status }: TestStatusBadgeProps) {
  const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    pending: "warning",
    completed: "success",
    timeout: "destructive",
  };

  return (
    <Badge variant={variants[status] || "default"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
