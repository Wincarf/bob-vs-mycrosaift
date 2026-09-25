import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bob vs Mycrosaift — AI Software Engineering Arena',
  description: 'Adversarial AI development workflow: Bob builds, Mycrosaift breaks, software gets better.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-arena-bg text-slate-200 font-mono antialiased">
        {children}
      </body>
    </html>
  )
}
