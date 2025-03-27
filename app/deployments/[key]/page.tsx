import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getDeployments } from "@/app/actions"
import { DeploymentDetail } from "@/components/deployment-detail"
import { Skeleton } from "@/components/ui/skeleton"

interface DeploymentDetailPageProps {
  params: {
    key: string
  }
}

export default async function DeploymentDetailPage({ params }: DeploymentDetailPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<DeploymentDetailSkeleton />}>
        <DeploymentDetailView deploymentKey={params.key} />
      </Suspense>
    </main>
  )
}

async function DeploymentDetailView({ deploymentKey }: { deploymentKey: string }) {
  try {
    const deployment = await getDeployments({ key: deploymentKey })

    if (!deployment) {
      notFound()
    }

    return <DeploymentDetail deployment={deployment} />
  } catch (error) {
    console.error("Error loading deployment:", error)
    return (
      <div className="container py-10">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error loading deployment</h2>
          <p>There was a problem loading the deployment details: {error.message || "Unknown error"}</p>
        </div>
      </div>
    )
  }
}

function DeploymentDetailSkeleton() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>

        <Skeleton className="h-[300px] w-full" />

        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  )
}

