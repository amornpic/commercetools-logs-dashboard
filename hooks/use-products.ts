"use client"

import { useQuery } from "@tanstack/react-query"
import type { ProductQueryParams } from "@/lib/commercetools-api"
import { fetchProducts } from "@/lib/commercetools-api"

// Key factory for consistent query keys
const queryKeys = {
  products: (params: ProductQueryParams) => ["products", params],
}

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => fetchProducts(params),
  })
}
