import { apiClient } from "@/api/apiClientInstance";
import { useQueries } from "@tanstack/react-query";

type Props = {
  sensorPath: string;
  searchParams: { days: string }[];
}

type StateType<T> = {
  isSuccess: boolean;
  isPending: boolean;
  isError: boolean;
  data: (T | null)[];
}

export function useSensorData<T>({ sensorPath, searchParams }: Props): StateType<T> {
  const queries = useQueries({
    queries: searchParams.map((param) => ({
      queryKey: [sensorPath, param],
      queryFn: () => apiClient.makeRequest<T>(sensorPath, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        searchParams: param
      }),
      staleTime: 0,
      gcTime: 0
    }))
  });

  const isPending = queries.some(q => q.isPending);
  const isError = queries.some(q => q.isError);
  const isSuccess = queries.every(q => q.isSuccess);
  
  const data = queries.map(q => q.data ?? null);

  return {
    isPending,
    isError,
    isSuccess,
    data
  };
}