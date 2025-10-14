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
    `}</style>
  )
}