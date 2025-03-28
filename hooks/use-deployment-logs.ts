"use client"

import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { getDeploymentLogs, getDeploymentLogStats, getDeployments } from "@/app/actions"
import type { DeploymentLogQueryParams } from "@/lib/commercetools-api"
import type { DeploymentLogResponse } from "@/lib/commercetools-api"

// Key factory for consistent query keys
const queryKeys = {
  logs: (params: DeploymentLogQueryParams) => ["deploymentLogs", params],
  stats: () => ["deploymentLogStats"],
  deploymentDetails: (id: string) => ["deploymentDetails", id],
}

// Hook for fetching deployment logs
export function useDeploymentLogs(params: DeploymentLogQueryParams): UseQueryResult<DeploymentLogResponse, Error> {
  return useQuery({
    queryKey: queryKeys.logs(params),
    queryFn: () => getDeploymentLogs(params),
    keepPreviousData: true,
  })
}

// Hook for fetching deployment log stats
export function useDeploymentLogStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: () => getDeploymentLogStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching deployment details
export function useDeploymentDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.deploymentDetails(id),
    queryFn: () => getDeploymentDetails(id),
    enabled: !!id, // Only run the query if id is provided
  })
}

// Hook for refreshing logs
export function useRefreshLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeploymentLogQueryParams) => {
      return getDeploymentLogs(params)
    },
    onSuccess: (data, variables) => {
      // Update the query cache with the new data
      queryClient.setQueryData(queryKeys.logs(variables), data)
      // Invalidate stats to ensure they're up to date
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() })
    },
  })
}

// Add a hook for fetching the next page of logs
export function useNextDeploymentLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ params, pageToken }: { params: DeploymentLogQueryParams; pageToken: string }) => {
      // Create a new params object with the cursor
      const nextPageParams = { ...params, pageToken: pageToken }
      return getDeploymentLogs(nextPageParams)
    },
    onSuccess: (data, variables) => {
        console.log('useNextDeploymentLogs data', data);
        
      // Get the current data from the cache
      const currentData = queryClient.getQueryData(queryKeys.logs(variables.params)) as
        | DeploymentLogResponse
        | undefined

        console.log('currentData', currentData);
        

      // Merge the current data with the new data
      if (currentData && data.data) {
        const mergedData = {
          ...data,
          data: [...(currentData.data || []), ...data.data],
          total: currentData.total || data.data.length,
          pageToken: data.next,
        }

        console.log('mergedData', mergedData.data.length);

        // Update the query cache with the merged data
        queryClient.setQueryData(queryKeys.logs(variables.params), mergedData)
      }
    },
  })
}

