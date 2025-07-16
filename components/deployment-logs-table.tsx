"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Code,
  FileText,
  Globe,
  RefreshCw,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import type { DeploymentLog } from "@/lib/commercetools-api"
import { SeverityBadge } from "./ui/severity-badge"
import dayjs from "dayjs"

interface DeploymentLogsTableProps {
  logs: DeploymentLog[]
  onSelectLog: (log: DeploymentLog) => void
  totalLogs: number
  currentPage: number
  pageSize: number
  hideApplicationColumn?: boolean
  nextCursor?: string
  onLoadMore?: () => void
  isLoadingMore?: boolean
}

export function DeploymentLogsTable({ logs, onSelectLog, totalLogs, currentPage, pageSize, hideApplicationColumn = false, nextCursor, onLoadMore, isLoadingMore }: DeploymentLogsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof DeploymentLog>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalLogs / pageSize)

  const handleSort = (column: keyof DeploymentLog) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YY HH:mm:ss')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HTTP_REQUEST":
        return <Globe className="h-4 w-4" />
      case "APPLICATION_TEXT":
        return <FileText className="h-4 w-4" />
      case "APPLICATION_JSON":
        return <Code className="h-4 w-4" />
      default:
        return null
    }
  }

  const getMessagePreview = (details: any) => {
    // For HTTP requests without a message
    if (details.requestMethod && details.requestUrl) {
      return `${details.requestMethod} ${details.requestUrl} (${details.status})`
    }
    
    if (details.payload?.log) {
      try {
        const j = JSON.parse(details.payload.log)
        if (j.order_number) {
          if (j.msg) {
            return `${j.order_number} ${j.msg}`
          }
          if (j.response?.messageInfo) {
            return `${j.order_number} ${j.response?.messageInfo}`
          }
          if (j.response?.message) {
            return `${j.order_number} ${j.response?.message}`
          }
        }

        if (j.msg) {
            return j.msg
        }

        if (j.response?.data) {
          return JSON.stringify(j.response?.data)
        }
      } catch (error) {
        console.log('getMessagePreview error', error);
        // return details.payload.log
      }
    }

    if (details.message) {
      return details.message.length > 50 ? `${details.message.substring(0, 50)}...` : details.message
    }

    return JSON.stringify(details).substring(0, 50) + "..."
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("type")}
                  className="flex items-center gap-1 font-medium"
                >
                  Type
                  {sortColumn === "type" &&
                    (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </Button>
              </TableHead>
              {!hideApplicationColumn && (
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("applicationName")}
                    className="flex items-center gap-1 font-medium"
                  >
                    Application
                    {sortColumn === "applicationName" &&
                      (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </Button>
                </TableHead>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("severity")}
                  className="flex items-center gap-1 font-medium"
                >
                  Severity
                  {sortColumn === "severity" &&
                    (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("timestamp")}
                  className="flex items-center gap-1 font-medium"
                >
                  Timestamp
                  {sortColumn === "timestamp" &&
                    (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </Button>
              </TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow
                  key={`${log.deploymentId}-${index}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectLog(log)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="hidden sm:inline text-xs">{log.type.replace("_", " ")}</span>
                    </div>
                  </TableCell>
                  {!hideApplicationColumn && <TableCell>{log.applicationName}</TableCell>}
                  <TableCell><SeverityBadge severity={log.severity} /></TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[300px]">
                    {getMessagePreview(log.details)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectLog(log)
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!hideApplicationColumn && nextCursor && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore} className="gap-1">
          {isLoadingMore ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Load More
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) handlePageChange(currentPage - 1)
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(pageNum)
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(totalPages)
                    }}
                    isActive={currentPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) handlePageChange(currentPage + 1)
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

