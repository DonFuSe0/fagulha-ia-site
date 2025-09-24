"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Coins, TrendingUp, TrendingDown, Gift, CreditCard } from "lucide-react"

interface Transaction {
  id: string
  type: "purchase" | "usage" | "refund" | "bonus"
  amount: number
  description: string
  created_at: string
  metadata?: any
}

interface TokenHistoryProps {
  className?: string
}

export function TokenHistory({ className = "" }: TokenHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTokenData()
  }, [])

  const fetchTokenData = async () => {
    try {
      const response = await fetch("/api/tokens")
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching token data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <CreditCard className="h-4 w-4" />
      case "usage":
        return <TrendingDown className="h-4 w-4" />
      case "refund":
        return <TrendingUp className="h-4 w-4" />
      case "bonus":
        return <Gift className="h-4 w-4" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "text-green-500"
      case "usage":
        return "text-red-500"
      case "refund":
        return "text-blue-500"
      case "bonus":
        return "text-fagulha"
      default:
        return "text-muted-foreground"
    }
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "purchase":
        return "default"
      case "usage":
        return "destructive"
      case "refund":
        return "secondary"
      case "bonus":
        return "default"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-fagulha" />
            Histórico de Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fagulha mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-fagulha" />
            Histórico de Tokens
          </div>
          <Badge className="bg-fagulha/10 text-fagulha border-fagulha/20">Saldo: {balance} tokens</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getTransactionBadgeVariant(transaction.type)} className="text-xs">
                      {transaction.type === "usage" ? "-" : "+"}
                      {Math.abs(transaction.amount)} tokens
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
