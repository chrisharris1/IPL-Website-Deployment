"use client"

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/contexts/TranslationContext'

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
  onSelect?: (href: string, title: string) => void
  variant?: 'default' | 'hero' | 'mobile'
}

const GlobalSearchInner: React.FC<GlobalSearchProps> = ({
  className = '',
  placeholder,
  autoFocus = false,
  onSelect,
  variant = 'default'
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const initial = ''
  const [query, setQuery] = useState(initial)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<Array<{ title: string; subtitle?: string; href: string }>>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { if (autoFocus && inputRef.current) inputRef.current.focus() }, [autoFocus])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data)
        } else {
          setSuggestions([])
        }
      } catch {
        setSuggestions([])
      }
    }, 180)
    return () => clearTimeout(timer)
  }, [query])

  const commitSearch = useCallback((value: string) => {
    const val = value.trim()
    if (!val) {
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    if (suggestions.length > 0) {
      router.push(suggestions[0].href)
    } else {
      router.push(`/news-events?search=${encodeURIComponent(val)}`)
    }
    setOpen(false)
    setActiveIndex(-1)
  }, [router, suggestions])

  const handleSelect = useCallback((href: string, title: string) => {
    // Navigate directly to the selected page
    if (onSelect) {
      onSelect(href, title)
    }
    router.push(href)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
  }, [onSelect, router])

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const highlight = useCallback((text: string) => {
    if (!query) return text
    const qLower = query.toLowerCase()
    const idx = text.toLowerCase().indexOf(qLower)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}<mark className="bg-red-100 text-red-700 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}
      </>
    )
  }, [query])

  const highlightHtml = useCallback((html: string) => {
    if (!query) return html
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return html.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark class="bg-red-100 text-red-700 rounded px-0.5">$1</mark>')
  }, [query])

  const baseInputClasses = variant === 'mobile'
    ? 'w-full pl-11 pr-4 py-3 rounded-xl bg-red-700/40 text-white placeholder-white/70 border border-white/10 hover:border-white/20 focus:ring-2 focus:ring-white/40 outline-none'
    : variant === 'hero'
      ? 'w-full pl-11 pr-4 py-3 rounded-full bg-white border border-neutral-200 shadow-sm focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-sm transition'
      : 'w-56 xl:w-64 pl-9 pr-10 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder-white/70 hover:border-white/30 focus:bg-white/15 focus:ring-2 focus:ring-white/30 focus:border-white/40 shadow-sm transition-all outline-none'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className={`absolute ${variant === 'mobile' ? 'left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70' : variant === 'hero' ? 'left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' : 'left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70'} pointer-events-none`} />
      <input
        ref={inputRef}
        value={query}
        onChange={e => { 
          const newValue = e.target.value
          setQuery(newValue)
          setOpen(newValue.trim().length > 0)
          setActiveIndex(-1)
        }}
        onFocus={() => {
          if (query.trim().length > 0) {
            setOpen(true)
          }
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault(); setActiveIndex(i => Math.min(suggestions.length - 1, i + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault(); setActiveIndex(i => Math.max(-1, i - 1))
          } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
              handleSelect(suggestions[activeIndex].href, suggestions[activeIndex].title)
            } else {
              commitSearch(query)
            }
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder || t('search.placeholder', 'Search the site...')}
        className={baseInputClasses}
        autoComplete="off"
      />
      {open && query.trim().length > 0 && (
        <ul className={`absolute left-0 right-0 ${variant === 'mobile' ? 'mt-3' : 'mt-2'} bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden z-50 text-sm animate-fade-in max-h-96 overflow-y-auto`} role="listbox">
          {suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <li
                key={s.href + i}
                role="option"
                aria-selected={activeIndex === i}
                tabIndex={-1}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(s.href, s.title)}
                className={`px-4 py-3 cursor-pointer flex flex-col gap-0.5 ${activeIndex === i ? 'bg-red-50' : 'hover:bg-neutral-50'}`}
              >
                <span className="font-semibold text-neutral-900 leading-tight" dangerouslySetInnerHTML={{ __html: highlightHtml(s.title) }} />
                {s.subtitle && (
                  <span className="text-neutral-500 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" /> {highlight(s.subtitle)}
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-sm text-neutral-500 flex flex-col gap-2" role="option" aria-selected="false">
              <span className="font-medium text-neutral-700">{t('search.no_results', 'No matches found')}</span>
              <span className="text-xs text-neutral-400">{t('search.suggestions', 'Suggestions')}: {t('search.clear', 'Clear')} / {t('search.popular', 'Popular Searches')}</span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

const GlobalSearch: React.FC<GlobalSearchProps> = (props) => {
  return (
    <Suspense fallback={
      <div className={props.className || ''}>
        <div className="relative">
          <input
            type="text"
            placeholder={props.placeholder || 'Search...'}
            disabled
            className="w-full opacity-50"
          />
        </div>
      </div>
    }>
      <GlobalSearchInner {...props} />
    </Suspense>
  )
}

export default GlobalSearch
