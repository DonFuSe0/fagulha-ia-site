// SkeletonLoader.tsx
// Componente animado para placeholder de carregamento
export default function SkeletonLoader({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded ${className}`}
      style={{ minHeight: 24, ...style }}
    />
  )
}
