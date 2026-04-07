'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Award, Globe, Users, BookOpen, Heart, Calendar, Star } from 'lucide-react';
import Image from 'next/image';

interface HistorySectionContent {
  id: string
  section_title_en: string
  section_title_ta: string
  content_en: string
  content_ta: string
  order_index: number
}

export default function HistoryPage() {
  const { t, lang } = useTranslation();
  const [sections, setSections] = useState<HistorySectionContent[]>([])
  const [loadingSections, setLoadingSections] = useState(true)

  useEffect(() => {
    async function loadSections() {
      try {
        const res = await fetch('/api/history')
        const data = await res.json()
        if (data.success) setSections(data.data || [])
      } catch (error) {
        console.error('Failed to load history sections:', error)
      } finally {
        setLoadingSections(false)
      }
    }
    loadSections()
  }, [])



  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/Images/iplbanner.png"
            alt="History background"
            fill
            className="opacity-40 object-contain"
            style={{ objectPosition: 'center' }}
            priority
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
        </div>


        <div className="relative z-10 container-custom mx-auto text-center px-4">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-red-100 shadow-sm mb-8">
              <BookOpen className="w-4 h-4 text-red-700" />
              <span className="text-xs font-semibold tracking-wider uppercase text-red-800">
                {t('history.intro.title', 'Our Heritage')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-neutral-900 mb-6 leading-tight">
              {t('history.hero.title', 'History')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
              {t('history.hero.subtitle', 'A Journey of Love, Friendship & Humanitarian Service')}
            </p>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-linear-to-r from-transparent to-red-300" />
              <Heart className="w-5 h-5 text-red-600" />
              <div className="h-px w-16 bg-linear-to-l from-transparent to-red-300" />
            </div>
          </div>
        </div>
      </section>



      {/* Admin Managed Paragraph Sections */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {loadingSections ? (
              <p className="text-center text-neutral-500">Loading history content...</p>
            ) : sections.length > 0 ? (
              <div className="space-y-6">
                {sections
                  .slice()
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((section) => {
                    const title = lang === 'ta' && section.section_title_ta ? section.section_title_ta : section.section_title_en
                    const content = lang === 'ta' && section.content_ta ? section.content_ta : section.content_en
                    return (
                      <article key={section.id} className="bg-neutral-50 rounded-xl border border-neutral-100 p-5 sm:p-6">
                        {title ? <h3 className="text-xl font-bold text-neutral-900 mb-3" dangerouslySetInnerHTML={{ __html: title }} /> : null}
                        <div
                          className="prose max-w-none text-neutral-700"
                          dangerouslySetInnerHTML={{ __html: content || '' }}
                        />
                      </article>
                    )
                  })}
              </div>
            ) : null}
          </div>
        </div>
      </section>


    </main>
  );
}
