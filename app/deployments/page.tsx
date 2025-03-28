import { Deployments } from "@/components/deployments"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

export default function DeploymentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<DeploymentDetailSkeleton />}>
      <Deployments />
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

