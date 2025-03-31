import { AlertCircle, AlertTriangle, CheckCircle, Info, BellRing, Bug, Zap, Siren, Ban } from "lucide-react"
import { Badge } from "./badge"
import { Severity } from "@/types"

interface SeverityBadgeProps {
  severity: Severity
}

export const SeverityBadge = ({severity}: SeverityBadgeProps) => {
    switch (severity) {
      case "ERROR":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        )
      case "WARNING":
        return (
          <Badge variant="warning" className="gap-1 bg-yellow-500 hover:bg-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        )
      case "INFO":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Info
          </Badge>
        )
      case "DEBUG":
        return (
          <Badge variant="outline" className="gap-1 bg-blue-100 hover:bg-blue-200 text-blue-800">
            <Bug className="h-3 w-3" />
            Debug
          </Badge>
        )
      case "NOTICE":
        return (
          <Badge variant="outline" className="gap-1 bg-green-100 hover:bg-green-200 text-green-800">
            <Info className="h-3 w-3" />
            Notice
          </Badge>
        )
      case "CRITICAL":
        return (
          <Badge variant="outline" className="gap-1 bg-red-700 hover:bg-red-800 text-white">
            <Zap className="h-3 w-3" />
            Critical
          </Badge>
        )
      case "ALERT":
        return (
          <Badge variant="outline" className="gap-1 bg-purple-600 hover:bg-purple-700 text-white">
            <BellRing className="h-3 w-3" />
            Alert
          </Badge>
        )
      case "EMERGENCY":
        return (
          <Badge variant="outline" className="gap-1 bg-black hover:bg-gray-900 text-white">
            <Siren className="h-3 w-3" />
            Emergency
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            Default
          </Badge>
        )
    }
  }