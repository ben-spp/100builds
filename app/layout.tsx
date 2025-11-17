import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '100builds — Built by you. Counted together.',
  description: "The internet's project board — show what you're building or find help to finish it.",
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
