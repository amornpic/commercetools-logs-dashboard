"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type OnNodeClick,
  MarkerType,
  Position,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import { getProductAttribute, getProductDisplayName, GraphEdge, ProductType, type GraphNode } from "@/lib/dependency-graph-data"
import { DependencyGraphNode } from "@/components/product-debuger/graph-node"
import { NodeDetailPanel } from "@/components/product-debuger/node-detail-panel"
import { useProduct } from "@/lib/product-context"
import { GitBranch, Loader2 } from "lucide-react"

import { useCustomObjects } from "@/hooks/use-custom-objects"
import { useInventory } from "@/hooks/use-inventory"

const nodeTypes = {
  dependency: DependencyGraphNode,
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}) as any)
const nodeWidth = 280
const nodeHeight = 80

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
    return newNode as Node
  })

  return { nodes: newNodes, edges }
}

function AutoFitView({ nodes }: { nodes: Node[] }) {
  const { fitView } = useReactFlow()
  
  useEffect(() => {
    if (nodes.length > 0) {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          fitView({ padding: 0.3, duration: 800, maxZoom: 1 })
        }, 50)
      })
    }
  }, [nodes, fitView])

  return null
}

function buildFlowNodes(graphNodes: GraphNode[]): Node[] {
  return graphNodes.map((gn) => ({
    id: gn.id,
    type: "dependency",
    position: { x: 0, y: 0 },
    data: {
      label: gn.label,
      nodeType: gn.type,
      status: gn.status,
      detail: gn.detail,
    },
  }))
}

function buildFlowEdges(
  graphEdges: { source: string; target: string }[],
  graphNodes: GraphNode[]
): Edge[] {
  return graphEdges.map((edge) => {
    const targetNode = graphNodes.find((n) => n.id === edge.target)
    const status = targetNode?.status || "valid"

    return {
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: status === "missing",
      style: {
        stroke:
          status === "valid"
            ? "oklch(0.72 0.19 155 / 0.5)"
            : status === "warning"
            ? "oklch(0.80 0.16 75 / 0.5)"
            : "oklch(0.65 0.22 25 / 0.5)",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color:
          status === "valid"
            ? "oklch(0.72 0.19 155 / 0.5)"
            : status === "warning"
            ? "oklch(0.80 0.16 75 / 0.5)"
            : "oklch(0.65 0.22 25 / 0.5)",
      },
    }
  })
}

