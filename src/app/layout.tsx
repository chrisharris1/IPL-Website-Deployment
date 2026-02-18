import type { Metadata } from 'next'
import { TranslationProvider } from '@/contexts/TranslationContext'
import LayoutShell from '@/components/LayoutShell'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "INDIAN PENPALS' LEAGUE",
    template: "%s",
  },
  description: "Love, Friendship & Humanity — A confederation of friends united to serve communities.",
  icons: {
    icon: '/Images/Header.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TranslationProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </TranslationProvider>
      </body>
    </html>
  )
}
