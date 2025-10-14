'use client'

export default function GalleryAnimations() {
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
      @keyframes text-glow {
        0%, 100% { text-shadow: 0 0 8px #818cf8, 0 0 24px #34d399; }
        50% { text-shadow: 0 0 24px #34d399, 0 0 48px #818cf8; }
      }
      .animate-text-glow {
        animation: text-glow 2.5s ease-in-out infinite;
      }
    `}</style>
  )
}