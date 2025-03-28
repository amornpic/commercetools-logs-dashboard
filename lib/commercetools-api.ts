"use server"

// Types based on commercetools API
export interface Deployment {
  id: string
  version: number
  status: string
  key: string
  preview: boolean
  type: string
  deployedRegion: string
  applications: Application[]
  connector: Connector
}


export interface Connector {
  id: string
  key: string
  version: string
  name: string
}


export interface Application {
  applicationName: string
  id: string
  schedule?: string
  topic?: string
  url?: string
}


export interface DeploymentLog {
  type: "HTTP_REQUEST" | "APPLICATION_TEXT" | "APPLICATION_JSON"
  deploymentId: string
  applicationName: string
  severity: "DEFAULT" | "INFO" | "WARNING" | "ERROR"
  timestamp: string
  details: {
    message?: string
    [key: string]: any
  }
}

export interface Configuration {
  key: string
  value: string
}

export interface DeploymentApplication {
  id: string
  applicationName: string
  schedule?: string
  topic?: string
  url?: string
  standardConfiguration: Configuration[]
  securedConfiguration: Configuration[]
}

export interface DeploymentDetails {
  id: string
  key: string
  version: number
  type: string
  connector: {
    id: string
    key: string
    version: number
    name: string
    description: string
    creator: {
      email: string
    }
    repository: {
      url: string
      tag: string
    }
    configurations: any[]
    supportedRegions: string[]
    certified: boolean
  }
  deployedRegion: string
  applications: DeploymentApplication[]
  details: {
    build: {
      id: string
      report: any
    }
  }
  preview: boolean
  status: string
}

export interface DeploymentQueryParams {
  key?: string
  limit?: number
}

export interface DeploymentLogQueryParams {
  key: string
  applicationName?: string
  pageToken?: string
  startDate?: string
  endDate?: string
}

export interface DeploymentLogResponse {
  data: DeploymentLog[]
  next: string | null
  results?: DeploymentLog[] // Make optional to match new format
  total?: number // Make optional to match new format
  offset?: number // Make optional to match new format
  limit?: number // Make optional to match new format
}

// Configuration
const API_URL = process.env.CTP_API_URL || "https://api.europe-west1.gcp.commercetools.com"
const PROJECT_KEY = process.env.CTP_PROJECT_KEY || "your-project-key"
const CLIENT_ID = process.env.CTP_CLIENT_ID
const CLIENT_SECRET = process.env.CTP_CLIENT_SECRET
const SCOPES = process.env.CTP_SCOPES || "manage_project:your-project-key"
const CTP_REGION = process.env.CTP_REGION

// Authentication
let tokenCache: {
  accessToken: string
  expiresAt: number
} | null = null

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken
  }

  // Get a new token
  const authUrl = `${API_URL.replace("api", "auth")}/oauth/token`
  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: SCOPES,
    }),
  })

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`)
  }

  const data = await response.json()

  // Cache the token
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute for safety
  }

  return tokenCache.accessToken
}

// API Functions
export async function fetchDeployments(params: DeploymentQueryParams = {}) {
  try {
    const token = await getAccessToken()

    // Build query parameters
    const queryParams = new URLSearchParams()

    // if (params.limit) queryParams.append("limit", params.limit.toString())
    // if (params.offset) queryParams.append("offset", params.offset.toString())

    // if (params.sort && params.sort.length > 0) {
    //   params.sort.forEach((sort) => queryParams.append("sort", sort))
    // }

    // if (params.filter && params.filter.length > 0) {
    //   params.filter.forEach((filter) => queryParams.append("filter", filter))
    // }

    console.log('params', params);
    

    // if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.key) queryParams.append("key", params.key)

    // Make the API request
    const url = `https://connect.${CTP_REGION}.commercetools.com/${PROJECT_KEY}/deployments/${queryParams.toString()}?limit=${params.limit}`
    console.log('url', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    // console.log('data', data);
    
    return data
  } catch (error) {
    console.error("Error fetching deployment logs:", error)

    // Return mock data for development/demo purposes
    return {
      results: [],
      total: 0,
      offset: 0,
      limit: 0,
    }
  }
}


export async function fetchDeploymentLogs(params: DeploymentLogQueryParams): Promise<DeploymentLogResponse> {
  try {
    const token = await getAccessToken()

    // Build query parameters
    const queryParams = new URLSearchParams()

    if (params.applicationName) queryParams.append("applicationName", params.applicationName)
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)
    if (params.pageToken) queryParams.append("pageToken", params.pageToken)

    console.log('params', params);
    
    // Make the API request
    const url = `https://connect.${CTP_REGION}.commercetools.com/${PROJECT_KEY}/deployments/key=${params.key}/logs?${queryParams.toString()}`
    console.log('url', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    // console.log('data', data);
    

    return data
  } catch (error) {
    console.error("Error fetching deployment logs:", error)

    // Return mock data for development/demo purposes
    return {
      data: [],
      next: null,
    }
  }
}

export async function fetchDeploymentLogStats(): Promise<{
  totalLogs: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  avgResponseTime: number
  lastUpdated: string
}> {
  try {
    const token = await getAccessToken()

    // This endpoint is hypothetical - you would need to implement or use an actual analytics endpoint
    const url = `${API_URL}/${PROJECT_KEY}/deployment-logs/stats`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching deployment log stats:", error)

    // Return mock stats for development/demo purposes
    return {
      totalLogs: 1254,
      byType: {
        httpRequest: 623,
        applicationText: 412,
        applicationJson: 219,
      },
      bySeverity: {
        default: 845,
        info: 312,
        warning: 76,
        error: 21,
      },
      avgResponseTime: 87, // ms
      lastUpdated: "2 minutes ago",
    }
  }
}
