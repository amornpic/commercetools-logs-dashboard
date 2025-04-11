"use client"
import { MoreHorizontal, Eye, Trash2, Edit, Copy, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import type { CustomObject } from "@/lib/commercetools-api"
import dayjs from "dayjs"

interface CustomObjectsTableProps {
  data: CustomObject[]
  isLoading: boolean
  totalCount: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  onSelectObject: (obj: CustomObject) => void
}

export function CustomObjectsTable({
  data,
  isLoading,
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onSelectObject,
}: CustomObjectsTableProps) {

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YY HH:mm:ss')
  }

  const formatValue = (value: any) => {
    if (typeof value === "object") {
      return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? "..." : "")
    }
    return String(value).substring(0, 50) + (String(value).length > 50 ? "..." : "")
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Container</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No custom objects found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((obj) => (
                <TableRow
                  key={`${obj.container}-${obj.key}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectObject(obj)}
                >
                  <TableCell className="font-medium">{obj.container}</TableCell>
                  <TableCell className="font-mono text-xs">{obj.key}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[300px]">{formatValue(obj.value)}</TableCell>
                  <TableCell className="text-center">{obj.version}</TableCell>
                  <TableCell className="text-sm">{formatDate(obj.lastModifiedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectObject(obj)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
                            toast({
                              title: "Copied to clipboard",
                              description: "Custom object copied to clipboard as JSON",
                            })
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy as JSON
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

      {/* Simple pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
