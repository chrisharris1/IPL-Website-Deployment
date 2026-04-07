'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { HandHeart, MapPin, Calendar, ArrowLeft, Loader2 } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'
import type { HumanitarianService } from '@/types/api'

export default function HumanitarianServiceDetail() {
    const params = useParams()
    const router = useRouter()
    const { t, lang } = useTranslation()
    const [service, setService] = useState<HumanitarianService | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function loadService() {
            try {
                const res = await fetch(`/api/services/${params.id}`)
                const data = await res.json()
                if (data.success && data.data) {
                    setService(data.data)
                } else {
                    setError(true)
                }
            } catch (err) {
                console.error('Failed to load service:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            loadService()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-700" />
            </div>
        )
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">{t('service.not_found', 'Service Not Found')}</h1>
                    <p className="text-sm sm:text-base text-neutral-600 mb-6">{t('service.not_found_desc', "The humanitarian service you're looking for doesn't exist.")}</p>
                    <Link
                        href="/humanitarian-services"
                        className="inline-flex items-center gap-2 bg-primary-700 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Services
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Back Button */}
            <div className="bg-white border-b border-neutral-200">
                <div className="container-custom mx-auto px-4 py-4">
                    <Link
                        href="/humanitarian-services"
                        className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-700 transition font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Services
                    </Link>
                </div>
            </div>

            {/* Hero Image */}
            <section className="relative bg-white">
                <div className="container-custom mx-auto px-4 py-8">
                    <div className="relative aspect-21/9 w-full rounded-2xl overflow-hidden shadow-2xl bg-neutral-100 group">
                        <Image
                            src={service.image_url}
                            alt={lang === 'ta' ? service.title_ta : service.title_en}
                            fill
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="object-contain bg-neutral-100"
                            priority
                        />
                        <div className="absolute left-4 top-8 sm:left-6 sm:top-10 z-10 max-w-[220px] rounded-xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg px-3 py-2 opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-primary-700 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wide text-neutral-500 mb-0.5">{t('service.date', 'Date')}</p>
                                        <p className="text-[11px] sm:text-xs font-semibold text-neutral-900 leading-tight">
                                            {new Date(service.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-primary-700 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wide text-neutral-500 mb-0.5">{t('service.location', 'Location')}</p>
                                        <p className="text-[11px] sm:text-xs font-semibold text-neutral-900 leading-tight">
                                            {[service.city, service.district, service.state, service.country].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="container-custom mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
                            <HandHeart className="w-4 h-4 text-primary-700" />
                            <span className="text-primary-700 font-medium text-xs sm:text-sm">{t('service.humanitarian_service', 'Humanitarian Service')}</span>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-neutral-200">
                            <h1
                                className="text-base sm:text-lg md:text-xl font-semibold uppercase text-neutral-900 leading-tight mb-4"
                                dangerouslySetInnerHTML={{ __html: lang === 'ta' && service.title_ta ? service.title_ta : service.title_en }}
                            />
                            <div
                                className="prose prose-lg max-w-none text-neutral-700 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: lang === 'ta' && service.description_ta
                                        ? service.description_ta
                                        : service.description_en
                                }}
                            />
                        </div>

                        {/* CTA */}
                        <div className="mt-8 text-center">
                            <Link
                                href="/humanitarian-services"
                                className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-8 py-3 rounded-lg font-medium transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                View More Services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
