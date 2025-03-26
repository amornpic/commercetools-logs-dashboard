"use client"

import { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, BarChart3, CheckCircle, Clock, Code, FileText, Globe, Info } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getDeploymentLogStats } from "@/app/actions"

export function DeploymentLogStats() {
  const [stats, setStats] = useState<{
    totalLogs: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    avgResponseTime: number
    lastUpdated: string
  } | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDeploymentLogStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3 inline" />
            Updated {stats.lastUpdated}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Type</CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="mr-1 h-3 w-3 text-primary" />
                <span className="text-xs">HTTP Request</span>
              </div>
              <span className="text-xs font-medium">{stats.byType.httpRequest}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-1 h-3 w-3 text-primary" />
                <span className="text-xs">Application Text</span>
              </div>
              <span className="text-xs font-medium">{stats.byType.applicationText}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Code className="mr-1 h-3 w-3 text-primary" />
                <span className="text-xs">Application JSON</span>
              </div>
              <span className="text-xs font-medium">{stats.byType.applicationJson}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Severity</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs">Default</span>
              </div>
              <span className="text-xs font-medium">{stats.bySeverity.default}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="mr-1 h-3 w-3 text-blue-500" />
                <span className="text-xs">Info</span>
              </div>
              <span className="text-xs font-medium">{stats.bySeverity.info}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />
                <span className="text-xs">Warning</span>
              </div>
              <span className="text-xs font-medium">{stats.bySeverity.warning}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-xs">Error</span>
              </div>
              <span className="text-xs font-medium">{stats.bySeverity.error}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgResponseTime} ms</div>
          <p className="text-xs text-muted-foreground">For HTTP requests</p>
        </CardContent>
      </Card>
    </div>
  )
}