export function DependencyGraph() {
  const { selectedProduct } = useProduct()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // ─── Collect SKUs from the selected product ──────────────────────────────
  const skus = useMemo(() => {
    if (!selectedProduct) return []
    const result: string[] = []
    if (selectedProduct.masterData?.current.masterVariant?.sku) {
      result.push(selectedProduct.masterData.current.masterVariant.sku)
    }
    selectedProduct.masterData?.current.variants.forEach((variant) => {
      if (variant.sku) result.push(variant.sku)
    })
    return result
  }, [selectedProduct])

  // ─── Hooks at the top level (always called, conditionally enabled) ───────
  const { data: inventoryResponse, isFetching: isInventoryFetching, isLoading: isInventoryLoading } = useInventory(
    { sku: skus },
  )

  const productType = selectedProduct?.productType?.obj?.key
  const isPromotionSet = productType === "promotion_set"

  // Fetch promotion custom objects only when product is a promotion_set
  const promotionDetailKeys = useMemo(() => {
    if (!isPromotionSet || !selectedProduct) return []
    return (getProductAttribute(selectedProduct, "promotionDetails") as string[]) ?? []
  }, [isPromotionSet, selectedProduct])

  const promotionProductKeys = useMemo(() => {
    if (!isPromotionSet || !selectedProduct) return []
    return (getProductAttribute(selectedProduct, "promotionProducts") as string[]) ?? []
  }, [isPromotionSet, selectedProduct])

  const promotionProductGroupKeys = useMemo(() => {
    if (!isPromotionSet || !selectedProduct) return []
    return (getProductAttribute(selectedProduct, "promotionProductGroups") as string[]) ?? []
  }, [isPromotionSet, selectedProduct])

  const { data: promotionDetailObjects, isFetching: isPromotionDetailFetching, isLoading: isPromotionDetailLoading } = useCustomObjects(
    isPromotionSet && promotionDetailKeys.length > 0
      ? { container: "promotion_product_detail", key: promotionDetailKeys }
      : {},
  )

  const { data: promotionProductObjects, isFetching: isPromotionProductFetching, isLoading: isPromotionProductLoading } = useCustomObjects(
    isPromotionSet && promotionProductKeys.length > 0
      ? { container: "promotion_product", key: promotionProductKeys }
      : {},
  )

  const { data: promotionProductGroupObjects, isFetching: isPromotionProductGroupFetching, isLoading: isPromotionProductGroupLoading } = useCustomObjects(
    isPromotionSet && promotionProductGroupKeys.length > 0
      ? { container: "promotion_product_group", key: promotionProductGroupKeys }
      : {},
  )

  const isFetching =
    isInventoryFetching ||
    isPromotionDetailFetching ||
    isPromotionProductFetching ||
    isPromotionProductGroupFetching

  const isLoading =
    isInventoryLoading ||
    isPromotionDetailLoading ||
    isPromotionProductLoading ||
    isPromotionProductGroupLoading

  // ─── Build graph data reactively ─────────────────────────────────────────
  const graphData = useMemo<{ nodes: GraphNode[]; edges: GraphEdge[] }>(() => {
    if (!selectedProduct) return { nodes: [], edges: [] }

    const product = selectedProduct
    const productId = product.id
    const displayName = getProductDisplayName(product)

    const graphNodes: GraphNode[] = [
      {
        uuid: productId,
        id: `product-${productId}`,
        type: ProductType.Product,
        label: displayName,
        status: product.masterData?.published ? "valid" : "warning",
        detail: product.masterData?.published
          ? product.masterData?.hasStagedChanges
            ? `Published (staged changes) | Key: ${product.key}`
            : `Published | Key: ${product.key}`
          : `Draft | Key: ${product.key}`,
        product: product,
        attributes: product.masterData?.current?.masterVariant?.attributes,
      },
      {
        uuid: productId,
        id: `productMasterVariant-${productId}`,
        type: ProductType.ProductMasterVariant,
        label: product.masterData?.current.masterVariant.sku || "Missing",
        status: product.masterData?.current.masterVariant.sku ? "valid" : "missing",
        detail: product.masterData?.current.masterVariant.sku
          ? `${product.masterData.current.masterVariant.sku}`
          : "No master variant assigned",
        product: product,
        variant: product.masterData?.current.masterVariant,
        attributes: product.masterData?.current?.masterVariant?.attributes,
      },
    ]

    const graphEdges: GraphEdge[] = [
      { source: `product-${productId}`, target: `productMasterVariant-${productId}` },
    ]

    // ── Master variant inventory ──
    const masterVariantSku = product.masterData?.current.masterVariant.sku
    const masterInventory =
      inventoryResponse?.results.find((i) => i.sku === masterVariantSku)
    if (masterInventory) {
      graphNodes.push({
        uuid: masterInventory.id,
        id: `inventory-${productId}-${masterVariantSku}`,
        type: ProductType.Inventory,
        label: masterInventory.key || masterInventory.sku,
        status: masterInventory.availableQuantity > 0 ? "valid" : "missing",
        detail: {
          sku: masterInventory.sku,
          key: masterInventory.key,
          availableQuantity: masterInventory.availableQuantity,
          quantityOnStock: masterInventory.quantityOnStock,
          minCartQuantity: masterInventory.minCartQuantity,
          maxCartQuantity: masterInventory.maxCartQuantity,
          restockableInDays: masterInventory.restockableInDays,
          expectedDelivery: masterInventory.expectedDelivery,
        },
        custom: masterInventory.custom,
      })
      graphEdges.push({
        source: `productMasterVariant-${productId}`,
        target: `inventory-${productId}-${masterVariantSku}`,
      })
    }

    // ── Other variants + their inventory ──
    product.masterData?.current.variants.forEach((variant) => {
      const nodeId = `variant-${productId}-${variant.sku}`
      graphNodes.push({
        uuid: productId,
        id: nodeId,
        type: ProductType.ProductVariant,
        label: variant.sku ?? "missing",
        status: "valid",
        detail: `SKU: ${variant.sku ?? "missing"} | Price: ${variant.price}`,
        product: product,
        variant: variant,
        attributes: variant.attributes,
      })
      graphEdges.push({ source: `product-${productId}`, target: nodeId })

      const variantInventory = inventoryResponse?.results.find(
        (i) => i.sku === variant.sku
      )
      if (variantInventory) {
        graphNodes.push({
          uuid: variantInventory.id,
          id: `inventory-${productId}-${variant.sku}`,
          type: ProductType.Inventory,
          label: variantInventory.key || variantInventory.sku,
          status: variantInventory.availableQuantity > 0 ? "valid" : "missing",
          detail: {
            sku: variantInventory.sku,
            key: variantInventory.key,
            availableQuantity: variantInventory.availableQuantity,
            quantityOnStock: variantInventory.quantityOnStock,
            minCartQuantity: variantInventory.minCartQuantity,
            maxCartQuantity: variantInventory.maxCartQuantity,
            restockableInDays: variantInventory.restockableInDays,
            expectedDelivery: variantInventory.expectedDelivery,
          },
          custom: variantInventory.custom,
        })
        graphEdges.push({
          source: nodeId,
          target: `inventory-${productId}-${variant.sku}`,
        })
      }
    })

    // ── Promotion set custom objects ──
    if (isPromotionSet && promotionDetailObjects?.results) {
      for (const promotionDetailKey of promotionDetailKeys) {
        const promotionDetail = promotionDetailObjects.results.find(
          (obj) => obj.key === promotionDetailKey
        )
        if (promotionDetail) {
          graphNodes.push({
            uuid: promotionDetail.id,
            id: `customObject-promotionDetail-${promotionDetailKey}`,
            type: ProductType.CustomObjectPromotionDetail,
            label: promotionDetail.value?.code,
            status: "valid",
            detail: `Key: ${promotionDetail.key}`,
            customObjectValue: promotionDetail.value,
          })
          graphEdges.push({
            source: `productMasterVariant-${productId}`,
            target: `customObject-promotionDetail-${promotionDetailKey}`,
          })
        }
      }
    }

    // ── Promotion products ──
    if (isPromotionSet && promotionProductObjects?.results) {
      for (const promotionProductKey of promotionProductKeys) {
        const promotionProduct = promotionProductObjects.results.find(
          (obj) => obj.key === promotionProductKey
        )
        if (promotionProduct) {
          graphNodes.push({
            uuid: promotionProduct.id,
            id: `customObject-promotionProduct-${promotionProductKey}`,
            type: ProductType.CustomObjectPromotionProduct,
            label: promotionProduct.value?.code,
            status: "valid",
            detail: `Key: ${promotionProduct.key}`,
            customObjectValue: promotionProduct.value,
          })
          graphEdges.push({
            source: `productMasterVariant-${productId}`,
            target: `customObject-promotionProduct-${promotionProductKey}`,
          })
        }
      }
    }

    // ── Promotion product groups ──
    if (isPromotionSet && promotionProductGroupObjects?.results) {
      for (const promotionProductGroupKey of promotionProductGroupKeys) {
        const promotionProductGroup = promotionProductGroupObjects.results.find(
          (obj) => obj.key === promotionProductGroupKey
        )
        if (promotionProductGroup) {
          graphNodes.push({
            uuid: promotionProductGroup.id,
            id: `customObject-promotionProductGroup-${promotionProductGroupKey}`,
            type: ProductType.CustomObjectPromotionProductGroup,
            label: promotionProductGroup.value?.code,
            status: "valid",
            detail: `Key: ${promotionProductGroup.key}`,
            customObjectValue: promotionProductGroup.value,
          })
          graphEdges.push({
            source: `productMasterVariant-${productId}`,
            target: `customObject-promotionProductGroup-${promotionProductGroupKey}`,
          })
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges }
  }, [selectedProduct, inventoryResponse, isPromotionSet, promotionDetailKeys, promotionDetailObjects, promotionProductKeys, promotionProductObjects, promotionProductGroupKeys, promotionProductGroupObjects])

  // ─── Layout the graph when data changes ──────────────────────────────────
  useEffect(() => {
    const initialNodes = buildFlowNodes(graphData.nodes)
    const initialEdges = buildFlowEdges(graphData.edges, graphData.nodes)
    
    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      )
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
    } else {
      setNodes([])
      setEdges([])
    }
    
    setSelectedNode(null)
  }, [graphData, setNodes, setEdges])

  const onNodeClick: OnNodeClick = useCallback(
    (_event, node) => {
      const graphNode = graphData.nodes.find((gn) => gn.id === node.id)
      if (graphNode) setSelectedNode(graphNode)
    },
    [graphData]
  )

  const relatedNodes = useMemo(() => {
    if (!selectedNode) return []
    const connectedIds = new Set<string>()
    graphData.edges.forEach((edge) => {
      if (edge.source === selectedNode.id) connectedIds.add(edge.target)
      if (edge.target === selectedNode.id) connectedIds.add(edge.source)
    })
    return graphData.nodes.filter((n) => connectedIds.has(n.id))
  }, [selectedNode, graphData])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Dependency Graph
            {(isFetching || isLoading) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-xs text-muted-foreground">
            Visualize product dependencies and identify issues
          </p>
        </div>
        {/* <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-node-valid" />
              <span className="text-xs text-muted-foreground">Valid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-node-warning" />
              <span className="text-xs text-muted-foreground">Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-node-missing" />
              <span className="text-xs text-muted-foreground">Missing</span>
            </div>
          </div>
        </div> */}
      </div>

      {selectedProduct ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
              proOptions={{ hideAttribution: true }}
              className="bg-background"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="oklch(0.30 0.005 270)"
              />
              <AutoFitView nodes={nodes} />
            </ReactFlow>
          </div>

          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              relatedNodes={relatedNodes}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <GitBranch className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">Select a product</p>
            <p className="text-xs">
              Choose a product from the sidebar to view its dependency graph.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
