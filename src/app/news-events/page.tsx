'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import NotifyMeModal from '@/components/NotifyMeModal'
import { Calendar, MapPin, Search, Loader2, Sparkles, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getNewsEvents } from '@/lib/api'
import type { NewsEvent } from '@/types/api'

// Helper to strip HTML tags for card previews
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function NewsEventsContent() {
    const { t, lang } = useTranslation()
    const searchParams = useSearchParams()
    const urlSearch = (searchParams.get('search') || searchParams.get('q') || '').trim()
    const [upcomingEvents, setUpcomingEvents] = useState<NewsEvent[]>([])
    const [pastEvents, setPastEvents] = useState<NewsEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(urlSearch)
    const [notifyEvent, setNotifyEvent] = useState<NewsEvent | null>(null)
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getNewsEvents(searchQuery || undefined)
            if (response.success && response.data) {

                setUpcomingEvents(response.data.upcoming)
                setPastEvents(response.data.past)
            }
        } catch (error) {
            console.error('Failed to load events:', error)
        } finally {
            setLoading(false)
        }
    }, [searchQuery])

    useEffect(() => {
        loadEvents()
    }, [loadEvents])

    useEffect(() => {
        setSearchQuery(urlSearch)
    }, [urlSearch])

    const handleNotify = (e: React.MouseEvent, event: NewsEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setNotifyEvent(event)
        setIsNotifyModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="News background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>

                <div className="relative z-10 container-custom mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">
                            {t('news.badge', 'Latest Updates')}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-neutral-900 mb-6 animate-slide-up">
                        {t('news.title', 'News')}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {t('news.subtitle', "Discover the latest happenings, milestones, and celebrations from the Indian Penpals' League community")}
                    </p>

                    {/* Search Control */}
                    <div className="mt-10 flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="relative max-w-xl w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder={t('news.search_placeholder', 'Search events...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="container-custom mx-auto pb-16 mt-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-700" />
                    </div>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        {upcomingEvents.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-8">
                                    <Calendar className="w-6 h-6 text-red-700" />
                                    <h2 className="text-3xl font-bold text-neutral-900">
                                        {t('news.upcoming_events', 'Upcoming Events')}
                                        <span className="ml-3 text-lg font-normal text-neutral-500">({upcomingEvents.length})</span>
                                    </h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {upcomingEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/news-events/${event.id}`}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full"
                                        >
                                            <div className="relative h-48 shrink-0">
                                                <Image
                                                    src={event.image_url}
                                                    alt={lang === 'ta' ? event.title_ta : event.title_en}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-contain bg-neutral-100"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

                                                {/* Upcoming Badge */}
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-lg">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        {t('news.upcoming_badge', 'Upcoming')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col grow">
                                                <div className="flex items-center text-lg sm:text-xl text-neutral-800 mb-3">
                                                    <span className="font-extrabold">
                                                        {new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-red-700 transition-colors leading-tight" dangerouslySetInnerHTML={{ __html: (lang === 'ta' ? event.title_ta : event.title_en) || event.title_en }} />

                                                <div className="flex items-start gap-2 text-xs text-neutral-600 mb-4">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                                                    <span className="line-clamp-1">{[event.city, event.district, event.state, event.country].filter(Boolean).join(', ')}</span>
                                                </div>

                                                <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed mb-4 grow">
                                                    {stripHtml((lang === 'ta' ? event.description_ta : event.description_en) || event.description_en)}...
                                                </p>

                                                <button
                                                    onClick={(e) => handleNotify(e, event)}
                                                    className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-sm group/btn"
                                                >
                                                    <Bell className="w-4 h-4 group-hover/btn:animate-swing" />
                                                    {t('humanitarian.notify_me', 'Notify Me')}
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Events */}
                        {pastEvents.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <Calendar className="w-6 h-6 text-neutral-500" />
                                    <h2 className="text-3xl font-bold text-neutral-900">
                                        {t('news.past_events', 'Past News')}
                                        <span className="ml-3 text-lg font-normal text-neutral-500">({pastEvents.length})</span>
                                    </h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {pastEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/news-events/${event.id}`}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full"
                                        >
                                            <div className="relative h-48 shrink-0">
                                                <Image
                                                    src={event.image_url}
                                                    alt={lang === 'ta' ? event.title_ta : event.title_en}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-contain bg-neutral-100"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

                                                {/* Past Badge */}
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-500 text-white shadow-lg">
                                                        {t('news.past_badge', 'Past')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col grow">
                                                <div className="flex items-center text-lg sm:text-xl text-neutral-800 mb-3">
                                                    <span className="font-extrabold">
                                                        {new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-red-700 transition-colors leading-tight" dangerouslySetInnerHTML={{ __html: (lang === 'ta' ? event.title_ta : event.title_en) || event.title_en }} />

                                                <div className="flex items-start gap-2 text-xs text-neutral-600 mb-4">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                                                    <span className="line-clamp-1">{[event.city, event.district, event.state, event.country].filter(Boolean).join(', ')}</span>
                                                </div>

                                                <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed mb-4 grow">
                                                    {stripHtml((lang === 'ta' ? event.description_ta : event.description_en) || event.description_en)}...
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Events */}
                        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                            <div className="text-center py-20">
                                <Calendar className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                                <p className="text-neutral-500 text-lg">{t('news.no_events', 'No events found')}</p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Notify Me Modal */}
            {notifyEvent && (
                <NotifyMeModal
                    isOpen={isNotifyModalOpen}
                    onClose={() => setIsNotifyModalOpen(false)}
                    eventDetails={{
                        id: String(notifyEvent.id),
                        title: lang === 'ta' ? (notifyEvent.title_ta || notifyEvent.title_en) : notifyEvent.title_en,
                        date: notifyEvent.date,
                        location: [notifyEvent.city, notifyEvent.district].filter(Boolean).join(', ')
                    }}
                />
            )}
        </div>
    )
}

export default function NewsEvents() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-red-700" />
            </div>
        }>
            <NewsEventsContent />
        </Suspense>
    )
}
