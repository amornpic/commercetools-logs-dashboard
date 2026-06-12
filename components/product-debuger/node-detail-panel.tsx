"use client"

import { useState } from "react"
import { ProductType, type GraphNode } from "@/lib/dependency-graph-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  X,
  Box,
  Layers,
  FolderOpen,
  DollarSign,
  Package,
  Store,
  ListChecks,
  ShoppingCart,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import type { Attribute, ProductVariant } from "@commercetools/platform-sdk"

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
  return `https://mc.australia-southeast1.gcp.commercetools.com/truecorp_omni_platform_dev/products/${node.product.id}`
}

function AttributeList({ attributes }: { attributes: Attribute[] }) {
  return (
    <div className="ml-2 space-y-3">
      {attributes.map((attr) => (
        <div key={attr.name}>
          <p className="text-xs font-medium tracking-wider text-muted-foreground">{attr.name}</p>
          <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(attr.value)}</p>
        </div>
      ))}
    </div>
  )
}

function getVariantImageUrl(images: ProductVariant['images']): string | undefined {
  if (!images || images.length === 0) return undefined
  const firstImage = images[0]
  if (!firstImage) return undefined
  return firstImage.url
}

function VariantRow({ variant, productId, isMaster }: { variant: ProductVariant; productId: string; isMaster?: boolean }) {
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const sku = variant.sku ?? `#${variant.id}`
  const imageUrl = getVariantImageUrl(variant.images)
  const colorCode = variant.attributes?.find((a) => a.name === "color_code")?.value as string | undefined
  const colorAttr = variant.attributes?.find((a) => a.name === "color")?.value as
    | { key?: string; label?: { "th-TH"?: string; "en-US"?: string } }
    | undefined
  const colorName = colorAttr?.label?.["th-TH"] ?? colorAttr?.label?.["en-US"]

  return (
    <div className="rounded-md border border-border/60 bg-secondary/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={sku}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Box className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          {colorCode && (
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-border/40"
              style={{ backgroundColor: colorCode }}
            />
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-foreground">
              {sku}
              {isMaster && (
                <span className="ml-2 rounded bg-muted px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Master
                </span>
              )}
            </span>
            {colorName && (
              <span className="truncate text-[10px] text-muted-foreground">{colorName}</span>
            )}
          </span>
        </span>
        <Link
          href={`https://mc.australia-southeast1.gcp.commercetools.com/truecorp_omni_platform_dev/products/${productId}/variants`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-blue-500 hover:underline"
        >
          CT Link
        </Link>
      </button>
      {open && (
        <div className="border-t border-border/60 px-3 pb-3 pt-2">
          {variant.attributes && variant.attributes.length > 0 ? (
            <AttributeList attributes={variant.attributes} />
          ) : (
            <p className="text-xs text-muted-foreground">No attributes</p>
          )}
          {variant.prices && variant.prices.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Prices</p>
              <div className="rounded-md bg-muted p-2">
                <pre className="whitespace-pre-wrap text-xs font-mono">
                  {JSON.stringify(variant.prices, null, 1)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProductTabbedDetail({ node }: { node: GraphNode }) {
  const totalVariants = 1 + (node.variants?.length ?? 0)

  return (
    <Tabs defaultValue="product" className="w-full">
      <TabsList className="mb-3 w-full">
        <TabsTrigger value="product" className="flex-1 text-xs">Product</TabsTrigger>
        <TabsTrigger value="variants" className="flex-1 text-xs">
          Variants
          <Badge variant="secondary" className="ml-1 px-1 py-0 text-[9px]">
            {totalVariants}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* ── Product tab ── */}
      <TabsContent value="product">
        <div className="space-y-4">
          {node.product && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Commercetools Link
              </p>
              <Link
                href={getProductLink(node)}
                target="_blank"
                className="text-sm text-blue-500 hover:underline"
              >
                {node.label}
              </Link>
            </div>
          )}

          {node.uuid && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</p>
              <p className="break-all text-sm leading-relaxed text-foreground/80">{node.uuid}</p>
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Detail</p>
            {typeof node.detail === "string" ? (
              <p className="text-sm leading-relaxed text-foreground/80">{node.detail}</p>
            ) : (
              <div className="rounded-md bg-muted p-3">
                <pre className="whitespace-pre-wrap text-xs font-mono">
                  {JSON.stringify(node.detail, null, 1)}
                </pre>
              </div>
            )}
          </div>

          {node.attributes && node.attributes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Attributes</p>
              <AttributeList attributes={node.attributes} />
            </div>
          )}
        </div>
      </TabsContent>

      {/* ── Variants tab (master first, then additional) ── */}
      <TabsContent value="variants">
        <div className="space-y-2">
          {node.masterVariant ? (
            <VariantRow
              key={node.masterVariant.id}
              variant={node.masterVariant}
              productId={node.product?.id ?? ""}
              isMaster
            />
          ) : (
            <p className="text-sm text-muted-foreground">No master variant assigned</p>
          )}
          {node.variants?.map((variant) => (
            <VariantRow
              key={variant.id}
              variant={variant}
              productId={node.product?.id ?? ""}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

export function NodeDetailPanel({ node, relatedNodes, onClose }: NodeDetailPanelProps) {
  if (!node) return null

  const Icon = iconMap[node.type] || Box
  const isProduct = node.type === ProductType.Product

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
        {/* Node header */}
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
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{node.label}</p>
            <p className="text-xs text-muted-foreground">{node.type}</p>
          </div>
        </div>

        {/* Product: tabbed */}
        {isProduct ? (
          <ProductTabbedDetail node={node} />
        ) : (
          /* All other node types: flat layout */
          <div className="space-y-4">
            {node.product && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Commercetools Link
                </p>
                <Link
                  href={getProductLink(node)}
                  target="_blank"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {node.label}
                </Link>
              </div>
            )}

            {node.uuid && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</p>
                <p className="text-sm leading-relaxed text-foreground/80">{node.uuid}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Detail</p>
              {typeof node.detail === "string" ? (
                <p className="text-sm leading-relaxed text-foreground/80">{node.detail}</p>
              ) : (
                <div className="rounded-md bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {JSON.stringify(node.detail, null, 1)}
                  </pre>
                </div>
              )}
            </div>

            {node.attributes && node.attributes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Attributes</p>
                <div className="ml-2">
                  {node.attributes.map((attribute) => (
                    <div key={attribute.name} className="mb-4">
                      <p className="text-xs font-medium tracking-wider text-muted-foreground">{attribute.name}</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(attribute.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {node.custom && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Custom Fields</p>
                <div className="ml-2">
                  {Object.entries(node.custom.fields).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <p className="text-xs font-medium tracking-wider text-muted-foreground">{key}</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {node.customObjectValue && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Custom Object Value
                </p>
                <div className="ml-2">
                  {Object.entries(node.customObjectValue).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <p className="text-xs font-medium tracking-wider text-muted-foreground">{key}</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{JSON.stringify(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        )}

        {/* Related nodes for Product tab too */}
        {isProduct && relatedNodes.length > 0 && (
          <div className="mt-4 space-y-4">
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
          </div>
        )}
      </div>
    </div>
  )
}
