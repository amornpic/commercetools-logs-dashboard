"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchProductTypes } from "@/lib/commercetools-api"

const queryKeys = {
  productTypes: () => ["productTypes"],
}

export function useProductTypes() {
  return useQuery({
    queryKey: queryKeys.productTypes(),
    queryFn: () => fetchProductTypes(),
  })
}
