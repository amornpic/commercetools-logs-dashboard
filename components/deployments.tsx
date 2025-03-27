"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Download, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeploymentLogsTable } from "@/components/deployment-logs-table"
import { DeploymentLogDetails } from "@/components/deployment-log-details"
import { DeploymentLogStats } from "@/components/deployment-log-stats"
import { DateRangePicker } from "@/components/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

import { getDeploymentLogs, getDeployments } from "@/app/actions"
import type { DeploymentLog, DeploymentLogQueryParams, Deployment } from "@/lib/commercetools-api"
import { DeploymentsTable } from "./deployments-table"

export function Deployments() {
  const [selectedLog, setSelectedLog] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<DeploymentLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const searchParams = useSearchParams()
  const router = useRouter()

  const logType = searchParams.get("type") || "all"
  const severity = searchParams.get("severity") || "all"
  const searchQuery = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10)

  const fetchLogs = useCallback(async () => {
    setLoading(true)

    try {
      const params: DeploymentLogQueryParams = {
        limit,
        offset: (page - 1) * limit,
        sort: ["-timestamp"],
      }

      // Add filters
      const filters = []

      if (logType !== "all") {
        filters.push(`type="${logType}"`)
      }

      if (severity !== "all") {
        filters.push(`severity="${severity}"`)
      }

      if (searchQuery) {
        filters.push(`details.message="${searchQuery}*"`)
      }

      if (filters.length > 0) {
        params.filter = filters
      }

      // Add date range if available
      if (dateRange.from) {
        params.startDate = dateRange.from.toISOString()
      }

      if (dateRange.to) {
        params.endDate = dateRange.to.toISOString()
      }

      const response = await getDeployments(params)
      setLogs(response.results)
      setTotalLogs(response.total)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error fetching logs",
        description: "There was a problem fetching the deployment logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [logType, severity, searchQuery, page, limit, dateRange])

  useEffect(() => {
    console.log(logs)
  }, [logs])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", value)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleSeverityChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("severity", value)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string

    const params = new URLSearchParams(searchParams)
    params.set("q", query)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
  }

  const handleRefresh = () => {
    fetchLogs()
    toast({
      title: "Refreshed",
      description: "Deployment logs have been refreshed.",
    })
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Deployments</h1>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {/* <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button> */}
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          {/* <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Deployment Logs</h1>
              <p className="text-muted-foreground">
                Monitor and analyze logs from your commercetools Connect deployments.
              </p>
            </div>
            <DateRangePicker onChange={handleDateRangeChange} />
          </div> */}

          {/* <DeploymentLogStats /> */}

          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Select value={logType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Log Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="HTTP_REQUEST">HTTP Request</SelectItem>
                    <SelectItem value="APPLICATION_TEXT">Application Text</SelectItem>
                    <SelectItem value="APPLICATION_JSON">Application JSON</SelectItem>
                  </SelectContent>
                </Select> */}
                {/* <Select value={severity} onValueChange={handleSeverityChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="DEFAULT">Default</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select> */}
                {/* <Button variant="outline" size="icon" className="h-9 w-9">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">More filters</span>
                </Button> */}
              </div>
              {/* <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="query"
                  placeholder="Search logs..."
                  className="w-full sm:w-[300px] pl-8"
                  defaultValue={searchQuery}
                />
              </form> */}
            </div>

            <Tabs defaultValue="table" className="w-full">
              {/* <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="json">JSON View</TabsTrigger>
              </TabsList> */}
              <TabsContent value="table" className="mt-4">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <DeploymentsTable
                    deployments={logs}
                    onSelectLog={setSelectedLog}
                    totalLogs={totalLogs}
                    currentPage={page}
                    pageSize={limit}
                  />
                )}
              </TabsContent>
              <TabsContent value="json" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    {loading ? (
                      <Skeleton className="h-[500px] w-full" />
                    ) : (
                      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                        {JSON.stringify(logs, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* {selectedLog && <DeploymentLogDetails log={selectedLog} onClose={() => setSelectedLog(null)} />} */}
    </div>
  )
}

