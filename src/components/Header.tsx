'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslation } from '../contexts/TranslationContext'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import GlobalSearch from './ui/GlobalSearch'

type Props = Record<string, never>
type NavLink = {
  path: string
  label: string
  hasDropdown?: boolean
  dropdownItems?: { path: string; label: string }[]
}

const Header: React.FC<Props> = () => {
  const { lang, toggleLanguage, t } = useTranslation()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setScrollProgress(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks: NavLink[] = [
    { path: '/', label: 'nav.home' },
    {
      path: '/about',
      label: 'nav.about',
      hasDropdown: true,
      dropdownItems: [
        { path: '/about', label: 'nav.about' },
        { path: '/about/history', label: 'nav.history' },
        { path: '/about/ipl-presidents-blog', label: 'nav.presidentBlog' },
      ],
    },
    { path: '/our-team', label: 'nav.team' },
    { path: '/humanitarian-services', label: 'nav.humanitarian' },
    {
      path: '/news-events',
      label: 'nav.news',
      hasDropdown: true,
      dropdownItems: [
        { path: '/news-events', label: 'nav.iplNews' },
        { path: '/friendship-meet', label: 'nav.meet' },
      ],
    },
    { path: '/contact', label: 'nav.contact' },
  ] as const

  const isActive = (path: string) => pathname === path

  return (
    <>
      <div className="bg-white w-full py-3 border-b border-zinc-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative h-10 md:h-16 w-full md:w-auto flex justify-center md:justify-start">
            <Image
              src="/Images/header/1.png"
              alt="Indian Penpals League Tamil"
              width={200}
              height={64}
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="relative h-10 md:h-16 w-full md:w-auto flex justify-center">
            <Image
              src="/Images/header/2.png"
              alt="Indian Penpals League English"
              width={400}
              height={64}
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="relative h-10 md:h-16 w-full md:w-auto flex justify-center md:justify-end">
            <Image
              src="/Images/header/3.png"
              alt="80G Certified"
              width={150}
              height={64}
              className="h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-red-900/95 backdrop-blur-md shadow-lg py-2' : 'bg-red-800 py-4'
          }`}
      >
        {/* Scroll Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="container mx-auto px-4 flex items-center justify-between gap-2 max-w-screen-2xl">


          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-nowrap shrink min-w-0 flex-1 justify-center">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.path} className="relative group/dropdown h-full flex items-center">
                  <button
                    className={`
                    relative px-3 py-2 text-xs xl:text-sm font-medium transition-all duration-300 shrink whitespace-nowrap max-w-[110px] xl:max-w-none group cursor-pointer bg-transparent border-0
                    ${isActive(link.path)
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'}
                  `}
                  >
                    {/* Animated underline */}
                    <span
                      className={`
                      absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-full transition-all duration-300 ease-out
                      ${isActive(link.path)
                          ? 'w-4/5 opacity-100 shadow-sm shadow-yellow-400/50'
                          : 'w-0 opacity-0 group-hover/dropdown:w-4/5 group-hover/dropdown:opacity-100'}
                    `}
                    />
                    {/* Glow effect on hover */}
                    <span
                      className={`
                      absolute inset-0 rounded-lg transition-all duration-300
                      ${isActive(link.path)
                          ? 'bg-white/10 shadow-inner'
                          : 'bg-transparent group-hover/dropdown:bg-white/5'}
                    `}
                    />
                    <span className="relative z-10 flex items-center gap-1">
                      {t(link.label as string)}
                      <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover/dropdown:rotate-180" />
                    </span>
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 pt-2 opacity-0 scale-95 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:scale-100 group-hover/dropdown:visible transition-all duration-200 ease-out">
                    <div className="bg-white rounded-lg shadow-2xl border border-neutral-200 py-1 min-w-[220px]">
                      {link.dropdownItems?.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className="block px-4 py-3 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                        >
                          {t(item.label as string)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`
                  relative px-3 py-2 text-xs xl:text-sm font-medium transition-all duration-300 shrink whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px] xl:max-w-none group
                  ${isActive(link.path)
                      ? 'text-white'
                      : link.path === '/contact'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30 rounded-full font-bold px-4'
                        : 'text-white/80 hover:text-white'}
                `}
                >
                  {/* Animated underline for non-contact links */}
                  {link.path !== '/contact' && (
                    <span
                      className={`
                      absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-full transition-all duration-300 ease-out
                      ${isActive(link.path)
                          ? 'w-4/5 opacity-100 shadow-sm shadow-yellow-400/50'
                          : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100'}
                    `}
                    />
                  )}
                  {/* Glow effect on hover */}
                  {link.path !== '/contact' && (
                    <span
                      className={`
                      absolute inset-0 rounded-lg transition-all duration-300
                      ${isActive(link.path)
                          ? 'bg-white/10 shadow-inner'
                          : 'bg-transparent group-hover:bg-white/5'}
                    `}
                    />
                  )}
                  <span className="relative z-10">{t(link.label as string)}</span>
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 relative z-50 shrink-0">
            {/* Desktop Search - Expandable */}
            <div className="hidden xl:flex items-center group relative shrink-0">
              <GlobalSearch
                variant="default"
                placeholder={t('header.search_placeholder', 'Search...')}
                onSelect={() => setMobileMenuOpen(false)}
              />
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-300 group shrink-0"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-white/80 group-hover:text-white group-hover:rotate-12 transition-all duration-300" />
              <span className="text-xs font-bold uppercase min-w-6 text-center">
                {lang}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Enhanced styling */}
        <div
          className={`
          lg:hidden fixed inset-0 z-40 bg-linear-to-b from-red-900 to-red-950 text-white backdrop-blur-xl transition-all duration-500 ease-in-out
          ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}
        `}
        >
          <div className="flex flex-col h-full pt-24 pb-10 px-6 overflow-y-auto">
            {/* Mobile Search */}
            <div className="mb-8">
              <GlobalSearch
                variant="mobile"
                placeholder={t('header.search_placeholder', 'Search...')}
                onSelect={() => setMobileMenuOpen(false)}
              />
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {navLinks.map((link, idx) => (
                link.hasDropdown ? (
                  <div key={link.path} className="animate-in slide-in-from-right-8 fade-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                    <button
                      onClick={() => setExpandedMobileMenu(expandedMobileMenu === link.path ? null : link.path)}
                      className={`
                      w-full flex items-center justify-between px-5 py-4 rounded-2xl text-lg font-medium transition-all
                      ${isActive(link.path)
                          ? 'bg-white text-red-900 shadow-lg'
                          : 'text-white/90 hover:bg-white/5 border border-transparent hover:border-white/10'}
                    `}
                    >
                      <span>{t(link.label as string)}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedMobileMenu === link.path ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedMobileMenu === link.path && (
                      <div className="mt-2 ml-4 space-y-2">
                        {link.dropdownItems?.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`
                            block px-5 py-3 rounded-xl text-base font-medium transition-all
                            ${isActive(item.path)
                                ? 'bg-white/20 text-white'
                                : 'text-white/80 hover:bg-white/10'}
                          `}
                          >
                            {t(item.label as string)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                    block px-5 py-4 rounded-2xl text-lg font-medium transition-all animate-in slide-in-from-right-8 fade-in duration-500
                    ${isActive(link.path)
                        ? 'bg-white text-red-900 shadow-lg scale-[1.02]'
                        : 'text-white/90 hover:bg-white/5 border border-transparent hover:border-white/10'}
                  `}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {t(link.label as string)}
                  </Link>
                )
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
              © {new Date().getFullYear()} Indian Penpals&apos; League
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header