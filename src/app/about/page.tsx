'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, Loader2, BookOpen } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'

interface AboutSection {
    id: string
    section_title_en: string
    section_title_ta: string
    content_en: string
    content_ta: string
    order_index: number
}

export default function About() {
    const { t, lang } = useTranslation()
    const [sections, setSections] = useState<AboutSection[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadSections() {
            try {
                const res = await fetch('/api/about')
                const data = await res.json()
                if (data.success) setSections(data.data || [])
            } catch (error) {
                console.error('Failed to load about sections:', error)
            } finally {
                setLoading(false)
            }
        }
        loadSections()
    }, [])

    return (
        <main className="min-h-screen bg-neutral-50">
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="About Us background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>

                <div className="relative z-10 container-custom mx-auto text-center px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-red-100 shadow-sm mb-8">
                            <Heart className="w-4 h-4 text-red-700" />
                            <span className="text-xs font-semibold tracking-wider uppercase text-red-800">
                                {t('about.badge', lang === 'ta' ? 'நாங்கள் யார்' : 'Who We Are')}
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                            {t('about.title', 'About Us')}
                        </h1>

                        <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                            {t('about.subtitle', 'Our Journey of Love, Friendship and Humanity')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container-custom mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl sm:text-4xl font-bold text-[#e91e8c] mb-4" style={{ fontFamily: "'Britannic Bold', 'Impact', sans-serif" }}>
                                <span className="text-[1.5em]">இ</span>ந்தியப் <span className="text-[1.5em]">பே</span>னாநண்பர் <span className="text-[1.5em]">பே</span>ரவை
                            </h2>
                            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                                Welcome to <span className="text-[#e91e8c]" style={{ fontFamily: "'Britannic Bold', 'Impact', sans-serif" }}><span className="text-[1.5em]">I</span>NDIAN <span className="text-[1.5em]">P</span>ENPALS' <span className="text-[1.5em]">L</span>EAGUE</span>
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-red-700" />
                            </div>
                        ) : sections.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                {t('about.no_content', lang === 'ta' ? 'எங்களைப் பற்றி உள்ளடக்கம் இல்லை.' : 'No about content available.')}
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {sections
                                    .slice()
                                    .sort((a, b) => a.order_index - b.order_index)
                                    .map((section) => {
                                        const title = lang === 'ta' && section.section_title_ta ? section.section_title_ta : section.section_title_en
                                        const content = lang === 'ta' && section.content_ta ? section.content_ta : section.content_en

                                        return (
                                            <article key={section.id} className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 sm:p-8">
                                                {title ? (
                                                    <h3 className="text-2xl font-bold text-neutral-900 mb-5" dangerouslySetInnerHTML={{ __html: title }} />
                                                ) : null}
                                                <div
                                                    className="prose prose-lg max-w-none text-neutral-700"
                                                    dangerouslySetInnerHTML={{ __html: content || '' }}
                                                />
                                            </article>
                                        )
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}
