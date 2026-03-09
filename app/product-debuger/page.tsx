"use client"

import { AppShell } from "@/components/product-debuger/app-shell"
import { DependencyGraph } from "@/components/product-debuger/dependency-graph"

export default function HomePage() {
  return (
    <AppShell>
      <DependencyGraph />
    </AppShell>
  )
}
