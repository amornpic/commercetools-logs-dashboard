"use client"

import { useMemo } from "react"
import { getProductSellability, getProductDisplayName, getProductAttribute, type DependencyCheck } from "@/lib/dependency-graph-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/lib/product-context"
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Box,
  ShoppingCart,
  ClipboardCheck,
} from "lucide-react"

function StatusIcon({ status }: { status: string }) {
  if (status === "valid")
    return <CheckCircle2 className="h-4 w-4 text-node-valid" />
  if (status === "warning")
    return <AlertTriangle className="h-4 w-4 text-node-warning" />
  return <XCircle className="h-4 w-4 text-node-missing" />
}

function CheckRow({ check }: { check: DependencyCheck }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
        check.status === "valid" && "border-node-valid/20 bg-node-valid/5",
        check.status === "warning" && "border-node-warning/20 bg-node-warning/5",
        check.status === "missing" && "border-node-missing/20 bg-node-missing/5"
      )}
    >
      <StatusIcon status={check.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{check.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {check.description}
        </p>
      </div>
    </div>
  )
}

function CheckSection({
  title,
  icon: Icon,
  checks,
}: {
  title: string
  icon: React.ElementType
  checks: DependencyCheck[]
}) {
  const validCount = checks.filter((c) => c.status === "valid").length
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {validCount}/{checks.length}
        </span>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <CheckRow key={check.label} check={check} />
        ))}
      </div>
    </div>
  )
}

export function SellabilityChecker() {
  const { selectedProductId } = useProduct()

  const sellability = useMemo(() => {
    if (!selectedProductId) return null
    return getProductSellability(selectedProductId)
  }, [selectedProductId])

  const issueCount = useMemo(() => {
    if (!sellability) return 0
    return [
      ...sellability.productSetup,
      ...sellability.commerceSetup,
      ...sellability.checkoutFlow,
    ].filter((c) => c.status !== "valid").length
  }, [sellability])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            Sellability Checker
          </h1>
          <p className="text-xs text-muted-foreground">
            Diagnose product sellability across all dependencies
          </p>
        </div>
        {sellability && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{issueCount === 0 ? "All checks passed" : `${issueCount} issue${issueCount === 1 ? "" : "s"}`}</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sellability ? (
          <div className="mx-auto max-w-2xl p-6">
            {/* Product header card */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {getProductDisplayName(sellability.product)}
                  </h2>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    SKU: {sellability.product.masterVariant.sku}
                  </p>
                  <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/70">
                    {sellability.product.id}
                  </p>
                  {(getProductAttribute(sellability.product, "campaignCode") as string) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        Campaign: {getProductAttribute(sellability.product, "campaignCode") as string}
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {(getProductAttribute(sellability.product, "campaignType") as string) || "N/A"}
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        v{sellability.product.version}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {sellability.overallStatus === "valid" && (
                    <Badge className="bg-node-valid/15 text-node-valid border-node-valid/30 hover:bg-node-valid/15">
                      Sellable
                    </Badge>
                  )}
                  {sellability.overallStatus === "warning" && (
                    <Badge className="bg-node-warning/15 text-node-warning border-node-warning/30 hover:bg-node-warning/15">
                      Warning
                    </Badge>
                  )}
                  {sellability.overallStatus === "missing" && (
                    <Badge className="bg-node-missing/15 text-node-missing border-node-missing/30 hover:bg-node-missing/15">
                      Not Sellable
                    </Badge>
                  )}
                </div>
              </div>

              {issueCount > 0 && (
                <div className="mt-4 rounded-lg border border-node-missing/20 bg-node-missing/5 px-4 py-3">
                  <p className="text-sm font-medium text-node-missing">
                    {issueCount} {issueCount === 1 ? "issue" : "issues"} found
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Resolve the issues below to make this product sellable.
                  </p>
                </div>
              )}
            </div>

            {/* Check sections */}
            <div className="space-y-6">
              <CheckSection
                title="Product Setup"
                icon={Box}
                checks={sellability.productSetup}
              />
              <CheckSection
                title="Commerce Setup"
                icon={ShoppingCart}
                checks={sellability.commerceSetup}
              />
              <CheckSection
                title="Checkout Flow"
                icon={ClipboardCheck}
                checks={sellability.checkoutFlow}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Search className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">Select a product</p>
            <p className="text-xs">
              Choose a product from the sidebar to check its sellability status.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
