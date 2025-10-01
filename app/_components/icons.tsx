// app/_components/icons.tsx
import React from 'react'
type P = React.SVGProps<SVGSVGElement> & { size?: number }
export const IconChevronDown = ({ size=16, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
)
export const IconGallery = ({ size=18, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l4-4 3 3 5-5 4 4"/>
  </svg>
)
export const IconSettings = ({ size=18, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.04 3.3l.06.06A1.65 1.65 0 0 0 8 3.6 1.65 1.65 0 0 0 9 2.09V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8c.74 0 1.37.4 1.74 1.0A2 2 0 0 1 22 12a2 2 0 0 1-.09.6c-.37.6-1 .99-1.74.99Z"/>
  </svg>
)
export const IconLogout = ({ size=18, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
  </svg>
)
export const IconReuse = ({ size=16, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M20 8a8 8 0 0 0-8-5"/><path d="M4 16a8 8 0 0 0 8 5"/>
  </svg>
)
