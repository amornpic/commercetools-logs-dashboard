"use client"

import * as React from "react"
import { AudioWaveform, ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { setActiveProjectKey } from "@/lib/commercetools-api"

export function EnvironmentSwitcher() {
  const projectKeys = (process.env.NEXT_PUBLIC_CT_PROJECT_KEYS || 'project-key').split(',')
  const environments = projectKeys.map(key => ({
    key,
    name: key,
    logo: AudioWaveform,
  }))
  const [activeEnvironment, setActiveEnvironment] = React.useState(environments[0].key)
  
  const { isMobile } = useSidebar()

  React.useEffect(() => {
    const storedProjectKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('activeProjectKey='))
      ?.split('=')[1];
    
    if (storedProjectKey) {
      setActiveEnvironment(storedProjectKey);
    } else {
      handleChange(environments[0].key)
    }
  }, []);

  const handleChange = async (env: string) => {
    setActiveEnvironment(env)
    await setActiveProjectKey(env)
    location.replace('/deployments');
  }

  if (!activeEnvironment) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeEnvironment.logo className="size-4" />
              </div> */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {environments.find(env => env.key === activeEnvironment)?.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Project Keys
            </DropdownMenuLabel>
            {environments && environments.map((env, index) => (
              <DropdownMenuItem
                key={env.key}
                onClick={() => handleChange(env.key)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <env.logo className="size-4 shrink-0" />
                </div>
                {env.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
