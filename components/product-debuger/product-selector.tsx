"use client"

import { cn } from "@/lib/utils"
import { products, getProductSellability } from "@/lib/dependency-graph-data"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

interface ProductSelectorProps {
  selectedId: string
  onSelect: (id: string) => void
}

export function ProductSelector({ selectedId, onSelect }: ProductSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {products.map((product) => {
        const sellability = getProductSellability(product)
        const isActive = selectedId === product.id
        const status = sellability?.overallStatus || "missing"

        return (
          <button
            key={product.id}
            onClick={() => onSelect(product.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
              isActive
                ? "border-foreground/20 bg-secondary text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/10 hover:text-foreground"
            )}
          >
            {status === "valid" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-node-valid" />
            )}
            {status === "warning" && (
              <AlertTriangle className="h-3.5 w-3.5 text-node-warning" />
            )}
            {status === "missing" && (
              <XCircle className="h-3.5 w-3.5 text-node-missing" />
            )}
            {product.masterData?.current.name["en"]}
          </button>
        )
      })}
    </div>
  )
}
