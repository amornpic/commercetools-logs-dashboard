"use client"

import { Product } from "@commercetools/platform-sdk"
import { createContext, useContext, useState, type ReactNode } from "react"

interface ProductContextValue {
  selectedProduct: Product | null
  setSelectedProduct: (product: Product) => void
}

const ProductContext = createContext<ProductContextValue | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <ProductContext.Provider value={{ selectedProduct, setSelectedProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const ctx = useContext(ProductContext)
  if (!ctx) {
    throw new Error("useProduct must be used within a ProductProvider")
  }
  return ctx
}
