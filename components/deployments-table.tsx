"use client"

import { useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Code,
  FileText,
  Globe,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

import type { Deployment } from "@/lib/commercetools-api"

interface DeploymentsTableProps {
  deployments: Deployment[]
  onSelectLog: (log: Deployment) => void
  totalLogs: number
  currentPage: number
  pageSize: number
}

export function DeploymentsTable({  deployments, onSelectLog, totalLogs, currentPage, pageSize }: DeploymentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalLogs / pageSize)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead className="w-[100px]">
ID
              </TableHead>
              <TableHead className="w-[100px]">
                  Type
              </TableHead>
              <TableHead>
                  key
              </TableHead>
              <TableHead>
                  deployedRegion
              </TableHead>
              <TableHead className="w-[250px]">
                  version
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              deployments.map((deployment, index) => (
                <TableRow
                  key={`${deployment.id}-${index}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectLog(deployment)}
                >
                  <TableCell>{deployment.id}</TableCell>
                  <TableCell>{deployment.type}</TableCell>
                  <TableCell>{deployment.key}</TableCell>
                  <TableCell>{deployment.deployedRegion}</TableCell>
                  <TableCell>{deployment.version}</TableCell>
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
                            onSelectLog(deployment)
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

      {/* {totalPages > 1 && (
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
      )} */}
    </div>
  )
}

