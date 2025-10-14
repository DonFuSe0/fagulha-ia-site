// components/AnimatedToast.tsx
import { useEffect } from 'react'

export default function AnimatedToast({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose && onClose(), 2200)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed z-50 left-1/2 bottom-8 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-2 animate-toast-in ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
      style={{ minWidth: 220 }}
    >
      {type === 'success' ? (
        <svg className="w-6 h-6 text-white animate-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-6 h-6 text-white animate-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      <span>{message}</span>
      <style jsx global>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in {
          animation: toast-in 0.5s cubic-bezier(.4,1.4,.6,1) both;
        }
        @keyframes pop {
          0% { transform: scale(0.7); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.4s cubic-bezier(.4,1.4,.6,1) both;
        }
      `}</style>
    </div>
  )
}
