'use client'

export default function BemvindoAnimations() {
  return (
    <style jsx global>{`
      @keyframes gradient-move {
        0% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-20px) scale(1.03); }
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
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
        50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
      }
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
    `}</style>
  )
}