import { Suspense } from "react"
import { DeploymentDetail } from "@/components/deployment-detail"
import { Skeleton } from "@/components/ui/skeleton"

interface DeploymentDetailPageProps {
  params: {
    key: string
  }
}

export default async function DeploymentDetailPage({ params }: DeploymentDetailPageProps) {
  const {key} = await params

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<DeploymentDetailSkeleton />}>
        <DeploymentDetail deploymentKey={key} />
      </Suspense>
    </main>
  )
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

