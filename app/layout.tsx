import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Commercetools Logs Dashboard',
}
import Script from 'next/script'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Breadcrumbs from '@/components/breadcrumbs'
import { ThemeProvider } from 'next-themes'
import { ReactQueryProvider } from '@/lib/react-query-provider'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script defer src="https://cloud.umami.is/script.js" data-website-id="98ed8129-9cc7-4865-8abf-98cfda1fd9d7" />
      <body>
      <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumbs/>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
        </ThemeProvider>
      </ReactQueryProvider>
      </body>
    </html>
  )
}

