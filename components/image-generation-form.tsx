"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { Sparkles, Coins, Settings, Wand2, Loader2, AlertCircle, Info, Palette, Zap } from "lucide-react"

interface ImageGenerationFormProps {
  userTokens: number
}

export function ImageGenerationForm({ userTokens }: ImageGenerationFormProps) {
  const [formData, setFormData] = useState({
    prompt: "",
    negativePrompt: "",
    model: "standard",
    style: "realistic",
    resolution: "512x512",
    steps: [20],
    cfgScale: [7.0],
    seed: "",
  })
  const [estimatedCost, setEstimatedCost] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const router = useRouter()

  const models = [
    { value: "standard", label: "Padrão", description: "Modelo balanceado para uso geral" },
    { value: "premium", label: "Premium", description: "Maior qualidade e detalhamento" },
    { value: "ultra", label: "Ultra", description: "Máxima qualidade e realismo" },
  ]

  const styles = [
    { value: "realistic", label: "Realista" },
    { value: "artistic", label: "Artístico" },
    { value: "anime", label: "Anime" },
    { value: "cartoon", label: "Cartoon" },
    { value: "abstract", label: "Abstrato" },
    { value: "vintage", label: "Vintage" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "fantasy", label: "Fantasia" },
  ]

  const resolutions = [
    { value: "512x512", label: "512×512 (Quadrado)", cost: "1x" },
    { value: "768x768", label: "768×768 (Quadrado HD)", cost: "1.5x" },
    { value: "1024x1024", label: "1024×1024 (Alta Resolução)", cost: "2x" },
    { value: "1024x1536", label: "1024×1536 (Retrato)", cost: "2.5x" },
    { value: "1536x1024", label: "1536×1024 (Paisagem)", cost: "2.5x" },
  ]

  useEffect(() => {
    calculateCost()
  }, [formData])

  const calculateCost = async () => {
    try {
      const response = await fetch("/api/calculate-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: formData.model,
          resolution: formData.resolution,
          steps: formData.steps[0],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEstimatedCost(data.cost)
      }
    } catch (error) {
      console.error("Error calculating cost:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateRandomSeed = () => {
    const seed = Math.floor(Math.random() * 1000000)
    handleInputChange("seed", seed.toString())
  }

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) {
      setError("Por favor, descreva o que você quer gerar")
      return
    }

    if (userTokens < estimatedCost) {
      setError(`Tokens insuficientes. Você precisa de ${estimatedCost} tokens, mas tem apenas ${userTokens}.`)
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(0)

    try {
      // Start generation
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          steps: formData.steps[0],
          cfgScale: formData.cfgScale[0],
          seed: formData.seed ? Number.parseInt(formData.seed) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao gerar imagem")
      }

      const { imageId } = await response.json()

      // Poll for progress
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch(`/api/generate-image/${imageId}`)
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()

            if (progressData.status === "completed") {
              setProgress(100)
              setTimeout(() => {
                router.push(`/gallery?image=${imageId}`)
              }, 1000)
            } else if (progressData.status === "failed") {
              throw new Error(progressData.error_message || "Falha na geração")
            } else if (progressData.status === "processing") {
              setProgress(progressData.progress || 50)
              setTimeout(pollProgress, 2000) // Poll every 2 seconds
            }
          }
        } catch (error) {
          console.error("Error polling progress:", error)
          setTimeout(pollProgress, 2000)
        }
      }

      setTimeout(pollProgress, 1000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao gerar imagem")
      setIsGenerating(false)
      setProgress(0)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-fagulha" />
              Configurações de Geração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Avançado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Descrição da imagem *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Descreva detalhadamente o que você quer gerar... Ex: Um gato laranja dormindo em uma poltrona de couro, luz suave da janela, estilo fotográfico"
                    value={formData.prompt}
                    onChange={(e) => handleInputChange("prompt", e.target.value)}
                    className="min-h-[100px]"
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Seja específico para melhores resultados</span>
                    <span>{formData.prompt.length}/1000</span>
                  </div>
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="negativePrompt">O que evitar (opcional)</Label>
                  <Textarea
                    id="negativePrompt"
                    placeholder="Ex: desfocado, baixa qualidade, texto, marca d'água"
                    value={formData.negativePrompt}
                    onChange={(e) => handleInputChange("negativePrompt", e.target.value)}
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground text-right">{formData.negativePrompt.length}/500</div>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select value={formData.model} onValueChange={(value) => handleInputChange("model", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          <div>
                            <div className="font-medium">{model.label}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <Label>Estilo</Label>
                  <Select value={formData.style} onValueChange={(value) => handleInputChange("style", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                  <Label>Resolução</Label>
                  <Select value={formData.resolution} onValueChange={(value) => handleInputChange("resolution", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutions.map((resolution) => (
                        <SelectItem key={resolution.value} value={resolution.value}>
                          <div className="flex justify-between w-full">
                            <span>{resolution.label}</span>
                            <span className="text-fagulha text-xs">{resolution.cost}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-6">
                {/* Steps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Passos de Refinamento</Label>
                    <span className="text-sm text-muted-foreground">{formData.steps[0]}</span>
                  </div>
                  <Slider
                    value={formData.steps}
                    onValueChange={(value) => handleInputChange("steps", value)}
                    max={50}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rápido (10)</span>
                    <span>Balanceado (20)</span>
                    <span>Alta Qualidade (50)</span>
                  </div>
                </div>

                {/* CFG Scale */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Força do Prompt (CFG)</Label>
                    <span className="text-sm text-muted-foreground">{formData.cfgScale[0]}</span>
                  </div>
                  <Slider
                    value={formData.cfgScale}
                    onValueChange={(value) => handleInputChange("cfgScale", value)}
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Criativo (1)</span>
                    <span>Balanceado (7)</span>
                    <span>Preciso (20)</span>
                  </div>
                </div>

                {/* Seed */}
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seed"
                      type="number"
                      placeholder="Deixe vazio para aleatório"
                      value={formData.seed}
                      onChange={(e) => handleInputChange("seed", e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={generateRandomSeed}>
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Use o mesmo seed para reproduzir resultados similares</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Cost Calculator */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-fagulha" />
              Custo da Geração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Custo estimado:</span>
              <Badge className="bg-fagulha/10 text-fagulha border-fagulha/20 text-lg px-3 py-1">
                <Coins className="h-4 w-4 mr-1" />
                {estimatedCost} token{estimatedCost > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Seu saldo:</span>
              <span className="text-sm font-medium">{userTokens} tokens</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Após geração:</span>
              <span
                className={`text-sm font-medium ${userTokens - estimatedCost < 0 ? "text-red-500" : "text-green-500"}`}
              >
                {userTokens - estimatedCost} tokens
              </span>
            </div>
            {userTokens < estimatedCost && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">Tokens insuficientes</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Progress */}
        {isGenerating && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-fagulha animate-spin" />
                Gerando Imagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && "Preparando geração..."}
                {progress >= 30 && progress < 70 && "Processando imagem..."}
                {progress >= 70 && progress < 100 && "Finalizando..."}
                {progress === 100 && "Concluído! Redirecionando..."}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.prompt.trim() || userTokens < estimatedCost}
          className="w-full h-12 bg-fagulha hover:bg-fagulha/90 glow-fagulha text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Gerar Imagem ({estimatedCost} token{estimatedCost > 1 ? "s" : ""})
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>
        )}

        {/* Tips */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-fagulha" />
              Dicas para Melhores Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Palette className="h-4 w-4 text-fagulha mt-0.5 flex-shrink-0" />
              <span>Seja específico: inclua detalhes sobre cores, iluminação e estilo</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-fagulha mt-0.5 flex-shrink-0" />
              <span>Use o prompt negativo para evitar elementos indesejados</span>
            </div>
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-fagulha mt-0.5 flex-shrink-0" />
              <span>Experimente diferentes modelos para estilos únicos</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
