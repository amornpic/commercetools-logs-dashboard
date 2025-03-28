"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Search } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

import { getDeployments } from "@/app/actions"
import type { Deployment, DeploymentQueryParams } from "@/lib/commercetools-api"
import { DeploymentsTable } from "./deployments-table"
import { Input } from "./ui/input"

export function Deployments() {
  const [loading, setLoading] = useState(true)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [totalDeployments, setTotalDeployments] = useState(0)

  const searchParams = useSearchParams()
  const router = useRouter()

  const limit = Number.parseInt(searchParams.get("limit") || "100", 10)

  const fetchLogs = useCallback(async () => {
    setLoading(true)

    try {
      const params: DeploymentQueryParams = {
        limit: limit,
      }

      const response = await getDeployments(params)
      setDeployments(response.results)
      setTotalDeployments(response.total)
    } catch (error) {
      console.error("Error fetching deployments:", error)
      toast({
        title: "Error fetching deployments",
        description: "There was a problem fetching the deployment logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string

    const params = new URLSearchParams(searchParams)
    params.set("q", query)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
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
          <h1 className="text-lg font-semibold">Deployments ({totalDeployments})</h1>
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
              </div>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <DeploymentsTable deployments={deployments}/>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

