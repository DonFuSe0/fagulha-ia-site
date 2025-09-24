"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { TokenIcon, ImageIcon, GalleryIcon, SettingsIcon, PlusIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  userTokens: number
}

const navigation = [
  {
    name: "Criar Imagem",
    href: "/generate",
    icon: PlusIcon,
    primary: true,
  },
  {
    name: "Minha Galeria",
    href: "/my-gallery",
    icon: ImageIcon,
  },
  {
    name: "Galeria Pública",
    href: "/gallery",
    icon: GalleryIcon,
  },
  {
    name: "Comprar Tokens",
    href: "/pricing",
    icon: TokenIcon,
  },
  {
    name: "Configurações",
    href: "/profile",
    icon: SettingsIcon,
  },
]

export function DashboardSidebar({ userTokens }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 h-full bg-card/50 backdrop-blur-xl border-r border-border/50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <FagulhaLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
              <div className={cn("w-4 h-4 transition-transform duration-300", isCollapsed ? "rotate-180" : "")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </Button>
          </div>

          {!isCollapsed && (
            <div className="mt-4">
              <Badge variant="secondary" className="bg-fagulha/10 text-fagulha border-fagulha/20">
                <TokenIcon className="mr-1 h-3 w-3" />
                {userTokens} tokens
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-fagulha/10 text-fagulha border border-fagulha/20"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                    item.primary && !isActive && "hover:bg-fagulha/5 hover:text-fagulha",
                    isCollapsed && "justify-center",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive && "text-fagulha",
                      item.primary && !isActive && "group-hover:text-fagulha",
                    )}
                  />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <Link href="/">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                isCollapsed && "justify-center",
              )}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {!isCollapsed && <span className="font-medium">Sair</span>}
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
