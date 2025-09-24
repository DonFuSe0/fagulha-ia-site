interface FagulhaLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

export function FagulhaLogo({ size = "md", showText = true, className = "" }: FagulhaLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} flex items-center justify-center text-fagulha glow-fagulha text-2xl`}>
          🔥
        </div>
      </div>
      {showText && <span className={`font-bold text-gradient-fagulha ${textSizeClasses[size]}`}>Fagulha.ia</span>}
    </div>
  )
}
