import { useQuery } from "@tanstack/react-query";
import { getTests, getTest, getTestLogs, GetTestsParams } from "@/api/client";

export function useTests(params: GetTestsParams = {}) {
  return useQuery({
    queryKey: ["tests", params],
    queryFn: () => getTests(params),
    refetchInterval: 5000,
  });
}

export function useTest(testId: string) {
  return useQuery({
    queryKey: ["test", testId],
    queryFn: () => getTest(testId),
    enabled: !!testId,
  });
}

export function useTestLogs(testId: string) {
  return useQuery({
    queryKey: ["testLogs", testId],
    queryFn: () => getTestLogs(testId),
    enabled: !!testId,
  });
}
