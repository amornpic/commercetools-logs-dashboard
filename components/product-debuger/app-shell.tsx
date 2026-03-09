"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ProductProvider } from "@/lib/product-context"
import { ProductSidebar } from "@/components/product-debuger/product-sidebar"
import {
  GitBranch,
  Search,
  Box,
} from "lucide-react"

// const navItems = [
//   {
//     label: "Dependency Graph",
//     href: "/product-debuger",
//     icon: GitBranch,
//   },
//   // {
//   //   label: "Sellability Checker",
//   //   href: "/product-debuger/checker",
//   //   icon: Search,
//   // },
// ]

export function AppShell({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname()

  return (
    <ProductProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-6"> */}
          {/* <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Box className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Product Debugger
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline-block font-mono">
              v1.0
            </span>
          </div> */}

          {/* <nav className="ml-10 flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav> */}

          {/* <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground md:flex">
              <span className="font-mono">6 products</span>
              <span className="text-border">|</span>
              <span className="font-mono">commercetools</span>
            </div>
          </div> */}
        {/* </header> */}

        <div className="flex flex-1 overflow-hidden">
          <ProductSidebar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </ProductProvider>
  )
}
