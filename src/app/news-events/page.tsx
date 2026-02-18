'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import NotifyMeModal from '@/components/NotifyMeModal'
import { Calendar, MapPin, Search, Loader2, Clock, X, Sparkles, Bell } from 'lucide-react'
import Image from 'next/image'
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
    const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null)
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
                        alt="News & Events background"
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
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6 animate-slide-up">
                        {t('news.title', 'News & Events')}
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
                                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {upcomingEvents.map((event) => (
                                        <article
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                                        >
                                            {/* Image header */}
                                            <div className="relative h-40 shrink-0">
                                                <Image
                                                    src={event.image_url}
                                                    alt={lang === 'ta' ? event.title_ta : event.title_en}
                                                    fill
                                                    sizes="(max-width:768px) 100vw, (max-width:1024px) 33vw, 20vw"
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

                                                {/* Date Badge */}
                                                <div className="absolute top-3 left-3 bg-white rounded-md shadow-md overflow-hidden">
                                                    <div className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 text-center">
                                                        {new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short' }).toUpperCase()}
                                                    </div>
                                                    <div className="px-2 py-1 text-lg font-bold text-neutral-900 text-center">
                                                        {new Date(event.date).getDate()}
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="p-4 flex flex-col flex-1">
                                                <h3 className="text-base font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors" dangerouslySetInnerHTML={{ __html: (lang === 'ta' ? event.title_ta : event.title_en) || event.title_en }} />

                                                <div className="flex items-start gap-2 text-xs text-neutral-600 mb-3">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                                                    <span className="line-clamp-1">
                                                        {[event.city, event.district, event.state, event.country].filter(Boolean).join(', ')}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed grow mb-3">
                                                    {stripHtml((lang === 'ta' ? event.description_ta : event.description_en) || event.description_en)}
                                                </p>

                                                <div className="flex flex-col gap-1.5 text-xs text-neutral-500 mt-auto pt-2 border-t border-neutral-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        <span className="font-medium text-neutral-700">
                                                            {new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    {event.time && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span className="font-medium text-neutral-700">{event.time}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={(e) => handleNotify(e, event)}
                                                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-sm group/btn"
                                                >
                                                    <Bell className="w-4 h-4 group-hover/btn:animate-swing" />
                                                    {t('humanitarian.notify_me', 'Notify Me')}
                                                </button>
                                            </div>
                                        </article>
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
                                        {t('news.past_events', 'Past Events')}
                                        <span className="ml-3 text-lg font-normal text-neutral-500">({pastEvents.length})</span>
                                    </h2>
                                </div>
                                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {pastEvents.map((event) => (
                                        <article
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        >
                                            {/* Image header */}
                                            <div className="relative h-40">
                                                <Image
                                                    src={event.image_url}
                                                    alt={lang === 'ta' ? event.title_ta : event.title_en}
                                                    fill
                                                    sizes="(max-width:768px) 100vw, (max-width:1024px) 33vw, 20vw"
                                                    className="object-contain bg-neutral-100"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

                                                {/* Past Badge */}
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-500 text-white shadow-lg">
                                                        {t('news.past_badge', 'Past')}
                                                    </span>
                                                </div>

                                                {/* Date Badge */}
                                                <div className="absolute top-3 left-3 bg-white rounded-md shadow-md overflow-hidden">
                                                    <div className="bg-neutral-500 text-white text-[10px] font-bold px-2 py-0.5 text-center">
                                                        {new Date(event.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short' }).toUpperCase()}
                                                    </div>
                                                    <div className="px-2 py-1 text-lg font-bold text-neutral-900 text-center">
                                                        {new Date(event.date).getDate()}
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="p-4 flex flex-col flex-1">
                                                <h3 className="text-base font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors" dangerouslySetInnerHTML={{ __html: lang === 'ta' ? event.title_ta : event.title_en }} />

                                                <div className="flex items-start gap-2 text-xs text-neutral-600 mb-3">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                                                    <span className="line-clamp-1">
                                                        {[event.city, event.district, event.state, event.country].filter(Boolean).join(', ')}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                                                    {stripHtml(lang === 'ta' ? event.description_ta : event.description_en)}
                                                </p>

                                                <div className="flex flex-col gap-1.5 text-xs text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                        <span className="font-medium text-neutral-600">
                                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    {event.time && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                            <span className="font-medium text-neutral-600">{event.time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
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

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedEvent(null)}
                >
                    <style jsx global>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative no-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image - Full Width Top */}
                        <div className="relative h-64 sm:h-80 md:h-96 w-full">
                            <Image
                                src={selectedEvent.image_url}
                                alt={lang === 'ta' ? selectedEvent.title_ta : selectedEvent.title_en}
                                fill
                                className="object-contain bg-neutral-100"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-90" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 shadow-sm backdrop-blur-sm ${new Date(selectedEvent.date) > new Date() ? 'bg-emerald-500/90' : 'bg-neutral-500/90'}`}>
                                    {new Date(selectedEvent.date) > new Date() && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                                        {new Date(selectedEvent.date) > new Date() ? 'Upcoming' : 'Past'}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 shadow-sm leading-tight" dangerouslySetInnerHTML={{ __html: lang === 'ta' ? selectedEvent.title_ta : selectedEvent.title_en }} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-8 border-b border-neutral-100 pb-6">
                                <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-lg text-neutral-700 border border-neutral-100">
                                    <Calendar className="w-4 h-4 text-red-700" />
                                    <span className="font-semibold text-red-700">
                                        {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                {selectedEvent.time && (
                                    <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-lg text-neutral-700 border border-neutral-100">
                                        <Clock className="w-4 h-4 text-red-700" />
                                        <span>{selectedEvent.time}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-lg text-neutral-700 border border-neutral-100">
                                    <MapPin className="w-4 h-4 text-red-700" />
                                    <span>{[selectedEvent.city, selectedEvent.district, selectedEvent.state, selectedEvent.country].filter(Boolean).join(', ')}</span>
                                </div>
                            </div>

                            <div className="prose prose-lg text-neutral-600 max-w-none">
                                <div
                                    className="leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: lang === 'ta' ? selectedEvent.description_ta : selectedEvent.description_en
                                    }}
                                />
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-6 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg font-medium transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
