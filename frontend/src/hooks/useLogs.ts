import { useQuery } from "@tanstack/react-query";
import { getLogs, GetLogsParams } from "@/api/client";

export function useLogs(params: GetLogsParams = {}) {
  return useQuery({
    queryKey: ["logs", params],
    queryFn: () => getLogs(params),
    refetchInterval: 5000,
  });
}
