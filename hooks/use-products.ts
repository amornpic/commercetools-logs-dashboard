"use client"

import { useQuery } from "@tanstack/react-query"
import type { ProductQueryParams } from "@/lib/commercetools-api"
import { fetchProductsSearch } from "@/lib/commercetools-api"
import { ProductPagedQueryResponse } from "@commercetools/platform-sdk"

// Key factory for consistent query keys
const queryKeys = {
  productsSearch: (params: ProductQueryParams) => ["productsSearch", params],
  products: (params: ProductQueryParams) => ["products", params],
}

export function useProductsSearch(params: ProductQueryParams = {}) {
  return useQuery<ProductPagedQueryResponse>({
    queryKey: queryKeys.productsSearch(params),
    queryFn: () => fetchProductsSearch(params),
    enabled: params && Object.keys(params).length > 0,
  })
}

// export function useProducts(params: ProductQueryParams = {}) {
//   return useQuery({
//     queryKey: queryKeys.products(params),
//     queryFn: () => fetchProducts(params),
//   })
// }
