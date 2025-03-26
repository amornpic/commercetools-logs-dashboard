"use server"

import {
  fetchDeploymentLogs,
  fetchDeploymentLogById,
  fetchDeploymentLogStats,
  type DeploymentLogQueryParams,
} from "@/lib/commercetools-api"

export async function getDeploymentLogs(params: DeploymentLogQueryParams) {
  return fetchDeploymentLogs(params)
}

export async function getDeploymentLogById(deploymentId: string, logId: string) {
  return fetchDeploymentLogById(deploymentId, logId)
}

export async function getDeploymentLogStats() {
  return fetchDeploymentLogStats()
}

