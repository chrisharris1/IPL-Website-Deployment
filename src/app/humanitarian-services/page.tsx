'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import NotifyMeModal from '@/components/NotifyMeModal'
import { HandHeart, MapPin, Loader2, Calendar, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getServices } from '@/lib/api'
import type { HumanitarianService } from '@/types/api'

export default function HumanitarianServices() {
    const { t, lang } = useTranslation()
    const [upcomingServices, setUpcomingEvents] = useState<HumanitarianService[]>([])
    const [pastServices, setPastEvents] = useState<HumanitarianService[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<{ id: string, title: string, date: string, location: string } | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        async function loadServices() {
            try {
                const response = await getServices({ limit: 100 })
                if (response.success && response.data) {
                    const d = response.data as unknown
                    const allServices = Array.isArray(d) ? d : (d as { data?: HumanitarianService[] }).data ?? []

                    const now = new Date()
                    const upcoming = allServices.filter(s => new Date(s.date) > now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    const past = allServices.filter(s => new Date(s.date) <= now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    setUpcomingEvents(upcoming)
                    setPastEvents(past)
                }
            } catch (error) {
                console.error('Failed to load services:', error)
            } finally {
                setLoading(false)
            }
        }
        loadServices()
    }, [])

    const stripHtml = (html: string) => {
        if (!html) return ''
        const text = html.replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
        return Array.from(text).slice(0, 100).join('')
    }

    const handleNotify = (e: React.MouseEvent, service: HumanitarianService) => {
        e.preventDefault() // Prevent Link navigation
        e.stopPropagation()
        setSelectedEvent({
            id: String(service.id),
            title: lang === 'ta' ? (service.title_ta || service.title_en) : service.title_en,
            date: service.date,
            location: [service.city, service.district].filter(Boolean).join(', ')
        })
        setIsModalOpen(true)
    }

    const renderServiceCard = (service: HumanitarianService, isUpcoming: boolean) => (
        <Link
            key={service.id}
            href={`/humanitarian-services/${service.id}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full"
        >
            <div className="relative h-48 shrink-0">
                <Image
                    src={service.image_url}
                    alt={lang === 'ta' ? service.title_ta : service.title_en}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain bg-neutral-100"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

                {/* Badge */}
                <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg ${isUpcoming ? 'bg-emerald-500' : 'bg-neutral-500'}`}>
                        {isUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {isUpcoming ? t('news.upcoming_badge', 'Upcoming') : t('news.past_badge', 'Past')}
                    </span>
                </div>

            </div>

            <div className="p-6 flex flex-col grow">
                <div className="flex items-center text-lg sm:text-xl text-neutral-800 mb-3">
                    <span className="font-extrabold">
                        {new Date(service.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-red-700 transition-colors leading-tight" dangerouslySetInnerHTML={{ __html: (lang === 'ta' ? service.title_ta : service.title_en) || service.title_en }} />

                <div className="flex items-start gap-2 text-xs text-neutral-600 mb-4">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                    <span className="line-clamp-1">{[service.city, service.district, service.state, service.country].filter(Boolean).join(', ')}</span>
                </div>

                <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed mb-4 grow">
                    {stripHtml((lang === 'ta' ? service.description_ta : service.description_en) || service.description_en)}...
                </p>

                {isUpcoming && (
                    <button
                        onClick={(e) => handleNotify(e, service)}
                        className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-sm group/btn"
                    >
                        <Bell className="w-4 h-4 group-hover/btn:animate-swing" />
                        {t('humanitarian.notify_me', 'Notify Me')}
                    </button>
                )}
            </div>
        </Link>
    )

    return (
        <div className="bg-neutral-50 min-h-screen">
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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-neutral-900 mb-4 sm:mb-6 animate-slide-up">
                        {t('nav.humanitarian', 'Humanitarian Services')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto animate-slide-up px-2" style={{ animationDelay: '0.1s' }}>
                        {t('humanitarian.subtitle', 'Serving Humanity with Love and Compassion')}
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container-custom mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
                    </div>
                ) : (
                    <>
                        {/* Upcoming Activities */}
                        {upcomingServices.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-8">
                                    <Calendar className="w-5 h-5 text-red-700" />
                                    <h2 className="text-3xl font-bold text-neutral-900">
                                        {t('humanitarian.upcoming', 'Upcoming Activities')}
                                        <span className="ml-3 text-lg font-normal text-neutral-500">({upcomingServices.length})</span>
                                    </h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {upcomingServices.map(service => renderServiceCard(service, true))}
                                </div>
                            </div>
                        )}

                        {/* Past Activities */}
                        {pastServices.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <Calendar className="w-5 h-5 text-neutral-500" />
                                    <h2 className="text-3xl font-bold text-neutral-900">
                                        {t('humanitarian.past', 'Past Activities')}
                                        <span className="ml-3 text-lg font-normal text-neutral-500">({pastServices.length})</span>
                                    </h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {pastServices.map(service => renderServiceCard(service, false))}
                                </div>
                            </div>
                        )}

                        {/* No Activities */}
                        {upcomingServices.length === 0 && pastServices.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-neutral-500">{t('humanitarian.no_activities', lang === 'ta' ? 'செயல்பாடுகள் எதுவும் இல்லை.' : 'No activities found.')}</p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Notify Me Modal */}
            {selectedEvent && (
                <NotifyMeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    eventDetails={{
                        id: selectedEvent.id,
                        title: selectedEvent.title,
                        date: selectedEvent.date,
                        location: selectedEvent.location
                    }}
                />
            )}
        </div>
    )
}
