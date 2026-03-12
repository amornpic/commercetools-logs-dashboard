"use client"

import { useQuery } from "@tanstack/react-query"
import type { InventoryQueryParams } from "@/lib/commercetools-api"
import { fetchInventory } from "@/lib/commercetools-api"

const queryKeys = {
  inventory: (params: InventoryQueryParams) => ["inventory", params],
}

export function useInventory(params: InventoryQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.inventory(params),
    queryFn: () => fetchInventory(params),
    enabled: !!params.sku && params.sku.length > 0,
  })
}
