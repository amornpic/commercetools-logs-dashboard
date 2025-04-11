
import { CustomObjectsDashboard } from "@/components/custom-objects/custom-objects-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

export default function CustomObjectsPage() {
  return (
    <div className="container py-6">
        <Suspense fallback={<CustomObjectsSkeleton />}>
            <CustomObjectsDashboard />
        </Suspense>
    </div>
  )
}

function CustomObjectsSkeleton() {
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