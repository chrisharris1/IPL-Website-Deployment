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
                    <h1 className="text-3xl font-bold text-neutral-900 mb-4">Service Not Found</h1>
                    <p className="text-neutral-600 mb-6">The humanitarian service you're looking for doesn't exist.</p>
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
                    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-neutral-100">
                        <Image
                            src={service.image_url}
                            alt={lang === 'ta' ? service.title_ta : service.title_en}
                            fill
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="object-contain bg-neutral-100"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
                                <HandHeart className="w-5 h-5 text-white" />
                                <span className="text-white font-medium text-sm">Humanitarian Service</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                {lang === 'ta' && service.title_ta ? service.title_ta : service.title_en}
                            </h1>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="container-custom mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Meta Info */}
                        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-neutral-200">
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-100 p-3 rounded-xl">
                                        <Calendar className="w-6 h-6 text-primary-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-0.5">Date</p>
                                        <p className="text-neutral-900 font-semibold">
                                            {new Date(service.date).toLocaleDateString('en-US', { 
                                                month: 'long', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-100 p-3 rounded-xl">
                                        <MapPin className="w-6 h-6 text-primary-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-0.5">Location</p>
                                        <p className="text-neutral-900 font-semibold">
                                            {service.city}, {service.district}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {service.state}, {service.country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-md p-8 border border-neutral-200">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-6">About This Service</h2>
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
