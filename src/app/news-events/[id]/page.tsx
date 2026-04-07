'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/contexts/TranslationContext'
import { Calendar, MapPin, Clock, ArrowLeft, Loader2, ImageIcon, X } from 'lucide-react'

type EventPhoto = {
    url: string
    public_id: string
    uploadedAt: string
}

type NewsEventDetail = {
    id: string
    title_en: string
    title_ta: string
    country: string
    state: string
    district: string
    city: string
    date: string
    time?: string
    description_en: string
    description_ta: string
    image_url: string
    photos: EventPhoto[]
}

export default function NewsEventDetailPage() {
    const { lang, t } = useTranslation()
    const params = useParams<{ id: string }>()

    const [event, setEvent] = useState<NewsEventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

    useEffect(() => {
        async function loadEvent() {
            try {
                setLoading(true)
                const res = await fetch(`/api/news/${params.id}`)
                const data = await res.json()
                if (data.success && data.data) {
                    setEvent(data.data)
                } else {
                    setError(true)
                }
            } catch (err) {
                console.error('Failed to load news event:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            loadEvent()
        }
    }, [params.id])

    const title = useMemo(() => {
        if (!event) return ''
        return (lang === 'ta' ? event.title_ta : event.title_en) || event.title_en
    }, [event, lang])

    const description = useMemo(() => {
        if (!event) return ''
        return (lang === 'ta' ? event.description_ta : event.description_en) || event.description_en
    }, [event, lang])

    const shortDate = useMemo(() => {
        if (!event) return ''
        return new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }, [event, lang])

    const shortLocation = useMemo(() => {
        if (!event) return ''
        const parts = [event.city, event.district, event.state]
            .filter(Boolean)
            .map((part) => part.trim())
        const deduped: string[] = []
        for (const part of parts) {
            if (!deduped.some((item) => item.toLowerCase() === part.toLowerCase())) {
                deduped.push(part)
            }
        }
        return deduped.join(', ')
    }, [event])

    const galleryPhotos = useMemo(() => {
        if (!event) return []
        const extras = Array.isArray(event.photos) ? event.photos.filter((photo) => Boolean(photo?.url)) : []
        return [
            { url: event.image_url, kind: 'poster' as const },
            ...extras.map((photo) => ({ url: photo.url, kind: 'photo' as const })),
        ]
    }, [event])

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-700" />
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                        {t('news.not_found', 'Event Not Found')}
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-600 mb-6">
                        {t('news.not_found_desc', "The event you're looking for doesn't exist.")}
                    </p>
                    <Link
                        href="/news-events"
                        className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to News & Events
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-neutral-50 min-h-screen">
            <div className="bg-white border-b border-neutral-200">
                <div className="container-custom mx-auto px-4 py-4">
                    <Link
                        href="/news-events"
                        className="inline-flex items-center gap-2 text-base sm:text-lg text-neutral-600 hover:text-red-700 transition font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to All Events
                    </Link>
                </div>
            </div>

            <section className="relative bg-white">
                <div className="container-custom mx-auto px-4 py-8">
                    <div className="relative aspect-21/9 w-full rounded-2xl overflow-hidden shadow-2xl bg-neutral-100">
                        <Image
                            src={event.image_url}
                            alt={title}
                            fill
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="object-contain bg-neutral-100"
                            priority
                        />
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container-custom mx-auto px-4">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-neutral-200">
                            <h1
                                className="text-xl sm:text-2xl md:text-3xl font-bold uppercase text-neutral-900 leading-tight mb-5"
                                dangerouslySetInnerHTML={{ __html: title }}
                            />

                            <div className="flex flex-wrap gap-3 text-sm sm:text-base text-neutral-700 mb-7">
                                <span className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    {shortDate}
                                </span>
                                {event.time && (
                                    <span className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-4 py-2 rounded-full">
                                        <Clock className="w-4 h-4" />
                                        {event.time}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-4 py-2 rounded-full">
                                    <MapPin className="w-4 h-4" />
                                    {shortLocation || [event.city, event.state].filter(Boolean).join(', ')}
                                </span>
                            </div>

                            <div
                                className="prose prose-xl sm:prose-2xl max-w-none text-neutral-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-neutral-200">
                            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6 inline-flex items-center gap-2">
                                <ImageIcon className="w-6 h-6 text-red-700" />
                                {t('events.gallery', 'Photo Gallery')} ({galleryPhotos.length})
                            </h2>

                            {galleryPhotos.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {galleryPhotos.map((photo, idx) => (
                                        <button
                                            key={`${photo.url}-${idx}`}
                                            type="button"
                                            className="relative aspect-square rounded-xl overflow-hidden group"
                                            onClick={() => setSelectedPhoto(photo.url)}
                                        >
                                            <Image
                                                src={photo.url}
                                                alt={`${title} - ${photo.kind === 'poster' ? 'Poster' : `Photo ${idx}`}`}
                                                fill
                                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {photo.kind === 'poster' && (
                                                <span className="absolute top-2 left-2 bg-red-700 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                                                    Poster
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-neutral-400">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                                    <p className="text-base sm:text-lg">{t('events.no_photos', 'No photos available yet')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

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
