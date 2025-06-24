"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Download, RefreshCw, Search, SlidersHorizontal, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeploymentLogsTable } from "@/components/deployment-logs-table"
import { DeploymentLogDetails } from "@/components/deployment-log-details"
import { DateRangePicker } from "@/components/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DeploymentApplication, DeploymentLog, DeploymentLogQueryParams } from "@/lib/commercetools-api"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Badge } from "./ui/badge"
import { useDeploymentDetails, useDeploymentLogs, useNextDeploymentLogs, useRefreshLogs } from "@/hooks/use-deployment-logs"

interface DeploymentLogsDashboardProps {
  deploymentKey: string 
}

// Update the component props to include initialDeploymentId
export function DeploymentLogsDashboard({ deploymentKey }: DeploymentLogsDashboardProps) {
  const [selectedLog, setSelectedLog] = useState<DeploymentLog | null>(null)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const searchParams = useSearchParams()
  const router = useRouter()

  const applicationName = searchParams.get("applicationName") || "all"
  const logType = searchParams.get("type") || "all"
  const severity = searchParams.get("severity") || "all"
  const searchQuery = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
  const [groupByApplication, setGroupByApplication] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [applications, setApplications] = useState<DeploymentApplication[]>([])

  const queryParamsDeployment = useMemo(() => {
    const params = {
      key: deploymentKey,
    }

    return params
  }, [deploymentKey])

  const { data: deploymentDetails, } = useDeploymentDetails(queryParamsDeployment)

  useEffect(() => {
    if (deploymentDetails) {
      setApplications(deploymentDetails.applications)
    }
  }, [deploymentDetails])

    const queryParams = useMemo(() => {
      const params: DeploymentLogQueryParams = {
        key: deploymentKey,
      }
  
      // Add date range if available
      if (dateRange.from) {
        params.startDate = dateRange.from.toISOString()
      }
  
      if (dateRange.to) {
        params.endDate = dateRange.to.toISOString()
      }

      if (applicationName !== "all") {
        params.applicationName = applicationName
      }
  
      return params
    }, [applicationName, dateRange])
  
    const { data, isLoading, isError, error } = useDeploymentLogs(queryParams)

    const { mutate: refreshLogs, isPending: isRefreshing } = useRefreshLogs()

    const { mutate: fetchNextPage, isPending: isLoadingMore } = useNextDeploymentLogs()

    const loading = isLoading || isRefreshing

    const handleLoadMore = () => {
      if (nextCursor) {
        fetchNextPage({ params: queryParams, pageToken: nextCursor })
      }
    }
  
    // Extract logs and next cursor from query data
    const logs = data?.data || data?.results || []
    const totalLogs = data?.total || logs.length
  
    useEffect(() => {
      if (data?.next) {
        setNextCursor(data.next)
      } else {
        setNextCursor(undefined)
      }
    }, [data])

  const filterLogs = useMemo(() => {
    return logs.filter(log => {
      if (logType !== "all" && log.type !== logType) return false
      if (severity !== "all" && log.severity !== severity) return false
      // if (searchQuery && log.details.message && !log.details.message.includes(searchQuery)) return false
      return true
    }).map((data) => {
      if (data.details.payload?.jsonMessage) {    
        try {
          JSON.parse(data.details.payload.jsonMessage)
          return data
        }
        catch (error) {
          data.details.payload.log =  data.details.payload?.message + data.details.payload?.jsonMessage
          delete data.details.payload.jsonMessage
          delete data.details.payload.message
        }
      }
      return data
    })
  }, [logs, logType, severity, searchQuery])

    // Get unique application names from logs for the filter
    const applicationNames = useMemo(() => {
      const names = new Set<string>()
      applications.forEach((app) => names.add(app.applicationName))
      return Array.from(names).sort()
    }, [applications])
  
    // Group logs by application name
    const groupedLogs = useMemo(() => {
      if (!groupByApplication) return { all: filterLogs }
  
      return filterLogs.reduce(
        (groups, log) => {
          const appName = log.applicationName
          if (!groups[appName]) {
            groups[appName] = []
          }
          groups[appName].push(log)
          return groups
        },
        {} as Record<string, DeploymentLog[]>,
      )
    }, [filterLogs, groupByApplication])

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", value)
    // params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleSeverityChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("severity", value)
    // params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleApplicationChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("applicationName", value)
    // params.set("page", "1")
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
    refreshLogs(queryParams)
    toast({
      title: "Refreshed",
      description: "Deployment logs have been refreshed.",
    })
  }

  const toggleGroupExpand = (appName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [appName]: !prev[appName],
    }))
  }

  const toggleGrouping = () => {
    setGroupByApplication((prev) => !prev)
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading logs</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "An unknown error occurred"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deployment Logs</h1>
            <p className="text-muted-foreground">
              Monitor and analyze logs from your commercetools Connect deployments.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <DateRangePicker onChange={handleDateRangeChange} />
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
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
              <Select value={applicationName} onValueChange={handleApplicationChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Application" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  {applicationNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                <Select value={logType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Log Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="HTTP_REQUEST">HTTP Request</SelectItem>
                    <SelectItem value="APPLICATION_TEXT">Application Text</SelectItem>
                    <SelectItem value="APPLICATION_JSON">Application JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severity} onValueChange={handleSeverityChange}>
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
                </Select>
                <Button variant="outline" size="sm" className="h-9 gap-1" onClick={toggleGrouping}>
                  {groupByApplication ? "Ungroup" : "Group by App"}
                </Button>
              </div>
              
            </div>

            <Tabs defaultValue="table" className="w-full">
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="json">JSON View</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : groupByApplication ? (
                <div className="space-y-4">
                  {Object.keys(groupedLogs).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No logs found matching your criteria.</div>
                  ) : (
                    Object.entries(groupedLogs).map(([appName, appLogs]) => (
                      <Collapsible
                        key={appName}
                        open={expandedGroups[appName]}
                        onOpenChange={() => toggleGroupExpand(appName)}
                        className="border rounded-md overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{appName}</span>
                            <Badge variant="outline" className="ml-2">
                              {logs.length} logs
                            </Badge>
                          </div>
                          {expandedGroups[appName] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <DeploymentLogsTable
                            logs={appLogs}
                            onSelectLog={setSelectedLog}
                            totalLogs={appLogs.length}
                            currentPage={1}
                            pageSize={appLogs.length}
                            hideApplicationColumn={true}
                            isLoadingMore={isLoadingMore}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  )}
                </div>
              ) : (
                <DeploymentLogsTable
                  logs={filterLogs}
                  onSelectLog={setSelectedLog}
                  totalLogs={totalLogs}
                  currentPage={page}
                  pageSize={limit}
                  hideApplicationColumn={false}
                  nextCursor={nextCursor}
                  onLoadMore={handleLoadMore}
                  isLoadingMore={isLoadingMore}
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

      {selectedLog && <DeploymentLogDetails log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}

