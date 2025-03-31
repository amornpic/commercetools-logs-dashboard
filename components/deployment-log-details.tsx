"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SeverityBadge } from "./ui/severity-badge"
import dayjs from "dayjs"
import { DeploymentLog } from "@/lib/commercetools-api"

interface DeploymentLogDetailsProps {
  log: DeploymentLog
  onClose: () => void
}

export function DeploymentLogDetails({ log, onClose }: DeploymentLogDetailsProps) {
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YY HH:mm:ss')
  }

  function formatJson(jsonString: any): string {
    try {
      if (typeof jsonString === "string") {
        // Check if input is a valid JSON string
        const parsedJson = JSON.parse(jsonString);
        return JSON.stringify(parsedJson, null, 2); // Format JSON
      } else if (typeof jsonString === "object" && jsonString !== null) {
        // Already a JSON object
        return JSON.stringify(jsonString, null, 2); // Format JSON
      } else {
        return String(jsonString); // Convert plain string or other types to string
      }
    } catch (error) {
      return jsonString; // Return original input if JSON parsing fails
    }
  }

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Deployment Log Details
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
              <SeverityBadge severity={log.severity} />
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
                  {log.type === "HTTP_REQUEST" && log.details.requestMethod && (
                    <div className="grid gap-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Method:</span>
                          <p className="font-mono">{log.details.requestMethod}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Status Code:</span>
                          <p className="font-mono">{log.details.status}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Path:</span>
                        <p className="font-mono">{log.details.requestUrl}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">User Agent:</span>
                        <p className="font-mono">{log.details.userAgent}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Remote IP:</span>
                          <p className="font-mono">{log.details.remoteIp}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Server IP:</span>
                          <p className="font-mono">{log.details.serverIp}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {log.details.message && log.type !== "HTTP_REQUEST" && log.type !== "APPLICATION_JSON" && (
                    <div>
                      <p className="font-mono whitespace-pre-wrap">{log.details.message}</p>
                    </div>
                  )}

                  {log.details.payload && log.type !== "HTTP_REQUEST" && (
                    <>
                      {Object.entries(log.details.payload).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-xs text-muted-foreground">{key}:</span>
                          <p className="text-xs font-mono whitespace-pre-wrap">
                            {formatJson(value)}
                          </p>
                        </div>
                      ))}
                    </>
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

