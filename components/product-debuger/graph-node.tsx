"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { Status } from "@/lib/dependency-graph-data"
import {
  Box,
  Layers,
  FolderOpen,
  DollarSign,
  Package,
  Store,
  ListChecks,
  ShoppingCart,
  ClipboardCheck,
} from "lucide-react"

type DependencyNodeData = {
  label: string
  nodeType: string
  status: Status
  detail: string
  variantSkus?: string[]
  imageUrl?: string
}

type DependencyNode = Node<DependencyNodeData, "dependency">

const iconMap: Record<string, React.ElementType> = {
  Product: Box,
  "Product Variants": Box,
  "Product Type": Layers,
  Category: FolderOpen,
  Price: DollarSign,
  Inventory: Package,
  Store: Store,
  "Product Selection": ListChecks,
  Cart: ShoppingCart,
  Order: ClipboardCheck,
}

const statusColors: Record<Status, string> = {
  valid: "border-node-valid bg-node-valid/10",
  warning: "border-node-warning bg-node-warning/10",
  missing: "border-node-missing bg-node-missing/10",
}

const statusDot: Record<Status, string> = {
  valid: "bg-node-valid",
  warning: "bg-node-warning",
  missing: "bg-node-missing",
}

function DependencyNodeComponent({ data, selected, targetPosition, sourcePosition }: NodeProps<DependencyNode>) {
  const Icon = iconMap[data.nodeType] || Box
  const status = data.status

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 px-4 py-3 shadow-lg transition-all min-w-[180px]",
        statusColors[status],
        selected && "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
      )}
    >
      <Handle
        type="target"
        position={targetPosition || Position.Top}
        className="!w-2 !h-2 !border-2 !border-card !bg-muted-foreground"
      />

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center rounded-md overflow-hidden",
            status === "valid" && "bg-node-valid/20 text-node-valid",
            status === "warning" && "bg-node-warning/20 text-node-warning",
            status === "missing" && "bg-node-missing/20 text-node-missing"
          )}
        >
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.label}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.removeAttribute("style")
              }}
            />
          ) : <Icon
            className="h-6 w-6"
          />}

        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] font-medium tracking-wider text-muted-foreground">
            {data.nodeType}
          </span>
          <span className="text-sm font-semibold text-foreground truncate">
            {data.label}
          </span>
          {data.variantSkus && data.variantSkus.length > 0 && (
            <div className="mt-1.5 flex flex-col gap-0.5">
              {data.variantSkus.map((sku, i) => (
                <div key={sku + i} className="flex items-center gap-1.5">
                  {/* <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      i === 0
                        ? status === "valid" ? "bg-node-valid" : status === "warning" ? "bg-node-warning" : "bg-node-missing"
                        : "bg-muted-foreground/40"
                    )}
                  /> */}
                  <span className="text-[12px] font-medium text-muted-foreground truncate">
                    {sku}
                    {i === 0 && <span className="mr-0.5 text-[9px] font-semibold uppercase tracking-wider"> (Master) </span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={cn(
            "ml-auto h-2.5 w-2.5 shrink-0 rounded-full",
            statusDot[status]
          )}
        />
      </div>

      <Handle
        type="source"
        position={sourcePosition || Position.Bottom}
        className="!w-2 !h-2 !border-2 !border-card !bg-muted-foreground"
      />
    </div>
  )
}

export const DependencyGraphNode = memo(DependencyNodeComponent)
