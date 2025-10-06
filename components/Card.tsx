import React from 'react'

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 ${className}`}>{children}</div>
}
export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-4 border-b border-zinc-800 flex items-center justify-between ${className}`}>{children}</div>
}
export function CardBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}