"use client"

import { useState, useMemo, useEffect } from "react"
import { useProduct } from "@/lib/product-context"
import {
  products,
  getProductSellability,
  getProductDisplayName,
  getProductAttribute,
  getProductName,
} from "@/lib/dependency-graph-data"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { useProductTypes } from "@/hooks/use-product-types"
import { Product } from "@commercetools/platform-sdk"

function StatusIcon({ status }: { status: string }) {
  if (status === "valid")
    return <CheckCircle2 className="h-3.5 w-3.5 text-node-valid" />
  if (status === "warning")
    return <AlertTriangle className="h-3.5 w-3.5 text-node-warning" />
  return <XCircle className="h-3.5 w-3.5 text-node-missing" />
}

function StatusBadge({ status }: { status: string }) {
  if (status === "valid") {
    return (
      <Badge className="bg-node-valid/15 text-node-valid border-node-valid/30 text-[10px] hover:bg-node-valid/15">
        Sellable
      </Badge>
    )
  }
  if (status === "warning") {
    return (
      <Badge className="bg-node-warning/15 text-node-warning border-node-warning/30 text-[10px] hover:bg-node-warning/15">
        Warning
      </Badge>
    )
  }
  return (
    <Badge className="bg-node-missing/15 text-node-missing border-node-missing/30 text-[10px] hover:bg-node-missing/15">
      Issues
    </Badge>
  )
}

export function ProductSidebar() {
  const { selectedProduct, setSelectedProduct } = useProduct()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [openTypeSelect, setOpenTypeSelect] = useState(false)

  const { data: productTypesData } = useProductTypes()

  const selectedTypeName = useMemo(() => {
    if (!selectedTypeId || !productTypesData?.results) return null
    return productTypesData.results.find((pt) => pt.id === selectedTypeId)?.name || null
  }, [selectedTypeId, productTypesData])

  const queryParams = useMemo(() => {
    const params: { limit?: number; offset?: number; where?: string[]; searchQuery?: string } = {
      limit: 50,
    }

    if (searchQuery.trim()) {
      params.searchQuery = searchQuery.trim()
    }

    if (selectedTypeId) {
      params.where = params.where || []
      params.where.push(`productType(id="${selectedTypeId}")`)
    }

    return params
  }, [searchQuery, selectedTypeId])

  const { data: productsData, isLoading, isError, error, refetch, isRefetching } = useProducts(queryParams)

  const filteredProducts = useMemo(() => {
    return productsData ? productsData?.results : []
  }, [productsData])

  // const issueCount = useMemo(() => {
  //   return filteredProducts.filter((product: Product) => {
  //     const s = getProductSellability(product)
  //     return s?.overallStatus !== "valid"
  //   }).length
  // }, [filteredProducts])

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Products
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {productsData?.total} total
          </span>
          {/* <span className="text-border">{"/"}</span>
          <span className="text-xs font-mono text-node-missing">
            {issueCount} with issues
          </span> */}
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Type Filter */}
      <div className="border-b border-border p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Product Type
          </span>
          {selectedTypeId && (
            <button
              onClick={() => setSelectedTypeId(null)}
              className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <Popover open={openTypeSelect} onOpenChange={setOpenTypeSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openTypeSelect}
              className="w-full justify-between h-8 text-xs bg-secondary border-border text-foreground"
            >
              {selectedTypeName || "All product types"}
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(var(--radix-popover-trigger-width))] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search product type..." className="h-8 text-xs" />
              <CommandList>
                <CommandEmpty className="py-3 text-xs text-center">No product type found.</CommandEmpty>
                <CommandGroup>
                  {(productTypesData?.results || []).map((pt) => (
                    <CommandItem
                      key={pt.id}
                      value={pt.name}
                      onSelect={() => {
                        setSelectedTypeId(selectedTypeId === pt.id ? null : pt.id)
                        setOpenTypeSelect(false)
                      }}
                      className="text-xs"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          selectedTypeId === pt.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {pt.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Product Results List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.map((product: Product) => {
          // const ps = getProductSellability(product)
          const isActive = selectedProduct === product
          // const productType = productTypes.find(
          //   (pt) => pt.id === product.productTypeId
          // )

          return (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors",
                isActive
                  ? "bg-secondary"
                  : "hover:bg-secondary/40"
              )}
            >
              {/* <StatusIcon status={ps?.overallStatus || "missing"} /> */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getProductName(product)}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground truncate">
                    {product.masterData?.current?.masterVariant?.sku}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {product.productType.obj?.name}
                  </span>
                  {!product.masterData?.published && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 border-node-warning/30 text-node-warning"
                    >
                      Draft
                    </Badge>
                  )}
                  {product.masterData?.hasStagedChanges && product.masterData?.published && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 border-node-warning/30 text-node-warning"
                    >
                      Staged
                    </Badge>
                  )}
                </div>
              </div>
              {/* <div className="shrink-0 pt-0.5">
                <StatusBadge status={ps?.overallStatus || "missing"} />
              </div> */}
            </button>
          )
        })}
        {(isRefetching || isLoading) && (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <Search className="h-6 w-6 opacity-40" />
            <p className="text-xs">Loading...</p>
          </div>
        )}

        {filteredProducts.length === 0 && !isRefetching && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <Search className="h-6 w-6 opacity-40" />
            <p className="text-xs">No products match your filters</p>
          </div>
        )}
      </div>
    </aside>
  )
}
