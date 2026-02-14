'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { HandHeart, MapPin, Loader2, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getServices } from '@/lib/api'
import type { HumanitarianService } from '@/types/api'

export default function HumanitarianServices() {
    const { t, lang } = useTranslation()
    const [services, setServices] = useState<HumanitarianService[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadServices() {
            try {
                const response = await getServices({ limit: 100 })
                if (response.success && response.data) {
                    const d = response.data as unknown
                    const arr = Array.isArray(d) ? d : (d as { data?: HumanitarianService[] }).data ?? []
                    setServices(arr)
                }
            } catch (error) {
                console.error('Failed to load services:', error)
            } finally {
                setLoading(false)
            }
        }
        loadServices()
    }, [])

    // Helper to strip HTML tags for preview
    const stripHtml = (html: string) => {
        if (!html) return ''
        return html.replace(/<[^>]*>/g, '').substring(0, 100)
    }

    return (
        <div className="bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Humanitarian Services background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>
                <div className="relative z-10 container-custom mx-auto text-center px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur-xl rounded-full mb-6 sm:mb-8 border border-neutral-200 shadow-sm animate-fade-in">
                        <HandHeart className="w-8 h-8 sm:w-10 sm:h-10 text-primary-700" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4 sm:mb-6 animate-slide-up">
                        {t('nav.humanitarian', 'Humanitarian Services')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto animate-slide-up px-2" style={{ animationDelay: '0.1s' }}>
                        {t('humanitarian.subtitle', 'Serving Humanity with Love and Compassion')}
                    </p>
                </div>
            </section>

            {/* Events Grid */}
            <section className="py-16">
                <div className="container-custom mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                            {t('humanitarian.our_activities', lang === 'ta' ? 'எங்கள் மனிதநேய செயல்பாடுகள்' : 'Our Humanitarian Activities')}
                        </h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            {t('humanitarian.explore_initiatives', lang === 'ta' ? 'உலகம் முழுவதும் சமூகங்களில் நேர்மறை தாக்கம் ஏற்படுத்தும் எங்கள் முயற்சிகளை ஆராயுங்கள்' : 'Explore our initiatives making a positive impact in communities worldwide')}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-500">{t('humanitarian.no_activities', lang === 'ta' ? 'செயல்பாடுகள் எதுவும் இல்லை.' : 'No activities found.')}</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map(event => (
                                <Link
                                    key={event.id}
                                    href={`/humanitarian-services/${event.id}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-neutral-100"
                                >
                                    <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
                                        <Image
                                            src={event.image_url}
                                            alt={lang === 'ta' ? event.title_ta : event.title_en}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-contain object-center bg-neutral-100"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="inline-block bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                {t('news.view_details', lang === 'ta' ? 'விவரங்கள்' : 'View Details')} {'->'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors leading-tight">
                                            {lang === 'ta' ? event.title_ta : event.title_en}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                                            <Calendar className="w-3.5 h-3.5 text-primary-600" />
                                            <span className="font-medium">
                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2 text-xs text-neutral-600 mb-3">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary-600" />
                                            <span className="line-clamp-2">{event.city}, {event.district}, {event.state}</span>
                                        </div>

                                        <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                                            {stripHtml(lang === 'ta' ? event.description_ta : event.description_en)}...
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
