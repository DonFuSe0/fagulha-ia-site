'use client'

export default function GenerateAnimations() {
  return (
    <style jsx global>{`
      @keyframes gradient-move {
        0% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-30px) scale(1.04); }
        100% { transform: translateY(0) scale(1); }
      }
      .animate-gradient-move > div:first-child {
        animation: gradient-move 8s ease-in-out infinite;
      }
      @keyframes spin-slow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 24s linear infinite;
      }
      @keyframes text-glow {
        0%, 100% { text-shadow: 0 0 8px #ff7a18, 0 0 24px #ffb347; }
        50% { text-shadow: 0 0 24px #ffb347, 0 0 48px #ff7a18; }
      }
      .animate-text-glow {
        animation: text-glow 2.5s ease-in-out infinite;
      }
    `}</style>
  )
}