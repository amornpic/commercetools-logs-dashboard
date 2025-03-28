"use client"

import Link from "next/link"
import {
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Copy,
  ExternalLink,
  Globe,
  Info,
  Tag,
  Terminal,
  XCircle,
} from "lucide-react"
import type { DeploymentDetails, DeploymentApplication } from "@/lib/commercetools-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface DeploymentDetailProps {
  deployment: DeploymentDetails
}

export function DeploymentDetail({ deployment }: DeploymentDetailProps) {
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: message,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "deployed":
        return (
          <Badge variant="success" className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3" />
            {status}
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {status}
          </Badge>
        )
      case "deploying":
        return (
          <Badge variant="outline" className="gap-1 bg-blue-500 text-white hover:bg-blue-600">
            <Clock className="h-3 w-3 animate-spin" />
            {status}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            {status}
          </Badge>
        )
    }
  }

  const getApplicationIcon = (app: DeploymentApplication) => {
    if (app.url) return <Globe className="h-4 w-4" />
    if (app.topic) return <Terminal className="h-4 w-4" />
    if (app.schedule) return <Calendar className="h-4 w-4" />
    return <Code className="h-4 w-4" />
  }

  const getApplicationType = (app: DeploymentApplication) => {
    if (app.url) return "Service"
    if (app.topic) return "Event"
    if (app.schedule) return "Job"
    return "Application"
  }

  return (
    <div className="container py-6">
      <div className="space-y-6">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{deployment.connector.name}</h1>
              {getStatusBadge(deployment.status)}
              {deployment.preview && (
                <Badge variant="outline" className="gap-1">
                  Preview
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{deployment.connector.description}</p>
          </div>
          <Button asChild>
            <Link href={`/deployments/${deployment.key}/logs`}>View Logs</Link>
          </Button>
        </div>
      </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deployment Information</CardTitle>
            </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID</p>
                      <div className="flex items-center gap-1">
                        <p className="font-mono text-sm truncate">{deployment.id}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(deployment.id, "Deployment ID copied")}
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy ID</span>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Key</p>
                      <p className="font-mono text-sm">{deployment.key}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-sm capitalize">{deployment.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Version</p>
                      <p className="text-sm">{deployment.version}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deployed Region</p>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{deployment.deployedRegion}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Supported Regions</p>
                    <div className="flex items-center gap-1">
                      <div className="flex flex-wrap gap-2">
                        {deployment.connector.supportedRegions.map((region) => (
                          <Badge key={region} variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" />
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connector Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{deployment.connector.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Creator</p>
                    <p className="text-sm">{deployment.connector.creator.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Repository</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs truncate">{deployment.connector.repository.url}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(deployment.connector.repository.url, "Repository URL copied")}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy URL</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tag</p>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{deployment.connector.repository.tag}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applications ({deployment.applications.length})</CardTitle>
                <CardDescription>Applications deployed as part of this connector</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {deployment.applications.map((app) => (
                    <AccordionItem key={app.id} value={app.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          {getApplicationIcon(app)}
                          <span className="font-medium">{app.applicationName}</span>
                          <Badge variant="outline" className="ml-2">
                            {getApplicationType(app)}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">ID</p>
                            <div className="flex items-center gap-1">
                              <p className="font-mono text-xs truncate">{app.id}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(app.id, "Application ID copied")}
                              >
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy ID</span>
                              </Button>
                            </div>
                          </div>

                          {app.url && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">URL</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs truncate">{app.url}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(app.url, "URL copied")}
                                >
                                  <Copy className="h-3 w-3" />
                                  <span className="sr-only">Copy URL</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                  <a href={app.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="sr-only">Open URL</span>
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}

                          {app.topic && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Topic</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs truncate">{app.topic}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(app.topic, "Topic copied")}
                                >
                                  <Copy className="h-3 w-3" />
                                  <span className="sr-only">Copy Topic</span>
                                </Button>
                              </div>
                            </div>
                          )}

                          {app.schedule && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Schedule (Cron)</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs">{app.schedule}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(app.schedule, "Schedule copied")}
                                >
                                  <Copy className="h-3 w-3" />
                                  <span className="sr-only">Copy Schedule</span>
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Standard Configuration</p>
                              <Table >
                                <TableHeader>
                                  <TableRow className="h-4">
                                    <TableHead>Key</TableHead>
                                    <TableHead>Value</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-auto max-h-[200px]">
                                  {app.standardConfiguration.length > 0 ? (
                                    app.standardConfiguration.map((config) => (
                                      <TableRow key={config.key} className="text-sm">
                                        <TableCell>{config.key}</TableCell>
                                        <TableCell>{config.value}</TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell className="h-24 text-center">
                                      No standard configuration
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Secured Configuration</p>
                              <Table >
                                <TableHeader>
                                  <TableRow className="h-4">
                                    <TableHead>Key</TableHead>
                                    <TableHead>Value</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-auto max-h-[200px]">
                                  {app.securedConfiguration.length > 0 ? (
                                    app.securedConfiguration.map((config) => (
                                      <TableRow key={config.key} className="text-sm">
                                        <TableCell>{config.key}</TableCell>
                                        <TableCell>{config.value}</TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell className="h-24 text-center">
                                      No secured configuration
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connector Configurations</CardTitle>
                <CardDescription>Global configurations for the connector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-xs font-mono overflow-auto max-h-[400px]">
                    {JSON.stringify(deployment.connector.configurations, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Build Information</CardTitle>
                <CardDescription>Details about the build process</CardDescription>
              </CardHeader>
              <CardContent>
                {deployment.details.build ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Build ID</p>
                      <div className="flex items-center gap-1">
                        <p className="font-mono text-sm truncate">{deployment.details.build.id}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(deployment.details.build.id, "Build ID copied")}
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy ID</span>
                        </Button>
                      </div>
                    </div>

                    {deployment.details.build.report && (
                      <div className="bg-muted rounded-md p-4">
                        <pre className="text-xs font-mono overflow-auto max-h-[400px]">
                          {JSON.stringify(deployment.details.build.report, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Build Information</h3>
                    <p className="text-sm text-muted-foreground">
                      No build information is available for this deployment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </div>
  )
}

