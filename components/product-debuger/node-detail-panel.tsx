"use client"

import { ProductType, type GraphNode } from "@/lib/dependency-graph-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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
import Link from "next/link"

const iconMap: Record<string, React.ElementType> = {
  Product: Box,
  "Product Type": Layers,
  Category: FolderOpen,
  Price: DollarSign,
  Inventory: Package,
  Store: Store,
  "Product Selection": ListChecks,
  Cart: ShoppingCart,
  Order: ClipboardCheck,
}

interface NodeDetailPanelProps {
  node: GraphNode | null
  relatedNodes: GraphNode[]
  onClose: () => void
}

function getProductLink(node: GraphNode) {
  if (!node.product) return ""

  if (node.type === ProductType.ProductMasterVariant || node.type === ProductType.ProductVariant) {
    return `https://mc.australia-southeast1.gcp.commercetools.com/truecorp_omni_platform_dev/products/${node.product.id}/variants`
  }

  return `https://mc.australia-southeast1.gcp.commercetools.com/truecorp_omni_platform_dev/products/${node.product.id}`
}

export function NodeDetailPanel({
  node,
  relatedNodes,
  onClose,
}: NodeDetailPanelProps) {
  if (!node) return null

  const Icon = iconMap[node.type] || Box

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Node Details</h3>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-3 pb-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              node.status === "valid" && "bg-node-valid/15 text-node-valid",
              node.status === "warning" && "bg-node-warning/15 text-node-warning",
              node.status === "missing" && "bg-node-missing/15 text-node-missing"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{node.label}</p>
            <p className="text-xs text-muted-foreground">{node.type}</p>
          </div>
        </div>

        <div className="space-y-4">
          {node.product && <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Commercetools Link
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={getProductLink(node)}
                target="_blank"
                className="text-sm text-blue-500 hover:underline"
              >
                {node.label}
              </Link>
            </div>
          </div>}

          {/* <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <div className="flex items-center gap-2">
              {node.status === "valid" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-node-valid" />
                  <Badge className="bg-node-valid/15 text-node-valid border-node-valid/30 hover:bg-node-valid/15">
                    Valid
                  </Badge>
                </>
              )}
              {node.status === "warning" && (
                <>
                  <AlertTriangle className="h-4 w-4 text-node-warning" />
                  <Badge className="bg-node-warning/15 text-node-warning border-node-warning/30 hover:bg-node-warning/15">
                    Warning
                  </Badge>
                </>
              )}
              {node.status === "missing" && (
                <>
                  <XCircle className="h-4 w-4 text-node-missing" />
                  <Badge className="bg-node-missing/15 text-node-missing border-node-missing/30 hover:bg-node-missing/15">
                    Missing
                  </Badge>
                </>
              )}
            </div>
          </div> */}

          {/* // https://mc.australia-southeast1.gcp.commercetools.com/truecorp_omni_platform_dev/products/806544db-2cc6-46b0-a3e1-707752d5377a */}

          {node.uuid && <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</p>
            <p className="text-sm leading-relaxed text-foreground/80">{node.uuid}</p>
          </div>}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Detail
            </p>


            {typeof node.detail === 'string' ? <p className="text-sm leading-relaxed text-foreground/80">{node.detail}</p> : <div className="bg-muted rounded-md p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(node.detail, null, 1)}
              </pre>
            </div>}


            {/* {node.product && <div className="bg-muted rounded-md p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(node.product, null, 2)}
              </pre>
            </div>} */}
          </div>

          {/* {node.status === "missing" && (
            <div className="rounded-lg border border-node-missing/30 bg-node-missing/5 p-3">
              <p className="text-xs font-medium text-node-missing">Issue</p>
              <p className="mt-1 text-sm text-foreground/70">
                This dependency is missing or broken. The product cannot proceed through this step.
              </p>
            </div>
          )}

          {node.status === "warning" && (
            <div className="rounded-lg border border-node-warning/30 bg-node-warning/5 p-3">
              <p className="text-xs font-medium text-node-warning">Warning</p>
              <p className="mt-1 text-sm text-foreground/70">
                This dependency has a potential issue that may affect sellability.
              </p>
            </div>
          )} */}

          {node.attributes && <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Attributes
            </p>
            <div className="ml-2"> 
            {node.attributes?.map((attribute) => (
              <div key={attribute.name} className="mb-4">
                <p className="text-xs font-medium tracking-wider text-muted-foreground">
                  {attribute.name}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(attribute.value)}</p>
              </div>
            ))}
            </div>
          </div>}

          {node.custom && <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Custom Fields
            </p>
            <div className="ml-2"> 
            {Object.entries(node.custom.fields).map(([key, value]) => (
              <div key={key} className="mb-4">
                <p className="text-xs font-medium tracking-wider text-muted-foreground">
                  {key}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(value)}</p>
              </div>
            ))}
            </div>
          </div>}

          {node.customObjectValue && <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Custom Object Value
            </p>
            <div className="ml-2"> 
            {Object.entries(node.customObjectValue).map(([key, value]) => (
              <div key={key} className="mb-4">
                <p className="text-xs font-medium tracking-wider text-muted-foreground">
                  {key}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(value)}</p>
              </div>
            ))}
            </div>
          </div>}

          {relatedNodes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Related Nodes
              </p>
              <div className="space-y-1.5">
                {relatedNodes.map((rn) => {
                  const RnIcon = iconMap[rn.type] || Box
                  return (
                    <div
                      key={rn.id}
                      className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2"
                    >
                      <RnIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground">{rn.label}</span>
                      <div
                        className={cn(
                          "ml-auto h-2 w-2 rounded-full",
                          rn.status === "valid" && "bg-node-valid",
                          rn.status === "warning" && "bg-node-warning",
                          rn.status === "missing" && "bg-node-missing"
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
