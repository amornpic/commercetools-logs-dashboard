"use server"

import { Severity } from "@/types"

// Types based on commercetools API
export interface Deployment {
  id: string
  version: number
  status: string
  key: string
  preview: boolean
  type: string
  deployedRegion: string
  connector: Connector
  applications: DeploymentApplication[]
  details: {
    build: {
      id: string
      report: any
    }
  }
}


export interface Connector {
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
  severity: Severity
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

export interface DeploymentQueryParams {
  key?: string
  limit?: number
}

export interface DeploymentsResponse {
  results: Deployment[]
  total: number
  offset: number
  limit: number
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
const API_URL = process.env.CT_API_URL || "https://api.europe-west1.gcp.commercetools.com"
const PROJECT_KEY = process.env.CT_PROJECT_KEY || "your-project-key"
const CLIENT_ID = process.env.CT_CLIENT_ID
const CLIENT_SECRET = process.env.CT_CLIENT_SECRET
const SCOPES = process.env.CT_SCOPES || "manage_project:your-project-key"
const CT_REGION = process.env.CT_REGION

// Authentication
let tokenCache: {
  accessToken: string
  expiresAt: number
} | null = null

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    // console.log('getAccessToken cached');
    return tokenCache.accessToken
  }
  // console.log('getAccessToken not cached');

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

const BASE_CONNECT_URL = `https://connect.${CT_REGION}.commercetools.com/${PROJECT_KEY}`
const BASE_API_URL = `https://api.${CT_REGION}.commercetools.com/${PROJECT_KEY}`

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiFetchConnect = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const token = await getAccessToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_CONNECT_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    console.log('response', response);
    
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

export const apiFetch = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const token = await getAccessToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    console.log('response', response);
    
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

// API Functions
export async function fetchDeployments(params: DeploymentQueryParams = {}): Promise<DeploymentsResponse> {
  try {
    const queryParams = new URLSearchParams()

    if (params.key) queryParams.append("key", params.key)

    const data = await apiFetchConnect<DeploymentsResponse>(`/deployments/${queryParams.toString()}?limit=${params.limit}`)
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
    const queryParams = new URLSearchParams()

    if (params.applicationName) queryParams.append("applicationName", params.applicationName)
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)
    if (params.pageToken) queryParams.append("pageToken", params.pageToken)

    const data = await apiFetchConnect<DeploymentLogResponse>(`/deployments/key=${params.key}/logs?${queryParams.toString()}`)
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

export interface CustomObject {
  id: string
  version: number
  container: string
  key: string
  value: any
  createdAt: string
  lastModifiedAt: string
}

export interface CustomObjectDraft {
  container: string
  key: string
  value: any
}

export interface CustomObjectPagedQueryResponse {
  limit: number
  offset: number
  count: number
  total: number
  results: CustomObject[]
}

export interface CustomObjectQueryParams {
  limit?: number
  offset?: number
  container?: string
  key?: string
  where?: string[]
  sort?: string[]
}

// Function to fetch custom objects with filtering and pagination
export async function fetchCustomObjects(
  params: CustomObjectQueryParams = {},
): Promise<CustomObjectPagedQueryResponse> {
  try {
    let url = `/custom-objects/${params.container}`

    if (params.key) url += `/${params.key}`
    // console.log('url', url);

    const data = await apiFetch<CustomObjectPagedQueryResponse>(url)
    // console.log('data', data);

    if (data.hasOwnProperty("id")) {
      return {
        results: [data],
        total: 1,
        offset: 0,
        limit: 0,
        count: 0,
      }
    }

    return data
  } catch (error) {
    console.error("Error fetching deployment logs:", error)

    // Return mock data for development/demo purposes
    return {
      results: [],
      total: 0,
      offset: 0,
      limit: 0,
      count: 0,
    }
  }
}
