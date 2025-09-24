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
          {/* Neural network background */}
          <g opacity="0.3">
            <circle cx="6" cy="8" r="1" fill="currentColor">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="26" cy="10" r="1" fill="currentColor">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="8" cy="24" r="1" fill="currentColor">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <line x1="6" y1="8" x2="16" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="26" y1="10" x2="16" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="16" y1="12" x2="8" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
          </g>

          {/* Main flame - more geometric and modern */}
          <path
            d="M16 2C13 6 11 10 13 15C15 20 19 22 21 17C23 12 21 8 19 6C21 4 23 2 21 1C19 2 16 2 16 2Z"
            fill="url(#modernFlameGradient)"
            className="drop-shadow-lg"
          />

          {/* Inner flame with AI-inspired geometry */}
          <path
            d="M16 6C14.5 8 13.5 10 14.5 13C15.5 16 17.5 17 18.5 14C19.5 11 18.5 9 17.5 8C18.5 7 19.5 6 18.5 5C17.5 6 16 6 16 6Z"
            fill="url(#innerModernFlame)"
          />

          {/* AI spark particles with hexagonal shapes */}
          <polygon points="24,6 25,8 24,10 22,10 21,8 22,6" fill="var(--color-fagulha-accent)" opacity="0.9">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 23 8;360 23 8"
              dur="4s"
              repeatCount="indefinite"
            />
          </polygon>

          <polygon points="9,14 10,16 9,18 7,18 6,16 7,14" fill="var(--color-fagulha-secondary)" opacity="0.7">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="360 8 16;0 8 16"
              dur="3s"
              repeatCount="indefinite"
            />
          </polygon>

          <circle cx="25" cy="20" r="1.2" fill="var(--color-fagulha-primary)" opacity="0.8">
            <animate attributeName="r" values="1.2;0.8;1.2" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Gradient definitions with modern colors */}
          <defs>
            <linearGradient id="modernFlameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-fagulha-primary)" />
              <stop offset="30%" stopColor="var(--color-fagulha-secondary)" />
              <stop offset="70%" stopColor="var(--color-fagulha-accent)" />
              <stop offset="100%" stopColor="var(--color-fagulha-primary)" />
            </linearGradient>
            <radialGradient id="innerModernFlame" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-fagulha-accent)" />
              <stop offset="50%" stopColor="var(--color-fagulha-secondary)" />
              <stop offset="100%" stopColor="var(--color-fagulha-primary)" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-gradient-fagulha ${textSizeClasses[size]} tracking-tight`}>Fagulha.ia</span>
      )}
    </div>
  )
}
