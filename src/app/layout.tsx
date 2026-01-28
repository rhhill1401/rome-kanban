import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Rome's Storybook - Content Kanban",
  description: 'Content planning and tracking for Rome\'s Storybook YouTube channel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
