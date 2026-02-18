'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

interface JoinNowContent {
    id: string
    title_en: string
    title_ta: string
    content_en: string
    content_ta: string
    google_form_url: string
}

export default function JoinNowPage() {
    const { t, lang } = useTranslation()
    const [content, setContent] = useState<JoinNowContent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch('/api/join-now')
                const data = await res.json()
                if (data.success) {
                    setContent(data.data)
                }
            } catch (error) {
                console.error('Failed to load content', error)
            } finally {
                setLoading(false)
            }
        }
        fetchContent()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="w-10 h-10 animate-spin text-red-700" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Join Now background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>
                <div className="relative z-10 container-custom mx-auto text-center px-4">
                    <span className="inline-block py-1 px-3 rounded-full bg-red-100/90 text-red-700 text-sm font-bold tracking-wide mb-4 animate-bounce shadow-sm backdrop-blur-sm">
                        {t('nav.joinNow', 'Join Now')}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-6 animate-slide-up">
                        {t('nav.joinNow', 'Join Now')}
                    </h1>
                </div>
            </section>

            <div className="container-custom mx-auto px-4 pb-20">
                {content.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-neutral-200">
                        <p className="text-neutral-500 text-lg">{t('joinnow.content_coming_soon', 'Content coming soon...')}</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {content.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                                <div className="p-8 md:p-12 lg:p-16 text-center max-w-4xl mx-auto">
                                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 tracking-tight px-2 text-[#e91e8c]" style={{ fontFamily: "'Britannic Bold', 'Impact', sans-serif" }} dangerouslySetInnerHTML={{ __html: lang === 'ta' ? item.title_ta : item.title_en }} />

                                    <div
                                        className="prose prose-lg max-w-none text-neutral-600 leading-relaxed mb-12"
                                        dangerouslySetInnerHTML={{ __html: lang === 'ta' ? item.content_ta : item.content_en }}
                                    />

                                    {/* Images Side by Side */}
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        {/* Condition Image */}
                                        <div className="w-full">
                                            <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">How to Join?</h3>
                                            <Image
                                                src="/1000187209.jpg"
                                                alt="Membership Conditions"
                                                width={1200}
                                                height={800}
                                                className="w-full h-auto rounded-xl border border-neutral-200 shadow-sm"
                                            />
                                        </div>

                                        {/* Form Image */}
                                        <div className="w-full">
                                            <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">Sample Form</h3>
                                            <Image
                                                src="/1000187212.jpg"
                                                alt="Membership Form"
                                                width={1200}
                                                height={800}
                                                className="w-full h-auto rounded-xl border border-neutral-200 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {item.google_form_url ? (
                                        <div className="w-full h-[800px] md:h-[1000px] bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200">
                                            <iframe
                                                src={item.google_form_url}
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                marginHeight={0}
                                                marginWidth={0}
                                                title="Google Form"
                                            >
                                                Loading…
                                            </iframe>
                                        </div>
                                    ) : (
                                        <div className="w-full py-16 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                                            <p className="text-neutral-500 font-medium">{t('joinnow.google_form_unavailable', 'Google form not available')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
