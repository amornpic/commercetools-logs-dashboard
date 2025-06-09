"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"


// import { CustomObjectDetails } from "@/components/custom-objects/custom-object-details"

import { useCustomObjects } from "@/hooks/use-custom-objects"
import type { CustomObject } from "@/lib/commercetools-api"
import { CustomObjectsTable } from "./custom-objects-table"
import { CustomObjectDetails } from "./custom-object-details"

export function CustomObjectsDashboard() {
  const [selectedObject, setSelectedObject] = useState<CustomObject | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()

  const container = searchParams.get("container") || "orderError"
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "20")

  // Build query params for React Query
  const queryParams = useMemo(() => {
    console.log('searchQuery', searchQuery);
    
    return {
    limit,
    offset: (page - 1) * limit,
    container: container || undefined,
    // where: searchQuery ? [`key="${searchQuery}*"`] : undefined,
    sort: ["-lastModifiedAt"],
    key: searchQuery ? searchQuery : undefined,
  }},[searchQuery, container, page, limit])

//   useEffect(() => {
//     if (searchQuery === "") {
//       setSearchQuery("")
//     }
//   })

  // Fetch custom objects and containers
  const { data, isLoading, isError, error, refetch, isRefetching } = useCustomObjects(queryParams)

  const containers = ["orderError", "orderAdditionalInfo", 'promotion_product', 'promotion_product_group', 'promotion_product_detail']

  const handleContainerChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("container")
    } else {
      params.set("container", value)
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string
    setSearchQuery(query)
  }

  const handleRefresh = () => {
    refetch()
    toast({
      title: "Refreshed",
      description: "Custom objects have been refreshed.",
    })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handleSelectObject = (obj: CustomObject) => {
    setSelectedObject(obj)
  }

  // Show error state if query fails
  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading custom objects</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "An unknown error occurred"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Custom Objects</h1>
            <p className="text-muted-foreground">
              Store arbitrary JSON-formatted data that doesn't fit the standard data model.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={container || "all"} onValueChange={handleContainerChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Containers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Containers</SelectItem>
                  {containers.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <Input
                type="search"
                name="query"
                placeholder="Search by key..."
                className="w-full sm:w-[300px]"
                defaultValue={searchQuery}
              />
            </form>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="json">JSON View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              <CustomObjectsTable
                data={data?.results || []}
                isLoading={isLoading}
                totalCount={data?.total || 0}
                pageSize={limit}
                currentPage={page}
                onPageChange={handlePageChange}
                onSelectObject={handleSelectObject}
              />
            </TabsContent>

            <TabsContent value="json" className="mt-4">
              <div className="rounded-md border p-4 bg-muted/50">
                <pre className="text-xs overflow-auto max-h-[500px]">
                  {JSON.stringify(data?.results || [], null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedObject && <CustomObjectDetails customObject={selectedObject} onClose={() => setSelectedObject(null)} />}
    </div>
  )
}
