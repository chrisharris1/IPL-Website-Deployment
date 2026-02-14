'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith('/admin')

    if (isAdmin) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="grow">
                {children}
            </main>
            <Footer />
        </div>
    )
}
