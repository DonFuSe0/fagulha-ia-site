"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Coins, Info } from "lucide-react"

interface TokenCalculatorProps {
  onCostChange?: (cost: number) => void
  className?: string
}

export function TokenCalculator({ onCostChange, className = "" }: TokenCalculatorProps) {
  const [model, setModel] = useState("standard")
  const [resolution, setResolution] = useState("512x512")
  const [steps, setSteps] = useState([20])
  const [cost, setCost] = useState(1)

  const calculateCost = () => {
    const baseCost = 1
    let resolutionMultiplier = 1.0
    let stepsMultiplier = 1.0
    let modelMultiplier = 1.0

    // Resolution cost multiplier
    switch (resolution) {
      case "512x512":
        resolutionMultiplier = 1.0
        break
      case "768x768":
        resolutionMultiplier = 1.5
        break
      case "1024x1024":
        resolutionMultiplier = 2.0
        break
      case "1024x1536":
      case "1536x1024":
        resolutionMultiplier = 2.5
        break
      default:
        resolutionMultiplier = 1.0
    }

    // Steps multiplier
    if (steps[0] > 20) {
      stepsMultiplier = 1.0 + (steps[0] - 20) * 0.05
    }

    // Model multiplier
    switch (model) {
      case "standard":
        modelMultiplier = 1.0
        break
      case "premium":
        modelMultiplier = 1.5
        break
      case "ultra":
        modelMultiplier = 2.0
        break
      default:
        modelMultiplier = 1.0
    }

    const finalCost = Math.ceil(baseCost * resolutionMultiplier * stepsMultiplier * modelMultiplier)
    return Math.max(finalCost, 1) // Minimum 1 token
  }

  useEffect(() => {
    const newCost = calculateCost()
    setCost(newCost)
    onCostChange?.(newCost)
  }, [model, resolution, steps, onCostChange])

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-fagulha" />
          Calculadora de Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <Label>Modelo</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Padrão (1x)</SelectItem>
              <SelectItem value="premium">Premium (1.5x)</SelectItem>
              <SelectItem value="ultra">Ultra (2x)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resolution Selection */}
        <div className="space-y-2">
          <Label>Resolução</Label>
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512x512">512x512 (1x)</SelectItem>
              <SelectItem value="768x768">768x768 (1.5x)</SelectItem>
              <SelectItem value="1024x1024">1024x1024 (2x)</SelectItem>
              <SelectItem value="1024x1536">1024x1536 (2.5x)</SelectItem>
              <SelectItem value="1536x1024">1536x1024 (2.5x)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Steps Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Passos de Refinamento</Label>
            <span className="text-sm text-muted-foreground">{steps[0]}</span>
          </div>
          <Slider value={steps} onValueChange={setSteps} max={50} min={10} step={5} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Rápido (10)</span>
            <span>Balanceado (20)</span>
            <span>Alta Qualidade (50)</span>
          </div>
        </div>

        {/* Cost Display */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Custo Estimado:</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <Badge className="bg-fagulha/10 text-fagulha border-fagulha/20 text-lg px-3 py-1">
              <Coins className="h-4 w-4 mr-1" />
              {cost} token{cost > 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            O custo final pode variar baseado na complexidade da imagem gerada
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
