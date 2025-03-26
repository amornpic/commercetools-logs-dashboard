"use client"

import { X } from "lucide-react"
import type { DeploymentLog } from "@/components/deployment-logs-dashboard"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface DeploymentLogDetailsProps {
  log: DeploymentLog
  onClose: () => void
}

export function DeploymentLogDetails({ log, onClose }: DeploymentLogDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "ERROR":
        return "text-red-500"
      case "WARNING":
        return "text-yellow-500"
      case "INFO":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Deployment Log Details</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Deployment ID</h3>
              <p className="font-mono text-sm">{log.deploymentId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Application</h3>
              <p>{log.applicationName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <Badge variant="outline">{log.type}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Severity</h3>
              <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
              <p>{formatDate(log.timestamp)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
            <Tabs defaultValue="formatted">
              <TabsList>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="mt-2">
                <div className="bg-muted rounded-md p-4">
                  {log.type === "HTTP_REQUEST" && log.details.method && (
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Method:</span>
                          <p className="font-mono">{log.details.method}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Status Code:</span>
                          <p className="font-mono">{log.details.statusCode}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Path:</span>
                        <p className="font-mono">{log.details.path}</p>
                      </div>
                      {log.details.duration && (
                        <div>
                          <span className="text-xs text-muted-foreground">Duration:</span>
                          <p className="font-mono">{log.details.duration}ms</p>
                        </div>
                      )}
                      {log.details.message && (
                        <div>
                          <span className="text-xs text-muted-foreground">Message:</span>
                          <p className="font-mono">{log.details.message}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {log.details.message && log.type !== "HTTP_REQUEST" && (
                    <div>
                      <p className="font-mono whitespace-pre-wrap">{log.details.message}</p>
                    </div>
                  )}

                  {!log.details.message && log.type !== "HTTP_REQUEST" && (
                    <div className="grid gap-2">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-xs text-muted-foreground">{key}:</span>
                          <p className="font-mono">
                            {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="raw" className="mt-2">
                <pre className="bg-muted rounded-md p-4 overflow-auto max-h-[300px] text-xs font-mono">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

