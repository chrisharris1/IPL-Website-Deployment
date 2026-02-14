'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import translations from '../i18n/translations'

export type Language = 'en' | 'ta'

export interface TranslationContextValue {
  lang: Language | string
  setLanguage: (l: Language | string) => void
  toggleLanguage: () => void
  t: (key: string, fallback?: string) => string
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)

interface ProviderProps {
  children?: React.ReactNode
}

export const TranslationProvider: React.FC<ProviderProps> = ({ children }) => {
  // Use a stable, deterministic initial language for SSR + first client render
  const [lang, setLang] = useState<Language | string>('en')

  // After mount, read persisted preference and update. This avoids SSR/client mismatch.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ipl_lang')
      if (stored) {
        setTimeout(() => setLang(stored as Language), 0)
      }
    } catch { }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('ipl_lang', String(lang))
    } catch { }
    try {
      if (typeof document !== 'undefined') {
        const el = document.documentElement
        el.setAttribute('lang', String(lang))
        el.classList.toggle('lang-ta', String(lang) === 'ta')
      }
    } catch { }
  }, [lang])

  const t = (key: string, fallback?: string) => {
    if (!key) return ''
    const parts = key.split('.')
    const resolve = (locale: string): unknown => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cur: any = (translations as Record<string, unknown>)[locale]
      for (const p of parts) {
        if (!cur) break
        cur = (cur as Record<string, unknown>)[p]
      }
      return cur
    }
    let cur = resolve(String(lang))
    // If the selected language is missing a key, gracefully fallback to English.
    if (cur == null && String(lang) !== 'en') cur = resolve('en')
    if (cur == null) return fallback ?? key
    return String(cur)
  }

  const setLanguage = (l: Language | string) => setLang(l)
  const toggleLanguage = () => {
    setLang((s) => {
      if (s === 'en') return 'ta'
      return 'en'
    })
  }

  return (
    <TranslationContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = (): TranslationContextValue => {
  const ctx = useContext(TranslationContext)
  if (!ctx) {
    // This makes hook usage outside the provider clear in development while keeping runtime safe.
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return ctx
}

export default TranslationContext
