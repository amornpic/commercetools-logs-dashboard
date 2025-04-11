"use client"

import { X, Copy, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

import type { CustomObject } from "@/lib/commercetools-api"
import dayjs from "dayjs"

interface CustomObjectDetailsProps {
  customObject: CustomObject
  onClose: () => void
}

export function CustomObjectDetails({ customObject, onClose }: CustomObjectDetailsProps) {

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YY HH:mm:ss')
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: message,
    })
  }

  return (
    <Dialog open={!!customObject} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Custom Object Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <div className="flex items-center gap-1">
                <p className="font-mono text-sm truncate">{customObject.id}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(customObject.id, "ID copied")}
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy ID</span>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
              <p className="font-mono text-sm">{customObject.version}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Container</h3>
              <p className="font-mono text-sm">{customObject.container}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Key</h3>
              <p className="font-mono text-sm">{customObject.key}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p className="text-sm">{formatDate(customObject.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Modified At</h3>
              <p className="text-sm">{formatDate(customObject.lastModifiedAt)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Value</h3>
            <Tabs defaultValue="formatted">
              <TabsList>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="mt-2">
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {JSON.stringify(customObject.value, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="raw" className="mt-2">
                <pre className="bg-muted rounded-md p-4 overflow-auto max-h-[300px] text-xs font-mono">
                  {JSON.stringify(customObject.value)}
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                copyToClipboard(JSON.stringify(customObject, null, 2), "Custom object copied to clipboard")
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy as JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
