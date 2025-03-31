"use client"

import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { fetchDeploymentLogs, fetchDeployments, type DeploymentLogQueryParams } from "@/lib/commercetools-api"
import type { Deployment, DeploymentLogResponse, DeploymentQueryParams, DeploymentsResponse } from "@/lib/commercetools-api"

// Key factory for consistent query keys
const queryKeys = {
  logs: (params: DeploymentLogQueryParams) => ["deploymentLogs", params],
  deploymentDetails: (key: string) => ["deploymentDetails", key],
  deployments: (params: DeploymentQueryParams) => ["deployments", params],
}

// Hook for fetching deployment logs
export function useDeploymentLogs(params: DeploymentLogQueryParams): UseQueryResult<DeploymentLogResponse, Error> {
  return useQuery({
    queryKey: queryKeys.logs(params),
    queryFn: () => fetchDeploymentLogs(params),
    keepPreviousData: true,
  })
}

export function useDeployments(params: DeploymentQueryParams): UseQueryResult<DeploymentsResponse, Error> {
  return useQuery({
    queryKey: queryKeys.deployments(params),
    queryFn: () => fetchDeployments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for fetching deployment details
export function useDeploymentDetails(params: DeploymentQueryParams): UseQueryResult<Deployment, Error> {
  return useQuery({
    queryKey: queryKeys.deployments(params),
    queryFn: () => fetchDeployments(params),
    enabled: !!params.key, // Only run the query if id is provided
  })
}

// Hook for refreshing logs
export function useRefreshLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeploymentLogQueryParams) => {
      return fetchDeploymentLogs(params)
    },
    onSuccess: (data, variables) => {
      // Update the query cache with the new data
      queryClient.setQueryData(queryKeys.logs(variables), data)
      // Invalidate stats to ensure they're up to date
      // queryClient.invalidateQueries({ queryKey: queryKeys.stats() })
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
      return fetchDeploymentLogs(nextPageParams)
    },
    onSuccess: (data, variables) => {
        
      // Get the current data from the cache
      const currentData = queryClient.getQueryData(queryKeys.logs(variables.params)) as
        | DeploymentLogResponse
        | undefined

      // Merge the current data with the new data
      if (currentData && data.data) {
        const mergedData = {
          ...data,
          data: [...(currentData.data || []), ...data.data],
          total: currentData.total || data.data.length,
          pageToken: data.next,
        }

        // Update the query cache with the merged data
        queryClient.setQueryData(queryKeys.logs(variables.params), mergedData)
      }
    },
  })
}

