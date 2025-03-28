"use server"

import {
  fetchDeploymentLogs,
  fetchDeploymentLogStats,
  type DeploymentLogQueryParams,
  fetchDeployments,
  DeploymentQueryParams,
} from "@/lib/commercetools-api"

export async function getDeployments(params: DeploymentQueryParams) {
  return fetchDeployments(params)
}

export async function getDeploymentLogs(params: DeploymentLogQueryParams) {
  return fetchDeploymentLogs(params)
}


export async function getDeploymentLogStats() {
  return fetchDeploymentLogStats()
}

