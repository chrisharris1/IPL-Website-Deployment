'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Calendar, Loader2, Sparkles, ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface EventPhoto {
    url: string
    public_id: string
    uploadedAt: string
}

interface Event {
    id: string
    newsId: string | null
    title_en: string
    title_ta: string
    description_en: string
    description_ta: string
    posterImage: string
    photos: EventPhoto[]
    date: string
    createdAt: string
}

export default function EventsPage() {
    const { t, lang } = useTranslation()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEvents = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/events')
            const data = await res.json()
            if (data.success) {
                setEvents(data.data)
            }
        } catch (error) {
            console.error('Failed to load events:', error)
        } finally {
            setLoading(false)
        }
    }

    const stripHtml = (html: string): string => {
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Events background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>

                <div className="relative z-10 container-custom mx-auto text-center px-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">
                            {t('events.badge', 'Photo Gallery')}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-neutral-900 mb-6 animate-slide-up">
                        {t('events.title', 'Events')}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {t('events.subtitle', 'Capturing moments from our activities and celebrations')}
                    </p>
                </div>
            </section>

            {/* Events Grid */}
            <section className="container-custom mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    </div>
                ) : events.length > 0 ? (
                    <div className="space-y-16">
                        {events.map((event) => {
                            const title = lang === 'ta' ? (event.title_ta || event.title_en) : event.title_en
                            const description = lang === 'ta' ? (event.description_ta || event.description_en) : event.description_en
                            const validPhotos = event.photos?.filter(p => p && p.url) || []
                            
                            return (
                                <div key={event.id} className="bg-white rounded-3xl p-8 shadow-lg border border-neutral-200">
                                    {/* Event Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Calendar className="w-5 h-5 text-red-600" />
                                            <span className="text-sm font-medium text-neutral-600">
                                                {new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-neutral-900 mb-3" dangerouslySetInnerHTML={{ __html: title }} />
                                        {description && (
                                            <div 
                                                className="text-neutral-600 leading-relaxed prose prose-neutral max-w-none"
                                                dangerouslySetInnerHTML={{ __html: description }}
                                            />
                                        )}
                                    </div>

                                    {/* Photo Gallery */}
                                    {event.posterImage || validPhotos.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {/* Event Poster/Advertisement (from News) */}
                                            {event.posterImage && (
                                                <div
                                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                                                    onClick={() => setSelectedPhoto(event.posterImage)}
                                                >
                                                    <Image
                                                        src={event.posterImage}
                                                        alt={`${stripHtml(title)} - Event Poster`}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                        Advertisement
                                                    </div>
                                                </div>
                                            )}
                                            {/* Additional uploaded photos */}
                                            {validPhotos.map((photo, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                                                    onClick={() => setSelectedPhoto(photo.url)}
                                                >
                                                    <Image
                                                        src={photo.url}
                                                        alt={`${stripHtml(title)} - Photo ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-neutral-400">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                                            <p>{t('events.no_photos', 'No photos available yet')}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                        <ImageIcon className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                        <p className="text-neutral-500 text-lg">{t('events.no_events', 'No events found')}</p>
                    </div>
                )}
            </section>

            {/* Photo Lightbox */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
                        <Image
                            src={selectedPhoto}
                            alt="Event photo"
                            fill
                            className="object-contain"
                            sizes="100vw"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
