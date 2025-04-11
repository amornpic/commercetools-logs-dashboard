"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CustomObjectQueryParams, CustomObjectDraft } from "@/lib/commercetools-api"
import { fetchCustomObjects } from "@/lib/commercetools-api"

// Key factory for consistent query keys
const queryKeys = {
  customObjects: (params: CustomObjectQueryParams) => ["customObjects", params],
  customObject: (container: string, key: string) => ["customObject", container, key],
  containers: () => ["customObjectContainers"],
}

// Hook for fetching custom objects
export function useCustomObjects(params: CustomObjectQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.customObjects(params),
    queryFn: () => fetchCustomObjects(params),
    keepPreviousData: true,
  })
}

// Hook for fetching a single custom object
// export function useCustomObject(container: string, key: string) {
//   return useQuery({
//     queryKey: queryKeys.customObject(container, key),
//     queryFn: () => getCustomObject(container, key),
//     enabled: !!container && !!key,
//   })
// }

// // Hook for fetching unique containers
// export function useCustomObjectContainers() {
//   return useQuery({
//     queryKey: queryKeys.containers(),
//     queryFn: () => getContainers(),
//   })
// }
