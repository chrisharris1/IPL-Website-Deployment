'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '../contexts/TranslationContext'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react'

type Props = Record<string, never>

const VISIT_SEEN_KEY = 'ipl-visit-seen'

const Footer: React.FC<Props> = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const [visitorCount, setVisitorCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | undefined

    const readCount = async () => {
      try {
        const response = await fetch('/api/visits', { cache: 'no-store' })
        const data = await response.json()

        if (!cancelled && data?.success && typeof data.count === 'number') {
          setVisitorCount(data.count)
        }
      } catch (error) {
        console.error('Failed to read visitor count:', error)
      } finally {
        if (!cancelled) {
          setIsLoaded(true)
        }
      }
    }

    const registerVisit = async () => {
      try {
        const hasSeen = window.sessionStorage.getItem(VISIT_SEEN_KEY) === 'true'

        if (!hasSeen) {
          window.sessionStorage.setItem(VISIT_SEEN_KEY, 'true')
          await fetch('/api/visits', { method: 'POST' })
        }
      } catch (error) {
        console.error('Failed to register visit:', error)
      }
    }

    registerVisit().finally(() => {
      void readCount()
      pollTimer = setInterval(readCount, 15000)
    })

    return () => {
      cancelled = true
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [])

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-10">
      <div className="container-custom mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
          {/* Brand Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col items-center text-center">
            <Link href="/" className="block group">
              <Image
                src="/Images/Footer.png"
                alt="Indian Penpals' League"
                width={192}
                height={48}
                className="w-48 h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm font-semibold text-white">
              Total Visitor Count:{' '}
              <span className="font-bold">
                {isLoaded ? visitorCount : '...'}
              </span>
            </p>
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
              {t('footer.about_text', 'Love, Friendship & Humanity — A confederation of friends united to serve communities.')}
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="https://example.com"
                  className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-red-700 hover:text-white transition-all duration-300 hover:-translate-y-1"
                  aria-label={`Social media link ${i + 1}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* About Us Links */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">{t('nav.about', 'About Us')}</h3>
            <ul className="space-y-3">
              {[
                { to: '/about/history', label: 'nav.history' },
                { to: '/about/ipl-presidents-blog', label: 'nav.presidentBlog' },
                { to: '/our-team', label: 'nav.team' },
                { to: '/humanitarian-services', label: 'nav.humanitarian' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors group text-sm"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* News & Events */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">{t('nav.news', 'News & Events')}</h3>
            <ul className="space-y-3">
              {[
                { to: '/news-events', label: 'nav.iplNews' },
                { to: '/friendship-meet', label: 'nav.meet' },
                { to: '/contact', label: 'nav.contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors group text-sm"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">{t('footer.contact_us', 'Contact Us')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                <p className="text-neutral-400 text-sm leading-relaxed">
                  103, Starview Apts., Opp. Corporate Park,<br />
                  V.N.Purav Marg, Chembur,<br />
                  Mumbai - 400071, India
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600 shrink-0" />
                <a href="tel:+919892035187" className="text-neutral-400 hover:text-red-300 transition-colors text-sm">
                  +91 9892035187
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-600 shrink-0" />
                <a href="mailto:iplmumbai12395@gmail.com" className="text-neutral-400 hover:text-red-300 transition-colors text-sm break-all">
                  iplmumbai12395@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <p className="text-neutral-500 text-sm text-center md:text-left">
              © {currentYear} Indian Penpals&apos; League. {t('footer.rights', 'All Rights Reserved')}.
            </p>

            <div className="flex-1 flex justify-center order-first md:order-0" />

            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <Link href="/" className="hover:text-white transition-colors">{t('nav.home', 'Home')}</Link>
              <Link href="/contact" className="hover:text-white transition-colors">{t('nav.contact', 'Contact')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
