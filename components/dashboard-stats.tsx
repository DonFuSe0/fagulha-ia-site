import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TokenIcon, ImageIcon, SparkleIcon } from "@/components/icons"

interface StatsProps {
  tokens: number
  imagesCreated: number
  accountStatus: "active" | "inactive"
}

export function DashboardStats({ tokens, imagesCreated, accountStatus }: StatsProps) {
  const stats = [
    {
      title: "Tokens Disponíveis",
      value: tokens.toString(),
      description: tokens > 0 ? "Pronto para criar!" : "Compre mais tokens",
      icon: TokenIcon,
      color: "text-fagulha",
    },
    {
      title: "Imagens Criadas",
      value: imagesCreated.toString(),
      description: "Total de criações",
      icon: ImageIcon,
      color: "text-blue-400",
    },
    {
      title: "Status da Conta",
      value: accountStatus === "active" ? "Ativa" : "Inativa",
      description: "Conta verificada",
      icon: SparkleIcon,
      color: "text-green-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="glass border-border/50 hover:border-fagulha/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
