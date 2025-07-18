"use server"

import { Severity } from "@/types"
import { cookies } from 'next/headers';

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

// Handle multiple project keys
const PROJECT_KEYS = (process.env.NEXT_PUBLIC_CT_PROJECT_KEYS || "your-project-key,your-project-key-2").split(",")
const CLIENT_IDS = (process.env.CT_CLIENT_IDS || "your-client-id,your-client-id-2").split(",")
const CLIENT_SECRETS = (process.env.CT_CLIENT_SECRETS || "your-client-secret,your-client-secret-2").split(",")
const SCOPES = (process.env.CT_SCOPES || "view_connectors_deployments view_products").split(" ")
const CT_REGION = process.env.CT_REGION

// Authentication
let tokenCache: {
  accessToken: string
  expiresAt: number
} | null = null

// Get current project key
const getProjectKey = async () => {
  const cookieStore = await cookies();
  const activeProjectKey = cookieStore.get('activeProjectKey')?.value;
  // console.log('activeProjectKey', activeProjectKey);
  if (!activeProjectKey) {
    throw new Error('No active project key found')
  }
  
  return activeProjectKey as string
}

// Set current environment
export const setActiveProjectKey = async (projectKey: string) => {
  const cookieStore = await cookies()
  cookieStore.set('activeProjectKey', projectKey);
  tokenCache = null
}

async function getAccessToken(projectKey: string): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    // console.log('getAccessToken cached');
    return tokenCache.accessToken
  }
  const projectKeyIndex = PROJECT_KEYS.indexOf(projectKey)
  const clientId = CLIENT_IDS[projectKeyIndex]
  const clientSecret = CLIENT_SECRETS[projectKeyIndex]
  const scope = SCOPES.join(`:${projectKey} `) + `:${projectKey}`

  // console.log('clientId', clientId);
  // console.log('clientSecret', clientSecret);
  // console.log('scope', scope);

  if (!clientId || !clientSecret || !scope) {
    throw new Error('No client id or secret or scope found for project key')
  }

  // console.log('getAccessToken not cached');

  // Get a new token
  const authUrl = `${API_URL.replace("api", "auth")}/oauth/token`
  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: scope,
    }),
  })

  if (!response.ok) {
    // console.log('response', response);
    
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

const getBaseConnectUrl = (projectKey: string) => `https://connect.${CT_REGION}.commercetools.com/${projectKey}`
const getBaseApiUrl = (projectKey: string) => `https://api.${CT_REGION}.commercetools.com/${projectKey}`

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiFetchConnect = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const projectKey = await getProjectKey();
  const token = await getAccessToken(projectKey);
  const baseUrl = getBaseConnectUrl(projectKey);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
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
  const projectKey = await getProjectKey()
  const token = await getAccessToken(projectKey);
  const baseApiUrl = getBaseApiUrl(projectKey);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${baseApiUrl}${endpoint}`, {
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
export async function fetchDeployments(params: DeploymentQueryParams = {}): Promise<Deployment | null> {
  try {
    const queryParams = new URLSearchParams()

    if (params.key) queryParams.append("key", params.key)

    const data = await apiFetchConnect<Deployment>(`/deployments/${queryParams.toString()}?limit=${params.limit}`)
    console.log('fetchDeployments', data);
    
    return data
  } catch (error) {
    console.error("Error fetching deployment logs:", error)

    // Return mock data for development/demo purposes
    return null
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
    // console.log('params', params);

    // const queryParams = new URLSearchParams()
    if (params.key) url += `/${params.key}`
    // if (params.sort) {
    //   queryParams.append("sort", 'lastModifiedAt+desc')
    // }
    // if (params.where) {
    //   queryParams.append("where", params.where[0])
    // }

    // console.log('url', url);

    const data = await apiFetch<CustomObjectPagedQueryResponse>(url + `?sort=lastModifiedAt+desc`)
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
