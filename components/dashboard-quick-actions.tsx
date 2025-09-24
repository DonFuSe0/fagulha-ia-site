import { cn } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PlusIcon, ImageIcon, GalleryIcon, TokenIcon } from "@/components/icons"

const actions = [
  {
    title: "Criar Imagem",
    description: "Gere uma nova imagem com IA",
    href: "/generate",
    icon: PlusIcon,
    primary: true,
  },
  {
    title: "Minha Galeria",
    description: "Veja suas criações",
    href: "/my-gallery",
    icon: ImageIcon,
  },
  {
    title: "Galeria Pública",
    description: "Explore criações da comunidade",
    href: "/gallery",
    icon: GalleryIcon,
  },
  {
    title: "Comprar Tokens",
    description: "Adquira mais créditos",
    href: "/pricing",
    icon: TokenIcon,
  },
]

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Card
            key={index}
            className="glass border-border/50 hover:border-fagulha/20 transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <Link href={action.href} className="block">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      action.primary
                        ? "bg-fagulha/10 text-fagulha group-hover:bg-fagulha/20"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-fagulha transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
