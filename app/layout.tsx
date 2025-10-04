import { ReactNode } from 'react'

export const dynamic = 'force-dynamic' // ou remova se não usar

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* adicione seus outros metadados / links / favicon aqui */}
      </head>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}
