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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <svg className={`${sizeClasses[size]} text-fagulha glow-fagulha`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          <circle cx="12" cy="9" r="1.5" fill="white" />
          <path d="M8 16c0 2.21 1.79 4 4 4s4-1.79 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-fagulha rounded-full animate-pulse"></div>
      </div>
      {showText && (
        <span className={`font-bold text-gradient-fagulha ${textSizeClasses[size]} tracking-tight`}>Fagulha.ia</span>
      )}
    </div>
  )
}
