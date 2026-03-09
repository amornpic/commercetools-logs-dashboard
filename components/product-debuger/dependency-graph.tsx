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
import { getProductGraphData, GraphEdge, type GraphNode } from "@/lib/dependency-graph-data"
import { DependencyGraphNode } from "@/components/product-debuger/graph-node"
import { NodeDetailPanel } from "@/components/product-debuger/node-detail-panel"
import { useProduct } from "@/lib/product-context"
import { GitBranch } from "lucide-react"

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
          fitView({ padding: 0.3, duration: 800 })
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
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] })

  useEffect(() => {
    async function getGraphData() {
      if (!selectedProduct) return
      const graphData = await getProductGraphData(selectedProduct)
      setGraphData(graphData)
    }
    getGraphData()
  }, [selectedProduct])

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
          <h1 className="text-sm font-semibold text-foreground">
            Dependency Graph
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
              fitViewOptions={{ padding: 0.3 }}
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
