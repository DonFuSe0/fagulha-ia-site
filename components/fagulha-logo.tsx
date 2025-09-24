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
        <svg className={`${sizeClasses[size]} text-fagulha glow-fagulha-sm`} viewBox="0 0 32 32" fill="none">
          {/* Main flame shape */}
          <path
            d="M16 4C12 8 10 12 12 16C14 20 18 22 20 18C22 14 20 10 18 8C20 6 22 4 20 2C18 4 16 4 16 4Z"
            fill="url(#flameGradient)"
          />
          {/* Inner flame */}
          <path
            d="M16 8C14 10 13 12 14 14C15 16 17 17 18 15C19 13 18 11 17 10C18 9 19 8 18 7C17 8 16 8 16 8Z"
            fill="url(#innerFlame)"
          />
          {/* Spark particles */}
          <circle cx="24" cy="8" r="1.5" fill="var(--color-fagulha-accent)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="8" cy="12" r="1" fill="var(--color-fagulha-secondary)" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="26" cy="16" r="0.8" fill="var(--color-fagulha-primary)" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.8s" repeatCount="indefinite" />
          </circle>

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-fagulha-primary)" />
              <stop offset="50%" stopColor="var(--color-fagulha-secondary)" />
              <stop offset="100%" stopColor="var(--color-fagulha-accent)" />
            </linearGradient>
            <linearGradient id="innerFlame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-fagulha-accent)" />
              <stop offset="100%" stopColor="var(--color-fagulha-primary)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-gradient-fagulha ${textSizeClasses[size]} tracking-tight`}>Fagulha.ia</span>
      )}
    </div>
  )
}
